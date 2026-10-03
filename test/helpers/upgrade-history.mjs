import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { patchUpgradeHistory } from "../../scripts/patch-upgrade-history.mjs";

const exec = promisify(execFile);
export const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
export const appliedFile = "supabase/migrations/20260101000000_records.sql";
export const packageRoot = (flavor) => resolve(root, `.generated/${flavor}/node_modules/@supabase/lite`);

export async function run(project, args, flavor = "upgrade-history") {
  try {
    return { code: 0, ...await exec(process.execPath,
      [resolve(packageRoot(flavor), "dist/cli/index.js"), "--no-telemetry", ...args],
      { cwd: project, env: env(project), timeout: 90000, maxBuffer: 4 * 1024 * 1024 }) };
  } catch (error) {
    if (typeof error.code !== "number" || error.killed) throw error;
    return { code: error.code, stdout: error.stdout, stderr: error.stderr };
  }
}
export const dryRun = (project, flavor) => run(project,
  ["upgrade", "--target", "local", "--dry-run", "--no-migrate-sessions"], flavor);
const env = (project) => ({ ...process.env, HOME: resolve(project, "home"), NO_COLOR: "1", FORCE_COLOR: "0", SUPABASE_ACCESS_TOKEN: "" });
export async function worker(project, command, flavor = "upgrade-history") {
  const result = await exec(process.execPath, [resolve(root, "test/upgrade/history-worker.mjs"), command, flavor],
    { cwd: project, env: env(project), timeout: 90000, maxBuffer: 4 * 1024 * 1024 });
  const line = result.stdout.split("\n").find((line) => line.startsWith("RESULT:"));
  assert.ok(line, result.stdout);
  return JSON.parse(line.slice(7));
}
export async function fixture(t, backend) {
  const project = await mkdtemp(resolve(tmpdir(), "lite-upgrade-history-"));
  t.after(() => rm(project, { recursive: true, force: true }));
  await cp(resolve(root, "test/fixtures/upgrade-history"), project, { recursive: true });
  await mkdir(resolve(project, "home"));
  await writeFile(resolve(project, "supabase/config.toml"), `project_id = "upgrade-history"
[db]
driver = "${backend}"
url = "${backend === "pglite" ? "./supabase/pglite" : "file:./supabase/fixture.db"}"
[auth]
enabled = true
jwt_secret = "fixture-only-history-a4c6117915ca4b2fac71acdb"
[storage]
enabled = false
[realtime]
enabled = false
`);
  const result = await run(project, ["migration", "up"], "baseline");
  assert.equal(result.code, 0, result.stdout + result.stderr);
  await worker(project, "setup");
  return project;
}

// Read-only testing bridge to the shipped internal exporter and runner. The
// candidate CLI itself is exercised separately, with its entry point intact.
export async function prepareTestBridge(flavor) {
  const source = await readFile(resolve(packageRoot(flavor), "dist/cli/index.js"), "utf8");
  const original = await readFile(resolve(root, "upstream/lite-0.11.0/dist/cli/index.js"), "utf8");
  assert.equal(source, flavor === "baseline" ? original : patchUpgradeHistory(original));
  const entry = 'process.on("unhandledRejection",e=>{if(!Rn(e))throw e});process.on("uncaughtException",e=>{Rn(e)||(console.error(e),$n(true,e).finally(()=>process.exit(1)));});NC().then(null).catch(async e=>{Rn(e)||(console.error(e),await $n(true,e),process.exitCode=1);});';
  assert.equal(source.split(entry).length - 1, 1);
  await writeFile(resolve(packageRoot(flavor), "dist/cli/test-upgrade-api.js"),
    source.replace(entry, `oo();Rc();Dh();Xh();
export { Ph as collectUpgradeSource, co as exportUserData, Ih as rehearseUpgrade, Lc as runUpgrade };
export const authSetupSql = [Ti, no()];`));
}
