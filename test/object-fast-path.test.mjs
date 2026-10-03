import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { createClient } from "@libsql/client";
import { Kysely, SqliteDialect, sql } from "kysely";
import { jsonbObjectFastPath } from "../dist/jsonb-object-fast-path.js";

const cases = [
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
