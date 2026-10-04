import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setImmediate as turn } from "node:timers/promises";
import { DatabaseSync } from "node:sqlite";
import { upgradeApi, migration } from "./helpers/upgrade-streaming.mjs";
import { beginReadSnapshot, sqlBatches } from "../dist/upgrade/sqlite-streaming.js";

// These tests use the actual guarded co/Lc functions and native SQLite sources.
// The lightweight SQLite sink supports the simple SQL fixtures used here; it is
// deliberately not a replacement for the separate PostgreSQL parity suite.
const api = await upgradeApi();
const { createConnection } = await import("../.generated/baseline/node_modules/@supabase/lite/dist/db/node/index.js");
const options = { migrateSessions: false, syncAuthConfig: false };
const dataSql = table => `SELECT * FROM "${table}"`;
const countSql = table => `SELECT COUNT(*) AS count FROM (${dataSql(table)})`;
const plain = rows => rows.map(row => ({ ...row }));

async function fixture(t, { journal = "DELETE", tables = { records: 125 }, label = id => `row${id}` } = {}) {
  const directory = await mkdtemp(join(tmpdir(), "lite-direct-lifecycle-"));
  const path = join(directory, "source.db");
  const connection = createConnection({ url: path });
  const db = connection.driver;
  db.exec(`PRAGMA journal_mode=${journal}; PRAGMA busy_timeout=1`);
  const ddl = Object.keys(tables).map(table => `CREATE TABLE ${table} (id integer PRIMARY KEY, label text);`).join("\n");
  db.exec(ddl);
  for (const [table, count] of Object.entries(tables)) {
    const insert = db.prepare(`INSERT INTO "${table}" VALUES (?, ?)`);
    db.exec("BEGIN");
    for (let id = 1; id <= count; id++) insert.run(id, label(id, table));
    db.exec("COMMIT");
  }
  const other = new DatabaseSync(path);
  other.exec("PRAGMA busy_timeout=1");
  t.after(async () => {
    if (db.isTransaction) db.exec("ROLLBACK");
    other.close();
    await connection.close();
    await rm(directory, { recursive: true, force: true });
  });
  return { connection, db, other, app: { connection, config: { auth: { enabled: false } } }, schema: migration(ddl) };
}

function instrument(t, db, tables = ["records"], { failReadAt, countDelta = 0, failCount = false } = {}) {
  const prepare = db.prepare.bind(db);
  const stats = Object.fromEntries(tables.map(table => [table, { rows: 0, opened: 0, returned: 0, eof: false, counts: 0 }]));
  db.prepare = sql => {
    const statement = prepare(sql);
    for (const table of tables) {
      const state = stats[table];
      if (sql === countSql(table)) {
        const get = statement.get.bind(statement);
        statement.get = (...args) => {
          state.counts++;
          if (failCount) throw new Error("injected count failure");
          const result = get(...args);
          return { ...result, count: result.count + countDelta };
        };
      }
      if (sql === dataSql(table)) {
        statement.all = () => { throw new Error("eager application all() is forbidden"); };
        const iterate = statement.iterate.bind(statement);
        statement.iterate = (...args) => {
          state.opened++;
          const cursor = iterate(...args);
          return {
            next() {
              if (failReadAt && state.rows + 1 === failReadAt) throw new Error("injected read failure");
              const next = cursor.next();
              if (next.done) state.eof = true;
              else state.rows++;
              return next;
            },
            return() { state.returned++; return cursor.return(); },
            [Symbol.iterator]() { return this; },
          };
        };
      }
    }
    return statement;
  };
  t.after(() => { db.prepare = prepare; });
  return stats;
}

function sink(t, { pauseFirst = false, reject } = {}) {
  const target = new DatabaseSync(":memory:");
  const entered = Promise.withResolvers(), resume = Promise.withResolvers();
  const calls = [];
  t.after(() => { resume.resolve(); target.close(); });
  return {
    target, calls, entered: entered.promise, resume: resume.resolve,
    async runSql(sql) {
      if (!sql.startsWith('INSERT INTO "public".')) {
        target.exec(sql.replaceAll('"public".', ""));
        return;
      }
      if (reject?.(sql)) throw new Error("injected target rejection");
      target.exec(sql.replaceAll('"public".', ""));
      calls.push(sql);
      if (pauseFirst && calls.length === 1) {
        entered.resolve();
        await resume.promise;
      }
    },
  };
}

