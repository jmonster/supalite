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

The apply pipeline propagates an AbortSignal to the source and checks it before and after awaited sinks and retry boundaries. Cancellation releases owned source locks immediately and is not retried or reported as a row error. Upgrade spinners use their existing cancellation hook to abort before the CLI's telemetry-aware exit. That hook supplies no signal name, so both SIGINT and SIGTERM use cancellation status 130. No new process-signal listeners are installed. Tests cover delayed telemetry flushing, pending requests, both signals, borrowed transactions and cancellation from final progress callbacks.

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

## Reproduce

```sh
npm ci
npm test
# Expected stock heap exhaustion, with core dumps disabled on POSIX:
(ulimit -c 0; TMPDIR=/path/to/disk-backed-temp node scripts/benchmark-streaming.mjs --baseline-target)
# Successful stock/direct comparison at the larger allowance:
TMPDIR=/path/to/disk-backed-temp node scripts/benchmark-streaming.mjs --heap=1024
# Smaller 3 MiB functional comparison:
node scripts/benchmark-streaming.mjs --quick --heap=1024
```

Reports are written under `.generated/`. The recorded temporary filesystem was overlay-backed; a system temporary directory may instead use RAM. The generated CLI can be run from a project directory:

```sh
node /absolute/path/to/repository/.generated/streaming/node_modules/@supabase/lite/dist/cli/index.js \
  --no-telemetry upgrade --dry-run
```

Optional official Bun regressions:

```sh
BUN_1_3_11=/path/to/bun-1.3.11 BUN_1_4_2=/path/to/bun-1.4.2 npm test
```

Both versions are checked for CLI help, a real SQLite dry run and legacy-path selection. See [runtime compatibility](../reports/runtime-compatibility.json). Validation is Linux x64; POSIX signal tests are scoped accordingly. Windows execution has not been validated.

## Package integration

The published artifact lacks its original TypeScript. Exact SHA-256 and single-occurrence guards apply this helper to a generated CLI copy; all 77 vendored files remain unchanged. Independently guarded changes must be combined in source rather than applied sequentially to already-patched artifacts.
