# JSONB containment performance

## Reproduce

Requires Node 24 or later:

```sh
npm ci
npm run benchmark
```

The harness compares this checkout with pinned `@supabase/lite@0.11.0` and writes `reports/benchmark.json`. Its 50-second supervisor budget stops blocked workers; failed/timeout reports are incomplete and exit nonzero. Use `node scripts/benchmark.mjs --budget-ms=120000` for slower machines. The budget is a safety limit, not a performance threshold.

## What is measured

Native Node SQLite and local libSQL run one warm-up and three measured executions, checking counts every time. Cases cover 1,000/10,000 documents (~648 bytes, 10% matches), nested objects, same-element matching, 100–5,000-element arrays, depth-16 filters and general-plan pruning. Reports retain medians, samples, engine versions, plan, SQL bytes, parameters, compile time and helper size.

SDK timings include in-process client/request/query/exact-count work, without network. Node SQL timings exclude statement preparation; libSQL includes preparation/driver overhead. The shipped baseline is timed only for correct results. Handwritten SQL assumes the fixture's schema and types.

## Stored-column index measurements

Historical measurements from **2026-10-04** compare the indexed implementation with `46d75c1` on shared Linux x64: Node 24.19.0, SQLite 3.53.3 and local libSQL/SQLite 3.45.1. Both variants had `CREATE INDEX docs_status_idx ON docs ((body->>'status'));`. Of 50,000 documents, 50 matched `{status: 'open'}`. The old predicate scanned; the new one used the index.

Three warm-ups preceded 11 alternating-order samples. Captured SDK SQL was replayed unchanged; every count and sorted ID checksum was verified.

| Selective indexed read | Previous median ms | New median ms |
| --- | ---: | ---: |
| Node prepared SQL | 40.933 | 0.237 |
| Node whole SDK request | 41.128 | 1.376 |
| Local libSQL execute | 49.775 | 0.367 |
| Local libSQL whole SDK request | 51.212 | 1.301 |

The index occupied **704 KiB** (14.42 bytes/document). In separate 5,000-row transactions, indexed insert/update medians increased 67%/117% on Node and 18%/23% on libSQL. These are index-maintenance costs; the compiler creates no index. Durability, network and concurrent workloads were not measured.

The [measurement record](indexed-object-measurements.json) retains exact source hashes, SQL, plans, samples and controls, including unindexed and all-match results. Row requests retain Lite's 1,000-row cap; separate counts verified all 50,000 matches. These historical timings predate the current implementation layout. `test/indexed-object.test.mjs` reproduces correctness and query plans, not those timing measurements.

## Implementation tradeoffs

The gain applies to selective top-level members with an existing, matching index; broad queries still scan. [Index eligibility and compiler plans](design-and-porting.md#compiler-structure) determine which comparisons apply. Shallow-plan results do not describe the general plan. Query budgets do not bound latency, and these benchmarks exclude arbitrary-precision numeric and duplicate-label parity. There is no PostgreSQL GIN support or universal speedup claim.
