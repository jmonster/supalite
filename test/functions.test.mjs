import { test, afterEach, spyOn, mock } from "bun:test";
import assert from "node:assert/strict";
import { SignJWT } from "jose";
import { createClient, FunctionsHttpError, FunctionsRelayError, FunctionRegion } from "@supabase/supabase-js";
import { App } from "../upstream/lite-0.11.0/dist/index.js";
import { createConnection } from "../upstream/lite-0.11.0/dist/db/bun/index.js";
import { createLibsqlConnection } from "../upstream/lite-0.11.0/dist/db/libsql/index.js";

const secret = "functions-test-secret-at-least-32-characters";
const publishable = "sb_publishable_functions_test";
const serviceKey = "sb_secret_functions_test";
const deferred = () => Promise.withResolvers();
const connections = [];
afterEach(async () => { mock.restore(); for (const connection of connections.splice(0)) await connection.close(); });

async function harness(fetch, { functions = { echo: { verify_jwt: false } }, auth = {}, server = {}, factory = createConnection, defaults } = {}) {
  const connection = await factory({ url: ":memory:" });
  connections.push(connection);
  const app = new App({
    connection, functions,
    auth: { enabled: false, jwt_secret: secret, publishable_key: publishable, secret_key: serviceKey, ...auth },
    options: {
      ...(defaults === undefined ? {} : { defaults }),
      drivers: fetch ? { functions: { fetch } } : {},
      server: { admin: false, disableStudio: true, ...server },
    },
  });
  const client = createClient("http://localhost", publishable, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (url, options) => app.fetch(new Request(url, options)) },
  });
  return { app, client };
}

async function jwt(claims, signingSecret = secret) {
  return new SignJWT(claims).setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("5m").sign(new TextEncoder().encode(signingSecret));
}

test("Functions SDK preserves JSON, methods, nested URL, region and custom headers", async () => {
  const { client } = await harness(async (request, context) => Response.json({
    context, method: request.method, url: request.url,
    custom: request.headers.get("x-example"), region: request.headers.get("x-region"),
    contentType: request.headers.get("content-type"),
    body: request.body ? await request.json() : null,
  }, { status: 201, statusText: "Created by executor", headers: { "x-response": "preserved" } }));
  for (const method of ["POST", "PUT", "PATCH", "DELETE", "GET", "OPTIONS"]) {
    const result = await client.functions.invoke("echo/nested/path?check=one%20two", {
      method, headers: { "x-example": "custom" }, region: FunctionRegion.UsEast1,
      ...(method === "GET" ? {} : { body: { answer: 42 } }),
    });
    assert.equal(result.error, null);
    assert.equal(result.response.status, 201);
    assert.equal(result.response.statusText, "Created by executor");
    assert.equal(result.response.headers.get("x-response"), "preserved");
    assert.equal(result.data.method, method);
    assert.equal(result.data.custom, "custom");
    assert.equal(result.data.region, "us-east-1");
    const url = new URL(result.data.url);
    assert.equal(url.pathname, "/functions/v1/echo/nested/path");
    assert.equal(url.searchParams.get("check"), "one two");
    assert.equal(url.searchParams.get("forceFunctionRegion"), "us-east-1");
    assert.deepEqual(result.data.context, { name: "echo", jwt: null, apiKeyType: null });
    assert.deepEqual(result.data.body, method === "GET" ? null : { answer: 42 });
  }
});

test("Functions SDK round trips text, binary, Blob and multipart bodies", async () => {
  const { client } = await harness((request) => new Response(request.body, {
    headers: { "content-type": request.headers.get("content-type") },
  }));
  const text = await client.functions.invoke("echo", { body: "plain text ☀" });
  assert.equal(text.error, null);
  assert.equal(text.data, "plain text ☀");
  for (const body of [new Uint8Array([0, 255, 42]).buffer, new Blob([new Uint8Array([0, 255, 42])])]) {
    const result = await client.functions.invoke("echo", { body });
    assert.equal(result.error, null);
    assert.ok(result.data instanceof Blob);
    assert.deepEqual(new Uint8Array(await result.data.arrayBuffer()), new Uint8Array([0, 255, 42]));
  }
  const form = new FormData();
  form.append("label", "one");
  form.append("label", "two");
  form.append("file", new Blob([new Uint8Array([0, 255, 42])]), "sample.bin");
  const multipart = await client.functions.invoke("echo", { body: form });
  assert.equal(multipart.error, null);
  assert.deepEqual(multipart.data.getAll("label"), ["one", "two"]);
  assert.equal(multipart.data.get("file").name, "sample.bin");
  assert.deepEqual(new Uint8Array(await multipart.data.get("file").arrayBuffer()), new Uint8Array([0, 255, 42]));
  const custom = await client.functions.invoke("echo", { body: "<xml />", headers: { "Content-Type": "application/xml" } });
  assert.equal(custom.error, null);
  assert.equal(custom.data, "<xml />");
});

