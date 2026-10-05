import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { createClient } from "@libsql/client";
import { PGlite } from "@electric-sql/pglite";
import { Kysely, SqliteDialect, sql } from "kysely";
import { jsonbShallow } from "../upstream/lite-0.11.0/dist/query/jsonb-shallow.js";
import { namedCases, crossCases, generatedCases } from "./fixtures/cases.mjs";

const compileDb = new Kysely({
  dialect: new SqliteDialect({ database: new DatabaseSync(":memory:") }),
});
const parameter = (value) => sql`${value}`;
const resultValue = (value) => (value === null ? null : Boolean(value));

test("shallow declines depth >3 before spending parameters", () => {
  for (const direction of ["contains", "containedBy"]) {
    let parameters = 0;
    assert.equal(
      jsonbShallow(
        sql.ref("body"),
        { a: { b: { c: { d: 1 } } } },
        direction,
        (value) => {
          parameters++;
          return sql`${value}`;
        },
      ),
      null,
    );
    assert.equal(parameters, 0);
  }
});

for (const backend of ["node", "libsql"]) {
  test(`${backend}: shallow agrees with live PostgreSQL for eligible corpus`, async () => {
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
      for (const entry of [
        ...namedCases,
        ...crossCases,
        ...generatedCases(),
      ].filter(
        (entry) => entry.category !== "fidelity" && entry.rhs !== null,
      )) {
        const filter = JSON.parse(entry.rhs);
        const expected = (
          await oracle.query(
            "select $1::jsonb @> $2::jsonb as contains, $1::jsonb <@ $2::jsonb as contained_by",
            [entry.lhs, entry.rhs],
          )
        ).rows[0];
        for (const direction of ["contains", "containedBy"]) {
          let budget = 0;
          const predicate = jsonbShallow(
            sql`${entry.lhs}`,
            filter,
            direction,
            (value) => {
              budget++;
              return sql`${value}`;
            },
          );
          if (predicate === null) {
            assert.equal(budget, 0);
            continue;
          }
          const query = sql`select ${predicate} as matched`.compile(compileDb);
          assert.equal(
            query.parameters.length,
            budget + 1,
            "parameter callback counts every predicate placeholder",
          );
          assert.equal(
            resultValue((await run(query)).matched),
            expected[direction === "contains" ? "contains" : "contained_by"],
            `${entry.name} ${direction}`,
          );
          comparisons++;
        }
      }
      console.log(
        `${backend}: ${comparisons} shallow PostgreSQL comparisons passed`,
      );
    } finally {
      sqlite.close();
      await oracle.close();
    }
  });
}

// Mirrors the adapter's bounded, flat 16-step JSON path extraction shape. The
// expression is passed INTO the helper, as happens for a PostgREST path filter.
function pathInput(reference, count) {
  const doc = sql.ref("__path_input.document");
  const ctes = [
    sql`__path_tree as materialized (select id,parent,key,type,value from json_tree(${doc}))`,
    sql`__path_0 as materialized(select id from __path_tree where parent is null)`,
  ];
  for (let step = 0; step < count; step++)
    ctes.push(sql`${sql.ref(`__path_${step + 1}`)} as materialized
    (select child.id from ${sql.ref(`__path_${step}`)} p cross join __path_tree parent cross join __path_tree child
     where parent.id=p.id and child.parent=p.id and child.key=${"p"})`);
  return sql`(select (with ${sql.join(ctes, sql`, `)} select n.value from ${sql.ref(`__path_${count}`)} p
    cross join __path_tree n where n.id=p.id limit 1) from (select ${reference} as document) as __path_input)`;
}

