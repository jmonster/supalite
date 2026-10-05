import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createServer } from "node:http";
import { once } from "node:events";
import { createClient } from "@supabase/supabase-js";
import { modules } from "./lite.mjs";

export const password = "Guest-test-password-42!";
export const guestData = {
  display_name: "Synthetic guest",
  onboarding: { stage: "draft", source: "guest-test" },
};
export const draftDdl = `CREATE TABLE guest_drafts (
  owner_id uuid PRIMARY KEY,
  draft text NOT NULL,
  cart_count integer NOT NULL
);`;

export function successful(result, message) {
  assert.equal(result.error, null, `${message ?? "SDK request"}: ${JSON.stringify(result.error)}`);
  return result.data;
}

export function claims(session) {
  assert.ok(session?.access_token, "session includes an access token");
  return JSON.parse(Buffer.from(session.access_token.split(".")[1], "base64url").toString());
}

export function assertGuest(user, id = user?.id, data = guestData) {
  assert.ok(user);
  assert.match(user.id, /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  assert.equal(user.id, id);
  assert.equal(user.is_anonymous, true);
  assert.equal(user.role, "authenticated");
  assert.equal(user.email ?? "", "");
  assert.deepEqual(user.identities, []);
  assert.deepEqual(user.app_metadata, {});
  assert.deepEqual(user.user_metadata, data);
}

export function assertConverted(user, id, email, data = guestData, appMetadata = { provider: "email", providers: ["email"] }) {
  assert.equal(user.id, id);
  assert.equal(user.email, email);
  assert.equal(user.is_anonymous, false);
  assert.ok(user.email_confirmed_at, "email ownership is confirmed");
  assert.deepEqual(user.app_metadata, appMetadata);
  for (const [key, value] of Object.entries(data)) assert.deepEqual(user.user_metadata[key], value);
  assert.equal(user.user_metadata.email_verified, true);
  assert.equal(user.identities.length, 1);
  assert.equal(user.identities[0].provider, "email");
  assert.equal(user.identities[0].user_id, id);
  assert.equal(user.identities[0].identity_data.email, email);
  assert.equal(user.identities[0].identity_data.email_verified, true);
}

export function emailAction(message) {
  assert.ok(message, "synthetic mail driver captured an email");
  const text = message.text ?? "";
  const otp = text.match(/(?:code(?: is)?):\s*(\d+)/i)?.[1];
  const link = text.match(/https?:\/\/\S+/)?.[0];
  assert.ok(otp, "mail has an OTP");
  assert.ok(link, "mail has an action URL");
  const url = new URL(link);
  const token_hash = url.searchParams.get("token") ?? url.searchParams.get("token_hash");
  assert.ok(token_hash, "mail link has a token hash");
  return { email: message.to, token: otp, token_hash, type: url.searchParams.get("type"), url: url.href };
}

export async function verifyEmail(client, action, mode = "otp") {
  return client.auth.verifyOtp(mode === "token_hash"
    ? { token_hash: action.token_hash, type: "email_change" }
    : { email: action.email, token: action.token, type: "email_change" });
}

export async function writeDraft(client, id) {
  const row = { owner_id: id, draft: "Keep this draft through signup", cart_count: 3 };
  const result = await client.from("guest_drafts").insert(row).select().single();
  assert.deepEqual(successful(result, "write anonymous draft/cart"), row);
  return row;
}

export async function assertDraft(client, row) {
  const result = await client.from("guest_drafts").select().eq("owner_id", row.owner_id).single();
  assert.deepEqual(successful(result, "read preserved draft/cart"), row);
}

// All mail is delivered to this in-process array. No SMTP or external account is used.
// Clients always traverse App.fetch or a real loopback HTTP server, never App.getClient.
export async function guestHarness({
  backend = "node", auth = {}, url,
  ddl = draftDdl, messages = [], http = false,
} = {}) {
  const { App, factories } = modules();
  let connection = await factories[backend](url ? { url } : backend === "pglite" ? undefined : { url: ":memory:" });
  let app = new App({
    connection,
    auth: {
      enabled: true,
      jwt_secret: "guest-tests-only-0123456789abcdef0123456789abcdef",
      enable_anonymous_sign_ins: true,
      ...auth,
      email: { enable_confirmations: true, max_frequency: "0s", ...auth.email },
    },
    options: {
      server: { admin: false, disableStudio: true },
      drivers: { email: { async send(message) { messages.push(structuredClone(message)); } } },
    },
  });
  await app.ensureSystemSchema();
  if (ddl) await connection.createMigrator(ddl).migrate();
  const requests = [];
  const dispatch = async (request) => {
    requests.push({ method: request.method, pathname: new URL(request.url).pathname });
    return app.fetch(request);
  };
  let server;
  let baseUrl = "http://127.0.0.1";
  if (http) {
    server = createServer(async (incoming, outgoing) => {
      try {
        const chunks = [];
        for await (const chunk of incoming) chunks.push(chunk);
        const body = Buffer.concat(chunks);
        const response = await dispatch(new Request(`${baseUrl}${incoming.url}`, {
          method: incoming.method,
          headers: incoming.headers,
          ...(body.length ? { body } : {}),
        }));
        outgoing.writeHead(response.status, Object.fromEntries(response.headers));
        outgoing.end(Buffer.from(await response.arrayBuffer()));
      } catch (error) {
        outgoing.writeHead(500, { "content-type": "application/json" });
        outgoing.end(JSON.stringify({ message: String(error) }));
      }
    });
    server.listen(0, "127.0.0.1");
    await once(server, "listening");
    baseUrl = `http://127.0.0.1:${server.address().port}`;
  }
  const clients = [];
  function newClient() {
    const client = createClient(baseUrl, "test-only-key", {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false, storageKey: randomUUID() },
      ...(!http ? { global: { fetch: (input, init) => dispatch(new Request(input, init)) } } : {}),
    });
    clients.push(client);
    return client;
  }
  let closed = false;
  const harness = {
    app, connection, messages, requests, newClient, client: newClient(),
    // Preserve the exact mail-link path/query while using the ephemeral HTTP listener.
    request(input, init) {
      const url = new URL(input, baseUrl);
      return http
        ? fetch(new URL(`${url.pathname}${url.search}`, baseUrl), init)
        : dispatch(new Request(url, init));
    },
    async close() {
      if (closed) return;
      closed = true;
      for (const client of clients) await client.auth.stopAutoRefresh();
      if (server) {
        const closedServer = new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
        server.closeAllConnections();
        await closedServer;
      }
      await connection.close();
      // Release closed fixtures retained by node:test after-hooks.
      clients.length = 0;
      app = null;
      connection = null;
      harness.app = null;
      harness.connection = null;
      harness.client = null;
    },
  };
  return harness;
}
