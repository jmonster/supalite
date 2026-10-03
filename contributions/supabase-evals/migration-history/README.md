# Shared migration history for Supabase Evals

An upstream-targeted patch for [supabase/evals](https://github.com/supabase/evals),
not a change to the Supalite runtime. It applies to commit
`10790e7fef8788c16c80697a16682d5ebbeb76c3` (verified upstream `main` on 2026-10-03).
No upstream pull request is associated with this patch.

## Problem

`packages/platform-lite` records HTTP migrations in `project.migrations`, while
CLI `db push` and `migration repair` use the project's real
`supabase_migrations.schema_migrations` table. Consequently, either interface can
report history that omits work performed through the other. This is an eval
harness fidelity issue; it does not describe hosted Supabase database corruption.

## Patch

- Provision the CLI-compatible history schema and remove the independent array
- Read HTTP history from the table, ordered by version, omitting null names
- Apply SQL and its history row in a PGlite transaction; retain complete SQL and
  optional rollback metadata without executing rollback SQL
- Serialize concurrent HTTP applies and allocate unused 14-digit versions,
  including collisions with CLI history and midnight rollover
- Reject explicit transaction-control statements using the PostgreSQL parser;
  run original SQL with consistent string-literal rules, preserving SELECT INTO,
  nested comments, and dollar-quoted function bodies
- Add HTTP and wire-protocol regression coverage within the existing test suite

The only dependency declaration adds `pgsql-parser@17.9.15`, the version already
present transitively through the pinned `@supabase/lite@0.10.0`. No new dependency
version, workflow, or CI service is introduced.

## Apply and test

Requires Node.js 24 and pnpm 10.24.0. Set `PATCH_DIR` to this directory's absolute
path, then run in a separate checkout:

```sh
PATCH_DIR=/absolute/path/to/contributions/supabase-evals/migration-history
git clone https://github.com/supabase/evals.git evals-migration-history
cd evals-migration-history
git checkout 10790e7fef8788c16c80697a16682d5ebbeb76c3
git apply --check "$PATCH_DIR/platform-lite-shared-migration-history.patch"
git apply "$PATCH_DIR/platform-lite-shared-migration-history.patch"
pnpm install --filter @supabase-evals/platform-lite --frozen-lockfile --ignore-scripts
pnpm --filter @supabase-evals/platform-lite typecheck
pnpm --filter @supabase-evals/platform-lite test --maxWorkers=1
```

The single-worker option controls local memory use; it does not change tests or
add CI configuration. Default parallel execution exceeded this test machine's
memory on unmodified upstream as well.

## Optional real CLI round trip

Install the official Supabase CLI version **2.117.0**, matching the evals pin.
The standalone verifier creates temporary synthetic projects, binds PGlite only
to loopback, disables CLI telemetry using the official controls, and deletes its
temporary CLI working directory after the check. It does not need Docker, a
Supabase login, or a hosted project.

From the patched checkout's `packages/platform-lite` directory:

```sh
SUPABASE_CLI_BIN=/absolute/path/to/supabase \
  node --import tsx "$PATCH_DIR/cli-roundtrip.mts"
```

This verifies CLI push → HTTP list, HTTP apply → CLI list, a no-op second push,
CLI repair → HTTP list, shared SQL metadata, and isolation from another project.
The script asserts the pinned CLI version and exits unsuccessfully on a mismatch.

## Validation

See [VALIDATION.md](VALIDATION.md) for the tested baseline, final results and
scope. [source.json](source.json) records provenance and the patch's file manifest;
[SHA256SUMS](SHA256SUMS) records artifact checksums.

## Boundaries

- History is durable within each project's database, not across platform restarts;
  platform-lite projects still use in-memory PGlite
- Finish wire/CLI transactions before using HTTP on the same project; overlapping
  HTTP/wire transactions remain unsupported by the existing shared-session bridge
- Explicit transaction-control statements, including savepoints, are rejected in
  HTTP migration SQL to keep schema changes and history atomic
- Idempotency-Key execution/replay behavior is unchanged and is not claimed fixed
- Existing HTTP 201 with `{ version, name? }` is retained; broader API parity is
  outside this patch

## License and provenance

The patch contains modified source and context from Supabase Evals, licensed under
Apache-2.0. The exact upstream [license](https://github.com/supabase/evals/blob/10790e7fef8788c16c80697a16682d5ebbeb76c3/LICENSE)
is preserved in [LICENSE.upstream](LICENSE.upstream). No upstream NOTICE file was
present at the pinned commit. The patch identifies all modified files; existing
notices are preserved. New patch material and this contribution's documentation
and verifier are provided under Apache-2.0.
