import test from "node:test";
import assert from "node:assert/strict";
import { SqliteQueryCompiler } from "kysely";
import { createHarness } from "./helpers/lite.mjs";

const markers = [
  "__jsonb_fast_input", "__jsonb_walk", "__jsonb_path_input", "__jsonb_shallow_input",
];
const ids = Array.from({ length: 101 }, (_, index) => index);
const ddl = `CREATE TABLE compile_parents(id integer PRIMARY KEY);
  CREATE TABLE compile_docs(id integer PRIMARY KEY,
    parent_id integer REFERENCES compile_parents(id), body jsonb,
    ${markers.map((name) => `"${name}" integer`).join(", ")});`;

for (const backend of ["node", "libsql"]) {
  test(`${backend}: ordinary queries compile once and cannot trigger JSONB limits by name`, async () => {
    const h = await createHarness({ backend, ddl });
    // Ordinary queries may use the documented higher driver budget. JSONB's
    // portable request budget must still be 100, regardless of this setting.
    h.connection.config.maxBoundParameters = 1000;
    const compile = SqliteQueryCompiler.prototype.compileQuery;
    try {
      await h.connection.kysely.insertInto("compile_docs").values({
        id: 1, body: '{"active":true}',
        ...Object.fromEntries(markers.map((name) => [name, 1])),
      }).execute();
      await h.client.from("compile_docs").select("id");
      let compilations = 0;
      SqliteQueryCompiler.prototype.compileQuery = function (...args) {
        const query = compile.apply(this, args);
        if (query.sql.includes('from "compile_docs"')) compilations++;
        return query;
      };
      const ordinary = async (column) => {
        compilations = 0;
        const result = await h.client.from("compile_docs").select("id").in(column, ids);
        assert.equal(result.error, null);
        assert.deepEqual(result.data, [{ id: 1 }]);
        assert.equal(compilations, 1, column);
      };
      await ordinary("id");
      for (const marker of markers) await ordinary(marker);
      const jsonb = await h.client.from("compile_docs").select("id").contains("body", { active: true });
      assert.equal(jsonb.error, null);
      assert.deepEqual(jsonb.data, [{ id: 1 }]);
      await ordinary("__jsonb_walk"); // No usage flag leaks from the prior query.
    } finally {
      SqliteQueryCompiler.prototype.compileQuery = compile;
      await h.close();
    }
  });

  test(`${backend}: JSONB limits include nested, negated, embedded and mutation filters`, async () => {
    const h = await createHarness({ backend, ddl });
    h.connection.config.maxBoundParameters = 1000;
    try {
      const from = () => h.client.from("compile_docs").select("id").in("id", ids);
      const requests = [
        from().contains("body", { active: true }),
        from().not("body", "cs", '{"active":true}'),
        from().or('and(body.cs.{"active":true},id.eq.1),id.eq.2'),
        from().contains("body->child", { active: true }),
        h.client.from("compile_parents").select("id,compile_docs(id)")
          .in("id", ids).contains("compile_docs.body", { active: true }),
        h.client.from("compile_parents").select("id,compile_docs!inner()")
          .in("id", ids).contains("compile_docs.body", { active: true }),
        h.client.from("compile_docs").select("id", { head: true, count: "exact" })
          .in("id", ids).contains("body", { active: true }),
        h.client.from("compile_docs").update({ parent_id: null })
          .in("id", ids).contains("body", { active: true }),
        h.client.from("compile_docs").delete()
          .in("id", ids).contains("body", { active: true }).limit(1),
      ];
      for (const request of requests) {
        const result = await request;
        assert.equal(result.status, 400, String(request.url));
        // HEAD has no response body; other requests preserve the JSONB error.
        if (request.method !== "HEAD") {
          assert.equal(result.error?.code, "54000", String(request.url));
          assert.match(result.error.message, /100 total bound parameters/);
        }
      }
      const longSql = await h.client.from("compile_docs")
        .select(`${"x".repeat(100_001)}:id`).contains("body", {});
      assert.equal(longSql.status, 400);
      assert.equal(longSql.error?.code, "54000");
      assert.match(longSql.error.message, /100000 SQL bytes/);
      const ordinary = await from(); // Rejected requests do not leak usage either.
      assert.equal(ordinary.error, null);
    } finally {
      await h.close();
    }
  });
}
