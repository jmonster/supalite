import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";
import { createHarness } from "./helpers/lite.mjs";
import { exportUserData, rehearseUpgrade, runUpgrade } from "../upstream/lite-0.11.0/dist/cli/index.js";

const ddl = `CREATE SCHEMA app;
CREATE TABLE app.a_good (id integer PRIMARY KEY);
CREATE TABLE app.b_failed (id serial PRIMARY KEY);
CREATE TABLE app.c_good (id integer PRIMARY KEY);
CREATE TABLE app.d_empty (id integer PRIMARY KEY);`;
const source = {
  sql: ddl,
  files: [{ filename: "application.sql", sql: ddl }],
  statements: [{ file: "application.sql", index: 1, total: 1, sql: ddl }],
};

// Run CLI children before this process allocates its PGlite fixtures.
for (const backend of ["libsql", "pglite"]) {
  test(`${backend}: actual dry-run CLI reports a failed read with exit 1`, async t => {
    const cwd = await mkdtemp(join(tmpdir(), "lite-upgrade-read-"));
    t.after(() => rm(cwd, { recursive: true, force: true }));
    await mkdir(join(cwd, "supabase", "migrations"), { recursive: true });
    await writeFile(join(cwd, "supabase", "migrations", "20260101000000_application.sql"), ddl);
    const helper = new URL("./helpers/lite.mjs", import.meta.url).href;
    await writeFile(join(cwd, "supabase", "config.mjs"), `
      import { createHarness } from ${JSON.stringify(helper)};
      const { connection } = await createHarness({ backend: ${JSON.stringify(backend)}, ddl: ${JSON.stringify(ddl)} });
      const relation = ${JSON.stringify(backend === "pglite" ? '"app"."b_failed"' : '"app.b_failed"')};
      await connection.exec('INSERT INTO ' + relation + ' (id) VALUES (11)');
      ${backend === "pglite" ? `await connection.exec('CREATE SCHEMA supabase_migrations; CREATE TABLE supabase_migrations.schema_migrations (version text, name text, statements text[], rollback text[], created_by text, idempotency_key text)');` : ""}
      const method = ${JSON.stringify(backend === "pglite" ? "exec" : "execute")};
      const original = connection.driver[method].bind(connection.driver);
      connection.driver[method] = async (query, ...args) => {
        if (process.env.FAIL_APPLICATION_READ && (typeof query === 'string' ? query : query.sql) === 'SELECT * FROM ' + relation)
          throw new Error('synthetic application read failure');
        return original(query, ...args);
      };
      export default { connection, auth: { enabled: false }, storage: { enabled: false }, realtime: { enabled: false } };
    `);
    const cli = fileURLToPath(new URL("../upstream/lite-0.11.0/dist/cli/index.js", import.meta.url));
    for (const failing of [false, true]) {
      const result = spawnSync(process.execPath, [cli, "--no-telemetry", "upgrade", "--target", "local", "--dry-run", "--no-migrate-sessions"], {
        cwd, encoding: "utf8", timeout: 45000,
        env: { ...process.env, HOME: cwd, NO_COLOR: "1", DO_NOT_TRACK: "1", FAIL_APPLICATION_READ: failing ? "1" : "" },
      });
      assert.equal(result.error, undefined);
      assert.equal(result.status, failing ? 1 : 0, result.stdout + result.stderr);
      if (failing) {
        assert.match(result.stdout + result.stderr, /"app"\."b_failed"/);
        assert.match(result.stdout + result.stderr, /synthetic application read failure/);
        assert.doesNotMatch(result.stdout, /rehearsal passed/);
      } else assert.match(result.stdout, /rehearsal passed/);
    }
  });
}

