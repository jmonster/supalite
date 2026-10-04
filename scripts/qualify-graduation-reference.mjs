// One-shot qualification adapter. The example itself invokes the public upgrade CLI.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createReadStream, createWriteStream } from "node:fs";
import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { isAbsolute, join, resolve } from "node:path";
import { pipeline } from "node:stream/promises";

// Fill these from the reviewed final content commit before a deliberate launch.
export const EXPECTED_FEATURE_SHA = "10b23d4eefb3a34afe57fc59b2dda8362c3bce8f";
export const EXPECTED_FEATURE_TREE = "911f97aeb52ec5dd6dde63076d0053af58001265";
export const EXPECTED_BUN_LOCK_SHA256 = "4eee5a5802356135ba198cc9c6a71f20fd0938745ecbf2998857aa0ddfe8310f";
export const SOURCES = {
  "examples/functions-portable/.gitignore": "858e0b5685df25deab71d8137199fddd7306733721021148ee915c0771967d4c",
  "examples/functions-portable/README.md": "a0f3393b98d519068cca2ba155293bd338ad752d975f5717f2c43d83515820a7",
  "examples/functions-portable/app/acceptance.mjs": "b2881f239a5e32a76dabe77a69e8aa6fe20ee64edf0122d511e21d371c029097",
  "examples/functions-portable/app/client.mjs": "f0b123c5a59a7193b21e9c0e15d281354cd82a50874d85e1497e516a76c88656",
  "examples/functions-portable/graduate.mjs": "1d0cb5a2f90ce874112202f763e4d5b936f2e4e197aaa219668bca978524edea",
  "examples/functions-portable/package.json": "7df4fbc33082162819d6f6458b1c9dfdd6bbb1825e4f7c45f0b7e89866d0b9e6",
  "examples/functions-portable/supabase/config.lite.toml": "9edc7ac4dbe53621cb0c9d00d63fd7bb482448e363766d0ee031efa1a865849b",
  "examples/functions-portable/supabase/config.toml": "c257a6dc4a12b476b5ffccfc0b09cb58374e82fa4a847b0109e7fc6e431c0a2d",
  "examples/functions-portable/supabase/functions/_shared/validation.ts": "a1dc8c5bcf63ceac98de3fdab4bacbcaf8e4f312217870273eb78db63f8d1d59",
  "examples/functions-portable/supabase/functions/tasks/deno.json": "2ad4155ca68879d40e21925162e4afa207e99ba203790dc31c23971f90c6cd90",
  "examples/functions-portable/supabase/functions/tasks/index.ts": "2c58e74c80c9e4ba0a2b4240d2e568613f4d2e270c8a6a9b4131c464c761e5c0",
  "examples/functions-portable/supabase/migrations/20261004160000_tasks.sql": "b38d4b27dc1019f11ae1288106a5ad1c85ffb143f2c6cfb5400c3db90c2d1793"
};
export const VERIFICATION_BRANCH = "verification/authenticated-graduation-20261004";
const QUALIFIER_FILES = [".github/workflows/graduation-reference-once.yml", "scripts/qualify-graduation-reference.mjs"];
const CLI_VERSION = "2.119.0";
const CLI_SHA256 = "bf1c3ae93be98533eb8a3105dbf4564bd0b2d9dc24690d8a920f980ef975c1b4";
const SERVICE_PINS = [
  ["postgres", "17.11.0.002-r0", "4a4410791bdeeda2e08fda400039b4319bb26d74e08e68951f38abc9dacd7c26"],
  ["postgrest", "v16.4-r0", "d9170378062dba1188c25fb05cd08a3397bb62afd63151812f831eed4fab1051"],
  ["auth", "v2.197.0-r0", "bd8f59ed1a817014afe71288c2275ad0396630f016f8cb5ab5129388860ec49b"],
  ["storage", "v1.79.28-r1", "c8ce124acfe46a2151052f160a81653f751277516f5c378d93ba7f18e7b3efe4"],
  ["edge-runtime", "v1.77.1-r0", "e524630f0743319d77535f93748a894520fd52cf9c8fa8c2adb22e08ddb39419"],
];
const root = resolve(process.env.QUALIFICATION_ROOT ?? "");
const candidate = resolve(process.env.CANDIDATE_DIR ?? "");
const privateDir = join(root, "private");
const receiptDir = join(root, "receipt");
const home = join(privateDir, "supabase-home");
const cli = join(privateDir, "bin/supabase");
const workRoot = join(privateDir, "projects");
const env = { ...process.env, LITE_SUPABASE_CLI: cli, SUPABASE_HOME: home, SUPABASE_EXPERIMENTAL_STACK: "1",
  SUPABASE_TELEMETRY_DISABLED: "1", DO_NOT_TRACK: "1", GRADUATION_ROOT: workRoot, NO_COLOR: "1" };
