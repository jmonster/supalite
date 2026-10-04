import { test, afterEach } from "bun:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { prepareFunctions } from "../upstream/lite-0.11.0/dist/functions/runner.js";

const cleanups = [];
afterEach(async () => { for (const cleanup of cleanups.splice(0)) await cleanup(); });
async function fixture(files = {}, config = {}) {
  const project = await mkdtemp(join(process.cwd(), ".functions-runner-"));
  const directory = join(project, "supabase"), configPath = join(directory, "config.toml");
  await mkdir(directory);
  await writeFile(configPath, "# test configuration\n");
  for (const [file, source] of Object.entries(files)) {
    await mkdir(dirname(join(directory, file)), { recursive: true });
    await writeFile(join(directory, file), source);
  }
  const app = { config: { api: { port: 54321 }, auth: { enabled: false }, ...config }, drivers: {} };
  let runner;
  cleanups.push(async () => { await runner?.close(); await rm(project, { recursive: true, force: true }); });
  return { app, project, directory, configPath, async prepare(options = {}) {
    return runner = await prepareFunctions(app, { configPath, ...options });
  } };
}

test("empty and disabled projects stay dormant and can enable functions on reload", async () => {
  const empty = await fixture();
  const dormant = await empty.prepare({ port: 0 });
  assert.equal(empty.app.drivers.functions, undefined);
  await dormant.close();
  const runner = await empty.prepare();
  await mkdir(join(empty.directory, "functions/new"), { recursive: true });
  await writeFile(join(empty.directory, "functions/new/index.ts"), "export default { fetch: () => new Response('new') };");
  await runner.reload();
  assert.equal(await (await runner.fetch(new Request("http://local/functions/v1/new"))).text(), "new");
  const disabled = await fixture({ "functions/echo/index.ts": "export default { fetch: () => new Response('enabled') };" }, { edge_runtime: { enabled: false } });
  const dormantDisabled = await disabled.prepare();
  assert.equal(disabled.app.drivers.functions, undefined);
  await dormantDisabled.reload({ edge_runtime: { enabled: true } });
  assert.equal(await (await dormantDisabled.fetch(new Request("http://local/functions/v1/echo"))).text(), "enabled");
});

test("explicit host executor remains an override", async () => {
  const value = await fixture({}, { functions: { absent: { entrypoint: "missing.ts" } } });
  const executor = { fetch: () => new Response("custom") };
  value.app.drivers.functions = executor;
  assert.equal(await value.prepare(), undefined);
  assert.equal(value.app.drivers.functions, executor);
});

test("missing configured entrypoints fail before a server starts", async () => {
  const value = await fixture({}, { functions: { absent: {} } });
  await assert.rejects(value.prepare(), /entrypoint not found/);
});

test("explicit import_map fails rather than silently resolving a different dependency", async () => {
  const value = await fixture({ "functions/echo/index.ts": "export default { fetch: () => new Response('hello') };" }, { functions: { echo: { import_map: "./imports.json" } } });
  await assert.rejects(value.prepare(), /Bun does not apply import_map/);
});

test("Bun discovers conventional functions and ignores shared/disabled entries", async () => {
  const value = await fixture({
    "functions/echo/index.ts": "export default { fetch: () => new Response('hello') };",
    "functions/_shared/index.ts": "throw new Error('not a function');",
    "functions/disabled/index.ts": "throw new Error('disabled');",
  }, { functions: { disabled: { enabled: false } }, edge_runtime: { policy: "per_worker" } });
  const runner = await value.prepare();
  assert.deepEqual(Object.keys(value.app.config.functions).sort(), ["disabled", "echo"]);
  const response = await runner.fetch(new Request("http://localhost/functions/v1/echo"), { name: "echo" });
  assert.equal(await response.text(), "hello");
  assert.equal((await runner.fetch(new Request("http://localhost/functions/v1/disabled"), { name: "disabled" })).status, 404);
  assert.ok(runner.watchPaths.some(path => path.endsWith("/functions")));
  await runner.close();
  assert.equal((await runner.fetch(new Request("http://localhost/functions/v1/echo"), { name: "echo" })).status, 503);
});

