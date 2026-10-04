import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { createClient } from "@libsql/client";
import { Kysely, SqliteDialect, sql } from "kysely";
import { jsonbObjectFastPath } from "../dist/jsonb-object-fast-path.js";
import { jsonbContainment, JsonbFilterError } from "../dist/jsonb-containment.js";

const cases = [
  [{ status: "open", rank: 1 }, { status: "open", rank: 1 }, true],
  [{ status: "OPEN" }, { status: "open" }, false],
  [{ status: "1" }, { status: 1 }, false],
  [{ status: true }, { status: 1 }, false],
  [{ status: false }, { status: 0 }, false],
  [{ status: null }, { status: "null" }, false],
  [{ status: ["open"] }, { status: "open" }, false],
  [{ status: {} }, { status: "open" }, false],
  [{}, { status: "open" }, false],
  [{ status: "open", profile: [] }, { status: "open", profile: {} }, false],
  [{ status: "open", profile: {} }, { status: "open", profile: {} }, true],
  [{ status: "open", profile: {} }, { status: "open", profile: { x: 1 } }, false],
  [
    { profile: { plan: "pro", active: true } },
    { profile: { plan: "pro" } },
    true,
  ],
  [{ profile: { plan: "free" } }, { profile: { plan: "pro" } }, false],
  [{ profile: {} }, { profile: { plan: "pro" } }, false],
  [{ profile: null }, { profile: {} }, false],
  [{ profile: [] }, { profile: {} }, false],
  [{ profile: { extra: true } }, { profile: {} }, true],
  [{ profile: { active: true } }, { profile: { active: 1 } }, false],
  [{ profile: { active: false } }, { profile: { active: 0 } }, false],
  [{ profile: { value: null } }, { profile: { value: null } }, true],
  [{ profile: {} }, { profile: { value: null } }, false],
  [{ profile: { value: "null" } }, { profile: { value: null } }, false],
  [{ profile: { value: "1" } }, { profile: { value: 1 } }, false],
  [{ profile: { value: 1 } }, { profile: { value: 1 } }, true],
  [{ profile: { value: "A" } }, { profile: { value: "a" } }, false],
  [
    { profile: { value: "x' OR 1=1 --" } },
    { profile: { value: "x' OR 1=1 --" } },
    true,
  ],
  [{ profile: { value: "not JSON" } }, { profile: {} }, true],
  [{ profile: "not JSON" }, { profile: {} }, false],
  [{}, {}, true],
  [[], {}, false],
  [null, {}, false],
  ["not JSON", {}, false],
  [false, {}, false],
  [
    JSON.parse('{"__proto__":{"polluted":true}}'),
    JSON.parse('{"__proto__":{"polluted":true}}'),
    true,
  ],
];

test("only plain source columns expose top-level equalities without duplicate bindings", () => {
  const node = new DatabaseSync(":memory:");
  const db = new Kysely({ dialect: new SqliteDialect({ database: node }) });
  try {
    for (const input of [
      sql.ref("body"), sql.ref("docs.body"), sql`${sql.ref("body")}`,
      sql.raw('"body"'), sql`${sql.raw('"docs"')}.${sql.raw('"body"')}`,
      sql.raw('"odd""column"'),
    ]) {
      const values = [];
      const predicate = jsonbObjectFastPath(input, { status: "open", rank: 1 }, (v) => {
        values.push(v);
        return sql`${v}`;
      }, true);
      const query = sql`select ${predicate}`.compile(db);
      assert.equal(values.length, 4);
      assert.equal(query.parameters.length, values.length);
      assert.deepEqual([...query.parameters].sort(), ["$.rank", "$.status", 1, "open"].sort());
      assert.match(query.sql, /->>'status'\) collate binary = \?/);
      assert.match(query.sql, /->>'rank'\) collate binary = \?/);
      assert.doesNotMatch(query.sql, /json_extract/);
    }
    for (const input of [
      sql`body`, sql`${'{}'}`, sql`coalesce(${sql.ref("body")}, '{}')`,
      sql`${sql.ref("body")}->'child'`, sql.raw('"body" || "body"'),
    ]) {
      let count = 0;
      const predicate = jsonbObjectFastPath(input, { status: "open" }, (v) => {
        count++;
        return sql`${v}`;
      }, true);
      const query = sql`select ${predicate}`.compile(db);
      assert.equal(count, 3);
      assert.match(query.sql, /json_extract/);
      assert.doesNotMatch(query.sql, /->>'status'/);
    }
    const nested = jsonbObjectFastPath(sql.ref("body"), { child: { status: "open" } }, (v) => sql`${v}`, true);
    assert.doesNotMatch(sql`select ${nested}`.compile(db).sql, /->>/);
    const filter = Object.fromEntries(Array.from({ length: 32 }, (_, i) => [`k${i}`, i]));
    const query = sql`select ${jsonbContainment(sql.ref("body"), filter, "contains", { storedColumn: true })}`.compile(db);
    assert.equal(query.parameters.length, 64);
    assert.throws(() => jsonbContainment(sql.ref("body"), { ...filter, extra: 1 }, "contains", { storedColumn: true }), JsonbFilterError);
  } finally {
    node.close();
  }
});

