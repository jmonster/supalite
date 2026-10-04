import { createClient } from "@supabase/supabase-js";
import { App } from "../../upstream/lite-0.11.0/dist/index.js";
import { createConnection } from "../../upstream/lite-0.11.0/dist/db/node/index.js";
import { createLibsqlConnection } from "../../upstream/lite-0.11.0/dist/db/libsql/index.js";
import { createPgliteConnection } from "../../upstream/lite-0.11.0/dist/db/postgres/pglite/PgliteConnection.js";

export function modules() {
  return {
    App,
    factories: {
      node: createConnection,
      libsql: createLibsqlConnection,
      pglite: createPgliteConnection,
    },
  };
}

export async function createHarness({
  backend = "node",
  ddl,
  auth = { enabled: false },
  token,
} = {}) {
  const { App, factories } = modules();
  const connection = await factories[backend](
    backend === "pglite" ? undefined : { url: ":memory:" },
  );
  const app = new App({
    connection,
    auth,
    options: { server: { admin: false, disableStudio: true } },
  });
  if (auth.enabled) await app.ensureSystemSchema();
  if (ddl) await connection.createMigrator(ddl).migrate();
  // Exercise the real request/auth path, not Lite's privileged internal client.
  const client = createClient("http://localhost", "test-only-key", {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
      fetch: (url, options) => app.fetch(new Request(url, options)),
    },
  });
  return { connection, app, client, close: () => connection.close() };
}
