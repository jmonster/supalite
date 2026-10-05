import { test } from "bun:test";
import assert from "node:assert/strict";
import net from "node:net";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const root = fileURLToPath(new URL("../", import.meta.url));
const cli = join(root, "upstream/lite-0.11.0/dist/cli/index.js");
const key = "sb_publishable_shutdown_test";
const password = "local-shutdown-test-password";

test("CLI drains authenticated functions and response bodies, bounds stalled work, and restarts durable state", async () => {
  const directory = await mkdtemp(join(root, ".functions-runtime-shutdown-"));
  const reservation = Bun.serve({ hostname: "127.0.0.1", port: 0, fetch: () => new Response() });
  const port = reservation.port, url = `http://127.0.0.1:${port}`;
  await reservation.stop(true);
  let child, output, logs = "", socket;
  const until = async (check, message) => {
    const deadline = Date.now() + 15000;
    while (!(await check())) {
      assert.equal(child.exitCode, null, logs);
      assert.ok(Date.now() < deadline, message + "\n" + logs);
      await Bun.sleep(5);
    }
  };
  async function start(command) {
    logs = "";
    child = Bun.spawn([process.execPath, cli, "--no-telemetry", command, "--config", "supabase/config.toml", "--no-admin"], {
      cwd: directory, env: { ...process.env, HOME: directory, LITE_TELEMETRY: "0", DO_NOT_TRACK: "1", NO_COLOR: "1" },
      stdin: "ignore", stdout: "pipe", stderr: "pipe",
    });
    output = Promise.all([child.stdout, child.stderr].map(async stream => {
      for await (const bytes of stream) logs += new TextDecoder().decode(bytes);
    }));
    await until(async () => { try { return (await fetch(`${url}/_system/ping`)).ok; } catch { return false; } }, "CLI did not start");
  }
  async function exited(signaled) {
    let forced = false;
    const timer = setTimeout(() => { forced = true; child.kill("SIGKILL"); }, 12000);
    try {
      assert.equal(await child.exited, 0, logs);
      await output;
      assert.equal(child.signalCode, null, logs);
      assert.equal(forced, false, logs);
      assert.ok(performance.now() - signaled < 11000, logs);
      await assert.rejects(fetch(`${url}/_system/ping`));
    } finally { clearTimeout(timer); }
  }
  try {
    await mkdir(join(directory, "supabase/functions/probe"), { recursive: true });
    await mkdir(join(directory, "supabase/migrations"));
    await writeFile(join(directory, "supabase/config.toml"), `project_id = "shutdown-test"
[api]
port = ${port}
[db]
driver = "sqlite-postgres"
url = "./.lite/project.sqlite"
[auth]
enabled = true
jwt_secret = "shutdown-test-jwt-secret-at-least-32-characters"
publishable_key = "${key}"
secret_key = "sb_secret_shutdown_test"
[auth.email]
enable_confirmations = false
[studio]
enabled = false
[edge_runtime]
enabled = true
policy = "per_worker"
[functions.probe]
verify_jwt = true
`);
    await writeFile(join(directory, "supabase/migrations/20261004000000_shutdown.sql"), `CREATE TABLE public.shutdown_records (id text PRIMARY KEY, owner_id uuid NOT NULL);
ALTER TABLE public.shutdown_records ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT ON public.shutdown_records TO authenticated;
CREATE POLICY own_records ON public.shutdown_records FOR ALL TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
`);
    await writeFile(join(directory, "supabase/functions/probe/index.ts"), `import { createClient } from "@supabase/supabase-js";
export default { async fetch(request) {
  const mode = new URL(request.url).searchParams.get("mode");
  if (mode === "never") return new Response(new ReadableStream({ start(c) { c.enqueue(new TextEncoder().encode("started")); } }));
  console.log("SHUTDOWN_PROBE_ADMITTED");
  await Bun.sleep(600);
  const client = createClient(process.env.SUPABASE_URL, JSON.parse(process.env.SUPABASE_PUBLISHABLE_KEYS).default, {
    auth: { persistSession: false, autoRefreshToken: false }, global: { headers: { Authorization: request.headers.get("authorization") } },
  });
  const user = await client.auth.getUser();
  if (user.error) throw user.error;
  const row = { id: new URL(request.url).searchParams.get("id"), owner_id: user.data.user.id };
  const inserted = await client.from("shutdown_records").insert(row).select().single();
  if (inserted.error) throw inserted.error;
  console.log("SHUTDOWN_PROBE_CALLBACK_COMPLETE");
  const text = JSON.stringify(inserted.data);
  return new Response(new ReadableStream({ async start(c) {
    c.enqueue(new TextEncoder().encode(text.slice(0, 10)));
    await Bun.sleep(300);
    c.enqueue(new TextEncoder().encode(text.slice(10))); c.close();
  } }), { status: 201, headers: { "content-type": "application/json" } });
} };
`);
    const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    await start("dev");
    const signup = await client.auth.signUp({ email: "shutdown@example.test", password });
    assert.equal(signup.error, null, logs);
    const token = signup.data.session.access_token, id = crypto.randomUUID();
    const headers = { apikey: key, Authorization: `Bearer ${token}` };
    const response = fetch(`${url}/functions/v1/probe?id=${id}`, { headers }).then(async r => ({ status: r.status, body: await r.json() }));
    await until(() => logs.includes("SHUTDOWN_PROBE_ADMITTED"), "function not admitted");
    let signaled = performance.now();
    child.kill("SIGTERM");
    await until(async () => (await fetch(`${url}/_system/ping`)).status === 503, "readiness stayed available");
    assert.equal((await fetch(`${url}/functions/v1/probe?id=not-admitted`, { headers })).status, 503);
    child.kill("SIGINT"); child.kill("SIGTERM");
    assert.deepEqual(await response, { status: 201, body: { id, owner_id: signup.data.user.id } });
    assert.ok(logs.includes("SHUTDOWN_PROBE_CALLBACK_COMPLETE"), logs);
    await exited(signaled);

    await start("start");
    const signin = await client.auth.signInWithPassword({ email: "shutdown@example.test", password });
    assert.equal(signin.error, null, logs);
    const persisted = await client.from("shutdown_records").select().eq("id", id).single();
    assert.equal(persisted.error, null, logs);
    assert.deepEqual(persisted.data, { id, owner_id: signup.data.user.id });
    const stream = await fetch(`${url}/functions/v1/probe?mode=never`, { headers: { ...headers, Authorization: `Bearer ${signin.data.session.access_token}` } });
    const reader = stream.body.getReader();
    assert.equal(new TextDecoder().decode((await reader.read()).value), "started");
    const ended = reader.read().then(result => result.done).catch(() => true);
    signaled = performance.now(); child.kill("SIGTERM");
    await exited(signaled);
    assert.equal(await ended, true, "unending response was not closed");

    await start("start");
    socket = net.connect(port, "127.0.0.1"); socket.on("error", () => {}); socket.on("data", () => {});
    await new Promise(resolve => socket.once("connect", resolve));
    socket.write(`POST /rest/v1/shutdown_records HTTP/1.1\r\nHost: 127.0.0.1:${port}\r\napikey: ${key}\r\nAuthorization: Bearer ${signin.data.session.access_token}\r\nContent-Type: application/json\r\nContent-Length: 100000\r\n\r\n{"`);
    await Bun.sleep(100);
    signaled = performance.now(); child.kill("SIGTERM");
    await exited(signaled);
    assert.ok(logs.includes("closing remaining HTTP connections"), logs);
  } finally {
    socket?.destroy();
    if (child?.exitCode === null) { child.kill("SIGKILL"); await child.exited; }
    await output;
    await rm(directory, { recursive: true, force: true });
  }
}, 45000);

