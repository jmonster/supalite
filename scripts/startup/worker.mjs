import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { performance } from 'node:perf_hooks';
import { getCompileCacheDir } from 'node:module';
import { createHash } from 'node:crypto';
import { ddl, rows, expected, owner, otherOwner, secret, select } from './fixture.mjs';

// Application imports are deliberately dynamic. Static imports would hide their cost.
const phaseMs = {};
const rssBytes = { beforeImport: process.memoryUsage().rss };
const started = performance.now();
let previous = started;
function mark(name) {
  const now = performance.now();
  phaseMs[name] = now - previous;
  previous = now;
  rssBytes[name] = process.memoryUsage().rss;
}
const packageRoot = new URL('../../.generated/baseline/node_modules/@supabase/lite/', import.meta.url);
const { App } = await import(new URL('dist/index.js', packageRoot));
const { createConnection } = await import(new URL('dist/db/node/index.js', packageRoot));
const { createClient } = await import('@supabase/supabase-js');
const { SignJWT } = await import('jose');
const pretranslated = process.env.LITE_STARTUP_MODE === 'pretranslated';
const cached = pretranslated ? await import('../../src/checked-ddl-translator.mjs') : null;
const artifact = pretranslated ? JSON.parse(await readFile(new URL('../../.generated/startup-translations.json', import.meta.url), 'utf8')) : null;
const runtime = pretranslated ? await import('./runtime.mjs') : null;
mark('import');
const connection = createConnection({ url: ':memory:' });
try {
  if (pretranslated) {
    connection.config.translation.translateDdl = cached.createCheckedDdlTranslator(artifact, await runtime.runtimeFingerprint(connection));
  }
  const app = new App({
    connection,
    auth: { enabled: true, jwt_secret: secret },
    storage: { enabled: false },
    options: { server: { admin: false, disableStudio: true } },
  });
  mark('create');
  await app.ensureSystemSchema();
  mark('systemSchema');
  await connection.createMigrator(ddl).migrate();
  mark('userSchema');
  const schemaReadyMs = performance.now() - started;

  // Seed through the real adapter, respecting its 100-parameter statement limit.
  await connection.kysely.insertInto('projects').values([
    { id: 1, name: 'Roadmap' }, { id: 2, name: 'Operations' },
  ]).execute();
  for (let index = 0; index < rows.length; index += 10) {
    await connection.kysely.insertInto('tasks').values(rows.slice(index, index + 10)).execute();
  }
  mark('seed');
  const token = await new SignJWT({ sub: owner, role: 'authenticated' })
    .setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('1h')
    .sign(new TextEncoder().encode(secret));
  const client = createClient('http://localhost', 'test-only-key', {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      headers: { Authorization: `Bearer ${token}` },
      fetch: (url, options) => app.fetch(new Request(url, options)),
    },
  });
  mark('client');
  async function request() {
    return await client.from('tasks').select(select, { count: 'exact' }).eq('status', 'open').order('id');
  }
  function verify(result) {
    assert.equal(result.error, null, JSON.stringify(result.error));
    assert.equal(result.status, 200);
    assert.equal(result.count, expected.length);
    assert.deepEqual(result.data, expected);
  }
  const first = await request();
  mark('firstRequest');
  const importToFirstResponseMs = previous - started;
  verify(first);
  const usage = process.resourceUsage();
  const ready = {
    phaseMs, rssBytes, schemaReadyMs, importToFirstResponseMs,
    maxRssBytesAtFirstResponse: usage.maxRSS * 1024,
    cpuMsAtFirstResponse: { user: usage.userCPUTime / 1000, system: usage.systemCPUTime / 1000 },
    involuntaryContextSwitchesAtFirstResponse: usage.involuntaryContextSwitches,
    compileCacheEnabled: getCompileCacheDir() !== undefined,
    pretranslated,
    verifiedRows: expected.length,
    responseSha256: createHash('sha256').update(JSON.stringify(first.data)).digest('hex'),
    sqliteVersion: (await connection.exec('SELECT sqlite_version() AS version')).rows[0].version,
  };
  // Supervisor records spawn-to-verified-response here, before warm requests/exit.
  process.send?.({ type: 'ready', value: ready });
  const warmRequestMs = [];
  for (let index = 0; index < 5; index++) {
    const before = performance.now();
    const result = await request();
    warmRequestMs.push(performance.now() - before);
    verify(result);
  }
  // A fresh anonymous client must not see the owner's tasks. This is outside timing.
  const anonymous = createClient('http://localhost', 'test-only-key', {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (url, options) => app.fetch(new Request(url, options)) },
  });
  const denied = await anonymous.from('tasks').select('id');
  assert.equal(denied.error, null, JSON.stringify(denied.error));
  assert.deepEqual(denied.data, []);
  const foreignInsert = await client.from('tasks').insert({ id: 201, project_id: 1, owner_id: otherOwner, title: 'Denied' });
  assert.ok(foreignInsert.error, 'RLS must reject writing another owner');
  const foreignUpdate = await client.from('tasks').update({ title: 'Denied' }).eq('id', 2).select('id');
  assert.equal(foreignUpdate.error, null);
  assert.deepEqual(foreignUpdate.data, []);
  const ownInsert = await client.from('tasks').insert({ id: 201, project_id: 1, owner_id: owner, title: 'Allowed' }).select('id');
  assert.equal(ownInsert.error, null, JSON.stringify(ownInsert.error));
  assert.deepEqual(ownInsert.data, [{ id: 201 }]);
  const removed = await client.from('tasks').delete().eq('id', 201).select('id');
  assert.equal(removed.error, null);
  assert.deepEqual(removed.data, [{ id: 201 }]);
  const reviewerToken = await new SignJWT({ sub: otherOwner, role: 'reviewer' })
    .setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('1h')
    .sign(new TextEncoder().encode(secret));
  const reviewer = createClient('http://localhost', 'test-only-key', {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${reviewerToken}` }, fetch: (url, options) => app.fetch(new Request(url, options)) },
  });
  const review = await reviewer.from('tasks').select('id', { count: 'exact', head: true });
  assert.equal(review.error, null, JSON.stringify(review.error));
  assert.equal(review.count, 160);
  const reviewerWrite = await reviewer.from('tasks').insert({ id: 202, project_id: 1, owner_id: otherOwner, title: 'Denied reviewer write' });
  assert.ok(reviewerWrite.error, 'SELECT-only custom role must not write');
  await connection.close();
  const result = { ...ready, warmRequestMs, anonymousRows: 0, rlsWriteChecks: true, customRoleChecks: true };
  if (process.send) process.send({ type: 'complete', value: result });
  else console.log(JSON.stringify(result));
} finally {
  await connection.close();
}
