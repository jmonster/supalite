# Upgrade to Supabase

This document describes the current `lite upgrade` behavior. It is intended for both users and LLM agents working on the upgrade path.

Supalite is designed as a lightweight starting point with a path to full Supabase. The upgrade command exports the local Supalite project, rehearses it against Postgres-compatible execution, and applies it to a Supabase target.

## Quick Start

Hosted Supabase is the default target:

```bash
lite upgrade
lite upgrade --target hosted
```

Use `--dry-run` first to check readiness and rehearse the generated SQL without creating or changing a Supabase target:

```bash
lite upgrade --dry-run
```

Use `--force` to skip the interactive confirmation:

```bash
lite upgrade --force
```

## Migration requirement

`lite upgrade` replays Postgres migration SQL in recorded history order, then pending files from `supabase/migrations/` in filename order. Recorded history is authoritative for applied versions, so migration-only projects do not need filesystem mirrors. It does not apply `supabase/schemas/*.sql` directly.

If your project only uses declarative schemas, generate and review a migration first:

```bash
lite db diff -f prepare_upgrade
lite upgrade --dry-run
```

The bare `sqlite` driver stores native SQL in `supabase/sqlite-migrations/`. That SQL cannot run on Supabase, so those projects must move to Postgres-compatible migrations before upgrade.

Write generated credentials to a JSON file:

```bash
lite upgrade --force --dump-credentials ./supabase-credentials.json
```

## Targets

### Hosted Supabase

`--target hosted` is the default. It creates a new hosted Supabase project through the Supabase Management API, waits for it to become healthy, applies schema/auth/data, fetches API keys, and prints the new project details.

Relevant options:

```bash
lite upgrade \
  --target hosted \
  --org-id <organization-id-or-slug> \
  --region <region-key> \
  --project-name <name> \
  --supabase-token <personal-access-token>
```

If `--supabase-token` is omitted, `SUPABASE_ACCESS_TOKEN` is used. If required hosted values are omitted in an interactive shell, the CLI prompts for them.

Only `--mode user` is currently supported. `--mode platform` is reserved for future work.

### Local Supabase

`--target local` upgrades into a local Supabase CLI workdir. By default, the workdir is the current directory, so the command rewrites `./supabase/config.toml` in place: it strips the Supalite-only `[db].driver`/`[db].url` keys and repoints the file at the Supabase CLI stack. This breaks `bun run dev` (the Supalite Vite plugin) until the config is restored.

To prevent data loss, the original Supalite config is first backed up to `./supabase/config.toml.bak`, and the upgrade report prints how to restore it. Restore supalite dev with:

```bash
cp supabase/config.toml.bak supabase/config.toml   # or: git checkout supabase/config.toml
```

```bash
lite upgrade --target local --force --no-migrate-sessions
```

Use `--local-dir` to put the Supabase CLI workdir somewhere else and avoid touching the project's `supabase/config.toml` entirely:

```bash
lite upgrade \
  --target local \
  --local-dir ../my-local-supabase \
  --force \
  --no-migrate-sessions
```

The local target uses the Supabase CLI through `bunx supabase@2.98.1` by default. Override the executable with `LITE_SUPABASE_CLI` if needed.

Local target behavior:

- Starts a disposable-style local Supabase stack with deterministic generated config.
- Removes Supalite-only database config keys such as `[db].driver` and `[db].url` before starting Supabase CLI.
- Pins `db.major_version = 15`.
- Enables Studio for inspecting the upgraded local project.
- Disables services that are not needed for upgrade verification, including mailpit, realtime, storage, imgproxy, edge runtime, analytics/logflare/vector, and supavisor.
- Parses `supabase status -o json` for API URL, DB URL, anon key, service role key, and JWT secret.
- Applies schema/auth/data directly to the local Postgres database.
- Leaves the local Supabase stack running after a successful CLI upgrade.

Stop a local target manually with:

```bash
bunx supabase@2.98.1 stop --workdir <local-dir> --no-backup
```

To rerun a local upgrade cleanly in the same workdir, stop the stack and remove Supabase CLI runtime state before running the upgrade again:

```bash
cd <project-dir>
bunx supabase@2.98.1 stop --workdir . --no-backup
rm -rf supabase/.branches supabase/.temp
lite upgrade --target local --force --no-migrate-sessions
```

The `supabase/config.toml.bak` created on the first in-place run is preserved across reruns (it is never overwritten by the already-sanitized config), so the original Supalite config stays recoverable.

If the local target uses a separate directory, clean that directory instead:

```bash
bunx supabase@2.98.1 stop --workdir <local-dir> --no-backup
rm -rf <local-dir>/supabase/.branches <local-dir>/supabase/.temp
lite upgrade --target local --local-dir <local-dir> --force --no-migrate-sessions
```