async function untilPaused(target, run) {
  await Promise.race([target.entered, run.then(() => { throw new Error("apply finished before the first data sink"); })]);
}

function progress() {
  const starts = [], updates = [], ends = [];
  return {
    starts, updates, ends,
    handlers: {
      onBatchStart: (label, total) => starts.push([label, total]),
      onBatchProgress: (label, done, total) => updates.push([label, done, total]),
      onBatchEnd: (label, total) => ends.push([label, total]),
    },
  };
}

function assertProgress(events, counts) {
  for (const [table, total] of Object.entries(counts)) {
    const label = `Migrating public.${table}`;
    assert.ok(events.starts.some(event => event[0] === label && event[1] === total));
    const updates = events.updates.filter(event => event[0] === label);
    assert.ok(updates.length > 0);
    assert.deepEqual(updates.at(-1), [label, total, total]);
    updates.forEach(([, done, advertised], index) => {
      assert.equal(advertised, total);
      assert.ok(done > (index ? updates[index - 1][1] : 0) && done <= total);
    });
    assert.ok(events.ends.some(event => event[0] === label && event[1] === total));
  }
}

test("direct WAL export keeps cross-table rows and counts stable during a target await", async t => {
  const { app, connection, db, other, schema } = await fixture(t, { journal: "WAL", tables: { a_first: 125, z_second: 3 } });
  const stats = instrument(t, db, ["a_first", "z_second"]);
  const target = sink(t, { pauseFirst: true });
  const events = progress();
  const run = api.apply(app, target, schema, { ...options, ...events.handlers });
  try {
    await untilPaused(target, run);
    assert.equal(db.isTransaction, true);
    assert.equal(stats.a_first.rows, 50);
    assert.equal(stats.a_first.eof, false);
    assert.equal(stats.z_second.rows, 0, "the later table must not be eagerly consumed");
    assert.equal(stats.z_second.counts, 1);
    other.exec("BEGIN; INSERT INTO a_first VALUES (126,'late'); UPDATE z_second SET label='changed' WHERE id=1; DELETE FROM z_second WHERE id=2; INSERT INTO z_second VALUES (4,'late'); COMMIT");
    await turn();
    assert.equal(stats.a_first.rows, 50, "no source prefetch while the sink is blocked");
    assert.equal(stats.z_second.rows, 0);
  } finally { target.resume(); }
  const result = await run;
  assert.deepEqual(result.dataTables.map(table => [table.table, table.inserts.length]), [["a_first", 125], ["z_second", 3]]);
  assert.equal(target.target.prepare("SELECT count(*) AS n FROM a_first").get().n, 125);
  assert.deepEqual(plain(target.target.prepare("SELECT * FROM z_second ORDER BY id").all()), [
    { id: 1, label: "row1" }, { id: 2, label: "row2" }, { id: 3, label: "row3" },
  ]);
  assert.equal((await connection.exec("SELECT count(*) AS n FROM a_first")).rows[0].n, 126);
  assert.equal(db.isTransaction, false);
  assert.equal(stats.a_first.returned, 1);
  assert.equal(stats.z_second.returned, 1);
  assertProgress(events, { a_first: 125, z_second: 3 });
});

test("direct rollback-journal export holds its read lock across the target await and releases it on dispose", async t => {
  const { app, db, other, schema } = await fixture(t, { tables: { records: 75 } });
  const stats = instrument(t, db).records;
  const target = sink(t, { pauseFirst: true });
  const run = api.apply(app, target, schema, options);
  try {
    await untilPaused(target, run);
    assert.equal(db.isTransaction, true);
    assert.equal(stats.rows, 50);
    assert.equal(stats.returned, 0);
    assert.throws(() => other.exec("INSERT INTO records VALUES (1000,'blocked')"), /locked/);
    await turn();
    assert.equal(stats.rows, 50);
  } finally { target.resume(); }
  await run;
  assert.equal(db.isTransaction, false);
  assert.equal(stats.returned, 1);
  other.exec("INSERT INTO records VALUES (1000,'released')");
  assert.equal(target.target.prepare("SELECT count(*) AS n FROM records").get().n, 75);
});

