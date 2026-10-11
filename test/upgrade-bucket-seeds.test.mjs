import test from "node:test";
import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";
import {
  assertStorageEmpty,
  clearMigrationBucketSeeds,
} from "../upstream/lite-0.11.0/dist/cli/upgrade-storage.js";
test("fresh migration bucket declarations are matched exactly before replay; objects and configuration conflicts never merge", async (t) => {
  const db = new PGlite();
  t.after(() => db.close());
  const query = (sql) => db.query(sql);
  await db.exec(
    `CREATE SCHEMA storage;CREATE TABLE storage.buckets(id text PRIMARY KEY,name text,owner uuid,owner_id text,public boolean,file_size_limit bigint,allowed_mime_types text[],created_at timestamptz DEFAULT now(),updated_at timestamptz DEFAULT now());CREATE TABLE storage.objects(id uuid PRIMARY KEY,bucket_id text REFERENCES storage.buckets(id));`,
  );
  await assertStorageEmpty(query);
  const source = {
    id: "avatars",
    name: "avatars",
    owner: null,
    owner_id: null,
    public: true,
    file_size_limit: 5242880,
    allowed_mime_types: ["image/png"],
    created_at: "2020-01-01T00:00:00Z",
    updated_at: "2020-01-01T00:00:00Z",
  };
  const snapshot = { buckets: [source], objects: [] };
  const seed = () =>
    db.exec(
      "INSERT INTO storage.buckets(id,name,public,file_size_limit,allowed_mime_types) VALUES('avatars','avatars',true,5242880,ARRAY['image/png'])",
    );
  await seed();
  await assert.rejects(assertStorageEmpty(query), /fresh target/);
  await clearMigrationBucketSeeds(query, snapshot, (id) =>
    query(`DELETE FROM storage.buckets WHERE id='${id}'`),
  );
  await assertStorageEmpty(query);
  await seed();
  await db.exec("UPDATE storage.buckets SET public=false");
  await assert.rejects(
    clearMigrationBucketSeeds(query, snapshot),
    /public conflicts/,
  );
  assert.equal(
    (await query("SELECT count(*)::int AS n FROM storage.buckets")).rows[0].n,
    1,
  );
  await db.exec("UPDATE storage.buckets SET public=true");
  await assert.rejects(
    clearMigrationBucketSeeds(query, { buckets: [], objects: [] }),
    /absent from the source/,
  );
  await db.exec(
    "INSERT INTO storage.objects VALUES('11111111-1111-1111-1111-111111111111','avatars')",
  );
  await assert.rejects(
    clearMigrationBucketSeeds(query, snapshot),
    /objects cannot be merged/,
  );
  assert.equal(
    (await query("SELECT count(*)::int AS n FROM storage.objects")).rows[0].n,
    1,
  );
});
