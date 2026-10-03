import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { availableParallelism, cpus, loadavg, platform, arch, release } from 'node:os';
import { performance } from 'node:perf_hooks';
import { ddl, rows } from './startup/fixture.mjs';
import { runWorker, summarize } from './startup/supervisor.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const options = { samples: 5, 'budget-ms': 20000, output: '.generated/startup.json' };
for (const argument of process.argv.slice(2)) {
  const match = /^--(samples|budget-ms|output)=(.+)$/.exec(argument);
  if (!match) throw new Error(`Unknown option: ${argument}`);
  options[match[1]] = match[1] === 'output' ? match[2] : Number(match[2]);
}
assert.ok(Number.isSafeInteger(options.samples) && options.samples >= 1 && options.samples <= 25, 'samples must be 1–25');
assert.ok(Number.isSafeInteger(options['budget-ms']) && options['budget-ms'] >= 1, 'budget-ms must be a positive integer');
const output = resolve(root, options.output);
await mkdir(dirname(output), { recursive: true });
await mkdir(resolve(root, '.generated'), { recursive: true });
const cache = await mkdtemp(resolve(root, '.generated/startup-cache-'));
const manifest = JSON.parse(await readFile(resolve(root, 'upstream/manifest.json'), 'utf8'));
const lock = JSON.parse(await readFile(resolve(root, 'package-lock.json'), 'utf8'));
assert.equal(lock.packages['node_modules/@supabase/lite'].version, '0.11.0');
const fingerprint = createHash('sha256').update(ddl).update(JSON.stringify(rows)).digest('hex');
const report = {
  formatVersion: 1, complete: false, startedAt: new Date().toISOString(),
  environment: {
    node: process.version, os: platform(), architecture: arch(), kernel: release(),
    cpu: cpus()[0]?.model, availableParallelism: availableParallelism(), loadAverageAtStart: loadavg(),
    lite: manifest.version, supabaseJs: lock.packages['node_modules/@supabase/supabase-js'].version,
  },
  configuration: { samples: options.samples, budgetMs: options['budget-ms'], warmRequestsPerProcess: 5 },
  fixture: { sha256: fingerprint, userTables: 2, taskRows: rows.length, ownerCount: 2, expectedVisibleOpenTasks: 80, auth: true, storage: false, database: ':memory:' },
  artifact: {
    tarballSha256: manifest.tarball.sha256,
    publishedPackageBytes: manifest.files.reduce((sum, file) => sum + file.size, 0),
    publishedPackageFiles: manifest.files.length,
    coreAndNodeEntryBytes: manifest.files.filter((file) => ['dist/index.js', 'dist/db/node/index.js'].includes(file.path)).reduce((sum, file) => sum + file.size, 0),
    dependencyFootprintIncludedInCoreEntryBytes: false,
  },
  observations: [],
};
const pretranslatedBytes = (await stat(resolve(root, '.generated/startup-translations.json'))).size;
report.artifact.pretranslatedSchemaBytes = pretranslatedBytes;
report.artifact.preparation = JSON.parse(await readFile(resolve(root, '.generated/startup-preparation.json'), 'utf8'));
report.artifact.translatorHelperBytes = (await stat(resolve(root, 'src/checked-ddl-translator.mjs'))).size;
const worker = new URL('./startup/worker.mjs', import.meta.url);
// A caller's compile cache / inspector / profiling flags must not contaminate either arm.
const commonEnv = { ...process.env };
for (const name of ['NODE_OPTIONS', 'NODE_COMPILE_CACHE', 'NODE_DISABLE_COMPILE_CACHE', 'NODE_COMPILE_CACHE_PORTABLE', 'LITE_STARTUP_MODE']) delete commonEnv[name];
const started = performance.now();
async function save() { await writeFile(output, JSON.stringify(report, null, 2) + '\n'); }
async function measure(mode, repetition) {
  const remaining = options['budget-ms'] - (performance.now() - started);
  if (remaining <= 0) throw new Error('Startup benchmark exceeded total budget');
  const env = ['disabled', 'pretranslated'].includes(mode)
    ? { ...commonEnv, NODE_DISABLE_COMPILE_CACHE: '1', LITE_STARTUP_MODE: mode }
    : { ...commonEnv, NODE_COMPILE_CACHE: cache };
  const result = await runWorker({ worker, env, timeoutMs: remaining });
  assert.equal(result.compileCacheEnabled, !['disabled', 'pretranslated'].includes(mode), 'Node compile cache configuration was not applied');
  report.observations.push({ mode, repetition, ...result });
  await save();
}
async function logicalSize(directory) {
  let bytes = 0;
  let files = 0;
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      const child = await logicalSize(path);
      bytes += child.bytes; files += child.files;
    } else if (entry.isFile()) { bytes += (await stat(path)).size; files++; }
  }
  return { bytes, files };
}
try {
  await save();
  // The very first process is retained separately: no filesystem-cache claims.
  await measure('disabled', 'initial');
  await measure('empty', 'populate');
  // Rotate configuration order to reduce systematic warm-filesystem/time-of-run bias.
  for (let repetition = 1; repetition <= options.samples; repetition++) {
    const modes = ['disabled', 'reused', 'pretranslated'];
    const rotate = (repetition - 1) % modes.length;
    modes.push(...modes.splice(0, rotate));
    for (const mode of modes) await measure(mode, repetition);
  }
  report.artifact.compileCache = await logicalSize(cache);
  report.artifact.installedDependencyTree = await logicalSize(resolve(root, 'node_modules'));
  const hashes = new Set(report.observations.map((observation) => observation.responseSha256));
  assert.equal(hashes.size, 1, 'All cold/warm configurations must return identical verified data');
  report.summary = {};
  for (const mode of ['disabled', 'reused', 'pretranslated']) {
    const samples = report.observations.filter((sample) => sample.mode === mode && typeof sample.repetition === 'number');
    report.summary[mode] = {
      importMs: summarize(samples.map((sample) => sample.phaseMs.import)),
      schemaReadyMs: summarize(samples.map((sample) => sample.schemaReadyMs)),
      importToFirstResponseMs: summarize(samples.map((sample) => sample.importToFirstResponseMs)),
      spawnToVerifiedResponseMs: summarize(samples.map((sample) => sample.spawnToVerifiedResponseMs)),
      firstRequestMs: summarize(samples.map((sample) => sample.phaseMs.firstRequest)),
      warmRequestMs: summarize(samples.flatMap((sample) => sample.warmRequestMs)),
      rssBytesAtFirstResponse: summarize(samples.map((sample) => sample.rssBytes.firstRequest)),
    };
  }
  report.complete = true;
} catch (error) {
  report.error = error.message;
  process.exitCode = 1;
} finally {
  report.finishedAt = new Date().toISOString();
  report.elapsedMs = performance.now() - started;
  report.environment.loadAverageAtEnd = loadavg();
  await save();
  await rm(cache, { recursive: true, force: true });
}
console.log(JSON.stringify({ complete: report.complete, output, summary: report.summary, error: report.error }, null, 2));