test("early direct iteration return closes the cursor; explicit export disposal releases the owned transaction", async t => {
  const { app, connection, db, other, schema } = await fixture(t);
  const stats = instrument(t, db).records;
  const data = await api.exportUserData(app, schema);
  try {
    assert.equal(data[0].inserts.length, 125);
    assert.equal(stats.rows, 0);
    assert.equal(stats.opened, 0);
    for await (const statement of data[0].inserts) {
      assert.match(statement, /VALUES \(1, 'row1'\)/);
      break;
    }
    assert.equal(stats.rows, 1);
    assert.equal(stats.returned, 1);
    // The transaction spans all tables, so cursor return alone is not disposal.
    assert.equal(db.isTransaction, true);
    assert.throws(() => other.exec("INSERT INTO records VALUES (1000,'blocked')"), /locked/);
    await assert.rejects(async () => { for await (const _ of data[0].inserts) {} }, /only be consumed once/);
  } finally { await data.dispose(); }
  await data.dispose();
  assert.equal(db.isTransaction, false);
  other.exec("INSERT INTO records VALUES (1000,'released')");
  const next = beginReadSnapshot(connection);
  await next.dispose();
});

for (const borrowed of [false, true]) {
  test(`AbortSignal immediately closes a suspended cursor and ${borrowed ? "preserves the caller transaction" : "rolls back the owned transaction"}`, async t => {
    const { connection, db, other } = await fixture(t, { journal: "WAL" });
    if (borrowed) db.exec("BEGIN; INSERT INTO records VALUES (126,'pending'); UPDATE records SET label='pending edit' WHERE id=1");
    const stats = instrument(t, db).records;
    const controller = new AbortController();
    const snapshot = beginReadSnapshot(connection, { signal: controller.signal });
    const rows = snapshot.rows(dataSql("records"));
    const inserts = snapshot.statements(rows.length, async function* () {
      for await (const row of rows) yield `INSERT ${row.id}`;
    });
    const entered = Promise.withResolvers(), resume = Promise.withResolvers();
    const run = (async () => {
      try {
        for await (const batch of sqlBatches(inserts)) {
          entered.resolve(batch);
          await resume.promise;
        }
      } finally { await snapshot.dispose(); }
    })();
    const rejection = assert.rejects(run, /cancelled during sink await/);
    try {
      assert.equal((await entered.promise).length, 50);
      assert.equal(stats.rows, 50);
      controller.abort(new Error("cancelled during sink await"));
      assert.equal(stats.returned, 1, "abort must release the native cursor before the consumer resumes");
      assert.equal(db.isTransaction, borrowed);
      if (borrowed) {
        assert.equal(db.prepare("SELECT label FROM records WHERE id=126").get().label, "pending");
        assert.equal(db.prepare("SELECT label FROM records WHERE id=1").get().label, "pending edit");
        assert.equal(other.prepare("SELECT count(*) AS n FROM records").get().n, 125);
      } else other.exec("INSERT INTO records VALUES (1000,'released before consumer resumes')");
    } finally { resume.resolve(); }
    await rejection;
    assert.equal(stats.returned, 1);
    if (borrowed) {
      assert.equal(db.isTransaction, true);
      db.exec("ROLLBACK");
      assert.equal(db.prepare("SELECT count(*) AS n FROM records").get().n, 125);
      assert.equal(db.prepare("SELECT label FROM records WHERE id=1").get().label, "row1");
    }
    const next = beginReadSnapshot(connection);
    await next.dispose();
  });
}

test("an already-aborted export opens no owned transaction or cursor", async t => {
  const { connection, db } = await fixture(t);
  const controller = new AbortController();
  controller.abort(new Error("cancelled before export"));
  assert.throws(() => beginReadSnapshot(connection, { signal: controller.signal }), /cancelled before export/);
  assert.equal(db.isTransaction, false);
  const next = beginReadSnapshot(connection);
  await next.dispose();
});

