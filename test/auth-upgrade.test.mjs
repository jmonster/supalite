import test from "node:test";
import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";
import bcrypt from "bcryptjs";
import { createHarness } from "./helpers/lite.mjs";
import { exportAuth } from "../upstream/lite-0.11.0/dist/cli/index.js";
import { SUPABASE_AUTH_EMPTY_STRING_FIELDS, SUPABASE_AUTH_INSTANCE_ID, normalizeSupabaseAuthUser } from "../upstream/lite-0.11.0/dist/cli/upgrade-auth-users.js";

const auth = {
  enabled: true,
  jwt_secret: "fixture-only-c2864fe5b0917280c02c6b38ad786d63",
  publishable_key: "test-only-key",
  email: { enable_confirmations: false },
};
const credentials = { email: "export@example.test", password: "Fixture-only-password-44!" };
const findByEmail = `SELECT * FROM auth.users
  WHERE instance_id = $1 AND LOWER(email) = $2 AND aud = $3 AND is_sso_user = false`;

async function sourceFixture(t) {
  const harness = await createHarness({ auth });
  t.after(harness.close);
  const signup = await harness.client.auth.signUp(credentials);
  assert.equal(signup.error, null);
  const row = (await harness.connection.exec('SELECT * FROM "auth.users"')).rows[0];
  assert.equal(row.email_confirmed_at !== null, true);
  assert.match(row.encrypted_password, /^\$2b\$10\$/);
  assert.equal(row.encrypted_password.length, 60);
  assert.equal(await bcrypt.compare(credentials.password, row.encrypted_password), true);
  return { ...harness, row };
}
async function targetFixture(t) {
  const { getAuthSchemaSql } = await import("../upstream/lite-0.11.0/dist/index.js");
  let target = new PGlite();
  t.after(async () => { try { await target.close(); } finally { target = null; } });
  await target.exec("CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role; CREATE ROLE supabase_auth_admin;");
  await target.exec(getAuthSchemaSql());
  // Target-specific column from GoTrue v2.188.1's 00_init_auth_schema migration.
  // It is nullable and has no default; Lite's packaged auth schema omits it.
  await target.exec("ALTER TABLE auth.users ADD COLUMN instance_id uuid NULL;");
  return target;
}
async function applyAuth(target, statements) {
  for (const table of ["users", "identities", "sessions", "refresh_tokens"]) {
    for (const statement of statements[table]) await target.exec(statement);
  }
}

test("local rehearsal export keeps nullable instance IDs and does not apply Supabase normalization", async (t) => {
  const source = await sourceFixture(t);
  const statements = await exportAuth(source.app, { target: "local" });
  assert.equal(statements.users.length, 1);
  assert.equal(statements.users[0].includes('"instance_id"'), false);
  const target = await targetFixture(t);
  // Sessions are intentionally excluded, as in local --no-migrate-sessions.
  await applyAuth(target, { ...statements, sessions: [], refresh_tokens: [] });
  const stored = (await target.query("SELECT instance_id, encrypted_password FROM auth.users")).rows[0];
  assert.equal(stored.instance_id, null);
  assert.equal(stored.encrypted_password, source.row.encrypted_password);
  const login = await target.query(findByEmail, [SUPABASE_AUTH_INSTANCE_ID, credentials.email, "authenticated"]);
  assert.equal(login.rows.length, 0);
});

test("candidate bundled export produces a discoverable, correctly hashed, confirmed user", async (t) => {
  const source = await sourceFixture(t);
  const before = JSON.stringify((await source.connection.exec('SELECT * FROM "auth.users"')).rows);
  const statements = await exportAuth(source.app, { target: "supabase" });
  const target = await targetFixture(t);
  await applyAuth(target, { ...statements, sessions: [], refresh_tokens: [] });
  const { rows } = await target.query(findByEmail, [SUPABASE_AUTH_INSTANCE_ID, credentials.email, "authenticated"]);
  assert.equal(rows.length, 1);
  const user = rows[0];
  assert.equal(user.id, source.row.id);
  assert.equal(user.instance_id, SUPABASE_AUTH_INSTANCE_ID);
  assert.equal(user.encrypted_password, source.row.encrypted_password);
  assert.equal(await bcrypt.compare(credentials.password, user.encrypted_password), true);
  assert.equal(await bcrypt.compare("incorrect password", user.encrypted_password), false);
  assert.equal(new Date(user.email_confirmed_at).toISOString(), source.row.email_confirmed_at);
  assert.equal(new Date(user.confirmed_at).toISOString(), source.row.confirmed_at);
  assert.equal(user.is_sso_user, false);
  assert.deepEqual(user.raw_app_meta_data, JSON.parse(source.row.raw_app_meta_data));
  assert.deepEqual(user.raw_user_meta_data, JSON.parse(source.row.raw_user_meta_data));
  for (const field of SUPABASE_AUTH_EMPTY_STRING_FIELDS) assert.equal(user[field], "");
  const identities = (await target.query("SELECT id, user_id, provider FROM auth.identities")).rows;
  const originalIdentity = (await source.connection.exec('SELECT * FROM "auth.identities"')).rows[0];
  assert.deepEqual(identities, [{ id: originalIdentity.id, user_id: source.row.id, provider: "email" }]);
  assert.equal(JSON.stringify((await source.connection.exec('SELECT * FROM "auth.users"')).rows), before);
});

