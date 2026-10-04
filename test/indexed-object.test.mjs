import test from "node:test";
import assert from "node:assert/strict";
import { sql } from "kysely";
import { createHarness } from "./helpers/lite.mjs";
import { tryJsonbContainment } from "../upstream/lite-0.11.0/dist/query/lite-adapter.js";

// Capture the real SDK request at the driver boundary, including its parameters.
async function capture(connection, backend, request) {
  const driver = connection.driver;
  const method = backend === "node" ? "prepare" : "execute";
  const original = driver[method];
  const queries = [];
  driver[method] = backend === "node"
    ? function (sql) {
      const statement = original.call(driver, sql);
      const all = statement.all;
      statement.all = function (...args) {
        queries.push({ sql, args });
        return all.apply(statement, args);
      };
      return statement;
    }
    : function (query) {
      if (typeof query !== "string") queries.push(query);
      return original.call(driver, query);
    };
  try {
    const result = await request;
    assert.equal(result.error, null);
    const query = queries.findLast((q) => q.sql.includes("__jsonb_fast_input"));
    assert.ok(query, "SDK containment SQL was executed");
    return { result, query };
  } finally {
    driver[method] = original;
  }
}

for (const backend of ["node", "libsql"]) {
  test(`${backend}: SDK containment uses ordinary migrated expression indexes`, async () => {
    for (const indexed of [false, true]) {
    const h = await createHarness({ backend, ddl: "create table docs(id integer primary key, body jsonb)" });
    const run = async (sql, args = []) => backend === "node"
      ? h.connection.driver.prepare(sql).all(...args)
      : (await h.connection.driver.execute({ sql, args })).rows;
    const matches = Array.from({ length: 10 }, (_, i) => (i + 1) * 100);
    try {
      const metadata = await h.connection.introspect();
      const bodyColumn = metadata.columns.find((c) => c.table === "docs" && c.name === "body");
      const table = metadata.tables.find((t) => t.name === "docs");
      for (const [column, tables, eligible] of [
        [bodyColumn, [table], true],
        [bodyColumn, undefined, false],
        [{ ...bodyColumn, is_generated: undefined }, [table], false],
        [{ ...bodyColumn, is_generated: true }, [table], false],
        [bodyColumn, [{ ...table, type: "view" }], false],
        [bodyColumn, [{ ...table, sql: "CREATE VIRTUAL TABLE docs USING custom" }], false],
        [bodyColumn, [{ ...table, sql: undefined }], false],
        [bodyColumn, [{ ...table, schema: "other" }], false],
      ]) {
        const predicate = tryJsonbContainment("body", "$contains", { status: "open" }, {
          dialect: "sqlite", currentTable: "docs",
          introspection: { columns: [column], tables },
        }, {}, { parsePath: (col) => ({ col, parts: [] }), reference: () => sql.ref("body") });
        const query = sql`select ${predicate}`.compile(h.connection.kysely);
        assert.equal(query.sql.includes("->>'status'"), eligible, "metadata gate fails closed");
      }
      const rows = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        body: JSON.stringify({ status: (i + 1) % 100 === 0 ? "open" : "closed", rank: (i + 1) % 100 }),
      }));
      rows.push(
        { id: 1001, body: null },
        { id: 1002, body: "null" },
        { id: 1003, body: '{"status":true,"rank":true}' },
        { id: 1004, body: '{"status":["open"],"rank":[0]}' },
        { id: 1005, body: '{"status":"OPEN","rank":"0"}' },
        { id: 1006, body: '{}' },
      );
      for (let offset = 0; offset < rows.length; offset += 50)
        await h.connection.kysely.insertInto("docs").values(rows.slice(offset, offset + 50)).execute();
      // The documented imperative migration route retains expression syntax.
      // Declarative schema-diff expression-index support is outside this change.
      for (const key of indexed ? ["status", "rank"] : []) {
        const translated = await h.connection.translateDdl(
          `CREATE INDEX docs_${key}_idx ON docs ((body->>'${key}'));`,
        );
        assert.match(translated.ddl, new RegExp(`body ->> '${key}'`));
        await h.connection.transaction([translated.ddl], { intent: "migration" });
        const stored = await run("select sql from sqlite_master where name = ?", [`docs_${key}_idx`]);
        assert.match(stored[0].sql, new RegExp(`body ->> '${key}'`));
      }
      const from = () => h.client.from("docs").select("id");
      for (const [key, value] of [["status", "open"], ["rank", 0]]) {
        const { result, query } = await capture(h.connection, backend, from().contains("body", { [key]: value }));
        assert.deepEqual(result.data.map((row) => row.id).sort((a, b) => a - b), matches);
        assert.equal(query.args.filter((v) => v === value).length, 1, "value is not duplicated");
        assert.match(query.sql, new RegExp(`->>'${key}'\\) collate binary = \\?`));
        const plan = await run(`EXPLAIN QUERY PLAN ${query.sql}`, query.args);
        assert.ok(plan.some((row) => row.detail.includes(indexed ? `USING INDEX docs_${key}_idx` : "SCAN docs")), JSON.stringify(plan));
        assert.deepEqual((await run(query.sql, query.args)).map((row) => row.id).sort((a, b) => a - b), matches);
      }
      const negative = await from().not("body", "cs", '{"status":"open"}').order("id").limit(2000);
      assert.equal(negative.error, null);
      assert.deepEqual(negative.data.map((row) => row.id), rows.filter((row) => row.id !== 1001 && !matches.includes(row.id)).map((row) => row.id));
      const union = await from().or('body.cs.{"status":"open"},id.eq.1001').order("id");
      assert.equal(union.error, null);
      assert.deepEqual(union.data.map((row) => row.id), [...matches, 1001]);
      const repeated = await from().contains("body", { status: "open" }).contains("body", { rank: 0 });
      assert.equal(repeated.error, null);
      assert.deepEqual(repeated.data.map((row) => row.id), matches);
    } finally {
      await h.close();
    }
    }
  });
}
