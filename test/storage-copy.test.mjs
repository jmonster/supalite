import test from "node:test";
import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";
import { modules } from "./helpers/lite.mjs";
import { isExperimentalEnabled, setExperimental } from "../upstream/lite-0.11.0/dist/index.js";

test("Storage SDK copy returns the destination bucket/path and retains source bytes", async (t) => {
  const enabled = isExperimentalEnabled("storage");
  setExperimental("storage", true);
  t.after(() => setExperimental("storage", enabled));
  const { App, factories } = modules();
  const connection = await factories.node({ url: ":memory:" });
  t.after(() => connection.close());
  const key = "sb_secret_storage_copy_fixture";
  const app = new App({
    connection,
    auth: { enabled: false, secret_key: key },
    storage: { enabled: true },
    options: { server: { admin: false, disableStudio: true } },
  });
  // Exercise the real handler and SDK without depending on a CLI-only adapter.
  const objects = new Map();
  app._storageAdapter = {
    async uploadObject(bucket, path, _version, body, mimetype, cacheControl) {
      const bytes = new Uint8Array(await new Response(body).arrayBuffer());
      const metadata = { mimetype, cacheControl, size: bytes.length, contentLength: bytes.length };
      objects.set(`${bucket}/${path}`, { bytes, metadata });
      return metadata;
    },
    async copyObject(bucket, path, _version, destinationBucket, destinationPath) {
      objects.set(`${destinationBucket}/${destinationPath}`, structuredClone(objects.get(`${bucket}/${path}`)));
      return {};
    },
    async getObject(bucket, path) {
      const { bytes, metadata } = objects.get(`${bucket}/${path}`);
      return { body: bytes, metadata };
    },
  };
  await app.ensureSystemSchema();
  const client = createClient("http://localhost", key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (url, options) => app.fetch(new Request(url, options)) },
  });
  for (const bucket of ["source", "destination"]) {
    const created = await client.storage.createBucket(bucket);
    assert.equal(created.error, null, JSON.stringify(created.error));
  }
  const bytes = Uint8Array.of(0, 127, 255);
  const uploaded = await client.storage.from("source").upload("nested/original.bin", bytes);
  assert.equal(uploaded.error, null, JSON.stringify(uploaded.error));

  for (const destinationBucket of [undefined, "destination"]) {
    const bucket = destinationBucket ?? "source";
    const copied = await client.storage.from("source").copy("nested/original.bin", "nested/copied.bin", { destinationBucket });
    // The pinned SDK's complete success shape contains path only, not an ID.
    assert.deepEqual(copied, { data: { path: `${bucket}/nested/copied.bin` }, error: null });
    for (const [readBucket, path] of [["source", "nested/original.bin"], [bucket, "nested/copied.bin"]]) {
      const downloaded = await client.storage.from(readBucket).download(path);
      assert.equal(downloaded.error, null, JSON.stringify(downloaded.error));
      assert.deepEqual(new Uint8Array(await downloaded.data.arrayBuffer()), bytes);
    }
  }
});
