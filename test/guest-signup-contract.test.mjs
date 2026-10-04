import test from "node:test";
import assert from "node:assert/strict";
import { createHarness } from "./helpers/lite.mjs";

test("signup dispatch never turns unsupported credentials or malformed JSON into a guest", async (t) => {
  const h = await createHarness({ auth: {
    enabled: true, jwt_secret: "fixture-only-345aac097972789d195a49bf421", enable_anonymous_sign_ins: true,
  } });
  t.after(h.close);
  const cases = [
    [[], "bad_json"], [false, "bad_json"], [42, "bad_json"],
    [{ email: 123 }, "bad_json"], [{ phone: [] }, "bad_json"],
    [{ password: {} }, "bad_json"], [{ data: [] }, "bad_json"], [{ data: "metadata" }, "bad_json"],
    [{ channel: 42 }, "bad_json"], [{ code_challenge: [] }, "bad_json"], [{ code_challenge_method: false }, "bad_json"],
    [{ phone: "+15555550123" }, "validation_failed"],
    [{ phone: "+15555550123", password: "Fixture-only-password!" }, "phone_provider_disabled"],
    [{ PHONE: "+15555550123", PASSWORD: "Fixture-only-password!" }, "phone_provider_disabled"],
    [{ EMAIL: 123 }, "bad_json"],
    [{ email: 123, EMAIL: "" }, "bad_json"],
    [{ data: 123, DATA: {} }, "bad_json"],
    [{ phone: "+15555550123", PHONE: null, password: "Fixture-only-password!" }, "phone_provider_disabled"],
    [{ email: "mail@example.test", phone: "+15555550123", password: "Fixture-only-password!" }, "validation_failed"],
    [{ email: "not-an-email", password: "Fixture-only-password!" }, "validation_failed"],
  ];
  for (const [body, code] of cases) {
    const response = await h.app.fetch(new Request("http://localhost/auth/v1/signup", {
      method: "POST", headers: { "content-type": "application/json", apikey: "test-only-key" }, body: JSON.stringify(body),
    }));
    assert.equal(response.status, 400, JSON.stringify(body));
    assert.equal(response.headers.get("X-Sb-Error-Code"), code, JSON.stringify(body));
  }
  const users = await h.connection.kysely.withSchema("auth").selectFrom("users").selectAll().execute();
  assert.deepEqual(users, []);
  const passwordOnly = await h.app.fetch(new Request("http://localhost/auth/v1/signup", {
    method: "POST", headers: { "content-type": "application/json", apikey: "test-only-key" },
    body: JSON.stringify({ password: "Fixture-only-discarded-password!" }),
  }));
  assert.equal(passwordOnly.status, 200);
  const guest = (await passwordOnly.json()).user;
  assert.equal(guest.is_anonymous, true);
  assert.equal(guest.email, "");
  const row = await h.connection.kysely.withSchema("auth").selectFrom("users")
    .selectAll().where("id", "=", guest.id).executeTakeFirstOrThrow();
  assert.equal(row.encrypted_password, null);
  const nullBody = await h.app.fetch(new Request("http://localhost/auth/v1/signup", {
    method: "POST", headers: { "content-type": "application/json", apikey: "test-only-key" }, body: "null",
  }));
  assert.equal(nullBody.status, 200);
  assert.equal((await nullBody.json()).user.is_anonymous, true);
  const good = await h.client.auth.signInAnonymously({ options: { data: { purpose: "draft" } } });
  assert.equal(good.error, null);
  assert.equal(good.data.user.is_anonymous, true);
});

test("anonymous provider gate precedes global signup disablement", async (t) => {
  const h = await createHarness({ auth: {
    enabled: true, jwt_secret: "fixture-only-345aac097972789d195a49bf421",
    enable_anonymous_sign_ins: false, enable_signup: false,
  } });
  t.after(h.close);
  const anonymous = await h.client.auth.signInAnonymously();
  assert.equal(anonymous.error?.code, "anonymous_provider_disabled");
  const email = await h.client.auth.signUp({ email: "disabled@example.test", password: "Fixture-only-password!" });
  assert.equal(email.error?.code, "signup_disabled");
});
