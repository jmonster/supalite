import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  guestHarness, guestData, password, successful, claims,
  assertGuest, assertConverted, emailAction, verifyEmail, writeDraft, assertDraft,
} from "./helpers/guest.mjs";

const backends = ["node", "libsql", "pglite"];

async function signInGuest(client, data = guestData) {
  const result = successful(await client.auth.signInAnonymously({ options: { data } }), "anonymous sign-in");
  assertGuest(result.user, result.user.id, data);
  assert.equal(result.session.user.id, result.user.id);
  assert.equal(claims(result.session).sub, result.user.id);
  assert.equal(claims(result.session).role, "authenticated");
  assert.equal(claims(result.session).is_anonymous, true);
  return result;
}

async function loginConverted(client, id, email, row, data = guestData, appMetadata = { provider: "email", providers: ["email"] }) {
  successful(await client.auth.signOut(), "sign out");
  assert.equal(successful(await client.auth.getSession()).session, null);
  const login = successful(await client.auth.signInWithPassword({ email, password }), "password login");
  assertConverted(login.user, id, email, data, appMetadata);
  assert.equal(claims(login.session).sub, id);
  assert.equal(claims(login.session).is_anonymous, false);
  assertConverted(successful(await client.auth.getUser()).user, id, email, data, appMetadata);
  await assertDraft(client, row);
}

async function confirmedLifecycle(harness, email, mode) {
  const { client, messages } = harness;
  const { user } = await signInGuest(client);
  const id = user.id;
  const row = await writeDraft(client, id);
  assert.equal(messages.length, 0, "guest sign-in sends no email");
  assertGuest(successful(await client.auth.getUser()).user, id);
  const refreshed = successful(await client.auth.refreshSession(), "refresh anonymous session");
  assertGuest(refreshed.user, id);
  assert.equal(claims(refreshed.session).is_anonymous, true);

  const passwordBeforeEmail = await client.auth.updateUser({ password });
  assert.equal(passwordBeforeEmail.error?.status, 422);
  assert.equal(passwordBeforeEmail.error?.code, "validation_failed");

  const data = { ...guestData, draft_label: "preserve this too" };
  const updated = successful(await client.auth.updateUser({ data: { draft_label: data.draft_label } }));
  assertGuest(updated.user, id, data);
  const pending = successful(await client.auth.updateUser({ email: email.toUpperCase() }), "attach email");
  assertGuest(pending.user, id, data);
  assert.equal(pending.user.new_email, email);
  assert.equal(messages.length, 1, "only the new address needs confirmation");
  assert.equal(messages[0].to, email);
  const action = emailAction(messages[0]);
  assert.equal(action.type, "email_change");
  assertGuest(successful(await client.auth.getUser()).user, id, data);
  await assertDraft(client, row);

  const verified = successful(await verifyEmail(client, action, mode), `verify email by ${mode}`);
  assertConverted(verified.user, id, email, data);
  assert.equal(claims(verified.session).is_anonymous, false);
  assert.equal(claims(verified.session).sub, id);
  const replay = await verifyEmail(client, action, mode);
  assert.ok(replay.error, "confirmation token is single-use");
  assert.equal(replay.data.session, null);
  assertConverted(successful(await client.auth.getUser()).user, id, email, data);

  const setPassword = successful(await client.auth.updateUser({ password }), "set confirmed password");
  assertConverted(setPassword.user, id, email, data);
  const refreshedPermanent = successful(await client.auth.refreshSession());
  assertConverted(refreshedPermanent.user, id, email, data);
  assert.equal(claims(refreshedPermanent.session).is_anonymous, false);
  await loginConverted(client, id, email, row, data);
}

