import test from "node:test";
import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";
import { SignJWT } from "jose";
import { sql } from "kysely";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createHarness, modules } from "./helpers/lite.mjs";
import { SqliteConnection } from "../upstream/lite-0.11.0/dist/index.js";

const auth = {
  enabled: true,
  jwt_secret: "fixture-only-auth-uid-defaults-2026",
  publishable_key: "test-only-key",
  email: { enable_confirmations: false },
};
const ddl = `
CREATE TABLE owned (id integer PRIMARY KEY, owner_id uuid NOT NULL REFERENCES auth.users(id) DEFAULT auth.uid(), note text);
ALTER TABLE owned ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_insert ON owned FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = owner_id);
CREATE POLICY own_select ON owned FOR SELECT TO authenticated USING ((select auth.uid()) = owner_id);
CREATE TABLE optional_owner (id integer PRIMARY KEY, owner_id uuid DEFAULT auth.uid(), note text);
CREATE TABLE default_only (owner_id uuid DEFAULT auth.uid());
`;

function clientFor(app, token) {
  return createClient("http://localhost", "test-only-key", {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
      fetch: (url, options) => app.fetch(new Request(url, options)),
    },
  });
}
function ok(result) {
  assert.equal(result.error, null, JSON.stringify(result.error));
  return result.data;
}

