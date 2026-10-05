import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { chmod, mkdtemp, mkdir, readFile, readdir, readlink, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { PGlite } from "@electric-sql/pglite";
import { modules } from "./helpers/lite.mjs";
import { isExperimentalEnabled, setExperimental } from "../upstream/lite-0.11.0/dist/index.js";
import * as cli from "../upstream/lite-0.11.0/dist/cli/index.js";
import * as storage from "../upstream/lite-0.11.0/dist/cli/upgrade-storage.js";

// PGlite proves SQL/rehearsal behavior only; it is not a Supabase Storage target.
const auth = {
  enabled: true,
  jwt_secret: "storage-fixture-only-0470d2f05ab749769aabbab418ac8098",
  publishable_key: "test-only-key",
  email: { enable_confirmations: false },
};
const ddl = [
  "CREATE TABLE public.storage_links (id integer PRIMARY KEY, object_id uuid NOT NULL REFERENCES storage.objects(id), bucket_id text NOT NULL REFERENCES storage.buckets(id));",
  "GRANT SELECT, INSERT ON public.storage_links TO authenticated;",
  "CREATE POLICY fixture_buckets ON storage.buckets FOR ALL TO authenticated USING (true) WITH CHECK (true);",
  "CREATE POLICY fixture_objects ON storage.objects FOR ALL TO authenticated USING (true) WITH CHECK (true);",
];
const files = [
  { bucket: "private-files", name: "empty.bin", bytes: Buffer.alloc(0), metadata: {} },
  { bucket: "private-files", name: "nested/O'Brien.bin", bytes: Buffer.from([0, 1, 127, 128, 255, 13, 10]), metadata: { label: "O'Brien", nested: { keep: true } } },
  { bucket: "public-files", name: "public.bin", bytes: Buffer.from("public fixture\n"), metadata: { public: true } },
];
const hash = bytes => createHash("sha256").update(bytes).digest("hex");
const quote = value => `'${String(value).replaceAll("'", "''")}'`;
const sourceTable = (app, name) => app.connection.dialect === "postgres" ? `storage.${name}` : `"storage.${name}"`;
const parseJson = value => typeof value === "string" ? JSON.parse(value) : value;
const originalStorageFlag = isExperimentalEnabled("storage");
test.before(() => { setExperimental("storage", true); });
test.after(() => {
  setExperimental("storage", originalStorageFlag);
});

async function fixture(t, backend = "node") {
  const root = await mkdtemp(join(tmpdir(), "lite-storage-upgrade-"));
  const storageRoot = join(root, "supabase", ".temp", "storage");
  await mkdir(storageRoot, { recursive: true });
  const { App, factories } = modules();
  let connection = await factories[backend](backend === "pglite" ? undefined : { url: ":memory:", ddlDialect: "postgres" });
  let app;
  t.after(async () => {
    // After-hooks outlive each test; release the closed fixture they capture.
    try { await connection.close(); } finally { app = null; connection = null; }
    await rm(root, { recursive: true, force: true });
  });
  app = new App({
    connection, auth,
    storage: { enabled: true, file_size_limit: "1MiB" },
    options: { server: { admin: false, disableStudio: true } },
  });
  app._storageAdapter = new cli.FileSystemStorageAdapter({ basePath: storageRoot });
  await app.ensureSystemSchema();
  await connection.createMigrator(ddl.join("\n")).migrate();
  const client = createClient("http://localhost", auth.publishable_key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (url, options) => app.fetch(new Request(url, options)) },
  });
  const signup = await client.auth.signUp({ email: "storage@example.test", password: "Fixture-only-password-44!" });
  assert.equal(signup.error, null, JSON.stringify(signup.error));
  const userId = signup.data.user.id;
  for (const bucket of ["private-files", "public-files", "empty-bucket"]) {
    const created = await client.storage.createBucket(bucket, {
      public: bucket === "public-files",
      fileSizeLimit: 1024,
      allowedMimeTypes: ["application/octet-stream"],
    });
    assert.equal(created.error, null, JSON.stringify(created.error));
  }
  for (const file of files) {
    const upload = await client.storage.from(file.bucket).upload(file.name, file.bytes, {
      contentType: "application/octet-stream", cacheControl: "123", metadata: file.metadata,
    });
    assert.equal(upload.error, null, `${file.name}: ${JSON.stringify(upload.error)}`);
    const download = await client.storage.from(file.bucket).download(file.name);
    assert.equal(download.error, null, `${file.name}: ${JSON.stringify(download.error)}`);
    assert.equal(hash(Buffer.from(await download.data.arrayBuffer())), hash(file.bytes));
  }
  const objects = (await connection.exec(`SELECT * FROM ${sourceTable(app, "objects")} ORDER BY bucket_id, name`)).rows;
  assert.deepEqual(objects.map(row => row.name).sort(), files.map(file => file.name).sort());
  for (const [index, row] of objects.entries()) {
    const inserted = await client.from("storage_links").insert({ id: index + 1, object_id: row.id, bucket_id: row.bucket_id });
    assert.equal(inserted.error, null, JSON.stringify(inserted.error));
  }
  const migrations = {
    files: [{ filename: "20261004000000_storage_fixture.sql", version: "20261004000000", name: "storage_fixture", sql: ddl.join("\n") }],
    sql: ddl.join("\n"),
    statements: ddl.map((sql, index) => ({ file: "20261004000000_storage_fixture.sql", index: index + 1, total: ddl.length, sql })),
  };
  const options = { target: "local", quiescent: true, sourceRoot: storageRoot, adapterClass: cli.FileSystemStorageAdapter };
  return { app, connection, client, root, storageRoot, userId, objects, migrations, options };
}

