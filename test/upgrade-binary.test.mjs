import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { formatBinaryValue } from "../dist/upgrade/binary-value.js";
import { patchUpgradeBinary, originalFallback } from "../scripts/patch-upgrade-binary.mjs";
import { createHarness } from "./helpers/lite.mjs";
import { upgradeApi } from "./helpers/upgrade-binary.mjs";

const baseline = await upgradeApi("baseline");
const candidate = await upgradeApi("upgrade-binary");
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

test("nonbinary values and typed JSON retain the shipped formatter behavior", () => {
  const values = [null, undefined, true, false, 0, 1, 23.5, NaN, Infinity,
    "\\x00ff", "O'Brien \\ café 雪 😀", "", [], [0, 255],
    { 0: 0, 1: 255 }, { type: "Buffer", data: [0, 255] },
    { buffer: sample.buffer, byteOffset: 0, byteLength: sample.length },
    { nested: { value: "kept" }, array: [1, true, null] }, new Date("2026-01-02T03:04:05Z")];
  for (const value of values) {
    assert.equal(formatBinaryValue(value), undefined);
    for (const type of [undefined, "bytea", "text", "boolean", "json", "jsonb", "integer[]"]) {
      assert.equal(candidate.formatSqlValue(value, type), baseline.formatSqlValue(value, type));
    }
  }
  for (const type of ["json", "jsonb"]) {
    assert.equal(candidate.formatSqlValue(sample, type), baseline.formatSqlValue(sample, type));
  }
  assert.equal(candidate.formatSqlValue([sample, new Uint8Array(), null], "bytea[]"),
    `ARRAY[decode('${sampleHex}', 'hex'), decode('', 'hex'), NULL]::bytea[]`);
});

test("artifact integration rejects modified or already patched distributions", async () => {
  const source = await readFile(new URL("../upstream/lite-0.11.0/dist/cli/index.js", import.meta.url), "utf8");
  assert.equal(source.split(originalFallback).length - 1, 1);
  const patched = patchUpgradeBinary(source);
  assert.match(patched, /let binary=formatBinaryValue\(e\);if\(binary!==undefined\)return binary;/);
  assert.throws(() => patchUpgradeBinary(source + "\n"), /unrecognized/);
  assert.throws(() => patchUpgradeBinary(source.replace(originalFallback, "return ''")), /unrecognized/);
  assert.throws(() => patchUpgradeBinary(patched), /unrecognized/);
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
    const target = new PGlite();
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
      const stock = await baseline.exportUserData(app, source);
      const fixed = await candidate.exportUserData(app, source);
      assert.deepEqual(fixed.map(({ table }) => table), ["z_binary_records", "a_binary_refs"]);
      assert.deepEqual(fixed.map(({ sequenceResets }) => sequenceResets), stock.map(({ sequenceResets }) => sequenceResets));
      assert.deepEqual(fixed[1], stock[1], "FK child and generated-column exclusion stay unchanged");
      assert.doesNotMatch(fixed[1].inserts[0], /"doubled"/);
      assert.equal(fixed[0].inserts[2], stock[0].inserts[2], "NULL values stay unchanged");
      assert.ok(stock[0].inserts[0].includes(backend === "libsql"
        ? "'{}'::jsonb" : `'${JSON.stringify(sample)}'::jsonb`));
      assert.ok(fixed[0].inserts[0].includes(`decode('${sampleHex}', 'hex')`));
      assert.ok(fixed[0].inserts[1].includes("decode('', 'hex')"));

      await target.exec(ddl);
      await assert.rejects(target.exec(stock[0].inserts[0]), { code: "42804" });
      await assert.rejects(target.exec(stock[0].inserts[1]), { code: "42804" });
      for (const group of fixed) for (const sql of group.inserts) await target.exec(sql);
      for (const group of fixed) for (const sql of group.sequenceResets) await target.exec(sql);
      const rows = (await target.query(`SELECT id, label, encode(content, 'hex') AS content_hex,
        content IS NULL AS null_content, payload FROM z_binary_records ORDER BY id`)).rows;
      assert.deepEqual(rows, expected);
      assert.deepEqual((await target.query("SELECT * FROM a_binary_refs")).rows, [{ id: 100, parent_id: 10, doubled: 200 }]);
      assert.deepEqual((await target.query("INSERT INTO z_binary_records (label) VALUES ('new') RETURNING id")).rows, [{ id: 41 }]);
      assert.deepEqual((await target.query("INSERT INTO a_binary_refs (parent_id) VALUES (41) RETURNING id, doubled")).rows, [{ id: 101, doubled: 202 }]);
      assert.deepEqual(await snapshot(), initial, "export must not mutate source rows");
    } finally {
      await close();
      await target.close();
    }
  });
}
