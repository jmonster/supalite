import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile, readdir, symlink, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  NATIVE_CLI_VERSION, resolveLocalRuntime, nativeCommand, parseNativeStatus, assertNativeStopped,
  requireFreshLocalDirectory, inspectFunctionUpgrade, copyFunctions, functionConfigToml, writeLocalCredentials,
} from "../upstream/lite-0.11.0/dist/cli/upgrade-local-runtime.js";

async function fixture(t) {
  const parent = await mkdtemp(join(tmpdir(), "lite-native-upgrade-"));
  t.after(() => rm(parent, { recursive: true, force: true }));
  const source = join(parent, "source"), target = join(parent, "target"), directory = join(source, "supabase");
  await mkdir(join(directory, "functions", "tasks"), { recursive: true });
  await mkdir(join(directory, "functions", "_shared"), { recursive: true });
  await writeFile(join(directory, "config.toml"), "project_id = 'source'\n");
  await writeFile(join(directory, "functions/tasks/index.ts"), 'import { value } from "../_shared/value.ts"; export default { fetch: () => new Response(value) };\n');
  await writeFile(join(directory, "functions/_shared/value.ts"), 'export const value = "portable";\n');
  await writeFile(join(directory, "functions/tasks/deno.json"), JSON.stringify({ imports: { "@supabase/supabase-js": "npm:@supabase/supabase-js@2.117.2" } }));
  return { parent, source, target, directory, configPath: join(directory, "config.toml") };
}

test("native is explicit and official commands never silently fall back", () => {
  assert.equal(resolveLocalRuntime(undefined, "local"), "legacy");
  assert.equal(resolveLocalRuntime("native", "local"), "native");
  assert.throws(() => resolveLocalRuntime("native", "hosted"), /only applies/);
  assert.throws(() => resolveLocalRuntime("auto", "local"), /unknown local runtime/);
  assert.equal(NATIVE_CLI_VERSION, "2.119.0");
  assert.deepEqual(nativeCommand("start", "/target", { functions: true, storage: true }), ["stack", "start", "--workdir", "/target", "--runtime", "native", "--eager", "--exclude", "realtime,studio,mail,analytics,pooler", "--output-format", "json"]);
  assert.ok(nativeCommand("start", "/target").includes("realtime,studio,mail,analytics,pooler,storage,functions"));
  assert.deepEqual(nativeCommand("stop", "/target"), ["stack", "stop", "--workdir", "/target", "--output-format", "json"]);
});

test("native status prefers publishable keys, retains Storage JWT, and accepts absent signing secret", () => {
  const env = { API_URL: "http://127.0.0.1:54321", DB_URL: "postgresql://postgres:fixture@127.0.0.1:54322/postgres", PUBLISHABLE_KEY: "sb_publishable_fixture", SECRET_KEY: "sb_secret_fixture", ANON_KEY: "legacy-anon", SERVICE_ROLE_KEY: "legacy-service" };
  const parsed = parseNativeStatus(JSON.stringify({ result: { runtime: "native", readiness: "ready", env } }));
  assert.equal(parsed.anonKey, env.PUBLISHABLE_KEY);
  assert.equal(parsed.serviceRoleKey, env.SERVICE_ROLE_KEY);
  assert.equal(parsed.secretKey, env.SECRET_KEY);
  assert.equal(parsed.jwtSecret, undefined);
  delete env.PUBLISHABLE_KEY; delete env.SECRET_KEY;
  assert.equal(parseNativeStatus(JSON.stringify({ runtime: "native", readiness: "ready", env })).anonKey, "legacy-anon");
  assert.throws(() => parseNativeStatus(JSON.stringify({ runtime: "native", readiness: "ready", env: { ...env, API_URL: "https://example.test" } })), /non-loopback/);
  assert.throws(() => parseNativeStatus('{"runtime":"native","readiness":"ready"}'), /env map/);
  for (const invalid of [{ runtime: "docker", readiness: "ready" }, { runtime: "native", readiness: "starting" }, {}])
    assert.throws(() => parseNativeStatus(JSON.stringify({ ...invalid, env })), /runtime=native and readiness=ready/);
});