test("Functions preserves executor error responses and SDK error classification", async () => {
  const { client } = await harness((request) => request.headers.has("x-relay")
    ? new Response("upstream unavailable", { status: 503, headers: { "x-relay-error": "true" } })
    : Response.json({ reason: "validation" }, { status: 422, headers: { "x-error-detail": "kept" } }));
  const result = await client.functions.invoke("echo");
  assert.ok(result.error instanceof FunctionsHttpError);
  assert.equal(result.error.context.status, 422);
  assert.equal(result.error.context.headers.get("x-error-detail"), "kept");
  assert.deepEqual(await result.error.context.json(), { reason: "validation" });
  const relay = await client.functions.invoke("echo", { headers: { "x-relay": "yes" } });
  assert.ok(relay.error instanceof FunctionsRelayError);
  assert.equal(await relay.error.context.text(), "upstream unavailable");
});

test("Functions preserves response headers, HEAD, empty responses, and handler failures", async () => {
  let headCancelled = false;
  const { app, client } = await harness((request) => {
    const path = new URL(request.url).pathname;
    if (path.endsWith("/throw")) throw new Error("private executor failure");
    if (path.endsWith("/invalid")) return "not a Response";
    const body = request.method === "HEAD"
      ? new ReadableStream({ cancel() { headCancelled = true; } }, { highWaterMark: 0 })
      : path.endsWith("/empty") ? null : "body";
    return new Response(body, {
      status: path.endsWith("/empty") ? 204 : 200,
      headers: { "access-control-allow-origin": "https://allowed.test", "x-function-header": "kept", "set-cookie": "session=example; HttpOnly" },
    });
  });
  const head = await app.fetch(new Request("http://localhost/functions/v1/echo", { method: "HEAD" }));
  assert.equal(await head.text(), "");
  assert.equal(headCancelled, true, "discarded HEAD stream must release its resources");
  assert.equal(head.headers.get("x-function-header"), "kept");
  assert.equal(head.headers.get("access-control-allow-origin"), "https://allowed.test");
  assert.equal(head.headers.get("set-cookie"), "session=example; HttpOnly");
  const empty = await client.functions.invoke("echo/empty");
  assert.equal(empty.error, null);
  assert.equal(empty.response.status, 204);
  assert.equal(empty.data, "");
  const logs = [];
  spyOn(console, "error").mockImplementation((...args) => logs.push(args));
  for (const path of ["throw", "invalid"]) {
    const result = await client.functions.invoke(`echo/${path}`);
    assert.ok(result.error instanceof FunctionsHttpError);
    assert.equal(result.response.status, 500);
    assert.equal(await result.error.context.text(), "Internal Server Error");
  }
  assert.equal(logs.length, 2, "executor failures remain visible to the host");
});

test("Functions only serves configured enabled names with an executor", async () => {
  let calls = 0;
  const { app, client } = await harness(() => { calls++; return new Response("ok"); }, {
    functions: { echo: { verify_jwt: false }, disabled: { enabled: false, verify_jwt: false } },
  });
  for (const name of ["missing", "disabled", "constructor", "toString"]) {
    const result = await client.functions.invoke(name);
    assert.ok(result.error instanceof FunctionsHttpError);
    assert.equal(result.response.status, 404);
  }
  assert.equal((await app.fetch(new Request("http://localhost/functions/v1"))).status, 404);
  assert.equal(calls, 0);
  const noExecutor = await harness(undefined);
  assert.equal((await noExecutor.client.functions.invoke("echo")).response.status, 404);
});