test("Supabase normalization is limited to users and leaves local rehearsal values alone", async (t) => {
  const source = await sourceFixture(t);
  const local = await exportAuth(source.app, { target: "local" });
  const supabase = await exportAuth(source.app, { target: "supabase" });
  assert.equal(local.users[0].includes('"instance_id"'), false);
  assert.equal(supabase.users[0].includes('"instance_id"'), true);
  for (const table of ["identities", "sessions"]) assert.deepEqual(supabase[table], local[table]);
  assert.equal(supabase.refresh_tokens.length, local.refresh_tokens.length);
  assert.equal((await source.connection.exec('SELECT * FROM "auth.users"')).rows[0].instance_id, undefined);
});

test("normalization preserves values, nullable credentials/contacts/timestamps and caller input", () => {
  const source = Object.freeze({
    id: "00000000-0000-4000-8000-000000000001",
    instance_id: "00000000-0000-4000-8000-000000000002",
    encrypted_password: null, email: null, phone: null, email_confirmed_at: null,
    confirmation_token: "pending'confirmation", recovery_token: "pending-recovery",
    email_change: "new@example.test", email_change_token_new: "next", email_change_token_current: "current",
    phone_change: "+15555550123", phone_change_token: "phone", reauthentication_token: "reauth",
  });
  assert.deepEqual(normalizeSupabaseAuthUser(source), source);
  const absent = normalizeSupabaseAuthUser({});
  assert.equal(absent.instance_id, SUPABASE_AUTH_INSTANCE_ID);
  for (const field of SUPABASE_AUTH_EMPTY_STRING_FIELDS) assert.equal(absent[field], "");
  const nulls = normalizeSupabaseAuthUser({ instance_id: null, ...Object.fromEntries(SUPABASE_AUTH_EMPTY_STRING_FIELDS.map((field) => [field, null])) });
  assert.deepEqual(nulls, absent);
});

test("multiple users retain nullable contacts and nonempty pending-token values", async (t) => {
  const source = await sourceFixture(t);
  const signup = await source.client.auth.signUp({ email: "second@example.test", password: "Fixture-only-password-55!" });
  assert.equal(signup.error, null);
  for (const field of SUPABASE_AUTH_EMPTY_STRING_FIELDS) {
    const value = field === "email_change" ? "next@example.test" : field === "phone_change" ? "+15555550123" : `pending '${field}`;
    await source.connection.exec(`UPDATE "auth.users" SET "${field}" = ? WHERE id = ?`, value, source.row.id);
  }
  const target = await targetFixture(t);
  const exported = await exportAuth(source.app, { target: "supabase" });
  await applyAuth(target, { ...exported, sessions: [], refresh_tokens: [] });
  const { rows } = await target.query("SELECT * FROM auth.users ORDER BY email");
  assert.equal(rows.length, 2);
  assert.equal(new Set(rows.map((row) => row.id)).size, 2);
  for (const user of rows) {
    assert.equal(user.phone, null, "do not turn nullable unique contacts into shared empty strings");
    assert.equal(user.instance_id, SUPABASE_AUTH_INSTANCE_ID);
    for (const field of SUPABASE_AUTH_EMPTY_STRING_FIELDS) {
      const expected = user.id !== source.row.id ? "" : field === "email_change" ? "next@example.test" : field === "phone_change" ? "+15555550123" : `pending '${field}`;
      assert.equal(user[field], expected);
    }
  }
});

test("normalization never manufactures confirmation, credentials or session data", () => {
  const unconfirmed = { email_confirmed_at: null, phone_confirmed_at: null, confirmed_at: null, encrypted_password: null, phone: null, email: null };
  const user = normalizeSupabaseAuthUser(unconfirmed);
  for (const [field, value] of Object.entries(unconfirmed)) assert.equal(user[field], value);
  for (const field of ["password", "access_token", "refresh_token", "session_id"]) assert.equal(field in user, false);
});
