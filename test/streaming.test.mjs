import test from "node:test";
import { createScaleFixture, cliPath, verifySource } from "./streaming-scale.mjs";
import { spawn } from "node:child_process";
import { once } from "node:events";
import assert from "node:assert/strict";
import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { PGlite } from "@electric-sql/pglite";
import { createHarness } from "./helpers/lite.mjs";
import { upgradeApi, migration, materialize } from "./helpers/upgrade-streaming.mjs";
import { isNodeSqlite, sqlBatches, upgradeRows } from "../upstream/lite-0.11.0/dist/cli/sqlite-streaming.js";
const baseline = await upgradeApi("legacy"), candidate = await upgradeApi();
const nativeNode = { skip: process.versions.bun ? "requires native Node SQLite" : false };
const ddl = `CREATE TABLE z_parents (id serial PRIMARY KEY, label text, json_value jsonb, fixed varchar(200), stamp timestamp);
CREATE TABLE a_children (id serial PRIMARY KEY, parent_id integer REFERENCES z_parents(id), doubled integer GENERATED ALWAYS AS (id * 2) STORED);
CREATE TABLE empty_rows (id integer PRIMARY KEY);`;
const source = migration(ddl);
const quote = value => `'${value.replace(/'/g, "''")}'`;
async function seed(connection) {
  await connection.exec(`INSERT INTO z_parents (id,label,json_value,fixed,stamp) VALUES (11,${quote("O'Brien\\\n雪😀")},'{"nested":[1,true,null]}','word','2026-01-01 12:30:00'),(20,'second','null',NULL,NULL)`);
  await connection.exec("INSERT INTO a_children (id,parent_id) VALUES (100,11)");
}

// Run CLI subprocess checks before the in-process database fixtures.
for (const signal of ["SIGINT", "SIGTERM"]) {
  test(`${signal}: actual CLI exits with a live source cursor and releases the source`, { skip: nativeNode.skip || (process.platform === "win32" ? "POSIX signal behavior" : false) }, async t => {
    const project = await mkdtemp(join(tmpdir(), "lite-direct-cli-cancel-"));
    t.after(() => rm(project, { recursive: true, force: true }));
    const fixture = await createScaleFixture(project, { rows: 384 });
    const preload = join(project, "sink-pause.mjs");
    await writeFile(preload, `
      import { PGlite } from ${JSON.stringify(import.meta.resolve("@electric-sql/pglite"))};
      import { DatabaseSync } from 'node:sqlite';
      const exec=PGlite.prototype.exec;
      let paused=false;
      PGlite.prototype.exec=async function(sql,...args) {
        if(!paused && sql.startsWith('INSERT INTO "app".')) {
          paused=true;
          process.stderr.write('DIRECT_SINK_WAITING\\n');
          await new Promise(resolve=>setTimeout(resolve,30000));
        }
        return exec.call(this,sql,...args);
      };
    `);
    const child = spawn(process.execPath, ["--import", preload, cliPath("streaming"), "--no-telemetry", "upgrade", "--target", "local", "--dry-run", "--no-migrate-sessions"], {
      cwd: project, env: { ...process.env, HOME: join(project, "home"), TMPDIR: join(project, "tmp"), NO_COLOR: "1", SUPABASE_ACCESS_TOKEN: "" },
      stdio: ["ignore", "pipe", "pipe"],
    });
    t.after(() => { if (child.exitCode === null && child.signalCode === null) child.kill("SIGKILL"); });
    let stdout = "", stderr = "";
    child.stdout.on("data", chunk => { stdout += chunk; });
    const finished = once(child, "exit");
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error(`CLI did not reach direct sink: ${stdout}\n${stderr}`)), 30000);
      child.stderr.on("data", chunk => {
        stderr += chunk;
        if (stderr.includes("DIRECT_SINK_WAITING")) { clearTimeout(timeout); resolve(); }
      });
      child.once("exit", () => { clearTimeout(timeout); reject(new Error(`CLI exited before cancellation: ${stdout}\n${stderr}`)); });
    });
    assert.deepEqual(await readdir(join(project, "tmp")), []);
    child.kill(signal);
    const timeout = setTimeout(() => child.kill("SIGKILL"), 5000);
    const [code, receivedSignal] = await finished;
    clearTimeout(timeout);
    assert.equal(receivedSignal, signal, `CLI preserves native signal termination: ${code}; ${stderr}`);
    assert.doesNotMatch(stdout, /rehearsal passed|Upgrade complete/);
    const sourceDb = new DatabaseSync(join(project, "supabase/source.db"));
    try { sourceDb.exec("PRAGMA busy_timeout=1; BEGIN EXCLUSIVE; ROLLBACK"); }
    finally { sourceDb.close(); }
    await verifySource(project, fixture);
  });
}

