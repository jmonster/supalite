import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { after, before, test } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { modules } from "./helpers/lite.mjs";

const fixtures = {
  date: ["2026-07-08", "2000-02-29"],
  time: ["09:10:11.123456", "00:00:00.000001"],
  timetz: ["09:10:11.123456+05:45", "00:00:00.000001-03:30"],
  timestamp: ["2026-07-08 09:10:11.123456", "2000-02-29 00:00:00.000001"],
  timestamptz: ["2026-07-08 09:10:11.123456+05:45", "2000-02-29 00:00:00.000001-03:30"],
  text: ["NULL", "null"],
};
const ddl = Object.keys(fixtures).map((type) =>
  `CREATE TABLE arrays_${type} (id integer PRIMARY KEY, value ${type}[]);`
).join("\n");

function rows([first, second], type) {
  return [
    [null, first, null, second, null],
    [null, null],
    [],
    null,
    [first, second],
    ...(type === "text" ? [["NULL", "null", null, ""]] : []),
  ].map((value, index) => ({ id: index + 1, value }));
}

function sqlValue(value) {
  if (value === null) return "NULL";
  if (Array.isArray(value)) return `ARRAY[${value.map(sqlValue).join(",")}]`;
  return `'${value.replaceAll("'", "''")}'`;
}

// The published CLI does not export this function. Expose its existing exporter
// in a generated test-only sibling, replacing only the CLI startup expression.
async function exporter() {
  const root = new URL("../.generated/baseline/node_modules/@supabase/lite/dist/cli/", import.meta.url);
  const source = await readFile(new URL("index.js", root), "utf8");
  assert.equal(source, await readFile(new URL("../upstream/lite-0.11.0/dist/cli/index.js", import.meta.url), "utf8"));
  const entry = 'process.on("unhandledRejection",e=>{if(!Rn(e))throw e});process.on("uncaughtException",e=>{Rn(e)||(console.error(e),$n(true,e).finally(()=>process.exit(1)));});NC().then(null).catch(async e=>{Rn(e)||(console.error(e),await $n(true,e),process.exitCode=1);});';
  assert.equal(source.split(entry).length - 1, 1);
  const bridge = new URL("test-array-export.js", root);
  await writeFile(bridge, source.replace(entry, "oo();Rc(); export { co as exportUserData };"));
  return (await import(bridge.href)).exportUserData;
}

let source;
let target;
let groups;

before(async () => {
  const { App, factories } = await modules();
  source = await factories.pglite();
  target = new PGlite();
  await source.exec("SET TIME ZONE 'UTC';");
  await target.exec("SET TIME ZONE 'UTC';");
  await source.exec(ddl);
  await target.exec(ddl);
  for (const [type, samples] of Object.entries(fixtures)) {
    for (const { id, value } of rows(samples, type)) {
      await source.exec(`INSERT INTO arrays_${type} VALUES (${id}, ${sqlValue(value)}::${type}[]);`);
    }
  }
  const app = new App({
    connection: source,
    auth: { enabled: false },
    options: { server: { admin: false, disableStudio: true } },
  });
  groups = await (await exporter())(app, { sql: ddl });
  assert.equal(groups.length, Object.keys(fixtures).length);
});

after(async () => {
  await source?.close();
  await target?.close();
});

for (const [type, samples] of Object.entries(fixtures)) {
  test(`PGlite ${type}[]: preserve parsed nulls, empty arrays, dimensions, and values`, async () => {
    const normalized = type === "timestamptz"
      ? ["2026-07-08 03:25:11.123456+00", "2000-02-29 03:30:00.000001+00"]
      : samples;
    const actual = await source.exec(`SELECT * FROM arrays_${type} ORDER BY id`);
    assert.deepEqual(actual.rows, rows(normalized, type));

    // The driver supports nested arrays. The bundled upgrade exporter does not,
    // so exercise them directly without claiming multidimensional export support.
    const matrix = [[null, samples[0]], [samples[1], null]];
    const nested = await source.exec(`SELECT ${sqlValue(matrix)}::${type}[] AS mixed,
      ARRAY[[NULL, NULL], [NULL, NULL]]::${type}[] AS all_null`);
    assert.deepEqual(nested.rows, [{
      mixed: [[null, normalized[0]], [normalized[1], null]],
      all_null: [[null, null], [null, null]],
    }]);
  });

  test(`PGlite ${type}[]: bundled upgrade export replays with identical SQL values`, async () => {
    const group = groups.find(({ table }) => table === `arrays_${type}`);
    assert.ok(group);
    assert.equal(group.inserts.length, rows(samples, type).length);
    for (const insert of group.inserts) await target.exec(insert);

    // Server-side text and null checks avoid masking an export error with the
    // same client-side array parser on the destination.
    const query = `SELECT id, value::text AS value,
      value IS NULL AS whole_null, cardinality(value) AS cardinality,
      array_ndims(value) AS dimensions
      FROM arrays_${type} ORDER BY id`;
    assert.deepEqual((await target.query(query)).rows, (await source.exec(query)).rows);
  });
}