async function sourceState(source) {
  return {
    buckets: (await source.connection.exec(`SELECT * FROM ${sourceTable(source.app, "buckets")} ORDER BY id`)).rows,
    objects: (await source.connection.exec(`SELECT * FROM ${sourceTable(source.app, "objects")} ORDER BY id`)).rows,
    links: (await source.connection.exec("SELECT * FROM storage_links ORDER BY id")).rows,
    config: JSON.parse(JSON.stringify(source.app.config)),
    bytes: await Promise.all(files.map(async f => hash(await readFile(join(source.storageRoot, f.bucket, f.name))))),
  };
}

for (const backend of ["node", "pglite"]) {
  test(`${backend}: real SDK files ${backend === "pglite" ? "reject unsupported source without changing it" : "inventory preserves logical identity and source state"}`, { concurrency: false }, async t => {
    const source = await fixture(t, backend);
    const before = await sourceState(source);
    if (backend === "pglite") {
      await assert.rejects(storage.inspectStorage(source.app, source.options), /SQLite|source|support/i);
      assert.deepEqual(await sourceState(source), before);
      return;
    }
    const snapshot = await storage.inspectStorage(source.app, source.options);
    assert.equal(snapshot.buckets.length, 3);
    assert.equal(snapshot.objects.length, files.length);
    assert.equal(snapshot.objects.reduce((sum, object) => sum + object.size, 0), files.reduce((sum, file) => sum + file.bytes.length, 0));
    assert.equal(snapshot.buckets.find(bucket => bucket.id === "public-files").public, true);
    assert.equal(snapshot.buckets.find(bucket => bucket.id === "private-files").public, false);
    for (const bucket of snapshot.buckets) {
      assert.equal(bucket.owner, source.userId);
      assert.equal(bucket.owner_id, source.userId);
      assert.equal(Number(bucket.file_size_limit), 1024);
      assert.deepEqual(bucket.allowed_mime_types, ["application/octet-stream"]);
    }
    for (const file of files) {
      const object = snapshot.objects.find(object => object.row.bucket_id === file.bucket && object.row.name === file.name);
      const original = source.objects.find(object => object.bucket_id === file.bucket && object.name === file.name);
      assert.equal(object.row.id, original.id);
      assert.equal(object.row.owner, source.userId);
      assert.equal(object.row.owner_id, source.userId);
      assert.equal(new Date(object.row.created_at).toISOString(), new Date(original.created_at).toISOString());
      assert.equal(object.size, file.bytes.length);
      assert.equal(object.sha256, hash(file.bytes));
      assert.equal(object.contentType, "application/octet-stream");
      assert.match(object.cacheControl, /(?:max-age=)?123/);
      assert.deepEqual(object.row.user_metadata, file.metadata);
    }
    await storage.assertStorageUnchanged(source.app, snapshot);
    source.app.config.storage.enabled = false;
    try {
      assert.equal((await storage.inspectStorage(source.app, source.options)).objects.length, files.length, "disabled configuration must not hide existing data");
    } finally { source.app.config.storage.enabled = true; }
    assert.deepEqual(await sourceState(source), before);
  });
}