for (const backend of ["node", "libsql", "pglite"]) {
  test(`${backend}: native/legacy exact SQL and readiness/audit/rehearsal parity with read-only source`, backend === "node" ? nativeNode : {}, async () => {
    const { app, connection, close } = await createHarness({ backend, ddl });
    let data;
    try {
      await seed(connection);
      assert.equal(isNodeSqlite(connection), backend === "node");
      const snapshot = (await connection.exec("SELECT * FROM z_parents ORDER BY id")).rows;
      const expected = await baseline.exportUserData(app, source);
      data = await candidate.exportUserData(app, source);
      assert.deepEqual(await materialize(data), expected);
      await data?.dispose?.();
      assert.deepEqual(data.map(value => value.table), ["z_parents", "a_children"]);
      if (backend === "node") {
        assert.equal(Array.isArray(data[0].inserts), false);
      } else assert.equal(Array.isArray(data[0].inserts), true);
      assert.deepEqual(await candidate.readiness(app, source), await baseline.readiness(app, source));
      assert.deepEqual(await candidate.audit(app, source), await baseline.audit(app, source));
      assert.deepEqual(await candidate.rehearsal(app, source), await baseline.rehearsal(app, source));
      assert.deepEqual((await connection.exec("SELECT * FROM z_parents ORDER BY id")).rows, snapshot);
    } finally { await data?.dispose?.(); await close(); }
  });
}

test("target runner keeps FK/reset order, exact totals, and continuation IDs", nativeNode, async () => {
  const { app, connection, close } = await createHarness({ ddl });
  const target = new PGlite();
  const events = [], calls = [];
  try {
    await seed(connection);
    const result = await candidate.apply(app, { runSql: async sql => { calls.push(sql); await target.exec(sql); } }, source, {
      migrateSessions: false, syncAuthConfig: false,
      onBatchStart: (label, total) => events.push(["start", label, total]),
      onBatchProgress: (label, done, total) => events.push(["progress", label, done, total]),
      onBatchEnd: (label, total, unit) => events.push(["end", label, total, unit]),
    });
    assert.deepEqual((await target.query("SELECT id,label FROM z_parents ORDER BY id")).rows,
      [{ id: 11, label: "O'Brien\\\n雪😀" }, { id: 20, label: "second" }]);
    assert.deepEqual((await target.query("SELECT * FROM a_children")).rows, [{ id: 100, parent_id: 11, doubled: 200 }]);
    assert.deepEqual((await target.query("INSERT INTO z_parents (label) VALUES ('next') RETURNING id")).rows, [{ id: 21 }]);
    assert.deepEqual((await target.query("INSERT INTO a_children (parent_id) VALUES (21) RETURNING id")).rows, [{ id: 101 }]);
    assert.equal(result.dataTables[0].inserts.length, 2);
    assert.equal(connection.driver.isTransaction, false);
    await assert.rejects(materialize(result.dataTables), /disposed/);
    const starts = events.filter(event => event[0] === "start");
    assert.deepEqual(starts.map(event => event.slice(1)), [["Migrating public.z_parents", 2], ["Migrating public.a_children", 1], ["Resetting public.z_parents sequences", 1], ["Resetting public.a_children sequences", 1]]);
    assert.equal(calls.findIndex(sql => sql.includes('INSERT INTO "public"."z_parents"')) < calls.findIndex(sql => sql.includes('INSERT INTO "public"."a_children"')), true);
    assert.equal(calls.findIndex(sql => sql.startsWith('SELECT setval')) > calls.findIndex(sql => sql.includes('INSERT INTO "public"."a_children"')), true);
  } finally { await close(); await target.close(); }
});


test("UTF-8 byte and row bounds, including largest-statement exception", async () => {
  const rows = ["雪".repeat(3), "abc", "x".repeat(50), "def", "ghi"];
  const batches = [];
  for await (const batch of sqlBatches(rows, { maxRows: 2, maxBytes: 15 })) batches.push(batch);
  assert.deepEqual(batches.flat(), rows);
  assert.ok(batches.every(batch => batch.length <= 2 && (batch.length === 1 || batch.reduce((n, value) => n + Buffer.byteLength(value) + 2, 0) <= 15)));
  await assert.rejects(async () => { for await (const _ of sqlBatches([], { maxRows: 0 })) {} }, /positive/);
});



