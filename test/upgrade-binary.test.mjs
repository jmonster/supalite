import test from "node:test";
import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";
import { formatBinaryValue } from "../upstream/lite-0.11.0/dist/cli/upgrade-binary-value.js";
import { createHarness } from "./helpers/lite.mjs";
import * as candidate from "../upstream/lite-0.11.0/dist/cli/index.js";

const sample = Uint8Array.from([0, 255, 92, 39, 10, 127]);
const sampleHex = "00ff5c270a7f";

test("binary driver values preserve their exact byte range", () => {
  const padded = Uint8Array.from([200, ...sample, 201]);
  const views = [
    sample,
    sample.buffer,
    Buffer.from(sample),
    padded.subarray(1, -1),
    Buffer.from(padded).subarray(1, -1),
    new DataView(padded.buffer, 1, sample.byteLength),
    new Uint16Array(padded.buffer, 2, 2),
  ];
  for (const value of views) {
    const bytes = value instanceof ArrayBuffer ? new Uint8Array(value)
      : new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
    const expected = `decode('${Buffer.from(bytes).toString("hex")}', 'hex')`;
    assert.equal(formatBinaryValue(value), expected);
    assert.equal(candidate.formatSqlValue(value, "bytea"), expected);
  }
  for (const value of [new ArrayBuffer(0), new Uint8Array(), Buffer.alloc(0), new DataView(padded.buffer, 3, 0)]) {
    assert.equal(formatBinaryValue(value), "decode('', 'hex')");
    assert.equal(candidate.formatSqlValue(value, "bytea"), "decode('', 'hex')");
  }
});

test("nonbinary values retain scalar, array and JSON formatting", () => {
  for (const [value, expected] of [
    [null, "NULL"], [undefined, "NULL"], [NaN, "NULL"], [Infinity, "NULL"],
    [true, "true"], [false, "false"], [0, "0"], [23.5, "23.5"],
    ["", "''"], ["\\x00ff", "'\\x00ff'"], ["O'Brien \\ café 雪 😀", "'O''Brien \\ café 雪 😀'"],
    [new Date("2026-01-02T03:04:05Z"), "'2026-01-02T03:04:05.000Z'"],
  ]) {
    assert.equal(formatBinaryValue(value), undefined);
    assert.equal(candidate.formatSqlValue(value, "bytea"), expected);
  }
  for (const value of [[], [0, 255], { 0: 0, 1: 255 }, { type: "Buffer", data: [0, 255] },
    { buffer: sample.buffer, byteOffset: 0, byteLength: sample.length },
    { nested: { value: "kept" }, array: [1, true, null] }]) {
    assert.equal(formatBinaryValue(value), undefined, "binary lookalikes remain ordinary values");
    assert.equal(candidate.formatSqlValue(value, "bytea"), `'${JSON.stringify(value)}'::jsonb`);
  }
  assert.equal(candidate.formatSqlValue([], "integer[]"), "ARRAY[]::integer[]");
  assert.equal(candidate.formatSqlValue([0, 255], "integer[]"), "ARRAY[0, 255]::integer[]");
});

test("typed JSON takes precedence over binary and bytea arrays recurse", () => {
  for (const type of ["json", "jsonb"]) {
    assert.equal(candidate.formatSqlValue(sample, type), `'${JSON.stringify(sample)}'::${type}`);
    assert.equal(candidate.formatSqlValue({ type: "Buffer", data: [0, 255] }, type),
      `'${JSON.stringify({ type: "Buffer", data: [0, 255] })}'::${type}`);
  }
  assert.equal(candidate.formatSqlValue([sample, new Uint8Array(), null], "bytea[]"),
    `ARRAY[decode('${sampleHex}', 'hex'), decode('', 'hex'), NULL]::bytea[]`);
});

