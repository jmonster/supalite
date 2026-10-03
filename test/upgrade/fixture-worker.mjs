import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import { accounts, payloads, runAppContract, success } from "./app-contract.mjs";

const command = process.argv[2];
if (command === "snapshot") {
  const { createApi } = await import(new URL("../../.generated/baseline/node_modules/@supabase/lite/dist/cli/lib.js", import.meta.url));
  const api = await createApi({ root: process.cwd(), withSupabaseClient: false });
  const app = await api.project.local.createApp(undefined, { admin: false });
  try {
    const results = [];
    for (const table of ["z_projects", "a_records", "auth.users", "auth.identities", "auth.sessions", "auth.refresh_tokens", "auth.audit_log_entries", "auth.flow_state", "supabase_migrations.schema_migrations", "supabase_migrations.seed_files", ...(app.connection.dialect === "sqlite" ? ["sqlite_schema", "sqlite_sequence"] : [])]) {
      const name = app.connection.dialect === "postgres" ? table.split(".").map((part) => `"${part}"`).join(".") : `"${table}"`;
      const result = await app.connection.exec(`SELECT * FROM ${name}`);
      results.push([table, result.rows.map((row) => JSON.stringify(row)).sort()]);
    }
    console.log(`SNAPSHOT:${createHash("sha256").update(JSON.stringify(results)).digest("hex")}`);
  } finally {
    await app.connection.close();
  }
} else {
  const url = await readFile("fixture-url.txt", "utf8");
  const key = "sb_publishable_upgrade_fixture_only";
  const newClient = () => createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
  const cli = fileURLToPath(new URL("../../.generated/baseline/node_modules/@supabase/lite/dist/cli/index.js", import.meta.url));
  const server = spawn(process.execPath, [cli, "--no-telemetry", "start", "--no-admin", "--host", "127.0.0.1"], { stdio: ["ignore", "pipe", "pipe"] });
  let output = "";
  server.stdout.on("data", (chunk) => { output += chunk; });
  server.stderr.on("data", (chunk) => { output += chunk; });
  const exited = once(server, "exit");
  try {
    const deadline = Date.now() + 30000;
    while (true) {
      if (server.exitCode !== null) throw new Error(`Lite server exited: ${output}`);
      const ready = await fetch(`${url}/auth/v1/health`, { headers: { apikey: key }, signal: AbortSignal.timeout(1000) }).then((response) => response.ok).catch(() => false);
      if (ready) break;
      if (Date.now() > deadline) throw new Error(`Lite server did not become ready: ${output}`);
      await delay(100);
    }
    if (command === "setup") {
      const state = { users: [], projects: [], records: [] };
      for (let i = 0; i < accounts.length; i++) {
        const client = newClient();
        const { user } = success(await client.auth.signUp(accounts[i]), "fixture signup");
        state.users.push({ id: user.id, identityId: user.identities[0].identity_id });
        const project = { id: 100 + i * 100, owner_id: user.id, name: i === 0 ? "Alice project" : "Bob project" };
        const record = { id: 1000 + i * 1000, project_id: project.id, owner_id: user.id, title: i === 0 ? "Alice record" : "Bob record", payload: payloads[i] };
        success(await client.from("z_projects").insert(project), "seed project");
        success(await client.from("a_records").insert(record), "seed record");
        state.projects.push(project);
        state.records.push(record);
        success(await client.auth.signOut(), "fixture sign out");
      }
      await writeFile("fixture-state.json", JSON.stringify(state));
      await runAppContract(newClient, state);
    } else if (command === "check") {
      await runAppContract(newClient, JSON.parse(await readFile("fixture-state.json", "utf8")));
    } else {
      throw new Error(`Unknown fixture command: ${command}`);
    }
    console.log("FIXTURE_OK");
  } finally {
    server.kill("SIGTERM");
    const killTimer = setTimeout(() => server.kill("SIGKILL"), 5000);
    await exited;
    clearTimeout(killTimer);
  }
}
