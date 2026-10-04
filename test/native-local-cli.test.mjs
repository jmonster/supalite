import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile, rm, chmod } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { LocalSupabaseTarget } from "../upstream/lite-0.11.0/dist/cli/index.js";
import { inspectFunctionUpgrade } from "../upstream/lite-0.11.0/dist/cli/upgrade-local-runtime.js";
const exec = promisify(execFile);

async function fixture(t, { failStart = false, version = "2.119.0" } = {}) {
  const root = await mkdtemp(join(tmpdir(), "lite-native-cli-"));
  const source = join(root, "source"), target = join(root, "target"), log = join(root, "commands.jsonl");
  await mkdir(join(source, "supabase/functions/tasks"), { recursive: true });
  await writeFile(join(source, "supabase/functions/tasks/index.ts"), 'export default { fetch: () => new Response("portable") };\n');
  await writeFile(join(source, "supabase/functions/tasks/deno.json"), '{}');
  await writeFile(join(source, "supabase/config.toml"), 'project_id = "source"\n');
  const script = join(root, "fake-cli.mjs"), stopControl = join(root, "stop.json");
  await writeFile(stopControl, JSON.stringify({ code: 0, output: { stopped: ["owned-stack"], unavailable: [] } }));
  await writeFile(script, `
    import { appendFile, mkdir, writeFile, readFile } from 'node:fs/promises';
    import { join } from 'node:path';
    const invoked = process.argv.slice(2), args = invoked[0] === '--bun' ? invoked.slice(2) : invoked;
    await appendFile(${JSON.stringify(log)}, JSON.stringify({ args, invoked, experimental: process.env.SUPABASE_EXPERIMENTAL_STACK }) + '\\n');
    if (args[0] === '--version') { console.log(${JSON.stringify(version)}); process.exit(0); }
    const workdir = args[args.indexOf('--workdir') + 1];
    if (args[0] === 'init') { await mkdir(join(workdir, 'supabase'), { recursive: true }); await writeFile(join(workdir, 'supabase/config.toml'), 'project_id = "generated"\\n[auth]\\nenabled = true\\n'); }
    else if (args[1] === 'status' || args[0] === 'status') console.log(JSON.stringify({ runtime: 'native', readiness: 'ready', env: {
      API_URL:'http://127.0.0.1:54001', DB_URL:'postgresql://postgres:fake@127.0.0.1:54002/postgres',
      PUBLISHABLE_KEY:'sb_publishable_fixture', SECRET_KEY:'sb_secret_fixture', SERVICE_ROLE_KEY:'legacy-service-role-jwt', ANON_KEY:'legacy-anon', JWT_SECRET:'fixture-signing-secret',
    } }));
    else if (args[1] === 'stop') {
      const response = JSON.parse(await readFile(${JSON.stringify(stopControl)}, 'utf8'));
      console.log(typeof response.output === 'string' ? response.output : JSON.stringify(response.output));
      if (response.code) { console.error('fixture stop failed'); process.exit(response.code); }
    }
    else if (args[1] === 'start' && ${JSON.stringify(failStart)}) { console.error('fixture launch refused'); process.exit(1); }
  `);
  const old = process.env.LITE_SUPABASE_CLI;
  process.env.LITE_SUPABASE_CLI = `${process.execPath} ${script}`;
  t.after(async () => { if (old === undefined) delete process.env.LITE_SUPABASE_CLI; else process.env.LITE_SUPABASE_CLI = old; await rm(root, { recursive: true, force: true }); });
  return { root, script, stopControl, source, target, log, commands: async () => (await readFile(log, "utf8")).trim().split("\n").map(JSON.parse) };
}