test("CLI schema reconstruction and rehearsal restore Storage before application foreign keys", { concurrency: false }, async t => {
  const source = await fixture(t);
  const migrationDirectory = join(source.root, "supabase", "migrations");
  await mkdir(migrationDirectory, { recursive: true });
  // Recorded PostgreSQL SQL remains authoritative over an edited same-version file.
  await writeFile(join(migrationDirectory, "20261004000000_storage_fixture.sql"), "CREATE TABLE incorrect_disk_history (id integer);");
  await writeFile(join(migrationDirectory, "20261004000001_pending_policy.sql"), "CREATE POLICY pending_extension ON storage.objects FOR SELECT TO authenticated USING (storage.extension(name) = 'bin');");
  await source.connection.exec('CREATE TABLE IF NOT EXISTS "supabase_migrations.schema_migrations" (version text PRIMARY KEY, name text, statements text, rollback text, created_by text, idempotency_key text)');
  await source.connection.exec(`INSERT INTO "supabase_migrations.schema_migrations" (version, name, statements) VALUES ('20261004000000', 'storage_fixture', ${quote(JSON.stringify(ddl))})`);
  const cwd = process.cwd();
  try {
    process.chdir(source.root);
    source.migrations = await cli.collectUpgradeSource(source.app);
  } finally { process.chdir(cwd); }
  assert.match(source.migrations.sql, /REFERENCES storage.objects/);
  assert.match(source.migrations.sql, /pending_extension/);
  assert.doesNotMatch(source.migrations.sql, /incorrect_disk_history/);
  const before = await sourceState(source);
  const snapshot = await storage.inspectStorage(source.app, source.options);
  const report = await cli.readiness(source.app, source.migrations, source.options);
  assert.equal(report.ok, true, JSON.stringify(report.errors));
  assert.equal(report.storage.objects.length, files.length);
  assert.equal(report.warnings.some(warning => /Storage.*not.*supported/i.test(warning)), false);

  // upgradeSchema() is the exporter's distinct bootstrap, not the rehearsal DB.
  const schema = await cli.upgradeSchema(source.migrations);
  assert.equal(schema.has("public.storage_links"), true);
  const exported = await cli.exportUserData(source.app, source.migrations);
  assert.equal(exported.some(table => table.schema === "storage"), false);
  assert.equal(exported.find(table => table.table === "storage_links").inserts.length, files.length);
  const rehearsal = await cli.rehearseUpgrade(source.app, source.migrations, { storage: snapshot });
  assert.equal(rehearsal.ok, true, JSON.stringify(rehearsal.failures));
  assert.equal(rehearsal.dataInserts, files.length);
  assert.deepEqual(await sourceState(source), before);

  // A migration-seeded Storage row must not be silently skipped or merged.
  const seededSql = "INSERT INTO storage.buckets (id, name) VALUES ('private-files', 'private-files');";
  const seeded = {
    ...source.migrations,
    sql: `${source.migrations.sql}\n${seededSql}`,
    statements: [...source.migrations.statements, { file: "seed.sql", index: 1, total: 1, sql: seededSql }],
  };
  const conflict = await cli.rehearseUpgrade(source.app, seeded, { storage: snapshot });
  assert.equal(conflict.ok, false);
  assert.match(JSON.stringify(conflict.failures), /storage|bucket|seed/i);
  const triggerSql = [
    "CREATE FUNCTION public.change_storage_owner() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN UPDATE storage.objects SET owner=NULL WHERE id=NEW.object_id; RETURN NEW; END $$;",
    "CREATE TRIGGER change_storage_owner AFTER INSERT ON public.storage_links FOR EACH ROW EXECUTE FUNCTION public.change_storage_owner();",
  ];
  const changesStorage = {
    ...source.migrations,
    sql: `${source.migrations.sql}\n${triggerSql.join("\n")}`,
    statements: [...source.migrations.statements, ...triggerSql.map(sql => ({ file: "trigger.sql", index: 1, total: 1, sql }))],
  };
  const changed = await cli.rehearseUpgrade(source.app, changesStorage, { storage: snapshot });
  assert.equal(changed.ok, false);
  assert.match(JSON.stringify(changed.failures), /Application-row import changed Storage/);
  assert.deepEqual(await sourceState(source), before);
});

