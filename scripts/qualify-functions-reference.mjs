import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { once } from 'node:events';
import { createReadStream, createWriteStream } from 'node:fs';
import { copyFile, mkdir, readFile, stat, symlink, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { createServer } from 'node:net';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { pipeline } from 'node:stream/promises';
import { pathToFileURL } from 'node:url';

// Pin the exact feature source before qualification.
export const EXPECTED_FEATURE_SHA = 'db6bf11ff43954d02ddd508eb6720fc5a4f5ea61';
export const EXPECTED_FEATURE_TREE = '4a52b4eb787316059cc021b55d556c8c51bd19f0';
export const VERIFICATION_BRANCH = 'verification/functions-reference-pr36-20261004';
const QUALIFICATION_FILES = ['.github/workflows/functions-reference-once.yml', 'scripts/qualify-functions-reference.mjs'];
const BUN_VERSION = '1.4.2';
export const EXPECTED_BUN_LOCK_SHA256 = 'ea8dff8b661da144fced40573ee6fd449f25ddf3f22b9f0adc7da910c8c767bf';
const CLI_VERSION = '2.119.0';
const CLI_ARCHIVE_SHA = 'bf1c3ae93be98533eb8a3105dbf4564bd0b2d9dc24690d8a920f980ef975c1b4';
const CLI_ARCHIVE_BYTES = 62885775;
const SERVICES = [
  ['postgres', '17.11.0.002-r0', '4a4410791bdeeda2e08fda400039b4319bb26d74e08e68951f38abc9dacd7c26'],
  ['postgrest', 'v16.4-r0', 'd9170378062dba1188c25fb05cd08a3397bb62afd63151812f831eed4fab1051'],
  ['auth', 'v2.197.0-r0', 'bd8f59ed1a817014afe71288c2275ad0396630f016f8cb5ab5129388860ec49b'],
  ['edge-runtime', 'v1.77.1-r0', 'e524630f0743319d77535f93748a894520fd52cf9c8fa8c2adb22e08ddb39419'],
];
export const SOURCES = {
  'app/acceptance.mjs': 'fd6e0948c2ad4b211d09e127bd0238dc123ffac5f62da97ff1e583f51dedede2',
  'app/client.mjs': '61ad8bf70cd6b72de47f0688111d37af8bfac1e0af486eae0d0975c41f35d85a',
  'package.json': '7df4fbc33082162819d6f6458b1c9dfdd6bbb1825e4f7c45f0b7e89866d0b9e6',
  'supabase/config.toml': 'dccabc8fbf9afaa76b7d43e22d116f9750c9f26dda318e366f87461b2fd66235',
  'supabase/functions/tasks/deno.json': '2ad4155ca68879d40e21925162e4afa207e99ba203790dc31c23971f90c6cd90',
  'supabase/functions/tasks/index.ts': '41bed5902144e85e196c789fdb0052ac81109b18f401f9e981037d75d26e8536',
  'supabase/migrations/20261004160000_tasks.sql': '644978aceab78d2c1116f5f89a393d518f00c3851a6b20e00caca94c4ca2a2b0',
};

const ACCEPTANCE_CHECKS = ['create', 'read', 'update', 'read-after-update', 'independent-data-api-read',
  'validation-400', 'function-owned-options', 'production-path-and-query'];
const root = resolve(process.env.QUALIFICATION_ROOT ?? '');
const candidate = resolve(process.env.CANDIDATE_DIR ?? '');
const privateDir = join(root, 'private');
const receiptDir = join(root, 'receipt');
const cli = join(privateDir, 'bin/supabase');
const projects = { lite: join(privateDir, 'lite-project'), reference: join(privateDir, 'reference-project') };
const home = join(privateDir, 'supabase-home');
const ownedFile = join(privateDir, 'owned.json');
const secretValues = new Set(['sb_publishable_portability_demo', 'sb_secret_portability_demo']);
let liteProcess;
let cleanupPromise;
const cancellation = new AbortController();
let receivedSignalCode;
const ensureActive = () => cancellation.signal.throwIfAborted();
let state = { root, candidate, referenceAttempted: false, lite: null };
const receipt = { result: 'not-run', featurePublicSha: EXPECTED_FEATURE_SHA, featureTree: EXPECTED_FEATURE_TREE, qualifierSha: process.env.QUALIFIER_SHA, cliVersion: CLI_VERSION,
  cliArchiveSha256: CLI_ARCHIVE_SHA, bunVersion: BUN_VERSION, bunLockSha256: EXPECTED_BUN_LOCK_SHA256, sources: SOURCES, services: SERVICES, routes: {}, cleanup: {} };

export function redact(value) {
  let text = String(value);
  for (const secret of secretValues) if (secret) text = text.split(secret).join('[redacted]');
  return text.replace(/sb_(?:publishable|secret)_[A-Za-z0-9_-]+/g, '[test-key-redacted]')
    .replace(/eyJ[A-Za-z0-9_.-]+/g, '[test-jwt-redacted]')
    .replace(/(postgres(?:ql)?:\/\/[^:\s]+:)[^@\s]+@/g, '$1[redacted]@');
}
function environment(extra = {}) {
  const env = { ...process.env };
  for (const key of Object.keys(env)) if (key.startsWith('SUPABASE_')) delete env[key];
  delete env.BUN_OPTIONS;
  delete env.NODE_OPTIONS;
  return { ...env, DO_NOT_TRACK: '1', NO_COLOR: '1', ...extra };
}
const referenceEnv = () => environment({ SUPABASE_HOME: home, SUPABASE_EXPERIMENTAL_STACK: '1',
  SUPABASE_TELEMETRY_DISABLED: '1' });
async function save(name, content) { await writeFile(join(receiptDir, name), redact(content)); }
async function persistState() { await writeFile(ownedFile, JSON.stringify(state), { mode: 0o600 }); }
async function digest(path, algorithm = 'sha256', encoding = 'hex') {
  const hash = createHash(algorithm);
  for await (const chunk of createReadStream(path)) hash.update(chunk);
  return hash.digest(encoding);
}
export async function verifySources(directory) {
  assert.ok(SOURCES && typeof SOURCES === 'object' && !Array.isArray(SOURCES), 'Final portable source manifest has not been frozen; refusing to run');
  for (const [file, expected] of Object.entries(SOURCES)) assert.equal(await digest(join(directory, file)), expected, `Source changed: ${file}`);
}
async function run(label, command, args, { cwd = candidate, env = environment(), timeout = 60000, privateOutput = false, cleanupOperation = false } = {}) {
  if (!cleanupOperation) ensureActive();
  const child = spawn(command, args, { cwd, env, stdio: ['ignore', 'pipe', 'pipe'] });
  let stdout = '', stderr = '';
  const collect = (key, chunk) => {
    if (key === 'stdout') stdout += chunk; else stderr += chunk;
    if (stdout.length + stderr.length > 2_000_000) child.kill('SIGTERM');
  };
  child.stdout.on('data', chunk => collect('stdout', chunk));
  child.stderr.on('data', chunk => collect('stderr', chunk));
  let abortKillTimer;
  const onAbort = () => { child.kill('SIGTERM'); abortKillTimer = setTimeout(() => child.kill('SIGKILL'), 5000); };
  if (!cleanupOperation) cancellation.signal.addEventListener('abort', onAbort, { once: true });
  if (!cleanupOperation && cancellation.signal.aborted) onAbort();
  const timer = setTimeout(() => child.kill('SIGTERM'), timeout);
  const hardTimer = setTimeout(() => child.kill('SIGKILL'), timeout + 5000);
  let code, signal;
  try { [code, signal] = await once(child, 'close'); } finally { clearTimeout(timer); clearTimeout(hardTimer); clearTimeout(abortKillTimer); cancellation.signal.removeEventListener('abort', onAbort); }
  await save(`${label}.stderr.log`, stderr);
  if (!privateOutput) await save(`${label}.stdout.log`, stdout);
  if (!cleanupOperation) ensureActive();
  if (code !== 0 || signal) throw new Error(`${label} failed (${code ?? signal}): ${redact(stderr)}${privateOutput ? '' : redact(stdout)}`);
  return stdout;
}
async function waitFor(check, timeout = 20000, cleanupOperation = false) {
  const end = Date.now() + timeout;
  while (Date.now() < end) { if (!cleanupOperation) ensureActive(); if (await check()) return; await new Promise(r => setTimeout(r, 100)); }
  throw new Error('Readiness check timed out');
}
async function processStart(pid) {
  const text = await readFile(`/proc/${pid}/stat`, 'utf8');
  return text.slice(text.lastIndexOf(')') + 2).split(' ')[19];
}
async function stopLite() {
  if (!state.lite) return;
  const owned = state.lite;
  async function leader() {
    try {
      const start = await processStart(owned.pid);
      assert.equal(start, owned.start, 'Owned Lite PID was reused; refusing to signal it');
      const cmdline = await readFile(`/proc/${owned.pid}/cmdline`, 'utf8');
      assert.ok(cmdline.includes(owned.script), 'Lite process identity changed');
      return true;
    } catch (error) { if (error.code === 'ENOENT' || error.code === 'ESRCH') return false; throw error; }
  }
  function groupExists() {
    try { process.kill(-owned.pid, 0); return true; }
    catch (error) { if (error.code === 'ESRCH') return false; throw error; }
  }
  const hasLeader = await leader();
  if (groupExists()) {
    // Prefer the CLI's graceful shutdown; if its leader already died, stop its
    // original detached group rather than declaring its descendants stopped.
    process.kill(hasLeader ? owned.pid : -owned.pid, 'SIGTERM');
    try { await waitFor(async () => !groupExists(), 10000, true); }
    catch (error) {
      await leader(); // Refuse a recycled group leader before escalation.
      if (groupExists()) process.kill(-owned.pid, 'SIGKILL');
      await waitFor(async () => !groupExists(), 3000, true);
      receipt.cleanup.liteForcedKill = true;
      state.lite = null; await persistState();
      throw error;
    }
  }
  state.lite = null; await persistState();
  receipt.cleanup.lite = 'owned-process-group-stopped';
}
async function cleanup() {
  if (cleanupPromise) return cleanupPromise;
  cleanupPromise = (async () => {
    const errors = [];
    try { await stopLite(); } catch (error) { errors.push(error); }
    if (state.referenceAttempted) {
      try {
        const stopped = JSON.parse(await run('reference-stop', cli, ['stack', 'stop', '--output-format', 'json'], {
          cwd: projects.reference, env: referenceEnv(), timeout: 30000, privateOutput: true, cleanupOperation: true,
        }));
        assert.equal(stopped.unavailable?.length ?? 0, 0, 'Official stack owner is unavailable; service cleanup is unverified');
        if (state.referenceId) assert.ok(stopped.stopped?.includes(state.referenceId), 'Official stop did not confirm the owned stack');
        else assert.ok(stopped.found === false || stopped.stopped?.length === 1, 'Official stop did not confirm preparation cleanup');
        receipt.cleanup.reference = stopped.found === false ? 'not-created' : 'owned-stack-stop-confirmed';
        state.referenceAttempted = false;
        await persistState();
      } catch (error) { errors.push(error); }
    }
    if (errors.length) throw new AggregateError(errors, errors.map(error => redact(error)).join('; '));
  })();
  return cleanupPromise;
}
async function copyFixture(target) {
  const fixture = join(candidate, 'examples/functions-portable');
  await verifySources(fixture);
  for (const file of [...Object.keys(SOURCES), 'supabase/config.lite.toml']) {
    await mkdir(dirname(join(target, file)), { recursive: true });
    await copyFile(join(fixture, file), join(target, file));
  }
  await symlink(join(candidate, 'node_modules'), join(target, 'node_modules'));
  await verifySources(target);
}
async function sdkAssertions(url, key) {
  const require = createRequire(join(candidate, 'package.json'));
  const { createClient, FunctionsHttpError } = await import(pathToFileURL(require.resolve('@supabase/supabase-js')).href);
  const sdk = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const id = `status-${crypto.randomUUID()}`;
  const created = await sdk.functions.invoke('tasks', { body: { action: 'create', id, title: 'Status contract' }, timeout: 10000, signal: cancellation.signal });
  assert.equal(created.error, null); assert.equal(created.response.status, 201);
  const persisted = await sdk.from('tasks').select('id,title,completed').eq('id', id).abortSignal(AbortSignal.any([cancellation.signal, AbortSignal.timeout(10000)])).single();
  assert.equal(persisted.error, null); assert.deepEqual(persisted.data, { id, title: 'Status contract', completed: 0 });
  for (const [options, status] of [
    [{ body: { action: 'unknown', id } }, 400],
    [{ method: 'DELETE', body: { id } }, 405],
  ]) {
    const result = await sdk.functions.invoke('tasks', { ...options, timeout: 10000, signal: cancellation.signal });
    assert.ok(result.error instanceof FunctionsHttpError); assert.equal(result.response.status, status);
    const body = await result.error.context.json(); assert.equal(typeof body.error, 'string');
  }
  const malformed = await fetch(`${url}/functions/v1/tasks`, { method: 'POST', headers: { apikey: key, 'content-type': 'application/json' }, body: '{', signal: AbortSignal.any([cancellation.signal, AbortSignal.timeout(10000)]) });
  assert.equal(malformed.status, 400); assert.equal(typeof (await malformed.json()).error, 'string');
  return ['create-201', 'independent-data-api-read', 'unknown-action-400', 'method-405', 'SDK-FunctionsHttpError', 'malformed-json-400'];
}
async function accept(route, url, key) {
  assert.ok(['127.0.0.1', 'localhost', '[::1]'].includes(new URL(url).hostname), 'Only loopback APIs are allowed');
  secretValues.add(key);
  const output = await run(`${route}-acceptance`, process.execPath, ['--no-install', 'app/acceptance.mjs'], {
    cwd: projects[route], env: environment({ SUPABASE_URL: url, SUPABASE_PUBLISHABLE_KEY: key, TEST_TASK_ID: `${route}-${crypto.randomUUID()}` }), timeout: 90000,
  });
  const parsed = JSON.parse(output.trim());
  assert.equal(parsed.passed, true); assert.deepEqual(parsed.checks, ACCEPTANCE_CHECKS);
  const additional = await sdkAssertions(url, key);
  await verifySources(projects[route]);
  receipt.routes[route] = { passed: true, assertions: parsed.checks, additional, sourceHashes: { matched: true, count: Object.keys(SOURCES).length } };
}
async function validateCandidate(localSourceOnly = false) {
  assert.match(EXPECTED_FEATURE_TREE, /^[a-f0-9]{40}$/, 'Final feature tree has not been frozen; refusing to run');
  assert.match(EXPECTED_BUN_LOCK_SHA256, /^[a-f0-9]{64}$/, 'Final Bun lock has not been pinned; refusing to run');
  assert.equal(await digest(join(candidate, 'bun.lock')), EXPECTED_BUN_LOCK_SHA256, 'Candidate Bun lock differs from the reviewed dependency graph');
  const head = (await run('candidate-head', 'git', ['rev-parse', 'HEAD'])).trim();
  if (localSourceOnly) {
    const tree = (await run('candidate-tree', 'git', ['rev-parse', 'HEAD^{tree}'])).trim();
    assert.equal(tree, EXPECTED_FEATURE_TREE, 'Local feature tree differs from approval');
  } else {
    assert.match(EXPECTED_FEATURE_SHA, /^[a-f0-9]{40}$/, 'Public feature SHA has not been pinned; refusing to run');
    assert.equal(process.env.QUALIFICATION_BRANCH, VERIFICATION_BRANCH, 'Wrong verification branch');
    assert.equal(process.env.QUALIFIER_SHA, head, 'Checked-out qualifier differs from the push event');
    const featureTree = (await run('approved-feature-tree', 'git', ['rev-parse', `${EXPECTED_FEATURE_SHA}^{tree}`])).trim();
    assert.equal(featureTree, EXPECTED_FEATURE_TREE, 'Published feature tree differs from approval');
    await run('feature-ancestor', 'git', ['merge-base', '--is-ancestor', EXPECTED_FEATURE_SHA, 'HEAD']);
    const changed = (await run('qualification-diff', 'git', ['diff', '--name-only', EXPECTED_FEATURE_SHA, 'HEAD'])).trim().split('\n').filter(Boolean).sort();
    assert.deepEqual(changed, [...QUALIFICATION_FILES].sort(), 'Only the two qualification files may differ from the approved feature');
    receipt.qualificationFiles = {};
    for (const file of QUALIFICATION_FILES) receipt.qualificationFiles[file] = await digest(join(candidate, file));
  }
  for (const file of ['upstream/lite-0.11.0/dist/functions/runner.js', 'upstream/lite-0.11.0/dist/functions/execution.js', 'upstream/lite-0.11.0/dist/functions/worker.js']) assert.ok((await stat(join(candidate, file))).isFile(), 'The final portable Fetch-handler implementation is required');
  await verifySources(join(candidate, 'examples/functions-portable'));
}
async function qualify() {
  await validateCandidate();
  await copyFixture(projects.lite); await copyFixture(projects.reference);
  await mkdir(join(privateDir, 'bin'), { recursive: true });
  const archive = join(privateDir, 'supabase.tar.gz');
  const download = await fetch(`https://github.com/supabase/cli/releases/download/v${CLI_VERSION}/supabase_${CLI_VERSION}_linux_amd64.tar.gz`, { signal: AbortSignal.any([cancellation.signal, AbortSignal.timeout(120000)]) });
  assert.equal(download.status, 200, 'Official CLI download failed');
  await pipeline(download.body, createWriteStream(archive, { mode: 0o600 }), { signal: cancellation.signal });
  assert.equal((await stat(archive)).size, CLI_ARCHIVE_BYTES); assert.equal(await digest(archive), CLI_ARCHIVE_SHA);
  await run('extract-cli', 'tar', ['-xzf', archive, '-C', join(privateDir, 'bin')]);
  assert.equal((await run('cli-version', cli, ['--version'], { env: referenceEnv() })).trim(), CLI_VERSION);
  state.referenceAttempted = true; await persistState();
  const prepared = JSON.parse(await run('reference-prepare', cli, ['stack', 'prepare', '--runtime', 'native', '--capability', 'database', '--capability', 'rest', '--capability', 'auth', '--capability', 'functions', '--output-format', 'json'], {
    cwd: projects.reference, env: referenceEnv(), timeout: 240000, privateOutput: true,
  }));
  assert.match(prepared.id, /^[a-f0-9]{64}$/, 'Official prepare returned an invalid stack identity');
  state.referenceId = prepared.id; await persistState();
  for (const [service, version, expected] of SERVICES) {
    const metadata = JSON.parse(await readFile(join(home, 'cache/stack/slim-services', service, version, 'linux-amd64/.artifact.json'), 'utf8'));
    assert.equal(metadata.format, 'supabase-stack-artifact-v3'); assert.equal(metadata.sha256, expected);
  }
  const config = await readFile(join(projects.lite, 'supabase/config.lite.toml'), 'utf8');
  const port = Number(config.match(/\[api\][\s\S]*?\bport\s*=\s*(\d+)/)?.[1]);
  assert.equal(port, 54321, 'Review changed Lite infrastructure config before qualifying');
  const probe = createServer(); probe.listen(port, '127.0.0.1'); await once(probe, 'listening'); await new Promise(r => probe.close(r));
  const script = join(candidate, 'upstream/lite-0.11.0/dist/cli/index.js');
  const liteHome = join(privateDir, 'lite-home'); await mkdir(liteHome, { recursive: true });
  ensureActive();
  liteProcess = spawn(process.execPath, ['--no-install', script, '--no-telemetry', 'dev', '--config', 'supabase/config.lite.toml', '--no-admin', '--host', '127.0.0.1'], {
    cwd: projects.lite, env: environment({ HOME: liteHome, LITE_TELEMETRY: '0' }), detached: true, stdio: ['ignore', 'pipe', 'pipe'],
  });
  let liteLogs = '';
  liteProcess.stdout.on('data', b => { liteLogs += b; }); liteProcess.stderr.on('data', b => { liteLogs += b; });
  state.lite = { pid: liteProcess.pid, start: await processStart(liteProcess.pid), script }; await persistState();
  const liteUrl = `http://127.0.0.1:${port}`;
  await waitFor(async () => {
    if (liteProcess.exitCode !== null) throw new Error(`Lite exited: ${redact(liteLogs)}`);
    try { return (await fetch(`${liteUrl}/_system/ping`, { signal: AbortSignal.timeout(500) })).ok; } catch { return false; }
  });
  await accept('lite', liteUrl, 'sb_publishable_portability_demo');
  await stopLite(); await save('lite-cli.log', liteLogs);
  await assert.rejects(fetch(`${liteUrl}/_system/ping`, { signal: AbortSignal.timeout(500) }));
  await run('reference-start', cli, ['stack', 'start', '--runtime', 'native', '--exclude', 'realtime,storage,studio,mail,analytics,pooler', '--eager', '--output-format', 'json'], {
    cwd: projects.reference, env: referenceEnv(), timeout: 150000, privateOutput: true,
  });
  const status = JSON.parse(await run('reference-status', cli, ['stack', 'status', '--output-format', 'json'], {
    cwd: projects.reference, env: referenceEnv(), privateOutput: true,
  }));
  for (const [name, value] of Object.entries(status.env ?? {})) if (/key|secret|password|token/i.test(name) && typeof value === 'string') secretValues.add(value);
  assert.equal(status.runtime, 'native');
  assert.equal(status.readiness, 'ready', 'Official stack must be healthy');
  assert.deepEqual(status.composition.members.map(member => member.service).sort(), ['auth', 'database', 'functions', 'rest']);
  assert.ok(status.env?.API_URL && status.env?.PUBLISHABLE_KEY, 'Official status omitted required environment');
  await accept('reference', status.env.API_URL, status.env.PUBLISHABLE_KEY);
  await verifySources(join(candidate, 'examples/functions-portable'));
  ensureActive();
  receipt.result = 'passed';
}

async function main() {
  assert.equal(globalThis.Bun?.version, BUN_VERSION, 'Run this qualification with Bun 1.4.2');
  assert.ok(process.env.QUALIFICATION_ROOT && isAbsolute(process.env.QUALIFICATION_ROOT), 'QUALIFICATION_ROOT must be explicit and absolute');
  assert.ok(process.env.RUNNER_TEMP && root.startsWith(`${resolve(process.env.RUNNER_TEMP)}/`), 'Qualification must stay inside RUNNER_TEMP');
  assert.ok(process.env.CANDIDATE_DIR && isAbsolute(process.env.CANDIDATE_DIR), 'CANDIDATE_DIR must be explicit and absolute');
  await mkdir(privateDir, { recursive: true, mode: 0o700 }); await mkdir(receiptDir, { recursive: true });
  if (process.argv.includes('--cleanup')) {
    try { state = JSON.parse(await readFile(ownedFile, 'utf8')); } catch (error) { if (error.code === 'ENOENT') return; throw error; }
    assert.equal(state.root, root); assert.equal(state.candidate, candidate); await cleanup(); return;
  }
  if (process.argv.includes('--validate') || process.argv.includes('--validate-local-source')) {
    await validateCandidate(process.argv.includes('--validate-local-source'));
    console.log(JSON.stringify({ validated: true, featurePublicSha: EXPECTED_FEATURE_SHA, featureTree: EXPECTED_FEATURE_TREE, qualifierSha: process.env.QUALIFIER_SHA, immutableFiles: Object.keys(SOURCES).length, servicesStarted: false }));
    return;
  }
  const began = Date.now();
  const jobDeadline = Number(process.env.QUALIFICATION_DEADLINE_AT);
  assert.ok(Number.isFinite(jobDeadline), 'Workflow must supply a deadline with cleanup time reserved');
  const budget = Math.min(9 * 60_000, jobDeadline - began);
  const abort = (message, code) => { receivedSignalCode = code; cancellation.abort(new Error(message)); };
  process.once('SIGTERM', () => abort('Qualification interrupted by SIGTERM', 143));
  process.once('SIGINT', () => abort('Qualification interrupted by SIGINT', 130));
  const deadlineTimer = setTimeout(() => abort('Qualification budget exhausted; preserving cleanup time', 1), Math.max(0, budget));
  if (budget <= 0) abort('Qualification deadline already passed', 1);
  try { await qualify(); }
  catch (error) { receipt.result = 'failed'; receipt.error = redact(error.stack ?? error); process.exitCode = 1; }
  finally {
    clearTimeout(deadlineTimer);
    try { await cleanup(); } catch (error) { receipt.result = 'failed'; receipt.cleanup.error = redact(error); process.exitCode = 1; }
    if (receivedSignalCode) { receipt.result = 'failed'; process.exitCode = receivedSignalCode; }
    receipt.elapsedMs = Date.now() - began;
    await save('result.json', JSON.stringify(receipt, null, 2));
    console.log(JSON.stringify({ result: receipt.result, featurePublicSha: EXPECTED_FEATURE_SHA, routes: Object.keys(receipt.routes), cleanup: receipt.cleanup }));
  }
}
if (process.argv[1] && resolve(process.argv[1]) === resolve(new URL(import.meta.url).pathname)) {
  main().catch(error => { console.error(redact(error.stack ?? error)); process.exitCode = 1; });
}
