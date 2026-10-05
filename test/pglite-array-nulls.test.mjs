import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { modules } from "./helpers/lite.mjs";
import { exportUserData } from "../upstream/lite-0.11.0/dist/cli/index.js";

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

let source;
let groups;

before(async () => {
  const { App, factories } = await modules();
  source = await factories.pglite();
  await source.exec("SET TIME ZONE 'UTC';");
  await source.exec(ddl);
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
  groups = await exportUserData(app, { sql: ddl });
  assert.equal(groups.length, Object.keys(fixtures).length);
});

after(async () => {
  try { await source?.close(); } finally { source = null; }
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
    // Server-side text and null checks avoid masking an export error with the
    // same client-side array parser on the destination.
    const query = `SELECT id, value::text AS value,
      value IS NULL AS whole_null, cardinality(value) AS cardinality,
      array_ndims(value) AS dimensions
      FROM arrays_${type} ORDER BY id`;
    const expected = (await source.exec(query)).rows;
    await source.exec(`TRUNCATE TABLE arrays_${type}`);
    for (const insert of group.inserts) await source.exec(insert);
    assert.deepEqual((await source.exec(query)).rows, expected);
  });
}