test("source preflight rejects unsupported and changed sources without altering rows or files", { concurrency: false }, async t => {
  const source = await fixture(t);
  const before = await sourceState(source);
  await assert.rejects(storage.inspectStorage(source.app, { ...source.options, target: "https://hosted.example.test" }), /local|target|support/i);
  await assert.rejects(storage.inspectStorage(source.app, { ...source.options, quiescent: false }), /quiescen|writ|stop/i);
  const originalAdapter = source.app._storageAdapter;
  try {
    source.app._storageAdapter = { getObject: originalAdapter.getObject.bind(originalAdapter) };
    await assert.rejects(storage.inspectStorage(source.app, source.options), /adapter|filesystem|stock/i);
  } finally { source.app._storageAdapter = originalAdapter; }

  const buckets = sourceTable(source.app, "buckets");
  try {
    await source.connection.exec(`UPDATE ${buckets} SET file_size_limit = 1 WHERE id = 'private-files'`);
    await assert.rejects(storage.inspectStorage(source.app, source.options), error => {
      assert.match(error.message, /private-files/);
      assert.match(error.message, /O'Brien\.bin/);
      assert.match(error.message, /7/);
      assert.match(error.message, /limit|size/i);
      return true;
    });
  } finally { await source.connection.exec(`UPDATE ${buckets} SET file_size_limit = 1024 WHERE id = 'private-files'`); }
  try {
    await source.connection.exec(`UPDATE ${buckets} SET allowed_mime_types = '["text/plain"]' WHERE id = 'private-files'`);
    await assert.rejects(storage.inspectStorage(source.app, source.options), error => {
      assert.match(error.message, /private-files/);
      assert.match(error.message, /application\/octet-stream/);
      assert.match(error.message, /text\/plain/);
      return true;
    });
  } finally { await source.connection.exec(`UPDATE ${buckets} SET allowed_mime_types = '["application/octet-stream"]' WHERE id = 'private-files'`); }

  const orphan = join(source.storageRoot, "private-files", "orphan.bin");
  try {
    await writeFile(orphan, Buffer.from("orphan fixture"));
    await assert.rejects(storage.inspectStorage(source.app, source.options), /orphan.*no object row/i);
  } finally { await rm(orphan); }

  const binary = files[1];
  const filePath = join(source.storageRoot, binary.bucket, binary.name);
  try {
    await rm(filePath);
    await assert.rejects(storage.inspectStorage(source.app, source.options), /missing|no source file|ENOENT|not found/i);
  } finally { await writeFile(filePath, binary.bytes); }
  try {
    await writeFile(filePath, Buffer.concat([binary.bytes, Buffer.from([42])]));
    await assert.rejects(storage.inspectStorage(source.app, source.options), /size|length|mismatch/i);
  } finally { await writeFile(filePath, binary.bytes); }

  const snapshot = await storage.inspectStorage(source.app, source.options);
  try {
    await writeFile(filePath, Buffer.from([9, 9, 9, 9, 9, 9, 9]));
    await assert.rejects(storage.assertStorageUnchanged(source.app, snapshot), /chang|checksum|hash/i);
  } finally { await writeFile(filePath, binary.bytes); }
  const fresh = await storage.inspectStorage(source.app, source.options);
  const objects = sourceTable(source.app, "objects");
  const id = source.objects[0].id;
  try {
    await source.connection.exec(`UPDATE ${objects} SET user_metadata = '{"changed":true}' WHERE id = ${quote(id)}`);
    await assert.rejects(storage.assertStorageUnchanged(source.app, fresh), /chang|snapshot|metadata/i);
  } finally {
    const original = source.objects.find(row => row.id === id).user_metadata;
    await source.connection.exec(`UPDATE ${objects} SET user_metadata = ${original === null ? "NULL" : quote(JSON.stringify(parseJson(original)))} WHERE id = ${quote(id)}`);
  }
  assert.deepEqual(await sourceState(source), before);
});
test("preflight preserves empty/custom JSON and rejects unsupported null/path values explicitly", { concurrency: false }, async t => {
  const source = await fixture(t);
  const objects = sourceTable(source.app, "objects");
  const row = source.objects[0];
  const original = parseJson(row.metadata);
  const metadata = { ...original, custom: { tag: "O'Brien", empty: {}, nullable: null } };
  try {
    await source.connection.exec(`UPDATE ${objects} SET metadata = ${quote(JSON.stringify(metadata))} WHERE id = ${quote(row.id)}`);
    const snapshot = await storage.inspectStorage(source.app, source.options);
    assert.deepEqual(snapshot.objects.find(object => object.row.id === row.id).row.metadata, metadata);
    assert.equal(storage.storageInserts(snapshot).some(sql => /path_tokens/.test(sql)), false);
    for (const value of ["NULL", "'null'", "'[]'"]) {
      await source.connection.exec(`UPDATE ${objects} SET user_metadata = ${value} WHERE id = ${quote(row.id)}`);
      await assert.rejects(storage.inspectStorage(source.app, source.options), /user_metadata.*(?:NULL|null|object|unsupported)/i);
    }
    for (const value of ['{"x":9007199254740991.1}', '{"x":0.123456789123456789}']) {
      await source.connection.exec(`UPDATE ${objects} SET user_metadata=${quote(value)} WHERE id=${quote(row.id)}`);
      await assert.rejects(storage.inspectStorage(source.app,source.options), /cannot be preserved exactly/);
    }
    await source.connection.exec(`UPDATE ${objects} SET user_metadata='{"x":1.0,"y":1e3,"text":"0.123456789123456789"}' WHERE id=${quote(row.id)}`);
    await storage.inspectStorage(source.app,source.options);
    for (const size of [6000,6001]) {
      const value = JSON.stringify({x:"a".repeat(size-8)});
      assert.equal(Buffer.byteLength(value),size);
      await source.connection.exec(`UPDATE ${objects} SET user_metadata=${quote(value)} WHERE id=${quote(row.id)}`);
      if (size === 6000) await storage.inspectStorage(source.app,source.options);
      else await assert.rejects(storage.inspectStorage(source.app,source.options), /6000-byte/);
    }
  } finally {
    await source.connection.exec(`UPDATE ${objects} SET metadata = ${quote(JSON.stringify(original))}, user_metadata = ${quote(JSON.stringify(parseJson(row.user_metadata)))} WHERE id = ${quote(row.id)}`);
  }
  for (const name of ["nested/雪.bin", "percent%.bin"]) {
    const upload = await source.client.storage.from("private-files").upload(name, Buffer.from("unsupported target name"), {
      contentType: "application/octet-stream", metadata: {},
    });
    assert.equal(upload.error, null, JSON.stringify(upload.error));
    try {
      await assert.rejects(storage.inspectStorage(source.app, source.options), /path|name|character|key/i);
    } finally {
      const removed = await source.client.storage.from("private-files").remove([name]);
      assert.equal(removed.error, null, JSON.stringify(removed.error));
    }
  }
});

for (const [firstName, keepInitialVersion] of [[files[0].name,false],[files[1].name,false],[files[0].name,true]])
test(keepInitialVersion ? "upload must replace its temporary version" : `previous-version cleanup preserves ${firstName} and app references (mock HTTP)`, { concurrency: false }, async t => {
  const source = await fixture(t);
  await source.connection.exec('UPDATE "storage.objects" SET version = NULL WHERE name = ?',files[0].name);
  await source.connection.exec('UPDATE "storage.objects" SET version = ? WHERE name = ?',"source-only/arbitrary",files[1].name);
  const before = await sourceState(source);
  const snapshot = await storage.inspectStorage(source.app, source.options);
  snapshot.objects.sort((a,b) => Number(b.row.name === firstName)-Number(a.row.name === firstName));
  const { getStorageSchemaSql } = await import("../upstream/lite-0.11.0/dist/index.js");
  let target = new PGlite();
  t.after(async () => { try { await target.close(); } finally { target = null; } });
  await target.exec("CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role; CREATE ROLE supabase_auth_admin;");
  for (const sql of cli.authSetupSql()) await target.exec(sql);
  await target.exec(getStorageSchemaSql());
  const query = sql => target.query(sql);
  const shape = await storage.storageShape(query);
  await storage.assertStorageEmpty(query);
  for (const sql of ddl) await target.exec(sql);
  assert.equal(await storage.storageShape(query), shape, "incoming app FKs and policies do not alter managed Storage shape");
  // Exercise the production happy path against real SQL plus a tiny HTTP double.
  // This proves orchestration, not storage-api's upsert semantics or live parity.
  const key = `e30.${Buffer.from('{"role":"service_role"}').toString("base64url")}.fixture`;
  const uploads = new Map(), previousVersions = [];
  const backend = await mkdtemp(join(tmpdir(),"storage-versioned-target-"));
  t.after(()=>rm(backend,{recursive:true,force:true}));
  let downloads = 0;
  const mocked = t.mock.method(globalThis,"fetch",async (url,options) => {
    const path = new URL(url).pathname.replace(/^\/storage\/v1\/object\/(?:authenticated\/)?/,"").split("/").map(decodeURIComponent);
    const bucket = path.shift(), name = path.join("/");
    const directory = join(backend,bucket,name);
    if (options.method === "POST") {
      const previousVersion = (await target.query("SELECT version FROM storage.objects WHERE bucket_id=$1 AND name=$2",[bucket,name])).rows[0].version;
      const version = crypto.randomUUID();
      previousVersions.push({previousVersion,version,bucket,name});
      const bytes = Buffer.from(await new Response(options.body).arrayBuffer());
      await mkdir(directory,{recursive:true});
      await writeFile(join(directory,version),bytes);
      const metadata = {size:bytes.length,contentLength:bytes.length,mimetype:options.headers["content-type"],cacheControl:options.headers["cache-control"],eTag:hash(bytes),lastModified:new Date().toISOString()};
      const userMetadata = JSON.parse(Buffer.from(options.headers["x-metadata"],"base64"));
      uploads.set(`${bucket}/${name}`,{metadata});
      await target.query("UPDATE storage.objects SET metadata=$1::jsonb,user_metadata=$2::jsonb,version=$3 WHERE bucket_id=$4 AND name=$5",[JSON.stringify(metadata),JSON.stringify(userMetadata),keepInitialVersion ? previousVersion : version,bucket,name]);
      // Storage 1.54.1 ObjectAdminDelete -> FileBackend.deleteObjects recursively
      // removes the old version path. NULL targets the new file's parent directory.
      if (previousVersion !== version) await rm(previousVersion ? join(directory,previousVersion) : directory,{recursive:true,force:true});
      return new Response("{}",{status:200});
    }
    downloads++;
    const object = uploads.get(`${bucket}/${name}`);
    const version = (await target.query("SELECT version FROM storage.objects WHERE bucket_id=$1 AND name=$2",[bucket,name])).rows[0].version;
    try {
      const bytes = await readFile(join(directory,version));
      return new Response(bytes,{headers:{"content-type":object.metadata.mimetype,"cache-control":object.metadata.cacheControl}});
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
      return new Response("missing versioned file",{status:500});
    }
  });
  try {
    const transfer = storage.transferStorage(source.app,snapshot,{status:{apiUrl:"http://127.0.0.1:54321",serviceRoleKey:key},runSql:query});
    if (keepInitialVersion) {
      await assert.rejects(transfer,/target operational metadata verification failed/);
      assert.equal(downloads,0,"an unchanged placeholder is rejected before download");
      assert.deepEqual(await sourceState(source),before);
      return;
    }
    const result = await transfer;
    assert.deepEqual(result,{buckets:3,objects:files.length,bytes:files.reduce((sum,file)=>sum+file.bytes.length,0)});
    for (const {previousVersion,version,bucket,name} of previousVersions) {
      assert.match(previousVersion,/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
      assert.notEqual(previousVersion,version);
      assert.notEqual(previousVersion,snapshot.objects.find(object=>object.row.bucket_id===bucket && object.row.name===name).row.version);
    }
  } finally { mocked.mock.restore(); }
  await assert.rejects(storage.assertStorageEmpty(query), /fresh|existing|seed|merg/i);
  for (const table of await cli.exportUserData(source.app, source.migrations)) {
    for (const sql of table.inserts) await target.exec(sql);
  }
  const restored = (await target.query("SELECT l.id, l.object_id, l.bucket_id, o.name, o.owner, o.owner_id, o.user_metadata, o.path_tokens FROM public.storage_links l JOIN storage.objects o ON o.id = l.object_id ORDER BY l.id")).rows;
  assert.equal(restored.length, files.length);
  for (const row of restored) {
    const original = source.objects.find(object => object.id === row.object_id);
    assert.equal(row.bucket_id, original.bucket_id);
    assert.equal(row.name, original.name);
    assert.equal(row.owner, source.userId);
    assert.equal(row.owner_id, source.userId);
    assert.deepEqual(row.path_tokens, original.name.split("/"));
    assert.deepEqual(row.user_metadata, parseJson(original.user_metadata));
  }
  await assert.rejects(target.query("INSERT INTO public.storage_links VALUES (99, '00000000-0000-4000-8000-000000000099', 'private-files')"), /foreign key/i);
  assert.deepEqual(await sourceState(source), before);
});

test("upload and verification failures report partial target and leave source unchanged (mock HTTP)", { concurrency: false }, async t => {
  const source = await fixture(t);
  const before = await sourceState(source);
  const snapshot = await storage.inspectStorage(source.app, source.options);
  const jwt = claims => `${Buffer.from('{"alg":"HS256"}').toString("base64url")}.${Buffer.from(JSON.stringify(claims)).toString("base64url")}.fixture-signature`;
  const targetStatus = { apiUrl: "http://127.0.0.1:54321", serviceRoleKey: jwt({ role: "service_role" }) };
  for (const [status, expected] of [
    [{ ...targetStatus, apiUrl: "https://hosted.example.test" }, /loopback|local/i],
    [{ ...targetStatus, serviceRoleKey: jwt({ role: "service_role", sub: source.userId }) }, /sub claim/i],
    [{ ...targetStatus, serviceRoleKey: "malformed" }, /malformed/i],
  ]) {
    await assert.rejects(storage.transferStorage(source.app, snapshot, { status, runSql: () => assert.fail("target validation must precede SQL") }), expected);
  }
  for (const [httpStatus, expected, corrupt] of [[503, /upload failed.*503/i], [200, /owner.*verification failed/i], [200, /downloaded bytes.*verification failed/i, true]]) {
    const statements = [];
    const target = {
      status: targetStatus,
      runSql: async sql => {
        statements.push(sql);
        return { rows: sql.startsWith("SELECT *,") ? [{ ...snapshot.objects[0].row, created_matches: true, version: "new-target-version", ...(corrupt ? {} : {owner:"changed-owner"}) }] : [] };
      },
    };
    let calls = 0;
    const mocked = t.mock.method(globalThis, "fetch", async (url, options) => {
      calls++;
      if (corrupt && options.method !== "POST") {
        const object = snapshot.objects[0];
        return new Response("corrupt download",{headers:{"content-type":object.contentType,"cache-control":object.cacheControl}});
      }
      assert.equal(options.method, "POST");
      assert.equal(options.headers["x-upsert"], "true");
      assert.equal(options.duplex, "half");
      assert.equal(options.redirect, "error");
      assert.ok(options.body instanceof ReadableStream);
      const bytes = Buffer.from(await new Response(options.body).arrayBuffer());
      assert.equal(String(bytes.length), options.headers["content-length"]);
      return new Response("fixture upload response", { status: httpStatus });
    });
    try {
      await assert.rejects(storage.transferStorage(source.app, snapshot, target), error => {
        assert.match(error.message, expected);
        assert.match(error.message, /partial.*retry/i);
        return true;
      });
    } finally { mocked.mock.restore(); }
    assert.equal(calls, corrupt ? 2 : 1, "stop at the first failed upload or verification");
    assert.equal(statements.some(sql => /^INSERT INTO storage\.objects/.test(sql)), true);
    assert.equal(statements.some(sql => /INSERT INTO .*storage_links/.test(sql)), false);
    assert.deepEqual(await sourceState(source), before);
  }
});

test("empty defaults and paginated buckets are not silently omitted", { concurrency: false }, async t => {
  const { App, factories } = modules();
  const connection = await factories.node({ url: ":memory:", ddlDialect: "postgres" });
  t.after(() => connection.close());
  const app = new App({ connection, auth: { enabled: false } });
  const root = await mkdtemp(join(tmpdir(), "lite-storage-empty-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  assert.equal(app.config.storage.enabled, true, "the stock default must not newly block non-Storage upgrades");
  assert.equal(await storage.inspectStorage(app, { sourceRoot: root }), null);

  const source = await fixture(t);
  const buckets = sourceTable(source.app, "buckets");
  for (let index = 0; index < 251; index++) {
    const id = `page-${String(index).padStart(3, "0")}`;
    await source.connection.exec(`INSERT INTO ${buckets} (id, name) VALUES (${quote(id)}, ${quote(id)})`);
  }
  const before = await sourceState(source);
  const snapshot = await storage.inspectStorage(source.app, source.options);
  assert.equal(snapshot.buckets.length, 254);
  assert.equal(new Set(snapshot.buckets.map(bucket => bucket.id)).size, 254);
  assert.equal(snapshot.buckets.some(bucket => bucket.id === "page-250"), true);
  assert.equal(snapshot.objects.length, files.length);
  assert.deepEqual(await sourceState(source), before);
});

test("stock filesystem source closes consumed and cancelled read streams", { concurrency: false }, async t => {
  const root = await mkdtemp(join(tmpdir(), "lite-storage-streams-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, "bucket"));
  const path = join(root, "bucket", "bytes.bin"), bytes = Buffer.alloc(2 * 1024 * 1024, 123);
  await writeFile(path, bytes);
  const adapter = new cli.FileSystemStorageAdapter({ basePath: root });
  const supportsFd = await readdir("/proc/self/fd").then(() => true, () => false);
  const openFixtureHandles = async () => (await Promise.all((await readdir("/proc/self/fd")).map(fd => readlink(`/proc/self/fd/${fd}`).catch(() => "")))).filter(target => target === path).length;
  for (const mode of ["consumed", "cancelled"]) await t.test(mode, { skip: !supportsFd }, async () => {
    for (let index = 0; index < 12; index++) {
      const { body } = await adapter.getObject("bucket", "bytes.bin");
      if (mode === "consumed") assert.equal(hash(Buffer.from(await new Response(body).arrayBuffer())), hash(bytes));
      else {
        const reader = body.getReader();
        assert.equal((await reader.read()).done, false);
        await reader.cancel();
        reader.releaseLock();
      }
    }
    // Node stream close events may run one tick after consumption/cancellation.
    for (let attempt = 0; attempt < 20 && await openFixtureHandles(); attempt++) await new Promise(resolve => setTimeout(resolve, 5));
    assert.equal(await openFixtureHandles(), 0, `${mode} source descriptors must close without GC`);
  });
  await assert.rejects(adapter.getObject("bucket","missing.bin"), {code:"ENOENT"});
  if (process.platform !== "win32" && process.getuid?.() !== 0) {
    await chmod(path,0);
    try { await assert.rejects(adapter.getObject("bucket","bytes.bin"), {code:"EACCES"}); }
    finally { await chmod(path,0o600); }
  }
});

test("preflight rejects unrepresentable headers and source-overlapping targets", { concurrency: false }, async t => {
  const source = await fixture(t), before = await sourceState(source);
  const row = source.objects[0], table = sourceTable(source.app, "objects");
  const metadata = parseJson(row.metadata);
  try {
    for (const [field, value] of [
      ["mimetype", "text/plain; name=雪"], ["mimetype", "text/plain\r\n; charset=utf-8"],
      ["mimetype", "text/plain "], ["cacheControl", "max-age=42 雪"], ["cacheControl", " max-age=42"],
    ]) {
      await source.connection.exec(`UPDATE ${table} SET metadata=${quote(JSON.stringify({...metadata,[field]:value}))} WHERE id=${quote(row.id)}`);
      await assert.rejects(storage.inspectStorage(source.app,source.options), /HTTP headers|MIME|cache-control/);
    }
  } finally { await source.connection.exec(`UPDATE ${table} SET metadata=${quote(JSON.stringify(metadata))} WHERE id=${quote(row.id)}`); }
  try {
    for (const name of ["雪.bin", "%.bin", "#.bin", "[name].bin", "a\\b.bin"]) {
      await source.connection.exec(`UPDATE ${table} SET name=${quote(name)},path_tokens=${quote(JSON.stringify(name.split("/")))} WHERE id=${quote(row.id)}`);
      await assert.rejects(storage.inspectStorage(source.app,source.options), /unsupported path|Storage 1.54.1 rejects/);
    }
  } finally { await source.connection.exec(`UPDATE ${table} SET name=${quote(row.name)},path_tokens=${quote(JSON.stringify(row.name.split("/")))} WHERE id=${quote(row.id)}`); }
  const nested = join(source.storageRoot,"fresh-target");
  await assert.rejects(storage.requireFreshStorageDirectory(nested,source.storageRoot), /outside the source/);
  const alias = join(source.root,"storage-alias");
  await symlink(source.storageRoot,alias);
  await assert.rejects(storage.requireFreshStorageDirectory(join(alias,"fresh-target"),source.storageRoot), /outside the source/);
  await assert.rejects(storage.requireFreshStorageDirectory(source.root,source.storageRoot), /new or empty/);
  await storage.requireFreshStorageDirectory(join(source.root,"separate-target"),source.storageRoot);
  assert.deepEqual(await sourceState(source),before);
});

test("caller cancellation stops Storage requests, SQL and verified-success callbacks", { concurrency: false, timeout: 30000 }, async t => {
  const source = await fixture(t), before = await sourceState(source);
  const snapshot = await storage.inspectStorage(source.app,source.options);
  // Put a nonempty object first so cancellation can interrupt an upload read.
  snapshot.objects.sort((a,b) => b.size-a.size);
  const key = `e30.${Buffer.from('{"role":"service_role"}').toString("base64url")}.fixture`;
  const status = {apiUrl:"http://127.0.0.1:54321",serviceRoleKey:key};
  const reason = new Error("fixture Storage cancellation");
  const preAborted = new AbortController(); preAborted.abort(reason);
  const forbidden = {status,runSql:()=>assert.fail("pre-aborted Storage must not query the target")};
  let mocked = t.mock.method(globalThis,"fetch",()=>assert.fail("pre-aborted Storage must not contact the target"));
  try {
    await assert.rejects(storage.waitForStorage(forbidden,60000,preAborted.signal),error=>error===reason);
    await assert.rejects(storage.transferStorage(source.app,snapshot,forbidden,preAborted.signal),error=>error===reason);
    await assert.rejects(cli.runUpgrade(source.app,forbidden,source.migrations,{storage:snapshot,signal:preAborted.signal}),error=>error===reason);
  } finally { mocked.mock.restore(); }

  const readinessAbort = new AbortController();
  let readinessCalls = 0;
  mocked = t.mock.method(globalThis,"fetch",(_,options)=>new Promise((resolve,reject)=>{
    readinessCalls++;
    options.signal.addEventListener("abort",()=>reject(options.signal.reason),{once:true});
    readinessAbort.abort(reason);
  }));
  try {
    await assert.rejects(storage.waitForStorage(forbidden,60000,readinessAbort.signal),error=>error===reason);
    assert.equal(readinessCalls,1,"cancelled readiness must not retry");
  } finally { mocked.mock.restore(); }

  const {getStorageSchemaSql} = await import("../upstream/lite-0.11.0/dist/index.js");
  for (const mode of ["accepted", "uploading", "downloading"]) {
    let database = new PGlite();
    const abort = new AbortController(), events = [], completed = [];
    let responseCancelled = 0, downloadCancelled = 0;
    try {
      await database.exec("CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role; CREATE ROLE supabase_auth_admin;");
      for (const sql of cli.authSetupSql()) await database.exec(sql);
      await database.exec(getStorageSchemaSql());
      const target = {status,runSql:async sql=>{
        if (abort.signal.aborted) events.push("SQL after cancellation");
        return (await database.exec(sql))[0] ?? {rows:[]};
      }};
      mocked = t.mock.method(globalThis,"fetch",async (url,options)=>{
        if (new URL(url).pathname === "/storage/v1/bucket") return new Response("[]");
        assert.equal(abort.signal.aborted,false,"no later request may begin after cancellation");
        events.push(options.method ?? "GET");
        if (options.method === "POST") {
          if (mode === "uploading") {
            const reader = options.body.getReader();
            try {
              assert.equal((await reader.read()).done,false);
              abort.abort(reason);
              assert.equal(options.signal.aborted,true);
              throw options.signal.reason;
            } finally { await reader.cancel(); reader.releaseLock(); }
          }
          const bytes = Buffer.from(await new Response(options.body).arrayBuffer());
          if (mode === "accepted") {
            abort.abort(reason);
            assert.equal(options.signal.aborted,true);
            return new Response(new ReadableStream({cancel(){responseCancelled++;}}));
          }
          const object = snapshot.objects[0];
          const metadata = {size:bytes.length,contentLength:bytes.length,mimetype:object.contentType,cacheControl:object.cacheControl,eTag:hash(bytes),lastModified:new Date().toISOString()};
          await database.query("UPDATE storage.objects SET metadata=$1::jsonb,version=$2 WHERE id=$3",[JSON.stringify(metadata),crypto.randomUUID(),object.row.id]);
          return new Response("{}");
        }
        return new Response(new ReadableStream({
          pull(){setTimeout(()=>abort.abort(reason),5);return new Promise(()=>{});},
          cancel(){downloadCancelled++;},
        }));
      });
      await assert.rejects(cli.runUpgrade(source.app,target,source.migrations,{
        storage:snapshot,signal:abort.signal,migrateSessions:false,authTarget:"local",syncAuthConfig:false,
        onBatchEnd:label=>completed.push(label),
      }),error=>error===reason);
      assert.deepEqual(events,mode === "downloading" ? ["POST","GET"] : ["POST"]);
      assert.equal(completed.includes("Migrated and verified Storage"),false);
      assert.equal((await database.query("SELECT count(*)::int AS n FROM storage_links")).rows[0].n,0);
      if (mode === "accepted") assert.equal(responseCancelled,1);
      if (mode === "downloading") assert.equal(downloadCancelled,1);
    } finally {
      mocked.mock.restore();
      try { await database.close(); } finally { database = null; }
    }
  }
  assert.deepEqual(await sourceState(source),before);
  if (await readdir("/proc/self/fd").then(()=>true,()=>false)) {
    const open = async () => (await Promise.all((await readdir("/proc/self/fd")).map(fd=>readlink(`/proc/self/fd/${fd}`).catch(()=>"")))).filter(path=>path.startsWith(source.storageRoot)).length;
    for (let attempt=0;attempt<20 && await open();attempt++) await new Promise(resolve=>setTimeout(resolve,5));
    assert.equal(await open(),0,"cancelled Storage must close its source descriptors");
  }
});
