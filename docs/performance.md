# JSONB containment performance

## Reproduce

Run `npm ci`, then `npm run benchmark` on Node 24 or later. The package command builds the TypeScript and prepares separate, checksum-verified published and patched Lite 0.11.0 artifacts before benchmarking. No hosted account, network database, native extension, or CI service is needed.

The benchmark writes `reports/benchmark.json` and prints concise timing rows. The report is incremental. A supervising process stops the benchmark worker after a 50-second default safety budget, including when a synchronous SQLite query blocks JavaScript. A stopped or failed run is explicitly marked incomplete and exits nonzero; its partial results are not a complete benchmark. For a slower machine, use `npm run benchmark -- --budget-ms=120000`.

Counts are checked on the warm-up and every measured execution. The process budget limits resource use; it is not a performance threshold.

## What is measured

- Node `node:sqlite` and the local `@libsql/client` driver, with actual SQLite versions recorded
- One warm-up followed by three measured runs; the median and individual observations are retained
- 1,000- and 10,000-row fixtures averaging approximately 648 bytes per document, with exactly 10% matches
- The shipped shallow-object filter versus patched behavior through real Supabase-js → Lite requests
- Newly supported nested-object and same-variant catalog filters, including a schema-specific handwritten SQL reference
- Repeated primitive and structured-object arrays of 100, 1,000, and 5,000 elements, in both containment directions; separate cases force the shallow and general plans
- Actual table-column filters nested 16 levels deep, and a 128-level irrelevant stored branch under a depth-four filter that forces general-plan pruning
- Generated SQL bytes, bound-parameter counts, compilation time, and emitted JSONB core/helper JavaScript size

“Request” timings include the Supabase client, in-process Request/Response handling, query planning, and exact-count work. They include no network. Node SQL timings execute already-prepared statements, with preparation shown separately. libSQL timings include its local execute/preparation/driver overhead; they are not isolated SQLite VM timings. Do not compare those scopes as if they were identical.

The schema-specific reference knows the fixture's types and field layout. It is useful context for overhead, not a generic JSONB containment implementation. The shipped baseline is timed only where it returns the correct answer. Unsupported nested queries and errors are not treated as fast successful baseline results.

## Implementation tradeoffs

The object-only fast path uses bound JSON paths, explicit ancestor/type checks, and binary string comparison. It preserves missing-key, JSON-null, and SQL-null distinctions. A second, bounded `json_each` specialization handles shapes up to filter depth three, including arrays and arbitrary member names. Deeper patterns use the general compiler. Every SQL timing row records which plan actually ran; the fast shallow-array numbers must not be presented as general-plan timings.

The general plan uses JSON1 traversal and bottom-up containment match sets. It preserves array-element grouping and supports nested objects and arrays in both directions. Runtime traversal only needs the filter's maximum structural depth plus one; the extra level witnesses disallowed children beneath expected empty containers. Complete node identities and compact ancestor metadata avoid repeatedly joining every matching child back across all document nodes.

These are compatibility filters, not a replacement for PostgreSQL GIN indexes. Whole-table scans and large arrays can be expensive. Apply selective indexed relational predicates, such as tenant or document ID, before JSON matching when the application permits it. For a fixed production schema and a hot query, a purpose-built SQL predicate or generated/indexed column can be substantially faster.

The compiler deliberately bounds filter depth, node count, and parameters. The adapter also checks the complete request's SQL and parameter budgets. Arbitrary-precision PostgreSQL numeric behavior and raw duplicate-object-label canonicalization are not covered by these benchmarks.

## Recorded run

Recorded on **2026-10-03, 14:56:23–14:56:48 UTC**. All **88 benchmark cases completed with verified counts in 25.02 seconds**, within the default supervisor budget.

Environment: Node **24.19.0**, Linux x64 shared container, Intel Xeon Platinum 8573C, nine available processors. SQLite versions were **3.53.3** through Node and **3.45.1** through libSQL. This remains a shared-host measurement; ordinary scheduling and garbage-collection variation are not eliminated.

### Ten-thousand-row catalog

Each query matched exactly 1,000 documents. Values below are warm medians in milliseconds; request and SQL columns have the different scopes explained above.

| Query | Node request | libSQL request | Node compiler SQL | libSQL compiler SQL |
| --- | ---: | ---: | ---: | ---: |
| Shipped shallow object | 6.66 | 7.08 | — | — |
| Patched shallow object | 19.88 | 13.71 | 5.28 | 6.59 |
| Patched nested object | 31.42 | 20.91 | 15.37 | 8.30 |
| Patched same-variant array | 89.62 | 123.47 | 41.27 | 42.71 |

The correctness checks are not free: the already-working shallow request remains slower than the shipped implementation in this snapshot. The feature is a compatibility improvement, not a universal speedup.

Handwritten, schema-specific SQL reference medians were 3.17/4.61 ms for shallow objects, 4.47/5.50 ms for nested objects, and 20.18/21.65 ms for same-variant matching, respectively Node/libSQL. The same-variant compiler SQL costs approximately **4.13/4.27 microseconds per candidate row** in this dataset.

| Compiled count query | Selected plan | SQL bytes | Parameters |
| --- | --- | ---: | ---: |
| Shallow object | Object paths | 424 | 4 |
| Nested object | Object paths | 485 | 5 |
| Same variant | Bounded shallow | 1,409 | 6 |

These counts include the fixture's `id <= ?` row-limit predicate. Compilation and Node preparation times are reported separately in the JSON output.

### Wide and deep boundaries

The shallow and general plans are deliberately measured separately. At 5,000 elements, shallow object-array probes remained in the low single-digit millisecond range. A depth-four pattern forcing the **general plan** over 5,000 nested objects took **612.60/783.65 ms for contains** and **1,264.88/1,550.95 ms for containedBy**, respectively Node/libSQL. These general-plan costs remain significant; do not extrapolate shallow-array timings to arbitrary nested data.

Actual one-row depth-16 probes completed in 0.02–8.30 ms depending on engine, direction, and selected plan. A shallow comparison forcing the general plan with an additional 128-level irrelevant stored branch completed in 0.37–1.83 ms. These cases verify bounded behavior and pruning; they do not establish whole-table or production capacity.

The measured emitted-core SHA-256 is `63df1023a97c75d6f04c18729844d88a05e8aff82d85e7a07da9c4f2e2b71fa7`. The three emitted modules totaled **17,261 bytes**, or **4,657 bytes gzipped**. The fingerprint and sizes apply to this build.

Code-size numbers concatenate the unminified emitted `jsonb-*.js` modules and gzip that buffer. They exclude the adapter, Kysely, database engines, and all package dependencies; they are not an installed package size or a browser bundle claim.

This local benchmark does not establish hosted D1, Bun, browser-WASM, production-network, or production-concurrency performance. Three warm runs are useful regression evidence, not a statistical capacity study.
