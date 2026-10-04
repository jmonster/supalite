import { afterEach, test } from "bun:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const root = fileURLToPath(new URL("../", import.meta.url));
const cli = join(root, "upstream/lite-0.11.0/dist/cli/index.js");
const originalFiles = ["app/client.mjs", "app/acceptance.mjs", "package.json", "supabase/config.toml",
  "supabase/functions/tasks/index.ts", "supabase/functions/_shared/validation.ts", "supabase/functions/tasks/deno.json", "supabase/migrations/20261004160000_tasks.sql"];
const hashes = directory => Promise.all(originalFiles.map(async path =>
  createHash("sha256").update(await readFile(join(directory, path))).digest("hex")));
let cleanup;
afterEach(async () => { await cleanup?.(); }, 10000);

async function until(check, message) {
  const deadline = Date.now() + 15000;
  while (Date.now() < deadline) {
    if (await check()) return;
    await Bun.sleep(50);
  }
  assert.fail(typeof message === "function" ? message() : message);
}

test("Bun CLI dev/start: unchanged SDK app, persistence, reload and shutdown", async () => {
  // Keeping the copy beneath the repository uses its normal installed packages.
  const directory = await mkdtemp(join(root, ".functions-runtime-"));
  let server, output, logs = "";
  async function stop() {
    if (!server) return;
    const child = server;
    server = undefined;
    if (child.exitCode === null) child.kill("SIGTERM");
    const timer = setTimeout(() => child.kill("SIGKILL"), 7000);
    try {
      assert.equal(await child.exited, 0, logs);
      await output;
      assert.equal(child.signalCode, null, logs);
    } finally { clearTimeout(timer); }
  }
  cleanup = async () => { try { await stop(); } finally { await rm(directory, { recursive: true, force: true }); } };
  await cp(join(root, "examples/functions-portable"), directory, { recursive: true });
  const before = await hashes(directory);
  const reservation = Bun.serve({ hostname: "127.0.0.1", port: 0, fetch: () => new Response() });
  const url = `http://127.0.0.1:${reservation.port}`;
  const apiPort = reservation.port;
  await reservation.stop(true);
  const key = "sb_publishable_portability_demo";
  const configPath = join(directory, "supabase/config.lite.toml");
  const config = (await readFile(configPath, "utf8")).replace("port = 54321", `port = ${apiPort}`);
  await writeFile(configPath, config);
  const environment = { ...process.env, HOME: directory, LITE_TELEMETRY: "0", DO_NOT_TRACK: "1", NO_COLOR: "1", EXPERIMENTAL_STORAGE: "1" };
  const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  async function start(command) {
    server = Bun.spawn([process.execPath, cli, "--no-telemetry", command, "--config", "supabase/config.lite.toml", "--no-admin"], {
      cwd: directory, env: environment, stdin: "ignore", stdout: "pipe", stderr: "pipe",
    });
    output = Promise.all([server.stdout, server.stderr].map(async stream => {
      const decoder = new TextDecoder();
      for await (const bytes of stream) logs += decoder.decode(bytes, { stream: true });
      logs += decoder.decode();
    }));
    await until(async () => {
      assert.equal(server.exitCode, null, logs);
      try { return (await fetch(`${url}/_system/ping`)).ok; } catch { return false; }
    }, () => `CLI did not start\n${logs}`);
  }
  await start("dev");
  const id = crypto.randomUUID();
  const acceptance = Bun.spawn([process.execPath, "app/acceptance.mjs"], {
    cwd: directory, env: { ...environment, SUPABASE_URL: url, SUPABASE_PUBLISHABLE_KEY: key, TEST_TASK_ID: id },
    stdin: "ignore", stdout: "pipe", stderr: "pipe",
  });
  const [code, result, errors] = await Promise.all([
    acceptance.exited, new Response(acceptance.stdout).text(), new Response(acceptance.stderr).text(),
  ]);
  assert.equal(code, 0, result + errors + logs);
  assert.equal(JSON.parse(result).passed, true);
  assert.equal(JSON.parse(result).checks.length, 16);
  const authenticated = await client.auth.signInWithPassword({ email: JSON.parse(result).state.ownerEmail, password: "Local-fixture-only-password-44!" });
  assert.equal(authenticated.error, null);
  assert.deepEqual(await hashes(directory), before, "application/function project bytes must remain unchanged");

  const functions = join(directory, "supabase/functions");
  await mkdir(join(functions, "_shared"), { recursive: true });
  const shared = join(functions, "_shared/revision.ts");
  await writeFile(shared, 'export const revision = "first";\n');
  await mkdir(join(functions, "watch_probe"));
  await writeFile(join(functions, "watch_probe/index.ts"), `import { revision } from "../_shared/revision.ts";
export default { fetch: () => Response.json({ revision, color: process.env.COLOR, url: process.env.SUPABASE_URL }) };\n`);
  await until(async () => (await client.functions.invoke("watch_probe")).data?.revision === "first", "new function was not discovered");
  await writeFile(shared, 'export const revision = "second";\n');
  await writeFile(join(functions, ".env"), "COLOR=blue\nSUPABASE_URL=https://production.invalid\n");
  await until(async () => {
    const { data } = await client.functions.invoke("watch_probe");
    return data?.revision === "second" && data.color === "blue" && data.url === url;
  }, "shared/env changes did not reload or reserved local URL was overridden");
  const disabled = config + "\n[functions.watch_probe]\nenabled = false\n";
  await writeFile(configPath, disabled);
  await until(async () => (await client.functions.invoke("watch_probe")).response?.status === 404, "function config did not reload");

  const custom = join(directory, "supabase/custom");
  await mkdir(custom);
  const handler = join(custom, "handler.ts");
  await writeFile(handler, 'export default { fetch: () => new Response("custom entrypoint") };\n');
  await writeFile(configPath, disabled + '\n[functions.custom]\nentrypoint = "./custom/handler.ts"\n');
  await until(async () => (await client.functions.invoke("custom")).data === "custom entrypoint", "custom entrypoint failed");
  await writeFile(handler, 'export default { fetch: () => new Response("changed entrypoint") };\n');
  await until(async () => (await client.functions.invoke("custom")).data === "changed entrypoint", "custom entrypoint did not reload");
  const reloadCount = () => logs.split("[functions] Reloaded function project").length - 1;
  const beforeRemoval = reloadCount();
  await writeFile(configPath, disabled);
  await until(async () => reloadCount() > beforeRemoval && (await client.functions.invoke("custom")).response?.status === 404,
    "removed custom function did not refresh");
  const afterRemoval = reloadCount();
  await rm(handler);
  await writeFile(handler, "// obsolete custom entrypoint\n");
  await Bun.sleep(250);
  assert.equal(reloadCount(), afterRemoval, "obsolete function paths remained watched");
  assert.ok(!logs.includes(`Migration added: ${handler}`), "function event fell through to migration processing");

  await writeFile(configPath, disabled.replace('policy = "oneshot"', 'policy = "per_worker"'));
  await mkdir(join(functions, "stream_probe"));
  await writeFile(join(functions, "stream_probe/index.ts"), `export default { fetch(request) {
    if (request.method === "HEAD") return new Response();
    let timer, cleanup;
    return new Response(new ReadableStream({
      start(controller) {
        const abort = () => { cleanup("abort"); controller.error(request.signal.reason); };
        cleanup = reason => {
          clearTimeout(timer);
          request.signal.removeEventListener("abort", abort);
          if (reason !== "complete") console.log("stream-probe-cancelled:" + request.headers.get("x-run"));
        };
        request.signal.addEventListener("abort", abort, { once: true });
        controller.enqueue(new TextEncoder().encode("data: " + Date.now() + "\\n\\n"));
        timer = setTimeout(() => { cleanup("complete"); controller.close(); }, 5000);
      },
      cancel() { cleanup("cancel"); },
    }), { headers: { "content-type": "text/event-stream" } });
  } };\n`);
  await until(async () => (await client.functions.invoke("stream_probe", { method: "HEAD" })).response?.status === 200,
    "streaming function was not discovered");
  const run = crypto.randomUUID();
  const stream = await client.functions.invoke("stream_probe", { headers: { "x-run": run } });
  assert.equal(stream.error, null, logs);
  const reader = stream.data.body.getReader();
  const producedAt = Number(new TextDecoder().decode((await reader.read()).value).match(/data: (\d+)/)?.[1]);
  assert.ok(Date.now() - producedAt < 2000, "first SSE chunk was buffered until producer completion");
  await reader.cancel();
  assert.equal((await reader.read()).done, true);
  await until(() => logs.includes(`stream-probe-cancelled:${run}`), "stream cancellation did not reach the function");
  assert.equal((await fetch(`${url}/_system/ping`)).status, 200);

  await stop();
  await writeFile(configPath, disabled); // Verify the persisted application with start's oneshot policy.
  await start("start");
  const persisted = await client.functions.invoke(`tasks/${id}`, { method: "GET" });
  assert.equal(persisted.error, null, logs);
  assert.equal(persisted.data.completed, 1);
  const verification = Bun.spawn([process.execPath, "app/acceptance.mjs"], {
    cwd: directory, env: { ...environment, SUPABASE_URL: url, SUPABASE_PUBLISHABLE_KEY: key, DEMO_PHASE: "verify" },
    stdin: "ignore", stdout: "pipe", stderr: "pipe",
  });
  const [verifyCode, verifyResult, verifyErrors] = await Promise.all([
    verification.exited, new Response(verification.stdout).text(), new Response(verification.stderr).text(),
  ]);
  assert.equal(verifyCode, 0, verifyResult + verifyErrors + logs);
  assert.equal(JSON.parse(verifyResult).phase, "verify");
  assert.equal(JSON.parse(verifyResult).checks.length, 13);
  assert.deepEqual(await hashes(directory), before);
  await stop();
  await assert.rejects(fetch(`${url}/_system/ping`));
}, 120000);
