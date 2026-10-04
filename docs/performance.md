# JSONB containment performance

## Reproduce

Install this branch's pinned dependencies with Bun 1.4.2:

```sh
bun install --frozen-lockfile
```

The recorded measurements below used native Node, not Bun. For an optional new run of the Node-oriented benchmark harness against the current checkout, install Node 24 or later separately and invoke it directly:

```sh
node scripts/benchmark.mjs
```

The command imports the checked-in working package and the pinned npm package as a separately labeled reference. No hosted account, network database, native extension or CI service is needed. The current `bun run benchmark` package script uses Bun; it does not reproduce the recorded native-Node runtime, and the harness retains Node-oriented report labels. The documented historical timings are not fresh measurements of this Bun-tooling revision.

The benchmark writes `reports/benchmark.json` and prints concise timing rows. The report is incremental. A supervising process stops the benchmark worker after a 50-second default safety budget, including when a synchronous SQLite query blocks JavaScript. A stopped or failed run is explicitly marked incomplete and exits nonzero; its partial results are not a complete benchmark. For a slower machine, use `node scripts/benchmark.mjs --budget-ms=120000`.

Counts are checked on the warm-up and every measured execution. The process budget limits resource use; it is not a performance threshold.

## What is measured

- Node `node:sqlite` and the local `@libsql/client` driver, with actual SQLite versions recorded
- One warm-up followed by three measured runs; the median and individual observations are retained
- 1,000- and 10,000-row fixtures averaging approximately 648 bytes per document, with exactly 10% matches
- The shipped shallow-object filter versus working-source behavior through real Supabase-js → Lite requests
- Newly supported nested-object and same-variant catalog filters, including a schema-specific handwritten SQL reference
- Repeated primitive and structured-object arrays of 100, 1,000, and 5,000 elements, in both containment directions; separate cases force the shallow and general plans
- Actual table-column filters nested 16 levels deep, and a 128-level irrelevant stored branch under a depth-four filter that forces general-plan pruning
- Generated SQL bytes, bound-parameter counts, compilation time, and checked-in JSONB core/helper JavaScript size

“Request” timings include the Supabase client, in-process Request/Response handling, query planning, and exact-count work. They include no network. Node SQL timings execute already-prepared statements, with preparation shown separately. libSQL timings include its local execute/preparation/driver overhead; they are not isolated SQLite VM timings. Do not compare those scopes as if they were identical.

The schema-specific reference knows the fixture's types and field layout. It is useful context for overhead, not a generic JSONB containment implementation. The shipped baseline is timed only where it returns the correct answer. Unsupported nested queries and errors are not treated as fast successful baseline results.

## Implementation tradeoffs

The [compiler design](design-and-porting.md#compiler-structure) describes the object/index, shallow and general plans, including index eligibility. Each timing row identifies its plan; shallow-array timings do not describe the general plan.

Whole-table scans and large arrays can be expensive; these filters do not provide PostgreSQL GIN indexing. Selective relational predicates or schema-specific indexed expressions can be faster. Filter-depth, node, parameter and SQL-size budgets bound query complexity, not latency. Arbitrary-precision numbers and duplicate-object-label canonicalization remain outside these benchmarks.

## Stored-column index measurements

On **2026-10-04**, the stored-column implementation was compared with commit `46d75c1`, using Node 24.19.0, SQLite 3.53.3 and local libSQL/SQLite 3.45.1 on a shared Linux x64 host. Both variants had the same ordinary migrated index: `CREATE INDEX docs_status_idx ON docs ((body->>'status'));`. Of 50,000 documents, 50 contained `{status: 'open'}`. The old predicate scanned; the new predicate used `SEARCH ... USING INDEX`. Three warmups preceded 11 measured samples with alternating variant order; every result count and sorted ID checksum was checked.

| Selective indexed read | Previous ms | New ms |
| --- | ---: | ---: |
| Node prepared SQL | 40.933 | 0.237 |
| Node whole SDK request | 41.128 | 1.376 |
| Local libSQL execute | 49.775 | 0.367 |
| Local libSQL whole SDK request | 51.212 | 1.301 |

The SQL was captured from actual SDK requests and replayed without rewriting; SDK timings include in-process request, compilation, database, serialization and parsing work, with no network. Unindexed selective SDK requests improved from 41.118 to 24.103 ms on Node and 51.128 to 31.294 ms on libSQL in this fixture. All-match row requests were approximately unchanged and chose scans. Those row requests retain Lite's 1,000-row cap; separate unrestricted counts verified all 50,000 matches. Indexed all-match SDK head/exact-count requests took 42.926→41.616 ms and 52.498→49.624 ms respectively, including both the capped row query and count. Small broad-query differences are not promised speedups.

The optional index occupied **704 KiB**, about **14.42 bytes/document** or 4.2% of table pages. In separate 5,000-row local-driver transactions, indexed insert/update medians were 67%/117% higher on Node and 18%/23% higher on libSQL. These measure index-maintenance cost, not added compiler write work; no disk durability, network or concurrent workloads were measured. The compiler creates no index and adds no dependency. Its metadata gate uses existing introspection without a database call; an auxiliary compile-only comparison added about 5 μs for a synthetic 1,000-table schema with the target last, and approximately zero for small/target-first contexts.

These results support a narrow improvement for an existing, matching index on a selective top-level member. They do not establish universal performance gains. `bun run test` includes the reproducible SDK/migration/EXPLAIN regression in `test/indexed-object.test.mjs`, both indexed and unindexed, plus live PostgreSQL semantic comparisons; timings are observations, not test thresholds.

Exact baseline/candidate source SHA-256 identities, captured SQL/bindings/plans, verified counts, raw samples and index/write measurements are in the [compact measurement record](indexed-object-measurements.json). This record preserves the observed timings; the committed SDK test reproduces correctness and plans, not the numerical timing collection.

The indexed-object measurement record is historical evidence from the earlier implementation layout. Its source hashes and timings are retained exactly as measured; they are not fresh measurements of this direct-file layout. The current tests reproduce correctness and query plans, and the direct Node command above writes a new local report.
