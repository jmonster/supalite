import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { packageRoot, prepareTestBridge } from "../helpers/upgrade-history.mjs";
import { pathToFileURL } from "node:url";

const [command, flavor] = process.argv.slice(2);
const { createApi } = await import(pathToFileURL(`${packageRoot("baseline")}/dist/cli/lib.js`));
const api = await createApi({ root: process.cwd(), withSupabaseClient: false });
const app = await api.project.local.createApp(undefined, { admin: false });
const postgres = app.connection.dialect === "postgres";
const name = (schema, table) => postgres ? `"${schema}"."${table}"` : `"${schema === "public" ? table : `${schema}.${table}`}"`;
const userTables = [
  ["public", "z_projects"], ["public", "a_records"],
  ["public", "schema_migrations"], ["public", "seed_files"],
  ["archive", "schema_migrations"], ["archive", "seed_files"],
  ["supabase_migrations", "application_rows"], ["supabase_migrations_archive", "schema_migrations"],
];
const metadataTables = [["supabase_migrations", "schema_migrations"], ["supabase_migrations", "seed_files"]];
const authTables = [["auth", "users"], ["auth", "identities"], ["auth", "audit_log_entries"]];
try {
  if (command === "setup") {
    await app.connection.exec(`INSERT INTO ${name("auth", "users")} (id, email) VALUES ('00000000-0000-4000-8000-000000000001', 'upgrade-fixture@example.invalid')`);
    await app.connection.exec(`INSERT INTO ${name("auth", "identities")} (id, user_id, provider, provider_id, identity_data) VALUES ('00000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000001', 'email', '00000000-0000-4000-8000-000000000001', '{"email":"upgrade-fixture@example.invalid"}')`);
    await app.connection.exec(`INSERT INTO ${name("auth", "audit_log_entries")} (id, payload) VALUES ('00000000-0000-4000-8000-000000000003', '{"fixture":true}')`);
    await app.connection.exec(`INSERT INTO ${name("public", "z_projects")} (id, owner_id, name) VALUES (200, '00000000-0000-4000-8000-000000000001', 'kept')`);
    await app.connection.exec(`INSERT INTO ${name("public", "a_records")} (id, project_id, payload) VALUES (2000, 200, '{"nested":{"value":"kept"},"array":[1,true,null]}')`);
    for (const [schema, table] of userTables.slice(2)) {
      await app.connection.exec(`INSERT INTO ${name(schema, table)} (id, note) VALUES (42, '${schema}.${table} user data')`);
    }
    await app.connection.exec(`INSERT INTO ${name("supabase_migrations", "seed_files")} (path, hash) VALUES ('./seed.sql', 'fixture-hash')`);
    const rollback = postgres ? "ARRAY['DROP TABLE public.a_records']::text[]" : "'[\"DROP TABLE public.a_records\"]'";
    await app.connection.exec(`UPDATE ${name("supabase_migrations", "schema_migrations")} SET created_by = 'fixture', idempotency_key = 'fixture-records', rollback = ${rollback}`);
    if (postgres) {
      // Explicit source IDs do not advance PostgreSQL sequences. Model normal
      // application state before verifying the upgrade resets target sequences.
      await app.connection.exec("SELECT setval('public.z_projects_id_seq', 200), setval('public.a_records_id_seq', 2000)");
    }
    console.log("RESULT:{}");
  } else if (command === "snapshot") {
    const rows = [];
    for (const [schema, table] of [...userTables, ...metadataTables, ...authTables]) {
      const result = await app.connection.exec(`SELECT * FROM ${name(schema, table)}`);
      rows.push([schema, table, result.rows.map((row) => JSON.stringify(row)).sort()]);
    }
    const sequenceSql = postgres
      ? "SELECT schemaname, sequencename, last_value FROM pg_sequences ORDER BY schemaname, sequencename"
      : "SELECT * FROM sqlite_sequence ORDER BY name";
    const sequences = (await app.connection.exec(sequenceSql)).rows;
    console.log(`RESULT:${JSON.stringify({ rows, sequences, config: await readFile("supabase/config.toml", "utf8") })}`);
  } else if (command === "inspect" || command === "replay" || command === "replay-existing-history") {
    await prepareTestBridge(flavor);
    const internals = await import(pathToFileURL(`${packageRoot(flavor)}/dist/cli/test-upgrade-api.js`));
    const source = await internals.collectUpgradeSource(app);
    const data = await internals.exportUserData(app, source);
    const inventory = (await app.connection.introspect()).tables;
    const output = { source, data, inventory };
    if (command.startsWith("replay")) {
      const target = new PGlite();
      try {
        for (const role of ["anon", "authenticated", "service_role", "supabase_auth_admin"]) await target.exec(`CREATE ROLE ${role}`);
        for (const sql of internals.authSetupSql) await target.exec(sql);
        if (command === "replay-existing-history") {
          await target.exec(`CREATE SCHEMA supabase_migrations;
CREATE TABLE supabase_migrations.schema_migrations (version text PRIMARY KEY, statements text[], name text);
CREATE TABLE supabase_migrations.seed_files (path text PRIMARY KEY, hash text);
INSERT INTO supabase_migrations.schema_migrations VALUES ('20260101000000', ARRAY['SELECT 42']::text[], 'target-owned');
INSERT INTO supabase_migrations.seed_files VALUES ('./seed.sql', 'target-owned-hash');`);
        }
        const events = [];
        output.result = await internals.runUpgrade(app, { runSql: (sql) => target.exec(sql) }, source,
          { migrateSessions: false, authTarget: "local", syncAuthConfig: false, onBatchStart: (label) => events.push(label) });
        output.events = events;
        output.rows = {};
        for (const [schema, table] of [...userTables, ...authTables]) {
          output.rows[`${schema}.${table}`] = (await target.query(`SELECT * FROM "${schema}"."${table}"`)).rows;
        }
        output.metadata = (await target.query("SELECT to_regclass('supabase_migrations.schema_migrations') AS history, to_regclass('supabase_migrations.seed_files') AS seeds")).rows[0];
        if (command === "replay-existing-history") {
          output.targetHistory = (await target.query("SELECT * FROM supabase_migrations.schema_migrations")).rows;
          output.targetSeeds = (await target.query("SELECT * FROM supabase_migrations.seed_files")).rows;
        }
        output.pending = (await target.query("SELECT to_regclass('public.pending_rows') AS name")).rows[0];
        output.nextProject = (await target.query("INSERT INTO public.z_projects (owner_id, name) VALUES ('00000000-0000-4000-8000-000000000001', 'next') RETURNING id")).rows[0].id;
        output.nextRecord = (await target.query("INSERT INTO public.a_records (project_id, payload) VALUES (201, '{}') RETURNING id, doubled")).rows[0];
        output.nextLookalikes = {};
        for (const [schema, table] of userTables.slice(2)) {
          output.nextLookalikes[`${schema}.${table}`] = (await target.query(`INSERT INTO "${schema}"."${table}" (note) VALUES ('next') RETURNING id`)).rows[0].id;
        }
      } finally { await target.close(); }
    }
    console.log(`RESULT:${JSON.stringify(output)}`);
  } else throw new Error(`Unknown command: ${command}`);
} finally { await app.connection.close(); }
