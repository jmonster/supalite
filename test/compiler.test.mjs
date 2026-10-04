import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { createClient } from "@libsql/client";
import { PGlite } from "@electric-sql/pglite";
import {
  DummyDriver,
  Kysely,
  SqliteAdapter,
  SqliteIntrospector,
  SqliteQueryCompiler,
  sql,
} from "kysely";
import {
  jsonbContainment,
  JsonbFilterError,
} from "../dist/jsonb-containment.js";
import { namedCases, crossCases, generatedCases } from "./fixtures/cases.mjs";

export const compiler = new Kysely({
  dialect: {
    createAdapter: () => new SqliteAdapter(),
    createDriver: () => new DummyDriver(),
    createIntrospector: (db) => new SqliteIntrospector(db),
    createQueryCompiler: () => new SqliteQueryCompiler(),
  },
});
const compile = (lhs, rhs, op) =>
  sql`select ${jsonbContainment(sql`${lhs}`, rhs, op)} as matched`.compile(
    compiler,
  );
const value = (x) => (x === null ? null : Boolean(x));

for (const backend of ["node", "libsql"]) {
  test(`${backend}: live PostgreSQL differential corpus`, async () => {
    const sqlite =
      backend === "node"
        ? new DatabaseSync(":memory:")
        : createClient({ url: ":memory:" });
    const oracle = new PGlite();
    const run = async (query) =>
      backend === "node"
        ? sqlite.prepare(query.sql).get(...query.parameters)
        : (
            await sqlite.execute({
              sql: query.sql,
              args: [...query.parameters],
            })
          ).rows[0];
    let comparisons = 0;
    try {
      await run({ sql: "create table oracle_docs(document text)", parameters: [] });
      await run({ sql: "insert into oracle_docs values (null)", parameters: [] });
      const cases = [...namedCases, ...crossCases, ...generatedCases()].filter(
        (entry) => entry.category !== "fidelity" && entry.rhs !== null,
      );
      for (const entry of cases) {
        const expected = (
          await oracle.query(
            "select $1::jsonb @> $2::jsonb as contains, $1::jsonb <@ $2::jsonb as contained_by",
            [entry.lhs, entry.rhs],
          )
        ).rows[0];
        for (const op of ["contains", "containedBy"]) {
          const compiled = compile(entry.lhs, JSON.parse(entry.rhs), op);
          const actual = await run(compiled);
          assert.equal(
            value(actual.matched),
            expected[op === "contains" ? "contains" : "contained_by"],
            `${entry.name} ${op}`,
          );
          comparisons++;
        }
        // Also exercise source-column specialization, rather than only the
        // bound-input form above (which must retain single evaluation).
        const columnPredicate = jsonbContainment(
          sql.ref("document"), JSON.parse(entry.rhs), "contains", { storedColumn: true },
        );
        await run({ sql: "update oracle_docs set document = ?", parameters: [entry.lhs] });
        const columnQuery = sql`select ${columnPredicate} as matched,
          not ${columnPredicate} as negated, (${columnPredicate} or 0) as ored
          from oracle_docs`.compile(compiler);
        const columnResult = await run(columnQuery);
        assert.equal(value(columnResult.matched), expected.contains, `${entry.name} column`);
        assert.equal(value(columnResult.negated), expected.contains === null ? null : !expected.contains, `${entry.name} column NOT`);
        assert.equal(value(columnResult.ored), expected.contains, `${entry.name} column OR`);
        comparisons += 3;
      }
      console.log(
        `${backend}: ${comparisons} live PostgreSQL comparisons passed`,
      );
    } finally {
      sqlite.close();
      await oracle.close();
    }
  });

  test(`${backend}: deep filters stay below SQLite parser nesting limits`, async () => {
    const sqlite =
      backend === "node"
        ? new DatabaseSync(":memory:")
        : createClient({ url: ":memory:" });
    try {
      for (const op of ["contains", "containedBy"]) {
        for (const shape of ["object", "array"]) {
          let doc = 1;
          for (let depth = 0; depth < 16; depth++)
            doc = shape === "object" ? { child: doc } : [doc];
          const query = compile(JSON.stringify(doc), doc, op);
          const row =
            backend === "node"
              ? sqlite.prepare(query.sql).get(...query.parameters)
              : (
                  await sqlite.execute({
                    sql: query.sql,
                    args: [...query.parameters],
                  })
                ).rows[0];
          assert.equal(value(row.matched), true);
        }
      }
    } finally {
      sqlite.close();
    }
  });
}

test("compiler binds hostile object keys and values; preserves SQL NULL and NOT", () => {
  const db = new DatabaseSync(":memory:");
  try {
    const hostile = {
      "x'); drop table documents; --": "' OR 1=1; --",
      __jsonb_nodes: { key: true },
    };
    const query = compile(JSON.stringify(hostile), hostile, "contains");
    assert.ok(!query.sql.includes("drop table"));
    assert.ok(query.parameters.includes("x'); drop table documents; --"));
    assert.equal(db.prepare(query.sql).get(...query.parameters).matched, 1);
    const nullQuery =
      sql`select not ${jsonbContainment(sql`null`, {}, "contains")} as matched`.compile(
        compiler,
      );
    assert.equal(db.prepare(nullQuery.sql).get().matched, null);
  } finally {
    db.close();
  }
});

test("compiler rejects excess depth, nodes, parameters and invalid values before SQL execution", () => {
  let deep = 0;
  for (let i = 0; i < 17; i++) deep = { child: deep };
  const cases = [
    deep,
    Array.from({ length: 129 }, () => null),
    Object.fromEntries(Array.from({ length: 33 }, (_, i) => [`k${i}`, i])),
    Infinity,
    Number.MAX_SAFE_INTEGER + 1,
    undefined,
  ];
  for (const value of cases)
    assert.throws(
      () => jsonbContainment(sql`body`, value, "contains"),
      JsonbFilterError,
    );
});