for (const outcome of ["success", "source failure", "target failure"]) {
  test(`direct apply ${outcome} preserves a borrowed caller transaction and its pending writes`, async t => {
    const { app, connection, db, other, schema } = await fixture(t, { journal: "WAL" });
    db.exec("BEGIN; INSERT INTO records VALUES (126,'pending'); UPDATE records SET label='pending edit' WHERE id=1");
    const stats = instrument(t, db, ["records"], { failReadAt: outcome === "source failure" ? 61 : undefined }).records;
    const target = sink(t, { reject: outcome === "target failure" ? sql => sql.includes("'row61'") : undefined });
    const run = api.apply(app, target, schema, options);
    if (outcome === "success") await run;
    else await assert.rejects(run, outcome === "source failure" ? /injected read failure/ : /had 1 failures/);
    assert.equal(db.isTransaction, true);
    assert.equal(stats.returned, 1);
    assert.equal(db.prepare("SELECT label FROM records WHERE id=126").get().label, "pending");
    assert.equal(db.prepare("SELECT label FROM records WHERE id=1").get().label, "pending edit");
    assert.equal(other.prepare("SELECT count(*) AS n FROM records").get().n, 125);
    assert.equal(other.prepare("SELECT label FROM records WHERE id=1").get().label, "row1");
    assert.equal(target.target.prepare("SELECT count(*) AS n FROM records").get().n, outcome === "success" ? 126 : outcome === "source failure" ? 50 : 125);
    // Disposal must clear the connection-use guard even though the caller owns
    // the still-open transaction. A second snapshot must borrow it successfully.
    const second = beginReadSnapshot(connection);
    await second.dispose();
    assert.equal(db.isTransaction, true);
    db.exec("ROLLBACK");
    assert.equal(db.prepare("SELECT count(*) AS n FROM records").get().n, 125);
    other.exec("INSERT INTO records VALUES (1000,'caller released')");
  });
}

test("native count-query failure rejects rather than silently completing without a table", async t => {
  const { app, db, other, schema } = await fixture(t);
  const stats = instrument(t, db, ["records"], { failCount: true }).records;
  const target = sink(t);
  const events = progress();
  await assert.rejects(api.apply(app, target, schema, { ...options, ...events.handlers }), /injected count failure/);
  assert.equal(stats.counts, 1);
  assert.equal(stats.rows, 0);
  assert.equal(target.calls.length, 0);
  assert.deepEqual(events.ends, []);
  assert.equal(db.isTransaction, false);
  other.exec("INSERT INTO records VALUES (1000,'released')");
});

for (const failure of ["read", "formatter", "count too high", "count too low"]) {
  test(`direct ${failure} failure after a target batch rejects without false completion or undoing prior target writes`, async t => {
    const { app, connection, db, other, schema } = await fixture(t);
    const stats = instrument(t, db, ["records"], {
      failReadAt: failure === "read" ? 61 : undefined,
      countDelta: failure === "count too high" ? 1 : failure === "count too low" ? -1 : 0,
    }).records;
    if (failure === "formatter") {
      const deserialize = connection.deserializeRow?.bind(connection) ?? (row => row);
      connection.deserializeRow = row => {
        const decoded = deserialize(row);
        if (row.id === 61) decoded.label = { toJSON() { throw new Error("injected formatter failure"); } };
        return decoded;
      };
    }
    const target = sink(t), events = progress();
    const expected = failure.startsWith("count") ? /row count changed/ : new RegExp(`injected ${failure} failure`);
    await assert.rejects(api.apply(app, target, schema, { ...options, ...events.handlers }), expected);
    const committed = failure.startsWith("count") ? 100 : 50;
    assert.equal(target.target.prepare("SELECT count(*) AS n FROM records").get().n, committed);
    assert.equal(target.target.prepare("SELECT max(id) AS id FROM records").get().id, committed);
    assert.deepEqual(events.ends, []);
    const advertised = failure === "count too high" ? 126 : failure === "count too low" ? 124 : 125;
    assert.deepEqual(events.updates.at(-1), ["Migrating public.records", committed, advertised]);
    assert.ok(events.updates.every(([, done, total]) => done < total));
    assert.equal(stats.returned, 1);
    assert.equal(db.isTransaction, false);
    assert.equal(db.prepare("SELECT count(*) AS n FROM records").get().n, 125);
    other.exec("INSERT INTO records VALUES (1000,'released')");
  });
}