for (const backend of backends) {
  for (const mode of ["otp", "token_hash"]) {
    test(`${backend}: guest draft/cart survives confirmed ${mode} conversion and password login`, async (t) => {
      const harness = await guestHarness({ backend });
      t.after(() => harness.close());
      await confirmedLifecycle(harness, `${backend}-${mode}@guest.example.test`, mode);
    });
  }

  test(`${backend}: autoconfirm converts the same guest without sending email`, async (t) => {
    const harness = await guestHarness({ backend, auth: { email: { enable_confirmations: false } } });
    t.after(() => harness.close());
    const { client, messages } = harness;
    const { user } = await signInGuest(client);
    const row = await writeDraft(client, user.id);
    const email = `${backend}-auto@guest.example.test`;
    const converted = successful(await client.auth.updateUser({ email }), "autoconfirm email attachment");
    assertConverted(converted.user, user.id, email, guestData, {});
    assertConverted(successful(await client.auth.getUser()).user, user.id, email, guestData, {});
    assert.equal(messages.length, 0);
    assert.equal(claims(successful(await client.auth.getSession()).session).is_anonymous, true,
      "updateUser changes the stored account but does not replace the existing JWT");
    successful(await client.auth.updateUser({ password }));
    const refreshed = successful(await client.auth.refreshSession());
    assertConverted(refreshed.user, user.id, email, guestData, {});
    assert.equal(claims(refreshed.session).is_anonymous, false);
    await loginConverted(client, user.id, email, row, guestData, {});
  });

  test(`${backend}: email plus password in one update waits for confirmation`, async (t) => {
    const harness = await guestHarness({ backend });
    t.after(() => harness.close());
    const { client, messages } = harness;
    const { user } = await signInGuest(client);
    const row = await writeDraft(client, user.id);
    const email = `${backend}-combined@guest.example.test`;
    const pending = successful(await client.auth.updateUser({ email, password }), "combined email/password update");
    assertGuest(pending.user, user.id);
    assert.ok((await harness.newClient().auth.signInWithPassword({ email, password })).error);
    const verified = successful(await verifyEmail(client, emailAction(messages[0])));
    assertConverted(verified.user, user.id, email);
    await loginConverted(client, user.id, email, row);
  });

  test(`${backend}: existing email conflict leaves the guest and its draft unchanged`, async (t) => {
    const harness = await guestHarness({ backend, auth: { email: { enable_confirmations: false } } });
    t.after(() => harness.close());
    const { client, messages } = harness;
    const incumbent = harness.newClient();
    const email = `${backend}-taken@guest.example.test`;
    const existing = successful(await incumbent.auth.signUp({ email, password }));
    const { user } = await signInGuest(client);
    const row = await writeDraft(client, user.id);
    const conflict = await client.auth.updateUser({ email: email.toUpperCase() });
    assert.ok(conflict.error);
    assert.equal(conflict.error.status, 422);
    assertGuest(successful(await client.auth.getUser()).user, user.id);
    assert.equal(successful(await incumbent.auth.getUser()).user.id, existing.user.id);
    assert.notEqual(existing.user.id, user.id);
    assert.equal(messages.length, 0);
    await assertDraft(client, row);
  });

  test(`${backend}: confirmation-time email conflict is atomic`, async (t) => {
    const harness = await guestHarness({ backend });
    t.after(() => harness.close());
    const { client, messages } = harness;
    const { user } = await signInGuest(client);
    const row = await writeDraft(client, user.id);
    const email = `${backend}-race@guest.example.test`;
    successful(await client.auth.updateUser({ email }));
    const guestAction = emailAction(messages[0]);
    const incumbent = harness.newClient();
    const signup = successful(await incumbent.auth.signUp({ email, password }));
    const signupAction = emailAction(messages[1]);
    successful(await incumbent.auth.verifyOtp({ email, token: signupAction.token, type: "signup" }));
    const rejected = await verifyEmail(client, guestAction, "token_hash");
    assert.ok(rejected.error, "another account now owns this email");
    assert.equal(rejected.data.session, null);
    assertGuest(successful(await client.auth.getUser()).user, user.id);
    assert.equal(successful(await incumbent.auth.getUser()).user.id, signup.user.id);
    await assertDraft(client, row);
  });

  test(`${backend}: OTP expiry, resend parity, authenticated resend, and single use`, async (t) => {
    const harness = await guestHarness({ backend, auth: { email: { otp_expiry: 60 } } });
    t.after(() => harness.close());
    const { client, messages } = harness;
    const { user } = await signInGuest(client);
    const email = `${backend}-expiry@guest.example.test`;
    successful(await client.auth.updateUser({ email }));
    const first = emailAction(messages[0]);
    // GoTrue's public resend looks up the current email, not a guest's pending email.
    successful(await harness.newClient().auth.resend({ email, type: "email_change" }));
    assert.equal(messages.length, 1);
    successful(await client.auth.updateUser({ email }), "authenticated resend of pending email");
    assert.equal(messages.length, 2);
    const second = emailAction(messages[1]);
    assert.notEqual(second.token_hash, first.token_hash);
    assert.ok((await verifyEmail(client, first)).error, "old token is replaced");
    const future = Date.now() + 61_000;
    const mockedNow = t.mock.method(Date, "now", () => future);
    try {
      assert.ok((await verifyEmail(client, second, "token_hash")).error, "expired token is rejected");
    } finally {
      mockedNow.mock.restore();
    }
    assertGuest(successful(await client.auth.getUser()).user, user.id);
    successful(await client.auth.updateUser({ email }), "fresh resend after expiry");
    assert.equal(messages.length, 3);
    const third = emailAction(messages[2]);
    assertConverted(successful(await verifyEmail(client, third)).user, user.id, email);
    assert.ok((await verifyEmail(client, third, "token_hash")).error, "consumed token cannot be reused in another format");
  });

  test(`${backend}: guest and converted identity persist after closing and reopening`, async (t) => {
    const directory = await mkdtemp(join(tmpdir(), `guest-${backend}-`));
    const url = join(directory, backend === "pglite" ? "database" : "database.sqlite");
    const messages = [];
    let harness = await guestHarness({ backend, url, messages });
    t.after(async () => {
      await harness.close();
      await rm(directory, { recursive: true, force: true });
    });
    const initial = await signInGuest(harness.client);
    const id = initial.user.id;
    const row = await writeDraft(harness.client, id);
    const email = `${backend}-persistent@guest.example.test`;
    successful(await harness.client.auth.updateUser({ email }));
    const action = emailAction(messages[0]);
    await harness.close();

    harness = await guestHarness({ backend, url, messages, ddl: null });
    const restored = successful(await harness.client.auth.setSession({
      access_token: initial.session.access_token,
      refresh_token: initial.session.refresh_token,
    }));
    assertGuest(restored.user, id);
    const refreshedGuest = successful(await harness.client.auth.refreshSession(), "refresh persisted guest session");
    assertGuest(refreshedGuest.user, id);
    assert.equal(claims(refreshedGuest.session).is_anonymous, true);
    assertGuest(successful(await harness.client.auth.getUser()).user, id);
    await assertDraft(harness.client, row);
    assertConverted(successful(await verifyEmail(harness.client, action, "token_hash")).user, id, email);
    successful(await harness.client.auth.updateUser({ password }));
    successful(await harness.client.auth.signOut());
    await harness.close();

    harness = await guestHarness({ backend, url, messages, ddl: null });
    const login = successful(await harness.client.auth.signInWithPassword({ email, password }));
    assertConverted(login.user, id, email);
    assert.equal(claims(login.session).is_anonymous, false);
    await assertDraft(harness.client, row);
    assert.equal(messages.length, 1);
  });
}

