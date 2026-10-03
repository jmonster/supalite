# Validation record

Date: 2026-10-03 UTC

Environment: Linux x64, Node.js 24.19.0, pnpm 10.24.0, locked PGlite 0.4.5,
@supabase/lite 0.10.0, pgsql-parser 17.9.15, Supabase CLI 2.117.0.

## Results

| Check | Result |
| --- | --- |
| Unmodified upstream package suite, one worker | 10 files, 96 tests passed |
| Final regression files against unmodified upstream | 16 failed, 14 passed, 30 tests total |
| Final patched package suite, one worker | 11 files, 122 tests passed |
| Package TypeScript check | Passed |
| Biome checks on changed TypeScript/package files | Passed |
| Frozen-lockfile filtered dependency install | Passed |
| git diff --check | Passed |
| Forward patch applicability to pinned upstream | Passed |
| Reverse patch applicability to final checkout | Passed |
| Real CLI push/list/repeat-push/repair integration | Passed |

The original source already rolls back failed multi-statement SQL; the patch
retains that behavior and adds atomicity when writing the history row fails.
The negative control includes already-passing guards; it is not expected for
all 30 tests to fail on upstream.

The package tests cover schema/history rollback, a rejected history write,
second-resolution concurrent collisions and midnight rollover, existing CLI
versions, optional names and rollback metadata, unchanged SQL text, SELECT INTO,
quoted semicolons and function bodies, nested comments, transaction-control
rejection, a nondefault string-literal setting, malformed requests, wire/API
visibility in both directions, repair deletion, and tenant isolation.

## Real CLI evidence

The manual verifier uses the actual official CLI binary, not a hand-written SQL
substitute. Its local synthetic run established:

1. `db push --skip-vault` applied `20260101000000_from_cli.sql`; HTTP history listed it
2. HTTP apply created `from_http`; `migration list` reported matching local and
   remote versions for both migrations
3. A second `db push --skip-vault` reported the remote database was up to date
4. `migration repair 20260101000000 --status reverted` removed that history row;
   the HTTP list immediately contained only the HTTP migration
5. The SQL history row retained the HTTP SQL, and a second project's history
   remained empty

The checked-in wire-protocol regression is separately labeled and uses the real
socket server with protocol messages. It is not represented as CLI execution.

CLI telemetry was disabled in a temporary test home and both supported process
opt-outs were set. Official documentation:
https://supabase.com/docs/guides/local-development/cli/getting-started#telemetry

The pinned CLI source confirms environment denial precedes exporter setup:
- `apps/cli/src/shared/telemetry/consent.ts`
- `apps/cli/src/telemetry/legacy-analytics.layer.ts`

Source tag `v2.117.0`, commit `21db855916f2c2b12f61cde923a27094b8528b23`:
https://github.com/supabase/cli/tree/21db855916f2c2b12f61cde923a27094b8528b23

## Scope

All package tests ran; the monorepo's agent-backed evaluation experiments,
Docker sandbox end-to-end suite, and unrelated packages were not run. This does
not claim hosted-platform validation, cross-interface concurrent transactions,
process-restart persistence, or idempotent SQL retries. No upstream publishing,
workflow dispatch, or hosted database access was performed.
