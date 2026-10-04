// Seven isolated serving-process lifetimes; the portable example owns app checks.
import assert from "node:assert/strict";
import { access, cp, mkdir, mkdtemp, readFile, readdir, realpath } from "node:fs/promises";
import { join, resolve } from "node:path";
import { arch, cpus, platform, release, totalmem } from "node:os";
import { pathToFileURL } from "node:url";
import { createClient } from "@supabase/supabase-js";

assert.equal(platform(), "linux", "This measurement uses Linux /proc and GNU du");
const root = resolve(import.meta.dir, "..");
const output = resolve(process.argv[2] ?? join(root, ".graduation/lifecycle"));
const cache = resolve(process.argv[3] ?? join(output, "bun-cache"));
await mkdir(output, { recursive: true });
const directory = await mkdtemp(join(output, "run-")), project = join(directory, "project");
const fixture = join(root, "examples/functions-portable");
await cp(fixture, project, { recursive: true, filter: path => !/(?:^|\/)(node_modules|\.lite|\.temp|\.bun-cache)(\/|$)/.test(path) });
const cacheEntries = await readdir(cache).catch(error => { if (error.code === "ENOENT") return []; throw error; });
const env = { ...process.env, HOME: project, BUN_INSTALL_CACHE_DIR: cache, EXPERIMENTAL_STORAGE: "1", DO_NOT_TRACK: "1", LITE_TELEMETRY: "0", NO_COLOR: "1" };
const command = async (args, cwd = root) => {
  const process = Bun.spawn(args, { cwd, env, stdin: "ignore", stdout: "pipe", stderr: "pipe" });
  const timer = setTimeout(() => process.kill("SIGKILL"), 60000);
  try {
    const [code, out, err] = await Promise.all([process.exited, new Response(process.stdout).text(), new Response(process.stderr).text()]);
    assert.equal(code, 0, `${args.join(" ")}\n${out}\n${err}`); return { out, err };
  } finally { clearTimeout(timer); }
};
const git = async (...args) => (await command(["git", ...args])).out.trim();
const hash = async path => new Bun.CryptoHasher("sha256").update(await Bun.file(path).arrayBuffer()).digest("hex");
const immutablePaths = ["upstream/lite-0.11.0", "examples/functions-portable", "package.json", "bun.lock"];
await git("diff", "--exit-code", "HEAD", "--", ...immutablePaths);
const source = { commit: await git("rev-parse", "HEAD"), tree: await git("rev-parse", "HEAD^{tree}"), packageTree: await git("rev-parse", "HEAD:upstream/lite-0.11.0"), exampleTree: await git("rev-parse", "HEAD:examples/functions-portable"), driverSha256: await hash(import.meta.path) };
const installedAt = performance.now();
const install = await command([process.execPath, "install", "--ignore-scripts"], project);
const installMs = performance.now() - installedAt;
await Bun.write(join(directory, "install.log"), install.out + install.err);
const { exercise } = await import(pathToFileURL(join(project, "app/acceptance.mjs")).href);
const configPath = join(project, "supabase/config.lite.toml"), config = await Bun.file(configPath).text();
const reserved = Bun.serve({ hostname: "127.0.0.1", port: 0, fetch: () => new Response() });
const port = reserved.port, url = `http://127.0.0.1:${port}`; await reserved.stop(true);
const key = "sb_publishable_portability_demo", password = "Local-fixture-only-password-44!";
const measurements = []; let child, pipes, logs = "", state, checks;
const memory = async () => {
  try {
    const text = await readFile(`/proc/${child.pid}/status`, "utf8");
    const bytes = name => Number(text.match(new RegExp(`^${name}:\\s+(\\d+)`, "m"))?.[1]) * 1024;
    return { rssBytes: bytes("VmRSS"), peakRssBytes: bytes("VmHWM") };
  } catch { return { rssBytes: null, peakRssBytes: null }; }
};
async function start(label, policy, mode = "start") {
  await Bun.write(configPath, config.replace(/^port = \d+$/m, `port = ${port}`).replace('policy = "oneshot"', `policy = "${policy}"`));
  logs = ""; const begun = performance.now();
  child = Bun.spawn([process.execPath, join(root, "upstream/lite-0.11.0/dist/cli/index.js"), "--no-telemetry", mode, "--config", "supabase/config.lite.toml", "--no-admin"], { cwd: project, env, stdin: "ignore", stdout: "pipe", stderr: "pipe" });
  pipes = Promise.all([child.stdout, child.stderr].map(async stream => { for await (const bytes of stream) logs += new TextDecoder().decode(bytes); }));
  const deadline = Date.now() + 30000;
  while (true) {
    assert.equal(child.exitCode, null, logs); assert.ok(Date.now() < deadline, logs);
    try { if ((await fetch(`${url}/_system/ping`, { signal: AbortSignal.timeout(1000) })).ok) break; } catch {}
    await Bun.sleep(5);
  }
  return { label, policy, readyMs: performance.now() - begun, readyMemory: await memory() };
}
async function stop(sample) {
  sample.finalMemory = await memory(); const began = performance.now(); let forced = false;
  child.kill("SIGTERM"); const timer = setTimeout(() => { forced = true; child.kill("SIGKILL"); }, 12000);
  try { sample.exitCode = await child.exited; sample.shutdownMs = performance.now() - began; await pipes; }
  finally { clearTimeout(timer); }
  await Bun.write(join(directory, `${sample.label}.log`), logs);
  assert.equal(sample.exitCode, 0, logs); assert.equal(child.signalCode, null); assert.equal(forced, false);
  await assert.rejects(fetch(`${url}/_system/ping`, { signal: AbortSignal.timeout(1000) }));
  await assert.rejects(access(`/proc/${child.pid}`)); sample.pidGone = true; sample.listenerClosed = true;
  measurements.push(sample);
}
const deadline = setTimeout(() => { child?.kill("SIGKILL"); console.error("Lifecycle measurement exceeded 120 seconds"); process.exit(1); }, 120000);
try {
  const provision = await start("fresh-provision", "oneshot", "dev");
  const begun = performance.now(), seeded = await exercise({ url, key, password, phase: "seed" });
  state = seeded.state; provision.seedAndChecksMs = performance.now() - begun; provision.checkCount = seeded.checks.length;
  await Bun.write(join(directory, "state.json"), JSON.stringify(state)); await stop(provision);
  for (const policy of ["oneshot", "per_worker"]) for (let cycle = 1; cycle <= 3; cycle++) {
    const sample = await start(`${policy}-${cycle}`, policy);
    const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    assert.equal((await client.auth.signInWithPassword({ email: state.ownerEmail, password })).error, null);
    const times = [];
    for (let n = 0; n < 11; n++) {
      const begun = performance.now(), result = await client.functions.invoke(`tasks/${state.id}`, { method: "GET" });
      times.push(performance.now() - begun); assert.equal(result.error, null); assert.deepEqual(result.data, state.task);
    }
    sample.firstFunctionMs = times[0]; sample.subsequentFunctionMs = times.slice(1);
    const sorted = times.slice(1).toSorted((a, b) => a - b); sample.medianSubsequentMs = (sorted[4] + sorted[5]) / 2;
    sample.loadedMemory = await memory();
    const verified = await exercise({ url, key, password, phase: "verify", state });
    checks = verified.checks; sample.checkCount = checks.length; await stop(sample);
  }
  const size = async path => Number((await command(["du", "-sb", path])).out.split(/\s/)[0]);
  await git("diff", "--exit-code", "HEAD", "--", ...immutablePaths);
  assert.equal(await git("rev-parse", "HEAD"), source.commit, "Source changed during measurement");
  const result = {
    timestamp: new Date().toISOString(), source,
    runtime: { bun: Bun.version, binarySha256: await hash(process.execPath), binaryBytes: Bun.file(process.execPath).size, preinstalled: true },
    machine: { os: platform(), architecture: arch(), kernel: release(), cpu: cpus()[0]?.model, logicalCpus: cpus().length, totalMemoryBytes: totalmem(), resourceIsolation: "not controlled by this script" },
    installation: { scope: "Example SDK dependencies; repository dependencies were already installed", ms: installMs, cacheBefore: cacheEntries.length ? "populated" : "empty-or-absent", installerSummary: (install.out + install.err).trim(), generatedLockSha256: await hash(join(project, "bun.lock")), osPageCacheCleared: false },
    sampleCounts: { freshProvision: 1, restartsPerPolicy: 3, firstRequestsPerRestart: 1, subsequentRequestsPerRestart: 10 },
    footprint: { packageBytes: await size(join(root, "upstream/lite-0.11.0")), applicationDependenciesBytes: await size(join(project, "node_modules")), repositoryDependenciesBytes: await size(await realpath(join(root, "node_modules"))), durableSqliteDirectoryBytes: await size(join(project, ".lite")), storageDirectoryBytes: await size(join(project, "supabase/.temp/storage")) },
    measurements, restartChecks: checks,
    notes: ["Linux /proc serving-PID RSS and VmHWM include native worker threads; exclude this driver. Unavailable memory readings are null.", "Readiness is polled every 5 ms. Sign-in precedes the timed first function invocation.", "oneshot creates a worker per call; its subsequent calls are not retained-worker warm latency.", "Cache presence does not prove an install made no network requests. Footprints are apparent bytes with overlapping scopes, not an incremental disk requirement.", "Seven completed serving-process exits and persisted auth/record/private-file checks; no crash-recovery, automatic wake, latency bound, hosted cost or comparative performance claim."],
  };
  await Bun.write(join(directory, "results.json"), JSON.stringify(result, (_, value) => typeof value === "number" && !Number.isInteger(value) ? Math.round(value * 1000) / 1000 : value, 2) + "\n");
  console.log(join(directory, "results.json"));
} finally {
  clearTimeout(deadline);
  if (child?.exitCode === null) { child.kill("SIGTERM"); const timer = setTimeout(() => child.kill("SIGKILL"), 12000); await child.exited; clearTimeout(timer); }
}
