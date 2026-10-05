import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile, access, symlink, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
const exec = promisify(execFile);
const cli = fileURLToPath(new URL("../upstream/lite-0.11.0/dist/cli/index.js", import.meta.url));

async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), "lite-native-dry-run-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const source = join(root, "source"), target = join(root, "target"), directory = join(source, "supabase/functions/tasks");
  await mkdir(directory, { recursive: true });
  const configPath = join(source, "supabase/config.toml");
  await mkdir(join(source, "supabase/migrations"));
  await writeFile(join(source, "supabase/migrations/20261004000000_native_fixture.sql"), "CREATE SCHEMA IF NOT EXISTS demo;\n");
  await writeFile(configPath, 'project_id = "native-dry-run"\n[db]\ndriver = "sqlite-postgres"\nurl = ":memory:"\n[auth]\nenabled = false\n');
  await writeFile(join(directory, "index.ts"), 'export default { fetch: () => new Response("portable") };\n');
  await writeFile(join(directory, "deno.json"), '{"imports":{"@supabase/supabase-js":"npm:@supabase/supabase-js@2.117.2"}}\n');
  return { source, target, directory, configPath };
}
async function dryRun(source, target) {
  try {
    const result = await exec(process.execPath, [cli, "--no-telemetry", "upgrade", "--target", "local", "--local-runtime", "native", "--local-dir", target, "--dry-run", "--json", "--no-migrate-sessions"], { cwd: source, timeout: 60000, env: { ...process.env, HOME: source, NO_COLOR: "1" } });
    return { code: 0, ...result };
  } catch (error) {
    if (typeof error.code !== "number" || error.killed) throw error;
    return { code: error.code, stdout: error.stdout, stderr: error.stderr };
  }
}

test("native JSON dry run reports Functions without source edits or target creation", async t => {
  const f = await fixture(t);
  await writeFile(join(f.source, "supabase/functions/.env"), "OMITTED_FIXTURE_SECRET=fixture\n");
  const config = await readFile(f.configPath, "utf8"), code = await readFile(join(f.directory, "index.ts"), "utf8");
  const result = await dryRun(f.source, f.target);
  assert.equal(result.code, 0, result.stdout + result.stderr);
  const report = JSON.parse(result.stdout);
  assert.equal(report.summary.upgrade_safe, true);
  assert.deepEqual(report.functions, { enabled: true, names: ["tasks"], files: 2, omitted: ["functions/.env"] });
  assert.equal(await readFile(f.configPath, "utf8"), config);
  assert.equal(await readFile(join(f.directory, "index.ts"), "utf8"), code);
  await assert.rejects(access(f.target), { code: "ENOENT" });
});

test("unsupported native Functions source produces structured readiness failure", async t => {
  const f = await fixture(t);
  await symlink(f.configPath, join(f.source, "supabase/functions/external.ts"));
  const config = await readFile(f.configPath, "utf8"), result = await dryRun(f.source, f.target);
  assert.equal(result.code, 1, result.stdout + result.stderr);
  const report = JSON.parse(result.stdout);
  assert.equal(report.summary.upgrade_safe, false);
  assert.equal(report.rehearsal, null);
  assert.equal(report.errors[0].phase, "readiness");
  assert.match(report.errors[0].message, /symlink is unsupported/);
  assert.equal(await readFile(f.configPath, "utf8"), config);
  await assert.rejects(access(f.target), { code: "ENOENT" });
});
