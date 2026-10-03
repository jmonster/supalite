import test from "node:test";
import assert from "node:assert/strict";
import { readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { isUpgradeMigrationMetadata } from "../dist/upgrade/migration-metadata.js";
import { patchUpgradeHistory, originalFilter } from "../scripts/patch-upgrade-history.mjs";
import { appliedFile, dryRun, fixture, root, worker } from "./helpers/upgrade-history.mjs";

const expectedTables = ["public.z_projects", "public.a_records", "public.schema_migrations", "public.seed_files", "archive.schema_migrations", "archive.seed_files", "supabase_migrations.application_rows", "supabase_migrations_archive.schema_migrations"].sort();

test("migration metadata matches exact schema/table pairs only", () => {
  for (const name of ["schema_migrations", "seed_files"]) {
    assert.equal(isUpgradeMigrationMetadata({ schema: "supabase_migrations", name }), true);
    for (const schema of [undefined, null, "", "main", "public", "archive", "supabase_migrations_archive", "Supabase_migrations"])
      assert.equal(isUpgradeMigrationMetadata({ schema, name }), false, `${schema}.${name}`);
  }
  for (const name of ["application_rows", "migrations", "schema_migrations_backup", "schema_migrations.seed_files", "Schema_migrations", "Seed_files"])
    assert.equal(isUpgradeMigrationMetadata({ schema: "supabase_migrations", name }), false, name);
  assert.equal(isUpgradeMigrationMetadata({ schema: "public", name: "supabase_migrations.schema_migrations" }), false);
});

test("artifact integration rejects modified or already patched distributions", async () => {
  const source = await readFile(resolve(root, "upstream/lite-0.11.0/dist/cli/index.js"), "utf8");
  assert.equal(source.split(originalFilter).length - 1, 1);
  const patched = patchUpgradeHistory(source);
  assert.match(patched, /!isUpgradeMigrationMetadata\(a\)/);
  assert.throws(() => patchUpgradeHistory(source + "\n"), /unrecognized/);
  assert.throws(() => patchUpgradeHistory(source.replace(originalFilter, "[]")), /unrecognized/);
  assert.throws(() => patchUpgradeHistory(patched), /unrecognized/);
});

for (const backend of ["sqlite-postgres", "pglite"]) {
  test(`${backend}: real CLI excludes metadata and preserves the existing application-data boundary`, async (t) => {
    const project = await fixture(t, backend);
    const initial = await worker(project, "snapshot");
    // The stock SQLite inventory hides the entire migration schema before
    // this exporter runs. This focused fix does not change that inventory.
    const exportedTables = expectedTables.filter((table) => backend !== "sqlite-postgres" || table !== "supabase_migrations.application_rows");
    const baseline = await dryRun(project, "baseline");
    assert.equal(baseline.code, backend === "pglite" ? 1 : 0, baseline.stdout + baseline.stderr);
    if (backend === "pglite") {
      assert.match(baseline.stdout, /\[data\] supabase_migrations.schema_migrations row 1\/1/);
      assert.match(baseline.stdout, /\[data\] supabase_migrations.seed_files row 1\/1/);
      assert.match(baseline.stdout, /relation "supabase_migrations.schema_migrations" does not exist/);
    }
    assert.deepEqual(await worker(project, "snapshot"), initial, "stock dry-run must not change source state");

    // The recorded migration must remain authoritative even if its mirror has
    // changed. Pending migration files must still be included afterward.
    await writeFile(resolve(project, appliedFile), "SELECT 1 / 0; -- ignored edited mirror\n");
    await writeFile(resolve(project, "supabase/migrations/20260102000000_pending.sql"), "CREATE TABLE public.pending_rows (id integer PRIMARY KEY);\n");
    const fixed = await dryRun(project);
    assert.equal(fixed.code, 0, fixed.stdout + fixed.stderr);
    assert.ok(fixed.stdout.includes(`auth: 2 inserts  data: ${exportedTables.length} inserts`), fixed.stdout);
    assert.match(fixed.stdout, /rehearsal passed/);
    assert.doesNotMatch(fixed.stdout, /\[data\] supabase_migrations\.(schema_migrations|seed_files)/);
    assert.deepEqual(await worker(project, "snapshot"), initial, "candidate dry-run must not change rows, metadata, source sequences or config");

    const inspected = await worker(project, "inspect");
    assert.deepEqual(inspected.data.map((table) => `${table.schema}.${table.table}`).sort(), exportedTables);
    const baselineExport = await worker(project, "inspect", "baseline");
    assert.deepEqual(inspected.data, baselineExport.data.filter((table) => !isUpgradeMigrationMetadata({ schema: table.schema, name: table.table })), "application rows and sequence resets must be unchanged");
    assert.ok(inspected.source.sql.includes("CREATE TABLE public.z_projects"));
    assert.ok(inspected.source.sql.includes("CREATE TABLE public.pending_rows"));
    assert.ok(!inspected.source.sql.includes("SELECT 1 / 0"));
    assert.equal(inspected.source.files.length, 2);
    assert.ok(inspected.data.findIndex((table) => table.table === "z_projects") < inspected.data.findIndex((table) => table.table === "a_records"));
    assert.ok(inspected.data.every((table) => table.sequenceResets.length === 1));
    assert.ok(!inspected.data.find((table) => table.table === "a_records").inserts[0].includes('"doubled"'));

    // Removing the mirror entirely must preserve the same recorded SQL.
    await rm(resolve(project, appliedFile));
    const replay = await worker(project, "replay");
    assert.deepEqual(replay.source, inspected.source);
    assert.deepEqual(replay.metadata, { history: null, seeds: null });
    assert.equal(replay.pending.name, "pending_rows");
    assert.equal(replay.result.auth.users, 1);
    assert.equal(replay.result.auth.identities, 1);
    assert.equal(replay.rows["auth.users"][0].email, "upgrade-fixture@example.invalid");
    assert.equal(replay.rows["auth.identities"].length, 1);
    assert.deepEqual(replay.rows["auth.audit_log_entries"], [], "audit rows stay outside the application data phase");
    assert.deepEqual(replay.rows["public.a_records"], [{ id: 2000, project_id: 200, payload: { nested: { value: "kept" }, array: [1, true, null] }, doubled: 4000 }]);
    for (const table of exportedTables.filter((table) => !["public.z_projects", "public.a_records"].includes(table))) {
      assert.deepEqual(replay.rows[table], [{ id: 42, note: `${table} user data` }]);
      assert.equal(replay.nextLookalikes[table], 43);
    }
    if (backend === "sqlite-postgres") {
      assert.deepEqual(replay.rows["supabase_migrations.application_rows"], [], "existing SQLite inventory omission is unchanged");
      assert.equal(replay.nextLookalikes["supabase_migrations.application_rows"], 1);
    }
    assert.equal(replay.nextProject, 201);
    assert.deepEqual(replay.nextRecord, { id: 2001, doubled: 4002 });
    const lastInsert = Math.max(...replay.events.map((label, index) => label.startsWith("Migrating ") ? index : -1));
    const firstReset = replay.events.findIndex((label) => label.startsWith("Resetting "));
    assert.ok(firstReset > lastInsert, "all data rows must precede sequence resets");
    const existingHistory = await worker(project, "replay-existing-history");
    assert.deepEqual(existingHistory.targetHistory, [{ version: "20260101000000", statements: ["SELECT 42"], name: "target-owned" }]);
    assert.deepEqual(existingHistory.targetSeeds, [{ path: "./seed.sql", hash: "target-owned-hash" }]);
    assert.deepEqual(existingHistory.data, inspected.data);
    assert.deepEqual(await worker(project, "snapshot"), initial, "export and replay must not alter source state");
  });
}
