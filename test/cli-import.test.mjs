import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readdir, rm, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const exec = promisify(execFile);
const cli = new URL("../upstream/lite-0.11.0/dist/cli/index.js", import.meta.url);

test("importing upgrade operations does not dispatch the CLI or change process handlers", async t => {
  const cwd = await mkdtemp(join(tmpdir(), "lite-cli-import-"));
  t.after(() => rm(cwd, { recursive: true, force: true }));
  const script = `
    import assert from 'node:assert/strict';
    const exit = process.exit;
    const rejection = process.listeners('unhandledRejection');
    const exception = process.listeners('uncaughtException');
    const api = await import(${JSON.stringify(cli.href)});
    assert.equal(process.exit, exit);
    assert.deepEqual(process.listeners('unhandledRejection'), rejection);
    assert.deepEqual(process.listeners('uncaughtException'), exception);
    for (const name of ['collectUpgradeSource', 'exportUserData', 'exportAuth', 'formatSqlValue', 'reconstructSchema', 'upgradeSchema', 'readiness', 'audit', 'rehearseUpgrade', 'runUpgrade', 'validateRows', 'authSetupSql']) assert.equal(typeof api[name], 'function');
    assert.equal(api.authSetupSql().length, 2);
    for (const sql of api.authSetupSql()) assert.equal(typeof sql, 'string');
    assert.equal(api.formatSqlValue("O'Brien", 'text'), "'O''Brien'");
    console.log('IMPORT_OK');
  `;
  const result = await exec(process.execPath, ["--input-type=module", "--eval", script], { cwd, timeout: 10000, env: { ...process.env, HOME: cwd } });
  assert.equal(result.stdout, "IMPORT_OK\n");
  assert.equal(result.stderr, "");
  assert.deepEqual(await readdir(cwd), []);
});

for (const symlinked of [false, true]) {
  test(`CLI ${symlinked ? 'bin symlink' : 'direct entry'} keeps help, version and invalid-command behavior`, async t => {
    const cwd = await mkdtemp(join(tmpdir(), "lite-cli-entry-"));
    t.after(() => rm(cwd, { recursive: true, force: true }));
    let entry = fileURLToPath(cli);
    if (symlinked) {
      entry = join(cwd, "lite");
      await symlink(fileURLToPath(cli), entry);
    }
    const options = { cwd, timeout: 15000, env: { ...process.env, HOME: cwd, NO_COLOR: '1' } };
    assert.match((await exec(process.execPath, [entry, '--no-telemetry', '--help'], options)).stdout, /Usage: lite/);
    assert.match((await exec(process.execPath, [entry, '--no-telemetry', '--version'], options)).stdout, /0\.11\.0/);
    await assert.rejects(exec(process.execPath, [entry, '--no-telemetry', 'no-such-command'], options), error => error.code === 1 && /unknown command/.test(error.stderr));
  });
}
