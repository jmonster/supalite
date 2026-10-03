/** Manual integration check. Run from the patched evals/packages/platform-lite. */
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';

const packageDir = process.cwd();
const { createPlatform } = await import(pathToFileURL(join(packageDir, 'src/app.ts')).href);
const cli = process.env.SUPABASE_CLI_BIN ?? 'supabase';
const run = promisify(execFile);
const cwd = await mkdtemp(join(tmpdir(), 'platform-lite-cli-ledger-'));
const home = join(cwd, 'home');
await mkdir(home);
await mkdir(join(cwd, 'supabase', 'migrations'), { recursive: true });
await writeFile(join(cwd, 'supabase', 'config.toml'), 'project_id = "ledger-check"\n');
await writeFile(join(cwd, 'supabase', 'migrations', '20260101000000_from_cli.sql'),
  'CREATE TABLE from_cli (id int PRIMARY KEY);\nINSERT INTO from_cli VALUES (1);\n');
const env = {
  ...process.env,
  HOME: home,
  SUPABASE_HOME: join(home, '.supabase'),
  SUPABASE_ACCESS_TOKEN: '',
  SUPABASE_TELEMETRY_DISABLED: '1',
  DO_NOT_TRACK: '1',
};
async function invoke(args: string[]) {
  return run(cli, args, { cwd, env, timeout: 60000 });
}
// Official opt-out controls, confined to this temporary test home.
await invoke(['telemetry', 'disable']);
assert.match((await invoke(['telemetry', 'status'])).stdout, /Telemetry is disabled/);
assert.equal((await invoke(['--version'])).stdout.trim(), '2.117.0');

const ref = 'cliledgerxxxxxxxxxxx';
const other = 'isolatedxxxxxxxxxxxx';
const platform = await createPlatform({ projects: [{ ref }, { ref: other }] });
const pg = await platform.listenPg({ hostname: '127.0.0.1' });
const url = `${pg.connectionString(ref)}?sslmode=disable`;
async function command(args: string[]) {
  const result = await invoke([...args, '--db-url', url, '--workdir', cwd,
    '--yes', '--output-format', 'json']);
  const output = JSON.parse(result.stdout.trim());
  console.log(JSON.stringify({ command: args, result: output }));
  return output;
}
async function history(projectRef = ref) {
  const response = await platform.app.request(`/v1/projects/${projectRef}/database/migrations`);
  assert.equal(response.status, 200);
  return response.json();
}
try {
  await command(['db', 'push', '--skip-vault']);
  assert.deepEqual(await history(), [{ version: '20260101000000', name: 'from_cli' }]);
  const response = await platform.app.request(`/v1/projects/${ref}/database/migrations`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'from_http', query: 'CREATE TABLE from_http(id int)' }),
  });
  assert.equal(response.status, 201);
  const applied = await response.json() as { version: string; name: string };
  await writeFile(join(cwd, 'supabase', 'migrations', `${applied.version}_from_http.sql`),
    'CREATE TABLE from_http(id int)');
  const listed = await command(['migration', 'list']);
  assert.deepEqual(listed.migrations.map((m: {local: string; remote: string}) => [m.local, m.remote]), [
    ['20260101000000', '20260101000000'], [applied.version, applied.version],
  ]);
  assert.equal((await command(['db', 'push', '--skip-vault'])).upToDate, true);
  await command(['migration', 'repair', '20260101000000', '--status', 'reverted']);
  assert.deepEqual(await history(), [applied]);
  assert.deepEqual(await history(other), []);
  assert.deepEqual((await platform.getProject(ref).pglite.query(
    'SELECT version, name, statements FROM supabase_migrations.schema_migrations ORDER BY version'
  )).rows, [{ ...applied, statements: ['CREATE TABLE from_http(id int)'] }]);
  console.log('PASS: CLI push/list/repair, HTTP apply/list, duplicate-push avoidance, and tenant isolation');
} finally {
  await pg.close();
  await platform.dispose();
  await rm(cwd, { recursive: true, force: true });
}
