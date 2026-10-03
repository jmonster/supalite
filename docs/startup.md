# Node startup and prepared DDL

An opt-in, exact-input translation artifact avoids starting the PostgreSQL parser when provisioning a known fresh Node SQLite sandbox. The ordinary Lite path remains unchanged. This is a small helper around the published `translation.translateDdl` and `SqliteConnection.serializeDeparseInfo` APIs; no published JavaScript is patched.

## Reproduce

```sh
npm ci
npm test
npm run benchmark:startup
```

Requires Node 24+. The benchmark verifies the unmodified 0.11.0 distribution, prepares two translations for one synthetic task tracker, then writes `.generated/startup.json`. Override the report, process count, or worker budget with:

```sh
npm run benchmark:startup -- --samples=5 --budget-ms=30000 --output=.generated/startup.json
```

The fixture has two projects, 200 tasks, two owners, a foreign key, an index, JSONB metadata, timestamp defaults, owner RLS, and a SELECT-only custom role. Auth is enabled; storage and Studio are disabled. Every process verifies the complete authenticated 80-row result, exact count, JSON decoding, and foreign-key embed. After timing, it also verifies anonymous denial, denied cross-owner insert/update, permitted own insert/delete, and the custom role's read/write boundary. All requests use ordinary `supabase-js` and `app.fetch(new Request(...))`, never the privileged internal client.

## Helper contract

`src/checked-ddl-translator.mjs` provides `translationRecord()` and `createCheckedDdlTranslator()`. `scripts/prepare-startup.mjs` is a runnable example of collecting translations from a disposable build database; the runtime integration is in `scripts/startup/worker.mjs`.

- The cache key contains exact SQL and all JSON-safe translator options, including strictness and live introspection. SQL is never normalized. Additional options, changed schemas, policies, search paths, or changed SQL cause a miss
- The example's runtime fingerprint covers the actual Lite core bundle, lockfile bytes, Node version, and SQLite version. The lockfile identifies the dependency graph; it does not authenticate arbitrary installed dependency files
- The artifact preserves the published serializer's complete persisted metadata: RLS policies and roles, enums, variables, typed schema, constraints, and comments. Returning SQLite SQL alone would lose essential runtime semantics
- Records are copied into the helper and each call receives an independent deep clone. Concurrent callers cannot mutate each other's policy/type metadata
- A mismatch, corrupt record, or unsupported input fails closed with a rebuild error. There is deliberately no automatic fallback or partially restored metadata. Rebuild for the new schema/runtime, or explicitly choose ordinary live translation instead
- Treat generated artifacts as trusted application code. SHA-256 detects accidental drift/corruption, not a malicious party able to replace both an artifact and its hashes

This example targets the exact fresh-database provisioning sequence. It is not a general migration cache, a SQL-function compiler, or proof that all PostgreSQL schemas are compatible. Lite's existing `db translate --deparse` and runtime metadata-cache facilities already support other build/runtime workflows; this helper adds a checked public-hook example and a differential startup measurement.

## Measurement boundaries

Each observation starts a fresh Node process and in-memory SQLite database. Import, create, system-schema, user-schema, seed, client/JWT setup, first request, and five same-process warm requests are separated. The import timer starts before dynamic Lite/adapter/SDK imports. Prepared mode includes reading/validating the artifact and fingerprinting the runtime in its measured startup. The parent's spawn-to-verified-response measurement also includes Node bootstrap, the fixture/built-in imports, assertion work, SQLite version lookup, and IPC delivery.

Five observations per configuration are interleaved in rotating order. An additional initial no-cache process and empty-compile-cache population process are retained separately. No filesystem or OS cache is flushed: “fresh process” does not mean cold disk, container launch, package installation, or remote provisioning. Warm request samples share their process/database and are not 25 independent startup observations.

The baseline and prepared-DDL configurations both disable Node's compile cache. A third arm reuses Node's supported on-disk compile cache with ordinary live translation. Cache population and build-time DDL preparation are excluded from subsequent-launch timings and must not be advertised as free first-launch work. Node documents that cache population may slow the first launch and that reuse is version-sensitive: [module compile cache](https://nodejs.org/api/module.html#module-compile-cache).

A parent process enforces the total worker budget and can kill a synchronous SQLite hang. Failed/timed-out runs write `complete: false` and exit nonzero; partial observations are never summarized as a complete benchmark. Package verification, translation preparation, report I/O, and final footprint enumeration are outside the enforced child-execution budget. No performance thresholds are added to tests or CI.

RSS is the worker's process-wide resident-memory snapshot at each stage, including Node, parser/SQLite memory, and JIT activity. It is not JavaScript heap size or a steady-state concurrency/capacity estimate. Maximum RSS and CPU usage through the first response are also retained. Background compilation and shared-host contention can materially change these observations.

## Recorded run

The complete raw report is [`reports/startup-node24.json`](../reports/startup-node24.json). Recorded 2026-10-03 20:00:03–20:00:12 UTC, Node 24.19.0, SQLite 3.53.3, Linux x64, AMD EPYC 9V74, nine available processors. Host load average was 2.79 at the start and 2.65 at the end; this was a shared machine, not isolated hardware. All 17 processes completed in 8.58 seconds.

Five-sample medians (ranges retained in the report):

| Observation | Live translation | Prepared DDL | Live + reused compile cache |
| --- | ---: | ---: | ---: |
| Imports | 157.71 ms | 166.15 ms | 119.13 ms |
| Import → schemas ready | 221.74 ms | 199.04 ms | 179.05 ms |
| Import → first response | 274.42 ms | 250.31 ms | 227.22 ms |
| Spawn → verified response | 326.79 ms | 302.76 ms | 277.17 ms |
| Warm request | 4.21 ms | 3.47 ms | 4.18 ms |
| First-response RSS | 311.68 MiB | 84.79 MiB | 328.54 MiB |

First-response RSS ranges were 286.41–328.27 MiB for live translation and 77.32–86.10 MiB for prepared DDL. Timing ranges overlap, and five observations do not establish a general latency guarantee. The robust finding in this fixture is avoiding parser initialization and its resident-memory growth, not eliminating Lite's substantial import cost. An exploratory memory trace saw approximately 128 MiB of external WASM memory appear at system-schema translation; skipping both known translations through the supported hook avoided that initialization.

Footprints are logical uncompressed file bytes, not allocated filesystem blocks or deployment/network bundle sizes:

- Prepared translation JSON: 68,836 bytes; helper: 3,596 bytes
- Reused Node compile cache: 1,437,728 bytes across 406 files
- Published Lite package: 4,317,275 bytes across 77 files
- Core and Node adapter entries: 554,043 bytes, excluding all dependency code
- Clean installed harness dependency tree: 145,495,480 bytes, including other adapters and their dependencies; no installation-size reduction is claimed

The preparation process took 238 ms for this run (excluding its Node bootstrap). Its one-time parser work and memory use are moved to build time, not removed from the total lifecycle. Cache artifacts are generated from the pinned package/fixture and excluded from version control. The helper does not strip installed dependencies or promise a smaller browser/Cloudflare/Bun deployment.