const ddl = `
CREATE TABLE z_binary_records (
  id serial PRIMARY KEY,
  label text,
  content bytea,
  payload jsonb
);
CREATE TABLE a_binary_refs (
  id serial PRIMARY KEY,
  parent_id integer NOT NULL REFERENCES z_binary_records(id),
  doubled integer GENERATED ALWAYS AS (id * 2) STORED
);`;
const allBytes = Buffer.from(Array.from({ length: 256 }, (_, i) => i)).toString("hex");
const expected = [
  { id: 10, label: "O'Brien \\ café 雪 😀", content_hex: sampleHex, null_content: false, payload: { nested: { value: "kept" }, array: [1, true, null] } },
  { id: 20, label: "empty", content_hex: "", null_content: false, payload: { 0: 0, 1: 255 } },
  { id: 30, label: null, content_hex: null, null_content: true, payload: null },
  { id: 40, label: "all bytes", content_hex: allBytes, null_content: false, payload: { type: "Buffer", data: [0, 255] } },
];
const quote = (value) => value == null ? "NULL" : `'${value.replace(/'/g, "''")}'`;

for (const backend of ["node", "libsql", "pglite"]) {
  test(`${backend}: bundled exporter round-trips bytea into PostgreSQL execution`, async () => {
    const { connection, app, close } = await createHarness({ backend, ddl });
    const target = backend === "pglite" ? connection.driver : new PGlite();
    try {
      for (const row of expected) {
        const binary = row.content_hex === null ? "NULL" : backend === "pglite"
          ? `decode('${row.content_hex}', 'hex')` : `X'${row.content_hex}'`;
        await connection.exec(`INSERT INTO z_binary_records (id, label, content, payload) VALUES
          (${row.id}, ${quote(row.label)}, ${binary}, ${quote(row.payload === null ? null : JSON.stringify(row.payload))});`);
      }
      await connection.exec("INSERT INTO a_binary_refs (id, parent_id) VALUES (100, 10);");
      const snapshot = async () => [
        (await connection.exec("SELECT * FROM z_binary_records ORDER BY id")).rows,
        (await connection.exec("SELECT * FROM a_binary_refs ORDER BY id")).rows,
      ];
      const initial = await snapshot();
      const raw = initial[0][0].content;
      // libSQL returns ArrayBuffer; node:sqlite and PGlite return Uint8Array.
      assert.equal(backend === "libsql" ? raw instanceof ArrayBuffer : raw instanceof Uint8Array, true);
      assert.equal(Buffer.from(raw instanceof ArrayBuffer ? new Uint8Array(raw) : raw).toString("hex"), sampleHex);

      const source = { sql: ddl };
      const fixed = await candidate.exportUserData(app, source);
      assert.deepEqual(fixed.map(({ table }) => table), ["z_binary_records", "a_binary_refs"]);
      assert.equal(fixed.every(group => group.sequenceResets.length === 1), true);
      assert.doesNotMatch(fixed[1].inserts[0], /"doubled"/);
      assert.ok(fixed[0].inserts[0].includes(`decode('${sampleHex}', 'hex')`));
      assert.ok(fixed[0].inserts[1].includes("decode('', 'hex')"));

      assert.deepEqual(await snapshot(), initial, "export must not mutate source rows");
      if (backend === "pglite") {
        // Source assertions are complete; replay into the reset fixture tables.
        await target.exec("DROP TABLE a_binary_refs; DROP TABLE z_binary_records;");
      }
      await target.exec(ddl);
      for (const group of fixed) for (const sql of group.inserts) await target.exec(sql);
      for (const group of fixed) for (const sql of group.sequenceResets) await target.exec(sql);
      const rows = (await target.query(`SELECT id, label, encode(content, 'hex') AS content_hex,
        content IS NULL AS null_content, payload FROM z_binary_records ORDER BY id`)).rows;
      assert.deepEqual(rows, expected);
      assert.deepEqual((await target.query("SELECT * FROM a_binary_refs")).rows, [{ id: 100, parent_id: 10, doubled: 200 }]);
      assert.deepEqual((await target.query("INSERT INTO z_binary_records (label) VALUES ('new') RETURNING id")).rows, [{ id: 41 }]);
      assert.deepEqual((await target.query("INSERT INTO a_binary_refs (parent_id) VALUES (41) RETURNING id, doubled")).rows, [{ id: 101, doubled: 202 }]);
      if (backend !== "pglite") assert.deepEqual(await snapshot(), initial, "export must not mutate source rows");
    } finally {
      await close();
      if (backend !== "pglite") await target.close();
    }
  });
}
