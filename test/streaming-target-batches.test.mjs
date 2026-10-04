import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { createHarness } from "./helpers/lite.mjs";
import { upgradeApi, migration } from "./helpers/upgrade-streaming.mjs";
const api = await upgradeApi();
const ddl = "CREATE TABLE records (id integer PRIMARY KEY, label text);";
const literal = value => `'${value.replaceAll("'", "''")}'`;

async function fixture(run) {
  const directory = await mkdtemp(join(tmpdir(), "lite-stream-batch-test-"));
  const previous = process.env.TMPDIR;
  process.env.TMPDIR = directory;
  const harness = await createHarness({ ddl });
  const target = new PGlite();
  try {
    await run({ ...harness, target });
    assert.deepEqual(await readdir(directory), []);
  } finally {
    await harness.close(); await target.close();
    if (previous === undefined) delete process.env.TMPDIR;
    else process.env.TMPDIR = previous;
    await rm(directory, { recursive: true, force: true });
  }
}

test("real target applies 125 rows with absolute 50/100/125 progress", () => fixture(async ({ app, connection, target }) => {
  for (let id = 1; id <= 125; id++) await connection.exec(`INSERT INTO records VALUES (${id},'row${id}')`);
  const events = [], calls = [];
  const result = await api.apply(app, { runSql: async sql => {
    if (sql.startsWith("INSERT")) calls.push(sql);
    await target.exec(sql);
  } }, migration(ddl), { migrateSessions: false, syncAuthConfig: false,
    onBatchProgress: (_, done, total) => events.push([done, total]),
  });
  assert.equal(result.dataTables[0].inserts.length, 125);
  assert.equal(calls.length, 3);
  assert.deepEqual(events, [[50, 125], [100, 125], [125, 125]]);
  assert.equal((await target.query("SELECT count(*)::integer AS n FROM records")).rows[0].n, 125);
}));

test("real target retries one rejected row through 50/10/1 across chunks", () => fixture(async ({ app, connection, target }) => {
  for (let id = 1; id <= 125; id++) await connection.exec(`INSERT INTO records VALUES (${id},'${id === 57 ? "bad" : `row${id}`}')`);
  const events = [], failures = [], rejectedCalls = [];
  let ends = 0;
  await assert.rejects(api.apply(app, { runSql: async sql => {
    if (sql.includes("'bad'")) { rejectedCalls.push(sql); throw new Error("injected row rejection"); }
    await target.exec(sql);
  } }, migration(ddl), { migrateSessions: false, syncAuthConfig: false,
    onBatchProgress: (_, done, total) => events.push([done, total]),
    onBatchFailure: (_, errors) => failures.push(...errors), onBatchEnd: () => ends++,
  }), /had 1 failures/);
  assert.equal(ends, 0);
  assert.equal(failures.length, 1);
  assert.match(failures[0].statement, /\(57, 'bad'\)/);
  assert.equal(rejectedCalls.length, 3);
  assert.deepEqual(events.at(-1), [125, 125]);
  assert.ok(events.every((value, index) => index === 0 || value[0] > events[index - 1][0]));
  assert.equal((await target.query("SELECT count(*)::integer AS n FROM records")).rows[0].n, 124);
  assert.equal((await connection.exec("SELECT COUNT(*) AS n FROM records")).rows[0].n, 125);
}));

test("multibyte and multiline SQL round-trips; an oversized statement is sent alone", () => fixture(async ({ app, connection, target }) => {
  const values = ["雪😀'\n".repeat(15000), "x".repeat(280000), "tail"];
  for (let i = 0; i < values.length; i++) await connection.exec(`INSERT INTO records VALUES (${i + 1},${literal(values[i])})`);
  const calls = [];
  await api.apply(app, { runSql: async sql => {
    if (sql.startsWith("INSERT")) calls.push(sql);
    await target.exec(sql);
  } }, migration(ddl), { migrateSessions: false, syncAuthConfig: false });
  assert.deepEqual((await target.query("SELECT label FROM records ORDER BY id")).rows.map(row => row.label), values);
  assert.equal(calls.length, 3);
  assert.ok(Buffer.byteLength(calls[1]) > 256 * 1024);
  assert.ok(!calls[1].includes("tail"));
}));
