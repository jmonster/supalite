import assert from "node:assert/strict";
import { SQL } from "bun";
import { Database } from "bun:sqlite";
import { createHash } from "node:crypto";
import { cp, mkdir, mkdtemp, readFile, readdir, stat, symlink, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const example = import.meta.dirname;
const repo = resolve(example, "../..");
const lite = join(repo, "upstream/lite-0.11.0/dist/cli/index.js");
const liteOnly = process.argv.includes("--lite-only");
const cli = process.env.LITE_SUPABASE_CLI;
assert.ok(globalThis.Bun, "Run with Bun 1.4.2 or later");
if (!liteOnly) assert.ok(cli && isAbsolute(cli) && !/\s/.test(cli), "Set LITE_SUPABASE_CLI to the absolute path of Supabase CLI 2.119.0 (no spaces)");
const parent = resolve(process.env.GRADUATION_ROOT ?? join(repo, ".graduation"));
await mkdir(parent, { recursive: true, mode: 0o700 });
const work = await mkdtemp(join(parent, "tasks-"));
const source = join(work, "source");
const target = join(work, "target");
const receiptPath = join(work, "receipt.json");
const password = "Local-fixture-only-password-44!";
const secrets = new Set([password, "sb_secret_portability_demo", "graduation-fixture-only-change-before-real-use-2026"]);
const clean = value => {
  let text = String(value);
  for (const secret of secrets) text = text.split(secret).join("[redacted]");
  return text.replace(/sb_(?:publishable|secret)_[A-Za-z0-9_-]+/g, "[test-key-redacted]")
    .replace(/eyJ[A-Za-z0-9_.-]+/g, "[test-jwt-redacted]")
    .replace(/(postgres(?:ql)?:\/\/[^:\s]+:)[^@\s]+@/g, "$1[redacted]@");
};
const env = { ...process.env, HOME: work, LITE_TELEMETRY: "0", DO_NOT_TRACK: "1", NO_COLOR: "1",
  EXPERIMENTAL_STORAGE: "1", SUPABASE_EXPERIMENTAL_STACK: "1", SUPABASE_HOME: process.env.SUPABASE_HOME ?? join(work, "supabase-home") };
for (const name of Object.keys(env)) if (/^SUPABASE_(?:URL|PUBLISHABLE_KEY|SECRET_KEY|ANON_KEY|SERVICE_ROLE_KEY|ACCESS_TOKEN)$/.test(name)) delete env[name];
let server, reading, serverLog = "", targetAttempted = false, activeCommand;
const cancellation = new AbortController();
const interrupt = signal => {
  cancellation.abort(new Error(`Interrupted by ${signal}`));
  activeCommand?.kill("SIGTERM");
  if (server?.exitCode === null) server.kill("SIGTERM");
};
process.once("SIGTERM", () => interrupt("SIGTERM"));
process.once("SIGINT", () => interrupt("SIGINT"));
const receipt = { passed: false, route: liteOnly ? "lite-only" : "sqlite-to-native-supabase", bun: Bun.version,
  supabaseCli: liteOnly ? null : "2.119.0", sessionsMigrated: false, checks: {}, cleanup: {} };
async function files(directory, prefix = "") {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (["node_modules", ".lite", ".temp", "deno.lock"].includes(entry.name)) continue;
    const relative = join(prefix, entry.name);
    if (entry.isDirectory()) result.push(...await files(join(directory, entry.name), relative));
    else if (entry.isFile()) result.push(relative);
    else throw new Error(`Unsupported fixture entry: ${relative}`);
  }
  return result.sort();
}
const digest = data => createHash("sha256").update(data).digest("hex");
async function hashes(root, paths) {
  return Object.fromEntries(await Promise.all(paths.map(async path => [path, digest(await readFile(join(root, path)))])));
}
async function command(label, executable, args, cwd = source, timeoutMs = 300000, cleanup = false, privateOutput = false) {
  if (!cleanup) cancellation.signal.throwIfAborted();
  const process = Bun.spawn([executable, ...args], { cwd, env, stdin: "ignore", stdout: "pipe", stderr: "pipe" });
  if (!cleanup) activeCommand = process;
  const timer = setTimeout(() => process.kill("SIGTERM"), timeoutMs);
  const hard = setTimeout(() => process.kill("SIGKILL"), timeoutMs + 5000);
  try {
    const [code, stdout, stderr] = await Promise.all([process.exited, new Response(process.stdout).text(), new Response(process.stderr).text()]);
    if (privateOutput) {
      try {
        const credentialIndex = args.indexOf("--dump-credentials");
        const values = credentialIndex >= 0 ? JSON.parse(await readFile(args[credentialIndex + 1], "utf8")) : JSON.parse(stdout).env;
        for (const value of Object.values(values ?? {})) if (typeof value === "string") secrets.add(value);
      } catch { /* A failed startup may not have produced credentials or JSON. */ }
    }
    await writeFile(join(work, `${label}.log`), clean((privateOutput && code === 0 ? "[private output withheld]\n" : stdout) + stderr));
    assert.equal(code, 0, `${label} failed: ${clean(stderr + stdout)}`);
    return stdout;
  } finally { clearTimeout(timer); clearTimeout(hard); if (activeCommand === process) activeCommand = undefined; }
}
async function stopLite() {
  if (!server) return;
  const child = server; server = undefined;
  if (child.exitCode === null) child.kill("SIGTERM");
  const timer = setTimeout(() => child.kill("SIGKILL"), 10000);
  try {
    assert.equal(await child.exited, 0, clean(serverLog)); await reading;
    receipt.cleanup.lite = "graceful-exit";
  } finally { clearTimeout(timer); await writeFile(join(work, "lite.log"), clean(serverLog)); }
}
function snapshot() {
  const database = new Database(join(source, ".lite/tasks.sqlite"), { readonly: true });
  try {
    const buckets = database.query('SELECT id, name, owner, owner_id, public, file_size_limit, allowed_mime_types, created_at FROM "storage.buckets" ORDER BY id').all();
    const objects = database.query('SELECT id, bucket_id, name, owner, owner_id, user_metadata, created_at FROM "storage.objects" ORDER BY id').all();
    return { buckets, objects, tasks: database.query("SELECT * FROM tasks ORDER BY id").all() };
  } finally { database.close(); }
}
try {
  const portable = (await files(example)).filter(path => path !== "supabase/config.lite.toml" && path !== "graduate.mjs" && path !== "README.md" && path !== ".gitignore");
  const original = await hashes(example, portable);
  await mkdir(source);
  for (const path of [...portable, "supabase/config.lite.toml"]) {
    await mkdir(dirname(join(source, path)), { recursive: true });
    await cp(join(example, path), join(source, path));
  }
  await symlink(join(repo, "node_modules"), join(source, "node_modules"));
  // No fixture code is rewritten for either runtime.
  const reservation = Bun.serve({ hostname: "127.0.0.1", port: 0, fetch: () => new Response() });
  const port = reservation.port; await reservation.stop(true);
  const config = join(source, "supabase/config.lite.toml");
  await writeFile(config, (await readFile(config, "utf8")).replace("port = 54321", `port = ${port}`));
  server = Bun.spawn([process.execPath, lite, "--no-telemetry", "dev", "--config", "supabase/config.lite.toml", "--no-admin", "--host", "127.0.0.1"], {
    cwd: source, env, stdin: "ignore", stdout: "pipe", stderr: "pipe",
  });
  reading = Promise.all([server.stdout, server.stderr].map(async stream => {
    for await (const bytes of stream) serverLog += new TextDecoder().decode(bytes);
  }));
  const url = `http://127.0.0.1:${port}`;
  let ready = false;
  for (const deadline = Date.now() + 20000; Date.now() < deadline;) {
    cancellation.signal.throwIfAborted();
    assert.equal(server.exitCode, null, clean(serverLog));
    try { ready = (await fetch(`${url}/_system/ping`, { signal: AbortSignal.timeout(500) })).ok; } catch {}
    if (ready) break;
    await Bun.sleep(50);
  }
  assert.ok(ready, `Lite did not become ready: ${clean(serverLog)}`);
  const { exercise } = await import(pathToFileURL(join(source, "app/acceptance.mjs")).href);
  const seeded = await exercise({ url, key: "sb_publishable_portability_demo", password });
  receipt.checks.lite = seeded.checks;
  receipt.state = seeded.state;
  await stopLite();
  await assert.rejects(fetch(`${url}/_system/ping`, { signal: AbortSignal.timeout(500) }));
  const before = snapshot();
  assert.equal(before.objects.length, 1); assert.equal(before.buckets.length, 1);
  assert.equal(before.objects[0].id, seeded.state.objectId);
  assert.equal(before.objects[0].owner_id, seeded.state.ownerId);
  assert.equal(before.buckets[0].public, 0);
  if (!liteOnly) {
    assert.equal((await command("cli-version", cli, ["--version"])).trim(), "2.119.0");
    const credentialsFile = join(work, "credentials.json");
    targetAttempted = true;
    await command("upgrade", process.execPath, [lite, "--no-telemetry", "upgrade", "--config", "supabase/config.lite.toml", "--target", "local", "--local-runtime", "native", "--local-dir", target, "--storage-quiescent", "--no-migrate-sessions", "--force", "--dump-credentials", credentialsFile], source, 480000, false, true);
    const credentials = JSON.parse(await readFile(credentialsFile, "utf8"));
    for (const value of Object.values(credentials)) if (typeof value === "string") secrets.add(value);
    assert.equal((await stat(credentialsFile)).mode & 0o777, 0o600);
    assert.ok(["127.0.0.1", "localhost", "[::1]"].includes(new URL(credentials.apiUrl).hostname));
    const status = JSON.parse(await command("target-status", cli, ["stack", "status", "--workdir", target, "--output-format", "json"], source, 60000, false, true));
    assert.equal(status.runtime, "native"); assert.equal(status.readiness, "ready");
    const services = status.composition.members.map(member => member.service).sort();
    assert.deepEqual(services, ["auth", "database", "functions", "rest", "storage"]);
    receipt.target = { runtime: status.runtime, readiness: status.readiness, services };
    const verified = await exercise({ url: credentials.apiUrl, key: credentials.anonKey, password, phase: "verify", state: seeded.state });
    receipt.checks.supabase = verified.checks;
    const sql = new SQL(credentials.dbUrl);
    try {
      const objects = await sql.unsafe("SELECT id,bucket_id,name,owner,owner_id,user_metadata,created_at FROM storage.objects ORDER BY id");
      const buckets = await sql.unsafe("SELECT id,name,owner,owner_id,public,file_size_limit,allowed_mime_types,created_at FROM storage.buckets ORDER BY id");
      const normalize = value => value instanceof Date ? value.toISOString() : typeof value === "string" && /^[\[{]/.test(value) ? JSON.parse(value) : value;
      const normalized = rows => rows.map(row => Object.fromEntries(Object.entries(row).map(([key, value]) => [key, key === "created_at" ? new Date(value).toISOString() : key === "public" ? Boolean(value) : key === "file_size_limit" && value !== null ? Number(value) : normalize(value)])));
      assert.deepEqual(normalized([...objects]), normalized(before.objects));
      assert.deepEqual(normalized([...buckets]), normalized(before.buckets));
      receipt.storageOwnership = { matched: true, buckets: buckets.length, objects: objects.length };
    } finally { await sql.close(); }
    const functionPaths = portable.filter(path => path.startsWith("supabase/functions/"));
    assert.deepEqual(await hashes(target, functionPaths), await hashes(source, functionPaths));
    receipt.deployedFunctionHashes = await hashes(target, functionPaths);
    assert.deepEqual(snapshot(), before, "Graduation must not change the source rows or ownership");
    const sourceBytes = await readFile(join(source, "supabase/.temp/storage/task-attachments", seeded.state.path));
    assert.equal(digest(sourceBytes), seeded.state.sha256);
    receipt.checks.sourceUnchanged = true;
  }
  assert.deepEqual(await hashes(source, portable), original);
  assert.deepEqual(await hashes(example, portable), original);
  receipt.portableSourceHashes = original;
  cancellation.signal.throwIfAborted();
  receipt.passed = true;
} catch (error) {
  let responseDetail = "";
  if (error.context instanceof Response) {
    try { responseDetail = `\nFunction response: ${await error.context.clone().text()}`; } catch {}
  }
  receipt.error = clean(String(error.stack ?? error) + responseDetail);
  process.exitCode = 1;
} finally {
  try { await stopLite(); } catch (error) { receipt.passed = false; receipt.cleanup.liteError = clean(error); process.exitCode = 1; }
  if (targetAttempted) {
    try {
      const stopped = JSON.parse(await command("target-stop", cli, ["stack", "stop", "--workdir", target, "--output-format", "json"], source, 30000, true));
      assert.equal(stopped.unavailable?.length ?? 0, 0);
      assert.ok(stopped.found === false || stopped.stopped?.length === 1);
      receipt.cleanup.supabase = stopped.found === false ? "not-created" : "owned-stack-stopped";
    } catch (error) { receipt.passed = false; receipt.cleanup.supabaseError = clean(error); process.exitCode = 1; }
  }
  await writeFile(receiptPath, JSON.stringify(receipt, null, 2) + "\n");
  console.log(JSON.stringify({ passed: receipt.passed, route: receipt.route, receipt: receiptPath, checks: receipt.checks, cleanup: receipt.cleanup, ...(receipt.error ? { error: receipt.error } : {}) }));
}
