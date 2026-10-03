import { mkdir, writeFile } from 'node:fs/promises';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';
import { translationRecord } from '../src/checked-ddl-translator.mjs';
import { runtimeFingerprint } from './startup/runtime.mjs';
import { ddl, secret } from './startup/fixture.mjs';

export async function prepareStartupArtifact() {
  const started = performance.now();
  const packageRoot = new URL('../.generated/baseline/node_modules/@supabase/lite/', import.meta.url);
  const { App, SqliteConnection } = await import(new URL('dist/index.js', packageRoot));
  const { createConnection } = await import(new URL('dist/db/node/index.js', packageRoot));
  const connection = createConnection({ url: ':memory:' });
  try {
    const artifact = {
      formatVersion: 1,
      runtimeFingerprint: await runtimeFingerprint(connection),
      entries: [],
    };
    const originalTranslate = connection.translateDdl.bind(connection);
    // Observe public translation calls while provisioning a disposable build database.
    connection.translateDdl = async (input, options) => {
      const introspection = await connection.introspect({ postprocess: false });
      const result = await originalTranslate(input, options);
      artifact.entries.push(translationRecord(input, { ...options, introspection }, {
        ddl: result.ddl, ...SqliteConnection.serializeDeparseInfo(result),
      }));
      return result;
    };
    const app = new App({
      connection, auth: { enabled: true, jwt_secret: secret }, storage: { enabled: false },
      options: { server: { admin: false, disableStudio: true } },
    });
    await app.ensureSystemSchema();
    await connection.createMigrator(ddl).migrate();
    await mkdir(new URL('../.generated/', import.meta.url), { recursive: true });
    const output = new URL('../.generated/startup-translations.json', import.meta.url);
    const bytes = JSON.stringify(artifact) + '\n';
    await writeFile(output, bytes);
    const measurement = { entries: artifact.entries.length, bytes: Buffer.byteLength(bytes), buildMs: performance.now() - started };
    await writeFile(new URL('../.generated/startup-preparation.json', import.meta.url), JSON.stringify(measurement) + '\n');
    return measurement;
  } finally {
    await connection.close();
  }
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log(JSON.stringify(await prepareStartupArtifact()));
}
