// One disposable SQLite/filesystem -> local Supabase proof. No target work without --run.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { once } from 'node:events';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';

const mode = process.argv[2];
assert.ok(['--source-only', '--run'].includes(mode), 'Choose --source-only or --run');
const real = mode === '--run';
if (real) assert.equal(process.env.LITE_STORAGE_QUALIFICATION, '1', 'Real qualification needs explicit opt-in');
const repo = resolve(process.env.LITE_QUALIFICATION_REPO || join(dirname(fileURLToPath(import.meta.url)), '..'));
const require = createRequire(join(repo, 'package.json'));
const { createClient } = require('@supabase/supabase-js');
assert.equal(require('@supabase/supabase-js/package.json').version, '2.117.2');
const cli = join(repo, 'upstream/lite-0.11.0/dist/cli/index.js');
const supabase = (process.env.LITE_SUPABASE_CLI || 'npx --yes supabase@2.98.1').split(/\s+/);
const account = { email: 'storage-qualification@example.test', password: `Synthetic-${randomUUID()}-7!` };
const key = 'sb_publishable_storage_qualification_only';
const bucket = 'qualification-files';
const files = [
  { name: 'nested/ordinary.bin', bytes: Buffer.alloc(0), metadata: {} },
  { name: "nested/O'Brien (proof).bin", bytes: Buffer.from([0, 1, 127, 128, 255, 13, 10]), metadata: { label: "O'Brien", nested: { keep: true }, empty: {}, nullable: null } },
];
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const json = value => typeof value === 'string' ? JSON.parse(value) : value;
const quote = value => `'${String(value).replaceAll("'", "''")}'`;
const iso = value => new Date(value).toISOString();
const redact = text => String(text).replaceAll(account.password, '[redacted]').replaceAll(key, '[redacted]')
  .replace(/(postgres(?:ql)?:\/\/)[^@\s]+@/g, '$1[redacted]@')
  .replace(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, '[redacted JWT]')
  .split('\n').filter(line => !/password|secret|credentials?|api.?key|anon.?key|token/i.test(line)).join('\n');
const parent = resolve(process.env.LITE_STORAGE_QUALIFICATION_ROOT || tmpdir());
await mkdir(parent, { recursive: true });
const work = await mkdtemp(join(parent, 'lite-storage-qualification-'));
const source = join(work, 'source'), target = join(work, 'target'), credentialsPath = join(work, 'credentials.json');
await mkdir(join(source, 'supabase/migrations'), { recursive: true });
await mkdir(join(work, 'home'));
const env = { ...process.env, HOME: join(work, 'home'), EXPERIMENTAL_STORAGE: '1', DO_NOT_TRACK: '1',
  SUPABASE_TELEMETRY_DISABLED: '1', SUPABASE_ACCESS_TOKEN: '', NO_COLOR: '1', FORCE_COLOR: '0', LITE_SUPABASE_CLI: supabase.join(' ') };