test("fresh local destination rejects source, nonempty targets and symlink aliases", async t => {
  const f = await fixture(t);
  await requireFreshLocalDirectory(f.target, f.source);
  await assert.rejects(requireFreshLocalDirectory(f.source, f.source), /outside/);
  await assert.rejects(requireFreshLocalDirectory(join(f.source, "nested"), f.source), /outside/);
  await assert.rejects(requireFreshLocalDirectory(f.parent, f.source), /cannot contain/);
  await mkdir(f.target); await writeFile(join(f.target, "keep.txt"), "unchanged");
  await assert.rejects(requireFreshLocalDirectory(f.target, f.source), /never overwritten/);
  const alias = join(f.parent, "alias"); await symlink(f.source, alias);
  await assert.rejects(requireFreshLocalDirectory(join(alias, "target"), f.source), /symlink/);
  assert.equal(await readFile(join(f.target, "keep.txt"), "utf8"), "unchanged");
});

test("Functions copy preserves code/shared/Deno settings, omits secrets, and never overwrites", async t => {
  const f = await fixture(t);
  await writeFile(join(f.directory, "functions/.env"), "PRIVATE_SECRET=do-not-copy\n");
  const plan = await inspectFunctionUpgrade({ functions: { tasks: { verify_jwt: true, env: { PRIVATE_SECRET: "do-not-copy" } } } }, f.configPath);
  assert.equal(plan.enabled, true);
  assert.deepEqual(plan.omitted.sort(), ["functions.tasks.env", "functions/.env"].sort());
  assert.equal(plan.files.length, 3);
  assert.equal(plan.functions.tasks.verify_jwt, true);
  assert.match(functionConfigToml(plan), /\[functions.tasks\]\n.*enabled = true\nverify_jwt = true\nentrypoint = "functions\/tasks\/index.ts"/s);
  await copyFunctions(plan, f.target);
  for (const file of plan.files) assert.deepEqual(await readFile(join(f.target, "supabase", file.relative)), await readFile(file.path));
  assert.deepEqual((await readdir(join(f.target, "supabase/functions"))).sort(), ["_shared", "tasks"]);
  await assert.rejects(copyFunctions(plan, f.target), /EEXIST/);
  assert.match(await readFile(join(f.directory, "functions/.env"), "utf8"), /PRIVATE_SECRET/);
});

test("configured import map and alternate in-tree entrypoint are preserved", async t => {
  const f = await fixture(t);
  await writeFile(join(f.directory, "functions/import_map.json"), JSON.stringify({ imports: { "shared/": "./_shared/" } }));
  const plan = await inspectFunctionUpgrade({ functions: { tasks: { entrypoint: "functions/tasks/index.ts", import_map: "functions/import_map.json", verify_jwt: false } } }, f.configPath);
  assert.equal(plan.functions.tasks.import_map, "functions/import_map.json");
  assert.equal(plan.functions.tasks.verify_jwt, false);
  await copyFunctions(plan, f.target);
  assert.ok((await readFile(join(f.target, "supabase/functions/import_map.json"), "utf8")).includes("shared/"));
});

for (const kind of ["file", "directory"]) test(`Functions rejects ${kind} symlinks before destination writes`, async t => {
  const f = await fixture(t);
  await symlink(kind === "file" ? join(f.directory, "config.toml") : f.directory, join(f.directory, "functions", `linked-${kind}`));
  await assert.rejects(inspectFunctionUpgrade({}, f.configPath), /symlink/);
  await assert.rejects(readdir(f.target), /ENOENT/);
});

