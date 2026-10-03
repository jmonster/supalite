import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, cp, rm, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

for (const corruption of ['version', 'bundle', 'integrity']) {
  test(`installer refuses ${corruption} drift before producing artifacts`, async () => {
    const root = await mkdtemp(join(tmpdir(), 'supalite-guard-'));
    try {
      await mkdir(join(root, 'scripts'), { recursive: true });
      await cp(new URL('../scripts/prepare-baseline.mjs', import.meta.url), join(root, 'scripts/prepare-baseline.mjs'));
      const source = new URL('../node_modules/@supabase/lite/', import.meta.url);
      const target = join(root, 'node_modules/@supabase/lite');
      await mkdir(join(target, 'dist'), { recursive: true });
      const pkg = JSON.parse(await readFile(new URL('package.json', source), 'utf8'));
      if (corruption === 'version') pkg.version = '0.11.1';
      await writeFile(join(target, 'package.json'), JSON.stringify(pkg));
      const bundle = await readFile(new URL('dist/index.js', source), 'utf8');
      await writeFile(join(target, 'dist/index.js'), bundle + (corruption === 'bundle' ? '\n' : ''));
      const lock = JSON.parse(await readFile(new URL('../package-lock.json', import.meta.url), 'utf8'));
      if (corruption === 'integrity') lock.packages['node_modules/@supabase/lite'].integrity = 'sha512-invalid';
      await writeFile(join(root, 'package-lock.json'), JSON.stringify(lock));
      const run = spawnSync(process.execPath, [join(root, 'scripts/prepare-baseline.mjs')], { encoding: 'utf8', timeout: 10_000 });
      assert.notEqual(run.status, 0); assert.match(run.stderr, /Unsupported baseline/);
      await assert.rejects(access(join(root, '.generated')));
    } finally { await rm(root, { recursive: true, force: true }); }
  });
}
