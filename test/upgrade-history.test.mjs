import test from "node:test";
import assert from "node:assert/strict";
import { exportUserData } from "../upstream/lite-0.11.0/dist/cli/index.js";
import { createHarness } from "./helpers/lite.mjs";

const userTables = [
  ["public", "schema_migrations"],
  ["public", "seed_files"],
  ["archive", "schema_migrations"],
  ["archive", "seed_files"],
  ["supabase_migrations", "application_rows"],
  ["supabase_migrations", "schema_migrations_backup"],
  ["supabase_migrations", "seed_files_backup"],
  ["supabase_migrations", "Schema_migrations"],
  ["supabase_migrations", "Seed_files"],
  ["supabase_migrations_archive", "schema_migrations"],
  ["Supabase_migrations", "schema_migrations"],
  ["public", "supabase_migrations.schema_migrations"],
];
const qualified = ([schema, table]) => `"${schema}"."${table}"`;
const tableKey = ([schema, table]) => `${schema}.${table}`;

test("PGlite upgrade export excludes only the two internal migration tables", async t => {
  const { app, connection, close } = await createHarness({ backend: "pglite" });
  t.after(close);
  const sql = [
    ...[...new Set(userTables.map(([schema]) => schema))]
      .map(schema => `CREATE SCHEMA IF NOT EXISTS "${schema}";`),
    ...userTables.map(table =>
      `CREATE TABLE ${qualified(table)} (id serial PRIMARY KEY, note text NOT NULL);`),
  ].join("\n");
  await connection.exec(sql);
  await connection.exec(`
    CREATE TABLE supabase_migrations.schema_migrations (
      version text PRIMARY KEY, statements text[], name text
    );
    CREATE TABLE supabase_migrations.seed_files (path text PRIMARY KEY, hash text);
    INSERT INTO supabase_migrations.schema_migrations
      VALUES ('20260101000000', ARRAY['SELECT 1'], 'applied');
    INSERT INTO supabase_migrations.seed_files VALUES ('./seed.sql', 'source-hash');
  `);
  for (const table of userTables) {
    await connection.exec(`INSERT INTO ${qualified(table)} VALUES (42, 'kept');`);
  }

  // Check the real inventory exposes both metadata tables before the export filter.
  const inventory = (await connection.introspect()).tables;
  for (const name of ["schema_migrations", "seed_files"]) {
    assert.ok(inventory.some(table => table.schema === "supabase_migrations" && table.name === name));
  }
  const exported = await exportUserData(app, { sql });
  assert.deepEqual(
    exported.map(({ schema, table }) => tableKey([schema, table])).sort(),
    userTables.map(tableKey).sort(),
  );

  // Reuse this fixture for replay: empty application tables, remove metadata,
  // then verify exported rows and ordinary serial resets still work.
  await connection.exec(`
    TRUNCATE ${userTables.map(qualified).join(", ")} RESTART IDENTITY;
    DROP TABLE supabase_migrations.schema_migrations, supabase_migrations.seed_files;
  `);
  for (const { schema, table, inserts, sequenceResets } of exported) {
    assert.equal(inserts.length, 1, `${schema}.${table} row export`);
    assert.equal(sequenceResets.length, 1, `${schema}.${table} serial reset`);
    for (const statement of [...inserts, ...sequenceResets]) await connection.exec(statement);
  }
  for (const table of userTables) {
    const name = qualified(table);
    assert.deepEqual((await connection.exec(`SELECT * FROM ${name}`)).rows,
      [{ id: 42, note: "kept" }], `${tableKey(table)} rows`);
    assert.deepEqual((await connection.exec(`INSERT INTO ${name} (note) VALUES ('next') RETURNING id`)).rows,
      [{ id: 43 }], `${tableKey(table)} next serial value`);
  }
});
