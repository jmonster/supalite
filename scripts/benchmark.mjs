#!/usr/bin/env node
/**
 * Local, deterministic containment benchmarks. The supervisor can stop a
 * synchronous SQLite regression even when the worker's JS event loop is busy.
 * Run `npm run benchmark`; output is reports/benchmark.json (gitignored).
 */
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, rename, rm, writeFile } from "node:fs/promises";
import { availableParallelism, cpus, platform, arch } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const filename = fileURLToPath(import.meta.url);
const root = resolve(dirname(filename), "..");
const output = resolve(root, "reports/benchmark.json");
const args = process.argv.slice(2);
const worker = args.includes("--worker");
const budgetArg = args.find((arg) => arg.startsWith("--budget-ms="));
const budgetMs = Number(budgetArg?.split("=")[1] ?? 50_000);
if (!Number.isSafeInteger(budgetMs) || budgetMs < 1_000 || budgetMs > 600_000) {
  throw new Error("--budget-ms must be an integer from 1000 to 600000");
}

if (!worker) {
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, JSON.stringify({ status: "starting", budgetMs }, null, 2));
  const child = spawn(process.execPath, [filename, "--worker", `--budget-ms=${budgetMs}`], {
    cwd: root,
    stdio: "inherit",
    env: process.env,
  });
  let timedOut = false;
  let forceTimer;
  const timer = setTimeout(() => {
    timedOut = true;
    console.error(`Benchmark exceeded its ${budgetMs} ms safety budget; stopping worker`);
    child.kill("SIGTERM");
    forceTimer = setTimeout(() => child.kill("SIGKILL"), 2_000);
  }, budgetMs);
  const outcome = await new Promise((resolveOutcome, reject) => {
    child.once("error", reject);
    child.once("exit", (code, signal) => resolveOutcome({ code, signal }));
  });
  clearTimeout(timer);
  if (forceTimer) clearTimeout(forceTimer);
  await rm(`${output}.tmp`, { force: true });
  if (timedOut || outcome.code !== 0) {
    const partial = JSON.parse(await readFile(output, "utf8"));
    partial.status = timedOut ? "incomplete-timeout" : "failed";
    partial.workerOutcome = outcome;
    await writeFile(output, JSON.stringify(partial, null, 2) + "\n");
    process.exitCode = 1;
  }
} else {
  await runBenchmarks();
}