for (const backend of ["node", "libsql"]) {
  test(`${backend}: request-scoped auth.uid defaults, nulls, bulk writes and ownership`, async (t) => {
    const h = await createHarness({ backend, auth, ddl });
    t.after(h.close);
    const alice = h.client;
    const bob = clientFor(h.app);
    const aliceAuth = ok(await alice.auth.signUp({ email: "alice@example.test", password: "Fixture-only-password-44!" }));
    const bobAuth = ok(await bob.auth.signUp({ email: "bob@example.test", password: "Fixture-only-password-44!" }));
    const aliceId = aliceAuth.user.id;
    const bobId = bobAuth.user.id;

    assert.equal(ok(await alice.from("owned").insert({ id: 1 }).select().single()).owner_id, aliceId);
    assert.equal(ok(await bob.from("owned").insert({ id: 2 }).select().single()).owner_id, bobId);
    assert.equal((await alice.from("owned").insert({ id: 3, owner_id: bobId })).error?.code, "42501");
    assert.equal((await alice.from("owned").insert({ id: 3, owner_id: null })).error?.code, "42501");
    assert.deepEqual(ok(await alice.from("owned").select("id")), [{ id: 1 }]);
    assert.deepEqual(ok(await bob.from("owned").select("id")), [{ id: 2 }]);

    const visitor = clientFor(h.app);
    assert.equal(ok(await visitor.from("optional_owner").insert({ id: 1 }).select().single()).owner_id, null);
    assert.equal((await visitor.from("owned").insert({ id: 4 })).error?.code, "42501");
    assert.equal(ok(await alice.from("optional_owner").insert({ id: 2, owner_id: null }).select().single()).owner_id, null);
    assert.equal(ok(await alice.from("optional_owner").insert({ id: 3, owner_id: bobId }).select().single()).owner_id, bobId);
    assert.equal(ok(await alice.from("default_only").insert({}).select().single()).owner_id, aliceId);

    const omitted = ok(await alice.from("owned").insert([{ id: 10 }, { id: 11 }]).select());
    assert.deepEqual(omitted.map((row) => row.owner_id), [aliceId, aliceId]);
    const mixed = ok(await alice.from("optional_owner").insert([
      { id: 10 }, { id: 11, owner_id: bobId }, { id: 12, owner_id: null },
    ], { defaultToNull: false }).select());
    assert.deepEqual(mixed.map((row) => row.owner_id), [aliceId, bobId, null]);
    const missingNull = ok(await alice.from("optional_owner").insert([
      { id: 13 }, { id: 14, owner_id: bobId },
    ]).select());
    assert.deepEqual(missingNull.map((row) => row.owner_id), [null, bobId]);
    const projected = await h.app.fetch(new Request("http://localhost/rest/v1/owned?columns=id&select=*", {
      method: "POST",
      headers: { apikey: "test-only-key", Authorization: `Bearer ${aliceAuth.session.access_token}`, "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify({ id: 15, owner_id: bobId }),
    }));
    assert.equal(projected.status, 201);
    assert.equal((await projected.json())[0].owner_id, aliceId);

    // Omitted columns default on INSERT but are excluded from conflict UPDATE.
    assert.equal(ok(await bob.from("optional_owner").upsert({ id: 20, note: "first" }).select().single()).owner_id, bobId);
    assert.equal(ok(await alice.from("optional_owner").upsert({ id: 20, note: "next" }).select().single()).owner_id, bobId);
    assert.equal(ok(await alice.from("optional_owner").update({ note: "patch" }).eq("id", 20).select().single()).owner_id, bobId);

    // An anonymous signed-in identity is authenticated and has a real subject.
    // This tests JWT semantics, not the separate anonymous-signup endpoint.
    const anonymousToken = await new SignJWT({ role: "authenticated", is_anonymous: true })
      .setProtectedHeader({ alg: "HS256" }).setSubject(aliceId).setExpirationTime("1h")
      .sign(new TextEncoder().encode(auth.jwt_secret));
    assert.equal(ok(await clientFor(h.app, anonymousToken).from("owned").insert({ id: 30 }).select().single()).owner_id, aliceId);
    const emptySubject = await new SignJWT({ role: "authenticated" })
      .setProtectedHeader({ alg: "HS256" }).setSubject("").setExpirationTime("1h")
      .sign(new TextEncoder().encode(auth.jwt_secret));
    assert.equal(ok(await clientFor(h.app, emptySubject).from("optional_owner").insert({ id: 30 }).select().single()).owner_id, null);

    const concurrent = await Promise.all(Array.from({ length: 12 }, async (_, index) => {
      const client = index % 2 ? alice : bob;
      const result = await client.from("owned").insert({ id: 100 + index }).select().single();
      assert.equal(ok(result).owner_id, index % 2 ? aliceId : bobId);
    }));
    assert.equal(concurrent.length, 12);
    assert.equal(ok(await visitor.from("optional_owner").insert({ id: 99 }).select().single()).owner_id, null);

    // Native SQL has no request identity; the physical default is NULL.
    await h.connection.exec("INSERT INTO optional_owner (id) VALUES (1000)");
    assert.equal((await h.connection.exec("SELECT owner_id FROM optional_owner WHERE id=1000")).rows[0].owner_id, null);
    await assert.rejects(h.connection.exec("INSERT INTO owned (id) VALUES (1000)"), /NOT NULL/i);

    // Metadata survives the same JSON round trip used for persisted config.
    const serialized = JSON.parse(JSON.stringify(h.connection.serializeConfig()));
    h.connection.updateDeparseInfo(SqliteConnection.parseDeparseInfo(serialized.translation.deparse, { strict: true }));
    assert.equal(ok(await bob.from("owned").insert({ id: 1001 }).select().single()).owner_id, bobId);
  });
}

test("DDL only accepts exact auth.uid defaults and tracks their lifecycle", async (t) => {
  const connection = await modules().factories.libsql({ url: ":memory:" });
  t.after(() => connection.close());
  const original = await connection.translateDdl('CREATE TABLE items (id integer PRIMARY KEY, owner_id uuid DEFAULT ("auth"."uid"()));');
  assert.match(original.ddl, /owner_id TEXT DEFAULT NULL/);
  assert.equal(original.schema.get("public.items").get("owner_id").context.defaultValue, "auth.uid()");
  for (const expression of ["uid()", '"auth.uid"()', "public.uid()", "auth.uid(1)", '"AUTH".uid()', "auth.role()", "coalesce(auth.uid(), gen_random_uuid())", "auth.uid() WITHIN GROUP (ORDER BY 1)"]) {
    await assert.rejects(connection.translateDdl(`CREATE TABLE rejected (owner_id uuid DEFAULT ${expression})`), /not supported/);
  }
  const lifecycle = await connection.translateDdl(`
    CREATE TABLE items (id integer PRIMARY KEY, owner_id uuid DEFAULT auth.uid());
    ALTER TABLE items RENAME COLUMN owner_id TO user_id;
    ALTER TABLE items RENAME TO things;
    ALTER TABLE things ALTER COLUMN user_id DROP DEFAULT;
  `);
  assert.equal(lifecycle.schema.get("public.things").get("user_id").context.defaultValue, null);
  const added = await connection.translateDdl(`
    CREATE TABLE added (id integer PRIMARY KEY);
    ALTER TABLE added ADD COLUMN owner_id uuid DEFAULT auth.uid();
    ALTER TABLE added ALTER COLUMN owner_id DROP DEFAULT;
    ALTER TABLE added ALTER COLUMN owner_id SET DEFAULT auth.uid();
  `);
  assert.equal(added.schema.get("public.added").get("owner_id").context.defaultValue, "auth.uid()");
});

test("CLI migrations persist defaults and reopen them for request writes", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "supalite-auth-uid-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  await mkdir(join(directory, "supabase/migrations"), { recursive: true });
  const config = join(directory, "supabase/config.toml");
  const database = join(directory, "database.sqlite");
  await writeFile(config, `[db]\ndriver = "sqlite-postgres"\nurl = ${JSON.stringify(database)}\n[auth]\nenabled = false\n`);
  await writeFile(join(directory, "supabase/migrations/20260101000000_owned.sql"),
    "CREATE TABLE owned (id integer PRIMARY KEY, owner_id uuid DEFAULT auth.uid());");
  const migrate = () => spawnSync(process.execPath, [
    fileURLToPath(new URL("../upstream/lite-0.11.0/dist/cli/index.js", import.meta.url)),
    "--no-telemetry", "migration", "up", "--config", config,
  ], { cwd: directory, encoding: "utf8", timeout: 15000,
    env: { ...process.env, HOME: directory, LITE_TELEMETRY: "0", DO_NOT_TRACK: "1" } });
  const run = migrate();
  assert.equal(run.status, 0, run.stderr);
  const cache = JSON.parse(await readFile(join(directory, "supabase/.temp/.runtime-metadata-cache.json"), "utf8"));
  const connection = modules().factories.node({ url: database, translation: { deparse: cache.metadata } });
  t.after(() => connection.close());
  const uid = "11111111-1111-4111-8111-111111111111";
  const ast = await connection.onPostgrestAST({ type: "insert", from: "owned", values: { id: 1 } },
    { auth: { uid, role: "authenticated", jwt: { sub: uid } } });
  assert.equal(ast.values.owner_id, uid);
  assert.match((await connection.exec("SELECT sql FROM sqlite_master WHERE name='owned'")).rows[0].sql, /DEFAULT NULL/);
  await connection.close();
  for (const [version, operation, expected] of [
    ["20260102000000", "DROP DEFAULT", null],
    ["20260103000000", "SET DEFAULT auth.uid()", "auth.uid()"],
  ]) {
    await writeFile(join(directory, `supabase/migrations/${version}_default.sql`),
      `ALTER TABLE owned ALTER COLUMN owner_id ${operation};`);
    const next = migrate();
    assert.equal(next.status, 0, next.stderr);
    const updated = JSON.parse(await readFile(join(directory, "supabase/.temp/.runtime-metadata-cache.json"), "utf8"));
    assert.equal(updated.metadata.schema["public.owned"].find((field) => field.context.column === "owner_id").context.defaultValue, expected);
  }
});

