import test from "node:test";
import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";
import { modules } from "./helpers/lite.mjs";

function success(result) {
  assert.equal(result.error, null, JSON.stringify(result.error));
  return result.data;
}
function code(mail) {
  const token = mail.text.match(/\b\d{6}\b/)?.[0];
  assert.ok(token, "Synthetic email includes an OTP");
  return token;
}

test("existing email signup, recovery, password, metadata and email-change remain functional", async (t) => {
  const { App, factories } = modules();
  const connection = await factories.node({ url: ":memory:" });
  t.after(() => connection.close());
  const mail = [];
  const app = new App({
    connection,
    auth: { enabled: true, jwt_secret: "fixture-only-b75c64994ef44419b9fd07e5",
      email: { enable_confirmations: true, double_confirm_changes: false, max_frequency: "0s" } },
    options: { server: { admin: false, disableStudio: true }, drivers: { email: { async send(message) { mail.push(message); } } } },
  });
  await app.ensureSystemSchema();
  const client = createClient("http://localhost", "fixture-key", {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (url, options) => app.fetch(new Request(url, options)) },
  });
  const email = "ordinary@example.test", password = "Fixture-only-password-11!";
  const signup = success(await client.auth.signUp({ email, password, options: { data: { retain: "yes", remove: "old" } } }));
  assert.equal(signup.session, null);
  assert.equal(signup.user.is_anonymous, false);
  const confirmed = success(await client.auth.verifyOtp({ email, token: code(mail.at(-1)), type: "signup" }));
  assert.equal(confirmed.user.id, signup.user.id);
  assert.equal(confirmed.user.identities.length, 1);
  assert.equal(confirmed.user.user_metadata.email_verified, true);
  success(await client.auth.updateUser({ data: { remove: null, add: "new" } }));
  const user = success(await client.auth.getUser()).user;
  assert.equal(user.user_metadata.remove, undefined);
  assert.equal(user.user_metadata.retain, "yes");
  assert.equal(user.user_metadata.add, "new");
  success(await client.auth.refreshSession());
  success(await client.auth.signOut());
  assert.equal((await client.auth.signInWithPassword({ email, password: "wrong-password" })).error?.code, "invalid_credentials");
  success(await client.auth.signInWithPassword({ email, password }));
  success(await client.auth.resetPasswordForEmail(email));
  success(await client.auth.verifyOtp({ email, token: code(mail.at(-1)), type: "recovery" }));
  const newPassword = "Fixture-only-password-22!";
  success(await client.auth.updateUser({ password: newPassword }));
  assert.equal((await client.auth.updateUser({ password: newPassword })).error?.code, "same_password");
  assert.equal((await client.auth.updateUser({ password: "a" })).error?.code, "weak_password");
  const newEmail = "changed@example.test";
  const pending = success(await client.auth.updateUser({ email: newEmail })).user;
  assert.equal(pending.email, email);
  assert.equal(pending.new_email, newEmail);
  const changed = success(await client.auth.verifyOtp({ email: newEmail, token: code(mail.at(-1)), type: "email_change" })).user;
  assert.equal(changed.id, signup.user.id);
  assert.equal(changed.email, newEmail);
  assert.equal(changed.identities.length, 1);
  assert.equal(changed.is_anonymous, false);
  success(await client.auth.signOut());
  assert.equal(success(await client.auth.signInWithPassword({ email: newEmail, password: newPassword })).user.id, signup.user.id);
});
