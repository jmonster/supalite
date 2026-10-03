# Machine-readable upgrade validation

This contribution aligns `lite upgrade --dry-run --json` with the validation stages used by the human-readable dry run: readiness, the SQLite storage-shim audit, and the existing in-memory PGlite rehearsal.

## Behavior change

The published 0.11.0 documentation is mixed: `README.md` labels JSON mode “machine-readable shim audit output,” while `UPGRADE.md` says dry runs perform readiness and rehearsal, and the CLI describes `--json` as machine-readable dry-run output. In the published implementation, JSON mode returns immediately after the shim audit.

A successful shim audit does not imply successful replay. For example, adding a pending `CHECK` constraint that rejects an existing application's rows produces these results on the same fixture:

| CLI | Exit | `summary.upgrade_safe` | Replay |
| --- | --- | --- | --- |
| Published JSON dry run | 0 | `true` | Not run |
| Published human-readable dry run | 1 | N/A | Data constraint failure |
| This JSON dry run | 1 | `false` | Same data constraint failure |

The candidate keeps the existing audit `summary` counters and `results` fields. It adds:

- `readiness`: the existing readiness report, or `null` if the stage did not return a report
- `rehearsal`: the existing rehearsal report, or `null` if skipped or interrupted
- `errors`: exceptions from a validation stage, each with `phase` and `message`

`summary.upgrade_safe` is now true only when all three stages succeed. Audit counts still describe only the shim audit; a zero `summary.failed` count can accompany a failed rehearsal. Inspect the readiness, rehearsal and exception diagnostics for the reason. Later stages are skipped after a failed stage, matching the human-readable flow.

This intentionally changes exit status for inputs whose shim audit passes but readiness or rehearsal fails. Consumers that previously interpreted JSON mode as an audit-only command should account for the additional validation and runtime. Argument/configuration/migration-source failures that occur before the validation pipeline retain the published CLI's error handling; this does not promise JSON for every possible startup error.

JSON output waits for the stdout write callback before the published CLI exits. This matters when replay failures produce a document larger than the pipe buffer. Reports can contain row samples and SQL with application data; handle them as potentially sensitive diagnostic output.

## Implementation boundary

`src/upgrade/dry-run.ts` contains readable orchestration and output handling. It receives the published CLI's existing readiness, audit and rehearsal functions. It does not implement a second exporter or migration runner.

`scripts/prepare-upgrade.mjs` first verifies the complete 77-file published distribution, then creates a separate generated package. `scripts/patch-upgrade-cli.mjs` checks the exact CLI SHA-256 and a single integration anchor before changing only the JSON branch and adding one import. Changed or already-patched inputs are rejected. The vendored distribution and the generated baseline remain unmodified.

This is a distribution-level integration for a repository that does not contain the original upstream TypeScript implementation. An upstream source port should call the readable helper from the source command handler, without carrying the bundle patch.

## Run the executable regressions

Requires Node.js 24 or newer. Bun, Docker, a hosted account and hosted credentials are not needed for the default suite.

```sh
npm ci
npm test
# Upgrade-only suite:
npm run test:upgrade
```

The fixture uses two synthetic email/password users, owner-private projects and records, a composite foreign key, JSONB values and serial IDs. Child table names sort before parent table names, so successful replay exercises the existing foreign-key ordering rather than relying on alphabetical order.

Default coverage includes:

- A real loopback Lite CLI server with admin mode disabled and the actual supabase-js request/auth path
- Fresh password sign-in, stable user/identity IDs, anonymous and cross-owner isolation, own-row writes, specific RLS/FK rejection diagnostics, JSONB round trips and generated IDs
- The same SDK contract on an independently seeded PGlite fixture, where RLS is native PostgreSQL enforcement
- Real shipped CLI readiness and rehearsal of auth and application rows, including its sequence-reset SQL
- Recorded SQL remaining authoritative after applied files are edited or removed, and pending files replaying in filename order
- Success and failure exit codes, parseable JSON, unchanged human-readable output, unsafe storage diagnostics and large replay-failure output
- A negative control demonstrating the published JSON false-success case
- Source schema, sequence and tracked auth/application/history row snapshots unchanged by dry runs, unchanged source configuration, and no target workdir or config backup created

The independently seeded PGlite contract does not establish that a migration happened. A successful rehearsal executes sequence-reset statements, but does not establish that a real Supabase target subsequently generates correct IDs. That is covered by the separate opt-in lane below.

## Opt-in real local Supabase upgrade

Requires a working Docker daemon and Supabase CLI 2.98.1. The published local runner defaults to `bunx supabase@2.98.1`; use its supported `LITE_SUPABASE_CLI` override to run through npm instead:

```sh
LITE_SUPABASE_CLI="npx --yes supabase@2.98.1" npm run test:upgrade:local
```

This lane:

1. Runs the shared SDK contract against the source fixture
2. Edits the applied migration file to require authoritative recorded history
3. Invokes the unmodified published `lite upgrade --target local --local-dir <disposable-target> --force --no-migrate-sessions`
4. Inspects migrated users/identities, absent sessions/refresh tokens, and enabled native RLS
5. Runs the same SDK contract against the upgraded Supabase API, signing in again and requiring newly generated IDs above migrated high-water marks
6. Stops the disposable stack and removes its temporary credentials file

Only absence of the opt-in flag causes a skip. Once enabled, missing prerequisites or migration failures fail the test. This lane creates a separate local workdir and never selects a hosted target.

The default suite is executable upgrade-rehearsal coverage, not a claim that the real Supabase graduation lane has passed. Run the opt-in lane in a Docker-capable environment before treating full-stack migration as verified.
