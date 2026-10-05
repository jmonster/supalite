import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { modules } from "./helpers/lite.mjs";
import { isExperimentalEnabled, setExperimental } from "../upstream/lite-0.11.0/dist/index.js";
import { FileSystemStorageAdapter } from "../upstream/lite-0.11.0/dist/cli/index.js";

const parseJson = value => typeof value === "string" ? JSON.parse(value) : value;

test("SDK File, Blob update, and signed replacement preserve filesystem bytes and metadata", async t => {
  const originalStorageFlag = isExperimentalEnabled("storage");
  setExperimental("storage", true);
  t.after(() => setExperimental("storage", originalStorageFlag));
  const root = await mkdtemp(join(tmpdir(), "lite-storage-upload-sdk-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const { App, factories } = modules();
  const createConnection = process.versions.bun
    ? (await import("../upstream/lite-0.11.0/dist/db/bun/index.js")).createConnection
    : factories.node;
  const connection = await createConnection({ url: ":memory:", ddlDialect: "postgres" });
  t.after(() => connection.close());
  const auth = {
    enabled: true,
    jwt_secret: "storage-sdk-fixture-0470d2f05ab749769aabbab418ac8098",
    publishable_key: "test-only-key",
    email: { enable_confirmations: false },
  };
  const app = new App({
    connection, auth, storage: { enabled: true, file_size_limit: "1MiB" },
    options: { server: { admin: false, disableStudio: true } },
  });
  app._storageAdapter = new FileSystemStorageAdapter({ basePath: root });
  await app.ensureSystemSchema();
  await connection.createMigrator([
    "CREATE POLICY sdk_buckets ON storage.buckets FOR ALL TO authenticated USING (true) WITH CHECK (true);",
    "CREATE POLICY sdk_objects ON storage.objects FOR ALL TO authenticated USING (true) WITH CHECK (true);",
  ].join("\n")).migrate();
  const multipartRequests = [];
  const client = createClient("http://localhost", auth.publishable_key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: async (url, options) => {
      const request = new Request(url, options);
      const response = await app.fetch(request);
      if (request.headers.get("content-type")?.startsWith("multipart/form-data")) {
        multipartRequests.push({ method: request.method, status: response.status });
      }
      return response;
    } },
  });
  const signup = await client.auth.signUp({ email: "upload@example.test", password: "Fixture-only-password-44!" });
  assert.equal(signup.error, null, JSON.stringify(signup.error));
  const bucket = "sdk-files", path = "nested/fixture.dat";
  const created = await client.storage.createBucket(bucket);
  assert.equal(created.error, null, JSON.stringify(created.error));
  const storage = client.storage.from(bucket);
  const originalBytes = Buffer.from(Array.from({ length: 4096 }, (_, index) => index % 256));
  const replacementBytes = Buffer.from("Blob replacement: café\n");
  const cases = [
    { kind: "upload", bytes: originalBytes, type: "application/octet-stream", cache: "123", metadata: { label: "café", nested: { keep: true } } },
    { kind: "update", bytes: replacementBytes, type: "text/plain", cache: "456", metadata: { replaced: true } },
    { kind: "signed", bytes: Buffer.alloc(0), type: "application/json", cache: "789", metadata: { empty: true } },
  ];
  let objectId, previousVersion;
  for (const item of cases) {
    const body = item.kind === "update"
      ? new Blob([item.bytes], { type: item.type })
      : new File([item.bytes], "fixture.dat", { type: item.type });
    const options = { cacheControl: item.cache, metadata: item.metadata };
    let uploaded;
    if (item.kind === "signed") {
      // Lite's existing {signedUrl, token} differs from the SDK signing helper's
      // expected {url}; obtain the real token over HTTP, then use the SDK upload.
      const response = await app.fetch(new Request(`http://localhost/storage/v1/object/upload/sign/${bucket}/${path}`, {
        method: "POST", body: "{}",
        headers: { "content-type": "application/json", "x-upsert": "true", Authorization: `Bearer ${signup.data.session.access_token}` },
      }));
      assert.equal(response.status, 200);
      const signed = await response.json();
      assert.equal(signed.path, path);
      assert.equal(new URL(signed.signedUrl, "http://localhost").searchParams.get("token"), signed.token);
      uploaded = await storage.uploadToSignedUrl(path, signed.token, body, options);
    } else uploaded = await storage[item.kind](path, body, options);
    assert.equal(uploaded.error, null, `${item.kind}: ${JSON.stringify(uploaded.error)}`);
    // Preserve the existing signed endpoint's object-only Key response.
    if (item.kind === "signed") assert.deepEqual(uploaded.data, { path, fullPath: path });
    else {
      objectId ??= uploaded.data.id;
      assert.match(objectId, /^[0-9a-f-]{36}$/);
      assert.deepEqual(uploaded.data, { path, id: objectId, fullPath: `${bucket}/${path}` });
    }
    const rows = (await connection.exec('SELECT * FROM "storage.objects"')).rows;
    assert.equal(rows.length, 1);
    const row = rows[0], metadata = parseJson(row.metadata);
    assert.equal(row.id, objectId);
    assert.equal(row.owner_id, signup.data.user.id);
    assert.notEqual(row.version, previousVersion);
    previousVersion = row.version;
    assert.equal(metadata.size, item.bytes.length);
    assert.equal(metadata.contentLength, item.bytes.length);
    assert.equal(metadata.eTag, `"${createHash("md5").update(item.bytes).digest("hex")}"`);
    assert.equal(metadata.cacheControl, `max-age=${item.cache}`);
    assert.equal(metadata.mimetype, item.type);
    assert.deepEqual(parseJson(row.user_metadata), item.metadata);
    assert.deepEqual(await readFile(join(root, bucket, path)), item.bytes);
    assert.deepEqual(await readdir(join(root, bucket, "nested")), ["fixture.dat"]);
    const download = await storage.download(path);
    assert.equal(download.error, null, JSON.stringify(download.error));
    assert.deepEqual(Buffer.from(await download.data.arrayBuffer()), item.bytes);
  }
  // File/Blob still use the existing eager multipart parser, not end-to-end streaming.
  assert.deepEqual(multipartRequests, [
    { method: "POST", status: 200 }, { method: "PUT", status: 200 }, { method: "PUT", status: 200 },
  ]);
});
