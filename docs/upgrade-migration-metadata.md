# Exclude migration metadata from application-data export

## Reproduction

With the unmodified `@supabase/lite` 0.11.0 CLI, a PGlite project containing an applied migration fails:

```sh
lite --no-telemetry upgrade --target local --dry-run --no-migrate-sessions
```

Readiness passes, but the application-data phase tries to insert the source row from `supabase_migrations.schema_migrations`. The in-memory rehearsal target has no such table, so PostgreSQL reports:

```text
[data] supabase_migrations.schema_migrations row 1/1
relation "supabase_migrations.schema_migrations" does not exist
```

A populated `supabase_migrations.seed_files` table produces the same failure. On a real Supabase target, its migration metadata should not be treated as application rows either.

The exporter filters known system schemas, but does not exclude these two metadata tables. PGlite's postprocessed inventory exposes them with separate `schema` and `name` fields. SQLite's inventory already hides the migration schema, which masks this problem for SQLite sources.

## Change

`src/upgrade/migration-metadata.ts` identifies only these two exact pairs:

- `supabase_migrations.schema_migrations`
- `supabase_migrations.seed_files`

The predicate is applied to the existing application-table filter before dependency ordering, row reads and sequence-reset generation. It does not filter by prefix, unqualified name, or the whole `supabase_migrations` schema.

Recorded migration SQL remains authoritative. The source collector still reads the history table, replays its stored statements in version order, and appends pending migration files. Edited or missing copies of applied files remain supported. This change does not copy, rewrite or delete source history, nor add migration-history synchronization with the destination.

The shared exporter is used by both the in-memory rehearsal and the actual upgrade runner. JSON dry-run reporting is unchanged by this branch.

## Integration with the published distribution

The repository contains the published JavaScript artifact, not the original upstream implementation. `scripts/prepare-upgrade-history.mjs` verifies the complete baseline and prepares a separate candidate under `.generated/upgrade-history/`.

`patch-upgrade-history.mjs` requires the exact CLI SHA-256 and exactly one expected table-filter anchor. It adds an import of the compiled, readable TypeScript predicate and one filter condition. The 77 vendored files remain unchanged. Upstreaming against the original source requires adding this predicate at the corresponding user-data export filter; the bundled variable names are not a source-level API.

## Verification

```sh
npm ci
npm test
```

The suite includes:

- Exact table-identity and case-sensitive boundary tests
- Rejection of modified and already-patched bundles
- Real migration and human-readable upgrade CLI subprocesses against SQLite/Postgres-shim and PGlite sources
- The original PGlite failure for both populated metadata tables, followed by successful candidate rehearsal
- Preservation of recorded SQL with edited and missing applied files, plus a pending migration
- Unchanged application inserts and sequence resets compared with the baseline exporter
- Same-name application tables in `public` and `archive`, plus a similarly named schema
- A PGlite application table inside `supabase_migrations`, which remains included
- Real shared-runner replay into in-memory PGlite: auth users/identities, foreign-key ordering, nested JSONB, generated columns, preserved values and successful next generated IDs
- Preservation of existing destination history and seed records, including native PostgreSQL statement arrays
- Source snapshots covering application rows, auth rows, history and seed metadata, sequences, and config
- The baseline SDK smoke tests for Node SQLite, libSQL and PGlite

Internal exporter/runner assertions use a test-only bridge derived from the exact validated CLI bytes. Only its entry point is replaced with exports; the tested exporter, migration collector and runner are the shipped implementations plus the candidate filter. Real CLI tests run the normal entry point separately.

SQLite's existing inventory omits every table under `supabase_migrations`, including custom tables. This focused change leaves that behavior intact; the suite explicitly records the limitation rather than claiming such data is preserved from a SQLite source. Use an application schema for application tables. PGlite does expose the schema, so the narrower predicate preserves unrelated tables there.

These tests do not provision a Docker-backed or hosted Supabase target. In-memory PGlite validates replay and the shared runner, not target provisioning, network behavior or destination platform services.