for (const [name, count, label] of [
  ["50-row bound", 125, id => `row${id}`],
  ["256-KiB multibyte bound", 12, () => "雪".repeat(50000)],
  ["single oversized row", 8, id => id === 1 ? "x".repeat(280000) : `row${id}`],
]) {
  test(`direct ${name} sends the first sink before source EOF and reads at most the current batch plus one row`, async t => {
    const { app, connection, db, schema } = await fixture(t, { tables: { records: count }, label });
    const stats = instrument(t, db).records;
    let formatted = 0;
    const deserialize = connection.deserializeRow?.bind(connection) ?? (row => row);
    connection.deserializeRow = row => { formatted++; return deserialize(row); };
    const target = sink(t, { pauseFirst: true }), events = progress();
    const calls = [], runSql = target.runSql.bind(target);
    target.runSql = async sql => {
      if (!sql.startsWith('INSERT INTO "public".')) return runSql(sql);
      const before = target.target.prepare("SELECT count(*) AS n FROM records").get().n;
      const rowCount = [...sql.matchAll(/\(\d+, '/g)].length;
      calls.push({ reads: stats.rows, formatted, before, rows: rowCount, bytes: Buffer.byteLength(sql, "utf8") });
      return runSql(sql);
    };
    const run = api.apply(app, target, schema, { ...options, ...events.handlers });
    try {
      await untilPaused(target, run);
      assert.equal(stats.eof, false);
      assert.ok(stats.rows < count);
      assert.ok(stats.rows <= calls[0].rows + 1);
      assert.equal(formatted, stats.rows);
      const pausedAt = stats.rows;
      await turn(); await turn();
      assert.equal(stats.rows, pausedAt, "slow sinks must exert backpressure on source reads");
    } finally { target.resume(); }
    await run;
    for (const call of calls) {
      assert.ok(call.rows <= 50);
      assert.ok(call.bytes <= 256 * 1024 || call.rows === 1);
      assert.ok(call.reads <= call.before + call.rows + 1);
      assert.equal(call.formatted, call.reads);
    }
    assert.equal(stats.rows, count);
    assert.equal(stats.returned, 1);
    assert.equal(db.isTransaction, false);
    assert.equal(target.target.prepare("SELECT count(*) AS n FROM records").get().n, count);
    assertProgress(events, { records: count });
    if (name === "50-row bound") assert.deepEqual(events.updates.map(([, done, total]) => [done, total]), [[50, 125], [100, 125], [125, 125]]);
    if (name === "single oversized row") assert.ok(calls[0].bytes > 256 * 1024 && calls[0].rows === 1);
  });
}

for (const borrowed of [false, true]) {
  for (const settlement of ["resolves", "rejects"]) {
    test(`actual Lc abort preserves its reason when an in-flight sink ${settlement}, with ${borrowed ? "borrowed" : "owned"} source transaction`, async t => {
      const { app, connection, db, other, schema } = await fixture(t);
      if (borrowed) db.exec("BEGIN; INSERT INTO records VALUES (126,'pending'); UPDATE records SET label='pending edit' WHERE id=1");
      const stats = instrument(t, db).records;
      const target = sink(t, { pauseFirst: true }), events = progress(), failures = [];
      const controller = new AbortController();
      const reason = new Error(`original Lc cancellation: ${borrowed}/${settlement}`);
      const runSql = target.runSql.bind(target);
      let attempts = 0, settled = false;
      target.runSql = async sql => {
        if (!sql.startsWith('INSERT INTO "public".')) return runSql(sql);
        attempts++;
        await runSql(sql);
        if (settlement === "rejects") throw new Error("late in-flight sink rejection");
      };
      const run = api.apply(app, target, schema, {
        ...options, ...events.handlers, signal: controller.signal,
        onBatchFailure: (...args) => failures.push(args),
      });
      run.then(() => { settled = true; }, () => { settled = true; });
      const rejection = assert.rejects(run, error => {
        assert.equal(error, reason, "cancellation must retain the exact original abort reason");
        return true;
      });
      try {
        await untilPaused(target, run);
        assert.equal(stats.rows, 50);
        assert.equal(stats.returned, 0);
        assert.equal(db.isTransaction, true);
        assert.throws(() => other.exec("INSERT INTO records VALUES (1000,'blocked')"), /locked/);
        controller.abort(reason);
        assert.equal(stats.returned, 1, "actual Lc must propagate its signal into the live source snapshot");
        assert.equal(db.isTransaction, borrowed);
        if (borrowed) {
          assert.equal(db.prepare("SELECT label FROM records WHERE id=126").get().label, "pending");
          assert.equal(db.prepare("SELECT label FROM records WHERE id=1").get().label, "pending edit");
          assert.equal(other.prepare("SELECT count(*) AS n FROM records").get().n, 125);
          assert.equal(other.prepare("SELECT label FROM records WHERE id=1").get().label, "row1");
          assert.throws(() => other.exec("INSERT INTO records VALUES (1000,'still caller locked')"), /locked/);
        } else {
          other.exec("INSERT INTO records VALUES (1000,'released while sink still awaits')");
        }
        await turn(); await turn();
        assert.equal(settled, false, "the sink remains in-flight while source cleanup is already complete");
        assert.equal(attempts, 1);
        assert.equal(stats.rows, 50);
        assert.deepEqual(events.updates, []);
        assert.deepEqual(events.ends, []);
        assert.deepEqual(failures, []);
      } finally { target.resume(); }
      await rejection;
      assert.equal(attempts, 1, "no next batch or retry may start after cancellation");
      assert.equal(target.calls.length, 1);
      assert.equal(target.target.prepare("SELECT count(*) AS n FROM records").get().n, 50);
      assert.equal(stats.rows, 50);
      assert.equal(stats.returned, 1);
      assert.deepEqual(events.updates, []);
      assert.deepEqual(events.ends, []);
      assert.deepEqual(failures, []);
      assert.equal(db.isTransaction, borrowed);
      if (borrowed) {
        assert.equal(db.prepare("SELECT label FROM records WHERE id=126").get().label, "pending");
        assert.equal(db.prepare("SELECT label FROM records WHERE id=1").get().label, "pending edit");
        db.exec("ROLLBACK");
        assert.equal(db.prepare("SELECT count(*) AS n FROM records").get().n, 125);
        assert.equal(db.prepare("SELECT label FROM records WHERE id=1").get().label, "row1");
        other.exec("INSERT INTO records VALUES (1000,'caller released')");
      }
      const next = beginReadSnapshot(connection);
      await next.dispose();
    });
  }
}

for (const count of [1, 50, 75]) {
  test(`actual Lc cancellation from final progress at ${count} rows rejects without completion or failure callbacks`, async t => {
    const { app, db, other, schema } = await fixture(t, { tables: { records: count } });
    const stats = instrument(t, db).records;
    const target = sink(t), events = progress(), failures = [];
    const controller = new AbortController(), reason = new Error(`cancelled at final progress ${count}`);
    const run = api.apply(app, target, schema, {
      ...options, ...events.handlers, signal: controller.signal,
      onBatchProgress: (label, done, total) => {
        events.handlers.onBatchProgress(label, done, total);
        if (done === total) controller.abort(reason);
      },
      onBatchFailure: (...args) => failures.push(args),
    });
    await assert.rejects(run, error => {
      assert.equal(error, reason);
      return true;
    });
    assert.deepEqual(events.updates.at(-1), ["Migrating public.records", count, count]);
    assert.deepEqual(events.ends, []);
    assert.deepEqual(failures, []);
    assert.equal(target.calls.length, Math.ceil(count / 50));
    assert.equal(target.target.prepare("SELECT count(*) AS n FROM records").get().n, count);
    assert.equal(stats.rows, count);
    assert.equal(stats.returned, 1);
    assert.equal(db.isTransaction, false);
    other.exec("INSERT INTO records VALUES (1000,'released after final progress cancellation')");
  });
}
