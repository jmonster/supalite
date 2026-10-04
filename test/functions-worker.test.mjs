import { test, afterEach } from "bun:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { createFunctionWorker } from "../upstream/lite-0.11.0/dist/functions/execution.js";

const cleanups = [];
afterEach(async () => { for (const cleanup of cleanups.splice(0).reverse()) await cleanup(); });
const delay = ms => Bun.sleep(ms);

async function fixture(source, files = {}) {
  const root = await mkdtemp(join(process.cwd(), ".functions-worker-"));
  const entrypoint = join(root, "index.ts");
  const workers = [];
  cleanups.push(async () => {
    try { await Promise.all(workers.map(worker => worker.close())); }
    finally { await rm(root, { recursive: true, force: true }); }
  });
  for (const [path, content] of Object.entries({ "index.ts": source, ...files })) {
    await mkdir(dirname(join(root, path)), { recursive: true });
    await writeFile(join(root, path), content);
  }
  return { root, entrypoint, async start(environment = {}, options = {}) {
    const worker = await createFunctionWorker(entrypoint, environment, { shutdownTimeoutMs: 150, ...options });
    workers.push(worker);
    return worker;
  } };
}

async function waitForAbort(signal) {
  if (signal.aborted) return;
  let timer;
  try {
    await Promise.race([
      new Promise(resolve => signal.addEventListener("abort", resolve, { once: true })),
      new Promise((_, reject) => { timer = setTimeout(() => reject(new Error("Worker lifetime did not abort")), 2000); }),
    ]);
  } finally { clearTimeout(timer); }
}

test("Bun worker loads TypeScript and native package imports once, with an isolated environment", async () => {
  const value = await fixture(`import { suffix } from './shared.ts';
    import { label } from 'fixture-package';
    const instance: string = crypto.randomUUID();
    let calls = 0;
    export default { marker: 'bound', fetch() {
      const original = { ...process.env };
      process.env.WORKER_VALUE += suffix;
      return Response.json({ original, bun: Bun.env.WORKER_VALUE, marker: this.marker, instance, calls: ++calls, label });
    } };`, {
    "shared.ts": "export const suffix: string = '-changed';",
    "package.json": '{"type":"module","dependencies":{"fixture-package":"1.0.0"}}',
    "node_modules/fixture-package/package.json": '{"name":"fixture-package","version":"1.0.0","type":"module","exports":"./index.js"}',
    "node_modules/fixture-package/index.js": "export const label = 'native-package';",
  });
  const previous = process.env.LITE_WORKER_HOST_SECRET;
  const hostValue = process.env.WORKER_VALUE;
  process.env.LITE_WORKER_HOST_SECRET = "host-only";
  cleanups.push(() => { if (previous === undefined) delete process.env.LITE_WORKER_HOST_SECRET; else process.env.LITE_WORKER_HOST_SECRET = previous; });
  const a = await value.start({ WORKER_VALUE: "a" });
  const b = await value.start({ WORKER_VALUE: "b" });
  const first = await (await fetch(a.url)).json();
  const second = await (await fetch(a.url)).json();
  const peer = await (await fetch(b.url)).json();
  assert.deepEqual(first.original, { WORKER_VALUE: "a" });
  assert.equal(first.bun, "a-changed");
  assert.equal(first.marker, "bound");
  assert.equal(first.label, "native-package");
  assert.equal(second.instance, first.instance);
  assert.equal(second.calls, 2);
  assert.equal(second.original.WORKER_VALUE, "a-changed");
  assert.deepEqual(peer.original, { WORKER_VALUE: "b" });
  assert.notEqual(peer.instance, first.instance);
  assert.equal(process.env.LITE_WORKER_HOST_SECRET, "host-only");
  assert.equal(process.env.WORKER_VALUE, hostValue);
});