test("native local target uses official stack lifecycle and preserves supported config", async t => {
  const f = await fixture(t);
  const sourceConfig = {
    auth: { enabled: true, site_url: "http://localhost:3000", jwt_secret: "source-secret-never-copy", publishable_key: "source-key-never-copy", enable_anonymous_sign_ins: true, email: { enable_confirmations: false } },
    functions: { tasks: { verify_jwt: true } }, edge_runtime: { policy: "oneshot" }, api: { max_rows: 123 },
  };
  const functions = await inspectFunctionUpgrade(sourceConfig, join(f.source, "supabase/config.toml"));
  const target = await LocalSupabaseTarget.start({ runtime: "native", workdir: f.target, sourceDirectory: f.source, sourceConfig, functions, storage: { globalLimit: 1024 }, cleanupOnStop: false });
  assert.equal(target.status.anonKey, "sb_publishable_fixture");
  assert.equal(target.status.serviceRoleKey, "legacy-service-role-jwt");
  const config = await readFile(join(f.target, "supabase/config.toml"), "utf8");
  assert.match(config, /major_version = 17/);
  assert.match(config, /\[storage\][\s\S]*?enabled = true/);
  assert.match(config, /\[edge_runtime\][\s\S]*?enabled = true/);
  assert.match(config, /policy = "oneshot"/);
  assert.match(config, /\[local_smtp\][\s\S]*?enabled = false/);
  assert.match(config, /\[functions.tasks\][\s\S]*?verify_jwt = true/);
  assert.match(config, /enable_anonymous_sign_ins = true/);
  assert.match(config, /enable_confirmations = false/);
  assert.ok(!config.includes("source-secret-never-copy") && !config.includes("source-key-never-copy"));
  assert.equal(await readFile(join(f.target, "supabase/functions/tasks/index.ts"), "utf8"), await readFile(join(f.source, "supabase/functions/tasks/index.ts"), "utf8"));
  await target.stop(); await target.stop();
  const commands = await f.commands();
  assert.deepEqual(commands.map(command => command.args.slice(0, 2)), [["--version"], ["init", "--workdir"], ["stack", "start"], ["stack", "status"], ["stack", "stop"]]);
  assert.ok(commands.every(command => command.experimental === "1"));
  assert.ok(commands[2].args.includes("--eager"));
  assert.ok(!commands.at(-1).args.includes("--all") && !commands.at(-1).args.includes("--no-backup"));
});

test("native launch failure stops only the owned stack and leaves source unchanged", async t => {
  const f = await fixture(t, { failStart: true });
  await assert.rejects(LocalSupabaseTarget.start({ runtime: "native", workdir: f.target, sourceDirectory: f.source, cleanupOnStop: false }), /fixture launch refused/);
  const commands = await f.commands();
  assert.deepEqual(commands.at(-1).args, ["stack", "stop", "--workdir", f.target, "--output-format", "json"]);
  assert.match(await readFile(join(f.source, "supabase/functions/tasks/index.ts"), "utf8"), /portable/);
});

test("native version mismatch fails before initialization", async t => {
  const f = await fixture(t, { version: "2.98.1" });
  await assert.rejects(LocalSupabaseTarget.start({ runtime: "native", workdir: f.target, sourceDirectory: f.source }), /2\.119\.0/);
  assert.deepEqual((await f.commands()).map(command => command.args), [["--version"]]);
});

test("public upgrade help exposes opt-in native runtime", async () => {
  const cli = fileURLToPath(new URL("../upstream/lite-0.11.0/dist/cli/index.js", import.meta.url));
  const { stdout } = await exec(process.execPath, [cli, "--no-telemetry", "upgrade", "--help"], { timeout: 15000 });
  assert.match(stdout, /--local-runtime <runtime>/);
  assert.match(stdout, /legacy.*native/);
});


