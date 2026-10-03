import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { promisify } from "node:util";
import postgres from "postgres";
import { createClient } from "@supabase/supabase-js";
import { appliedFile, fixture, run } from "./helpers/upgrade.mjs";
import { runAppContract } from "./upgrade/app-contract.mjs";

const exec = promisify(execFile);
const enabled = process.env.LITE_LOCAL_SUPABASE_TESTS === "1";

test("same SDK app contract before and after the shipped real local Supabase upgrade", {
  skip: enabled ? false : "requires opt-in LITE_LOCAL_SUPABASE_TESTS=1, Supabase CLI and a working Docker daemon",
  timeout: 600000,
}, async (t) => {
  await exec("docker", ["info"], { timeout: 30000 });
  const command = (process.env.LITE_SUPABASE_CLI || "bunx supabase@2.98.1").trim().split(/\s+/);
  const invoke = (args) => exec(command[0], [...command.slice(1), ...args], {
    timeout: 120000, maxBuffer: 4 * 1024 * 1024,
    env: { ...process.env, SUPABASE_ACCESS_TOKEN: "", SUPABASE_TELEMETRY_DISABLED: "1", DO_NOT_TRACK: "1" },
  });
  await invoke(["--version"]);
  const project = await fixture(t);
  const target = resolve(project, "local-target");
  const credentialsPath = resolve(project, "local-credentials.json");
  const originalConfig = await readFile(resolve(project, "supabase/config.toml"), "utf8");
  const state = JSON.parse(await readFile(resolve(project, "fixture-state.json"), "utf8"));
  // Require the real migration to use recorded history, not this edited copy.
  await writeFile(resolve(project, appliedFile), "THIS IS NOT THE RECORDED MIGRATION;\n");
  try {
    const result = await run(project, ["upgrade", "--target", "local", "--local-dir", target,
      "--force", "--no-migrate-sessions", "--dump-credentials", credentialsPath], { flavor: "auth-upgrade", timeout: 480000 });
    assert.equal(result.code, 0, `${result.stdout}\n${result.stderr}`);
    const credentials = JSON.parse(await readFile(credentialsPath, "utf8"));
    assert.equal(credentials.target, "local");
    for (const value of [credentials.apiUrl, credentials.dbUrl]) {
      assert.ok(["localhost", "127.0.0.1", "[::1]"].includes(new URL(value).hostname), "fixture target must be loopback");
    }
    const sql = postgres(credentials.dbUrl, { max: 1 });
    try {
      assert.equal(Number((await sql`SELECT count(*) FROM auth.users`)[0].count), 2);
      assert.equal(Number((await sql`SELECT count(*) FROM auth.identities`)[0].count), 2);
      assert.equal(Number((await sql`SELECT count(*) FROM auth.sessions`)[0].count), 0);
      assert.equal(Number((await sql`SELECT count(*) FROM auth.refresh_tokens`)[0].count), 0);
      const tables = await sql`SELECT relname, relrowsecurity FROM pg_class WHERE oid IN ('public.z_projects'::regclass, 'public.a_records'::regclass) ORDER BY relname`;
      assert.deepEqual(tables.map((row) => [row.relname, row.relrowsecurity]), [["a_records", true], ["z_projects", true]]);
      const identities = await sql`SELECT id::text, user_id::text FROM auth.identities ORDER BY user_id`;
      assert.deepEqual(identities.map((row) => ({ id: row.user_id, identityId: row.id })).sort((a, b) => a.id.localeCompare(b.id)), state.users.toSorted((a, b) => a.id.localeCompare(b.id)));
    } finally {
      await sql.end();
    }
    const newClient = () => createClient(credentials.apiUrl, credentials.anonKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
    // This signs in again and verifies preserved identity, values, owner RLS,
    // FKs, JSONB and generated IDs above both migrated high-water marks.
    await runAppContract(newClient, state);
    assert.equal(await readFile(resolve(project, "supabase/config.toml"), "utf8"), originalConfig);
  } finally {
    try {
      await invoke(["stop", "--workdir", target, "--no-backup"]);
    } finally {
      await rm(credentialsPath, { force: true });
    }
  }
});
