# Bounded Node SQLite upgrades

Native Node SQLite application rows flow directly into target batches of at most 50 rows and 256 KiB of UTF-8 SQL, plus one pending row. An oversized statement runs alone. Readiness and audit also iterate native rows; rehearsal consumes one statement at a time. No temporary SQL export is created.

Only actual Node with native `DatabaseSync` uses this path. Bun, libSQL, PGlite sources and other adapters retain their materializing paths. The existing deserializers, SQL formatter, generated-column handling, sequence resets and migration history are preserved.

## Consistency and failure

Pause source writers for the entire upgrade. Readiness, Auth, rehearsal and apply remain separate passes. Within each application-data pass, table metadata, counts and cursors share one read transaction, in foreign-key order. Slow target writes can prolong SQLite locks or WAL retention.

A caller-owned transaction is borrowed and left open; its connection must remain exclusive and its transaction/data unchanged during consumption. Otherwise the upgrade owns the snapshot and releases it on completion, error or cancellation. Exported row/SQL sequences are one-shot and must be disposed if not fully consumed.

The target is non-atomic: earlier batches survive a later read, formatting or target failure. AbortSignal cancellation closes owned source resources and stops subsequent writes/retries, but cannot retract accepted target requests. CLI spinner cancellation exits 130 for both SIGINT and SIGTERM. Regression tests cover pending requests, delayed telemetry, borrowed transactions and final-progress cancellation.

The bound applies to application row/SQL buffering. The largest row, schema metadata, Auth arrays, diagnostics, SQLite/native and PGlite/WASM memory remain separate costs.

## Verification

[The compact result](../reports/streaming-scale.json) records the historical Node 24.19.0 / PGlite 0.4.5 text/JSON experiment, its workload, reproduction commands and immutable raw-evidence links. It verifies data preservation and incremental transfer, not a speed or deployment-memory improvement.

Current Bun 1.4.2 checks passed 5 supported-path tests and intentionally skipped 41 native-Node cases. These checks do not requalify native streaming. Windows has not been validated; signal tests are POSIX-only.

## Reproduce

Install the pinned dependencies and run the supported suite with Bun:

```sh
bun install --frozen-lockfile
bun run test
```

To include the two official Bun CLI compatibility checks, set `BUN_1_3_11` and `BUN_1_4_2` to those executables. Each verifies help, a real SQLite dry run and legacy-path selection.

The opt-in native benchmark requires actual Node with native `node:sqlite`:

```sh
mkdir -p .generated
node scripts/benchmark-streaming.mjs --quick --heap=1024
```

Omit `--quick` for the 96 MiB fixtures. The CLI control is the pinned npm package; the target-runner control is this implementation’s retained legacy adapter path. New reports go under `.generated/`. The old-space cap is not a deployment-memory limit.

Tests import the tracked CLI and `sqlite-streaming.js` directly; no rewriting or test loader is required.