delete env.BUN_OPTIONS; delete env.NODE_OPTIONS;
for (const key of Object.keys(env)) if (/^SUPABASE_(?:URL|PUBLISHABLE_KEY|SECRET_KEY|ANON_KEY|SERVICE_ROLE_KEY|ACCESS_TOKEN)$/.test(key)) delete env[key];
export const redact = value => String(value).replace(/sb_(?:publishable|secret)_[A-Za-z0-9_-]+/g, "[test-key-redacted]")
  .replace(/eyJ[A-Za-z0-9_.-]+/g, "[test-jwt-redacted]").replace(/(postgres(?:ql)?:\/\/[^:\s]+:)[^@\s]+@/g, "$1[redacted]@");
async function hash(path) {
  const hasher = createHash("sha256");
  for await (const chunk of createReadStream(path)) hasher.update(chunk);
  return hasher.digest("hex");
}
let child, interrupted;
const cancel = signal => { interrupted = signal; child?.kill("SIGTERM"); };
process.once("SIGTERM", () => cancel("SIGTERM"));
process.once("SIGINT", () => cancel("SIGINT"));
async function run(label, command, args, { timeoutMs = 60000, cleanup = false } = {}) {
  if (!cleanup) assert.ok(!interrupted, "Qualification interrupted");
  const process = spawn(command, args, { cwd: candidate, env, stdio: ["ignore", "pipe", "pipe"] });
  if (!cleanup) child = process;
  let stdout = "", stderr = "";
  process.stdout.on("data", bytes => { stdout += bytes; });
  process.stderr.on("data", bytes => { stderr += bytes; });
  const timer = setTimeout(() => process.kill("SIGTERM"), timeoutMs);
  const hard = setTimeout(() => process.kill("SIGKILL"), timeoutMs + 15000);
  try {
    const [code, signal] = await once(process, "close");
    await writeFile(join(receiptDir, `${label}.log`), redact(stdout + stderr));
    assert.equal(code, 0, `${label} failed (${signal ?? code}): ${redact(stderr)}`);
    return stdout;
  } finally { clearTimeout(timer); clearTimeout(hard); if (child === process) child = undefined; }
}
async function verifySources() {
  assert.ok(SOURCES && typeof SOURCES === "object", "Source hashes are not frozen; refusing to qualify");
  for (const [path, expected] of Object.entries(SOURCES)) assert.equal(await hash(join(candidate, path)), expected, `Changed source: ${path}`);
}
async function validate(local = false) {
  assert.equal(Bun.version, "1.4.2");
  assert.match(EXPECTED_FEATURE_SHA, /^[a-f0-9]{40}$/);
  assert.match(EXPECTED_FEATURE_TREE, /^[a-f0-9]{40}$/);
  assert.equal(await hash(join(candidate, "bun.lock")), EXPECTED_BUN_LOCK_SHA256);
  if (local) assert.equal((await run("candidate-tree", "git", ["rev-parse", "HEAD^{tree}"])).trim(), EXPECTED_FEATURE_TREE);
  else {
    assert.equal(process.env.QUALIFICATION_BRANCH, VERIFICATION_BRANCH);
    assert.equal((await run("candidate-sha", "git", ["rev-parse", "HEAD"])).trim(), process.env.QUALIFIER_SHA);
    assert.equal((await run("feature-tree", "git", ["rev-parse", `${EXPECTED_FEATURE_SHA}^{tree}`])).trim(), EXPECTED_FEATURE_TREE);
    await run("feature-ancestor", "git", ["merge-base", "--is-ancestor", EXPECTED_FEATURE_SHA, "HEAD"]);
    const changed = (await run("qualifier-diff", "git", ["diff", "--name-only", EXPECTED_FEATURE_SHA, "HEAD"])).trim().split("\n").filter(Boolean).sort();
    assert.deepEqual(changed, [...QUALIFIER_FILES].sort());
  }
  await verifySources();
}
async function cleanup() {
  let projects;
  try { projects = await readdir(workRoot, { withFileTypes: true }); } catch (error) { if (error.code === "ENOENT") return; throw error; }
  for (const entry of projects) {
    assert.ok(entry.isDirectory() && /^tasks-[A-Za-z0-9]+$/.test(entry.name), "Unexpected qualification workdir");
    const project = join(workRoot, entry.name), target = join(project, "target");
    const stoppedMarker = join(project, "qualification-stopped.json");
    try { if (JSON.parse(await readFile(stoppedMarker, "utf8")).stopped === true) continue; }
    catch (error) { if (error.code !== "ENOENT") throw error; }
    try {
      const demo = JSON.parse(await readFile(join(project, "receipt.json"), "utf8"));
      if (demo.cleanup?.supabase === "owned-stack-stopped" || demo.cleanup?.supabase === "not-created") continue;
    } catch (error) { if (error.code !== "ENOENT") throw error; }
    try { await stat(join(target, "supabase/config.toml")); } catch (error) { if (error.code === "ENOENT") continue; throw error; }
    const stopped = JSON.parse(await run("reference-cleanup", cli, ["stack", "stop", "--workdir", target, "--output-format", "json"], { cleanup: true, timeoutMs: 30000 }));
    assert.equal(stopped.unavailable?.length ?? 0, 0);
    assert.ok(stopped.found === false || stopped.stopped?.length === 1);
    await writeFile(stoppedMarker, JSON.stringify({ stopped: true }), { mode: 0o600 });
  }
}
async function main() {
  assert.ok(process.env.QUALIFICATION_ROOT && isAbsolute(process.env.QUALIFICATION_ROOT));
  assert.ok(process.env.RUNNER_TEMP && root.startsWith(`${resolve(process.env.RUNNER_TEMP)}/`));
  assert.ok(process.env.CANDIDATE_DIR && isAbsolute(process.env.CANDIDATE_DIR));
  await mkdir(privateDir, { recursive: true, mode: 0o700 }); await mkdir(receiptDir, { recursive: true });
  if (process.argv.includes("--cleanup")) { await cleanup(); return; }
  await validate(process.argv.includes("--validate-local-source"));
  if (process.argv.includes("--validate") || process.argv.includes("--validate-local-source")) {
    console.log(JSON.stringify({ validated: true, servicesStarted: false })); return;
  }
  const receipt = { result: "failed", featureSha: EXPECTED_FEATURE_SHA, featureTree: EXPECTED_FEATURE_TREE,
    qualifierSha: process.env.QUALIFIER_SHA, cliVersion: CLI_VERSION, cliArchiveSha256: CLI_SHA256,
    bunVersion: Bun.version, services: SERVICE_PINS, sources: SOURCES };
  try {
    await mkdir(join(privateDir, "bin"), { recursive: true });
    const archive = join(privateDir, "supabase.tar.gz");
    const response = await fetch(`https://github.com/supabase/cli/releases/download/v${CLI_VERSION}/supabase_${CLI_VERSION}_linux_amd64.tar.gz`, { signal: AbortSignal.timeout(120000) });
    assert.equal(response.status, 200);
    await pipeline(response.body, createWriteStream(archive, { mode: 0o600 }));
    assert.equal((await stat(archive)).size, 62885775); assert.equal(await hash(archive), CLI_SHA256);
    await run("extract-cli", "tar", ["-xzf", archive, "-C", join(privateDir, "bin")]);
    const deadline = Number(process.env.QUALIFICATION_DEADLINE_AT);
    assert.ok(Number.isFinite(deadline) && deadline > Date.now());
    await run("graduation", process.execPath, ["--no-install", "examples/functions-portable/graduate.mjs"], { timeoutMs: Math.min(12 * 60000, deadline - Date.now() - 45000) });
    const projects = await readdir(workRoot); assert.equal(projects.length, 1);
    const demo = JSON.parse(await readFile(join(workRoot, projects[0], "receipt.json"), "utf8"));
    assert.equal(demo.passed, true); assert.equal(demo.route, "sqlite-to-native-supabase");
    assert.equal(demo.sessionsMigrated, false);
    assert.ok(demo.checks.lite.includes("signup-two-users"));
    assert.ok(demo.checks.supabase.includes("same-password-signin"));
    assert.ok(demo.checks.supabase.includes("post-graduation-owned-write"));
    assert.equal(demo.storageOwnership.matched, true); assert.equal(demo.checks.sourceUnchanged, true);
    assert.equal(demo.cleanup.lite, "graceful-exit"); assert.equal(demo.cleanup.supabase, "owned-stack-stopped");
    for (const [name, version, sha256] of SERVICE_PINS) {
      const metadata = JSON.parse(await readFile(join(home, "cache/stack/slim-services", name, version, "linux-amd64/.artifact.json"), "utf8"));
      assert.equal(metadata.format, "supabase-stack-artifact-v3"); assert.equal(metadata.sha256, sha256);
    }
    await verifySources(); assert.ok(!interrupted);
    receipt.demo = demo; receipt.result = "passed";
  } catch (error) { receipt.error = redact(error.stack ?? error); process.exitCode = 1; }
  finally {
    try { await cleanup(); receipt.cleanup = "owned-stack-stop-confirmed"; }
    catch (error) { receipt.result = "failed"; receipt.cleanupError = redact(error); process.exitCode = 1; }
    // The example writes only sanitized operational logs; credentials stay private.
    try {
      for (const project of await readdir(workRoot)) for (const name of ["lite.log", "upgrade.log", "target-status.log", "target-stop.log", "cli-version.log"]) {
        try { await writeFile(join(receiptDir, `${project}-${name}`), redact(await readFile(join(workRoot, project, name), "utf8"))); }
        catch (error) { if (error.code !== "ENOENT") throw error; }
      }
    } catch (error) { if (error.code !== "ENOENT") receipt.logCollectionError = redact(error); }
    await writeFile(join(receiptDir, "result.json"), JSON.stringify(receipt, null, 2) + "\n");
    console.log(JSON.stringify({ result: receipt.result, featureSha: EXPECTED_FEATURE_SHA, cleanup: receipt.cleanup }));
  }
}
if (import.meta.main) main().catch(error => { console.error(redact(error.stack ?? error)); process.exitCode = 1; });
