// Opt-in full-pipeline scale worker. Run scripts/benchmark-streaming.mjs.
// Keep every source/verification scan bounded; never materialize exported SQL.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { DatabaseSync } from "node:sqlite";
import { performance } from "node:perf_hooks";
import { PGlite } from "@electric-sql/pglite";
import { upgradeApi } from "./helpers/upgrade-streaming.mjs";

export const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const cliPath = flavor => join(root, `.generated/${flavor}/node_modules/@supabase/lite/dist/cli/index.js`);
const canonical = value => typeof value === "string" ? value : JSON.stringify(value);
const hashRow = (hash, row) => hash.update(String(row.id)).update("\0").update(canonical(row.payload)).update("\0");
const sourceName = table => `"app.${table}"`;
const targetName = table => `"app"."${table}"`;

export async function createScaleFixture(project, { kind = "text", rows = 12288, rowBytes = 8192 } = {}) {
  assert.ok(["text", "json"].includes(kind));
  const names = kind === "text" ? ["text_a", "text_b", "text_c"] : ["json_rows"];
  assert.equal(rows % names.length, 0, "Rows must divide evenly between fixture tables");
  assert.ok(rowBytes >= 128);
  await mkdir(join(project, "supabase/migrations"), { recursive: true });
  await mkdir(join(project, "home"), { recursive: true });
  await mkdir(join(project, "tmp"), { recursive: true });
  await writeFile(join(project, "supabase/config.toml"), `project_id = "streaming-scale-${kind}"
[db]
driver = "sqlite-postgres"
url = "file:./supabase/source.db"
[auth]
enabled = false
[storage]
enabled = false
[realtime]
enabled = false
`);
  const sql = "CREATE SCHEMA app;\n" + names.map(table =>
    `CREATE TABLE app.${table} (id integer PRIMARY KEY, payload ${kind === "json" ? "jsonb" : "text"} NOT NULL);`).join("\n");
  await writeFile(join(project, "supabase/migrations/20260101000000_scale.sql"), sql);
  const db = new DatabaseSync(join(project, "supabase/source.db"));
  const manifest = { kind, rows, rowBytes, payloadBytes: rows * rowBytes, tables: [] };
  try {
    db.exec("BEGIN");
    for (const table of names) {
      db.exec(`CREATE TABLE ${sourceName(table)} (id integer PRIMARY KEY, payload ${kind === "json" ? "jsonb" : "text"} NOT NULL)`);
      const insert = db.prepare(`INSERT INTO ${sourceName(table)} (id,payload) VALUES (?,?)`);
      const hash = createHash("sha256");
      for (let id = 1; id <= rows / names.length; id++) {
        const prefix = `${table}:${id}:O'Brien:\\newline\n`;
        // JSON escaping of the slash/newline consumes two more bytes.
        const payload = kind === "json"
          ? JSON.stringify({ data: prefix + "x".repeat(rowBytes - Buffer.byteLength(JSON.stringify({ data: prefix }))) })
          : prefix + "x".repeat(rowBytes - Buffer.byteLength(prefix));
        assert.equal(Buffer.byteLength(payload), rowBytes);
        insert.run(id, payload);
        hashRow(hash, { id, payload });
      }
      manifest.tables.push({ schema: "app", table, rows: rows / names.length, sha256: hash.digest("hex") });
    }
    db.exec("COMMIT");
  } finally { db.close(); }
  manifest.sqliteBytes = (await stat(join(project, "supabase/source.db"))).size;
  await writeFile(join(project, "fixture.json"), JSON.stringify(manifest, null, 2) + "\n");
  return manifest;
}