for (const [label, auth] of [
  ["disabled by default", { enable_anonymous_sign_ins: undefined }],
  ["explicitly disabled", { enable_anonymous_sign_ins: false }],
  ["global signup disabled", { enable_signup: false }],
]) {
  test(`node: anonymous signup is rejected when ${label}`, async (t) => {
    const harness = await guestHarness({ auth });
    t.after(() => harness.close());
    const result = await harness.client.auth.signInAnonymously({ options: { data: guestData } });
    assert.ok(result.error);
    assert.equal(result.data.user, null);
    assert.equal(result.data.session, null);
    assert.equal(harness.messages.length, 0);
  });
}

test("node: disabled email signup does not disable explicitly enabled anonymous sign-in", async (t) => {
  const harness = await guestHarness({ auth: { email: { enable_signup: false } } });
  t.after(() => harness.close());
  await signInGuest(harness.client);
});

test("node: authenticated email-change resend observes the configured cooldown", async (t) => {
  const harness = await guestHarness({ auth: { email: { max_frequency: "60s" } } });
  t.after(() => harness.close());
  const { user } = await signInGuest(harness.client);
  const email = "cooldown@guest.example.test";
  successful(await harness.client.auth.updateUser({ email }));
  const first = emailAction(harness.messages[0]);
  const throttled = await harness.client.auth.updateUser({ email });
  assert.equal(throttled.error?.status, 429);
  assert.equal(harness.messages.length, 1);
  assertGuest(successful(await harness.client.auth.getUser()).user, user.id);
  assertConverted(successful(await verifyEmail(harness.client, first)).user, user.id, email);
});

test("node: complete guest conversion uses real loopback HTTP and a synthetic email driver", async (t) => {
  const harness = await guestHarness({ http: true });
  t.after(() => harness.close());
  await confirmedLifecycle(harness, "loopback@guest.example.test", "token_hash");
  for (const pathname of ["/auth/v1/signup", "/auth/v1/user", "/auth/v1/verify", "/auth/v1/token", "/auth/v1/logout", "/rest/v1/guest_drafts"]) {
    assert.ok(harness.requests.some((request) => request.pathname === pathname), `HTTP request traversed ${pathname}`);
  }
});

