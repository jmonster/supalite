import test from "node:test";
import assert from "node:assert/strict";
import {
  guestHarness, successful, emailAction, verifyEmail,
  assertGuest, guestData, password, claims,
} from "./helpers/guest.mjs";

async function rows(harness, table, userId) {
  let query = harness.connection.kysely.withSchema("auth").selectFrom(table).selectAll();
  if (userId) query = query.where(table === "users" ? "id" : "user_id", "=", userId);
  return query.orderBy("id").execute();
}

// A deterministic transaction-local database fault exercises rollback without
// modifying the runtime source or replacing any authentication method.
function faultInTransaction(harness, target) {
  const original = harness.connection.runInTransaction.bind(harness.connection);
  let active = true;
  let triggered = 0;
  harness.connection.runInTransaction = (fn) => original((db) => fn(db.withPlugin({
    transformQuery({ node }) {
      const table = node.into?.table?.identifier?.name;
      if (active && node.kind === "InsertQueryNode" && table?.endsWith(target)) {
        triggered++;
        throw new Error(`Synthetic ${target} insert failure`);
      }
      return node;
    },
    async transformResult({ result }) { return result; },
  })));
  return {
    off() { active = false; },
    count() { return triggered; },
  };
}

for (const backend of ["node", "libsql", "pglite"]) {
  test(`${backend}: conversion failure rolls back flag, token claim, identity and sessions; same token retries`, async (t) => {
    const harness = await guestHarness({ backend });
    t.after(harness.close);
    const initial = successful(await harness.client.auth.signInAnonymously({ options: { data: guestData } }));
    successful(await harness.client.auth.updateUser({ email: `rollback-${backend}@example.test` }));
    const action = emailAction(harness.messages[0]);
    const before = {};
    for (const table of ["users", "identities", "sessions", "refresh_tokens"]) {
      before[table] = await rows(harness, table, initial.user.id);
    }
    const fault = faultInTransaction(harness, "identities");
    const failed = await verifyEmail(harness.client, action, "token_hash");
    assert.equal(failed.error?.status, 500);
    assert.equal(fault.count(), 1);
    for (const table of Object.keys(before)) {
      assert.deepEqual(await rows(harness, table, initial.user.id), before[table], table);
    }
    assertGuest(successful(await harness.client.auth.getUser()).user, initial.user.id);
    fault.off();
    const verified = successful(await verifyEmail(harness.client, action, "token_hash"));
    assert.equal(verified.user.id, initial.user.id);
    assert.equal(verified.user.is_anonymous, false);
    assert.equal(claims(verified.session).is_anonymous, false);
  });

  test(`${backend}: autoconfirm failure rolls back password, metadata, identity and guest status`, async (t) => {
    const harness = await guestHarness({ backend, auth: { email: { enable_confirmations: false } } });
    t.after(harness.close);
    const initial = successful(await harness.client.auth.signInAnonymously({ options: { data: guestData } }));
    const before = await rows(harness, "users", initial.user.id);
    const fault = faultInTransaction(harness, "identities");
    const update = { email: `rollback-auto-${backend}@example.test`, password, data: { stage: "new" } };
    const failed = await harness.client.auth.updateUser(update);
    assert.equal(failed.error?.status, 500);
    assert.equal(fault.count(), 1);
    assert.deepEqual(await rows(harness, "users", initial.user.id), before);
    assert.deepEqual(await rows(harness, "identities", initial.user.id), []);
    assertGuest(successful(await harness.client.auth.getUser()).user, initial.user.id);
    fault.off();
    const verified = successful(await harness.client.auth.updateUser(update));
    assert.equal(verified.user.id, initial.user.id);
    assert.equal(verified.user.is_anonymous, false);
    assert.deepEqual(verified.user.app_metadata, {});
  });

 test(`${backend}: failed autoconfirm audit rolls back state, password, identity and metadata; retry preserves UUID`, async (t) => {
  const h = await guestHarness({backend,auth:{email:{enable_confirmations:false}}}); t.after(h.close);
  const initial = successful(await h.client.auth.signInAnonymously({options:{data:guestData}}));
  const before = {};
  for (const table of ['users','identities','sessions','refresh_tokens']) before[table] = await rows(h,table,initial.user.id);
  const auditsBefore = await rows(h,'audit_log_entries');
  const fault = faultInTransaction(h,'audit_log_entries');
  const email = `rollback-audit-${backend}@example.test`;
  const failed = await h.client.auth.updateUser({email,password,data:{stage:'new'}});
  assert.equal(failed.error?.status,500); assert.equal(fault.count(),1);
  for (const table of Object.keys(before)) assert.deepEqual(await rows(h,table,initial.user.id),before[table],table);
  assert.deepEqual(await rows(h,'audit_log_entries'),auditsBefore);
  assertGuest(successful(await h.client.auth.getUser()).user,initial.user.id);
  fault.off();
  const converted = successful(await h.client.auth.updateUser({email,password,data:{stage:'new'}}));
  assert.equal(converted.user.id,initial.user.id); assert.equal(converted.user.is_anonymous,false);
  assert.deepEqual(converted.user.app_metadata,{});
  successful(await h.client.auth.signOut());
  const login = successful(await h.client.auth.signInWithPassword({email,password}));
  assert.equal(login.user.id,initial.user.id);
 });
 test(`${backend}: two pending guests cannot convert to the same email; rejected token remains unconsumed`, async (t) => {
    const harness = await guestHarness({ backend });
    t.after(harness.close);
    const second = harness.newClient();
    const one = successful(await harness.client.auth.signInAnonymously({ options: { data: guestData } }));
    const two = successful(await second.auth.signInAnonymously({ options: { data: guestData } }));
    const email = `two-pending-${backend}@example.test`;
    successful(await harness.client.auth.updateUser({ email }));
    const actionOne = emailAction(harness.messages.at(-1));
    successful(await second.auth.updateUser({ email }));
    const actionTwo = emailAction(harness.messages.at(-1));
    const pending = await rows(harness, "users", two.user.id);
    successful(await verifyEmail(harness.client, actionOne));
    const rejected = await verifyEmail(second, actionTwo, "token_hash");
    assert.equal(rejected.error?.status, 422);
    assert.equal(rejected.data.session, null);
    assert.deepEqual(await rows(harness, "users", two.user.id), pending);
    assert.deepEqual(await rows(harness, "identities", two.user.id), []);
    assert.equal((await rows(harness, "sessions", two.user.id)).length, 1);
    assertGuest(successful(await second.auth.getUser()).user, two.user.id);
    assert.equal(successful(await harness.client.auth.getUser()).user.id, one.user.id);
  });
}

test("node: typed signup checks precede case-folding and string nulls preserve prior aliases", async (t) => {
  const harness = await guestHarness({ ddl: null });
  t.after(harness.close);
  for (const [body, expected] of [
    [{ email: 123, EMAIL: "" }, "bad_json"],
    [{ phone: "+15555550123", PHONE: null, password: "Valid-test-password!" }, "phone_provider_disabled"],
  ]) {
    const response = await harness.app.fetch(new Request("http://localhost/auth/v1/signup", {
      method: "POST",
      headers: { "content-type": "application/json", apikey: "fixture" },
      body: JSON.stringify(body),
    }));
    assert.equal(response.status, 400, JSON.stringify(body));
    assert.equal(response.headers.get("x-sb-error-code"), expected, JSON.stringify(body));
  }
  assert.deepEqual(await rows(harness, "users"), []);
});
