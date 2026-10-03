import test from 'node:test';
import assert from 'node:assert/strict';
import { createCheckedDdlTranslator, translationRecord } from '../src/checked-ddl-translator.mjs';
import { prepareStartupArtifact } from '../scripts/prepare-startup.mjs';
import { runWorker } from '../scripts/startup/supervisor.mjs';

const ddl = 'CREATE TABLE tasks (id integer PRIMARY KEY);';
const options = { introspection: { tables: [], columns: [] }, strict: undefined };
const result = {
  ddl, schema: {},
  rls: { tables: ['tasks'], policies: [{ name: 'own', roles: ['authenticated'], using: { owner_id: { $eq: 'auth.uid()' } } }] },
  enums: { status: ['open', 'closed'] },
  vars: { functionBody: { sql: 'auth.uid()' } },
  comments: [{ comment: 'Synthetic metadata' }], tableConstraints: [],
};
function artifact() {
  return { formatVersion: 1, runtimeFingerprint: 'test-runtime', entries: [translationRecord(ddl, options, structuredClone(result))] };
}

test('prepared translator preserves complete metadata across concurrent isolated calls', async () => {
  const input = artifact();
  const translator = createCheckedDdlTranslator(input, 'test-runtime');
  input.entries[0].result.rls.tables.push('mutated-outside-cache');
  const [one, two] = await Promise.all([translator(ddl, options), translator(ddl, options)]);
  assert.deepEqual(one, result);
  assert.deepEqual(two, result);
  one.rls.policies[0].roles.push('anon');
  one.enums.status.push('bad');
  assert.deepEqual(two, result);
  assert.deepEqual(await translator(ddl, options), result);
});

test('all options and exact SQL participate in invalidation, independent of object-key order', async () => {
  const translator = createCheckedDdlTranslator(artifact(), 'test-runtime');
  assert.deepEqual(await translator(ddl, { strict: undefined, introspection: { columns: [], tables: [] } }), result);
  for (const [sql, changed] of [
    [ddl + ' ', options],
    [ddl, { ...options, strict: true }],
    [ddl, { introspection: { tables: [{ name: 'existing' }], columns: [] } }],
    [ddl, { ...options, search_path: ['private', 'public'] }],
    [ddl, { ...options, futureOption: true }],
  ]) await assert.rejects(translator(sql, changed), /cache miss/);
  // An error doesn't poison subsequent valid requests.
  assert.deepEqual(await translator(ddl, options), result);
});

test('runtime drift, unsupported format, duplicate keys, and corrupt metadata fail closed', () => {
  assert.throws(() => createCheckedDdlTranslator(artifact(), 'different-runtime'), /mismatch/);
  assert.throws(() => createCheckedDdlTranslator({ ...artifact(), formatVersion: 2 }, 'test-runtime'), /mismatch/);
  const duplicate = artifact(); duplicate.entries.push(duplicate.entries[0]);
  assert.throws(() => createCheckedDdlTranslator(duplicate, 'test-runtime'), /Invalid/);
  const corrupt = structuredClone(artifact()); corrupt.entries[0].result.rls.policies = [];
  assert.throws(() => createCheckedDdlTranslator(corrupt, 'test-runtime'), /Invalid/);
});

test('unrepresentable or missing context cannot silently collide with a valid translation', async () => {
  const translator = createCheckedDdlTranslator(artifact(), 'test-runtime');
  const cycle = {}; cycle.self = cycle;
  for (const invalid of [
    {}, { ...options, callback: () => {} }, { ...options, value: NaN },
    { ...options, value: new Map() }, { ...options, value: cycle },
    { ...options, value: new Array(1) }, { ...options, [Symbol('hidden')]: () => {} },
    { ...options, get unsupported() { return true; } },
  ]) await assert.rejects(translator(ddl, invalid), /requires|require/);
});

test('prepared startup matches live startup and enforces owner, anonymous, and custom-role writes', async () => {
  const prepared = await prepareStartupArtifact();
  assert.equal(prepared.entries, 2);
  const samples = [];
  for (const mode of ['disabled', 'pretranslated']) {
    const sample = await runWorker({
      worker: mode === 'pretranslated'
        ? new URL('./helpers/startup-without-parser.mjs', import.meta.url)
        : new URL('../scripts/startup/worker.mjs', import.meta.url),
      env: { ...process.env, NODE_OPTIONS: '', NODE_DISABLE_COMPILE_CACHE: '1', LITE_STARTUP_MODE: mode },
      timeoutMs: 10000,
    });
    assert.equal(sample.verifiedRows, 80);
    assert.equal(sample.anonymousRows, 0);
    assert.equal(sample.rlsWriteChecks, true);
    assert.equal(sample.customRoleChecks, true);
    assert.equal(sample.pretranslated, mode === 'pretranslated');
    samples.push(sample);
  }
  assert.equal(samples[0].responseSha256, samples[1].responseSha256);
  // No timing/RSS thresholds in correctness tests: shared host noise is not a failure.
});