test("Functions defaults verify JWT and supports anon/service/user claims without user lookup", async () => {
  let calls = 0;
  const { app } = await harness((_, context) => { calls++; return Response.json(context); }, {
    functions: { echo: {} }, server: { admin: true },
  });
  const invoke = (headers) => app.fetch(new Request("http://localhost/functions/v1/echo", { headers }));
  for (const claims of [{ role: "anon" }, { role: "service_role" }, { role: "authenticated", sub: "a-user", session_id: "a-session" }]) {
    const token = await jwt(claims);
    const result = await invoke({ Authorization: `Bearer ${token}` });
    assert.equal(result.status, 200);
    const data = await result.json();
    assert.equal(data.jwt.role, claims.role);
    assert.equal(data.jwt.sub, claims.sub);
    assert.equal(data.apiKeyType, null);
  }
  for (const Authorization of [undefined, "Basic anything", "Bearer invalid", `Bearer ${await jwt({ role: "anon" }, "wrong-secret")}`, `Bearer ${await new SignJWT({ role: "anon" }).setProtectedHeader({ alg: "HS256" }).setExpirationTime(1).sign(new TextEncoder().encode(secret))}`]) {
    const result = await invoke(Authorization ? { Authorization, apikey: publishable } : {});
    assert.equal(result.status, 401);
  }
  assert.equal(calls, 3, "invalid bearer cannot fall back to a valid apikey or local admin");
  const noDefaults = await harness(() => new Response("no"), { defaults: false, functions: { echo: {} } });
  assert.equal((await noDefaults.app.fetch(new Request("http://localhost/functions/v1/echo"))).status, 401);
});

test("Functions accepts recognized opaque keys without fabricating user claims", async () => {
  const { app, client } = await harness((_, context) => Response.json(context), { functions: { echo: {} } });
  assert.deepEqual((await client.functions.invoke("echo")).data, { name: "echo", jwt: null, apiKeyType: "publishable" });
  for (const [key, apiKeyType] of [[publishable, "publishable"], [serviceKey, "secret"]]) {
    for (const headers of [{ apikey: key }, { Authorization: `Bearer ${key}` }]) {
      const response = await app.fetch(new Request("http://localhost/functions/v1/echo", { headers }));
      assert.equal(response.status, 200);
      assert.deepEqual(await response.json(), { name: "echo", jwt: null, apiKeyType });
    }
  }
  for (const headers of [{ apikey: "sb_publishable_unknown" }, { Authorization: "Bearer sb_secret_unknown" }, { Authorization: "", apikey: publishable }, { apikey: serviceKey, "User-Agent": "Mozilla/5.0" }]) {
    assert.equal((await app.fetch(new Request("http://localhost/functions/v1/echo", { headers }))).status, 401);
  }
  const custom = await harness((_, context) => Response.json(context), {
    functions: { echo: {} }, server: { apiKeys: { resolver: async (key, context) => {
      assert.equal(context.req.path, "/functions/v1/echo");
      return key === "custom-key" ? { type: "publishable", claims: { role: "anon" } } : null;
    } } },
  });
  const response = await custom.app.fetch(new Request("http://localhost/functions/v1/echo", { headers: { Authorization: "Bearer custom-key" } }));
  assert.deepEqual(await response.json(), { name: "echo", jwt: null, apiKeyType: "publishable" });
  const disabledKeys = await harness(() => new Response("no"), { functions: { echo: {} }, server: { apiKeys: false } });
  assert.equal((await disabledKeys.client.functions.invoke("echo")).response.status, 401);
});

test("Signed-in Supabase SDK invokes Functions with the issued user JWT", async () => {
  const { app, client } = await harness((_, context) => Response.json(context), {
    functions: { echo: {} }, auth: { enabled: true, email: { enable_confirmations: false } },
  });
  await app.ensureSystemSchema();
  const signup = await client.auth.signUp({ email: "functions@example.test", password: "functions-test-password" });
  assert.equal(signup.error, null);
  const result = await client.functions.invoke("echo");
  assert.equal(result.error, null);
  assert.equal(result.data.jwt.sub, signup.data.user.id);
  assert.equal(result.data.jwt.role, "authenticated");
  assert.equal(result.data.apiKeyType, null);
});

test("Functions keyless webhooks and browser preflight do not relax other routes", async () => {
  let calls = 0;
  const { app } = await harness((request, context) => {
    calls++;
    if (request.method === "OPTIONS") return new Response("handler preflight", {
      status: 202, headers: {
        "access-control-allow-origin": "https://example.test",
        "access-control-allow-headers": "authorization,x-webhook-signature",
        "access-control-allow-methods": "POST",
      },
    });
    return Response.json(context);
  }, { functions: { echo: { verify_jwt: false }, protected: {} } });
  const response = await app.fetch(new Request("http://localhost/functions/v1/echo", { headers: { Authorization: "third-party signature" } }));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { name: "echo", jwt: null, apiKeyType: null });
  const preflight = await app.fetch(new Request("http://localhost/functions/v1/protected", {
    method: "OPTIONS", headers: { origin: "https://example.test", "access-control-request-method": "POST", "access-control-request-headers": "authorization,x-webhook-signature" },
  }));
  assert.equal(preflight.status, 202, "preflight reaches the handler without gateway credentials");
  assert.equal(await preflight.text(), "handler preflight");
  assert.equal(preflight.headers.get("access-control-allow-origin"), "https://example.test");
  assert.match(preflight.headers.get("access-control-allow-headers"), /x-webhook-signature/);
  assert.equal(calls, 2);
  for (const path of ["/rest/v1/items", "/auth/v1/settings"]) {
    assert.equal((await app.fetch(new Request(`http://localhost${path}`))).status, 401);
  }
});

