import { test, afterEach } from "bun:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { prepareFunctions } from "../upstream/lite-0.11.0/dist/functions/runner.js";

const cleanups = [];
afterEach(async () => { for (const cleanup of cleanups.splice(0)) await cleanup(); });
const source = `
const instance = crypto.randomUUID();
let calls = 0;
export default { async fetch(request) {
  const call = ++calls, path = new URL(request.url).pathname;
  if (path.endsWith('/stream')) return new Response(new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(instance));
    },
  }));
  if (path.endsWith('/slow')) await new Promise(resolve => setTimeout(resolve, 150));
  if (path.endsWith('/stall')) return new Promise(resolve => {
    const finish = () => resolve(new Response('aborted'));
    if (request.signal.aborted) finish();
    else request.signal.addEventListener('abort', finish, { once: true });
  });
  if (path.endsWith('/crash')) setTimeout(() => { throw new Error('execution-test crash'); }, 20);
  if (path.endsWith('/loop')) while (true) {}
  return Response.json({ instance, call });
} };
`;

async function fixture({ content = source, ...options } = {}) {
  const root = await mkdtemp(join(process.cwd(), ".functions-execution-"));
  const configPath = join(root, "supabase/config.toml");
  const entrypoint = join(root, "supabase/functions/echo/index.ts");
  let runner;
  cleanups.push(async () => {
    try { await runner?.close(); }
    finally { await rm(root, { recursive: true, force: true }); }
  });
  await mkdir(dirname(entrypoint), { recursive: true });
  await writeFile(configPath, "# Native execution fixture\n");
  await writeFile(entrypoint, content);
  runner = await prepareFunctions({ config: { edge_runtime: { policy: "per_worker" } }, drivers: {} }, {
    configPath, port: 54321, startupTimeoutMs: 30000, shutdownTimeoutMs: 250,
    requestTimeoutMs: 30000, idleTimeoutMs: 5000, maxWorkers: 1, maxInFlight: 2,
    ...options,
  });
  const invoke = (path = "", init) => runner.fetch(new Request(`http://gateway.test/functions/v1/echo${path}`, init));
  return { runner, invoke };
}

async function eventually(check, message) {
  const until = Date.now() + 3000;
  do {
    if (await check()) return;
    await delay(10);
  } while (Date.now() < until);
  assert.fail(message);
}

async function nextInstance(invoke) {
  let result;
  await eventually(async () => {
    const response = await invoke();
    const body = await response.json();
    if (response.status === 503) {
      assert.equal(body.code, "BUSY");
      return false;
    }
    assert.equal(response.status, 200);
    result = body;
    return true;
  }, "the retired worker did not release capacity");
  return result;
}

test("worker capacity remains leased until response bodies finish", async () => {
  const { invoke } = await fixture();
  const first = await invoke();
  const second = await invoke();
  const busy = await invoke();
  assert.equal(busy.status, 503);
  assert.equal((await busy.json()).code, "BUSY");
  const firstBody = await first.json();
  const admitted = await invoke();
  assert.equal(admitted.status, 200);
  assert.equal((await admitted.json()).instance, firstBody.instance);
  assert.equal((await second.json()).instance, firstBody.instance);
});

test("HEAD suppresses and cancels a handler stream", async () => {
  const { invoke } = await fixture({ content: `let cancelled = false;
    export default { fetch: request => request.method === 'HEAD'
      ? new Response(new ReadableStream({ cancel() { cancelled = true; } }), { headers: { 'x-head': 'kept' } })
      : Response.json({ cancelled }) };` });
  const response = await invoke("", { method: "HEAD" });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("x-head"), "kept");
  assert.equal(response.body, null);
  await eventually(async () => (await (await invoke()).json()).cancelled, "HEAD left its response producer alive");
});

test("stream cancellation resolves, preserves a peer and drains its worker", async () => {
  const { invoke } = await fixture();
  const response = await invoke("/stream");
  const reader = response.body.getReader();
  const instance = new TextDecoder().decode((await reader.read()).value);
  const peer = invoke("/slow");
  await assert.doesNotReject(reader.cancel(new Error("client stopped reading")));
  assert.equal((await reader.read()).done, true);
  const draining = await invoke();
  assert.equal(draining.status, 503);
  assert.equal((await draining.json()).code, "BUSY");
  const peerResponse = await peer;
  assert.equal(peerResponse.status, 200);
  assert.equal((await peerResponse.json()).instance, instance);
  const replacement = await nextInstance(invoke);
  assert.notEqual(replacement.instance, instance);
  assert.equal(replacement.call, 1);
});