export async function verifySource(project, manifest) {
  const db = new DatabaseSync(join(project, "supabase/source.db"), { readOnly: true });
  try {
    for (const table of manifest.tables) {
      const hash = createHash("sha256");
      let rows = 0;
      for (const row of db.prepare(`SELECT id,payload FROM ${sourceName(table.table)} ORDER BY id`).iterate()) {
        hashRow(hash, row); rows++;
      }
      assert.equal(rows, table.rows);
      assert.equal(hash.digest("hex"), table.sha256, `Unchanged source ${table.table}`);
    }
  } finally { db.close(); }
}

export async function runTargetWorker(project, flavor = "streaming") {
  const oldSpaceLimitMiB = Number(process.execArgv.find(arg => arg.startsWith("--max-old-space-size="))?.split("=")[1]);
  assert.ok(Number.isSafeInteger(oldSpaceLimitMiB) && oldSpaceLimitMiB > 0, "Declare the worker old-space cap");
  const manifest = JSON.parse(await readFile(join(project, "fixture.json"), "utf8"));
  const api = await upgradeApi(flavor);
  const { createApi } = await import(pathToFileURL(join(root, `.generated/${flavor}/node_modules/@supabase/lite/dist/cli/lib.js`)));
  const local = await createApi({ root: project, withSupabaseClient: false });
  const app = await local.project.local.createApp(undefined, { admin: false });
  assert.equal(app.config.auth.enabled, false);
  const schema = await api.schema(app);
  const started = performance.now();
  let stage = "setup", peakHeapUsed = 0, peakRss = 0;
  const sample = () => {
    const memory = process.memoryUsage();
    peakHeapUsed = Math.max(peakHeapUsed, memory.heapUsed);
    peakRss = Math.max(peakRss, memory.rss);
  };
  const timer = setInterval(sample, 10); timer.unref();
  const reads = { readiness: 0, audit: 0, apply: 0 };
  let bulkReadAttempts = 0, maxTargetSqlBytes = 0, dataCalls = 0, firstInsertSourceRows = null;
  const prepare = app.connection.driver.prepare.bind(app.connection.driver);
  // Instrument the native driver, below connection.exec(). A swallowed .all()
  // failure still increments bulkReadAttempts and fails the final assertion.
  app.connection.driver.prepare = sql => {
    const statement = prepare(sql);
    const appScan = /^SELECT\b/i.test(sql.trim()) && /\bFROM\s+"app\./i.test(sql) && !/\bCOUNT\s*\(/i.test(sql);
    if (!appScan) return statement;
    return new Proxy(statement, { get(target, key) {
      if (key === "all") return (...args) => {
        bulkReadAttempts++;
        if (flavor !== "baseline") throw new Error("Application .all() scan forbidden in streaming scale verification");
        const rows = target.all(...args); reads[stage] = (reads[stage] ?? 0) + rows.length; sample(); return rows;
      };
      if (key === "iterate") return function* (...args) {
        for (const row of target.iterate(...args)) {
          reads[stage] = (reads[stage] ?? 0) + 1;
          if (reads[stage] % 64 === 0) sample();
          yield row;
        }
      };
      const value = Reflect.get(target, key, target);
      return typeof value === "function" ? value.bind(target) : value;
    } });
  };
  // Fresh local PGlite is the actual shared Lc target, with its native runSql
  // adapter. Its WASM/native memory is outside the bounded application-JS claim.
  const target = new PGlite();
  try {
    stage = "readiness";
    const readiness = await api.readiness(app, schema);
    assert.equal(readiness.ok, true);
    for (const expected of manifest.tables) {
      const actual = readiness.tables.find(table => table.schema === "app" && table.table === expected.table);
      assert.equal(actual?.rowCount, expected.rows);
      assert.deepEqual(actual.issues, []);
    }
    stage = "audit";
    const audit = await api.audit(app, schema);
    assert.equal(audit.summary.upgrade_safe, true);
    if (manifest.kind === "json") {
      assert.equal(audit.results.length, 1);
      assert.equal(audit.results[0].rows_checked, manifest.rows);
      assert.equal(reads.readiness, manifest.rows, "Heavy readiness validation actually scanned every JSON row");
      assert.equal(reads.audit, manifest.rows, "Heavy audit actually scanned every JSON row");
    }
    stage = "apply";
    const applyStarted = performance.now(), applyCpuStarted = process.cpuUsage();
    const result = await api.apply(app, { runSql: async sql => {
      sample();
      if (/INSERT INTO "app"\./.test(sql)) {
        dataCalls++;
        firstInsertSourceRows ??= reads.apply;
        maxTargetSqlBytes = Math.max(maxTargetSqlBytes, Buffer.byteLength(sql));
      }
      await target.exec(sql);
    } }, schema, { migrateSessions: false, authTarget: "local", syncAuthConfig: false });
    const applyElapsedMs = performance.now() - applyStarted, applyCpuUsage = process.cpuUsage(applyCpuStarted);
    const pipelineElapsedMs = performance.now() - started;
    assert.equal(reads.apply, manifest.rows);
    if (flavor === "baseline") {
      assert.equal(firstInsertSourceRows, manifest.rows);
      assert.ok(bulkReadAttempts > 0);
    } else {
      assert.ok(firstInsertSourceRows > 0 && firstInsertSourceRows <= 51 && firstInsertSourceRows < manifest.rows, "Direct source is backpressured before its first target write");
      assert.equal(bulkReadAttempts, 0);
      assert.ok(maxTargetSqlBytes <= 256 * 1024, "Target application SQL stays byte bounded for these fixture rows");
    }
    assert.equal(result.dataTables.reduce((sum, table) => sum + table.inserts.length, 0), manifest.rows);
    assert.equal(app.connection.driver.isTransaction, false, "Owned source read transaction released");
    const verified = [];
    for (const table of manifest.tables) {
      const count = await target.query(`SELECT count(*)::integer AS count FROM ${targetName(table.table)}`);
      assert.equal(count.rows[0].count, table.rows);
      const hash = createHash("sha256");
      let lastId = 0, rows = 0, maxPageRows = 0;
      while (true) {
        // Keyset pages keep verification bounded too: <=32 source-sized rows.
        const page = await target.query(`SELECT id,payload FROM ${targetName(table.table)} WHERE id > $1 ORDER BY id LIMIT 32`, [lastId]);
        if (!page.rows.length) break;
        maxPageRows = Math.max(maxPageRows, page.rows.length);
        for (const row of page.rows) { hashRow(hash, row); lastId = row.id; rows++; }
        sample();
      }
      const sha256 = hash.digest("hex");
      assert.equal(rows, table.rows);
      assert.equal(sha256, table.sha256, `All target bytes match ${table.table}`);
      verified.push({ table: table.table, rows, sha256, maxPageRows });
    }
    await verifySource(project, manifest);
    sample();
    return { kind: manifest.kind, rows: manifest.rows, payloadBytes: manifest.payloadBytes,
      oldSpaceLimitMiB, applyElapsedMs: Math.round(applyElapsedMs), applyCpuUsage, pipelineElapsedMs: Math.round(pipelineElapsedMs), elapsedMs: Math.round(performance.now() - started),
      peakHeapUsedBytes: peakHeapUsed, peakRssBytes: peakRss, maxRssKiB: process.resourceUsage().maxRSS,
      nativeSourceRowsByStage: reads, bulkReadAttempts, firstInsertSourceRows, dataCalls, maxTargetSqlBytes,
      readinessOk: readiness.ok, auditSummary: audit.summary, verified, sourceSnapshotReleased: flavor === "streaming" ? true : undefined };
  } finally {
    clearInterval(timer);
    await target.close();
    await app.connection.close();
  }
}

if (process.argv[2] === "--worker") {
  const result = await runTargetWorker(resolve(process.argv[3]), process.argv[4] ?? "streaming");
  console.log(`STREAMING_SCALE_RESULT:${JSON.stringify(result)}`);
}
