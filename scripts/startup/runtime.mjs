import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

export async function runtimeFingerprint(connection) {
  const [bundle, lock] = await Promise.all([
    readFile(new URL('../../.generated/baseline/node_modules/@supabase/lite/dist/index.js', import.meta.url)),
    readFile(new URL('../../package-lock.json', import.meta.url)),
  ]);
  const sqlite = (await connection.exec('SELECT sqlite_version() AS version')).rows[0].version;
  const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
  return `lite-bundle:${hash(bundle)}:lock:${hash(lock)}:node:${process.versions.node}:sqlite:${sqlite}`;
}