test("legacy remains the default with unchanged commands and disabled Functions", async t => {
  const f = await fixture(t);
  const target = await LocalSupabaseTarget.start({ workdir: f.target, cleanupOnStop: false });
  assert.equal(target.runtime, "legacy");
  assert.equal(target.status.anonKey, "legacy-anon");
  const config = await readFile(join(f.target, "supabase/config.toml"), "utf8");
  assert.match(config, /major_version = 15/);
  assert.match(config, /\[studio\][\s\S]*?enabled = true/);
  assert.match(config, /\[edge_runtime\][\s\S]*?enabled = false/);
  await target.stop();
  const commands = await f.commands();
  assert.deepEqual(commands.map(command => command.args[0]), ["init", "start", "status", "stop"]);
  assert.ok(commands.at(-1).args.includes("--no-backup"));
});


test("public native flags reject hosted use and missing fresh target before launching anything", async t => {
  const f = await fixture(t), cli = fileURLToPath(new URL("../upstream/lite-0.11.0/dist/cli/index.js", import.meta.url));
  for (const [target, message] of [["hosted", /only applies to --target local/], ["local", /requires --local-dir/]]) {
    await assert.rejects(exec(process.execPath, [cli, "--no-telemetry", "upgrade", "--target", target, "--local-runtime", "native", "--config", join(f.source, "supabase/config.toml"), "--force"], { timeout: 15000 }), error => error.code === 1 && message.test(error.stdout + error.stderr));
  }
  await assert.rejects(readFile(f.log), /ENOENT/);
  assert.equal(await readFile(join(f.source, "supabase/config.toml"), "utf8"), 'project_id = "source"\n');
});


for (const response of [
  { code: 1, output: { stopped: [], unavailable: [] } },
  { code: 0, output: { stopped: [], unavailable: ["owned-stack"] } },
  { code: 0, output: { stopped: [], unavailable: [] } },
  { code: 0, output: "not-json" },
]) test(`native stop failure is visible and retryable: ${JSON.stringify(response)}`, async t => {
  const f = await fixture(t);
  const target = await LocalSupabaseTarget.start({ runtime: "native", workdir: f.target, sourceDirectory: f.source, cleanupOnStop: true });
  await writeFile(f.stopControl, JSON.stringify(response));
  await assert.rejects(target.stop(), /failed|not confirmed/);
  assert.equal(target.stopped, false);
  assert.ok(await readFile(join(f.target, "supabase/config.toml"), "utf8"));
  await writeFile(f.stopControl, JSON.stringify({ code: 0, output: { stopped: ["owned-stack"], unavailable: [] } }));
  await target.stop();
  assert.equal(target.stopped, true);
  await assert.rejects(readFile(join(f.target, "supabase/config.toml")), /ENOENT/);
});

test("startup failure reports both original and unconfirmed cleanup, retaining target files", async t => {
  const f = await fixture(t, { failStart: true });
  await writeFile(f.stopControl, JSON.stringify({ code: 0, output: { stopped: [], unavailable: ["owned-stack"] } }));
  await assert.rejects(LocalSupabaseTarget.start({ runtime: "native", workdir: f.target, sourceDirectory: f.source, cleanupOnStop: true }), error => error instanceof AggregateError && /fixture launch refused/.test(error.message) && /Cleanup was not confirmed/.test(error.message));
  assert.ok(await readFile(join(f.target, "supabase/config.toml"), "utf8"));
});

test("native default launcher passes --bun before the pinned package", async t => {
  const f = await fixture(t), bin = join(f.root, "bin"), previousPath = process.env.PATH;
  await mkdir(bin);
  const launcher = join(bin, "bunx");
  await writeFile(launcher, `#!/bin/sh\nexec "${process.execPath}" "${f.script}" "$@"\n`);
  await chmod(launcher, 0o755);
  delete process.env.LITE_SUPABASE_CLI;
  process.env.PATH = `${bin}:${previousPath}`;
  t.after(() => { process.env.PATH = previousPath; });
  const target = await LocalSupabaseTarget.start({ runtime: "native", workdir: f.target, sourceDirectory: f.source, cleanupOnStop: false });
  await target.stop();
  assert.ok((await f.commands()).every(command => command.invoked[0] === "--bun" && command.invoked[1] === "supabase@2.119.0"));
});
