# HEAD response serialization

Successful table/view HEAD requests return no body. The published 0.11.0 package
nevertheless formats the selected rows as JSON or CSV, encodes that string into
a UTF-8 buffer, and discards the buffer. This patch skips those final two steps.

The selected data query still executes, including projections, filters, ordering,
and pagination. Count queries, row transformations, null stripping, singular
cardinality checks, and existing range/error behavior are retained. No SQL
rewrite or count-query shortcut is included.

## Response contract

Successful table/view HEAD responses omit `Content-Length`. Their status,
content type, range/location/preference headers, and empty body remain unchanged.
GET response bytes/headers, mutation representations, RPC responses, and HEAD
error paths remain unchanged.

[RFC 9110 section 9.3.2](https://www.rfc-editor.org/rfc/rfc9110.html#section-9.3.2)
permits omitting HEAD headers whose values require generating the content.
[PostgREST documents the same Content-Length omission](https://postgrest.org/en/stable/references/observability.html#content-length-header).
This change does not claim complete PostgREST parity.

The package's original TypeScript is absent from its published distribution.
The implementation therefore uses two exact-match replacements against the
checksum-verified bundle, rejecting changed or already-patched anchors. Only the
generated candidate's `dist/index.js` changes; the 77-file vendored baseline and
installed package retain their published bytes and modes.

## Tests

`npm test` covers GET/HEAD status, headers and bytes; counts and pagination;
Unicode, JSON, CSV, null stripping, views and singular results; SDK calls and
mutation representations; and existing query/projection/transformation errors.
Instrumentation verifies the same data/count queries and transformed row counts
for GET and HEAD while successful HEAD performs no final response serialization
or body encoding.

PGlite regression tests exercise scalar, JSON, void and set-returning RPCs,
including CSV/null stripping, singular-cardinality failures and SQL errors. These
RPC responses retain their existing behavior, including successful RPC HEAD
content length. A loopback Node HTTP check verifies omitted successful table HEAD
content length, unchanged GET bytes, and unchanged singular/range errors through
`@hono/node-server`.

## Optional paired benchmark

Run `npm run benchmark:head` separately from tests. It uses real Supabase-js HEAD
requests with `count=exact`, separate identical in-memory databases, and a shallow
JSON containment predicate matching 1,000 rows. Each scenario has four warmups per
flavor and 20 pairs with alternating baseline/candidate order. Wide requests
select an id plus JSON containing a 4 KiB string; narrow requests select only id.

Recorded on Node v24.19.0 / AMD EPYC 9V74, 2026-10-04:

| Backend | Projection / format | Baseline median | Patched median |
| --- | --- | ---: | ---: |
| Node SQLite | id / JSON | 2.937 ms | 2.979 ms |
| Node SQLite | id / CSV | 2.407 ms | 2.342 ms |
| Node SQLite | wide / JSON | 13.496 ms | 7.184 ms |
| Node SQLite | wide / CSV | 14.694 ms | 7.652 ms |
| libSQL | id / JSON | 3.828 ms | 3.488 ms |
| libSQL | id / CSV | 3.841 ms | 3.628 ms |
| libSQL | wide / JSON | 13.501 ms | 8.566 ms |
| libSQL | wide / CSV | 16.743 ms | 9.152 ms |

An independently installed repeat measured 35.6–46.4% lower wide-response
medians. Narrow results were small and noisy, including a 3.9% libSQL CSV
slowdown in that repeat. The useful result is less discarded wide-response work,
not a general count-query or production throughput speedup.

Raw observations and paired saved-time medians are emitted by the optional
benchmark. Hosted PostgreSQL, remote libSQL, D1, Bun, browser SQLite, production
concurrency and heap profiling were not measured. PGlite and loopback HTTP were
used for correctness only. The database still reads and materializes selected
rows, transforms them, and computes requested counts.