test("readiness and shim audit never materialize Node application columns", nativeNode, async () => {
  const schema = migration("CREATE SCHEMA app; CREATE TABLE app.records (id integer PRIMARY KEY, payload jsonb, label varchar(12));");
  const { app, connection, close } = await createHarness({ ddl: schema.sql });
  try {
    await connection.exec('DROP TABLE "app.records"; CREATE TABLE "app.records" (id integer PRIMARY KEY, payload jsonb, label varchar(12))');
    await connection.exec(`INSERT INTO "app.records" VALUES (1,'{"v":[1]}','short'),(2,'invalid','this is too long')`);
    const expectedReady = await baseline.readiness(app, schema);
    const expectedAudit = await baseline.audit(app, schema);
    const prepare = connection.driver.prepare.bind(connection.driver);
    connection.driver.prepare = sql => {
      const statement = prepare(sql);
      if (/^SELECT\s+(?!COUNT\()/i.test(sql) && sql.includes('FROM "app.records"')) {
        statement.all = () => { throw new Error("unbounded application all() used"); };
      }
      return statement;
    };
    assert.deepEqual(await candidate.readiness(app, schema), expectedReady);
    assert.deepEqual(await candidate.audit(app, schema), expectedAudit);
    assert.ok(expectedReady.tables.some(table => table.issues.length > 0));
    assert.ok(expectedAudit.results.some(field => field.status !== "pass"));
  } finally { await close(); }
});

async function diskFixture(t) {
  const directory = await mkdtemp(join(tmpdir(), "lite-stream-cleanup-test-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const { createConnection } = await import("../upstream/lite-0.11.0/dist/db/node/index.js");
  const connection = createConnection({ url: join(directory, "source.db") });
  await connection.exec("CREATE TABLE records (id integer PRIMARY KEY, label text); INSERT INTO records VALUES (1,'one'),(2,'two'),(3,'three')");
  const other = new DatabaseSync(join(directory, "source.db"));
  other.exec("PRAGMA busy_timeout=1");
  t.after(async () => { other.close(); await connection.close(); });
  return { directory, connection, other, app: { connection, config: { auth: { enabled: false } } }, schema: migration("CREATE TABLE records (id integer PRIMARY KEY, label text);") };
}
async function withTempDirectory(directory, fn) {
  const previous = process.env.TMPDIR;
  process.env.TMPDIR = directory;
  try { return await fn(); }
  finally { if (previous === undefined) delete process.env.TMPDIR; else process.env.TMPDIR = previous; }
}
const spools = async directory => (await readdir(directory)).filter(name => name.startsWith("lite-upgrade-sql-"));

test("early iteration return and abort release the source SELECT lock", nativeNode, async t => {
  const { connection, other } = await diskFixture(t);
  for await (const row of upgradeRows(connection, "SELECT * FROM records")) {
    assert.equal(row.id, 1);
    assert.throws(() => other.exec("INSERT INTO records VALUES (4,'four')"), /locked/);
    break;
  }
  other.exec("INSERT INTO records VALUES (4,'four')");
  const controller = new AbortController();
  await assert.rejects(async () => {
    for await (const row of upgradeRows(connection, "SELECT * FROM records", controller.signal)) controller.abort(new Error("cancelled capture"));
  }, /cancelled capture/);
  other.exec("INSERT INTO records VALUES (5,'five')");
});


test("target failure preserves row diagnostics, skips resets, releases snapshot", nativeNode, async t => {
  const { directory, connection, other, app, schema } = await diskFixture(t);
  let failures, resets = 0;
  await withTempDirectory(directory, async () => {
    await assert.rejects(candidate.apply(app, { runSql: async sql => {
      if (sql.startsWith("INSERT")) throw new Error("target rejected row");
      if (sql.startsWith("SELECT setval")) resets++;
    } }, schema, { migrateSessions: false, syncAuthConfig: false,
      onBatchFailure: (_, errors) => { failures = errors; } }), /had 3 failures/);
    assert.deepEqual(await spools(directory), []);
  });
  assert.equal(failures.length, 3);
  assert.ok(failures.every(item => item.statement.startsWith("INSERT") && item.error.includes("target rejected row")));
  assert.equal(resets, 0);
  assert.equal((await connection.exec("SELECT COUNT(*) AS n FROM records")).rows[0].n, 3);
  other.exec("INSERT INTO records VALUES (4,'after target failure')");
});


test("native capability detection rejects lookalikes and other dialects", nativeNode, () => {
  assert.equal(isNodeSqlite({ dialect: "sqlite", driver: { prepare() {}, exec() {} } }), false);
  assert.equal(isNodeSqlite({ dialect: "sqlite" }), false);
  const native = new DatabaseSync(":memory:");
  try {
    assert.equal(isNodeSqlite({ dialect: "postgres", driver: native }), false);
    assert.equal(isNodeSqlite({ dialect: "sqlite", driver: native }), true);
  } finally { native.close(); }
});
