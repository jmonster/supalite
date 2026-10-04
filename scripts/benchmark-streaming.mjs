// Full CLI + shared-target regression, deliberately opt-in (roughly 96 MiB per fixture).
// Usage: node scripts/benchmark-streaming.mjs
// --quick uses 384 rows. --heap=1024 compares successful stock/direct runs.
// --baseline-target includes the retained legacy-adapter target control at 128 MiB.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, readdir, rm, statfs, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { performance } from "node:perf_hooks";
import { cliPath, createScaleFixture, root, verifySource } from "../test/streaming-scale.mjs";

const quick = process.argv.includes("--quick");
const keep = process.argv.includes("--keep-fixtures");
const rows = quick ? 384 : 12288;
const oldSpaceLimitMiB = Number(process.argv.find(arg => arg.startsWith("--heap="))?.split("=")[1] ?? 128);
assert.ok(Number.isSafeInteger(oldSpaceLimitMiB) && oldSpaceLimitMiB > 0, "--heap must be a positive integer");
const baselineTarget = oldSpaceLimitMiB !== 128 || process.argv.includes("--baseline-target");
const directory = await mkdtemp(join(tmpdir(), "lite-streaming-scale-"));
const artifactPaths = {
  baselineCli: cliPath("baseline"), streamingCli: cliPath("streaming"),
  streamingHelper: join(root, "upstream/lite-0.11.0/dist/cli/sqlite-streaming.js"),
};
const artifactHashes = async () => Object.fromEntries(await Promise.all(Object.entries(artifactPaths)
  .map(async ([name, path]) => [name, createHash("sha256").update(await readFile(path)).digest("hex")])));
const temporaryFilesystem = await statfs(directory);
const report = {
  temporaryStorage: { filesystemTypeHex: `0x${temporaryFilesystem.type.toString(16)}` },
  recordedAt: new Date().toISOString(), node: process.version,
  pglite: JSON.parse(await readFile(join(root, "node_modules/@electric-sql/pglite/package.json"), "utf8")).version,
  artifactSha256: await artifactHashes(),
  quick, oldSpaceLimitMiB, fixtures: [], runs: [],
  scope: "CLI baseline is the pinned npm package; target baseline is the same production code with native capability hidden to exercise the retained legacy adapter path. Ordinary synthetic application data without Auth rows. Application JS rows and SQL are bounded; PGlite WASM/native memory, auth arrays, schema metadata, and diagnostic arrays are not claimed bounded.",
};

async function run(project, args) {
  const started = performance.now();
  const env = { ...process.env, HOME: join(project, "home"), TMPDIR: join(project, "tmp"),
    NO_COLOR: "1", FORCE_COLOR: "0", SUPABASE_ACCESS_TOKEN: "", NODE_OPTIONS: "" };
  const child = spawn(process.execPath, [`--max-old-space-size=${oldSpaceLimitMiB}`, ...args], { cwd: project, env, stdio: ["ignore", "pipe", "pipe"] });
  let stdout = "", stderr = "", peakRssKiB = 0;
  const append = (current, chunk) => (current + chunk).slice(-131072);
  child.stdout.on("data", chunk => { stdout = append(stdout, chunk); });
  child.stderr.on("data", chunk => { stderr = append(stderr, chunk); });
  // Linux /proc gives a process-external high-water mark, including native/WASM.
  const sampler = setInterval(async () => {
    try {
      const status = await readFile(`/proc/${child.pid}/status`, "utf8");
      const match = status.match(/^VmHWM:\s+(\d+) kB$/m);
      if (match) peakRssKiB = Math.max(peakRssKiB, Number(match[1]));
    } catch { /* Child exited, or non-Linux host. */ }
  }, 20);
  const timeout = setTimeout(() => child.kill("SIGKILL"), 300000);
  try {
    const { code, signal } = await new Promise((accept, reject) => {
      child.once("error", reject);
      child.once("close", (code, signal) => accept({ code, signal }));
    });
    return { code, signal, elapsedMs: Math.round(performance.now() - started), peakRssKiB: peakRssKiB || null, stdout, stderr };
  } finally { clearInterval(sampler); clearTimeout(timeout); }
}