test("Bun bindings protect local URL/keys and keep both environment APIs scoped", async () => {
  const value = await fixture({
    "functions/.env": "COLOR=blue\nSUPABASE_URL=https://production.invalid\nSUPABASE_DB_URL=postgres://production.invalid\n",
    "functions/env/index.ts": "export default { fetch: () => Response.json({ bun: { ...Bun.env }, process: { ...process.env } }) };",
  }, { auth: { enabled: false, publishable_key: "sb_publishable_local_test", secret_key: "sb_secret_local_test" }, edge_runtime: { policy: "per_worker" } });
  const previous = process.env.LITE_PRIVATE_TEST;
  process.env.LITE_PRIVATE_TEST = "must-not-inherit";
  cleanups.push(() => { if (previous === undefined) delete process.env.LITE_PRIVATE_TEST; else process.env.LITE_PRIVATE_TEST = previous; });
  const runner = await value.prepare({ host: "127.0.0.1", port: 54329 });
  const response = await runner.fetch(new Request("http://attacker.invalid/functions/v1/env"), { name: "env" });
  const body = await response.json();
  assert.deepEqual(body.bun, body.process);
  assert.equal(body.bun.COLOR, "blue");
  assert.equal(body.bun.SUPABASE_URL, "http://127.0.0.1:54329");
  assert.equal(body.bun.SUPABASE_DB_URL, undefined);
  assert.equal(body.bun.LITE_PRIVATE_TEST, undefined);
  assert.equal(body.bun.SUPABASE_FUNCTION_SLUG, "env");
  assert.deepEqual(JSON.parse(body.bun.SUPABASE_PUBLISHABLE_KEYS), { default: "sb_publishable_local_test" });
});

test("concurrent cold calls initialize once and isolate projects with the same function name", async () => {
  const source = `globalThis.functionMarker = process.env.VALUE;
    const instance = crypto.randomUUID();
    await new Promise(resolve => setTimeout(resolve, 30));
    let calls = 0;
    export default { fetch: () => Response.json({ instance, calls: ++calls, value: process.env.VALUE, marker: globalThis.functionMarker }) };`;
  const a = await fixture({ "functions/echo/index.ts": source, "functions/.env": "VALUE=a" }, { edge_runtime: { policy: "per_worker" } });
  const b = await fixture({ "functions/echo/index.ts": source, "functions/.env": "VALUE=b" }, { edge_runtime: { policy: "per_worker" } });
  const runners = await Promise.all([a.prepare(), b.prepare()]);
  const values = await Promise.all(runners.flatMap(runner => [0, 1].map(async () => {
    const response = await runner.fetch(new Request("http://local/functions/v1/echo"));
    assert.equal(response.status, 200);
    return response.json();
  })));
  assert.equal(values[0].instance, values[1].instance);
  assert.equal(values[2].instance, values[3].instance);
  assert.notEqual(values[0].instance, values[2].instance);
  assert.deepEqual(values.map(value => [value.value, value.marker]), [["a", "a"], ["a", "a"], ["b", "b"], ["b", "b"]]);
  assert.deepEqual(values.slice(0, 2).map(value => value.calls).sort(), [1, 2]);
  assert.equal(globalThis.functionMarker, undefined);
});

test("an idle worker is evicted without rejecting a sequential request for another function", async () => {
  const value = await fixture({
    "functions/a/index.ts": "export default { fetch: () => new Response('a') };",
    "functions/b/index.ts": "export default { fetch: () => new Response('b') };",
  }, { edge_runtime: { policy: "per_worker" } });
  const runner = await value.prepare({ maxWorkers: 1 });
  for (const name of ["a", "b", "a"]) {
    const response = await runner.fetch(new Request(`http://local/functions/v1/${name}`));
    assert.equal(response.status, 200);
    assert.equal(await response.text(), name);
  }
});