After a successful rerun, verify the database directly before relying on Studio:

```bash
bunx supabase@2.98.1 status --workdir <local-dir-or-project-dir> -o json
psql '<DB URL from status>' -c '\dt public.*'
psql '<DB URL from status>' -c 'select * from public.<table>;'
```

## What Gets Migrated

The shared upgrade runner applies statements in this order:

1. Applied Postgres migration SQL in recorded history order, followed by pending files from `supabase/migrations/` in filename order.
2. `auth.users`.
3. `auth.identities`.
4. Optional hosted session rows, when session migration is enabled.
5. Optional hosted refresh token rows, when session migration is enabled.
6. User table data, in foreign-key-safe order.
7. Sequence resets after all migrated user data has been inserted.
8. Hosted auth config sync, when supported by the target.

User data migration emits inserts for application tables and resets serial or bigserial sequences after explicit migrated IDs. This avoids the common post-upgrade problem where the next insert collides with migrated primary keys.

Recorded rows in `supabase_migrations.schema_migrations` are authoritative for applied versions. `lite upgrade` therefore works when applied migration files were edited or removed; it ignores those filesystem copies and replays the recorded SQL. Pending files remain part of the upgrade source so declarative projects can continue to generate a reviewed migration with `lite db diff -f prepare_upgrade` before upgrading.

## Session Migration

Hosted upgrades can preserve existing Supalite sessions by importing `auth.jwt_secret` as a Supabase HS256 signing key and migrating session and refresh token rows:

```bash
lite upgrade --migrate-sessions
```

If `auth.jwt_secret` is missing, hosted session migration fails and the CLI asks you to rerun with `--no-migrate-sessions`.

Weak JWT secrets are blocked non-interactively unless explicitly allowed:

```bash
lite upgrade --migrate-sessions --allow-weak-jwt-secret
```

Use this only when preserving sessions is more important than rotating a weak development secret. If sessions are not migrated, existing tokens become invalid and users must sign in again.

Local Supabase target does not support preserving sessions yet. Run local upgrades with:

```bash
lite upgrade --target local --no-migrate-sessions
```

## Auth Config

Hosted upgrades map supported Supalite auth settings to Supabase Management API auth config and apply them after schema/auth/data migration.

Local upgrades do not call Management API config endpoints. Instead, supported local Supabase CLI config values are written before the local stack starts. This currently covers settings such as API max rows, auth site URL, redirect URLs, JWT expiry, signup flags, anonymous sign-ins, minimum password length, and email confirmation behavior.

## Rehearsal and Readiness

Every non-dry-run upgrade performs:

1. Readiness checks.
2. An in-memory PGlite rehearsal.
3. The real target upgrade only if rehearsal succeeds.

`--dry-run` runs readiness and rehearsal only:

```bash
lite upgrade --dry-run
```

Rehearsal creates Supabase-compatible roles and the packaged Auth base schema before it applies project migrations. It then exercises the Auth and application data inserts against a Postgres-compatible engine.

## Known Gaps

Storage migration is not implemented. If storage is enabled, the command warns but continues with database and auth migration.

Realtime config migration is not implemented. If realtime is enabled, the command warns but continues.

Local target does not preserve sessions or JWT secret. Users must re-authenticate after local target migration.

Local Supabase is not a valid `SupabaseManagementApi` endpoint. A local CLI stack exposes API URL, DB URL, keys, and JWT secret through `supabase status`; it does not expose hosted Management API project routes like `/v1/projects/{ref}/database/query`.

Supabox is a better future target for high-fidelity hosted-flow tests, because it runs the local Supabase platform/control-plane and project lifecycle. It should augment, not replace, the faster local Supabase CLI harness.

## Testing the Upgrade Path

Fast focused tests:

```bash
cd app
bun test src/cli/upgrade/*.spec.ts src/cli/commands/cloud/upgrade.cmd.spec.ts test/cli/upgrade/local-supabase-status.test.ts
```

Opt-in Docker test against local Supabase CLI:

```bash
cd app
LITE_LOCAL_SUPABASE_TESTS=1 bun test test/cli/upgrade/local-supabase.test.ts
```

Full default verification:

```bash
cd app && bun test
bun test --recursive
```

The intended next testing layer is a fixture-based upgrade suite:

1. Copy a full Supalite fixture project to a temp directory.
2. Run that fixture's app/e2e tests against Supalite.
3. Run `lite upgrade --target local --local-dir <temp-target> --force --no-migrate-sessions`.
4. Point the same app/e2e tests at the upgraded Supabase API URL and anon key.
5. Assert the same user-visible behavior before and after upgrade.

For hosted-flow fidelity, add a separate opt-in Supabox lane later. That suite should validate the default hosted code path through a local Management API/project lifecycle rather than through the single-project Supabase CLI stack.
