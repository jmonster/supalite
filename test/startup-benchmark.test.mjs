import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { runWorker, summarize } from '../scripts/startup/supervisor.mjs';
import { rows, expected, owner, otherOwner } from '../scripts/startup/fixture.mjs';

test('startup fixture keeps owners and query selectivity distinct', () => {
  assert.equal(rows.length, 200);
  assert.equal(new Set(rows.map((row) => row.id)).size, 200);
  assert.equal(rows.filter((row) => row.owner_id === owner).length, 100);
  assert.equal(rows.filter((row) => row.owner_id === otherOwner).length, 100);
  assert.equal(expected.length, 80);
  assert.ok(expected.every((row) => row.id % 2 === 1 && row.id % 5 !== 0));
});

test('summary retains ranges and computes odd/even medians without mutation', () => {
  const values = [4, 1, 9, 2];
  assert.deepEqual(summarize(values), { n: 4, min: 1, median: 3, max: 9 });
  assert.deepEqual(values, [4, 1, 9, 2]);
  assert.equal(summarize([9, 2, 4]).median, 4);
  assert.throws(() => summarize([]), /zero observations/);
});

async function withWorker(source, callback) {
  const directory = await mkdtemp(join(tmpdir(), 'lite-startup-supervisor-'));
  try {
    const file = join(directory, 'worker.mjs');
    await writeFile(file, source);
    await callback(pathToFileURL(file));
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

test('supervisor records readiness separately from process completion', async () => {
  await withWorker(`process.send({type:'ready',value:{ok:true}});
    setTimeout(() => { process.send({type:'complete',value:{ok:true}}); }, 50);`, async (worker) => {
    const result = await runWorker({ worker, env: process.env, timeoutMs: 5000 });
    assert.equal(result.ok, true);
    assert.ok(result.spawnToExitMs > result.spawnToVerifiedResponseMs);
  });
});

test('supervisor kills a synchronous hang instead of accepting partial readiness', async () => {
  await withWorker(`process.send({type:'ready',value:{ok:true}}); for (;;) {}`, async (worker) => {
    await assert.rejects(runWorker({ worker, env: process.env, timeoutMs: 150 }), /exceeded budget/);
  });
});

test('supervisor rejects nonzero exit and a missing completion record', async () => {
  for (const source of ['process.exitCode = 1;', "process.send({type:'ready',value:{ok:true}});"]) {
    await withWorker(source, async (worker) => {
      await assert.rejects(runWorker({ worker, env: process.env, timeoutMs: 5000 }), /failed/);
    });
  }
});

test('fresh Node worker validates authenticated results and anonymous RLS denial', async () => {
  const result = await runWorker({
    worker: new URL('../scripts/startup/worker.mjs', import.meta.url),
    env: { ...process.env, NODE_OPTIONS: '', NODE_DISABLE_COMPILE_CACHE: '1' },
    timeoutMs: 10000,
  });
  assert.equal(result.verifiedRows, 80);
  assert.equal(result.anonymousRows, 0);
  assert.equal(result.warmRequestMs.length, 5);
  assert.equal(result.compileCacheEnabled, false);
  assert.ok(result.schemaReadyMs < result.importToFirstResponseMs);
  assert.ok(result.importToFirstResponseMs < result.spawnToVerifiedResponseMs);
  assert.match(result.responseSha256, /^[a-f0-9]{64}$/);
});