async function runBenchmarks() {
  // Dynamic imports let the supervisor start before loading the database code.
  const { sql } = await import("kysely");
  const { jsonbContainment } = await import("../dist/jsonb-containment.js");
  const { createHarness } = await import("../test/helpers/lite.mjs");
  const started = performance.now();
  const coreFiles = (await readdir(resolve(root, "dist")))
    .filter((name) => /^jsonb-.*\.js$/.test(name)).sort();
  const core = Buffer.concat(await Promise.all(coreFiles.map(async (name) =>
    Buffer.concat([Buffer.from(`// ${name}\n`), await readFile(resolve(root, "dist", name)), Buffer.from("\n")]))));
  const report = {
    status: "running",
    generatedAt: new Date().toISOString(),
    environment: {
      node: process.version,
      platform: platform(),
      architecture: arch(),
      cpu: cpus()[0]?.model ?? "unknown",
      availableParallelism: availableParallelism(),
      sqlite: {},
    },
    method: {
      safetyBudgetMs: budgetMs,
      warmupRuns: 1,
      measuredRuns: 3,
      statistic: "median",
      seed: "deterministic index modulo 10; no randomness",
      request: "Actual supabase-js -> in-process Lite Request/Response, exact count and HEAD",
      nodeSql: "Prepared node:sqlite statement execution; prepare reported separately",
      libsqlSql: "Local @libsql/client execute, including its preparation/driver overhead",
      limitations: "Local in-memory databases, no network, no hosted D1/Bun/browser claim; direct SQL assumes this fixed schema and is not a generic containment replacement",
    },
    codeSize: {
      files: coreFiles,
      emittedJavaScriptBytes: core.length,
      concatenatedGzipBytes: gzipSync(core).length,
      sha256: createHash("sha256").update(core).digest("hex"),
      scope: "Unminified emitted JSONB core/helper JS only; excludes adapter, Kysely, SQLite engines and package dependencies",
    },
    results: [],
  };
  const save = async () => {
    await writeFile(`${output}.tmp`, JSON.stringify(report, null, 2) + "\n");
    await rename(`${output}.tmp`, output);
  };
  const harnesses = [];
  await save();
  try {
    for (const backend of ["node", "libsql"]) {
      const baseline = await createHarness({ flavor: "baseline", backend,
        ddl: "create table bench_docs(id integer primary key,body jsonb);" });
      const patched = await createHarness({ flavor: "patched", backend,
        ddl: "create table bench_docs(id integer primary key,body jsonb); create table bench_probe(id integer primary key,body jsonb);" });
      harnesses.push(baseline, patched);
      const baseDriver = driverFor(baseline.connection, backend);
      const driver = driverFor(patched.connection, backend);
      report.environment.sqlite[backend] = (await driver.execute("select sqlite_version() as version", []))[0].version;
      const documents = Array.from({ length: 10_000 }, (_, index) => {
        const match = index % 10 === 0;
        return [index + 1, JSON.stringify({
          status: match ? "open" : "closed",
          profile: { plan: match ? "pro" : "free", region: "EU" },
          variants: [{ color: "blue", size: match ? "M" : "S", stock: 3 }, { color: "red", size: "M" }],
          notes: "x".repeat(500),
        })];
      });
      await baseDriver.seed(documents);
      await driver.seed(documents);
      const meanDocumentBytes = documents.reduce((sum, [, body]) => sum + Buffer.byteLength(body), 0) / documents.length;
      const shapes = [
        { name: "shallow-object", filter: { status: "open" }, baselineComparable: true,
          direct: "json_type(body)='object' and json_type(body,'$.status')='text' and json_extract(body,'$.status')='open'" },
        { name: "nested-object", filter: { profile: { plan: "pro" } }, baselineComparable: false,
          direct: "json_type(body)='object' and json_type(body,'$.profile')='object' and json_type(body,'$.profile.plan')='text' and json_extract(body,'$.profile.plan')='pro'" },
        { name: "same-variant", filter: { variants: [{ color: "blue", size: "M" }] }, baselineComparable: false,
          direct: "json_type(body,'$.variants')='array' and exists(select 1 from json_each(body,'$.variants') v where json_type(v.value)='object' and json_extract(v.value,'$.color')='blue' and json_extract(v.value,'$.size')='M')" },
      ];
      for (const rows of [1_000, 10_000]) {
        for (const shape of shapes) {
          const common = { backend, scenario: shape.name, rows, meanDocumentBytes, expectedMatches: rows / 10 };
          if (shape.baselineComparable) await requestBenchmark(baseline, shape, rows, { ...common, implementation: "published-0.11.0" });
          await requestBenchmark(patched, shape, rows, { ...common, implementation: "patched" });
          const compileStart = performance.now();
          const predicate = jsonbContainment(sql.ref("bench_docs.body"), shape.filter, "contains");
          const compiled = sql`select count(*) as matches from bench_docs where id <= ${rows} and ${predicate}`.compile(patched.connection.kysely);
          await sqlBenchmark(driver, compiled, { ...common, implementation: "compiler", compileMs: performance.now() - compileStart });
          await sqlBenchmark(driver, { sql: `select count(*) as matches from bench_docs where id <= ? and (${shape.direct})`, parameters: [rows] },
            { ...common, implementation: "schema-specific-reference", compileMs: null });
        }
      }

      for (const width of [100, 1_000, 5_000]) {
        const cases = [
          { name: "wide-primitives", body: Array(width).fill(1), filter: [1], expected: { contains: 1, containedBy: 1 } },
          { name: "wide-objects", body: Array.from({ length: width }, (_, id) => ({ sku: "x", id, sizes: ["S", "M"] })),
            filter: [{ sku: "x", sizes: ["M"] }], expected: { contains: 1, containedBy: 0 } },
          { name: "wide-objects-general", body: Array.from({ length: width }, (_, id) => ({ sku: "x", meta: { nested: { flag: true, id } } })),
            filter: [{ sku: "x", meta: { nested: { flag: true } } }], expected: { contains: 1, containedBy: 0 } },
        ];
        for (const entry of cases) {
          await probe(entry.name, entry.body, entry.filter, entry.expected, { width });
        }
      }
      for (const kind of ["object", "mixed"]) {
        let value = 1;
        for (let depth = 0; depth < 16; depth++) value = kind === "mixed" && depth % 2 ? [value] : { child: value };
        await probe(`filter-depth16-${kind}`, value, value, { contains: 1, containedBy: 1 }, { filterDepth: 16 });
      }
      let deep = {};
      for (let depth = 0; depth < 128; depth++) deep = { next: deep };
      await probe("deep-source-pruned-general", { "items.with.dot": [{ meta: { keep: { deep } } }] },
        { "items.with.dot": [{ meta: { keep: {} } }] }, { contains: 1, containedBy: 0 }, { irrelevantBranchDepth: 128, filterDepth: 4 });

      async function probe(scenario, body, filter, expected, extra) {
        const serialized = JSON.stringify(body);
        await driver.execute("delete from bench_probe", []);
        await driver.execute("insert into bench_probe values (1, ?)", [serialized]);
        for (const direction of ["contains", "containedBy"]) {
          const begin = performance.now();
          const predicate = jsonbContainment(sql.ref("bench_probe.body"), filter, direction);
          const compiled = sql`select count(*) as matches from bench_probe where ${predicate}`.compile(patched.connection.kysely);
          await sqlBenchmark(driver, compiled, { backend, scenario, implementation: "compiler", direction,
            rows: 1, documentBytes: Buffer.byteLength(serialized), expectedMatches: expected[direction],
            compileMs: performance.now() - begin, ...extra });
        }
      }
    }
    report.status = "complete";
    report.elapsedMs = performance.now() - started;
    await save();
    console.log(`\n${report.results.length} verified benchmark cases; ${Math.round(report.elapsedMs)} ms total`);
    console.log(`JSONB emitted core: ${report.codeSize.emittedJavaScriptBytes} bytes; gzip ${report.codeSize.concatenatedGzipBytes} bytes`);
    console.log("Full results: reports/benchmark.json");
  } catch (error) {
    report.status = "failed";
    report.error = error instanceof Error ? error.message : String(error);
    await save();
    throw error;
  } finally {
    for (const harness of harnesses) await harness.close();
  }

  async function requestBenchmark(harness, shape, rows, metadata) {
    await measure({ ...metadata, layer: "request", timingScope: report.method.request }, async () => {
      const result = await harness.client.from("bench_docs").select("id", { head: true, count: "exact" })
        .lte("id", rows).contains("body", shape.filter);
      if (result.error) throw new Error(JSON.stringify(result.error));
      return result.count;
    });
  }
  async function sqlBenchmark(driver, compiled, metadata) {
    const begin = performance.now();
    const execute = driver.prepare(compiled.sql, compiled.parameters);
    const prepareMs = driver.prepared ? performance.now() - begin : null;
    const plan = compiled.sql.includes("__jsonb_walk") ? "general-tree"
      : compiled.sql.includes("__jsonb_shallow_input") ? "bounded-shallow"
      : compiled.sql.includes("__jsonb_fast_input") ? "object-path" : "schema-specific-reference";
    await measure({ ...metadata, layer: "sql", plan, timingScope: driver.prepared ? report.method.nodeSql : report.method.libsqlSql,
      sqlBytes: Buffer.byteLength(compiled.sql), parameterCount: compiled.parameters.length, prepareMs },
    async () => Number((await execute())[0].matches));
  }
  async function measure(metadata, execute) {
    const invoke = async () => {
      const begin = performance.now();
      const actual = await execute();
      const elapsed = performance.now() - begin;
      if (actual !== metadata.expectedMatches) throw new Error(`Wrong result for ${JSON.stringify(metadata)}: ${actual}`);
      return elapsed;
    };
    const warmupMs = await invoke();
    const runsMs = [];
    for (let repeat = 0; repeat < 3; repeat++) runsMs.push(await invoke());
    const medianMs = [...runsMs].sort((a, b) => a - b)[1];
    const result = { ...metadata, warmupMs, runsMs, medianMs, microsecondsPerRow: medianMs * 1_000 / metadata.rows };
    report.results.push(result);
    await save();
    console.log(`${metadata.backend.padEnd(6)} ${metadata.layer.padEnd(7)} ${metadata.implementation.padEnd(25)} ${metadata.scenario.padEnd(28)} ${String(metadata.width ?? metadata.rows).padStart(5)} ${String(metadata.direction ?? "contains").padEnd(11)} ${medianMs.toFixed(3)} ms`);
  }
}

function driverFor(connection, backend) {
  if (backend === "node") {
    return {
      prepared: true,
      execute: async (query, parameters) => connection.driver.prepare(query).all(...parameters),
      prepare(query, parameters) {
        const statement = connection.driver.prepare(query);
        return async () => statement.all(...parameters);
      },
      async seed(documents) {
        const insert = connection.driver.prepare("insert into bench_docs values (?, ?)");
        connection.driver.exec("begin");
        try { for (const document of documents) insert.run(...document); connection.driver.exec("commit"); }
        catch (error) { connection.driver.exec("rollback"); throw error; }
      },
    };
  }
  return {
    prepared: false,
    execute: async (query, parameters) => (await connection.driver.execute({ sql: query, args: parameters })).rows,
    prepare(query, parameters) { return async () => (await connection.driver.execute({ sql: query, args: parameters })).rows; },
    async seed(documents) {
      for (let offset = 0; offset < documents.length; offset += 500) {
        await connection.driver.batch(documents.slice(offset, offset + 500).map((args) => ({ sql: "insert into bench_docs values (?, ?)", args })), "write");
      }
    },
  };
}