for (const backend of ["libsql", "pglite"]) {
  test(`${backend}: application read failures reject export, rehearsal and apply`, async t => {
    const { connection, app, close } = await createHarness({ backend, ddl });
    t.after(close);
    const relation = name => backend === "pglite" ? `"app"."${name}"` : `"app.${name}"`;
    for (const name of ["a_good", "b_failed", "c_good"])
      await connection.exec(`INSERT INTO ${relation(name)} (id) VALUES (11)`);
    const healthy = await exportUserData(app, source);
    assert.deepEqual(healthy.map(row => row.table), ["a_good", "b_failed", "c_good"]);
    assert.equal(healthy.find(row => row.table === "b_failed").sequenceResets.length, 1);
    assert.equal((await rehearseUpgrade(app, source)).ok, true);

    const method = backend === "pglite" ? "exec" : "execute";
    const original = connection.driver[method].bind(connection.driver);
    const failure = Object.assign(new Error("synthetic application read failure"), { code: "XX000" });
    let rejectedReads = 0;
    t.mock.method(connection.driver, method, async (query, ...args) => {
      if ((typeof query === "string" ? query : query.sql) === `SELECT * FROM ${relation("b_failed")}`) {
        rejectedReads++;
        throw failure;
      }
      return original(query, ...args);
    });
    const check = error => {
      assert.match(error.message, /"app"\."b_failed"/);
      assert.equal(backend === "pglite" ? error.cause?.cause : error.cause, failure);
      return true;
    };
    await t.test("export rejects instead of omitting the populated table", () =>
      assert.rejects(exportUserData(app, source), check));
    await t.test("rehearsal rejects instead of returning ok", () =>
      assert.rejects(rehearseUpgrade(app, source), check));
    await t.test("apply rejects after schema creation, before any application inserts", async () => {
      const target = new PGlite();
      try {
        await assert.rejects(runUpgrade(app, { runSql: sql => target.exec(sql) }, source,
          { migrateSessions: false, syncAuthConfig: false }), check);
        for (const name of ["a_good", "b_failed", "c_good", "d_empty"])
          assert.equal((await target.query(`SELECT count(*)::int AS count FROM app.${name}`)).rows[0].count, 0);
      } finally { await target.close(); }
    });
    assert.equal(rejectedReads, 3);
    assert.equal((await connection.exec(`SELECT count(*) AS count FROM ${relation("b_failed")}`)).rows[0].count, 1);
  });
}

for (const backend of ["libsql", "pglite"]) {
  test(`${backend}: preserve existing view and empty-table exports`, async t => {
    const { connection, app, close } = await createHarness({ backend });
    t.after(close);
    const sql = backend === "pglite"
      ? `CREATE SCHEMA app; CREATE TABLE app.pending (id integer); INSERT INTO app.pending VALUES (1);
         CREATE VIEW ordinary AS SELECT * FROM app.pending;
         CREATE MATERIALIZED VIEW populated AS SELECT * FROM app.pending;
         CREATE MATERIALIZED VIEW pending AS SELECT * FROM app.pending WITH NO DATA;
         CREATE SCHEMA storage; CREATE TABLE storage.internal (id integer); INSERT INTO storage.internal VALUES (2);`
      : `CREATE TABLE "app.pending" (id integer); INSERT INTO "app.pending" VALUES (1);
         CREATE VIEW ordinary AS SELECT * FROM "app.pending";
         CREATE TABLE "storage.internal" (id integer); INSERT INTO "storage.internal" VALUES (2);`;
    await connection.exec(sql + " CREATE TABLE empty_table (id integer);");
    const viewSource = { sql: "CREATE SCHEMA app; CREATE TABLE app.pending (id integer);" };
    const exported = await exportUserData(app, viewSource);
    assert.deepEqual(exported.map(row => `${row.schema}.${row.table}`).sort(),
      ["app.pending", backend === "pglite" ? "public.populated" : "public.ordinary"]);
    if (backend === "libsql") return;
    const original = connection.driver.exec.bind(connection.driver);
    let failedRelation = '"app"."pending"';
    let failCatalog = false;
    const failure = Object.assign(new Error("synthetic relation failure"), { code: "55000" });
    t.mock.method(connection.driver, "exec", async (query, ...args) => {
      if (query === `SELECT * FROM ${failedRelation}`) throw failure;
      if (failCatalog && query.startsWith("SELECT 1 FROM pg_catalog.pg_matviews")) throw new Error("catalog unavailable");
      return original(query, ...args);
    });
    await assert.rejects(exportUserData(app, viewSource), error => {
      assert.match(error.message, /"app"\."pending"/);
      assert.equal(error.cause.cause, failure);
      return true;
    });
    failedRelation = '"public"."pending"';
    failure.code = "XX000";
    await assert.rejects(exportUserData(app, viewSource), error => {
      assert.match(error.message, /"public"\."pending"/);
      assert.equal(error.cause.cause, failure);
      return true;
    });
    failure.code = "55000";
    failCatalog = true;
    await assert.rejects(exportUserData(app, viewSource), error => error.cause.cause === failure);
  });
}