test("Bun worker owns one loopback listener and preserves HTTP bodies, headers, status and streaming", async () => {
  const occupied = Bun.serve({ hostname: "127.0.0.1", port: 0, fetch: () => new Response("occupied") });
  cleanups.push(() => occupied.stop(true));
  const value = await fixture(`export default { port: ${occupied.port}, hostname: '127.0.0.1', async fetch(request: Request) {
    if (new URL(request.url).pathname === '/stream') return new Response(new ReadableStream({
      start(controller) {
        controller.enqueue(new Uint8Array([1, 2]));
        setTimeout(() => { controller.enqueue(new Uint8Array([3, 4])); controller.close(); }, 150);
      }
    }), { headers: { 'x-stream': 'yes' } });
    return new Response(await request.arrayBuffer(), { status: 207, headers: {
      'content-type': 'application/octet-stream', 'x-method': request.method,
      'x-path': new URL(request.url).pathname + new URL(request.url).search,
      'set-cookie': 'a=1; Path=/'
    } });
  } };`);
  const worker = await value.start();
  assert.equal(new URL(worker.url).hostname, "127.0.0.1");
  assert.notEqual(new URL(worker.url).port, String(occupied.port));
  const response = await fetch(worker.url + "/nested?x=1", { method: "POST", body: new Uint8Array([0, 255, 42]) });
  assert.equal(response.status, 207);
  assert.equal(response.headers.get("x-method"), "POST");
  assert.equal(response.headers.get("x-path"), "/nested?x=1");
  assert.equal(response.headers.get("set-cookie"), "a=1; Path=/");
  assert.deepEqual(new Uint8Array(await response.arrayBuffer()), new Uint8Array([0, 255, 42]));
  const stream = await fetch(worker.url + "/stream");
  assert.equal(stream.headers.get("x-stream"), "yes");
  const reader = stream.body.getReader();
  assert.deepEqual((await reader.read()).value, new Uint8Array([1, 2]));
  assert.deepEqual((await reader.read()).value, new Uint8Array([3, 4]));
  assert.equal((await reader.read()).done, true);
  assert.equal(await (await fetch(occupied.url)).text(), "occupied");
});

for (const [name, source, expected] of [
  ["missing default", "export const fetch = () => new Response('no');", /export default.*fetch/],
  ["import error", "import './absent.ts';", /absent\.ts/],
  ["syntax error", "export default { fetch( => {} };", /Expected|Unexpected|SyntaxError/],
  ["Deno server", "Deno.serve(() => new Response('no'));", /Deno APIs are not supported.*Export default/],
  ["npm specifier", "import 'npm:fixture-package@1.0.0';", /npm:\/jsr: imports are not supported.*bare package imports/],
  ["jsr specifier", "import 'jsr:@example/package@1.0.0';", /npm:\/jsr: imports are not supported.*bare package imports/],
]) test(`Bun worker reports actionable startup errors: ${name}`, async () => {
  const value = await fixture(source);
  await assert.rejects(value.start(), error => {
    assert.match(error.diagnostics ?? error.message, expected);
    return true;
  });
});

test("Bun worker startup can time out or be aborted by its caller", async () => {
  const value = await fixture("await new Promise(() => {});");
  await assert.rejects(value.start({}, { startupTimeoutMs: 80 }), error => {
    assert.match(error.message, /startup timed out/);
    return true;
  });
  const controller = new AbortController();
  const pending = value.start({}, { signal: controller.signal, startupTimeoutMs: 10000 });
  setTimeout(() => controller.abort(new Error("cancel startup")), 80);
  await assert.rejects(pending, /cancel startup/);
  await assert.rejects(value.start({}, { signal: controller.signal }), /cancel startup/);
});

test("Bun worker graceful close finishes an active request and is idempotent", async () => {
  const value = await fixture(`export default { async fetch() {
    await Bun.sleep(100);
    return new Response('finished');
  } };`);
  const worker = await value.start({}, { shutdownTimeoutMs: 1000 });
  const pending = fetch(worker.url);
  await delay(30);
  const closed = worker.close();
  assert.equal(worker.close(), closed);
  assert.equal(await (await pending).text(), "finished");
  assert.equal(await closed, true);
  assert.equal(worker.signal.aborted, true);
  await assert.rejects(fetch(worker.url));
});

for (const action of ["throw new Error('intentional worker crash')", "process.exit(7)"])
  test(`Bun worker aborts its lifetime after ${action}`, async () => {
    const value = await fixture(`export default { fetch() {
      setTimeout(() => { ${action} }, 30);
      return new Response('started');
    } };`);
    const worker = await value.start();
    assert.equal(await (await fetch(worker.url)).text(), "started");
    await waitForAbort(worker.signal);
    assert.equal(await worker.close(), true);
  });

test("Bun hard termination stops a synchronous startup loop", async () => {
  const value = await fixture("while (true) {}");
  const started = performance.now();
  await assert.rejects(value.start({}, { startupTimeoutMs: 80, shutdownTimeoutMs: 80 }), /startup timed out/);
  assert.ok(performance.now() - started < 1000, "startup termination exceeded its bounded shutdown");
});