test("Functions SSE arrives incrementally with bounded pull and cancellation propagation", async () => {
  const encoder = new TextEncoder();
  const release = deferred();
  const cancelled = deferred();
  let pulls = 0;
  let finalProduced = false;
  const { client } = await harness(() => new Response(new ReadableStream({
    async pull(controller) {
      pulls++;
      if (pulls === 1) controller.enqueue(encoder.encode("data: first\n\n"));
      else {
        await release.promise;
        finalProduced = true;
        controller.enqueue(encoder.encode("data: final\n\n"));
        controller.close();
      }
    }, cancel: (reason) => cancelled.resolve(reason),
  }, { highWaterMark: 0 }), { headers: { "content-type": "text/event-stream" } }));
  const result = await client.functions.invoke("echo");
  assert.equal(result.error, null);
  assert.ok(result.data instanceof Response);
  assert.equal(pulls, 0, "route must not eagerly drain the producer");
  const reader = result.data.body.getReader();
  assert.equal(new TextDecoder().decode((await reader.read()).value), "data: first\n\n");
  assert.equal(finalProduced, false, "first chunk must arrive before final production");
  assert.equal(pulls, 1, "no read-ahead when the consumer pauses");
  release.resolve();
  assert.equal(new TextDecoder().decode((await reader.read()).value), "data: final\n\n");
  assert.equal((await reader.read()).done, true);
  const second = await client.functions.invoke("echo");
  await second.data.body.cancel("consumer stopped");
  assert.equal(await cancelled.promise, "consumer stopped");
});

test("Functions preserves original Request, streaming upload and abort signal", async () => {
  const arrived = deferred();
  const release = deferred();
  const aborted = deferred();
  const controller = new AbortController();
  let observed;
  let pulls = 0;
  const { app } = await harness(async (request) => {
    observed = request;
    request.signal.addEventListener("abort", () => aborted.resolve(request.signal.reason), { once: true });
    const reader = request.body.getReader();
    const first = await reader.read();
    arrived.resolve(first.value);
    await release.promise;
    await reader.cancel("handler done");
    return new Response("done");
  });
  const request = new Request("http://localhost/functions/v1/echo", {
    method: "POST", duplex: "half", signal: controller.signal,
    body: new ReadableStream({ pull(c) { pulls++; c.enqueue(new Uint8Array([42])); } }, { highWaterMark: 0 }),
  });
  const pending = app.fetch(request);
  assert.deepEqual(await arrived.promise, new Uint8Array([42]));
  assert.equal(observed, request);
  assert.equal(pulls, 1);
  controller.abort("caller stopped");
  assert.equal(await aborted.promise, "caller stopped");
  release.resolve();
  assert.equal(await (await pending).text(), "done");
});

test("SDK abort signal reaches the streaming executor and permits producer cleanup", async () => {
  const controller = new AbortController();
  const cleaned = deferred();
  let requestSignal;
  const { client } = await harness((request) => {
    requestSignal = request.signal;
    let onAbort;
    const cleanup = () => {
      request.signal.removeEventListener("abort", onAbort);
      cleaned.resolve();
    };
    return new Response(new ReadableStream({
      start(stream) {
        onAbort = () => { cleanup(); stream.error(request.signal.reason); };
        request.signal.addEventListener("abort", onAbort, { once: true });
      },
      cancel: cleanup,
    }, { highWaterMark: 0 }), { headers: { "content-type": "text/event-stream" } });
  });
  const result = await client.functions.invoke("echo", { signal: controller.signal });
  assert.equal(result.error, null);
  const pending = result.data.body.getReader().read();
  controller.abort(new Error("caller abort"));
  await assert.rejects(pending, /caller abort/);
  await cleaned.promise;
  assert.equal(requestSignal.aborted, true);
});

test("Functions Fetch executor also works with libSQL SQLite", async () => {
  const { client } = await harness(() => Response.json({ backend: "libsql" }), { factory: createLibsqlConnection });
  assert.deepEqual((await client.functions.invoke("echo")).data, { backend: "libsql" });
});
