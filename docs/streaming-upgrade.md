# Bounded application-data upgrades for Node SQLite

Readiness, shim audit and application-data transfer iterate native SQLite rows. The existing deserializers and SQL formatter feed the target directly, with no temporary SQL export. Target batches contain at most 50 rows and 256 KiB of UTF-8 SQL, plus one pending row; a larger individual statement is sent alone. The existing 50/10/1 retry logic retains only its current batch. Rehearsal consumes one statement at a time.

Only the actual Node runtime with a native `DatabaseSync` uses this path. Its builtin is loaded lazily. Bun, libSQL, PGlite-source and other adapters keep their materializing paths; Bun's `node:sqlite` compatibility shim does not qualify.

## Consistency and progress

Pause source application writes for the entire upgrade when readiness, Auth, rehearsal and apply must agree. They remain separate passes.

Each application-data pass uses one read transaction for table metadata, `COUNT(*)` totals and subsequent cursors. Counts and rows therefore share a snapshot across tables, in foreign-key order. Count queries run before application writes; serialized row data is fetched only as the sink accepts batches. Source availability is required throughout consumption.

A slow target extends the source read snapshot. Rollback-journal writers can be blocked; WAL readers can retain older pages and delay checkpoint reclamation. If a caller already owns a transaction, the pipeline borrows it without committing or rolling it back. The caller must use that connection exclusively and must not mutate data or replace its transaction during the pass. Otherwise the pipeline rolls back its own read transaction afterward.

The internal collector returns counted, one-shot asynchronous sequences. Existing formatting, deserialization, generated-column omission, sequence resets and migration history are retained. Native query/count failure rejects instead of silently omitting a table.

## Failure and cancellation

Cursors close on exhaustion, early return, abort or error. Consumer `finally` blocks release owned snapshots; caller-owned transactions remain untouched.

A read, formatting or target failure can happen after earlier batches were applied. Those rows remain. Cancellation cannot retract a request already accepted by a target; an in-flight request may finish after the client exits. The migration is not atomic.

The apply pipeline propagates an AbortSignal to the source and checks it before and after awaited sinks and retry boundaries. Cancellation releases owned source locks immediately and is not retried or reported as a row error. Upgrade spinners use their existing cancellation hook to abort before the CLI's telemetry-aware exit. That hook supplies no signal name, so both SIGINT and SIGTERM use cancellation status 130. The existing spinner signal hooks are retained. Tests cover delayed telemetry flushing, pending requests, both signals, borrowed transactions and cancellation from final progress callbacks.

## Measurements and limits

The bound concerns application row/SQL buffering. The largest row, schema metadata, Auth arrays, diagnostics, SQLite/native memory and PGlite/WASM database memory remain separate costs. The old-space flag does not cap total JavaScript heap, RSS or deployment RAM.

The recorded synthetic fixtures contain 384 rows/3 MiB or 12,288 rows/96 MiB of highly compressible text/JSON, with no Auth data. Targets are local in-memory PGlite, not hosted services. For the large fixtures, successful comparisons used the same 1 GiB old-space allowance:

| 96 MiB workload | Stock CLI | Direct CLI | Stock apply | Direct apply |
| --- | ---: | ---: | ---: | ---: |
| Text | 7.077 s | 7.546 s | 1.492 s | 1.559 s |
| JSON | 7.185 s | 7.967 s | 1.721 s | 1.787 s |

Stock observations were recorded earlier than the final direct runs. These are single serialized observations with uncontrolled warm caches, not a speed-confidence result. They do not show a successful-stock throughput gain. Direct apply processed about 61.6 MiB/s of text and 53.7 MiB/s of JSON in these runs. Small-workload phase timings can shift when PGlite initializes lazily; whole-pipeline timings are more useful there.

Separately, all four stock 128 MiB old-space invocations exhausted the heap; all direct invocations completed and preserved source/target data. Every direct case recorded zero temporary SQL export bytes. First target writes followed 32 yielded/materialized rows, after the earlier count queries. Process RSS remained roughly 1.0–1.4 GiB; one successful capped run sampled 134.5 MiB of total JavaScript heap. Neither result describes a 128 MiB deployment footprint or proves billing savings.

[Full results](../reports/streaming-scale.json) distinguish wall time, apply time, CPU, observed memory, fixture size and verification. Fixture creation and parent source hashing are outside timings; target whole-process measurements include bounded verification.

## Run

```sh
npm ci
npm test
node upstream/lite-0.11.0/dist/cli/index.js --no-telemetry upgrade --dry-run
```

For a fresh small functional/resource comparison, run `node scripts/benchmark-streaming.mjs --quick --heap=1024`. The CLI control is the pinned npm package. The direct target-runner control is the retained legacy adapter path in this same implementation, not the historical stock exporter. Reports are written under `.generated/`; no code is generated. Full-size runs omit `--quick` and use 96 MiB fixtures. An old-space cap is not a deployment-memory limit.

Optional official Bun regressions:

```sh
BUN_1_3_11=/path/to/bun-1.3.11 BUN_1_4_2=/path/to/bun-1.4.2 npm test
```

Both versions are checked for CLI help, a real SQLite dry run and legacy-path selection. Validation is Linux x64; POSIX signal tests are scoped accordingly. Windows execution has not been validated.

The measurement files above are historical observations from the prior integration with identical streaming behavior, not fresh performance results for this packaging revision. Their recorded hashes identify the artifacts actually measured. Current tests compare the native streaming path with the retained adapter path through normal imports of the same production functions; CLI comparisons run the pinned published package. No new speed improvement is claimed.

## Package integration

The tracked CLI directly imports `sqlite-streaming.js` from its own package directory. The production module exports upgrade operations and guards command dispatch so tests can import the same code without executing a CLI command. Cancellation tests use the production process-exit wrapper with an injected flush callback; normal CLI execution defaults to the existing telemetry flush. No code-rewriting preparation or test loader is required.
