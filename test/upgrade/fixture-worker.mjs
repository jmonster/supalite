import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { createApi } from "../../upstream/lite-0.11.0/dist/cli/lib.js";

const api = await createApi({ root: process.cwd(), withSupabaseClient: false });
const app = await api.project.local.createApp(undefined, { admin: false });
try {
  if (process.argv[2] === "snapshot") {
    const results = [];
    for (const table of ["z_projects", "a_records", "auth.users", "auth.identities", "auth.sessions", "auth.refresh_tokens", "auth.audit_log_entries", "auth.flow_state", "supabase_migrations.schema_migrations", "supabase_migrations.seed_files", "sqlite_schema", "sqlite_sequence"]) {
      const result = await app.connection.exec(`SELECT * FROM "${table}"`);
      results.push([table, result.rows.map((row) => JSON.stringify(row)).sort()]);
    }
    console.log(`SNAPSHOT:${createHash("sha256").update(JSON.stringify(results)).digest("hex")}`);
  } else if (process.argv[2] === "setup") {
    const state = { users: [], projects: [] };
    const payloads = [
      { label: "Alice's café 雪", active: true, tags: ["red", "blue"], nested: { score: 4, missing: null } },
      { label: "Bob's record", active: false, tags: [], nested: { score: 0, missing: null } },
    ];
    for (const [i, name] of ["alice", "bob"].entries()) {
      const client = createClient("http://localhost", "sb_publishable_upgrade_fixture_only", {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
        global: { fetch: (url, options) => app.fetch(new Request(url, options)) },
      });
      const signup = await client.auth.signUp({ email: `${name}@example.test`, password: "Fixture-only-password-44!" });
      assert.equal(signup.error, null);
      const user = signup.data.user;
      const project = { id: 100 + i * 100, owner_id: user.id, name: `${name} project` };
      const record = { id: 1000 + i * 1000, project_id: project.id, owner_id: user.id, title: `${name} record`, payload: payloads[i] };
      await app.connection.exec("INSERT INTO z_projects(id, owner_id, name) VALUES (?, ?, ?)", project.id, user.id, project.name);
      await app.connection.exec("INSERT INTO a_records(id, project_id, owner_id, title, payload) VALUES (?, ?, ?, ?, ?)",
        record.id, project.id, user.id, record.title, JSON.stringify(record.payload));
      assert.equal((await client.auth.signOut()).error, null);
      state.users.push({ id: user.id });
      state.projects.push(project);
    }
    await writeFile("fixture-state.json", JSON.stringify(state));
    console.log("FIXTURE_OK");
  } else {
    throw new Error(`Unknown fixture command: ${process.argv[2]}`);
  }
} finally {
  await app.connection.close();
}