const run = (label, command, args, timeout = 60000) => new Promise((accept, reject) => {
  // spawn forwards detached; execFile does not. Own the CLI/npx/Supabase group.
  const child = spawn(command, args, { cwd: source, env, detached: true, stdio: ['ignore', 'pipe', 'pipe'] });
  let output = '', stdout = '', failure;
  const stopGroup = reason => {
    failure ||= reason;
    if (!child.pid) return;
    try { process.kill(-child.pid, 'SIGKILL'); }
    catch (error) { if (error.code !== 'ESRCH') failure = `cannot stop command group: ${error.code}`; }
  };
  const timer = setTimeout(() => stopGroup('timeout'), timeout);
  for (const stream of [child.stdout, child.stderr]) stream.on('data', chunk => {
    output += chunk;
    if (stream === child.stdout) stdout += chunk;
    if (output.length > 4 * 1024 * 1024) { output = output.slice(-6000); stopGroup('output limit'); }
  });
  child.once('error', error => { clearTimeout(timer); reject(new Error(`${label} could not start: ${error.code}`)); });
  child.once('exit', (code, signal) => { if (code !== 0) stopGroup(failure || `exit ${code ?? signal}`); });
  // close waits for child termination and inherited stdout/stderr pipe closure.
  child.once('close', (code, signal) => {
    clearTimeout(timer);
    if (failure || code !== 0) reject(new Error(`${label} failed (${failure || code || signal}): ${redact(output).slice(-6000)}`));
    else accept({ stdout, output });
  });
});
const lite = (args, timeout) => run('Lite CLI', process.execPath, [cli, '--no-telemetry', ...args], timeout);
const targetCli = args => run('Supabase CLI', supabase[0], [...supabase.slice(1), ...args], 120000);
const scrubStorageLog = line => {
  try {
    return JSON.stringify(JSON.parse(line), (key, value) =>
      /authorization|headers?|cookies?|password|secret|credentials?|api.?key|token|body|payload|query|params/i.test(key)
        ? '[redacted]' : typeof value === 'string' ? redact(value) : value);
  } catch { return redact(line); }
};
async function storageFailureDiagnostics() {
  const config = await readFile(join(target, 'supabase/config.toml'), 'utf8').catch(() => '');
  const project = config.match(/^project_id\s*=\s*"(lite-local-[a-z0-9]+)"/m)?.[1];
  if (!project) { console.error('Storage diagnostics: fixture project ID unavailable'); return; }
  const container = `supabase_storage_${project}`;
  const keys = ['TUS_USE_FILE_VERSION_SEPARATOR', 'PG_QUEUE_ENABLE', 'STORAGE_BACKEND'];
  const format = '{{.Name}}\n{{index .Config.Labels "com.supabase.cli.project"}}\n{{.Config.Image}}\n{{range .Config.Env}}{{$key := index (split . "=") 0}}{{if or (eq $key "TUS_USE_FILE_VERSION_SEPARATOR") (eq $key "PG_QUEUE_ENABLE") (eq $key "STORAGE_BACKEND")}}{{println .}}{{end}}{{end}}';
  const found = await run('fixture Storage inspection', 'docker', ['inspect', '--format', format, container], 10000).catch(() => null);
  const [name, label, image, ...flags] = found?.stdout.trim().split('\n') || [];
  if (name !== `/${container}` || label !== project) { console.error('Storage diagnostics: named fixture container is absent or does not match'); return; }
  console.error(`Storage diagnostics image: ${redact(image)}`);
  for (const key of keys) {
    const value = flags.find(flag => flag.startsWith(`${key}=`))?.slice(key.length + 1);
    console.error(`${key}=${value === undefined ? '<unset>' : /^(true|false|0|1|file|s3)$/.test(value) ? value : '<unrecognized>'}`);
  }
  const logs = await run('fixture Storage logs', 'docker', ['logs', '--tail', '120', '--since', '5m', container], 10000);
  console.error(Buffer.from(logs.output.split('\n').slice(-120).map(scrubStorageLog).join('\n')).subarray(-16384).toString('utf8'));
}
const success = (result, label) => { assert.equal(result.error, null, `${label}: ${result.error?.message ?? ''}`); return result.data; };
const newClient = (url, apiKey = key) => createClient(url, apiKey, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
let server, serverExited, sql, targetStarted = false, cleanupFailed = false;
const stopSource = async () => {
  if (!server) return;
  if (server.exitCode === null) server.kill('SIGTERM');
  const timer = setTimeout(() => server.kill('SIGKILL'), 5000);
  try { await serverExited; } finally { clearTimeout(timer); server = null; }
};
const originalCwd = process.cwd();

try {
  if (real) {
    assert.equal((await targetCli(['--version'])).stdout.trim(), '2.98.1');
    assert.equal(JSON.parse(await readFile(join(dirname(dirname(dirname(require.resolve('postgres')))), 'package.json'), 'utf8')).version, '3.4.8', 'Install the prior Auth qualification PostgreSQL driver pin');
  }
  const socket = createServer();
  await new Promise((accept, reject) => { socket.once('error', reject); socket.listen(0, '127.0.0.1', accept); });
  const port = socket.address().port;
  await new Promise(accept => socket.close(accept));
  const sourceUrl = `http://127.0.0.1:${port}`;
  const config = `project_id = "storage-qualification"\n[db]\ndriver = "sqlite-postgres"\nurl = "file:./supabase/fixture.db"\n[api]\nport = ${port}\nexternal_url = "${sourceUrl}"\n[auth]\nenabled = true\njwt_secret = "synthetic-storage-fixture-only-a747f02db1094826"\npublishable_key = "${key}"\nsite_url = "http://127.0.0.1:3000"\nenable_signup = true\n[auth.email]\nenable_signup = true\nenable_confirmations = false\n[storage]\nenabled = true\nfile_size_limit = "1MiB"\n[realtime]\nenabled = false\n`;
  await writeFile(join(source, 'supabase/config.toml'), config);
  await writeFile(join(source, 'supabase/migrations/20261004000000_storage_links.sql'), `
CREATE TABLE public.storage_links (
  id integer PRIMARY KEY,
  owner_id uuid NOT NULL REFERENCES auth.users(id),
  object_id uuid NOT NULL REFERENCES storage.objects(id),
  bucket_id text NOT NULL REFERENCES storage.buckets(id),
  object_name text NOT NULL
);
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT ON public.storage_links TO authenticated;
ALTER TABLE public.storage_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY qualification_links ON public.storage_links FOR ALL TO authenticated
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY qualification_buckets ON storage.buckets FOR ALL TO authenticated
  USING (owner = auth.uid()) WITH CHECK (owner = auth.uid());
CREATE POLICY qualification_objects ON storage.objects FOR ALL TO authenticated
  USING (owner = auth.uid()) WITH CHECK (owner = auth.uid());
`);
  await lite(['migration', 'up']);
  server = spawn(process.execPath, [cli, '--no-telemetry', 'start', '--no-admin', '--host', '127.0.0.1'], { cwd: source, env, stdio: ['ignore', 'pipe', 'pipe'] });
  let serverOutput = '';
  server.stdout.on('data', chunk => { serverOutput = (serverOutput + chunk).slice(-6000); });
  server.stderr.on('data', chunk => { serverOutput = (serverOutput + chunk).slice(-6000); });
  serverExited = once(server, 'exit');
  const deadline = Date.now() + 30000;
  while (!await fetch(`${sourceUrl}/auth/v1/health`, { headers: { apikey: key }, signal: AbortSignal.timeout(1000) }).then(r => r.ok).catch(() => false)) {
    assert.ok(server.exitCode === null && Date.now() < deadline, `Source did not become ready: ${redact(serverOutput)}`);
    await delay(100);
  }
  const seed = newClient(sourceUrl);
  const user = success(await seed.auth.signUp(account), 'source signup').user;
  success(await seed.storage.createBucket(bucket, { public: false, fileSizeLimit: 1024, allowedMimeTypes: ['application/octet-stream'] }), 'source bucket');
  const links = [];
  for (const [index, file] of files.entries()) {
    const uploaded = success(await seed.storage.from(bucket).upload(file.name, file.bytes, { contentType: 'application/octet-stream', cacheControl: '123', metadata: file.metadata }), 'source upload');
    assert.ok(uploaded.id, 'SDK upload returns object UUID');
    const link = { id: index + 1, owner_id: user.id, object_id: uploaded.id, bucket_id: bucket, object_name: file.name };
    success(await seed.from('storage_links').insert(link), 'source application reference');
    links.push(link);
  }
  success(await seed.auth.signOut(), 'source sign out');
  async function appContract(client) {
    assert.equal(success(await client.auth.signInWithPassword(account), 'fresh sign-in').user.id, user.id);
    const records = success(await client.from('storage_links').select('*').order('id'), 'read application references');
    assert.deepEqual(records, links);
    for (const record of records) {
      const file = files.find(file => file.name === record.object_name);
      const downloaded = success(await client.storage.from(record.bucket_id).download(record.object_name), 'download referenced object');
      assert.equal(hash(Buffer.from(await downloaded.arrayBuffer())), hash(file.bytes));
    }
    success(await client.auth.signOut(), 'sign out');
  }
  await appContract(newClient(sourceUrl));
  await stopSource(); // Source writers stay stopped throughout upgrade and post-upgrade checks.
  process.env.HOME = env.HOME;
  process.env.EXPERIMENTAL_STORAGE = '1';
  process.env.DO_NOT_TRACK = '1';
  process.env.SUPABASE_TELEMETRY_DISABLED = '1';
  process.chdir(source);
  const { createApi } = await import(pathToFileURL(join(repo, 'upstream/lite-0.11.0/dist/cli/lib.js')));
  async function sourceRows(customize = false) {
    const api = await createApi({ root: source, withSupabaseClient: false });
    const app = await api.project.local.createApp(undefined, { admin: false });
    try {
      if (customize) {
        const row = (await app.connection.exec('SELECT * FROM "storage.objects" ORDER BY name')).rows[0];
        const metadata = { ...json(row.metadata), qualification: { original: true, nullable: null } };
        await app.connection.exec(`UPDATE "storage.objects" SET metadata=${quote(JSON.stringify(metadata))} WHERE id=${quote(row.id)}`);
      }
      const result = {};
      for (const table of ['auth.users', 'auth.identities', 'storage.buckets', 'storage.objects', 'storage_links']) {
        result[table] = (await app.connection.exec(`SELECT * FROM "${table}" ORDER BY id`)).rows;
      }
      result.config = await readFile(join(source, 'supabase/config.toml'), 'utf8');
      result.hashes = await Promise.all(files.map(file => readFile(join(source, 'supabase/.temp/storage', bucket, file.name)).then(hash)));
      return result;
    } finally { await app.connection.close(); }
  }
  const before = await sourceRows(true);
  assert.deepEqual(before['storage.objects'].map(row => row.name).sort(), files.map(file => file.name).sort(), 'SDK punctuation preserves exact source name');
  for (const row of before['storage.objects']) {
    assert.equal(row.owner, user.id); assert.equal(row.owner_id, user.id);
    assert.deepEqual(json(row.user_metadata), files.find(file => file.name === row.name).metadata);
  }
  if (!real) {
    const rehearsal = JSON.parse((await lite(['upgrade', '--target', 'local', '--storage-quiescent', '--dry-run', '--no-migrate-sessions', '--json'], 120000)).stdout);
    assert.equal(rehearsal.summary.upgrade_safe, true);
    assert.equal(rehearsal.storage.buckets, 1); assert.equal(rehearsal.storage.objects, files.length);
    assert.equal(rehearsal.storage.rehearsal.ok, true);
  }
  if (real) {
    targetStarted = true;
    await lite(['upgrade', '--target', 'local', '--local-dir', target, '--storage-quiescent', '--force', '--no-migrate-sessions', '--dump-credentials', credentialsPath], 480000);
    const credentials = JSON.parse(await readFile(credentialsPath, 'utf8'));
    for (const address of [credentials.apiUrl, credentials.dbUrl]) assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(new URL(address).hostname), 'Target must be loopback');
    const targetConfig = await readFile(join(target, 'supabase/config.toml'), 'utf8');
    const storageConfig = targetConfig.match(/\[storage\]([\s\S]*?)(?=\n\[|$)/)[1];
    assert.match(storageConfig, /enabled\s*=\s*true/);
    assert.match(storageConfig, /file_size_limit\s*=\s*"1048576B"/);
    const projectId = targetConfig.match(/^project_id\s*=\s*"([^"]+)"/m)[1];
    for (const [service, image] of [['storage', 'storage-api:v1.54.1'], ['auth', 'gotrue:v2.188.1']]) {
      const actual = (await run('target image pin', 'docker', ['inspect', '--format', '{{.Config.Image}}', `supabase_${service}_${projectId}`])).stdout.trim();
      assert.ok(actual.endsWith(`/supabase/${image}`) || actual === `supabase/${image}`, `Unexpected ${service} image: ${actual}`);
    }
    const postgres = require('postgres');
    sql = postgres(credentials.dbUrl, { max: 1, onnotice() {} });
    const buckets = await sql.unsafe('SELECT * FROM storage.buckets ORDER BY id');
    assert.equal(buckets.length, 1);
    const originalBucket = before['storage.buckets'][0], savedBucket = buckets[0];
    assert.equal(originalBucket.owner, user.id); assert.equal(originalBucket.owner_id, user.id);
    for (const column of ['id', 'name', 'owner', 'owner_id']) assert.equal(savedBucket[column], originalBucket[column], column);
    assert.equal(savedBucket.public, false); assert.equal(Number(savedBucket.file_size_limit), 1024);
    assert.deepEqual(savedBucket.allowed_mime_types, ['application/octet-stream']);
    for (const column of ['created_at', 'updated_at']) assert.equal(iso(savedBucket[column]), iso(originalBucket[column]), column);
    const objects = await sql.unsafe('SELECT * FROM storage.objects ORDER BY id');
    assert.equal(objects.length, files.length);
    for (const row of objects) {
      const original = before['storage.objects'].find(object => object.id === row.id);
      assert.ok(original, 'original object UUID exists');
      for (const column of ['id', 'bucket_id', 'name', 'owner', 'owner_id']) assert.equal(row[column], original[column], column);
      assert.equal(iso(row.created_at), iso(original.created_at));
      assert.deepEqual(row.user_metadata, json(original.user_metadata));
      assert.deepEqual(row.path_tokens, original.name.split('/'));
      assert.equal(row.metadata.mimetype, 'application/octet-stream');
      assert.match(row.metadata.cacheControl, /(?:max-age=)?123/);
      assert.equal(Number(row.metadata.size), files.find(file => file.name === row.name).bytes.length);
      assert.deepEqual(row.metadata.qualification, json(original.metadata).qualification);
      assert.ok(row.version && row.metadata.eTag, 'target operational metadata regenerated');
    }
    const foreignKeys = await sql.unsafe("SELECT convalidated FROM pg_constraint WHERE conrelid='public.storage_links'::regclass AND contype='f'");
    assert.equal(foreignKeys.length, 3); assert.ok(foreignKeys.every(row => row.convalidated));
    await appContract(newClient(credentials.apiUrl, credentials.anonKey));
    const targetUser = newClient(credentials.apiUrl, credentials.anonKey);
    success(await targetUser.auth.signInWithPassword(account), 'target sign-in');
    const signed = success(await targetUser.storage.from(bucket).createSignedUrl(files[1].name, 60), 'new signed URL');
    assert.equal(new URL(signed.signedUrl).origin, new URL(credentials.apiUrl).origin);
    const downloaded = await fetch(signed.signedUrl, { redirect: 'error', signal: AbortSignal.timeout(10000) });
    assert.equal(downloaded.status, 200); assert.equal(hash(Buffer.from(await downloaded.arrayBuffer())), hash(files[1].bytes));
    for (const [name, bytes, contentType, message] of [['too-big.bin', Buffer.alloc(1025), 'application/octet-stream', /size|large|limit/i], ['wrong-mime.txt', Buffer.from('x'), 'text/plain', /mime|type|allowed/i]]) {
      const rejected = await targetUser.storage.from(bucket).upload(name, bytes, { contentType });
      assert.ok(rejected.error, 'bucket restriction rejects upload'); assert.match(rejected.error.message, message);
    }
    success(await targetUser.auth.signOut(), 'target sign out');
    assert.equal(Number((await sql.unsafe('SELECT count(*) FROM storage.objects'))[0].count), files.length);
  }
  assert.deepEqual(await sourceRows(), before, 'source rows, configuration and bytes unchanged');
  console.log(real ? 'PASS: pinned real local upgrade; fresh sign-in; app references; UUIDs/owners; bytes; metadata; bucket restrictions; signed URL; source unchanged' : 'PASS: source-only CLI/SDK fixture and upgrade dry-run; two exact filenames; app references; bytes; metadata; no Docker or target used');
} catch (error) {
  console.error(redact(error.message)); process.exitCode = 1;
  if (real && targetStarted) await storageFailureDiagnostics().catch(() => console.error('Storage diagnostics unavailable; original failure and cleanup unchanged'));
} finally {
  await stopSource();
  await sql?.end({ timeout: 5 }).catch(() => {});
  if (targetStarted) {
    try { await targetCli(['stop', '--workdir', target, '--no-backup']); }
    catch { cleanupFailed = true; process.exitCode = 1; console.error('Fixture target cleanup failed; retain its workdir for the job cleanup step'); }
  }
  process.chdir(originalCwd);
  await rm(credentialsPath, { force: true });
  if (!cleanupFailed) await rm(work, { recursive: true, force: true });
}