test("CLI reports unconfirmed worker close once and exits nonzero", async () => {
  const directory = await mkdtemp(join(root, ".functions-runtime-close-failure-"));
  const reservation = Bun.serve({ hostname: "127.0.0.1", port: 0, fetch: () => new Response() });
  const port = reservation.port, url = `http://127.0.0.1:${port}`;
  await reservation.stop(true);
  let child, output, logs = "";
  try {
    await mkdir(join(directory, "supabase/functions/probe"), { recursive: true });
    await writeFile(join(directory, "supabase/functions/probe/index.ts"), 'export default { fetch: () => new Response("ok") };\n');
    await writeFile(join(directory, "supabase/config.toml"), `project_id = "close-failure-test"
[api]
port = ${port}
[db]
driver = "sqlite-postgres"
url = "./.lite/project.sqlite"
[auth]
enabled = false
[studio]
enabled = false
[edge_runtime]
policy = "per_worker"
[functions.probe]
verify_jwt = false
`);
    // Inject a missing native close acknowledgement in the child only. The real
    // worker still terminates, avoiding a leaked worker or cross-test mock.
    await writeFile(join(directory, "miss-close.js"), `const NativeWorker = globalThis.Worker;
globalThis.Worker = class extends NativeWorker {
  addEventListener(type, ...args) { if (type !== "close") super.addEventListener(type, ...args); }
};\n`);
    child = Bun.spawn([process.execPath, "--preload", join(directory, "miss-close.js"), cli, "--no-telemetry", "dev", "--config", "supabase/config.toml", "--no-admin"], {
      cwd: directory, env: { ...process.env, HOME: directory, LITE_TELEMETRY: "0", DO_NOT_TRACK: "1", NO_COLOR: "1" },
      stdin: "ignore", stdout: "pipe", stderr: "pipe",
    });
    output = Promise.all([child.stdout, child.stderr].map(async stream => {
      for await (const bytes of stream) logs += new TextDecoder().decode(bytes);
    }));
    const deadline = Date.now() + 15000;
    while (true) {
      assert.equal(child.exitCode, null, logs); assert.ok(Date.now() < deadline, logs);
      try { if ((await fetch(`${url}/_system/ping`)).ok) break; } catch {}
      await Bun.sleep(10);
    }
    assert.equal(await (await fetch(`${url}/functions/v1/probe`)).text(), "ok");
    child.kill("SIGTERM"); await Bun.sleep(50); child.kill("SIGINT"); child.kill("SIGTERM");
    const timer = setTimeout(() => child.kill("SIGKILL"), 12000);
    try { assert.equal(await child.exited, 1); } finally { clearTimeout(timer); }
    await output;
    assert.equal(child.signalCode, null);
    assert.equal(logs.split("Could not stop probe").length - 1, 1, logs);
    assert.ok(logs.includes("Bun function worker did not emit close after termination"), logs);
    await assert.rejects(fetch(`${url}/_system/ping`));
  } finally {
    if (child?.exitCode === null) { child.kill("SIGKILL"); await child.exited; }
    await output;
    await rm(directory, { recursive: true, force: true });
  }
}, 20000);