test("native Postgres default semantics agree on omission, explicit NULL and request identity", async (t) => {
  // Native SQL oracle, not a hosted Supabase/PostgREST qualification.
  // https://www.postgresql.org/docs/current/ddl-default.html
  // https://supabase.com/docs/guides/database/postgres/row-level-security
  const h = await createHarness({ backend: "pglite", ddl: "CREATE TABLE owned (id integer PRIMARY KEY, owner_id uuid DEFAULT auth.uid());" });
  t.after(h.close);
  const alice = "11111111-1111-4111-8111-111111111111";
  const bob = "22222222-2222-4222-8222-222222222222";
  async function insert(uid, id, explicitNull = false) {
    return h.connection.kysely.transaction().execute(async (db) => {
      await sql`SELECT set_config('request.jwt.claim.sub', ${uid ?? ""}, true)`.execute(db);
      const query = explicitNull
        ? sql`INSERT INTO owned (id, owner_id) VALUES (${id}, NULL) RETURNING owner_id`
        : sql`INSERT INTO owned (id) VALUES (${id}) RETURNING owner_id`;
      return (await query.execute(db)).rows[0].owner_id;
    });
  }
  assert.equal(await insert(alice, 1), alice);
  assert.equal(await insert(alice, 2, true), null);
  assert.equal(await insert(bob, 3), bob);
  assert.equal(await insert(null, 4), null);
  assert.equal(await insert("", 5), null);
});
