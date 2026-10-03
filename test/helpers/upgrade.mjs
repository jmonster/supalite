import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
export const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
export const appliedFile = "supabase/migrations/20260101000000_private_records.sql";
export const cliPath = (flavor) => resolve(root, `.generated/${flavor}/node_modules/@supabase/lite/dist/cli/index.js`);

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
export async function fixture(t, { backend = "sqlite-postgres", setup = true } = {}) {
  const project = await mkdtemp(resolve(tmpdir(), "lite-upgrade-contract-"));
  t.after(() => rm(project, { recursive: true, force: true }));
  await cp(resolve(root, "test/fixtures/upgrade-private-records"), project, { recursive: true });
  await mkdir(resolve(project, "home"));
  if (backend !== "sqlite-postgres") {
    const config = await readFile(resolve(project, "supabase/config.toml"), "utf8");
    await writeFile(resolve(project, "supabase/config.toml"), config.replace('driver = "sqlite-postgres"', `driver = "${backend}"`).replace('url = "file:./supabase/fixture.db"', 'url = "./supabase/pglite"'));
  }
  const server = createServer();
  await new Promise((accept, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", accept); });
  const port = server.address().port;
  await new Promise((accept) => server.close(accept));
  const configPath = resolve(project, "supabase/config.toml");
  await writeFile(configPath, (await readFile(configPath, "utf8")) + `\n[api]\nport = ${port}\nexternal_url = "http://127.0.0.1:${port}"\n`);
  await writeFile(resolve(project, "fixture-url.txt"), `http://127.0.0.1:${port}`);
  if (setup) {
    const migration = await run(project, ["migration", "up"], { flavor: "baseline" });
    assert.equal(migration.code, 0, migration.stdout + migration.stderr);
    if (backend === "pglite") {
      const sequences = await run(project, ["db", "query", "SELECT setval('public.z_projects_id_seq', 200), setval('public.a_records_id_seq', 2000)"], { flavor: "baseline" });
      assert.equal(sequences.code, 0, sequences.stdout + sequences.stderr);
    }
    assert.match(await worker(project, "setup"), /FIXTURE_OK/);
  }
  return project;
}
export function jsonResult(result, code = 0) {
  assert.equal(result.code, code, `${result.stdout}\n${result.stderr}`);
  const report = JSON.parse(result.stdout);
  assert.equal(typeof report.summary.upgrade_safe, "boolean");
  return report;
}