test("shallow is parser-safe at depth3 with path16 and embedding wrappers on both drivers", async () => {
  const node = new DatabaseSync(":memory:");
  const libsql = createClient({ url: ":memory:" });
  const run = {
    node: async (text, args = []) => node.prepare(text).all(...args),
    libsql: async (text, args = []) =>
      (await libsql.execute({ sql: text, args })).rows,
  };
  try {
    for (const [backend, execute] of Object.entries(run)) {
      await execute('create table docs("key" text, "type" text, "value" text)');
      for (const shape of [
        { variants: [{ sku: "red", stock: 1 }] },
        { a: { b: { c: 1 } } },
        [[[1]]],
        { a: { b: {} } },
      ]) {
        let doc = shape;
        for (let depth = 0; depth < 16; depth++) doc = { p: doc };
        await execute("delete from docs");
        await execute(
          "insert into docs values (?,?,?)",
          Array(3).fill(JSON.stringify(doc)),
        );
        for (const column of ["key", "type", "value"])
          for (const direction of ["contains", "containedBy"]) {
            const predicate = jsonbShallow(
              pathInput(sql.ref(`docs.${column}`), 16),
              shape,
              direction,
              parameter,
            );
            assert.notEqual(predicate, null);
            const query =
              sql`select json_group_array(json(result)) as embedded from
            (select json_object('matches',json((select json_group_array(json(row_value)) from
              (select json_object('ok',1) as row_value from docs where ${predicate})))) as result)`.compile(
                compileDb,
              );
            const rows = await execute(query.sql, [...query.parameters]);
            assert.deepEqual(
              JSON.parse(rows[0].embedded),
              [{ matches: [{ ok: 1 }] }],
              `${backend} ${column} ${direction}`,
            );
          }
      }
    }
  } finally {
    node.close();
    libsql.close();
  }
});

test("shallow protects unqualified capture and SQL NULL, JSON null and negation", async () => {
  const node = new DatabaseSync(":memory:");
  const libsql = createClient({ url: ":memory:" });
  const run = {
    node: async (text, args = []) => node.prepare(text).all(...args),
    libsql: async (text, args = []) =>
      (await libsql.execute({ sql: text, args })).rows,
  };
  try {
    for (const [backend, execute] of Object.entries(run)) {
      await execute(
        'create table docs("key" text collate nocase,"type" text,"value" text)',
      );
      for (const input of [
        null,
        "null",
        '"not JSON"',
        '{"variants":[{"sku":"RED"},{"sku":"red"}]}',
      ]) {
        await execute("delete from docs");
        await execute("insert into docs values (?,?,?)", [input, input, input]);
        for (const column of ["key", "type", "value"])
          for (const direction of ["contains", "containedBy"]) {
            const filter = { variants: [{ sku: "red" }] };
            const predicate = jsonbShallow(
              sql.ref(column),
              filter,
              direction,
              parameter,
            );
            const query =
              sql`select ${predicate} as positive,not ${predicate} as negative from docs`.compile(
                compileDb,
              );
            const row = (await execute(query.sql, [...query.parameters]))[0];
            if (input === null) {
              assert.equal(row.positive, null);
              assert.equal(row.negative, null);
            } else if (input.startsWith("{")) {
              assert.equal(Boolean(row.positive), direction === "contains");
              assert.equal(Boolean(row.negative), direction !== "contains");
            } else {
              assert.equal(row.positive, 0);
              assert.equal(row.negative, 1);
            }
          }
      }
    }
  } finally {
    node.close();
    libsql.close();
  }
});

test("integrated SDK supports shallow array filters after path16 inside aliased embeds", async () => {
  const {createHarness}=await import('./helpers/lite.mjs');
  const filter={variants:[{color:'blue',size:'M'}]};
  let body=filter;for(let depth=0;depth<16;depth++)body={p:body};
  for(const backend of ['node','libsql']) {
    const harness=await createHarness({backend,ddl:'CREATE TABLE parents(id integer PRIMARY KEY); CREATE TABLE documents(id integer PRIMARY KEY,parent_id integer REFERENCES parents(id),body jsonb)'});
    try {
      assert.equal((await harness.client.from('parents').insert({id:1})).error,null);
      assert.equal((await harness.client.from('documents').insert({id:1,parent_id:1,body})).error,null);
      for(const operator of ['cs','cd']) {
        const direct=await harness.client.from('documents').select('id')
          .filter('body'+'->p'.repeat(16),operator,JSON.stringify(filter));
        assert.equal(direct.error,null);assert.deepEqual(direct.data,[{id:1}]);
        const embed=await harness.client.from('parents').select('id,docs:documents(id)')
          .filter('docs.body'+'->p'.repeat(16),operator,JSON.stringify(filter));
        assert.equal(embed.error,null);assert.deepEqual(embed.data,[{id:1,docs:[{id:1}]}]);
      }
    } finally {await harness.close();}
  }
});
