import { createClient } from "@supabase/supabase-js";

export async function modules(flavor = "baseline") {
  const packageRoot = new URL(
    `../../.generated/${flavor}/node_modules/@supabase/lite/`,
    import.meta.url,
  );
  const { App } = await import(new URL("dist/index.js", packageRoot));
  const { createConnection } = await import(
    new URL("dist/db/node/index.js", packageRoot)
  );
  const { createLibsqlConnection } = await import(
    new URL("dist/db/libsql/index.js", packageRoot)
  );
  const { createPgliteConnection } = await import(
    new URL("dist/db/postgres/pglite/PgliteConnection.js", packageRoot)
  );
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
  flavor = "baseline",
  backend = "node",
  ddl,
  auth = { enabled: false },
  token,
} = {}) {
  const { App, factories } = await modules(flavor);
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