try {
  assert.equal(report.pglite, "0.4.5", "Benchmark uses the exact installed PGlite dependency");
  for (const kind of ["text", "json"]) {
    const project = join(directory, kind);
    const fixture = await createScaleFixture(project, { kind, rows });
    report.fixtures.push(fixture);
    console.log(`Fixture ${kind}: ${fixture.rows} rows / ${fixture.payloadBytes / 1048576} MiB payload`);
    for (const flavor of ["baseline", "streaming"]) {
      const result = await run(project, [cliPath(flavor), "--no-telemetry", "upgrade", "--target", "local", "--dry-run", "--no-migrate-sessions"]);
      report.runs.push({ mode: "actual-non-json-cli-dry-run", kind, flavor, ...result });
      if (flavor === "streaming" || quick || oldSpaceLimitMiB !== 128) {
        assert.equal(result.code, 0, `${kind}/${flavor}\n${result.stdout}\n${result.stderr}`);
        assert.match(result.stdout, /rehearsal passed/);
        assert.match(result.stdout, new RegExp(`data: ${rows} inserts`));
        for (const table of fixture.tables) assert.ok(result.stdout.includes(`app.${table.table}: ${table.rows} rows`), "CLI readiness covered fixture rows");
      } else {
        assert.notEqual(result.code, 0, `${kind}: stock CLI must reproduce the capped-heap failure`);
        assert.match(result.stderr, /JavaScript heap out of memory|Reached heap limit|Ineffective mark-compacts/, "Stock failure is heap exhaustion, not an earlier CLI/setup failure");
        assert.match(result.stdout, /Running readiness checks/);
        // Heap exhaustion can move between stages as GC timing changes.
      }
      await verifySource(project, fixture);
      assert.deepEqual(await readdir(join(project, "tmp")), [], "Direct path creates no temporary SQL files");
      console.log(`${kind}/${flavor} CLI: ${result.code === 0 ? "passed" : "expected heap exhaustion"} (${result.elapsedMs} ms)`);
    }
    for (const flavor of baselineTarget ? ["baseline", "streaming"] : ["streaming"]) {
      const target = await run(project, [join(root, "test/streaming-scale.mjs"), "--worker", project, flavor]);
      report.runs.push({ mode: "shared-production-PGlite-target", kind, flavor: flavor === "baseline" ? "legacy-adapter" : flavor, ...target });
      if (flavor === "baseline" && !quick && oldSpaceLimitMiB === 128) {
        assert.notEqual(target.code, 0);
        assert.match(target.stderr, /JavaScript heap out of memory|Reached heap limit|Ineffective mark-compacts/);
      } else {
        assert.equal(target.code, 0, `${target.stdout}\n${target.stderr}`);
        const resultLine = target.stdout.split("\n").find(line => line.startsWith("STREAMING_SCALE_RESULT:"));
        assert.ok(resultLine, "Target worker returned bounded verification");
        report.runs.at(-1).verification = JSON.parse(resultLine.slice("STREAMING_SCALE_RESULT:".length));
      }
      await verifySource(project, fixture);
      assert.deepEqual(await readdir(join(project, "tmp")), []);
      console.log(`${kind}/${flavor} shared target: ${target.code === 0 ? "passed" : "expected heap exhaustion"} (${target.elapsedMs} ms)`);
    }
  }
  assert.deepEqual(await artifactHashes(), report.artifactSha256, "Generated code stayed unchanged throughout the measured run");
  report.passed = true;
} catch (error) {
  report.passed = false;
  report.failure = String(error.stack ?? error);
  throw error;
} finally {
  const output = join(root, ".generated", `streaming-benchmark-${oldSpaceLimitMiB}${quick ? "-quick" : ""}.json`);
  await writeFile(output, JSON.stringify(report, null, 2) + "\n");
  console.log(`Report: ${output}`);
  if (keep) console.log(`Synthetic fixtures retained at ${directory}`);
  else await rm(directory, { recursive: true, force: true });
}
