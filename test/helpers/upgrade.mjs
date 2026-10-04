import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { cp, mkdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
export const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
export const appliedFile = "supabase/migrations/20260101000000_private_records.sql";
export const cliPath = (flavor) => resolve(root, flavor === "baseline" ? "node_modules/@supabase/lite/dist/cli/index.js" : "upstream/lite-0.11.0/dist/cli/index.js");

export async function run(project, args, { flavor = "upgrade", timeout = 60000 } = {}) {
  try {
    const result = await execFileAsync(process.execPath, [cliPath(flavor), "--no-telemetry", ...args], {
      cwd: project,
      env: { ...process.env, HOME: resolve(project, "home"), NO_COLOR: "1", FORCE_COLOR: "0", SUPABASE_ACCESS_TOKEN: "" },
      timeout, maxBuffer: 4 * 1024 * 1024,
    });
    return { ...result, code: 0 };
  } catch (error) {
    if (typeof error.code !== "number" || error.killed) throw error;
    return { stdout: error.stdout, stderr: error.stderr, code: error.code };
  }
}
export const dryRun = (project, { json = true, flavor = "upgrade" } = {}) => run(project,
  ["upgrade", "--target", "local", "--dry-run", "--no-migrate-sessions", ...(json ? ["--json"] : [])], { flavor });
export async function worker(project, command) {
  const result = await execFileAsync(process.execPath, [resolve(root, "test/upgrade/fixture-worker.mjs"), command], {
    cwd: project, env: { ...process.env, HOME: resolve(project, "home"), NO_COLOR: "1" }, timeout: 60000, maxBuffer: 4 * 1024 * 1024,
  });
  return result.stdout;
}
export async function fixture(t) {
  const project = await mkdtemp(resolve(tmpdir(), "lite-upgrade-contract-"));
  t.after(() => rm(project, { recursive: true, force: true }));
  await cp(resolve(root, "test/fixtures/upgrade-private-records"), project, { recursive: true });
  await mkdir(resolve(project, "home"));
  const migration = await run(project, ["migration", "up"], { flavor: "baseline" });
  assert.equal(migration.code, 0, migration.stdout + migration.stderr);
  assert.match(await worker(project, "setup"), /FIXTURE_OK/);
  return project;
}
export function jsonResult(result, code = 0) {
  assert.equal(result.code, code, `${result.stdout}\n${result.stderr}`);
  const report = JSON.parse(result.stdout);
  assert.equal(typeof report.summary.upgrade_safe, "boolean");
  return report;
}
