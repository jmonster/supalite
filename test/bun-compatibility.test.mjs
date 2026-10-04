import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createScaleFixture, cliPath, verifySource } from "./streaming-scale.mjs";
const exec = promisify(execFile);
const versions = [
  ["1.3.11", process.env.BUN_1_3_11],
  ["1.4.2", process.env.BUN_1_4_2],
];

for (const [version, executable] of versions) {
  test(`Bun ${version}: CLI help and real SQLite dry run retain the legacy path`, {
    skip: !executable ? `Set BUN_${version.replaceAll(".", "_")} to the official Bun ${version} executable` : false,
  }, async t => {
    assert.equal((await exec(executable, ["--version"])).stdout.trim(), version);
    const project = await mkdtemp(join(tmpdir(), "lite-bun-compat-"));
    t.after(() => rm(project, { recursive: true, force: true }));
    const fixture = await createScaleFixture(project, { kind: "json", rows: 6, rowBytes: 256 });
    const options = { cwd: project, timeout: 60000, maxBuffer: 1024 * 1024,
      env: { ...process.env, HOME: join(project, "home"), TMPDIR: join(project, "tmp"), NO_COLOR: "1", FORCE_COLOR: "0", SUPABASE_ACCESS_TOKEN: "" },
    };
    const output = {};
    for (const flavor of ["baseline", "streaming"]) {
      const help = await exec(executable, [cliPath(flavor), "--help"], options);
      assert.match(help.stdout, /Usage: lite/);
      assert.doesNotMatch(help.stderr, /No such built-in module/);
      output[flavor] = await exec(executable, [cliPath(flavor), "--no-telemetry", "upgrade", "--target", "local", "--dry-run", "--no-migrate-sessions"], options);
      assert.match(output[flavor].stdout, /data: 6 inserts/);
      assert.match(output[flavor].stdout, /rehearsal passed/);
      await verifySource(project, fixture);
      assert.deepEqual(await readdir(join(project, "tmp")), []);
    }
    assert.equal(output.streaming.stdout, output.baseline.stdout, "Same readiness, audit, rehearsal and counts");
    const helper = new URL("../upstream/lite-0.11.0/dist/cli/sqlite-streaming.js", import.meta.url).href;
    const probe = `
      import assert from 'node:assert/strict';
      import { Database } from 'bun:sqlite';
      import { isNodeSqlite } from ${JSON.stringify(helper)};
      const native = new Database(':memory:');
      assert.equal(isNodeSqlite({dialect:'sqlite',driver:native}), false);
      native.close();
      ${version === "1.4.2" ? `const {DatabaseSync} = await import('node:sqlite');
      const shim = new DatabaseSync(':memory:');
      assert.equal(isNodeSqlite({dialect:'sqlite',driver:shim}), false);
      shim.close();` : ""}
      console.log('BUN_LEGACY_PATH_OK');
    `;
    assert.match((await exec(executable, ["--eval", probe], options)).stdout, /BUN_LEGACY_PATH_OK/);
  });
}
