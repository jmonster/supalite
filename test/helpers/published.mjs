// Explicit read-only reference to the original npm package. The working
// implementation is always imported through lite.mjs, never copied or rewritten.
import { createClient } from "@supabase/supabase-js";
import { App } from "@supabase/lite";
import { createConnection } from "@supabase/lite/sqlite";
import { createLibsqlConnection } from "@supabase/lite/libsql";
import { createPgliteConnection } from "@supabase/lite/pglite";

const factories = {
  node: createConnection,
  libsql: createLibsqlConnection,
  pglite: createPgliteConnection,
};

export async function createPublishedHarness({ backend = "node", ddl } = {}) {
  const connection = await factories[backend](
    backend === "pglite" ? undefined : { url: ":memory:" },
  );
  const app = new App({
    connection,
    auth: { enabled: false },
    options: { server: { admin: false, disableStudio: true } },
  });
  if (ddl) await connection.createMigrator(ddl).migrate();
  const client = createClient("http://localhost", "test-only-key", {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (url, options) => app.fetch(new Request(url, options)) },
  });
  return { connection, app, client, close: () => connection.close() };
}