test("Functions rejects external entrypoints, escaping import maps, assets and JSONC", async t => {
  const f = await fixture(t);
  await assert.rejects(inspectFunctionUpgrade({ functions: { tasks: { entrypoint: "../outside.ts" } } }, f.configPath), /entrypoint must remain/);
  await writeFile(join(f.directory, "functions/tasks/deno.json"), JSON.stringify({ imports: { "external": "../../../outside.ts" } }));
  await assert.rejects(inspectFunctionUpgrade({}, f.configPath), /mapping leaves/);
  await writeFile(join(f.directory, "functions/tasks/deno.json"), '{}');
  await writeFile(join(f.directory, "functions/tasks/secret.json"), '{}');
  await assert.rejects(inspectFunctionUpgrade({}, f.configPath), /unsupported Functions asset/);
  await rm(join(f.directory, "functions/tasks/secret.json"));
  await writeFile(join(f.directory, "functions/tasks/deno.jsonc"), '{}');
  await assert.rejects(inspectFunctionUpgrade({}, f.configPath), /unsupported Functions asset/);
});

test("changed Function source fails closed before copying anything", async t => {
  const f = await fixture(t), plan = await inspectFunctionUpgrade({}, f.configPath);
  await writeFile(join(f.directory, "functions/_shared/value.ts"), 'export const value = "changed";\n');
  await assert.rejects(copyFunctions(plan, f.target), /source changed/);
  await assert.rejects(readdir(f.target), /ENOENT/);
});

test("disabled functions and edge runtime stay disabled", async t => {
  const f = await fixture(t);
  const plan = await inspectFunctionUpgrade({ edge_runtime: { enabled: false }, functions: { tasks: { enabled: false, verify_jwt: false } } }, f.configPath);
  assert.equal(plan.enabled, false); assert.equal(plan.functions.tasks.enabled, false);
});

test("new source files and newly introduced symlinks invalidate the reviewed snapshot", async t => {
  const f = await fixture(t), plan = await inspectFunctionUpgrade({}, f.configPath);
  const added = join(f.directory, "functions/tasks/added.ts");
  await writeFile(added, "export {};\n");
  await assert.rejects(copyFunctions(plan, f.target), /source changed/);
  await rm(added);
  const original = join(f.directory, "functions/_shared/value.ts");
  await rm(original); await symlink(join(f.directory, "functions/tasks/index.ts"), original);
  await assert.rejects(copyFunctions(plan, f.target), /symlink/);
  await assert.rejects(readdir(f.target), /ENOENT/);
});

test("missing entrypoints and unsupported Deno dependency layouts fail readiness", async t => {
  const f = await fixture(t);
  await assert.rejects(inspectFunctionUpgrade({ functions: { absent: {} } }, f.configPath), /entrypoint is missing/);
  for (const config of [{ workspace: ["../project"] }, { imports: { private: "https://user:secret@example.test/module.ts" } }, { nodeModulesDir: "auto" }, { lock: "deno.lock" }]) {
    await writeFile(join(f.directory, "functions/tasks/deno.json"), JSON.stringify(config));
    await assert.rejects(inspectFunctionUpgrade({}, f.configPath), /unsupported|unsupported import target/);
  }
});


test("credential files are owner-only and never overwrite existing files", async t => {
  const f = await fixture(t), path = join(f.parent, "credentials.json");
  await writeLocalCredentials(path, '{"private":"fixture"}');
  assert.equal((await stat(path)).mode & 0o777, 0o600);
  await assert.rejects(writeLocalCredentials(path, "overwrite"), /EEXIST/);
  assert.equal(await readFile(path, "utf8"), '{"private":"fixture"}');
});


test("native stop requires an explicit one-stack acknowledgment and no unavailable owners", () => {
  assertNativeStopped(JSON.stringify({ stopped: ["owned-stack"], unavailable: [] }));
  assertNativeStopped(JSON.stringify({ result: { stopped: ["owned-stack"], unavailable: [] } }));
  for (const output of [{ stopped: [], unavailable: ["owned-stack"] }, { stopped: [], unavailable: [] }, { stopped: ["a", "b"], unavailable: [] }, { stopped: ["owned-stack"], unavailable: ["other"] }, {}, null])
    assert.throws(() => assertNativeStopped(JSON.stringify(output)), /cleanup was not confirmed/);
  assert.throws(() => assertNativeStopped("not json"), /invalid JSON/);
});