test("published baseline control still rejects anonymous sign-in", async (t) => {
  const harness = await guestHarness({ flavor: "baseline", ddl: null });
  t.after(() => harness.close());
  const result = await harness.client.auth.signInAnonymously({ options: { data: guestData } });
  assert.equal(result.error?.status, 422);
  assert.equal(result.data.session, null);
});


test("node: email GET confirmation link redirects to an SDK-restorable session and rejects reuse", async (t) => {
  const harness = await guestHarness({ http: true });
  t.after(() => harness.close());
  const { user } = await signInGuest(harness.client);
  const row = await writeDraft(harness.client, user.id);
  const email = "mail-link@guest.example.test";
  successful(await harness.client.auth.updateUser({ email }));
  const action = emailAction(harness.messages[0]);
  const response = await harness.request(action.url, { redirect: "manual" });
  assert.equal(response.status, 303);
  const destination = new URL(response.headers.get("location"));
  assert.equal(destination.origin, "http://localhost:3000");
  const fragment = new URLSearchParams(destination.hash.slice(1));
  assert.equal(fragment.get("type"), "email_change");
  assert.equal(fragment.get("token_type"), "bearer");
  assert.ok(fragment.get("access_token"));
  assert.ok(fragment.get("refresh_token"));
  assert.equal(fragment.has("error"), false);
  const convertedClient = harness.newClient();
  const restored = successful(await convertedClient.auth.setSession({
    access_token: fragment.get("access_token"), refresh_token: fragment.get("refresh_token"),
  }));
  assertConverted(restored.user, user.id, email);
  assert.equal(claims(restored.session).is_anonymous, false);
  await assertDraft(convertedClient, row);
  successful(await convertedClient.auth.updateUser({ password }));
  await loginConverted(convertedClient, user.id, email, row);

  const replay = await harness.request(action.url, { redirect: "manual" });
  assert.equal(replay.status, 303);
  const failure = new URLSearchParams(new URL(replay.headers.get("location")).hash.slice(1));
  assert.equal(failure.get("error"), "access_denied");
  assert.equal(failure.get("error_code"), "otp_expired");
  assert.equal(failure.has("access_token"), false);
  assertConverted(successful(await convertedClient.auth.getUser()).user, user.id, email);
  assert.ok(harness.requests.some(({ method, pathname }) => method === "GET" && pathname === "/auth/v1/verify"));
});

test("node: expired email GET confirmation links cannot convert the guest", async (t) => {
  const harness = await guestHarness({ http: true, auth: { email: { otp_expiry: 60 } } });
  t.after(() => harness.close());
  const { user } = await signInGuest(harness.client);
  const row = await writeDraft(harness.client, user.id);
  successful(await harness.client.auth.updateUser({ email: "expired-link@guest.example.test" }));
  const action = emailAction(harness.messages[0]);
  const future = Date.now() + 61_000;
  const mockedNow = t.mock.method(Date, "now", () => future);
  let response;
  try {
    response = await harness.request(action.url, { redirect: "manual" });
  } finally {
    mockedNow.mock.restore();
  }
  assert.equal(response.status, 303);
  const failure = new URLSearchParams(new URL(response.headers.get("location")).hash.slice(1));
  assert.equal(failure.get("error"), "access_denied");
  assert.equal(failure.get("error_code"), "otp_expired");
  assert.equal(failure.has("access_token"), false);
  assertGuest(successful(await harness.client.auth.getUser()).user, user.id);
  await assertDraft(harness.client, row);
});

test("node: no-data guest signup succeeds and user metadata cannot forge anonymous status", async (t) => {
  const harness = await guestHarness();
  t.after(() => harness.close());
  const empty = successful(await harness.client.auth.signInAnonymously());
  assertGuest(empty.user, empty.user.id, {});
  assert.equal(claims(empty.session).is_anonymous, true);
  const forgedData = { is_anonymous: false, ...guestData };
  const forged = await signInGuest(harness.newClient(), forgedData);
  assertGuest(forged.user, forged.user.id, forgedData);
  const updated = successful(await harness.client.auth.updateUser({ data: { is_anonymous: false } }));
  assertGuest(updated.user, empty.user.id, { is_anonymous: false });
  const refreshed = successful(await harness.client.auth.refreshSession());
  assertGuest(refreshed.user, empty.user.id, { is_anonymous: false });
  assert.equal(claims(refreshed.session).is_anonymous, true);
});