test("unknown source provenance preserves one document from a volatile view", () => {
  const node = new DatabaseSync(":memory:");
  const db = new Kysely({ dialect: new SqliteDialect({ database: node }) });
  let calls = 0;
  node.function("next_document", () => JSON.stringify(++calls % 2 ? { a: 1, b: 0 } : { a: 0, b: 1 }));
  node.exec("create table docs(id); insert into docs values (1); create view computed_docs as select next_document() as body from docs");
  try {
    const predicate = jsonbContainment(sql.ref("body"), { a: 1, b: 1 }, "contains");
    const query = sql`select ${predicate} as matched from computed_docs`.compile(db);
    assert.doesNotMatch(query.sql, /->>/, "plain reference alone does not establish provenance");
    assert.equal(node.prepare(query.sql).get(...query.parameters).matched, 0);
    assert.equal(calls, 1, "all fields come from the same document");
  } finally {
    node.close();
  }
});

test("object fast path declines unsupported shapes without spending parameters", () => {
  for (const filter of [
    null,
    1,
    true,
    "x",
    [],
    { a: [1] },
    { "a.b": 1 },
    { 'a"b': 1 },
    { "": 1 },
    { 0: 1 },
    { "🐘": 1 },
    { nested: { "x-y": 1 } },
  ]) {
    let count = 0;
    const result = jsonbObjectFastPath(sql.ref("body"), filter, (value) => {
      count++;
      return sql`${value}`;
    });
    assert.equal(result, null, JSON.stringify(filter));
    assert.equal(count, 0);
  }
});

test("object fast path preserves types, structure, NULL, negation and input capture on both drivers", async () => {
  const node = new DatabaseSync(":memory:");
  node.exec('create table docs("key" text collate nocase)');
  const libsql = createClient({ url: ":memory:" });
  await libsql.execute('create table docs("key" text collate nocase)');
  const db = new Kysely({ dialect: new SqliteDialect({ database: node }) });
  try {
    const execute = {
      node: async (query, args = []) => node.prepare(query).all(...args),
      libsql: async (query, args = []) =>
        (await libsql.execute({ sql: query, args })).rows,
    };
    for (const [engine, run] of Object.entries(execute)) {
      for (const [lhs, filter, expected] of cases) {
        await run("delete from docs");
        await run("insert into docs values (?)", [JSON.stringify(lhs)]);
        let parameters = 0;
        const predicate = jsonbObjectFastPath(
          sql.ref("key"),
          filter,
          (value) => {
            parameters++;
            return sql`${value}`;
          },
          true,
        );
        assert.notEqual(predicate, null);
        for (const negate of [false, true]) {
          const compiled =
            sql`select ${negate ? sql`not ${predicate}` : predicate} as matched from docs`.compile(
              db,
            );
          assert.equal(
            compiled.parameters.length,
            parameters,
            "Budget count matches emitted placeholders",
          );
          const result = await run(compiled.sql, compiled.parameters);
          assert.equal(
            Boolean(result[0].matched),
            negate ? !expected : expected,
            `${engine} ${JSON.stringify({ lhs, filter, negate })}`,
          );
        }
      }
      await run("delete from docs");
      await run("insert into docs values (null)");
      const predicate = jsonbObjectFastPath(
        sql.ref("key"),
        { x: 1 },
        (value) => sql`${value}`,
        true,
      );
      for (const negate of [false, true]) {
        const compiled =
          sql`select ${negate ? sql`not ${predicate}` : predicate} as matched from docs`.compile(
            db,
          );
        assert.equal(
          (await run(compiled.sql, compiled.parameters))[0].matched,
          null,
        );
      }
    }
  } finally {
    node.close();
    libsql.close();
  }
});