test("request deadline returns 504 and retires the timed-out worker", async () => {
  const { invoke } = await fixture({ requestTimeoutMs: 350 });
  const initial = await (await invoke()).json();
  const timeout = await invoke("/stall");
  assert.equal(timeout.status, 504);
  assert.equal((await timeout.json()).code, "TIMEOUT");
  assert.notEqual((await nextInstance(invoke)).instance, initial.instance);
});

test("deadline also ends a streamed body and releases its worker", async () => {
  const { invoke } = await fixture({ requestTimeoutMs: 350 });
  const response = await invoke("/stream");
  assert.equal(response.status, 200);
  const reader = response.body.getReader();
  const instance = new TextDecoder().decode((await reader.read()).value);
  await assert.rejects(reader.read(), /Function request timed out/);
  assert.notEqual((await nextInstance(invoke)).instance, instance);
});

test("boot failure reports diagnostics and cancels the unread upload", async () => {
  const { invoke } = await fixture({ content: 'export default { fetch: => new Response("broken") };' });
  const original = console.error;
  const diagnostics = [];
  console.error = (...args) => diagnostics.push(args.join(" "));
  let cancelled = false;
  try {
    const body = new ReadableStream({ cancel() { cancelled = true; } });
    const response = await invoke("", { method: "POST", body, duplex: "half" });
    assert.equal(response.status, 503);
    assert.equal((await response.json()).code, "BOOT_ERROR");
    assert.equal(cancelled, true);
    assert.match(diagnostics.join("\n"), /SyntaxError|Expected|Unexpected/);
  } finally { console.error = original; }
});

test("startup deadline is a 503 boot error", async () => {
  const { invoke } = await fixture({
    content: "await new Promise(() => {});", startupTimeoutMs: 350,
  });
  const response = await invoke();
  assert.equal(response.status, 503);
  assert.equal((await response.json()).code, "BOOT_ERROR");
});

test("idle worker crash recovers on the very next request", async () => {
  const { invoke } = await fixture();
  const original = console.error;
  let crashed = false;
  console.error = (...args) => {
    if (args.join(" ").includes("Worker failed:")) crashed = true;
    else original(...args);
  };
  try {
    const initial = await (await invoke("/crash")).json();
    await eventually(() => crashed, "the intentional worker crash was not observed");
    const response = await invoke();
    assert.equal(response.status, 200, "a dead idle worker must not consume the next request");
    assert.notEqual((await response.json()).instance, initial.instance);
  } finally { console.error = original; }
});

test("closing during startup settles the pending request", async () => {
  const { runner, invoke } = await fixture({
    content: "await new Promise(() => {});",
  });
  const pending = invoke();
  await delay(30);
  const started = performance.now();
  await runner.close();
  assert.ok(performance.now() - started < 1500, "close waited for the startup deadline");
  const response = await pending;
  assert.equal(response.status, 503);
  assert.equal((await response.json()).code, "BOOT_ERROR");
  const closed = await invoke();
  assert.equal(closed.status, 503);
  assert.equal((await closed.json()).code, "UNAVAILABLE");
});

test("a synchronous infinite handler is terminated and capacity recovers", async () => {
  const { invoke } = await fixture({ requestTimeoutMs: 150, shutdownTimeoutMs: 50 });
  const initial = await (await invoke()).json();
  assert.equal((await invoke("/loop")).status, 504);
  assert.notEqual((await nextInstance(invoke)).instance, initial.instance);
  const usage = process.cpuUsage();
  await delay(200);
  const after = process.cpuUsage(usage);
  assert.ok(after.user + after.system < 150000, "the retired worker is still consuming a CPU core");
});

test("reload rejects new requests without accumulating a waiting queue", async () => {
  const { runner, invoke } = await fixture({ content: `export default { fetch() {
    setTimeout(() => { while (true) {} }, 10);
    return new Response('ready');
  } };`, shutdownTimeoutMs: 300, requestTimeoutMs: 60 });
  assert.equal(await (await invoke()).text(), "ready");
  await delay(30);
  let reloaded = false;
  const pendingReload = runner.reload().then(() => { reloaded = true; });
  const responses = await Promise.all(Array.from({ length: 10 }, () => invoke()));
  assert.equal(reloaded, false, "requests waited for reload instead of rejecting promptly");
  for (const response of responses) {
    assert.equal(response.status, 503);
    assert.equal((await response.json()).code, "BUSY");
  }
  await pendingReload;
});
