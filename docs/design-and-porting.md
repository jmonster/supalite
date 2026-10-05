# JSONB containment design

SQLite JSON1 predicates implement PostgREST `cs`/`cd` (PostgreSQL JSONB `@>`/`<@`). The compiler returns a Kysely `RawBuilder<boolean | null>` without fetching rows into JavaScript:

```ts
jsonbContainment(input, filter, 'contains' | 'containedBy', options?)
```

`input` is a SQL expression; `filter` must be a constant JSON value. Dynamic AST operands are rejected by the adapter; ordinary SDK JSON keys are literal data, not AST instructions. See [package provenance](../README.md#package).

## Behavioral contract

Differential fixtures use PostgreSQL operators in PGlite as the reference for the [containment rules](https://www.postgresql.org/docs/current/datatype-json.html#JSON-CONTAINMENT):

- Objects match recursively by key; the containing object may have extra members
- Array order and duplicates do not matter. Each required object must match one complete candidate element; one candidate may satisfy multiple requirements
- Nesting matters: `[[1, 2]]` contains `[[1]]`, not `[1]`. Only at the root can an array contain a primitive: `[1, 2]` contains `1`, but `{a: [1]}` does not contain `{a: 1}`
- Empty objects/arrays require the corresponding container type
- JSON null, missing members and SQL NULL remain distinct. A SQL-null document yields NULL, including under `NOT`
- Booleans differ from numbers; strings use binary, case-sensitive comparison

## Compiler structure

Validation precedes SQL generation, including on empty tables. Values and general keys/paths are bound parameters. Dispatch selects:

1. Object-only `contains`: typed path comparisons for keys matching `[A-Za-z_][A-Za-z0-9_]*`
2. Shallow filters, depth ≤3: typed `json_each` and nested existence checks, in either direction
3. General filters: a materialized recursive JSON1 walk, limited to filter depth plus one, with bottom-up matches retaining ancestor and complete-element identity

Unsupported specialization shapes fall through without consuming parameter budget. The general plan preserves JSON types and captures the input separately from traversal aliases. It does not guarantee parse-once or linear-time execution.

For a verified stored column, top-level string/number comparisons can use a matching `(column ->> 'member') COLLATE BINARY` expression index. Only allowlisted member names become SQL literals; values stay bound and ancestor/type/NULL guards remain. The adapter requires ordinary-table, non-generated-column metadata and a plain column reference. Views, virtual tables, unknown metadata, computed inputs and extracted paths are ineligible. Direct callers must guarantee that provenance before setting `{storedColumn: true}`.

Matching indexes can come from Lite's imperative DDL translation; declarative schema diff is unchanged. Casted or differently spelled expression indexes are not guaranteed to match. PostgreSQL GIN indexes are unsupported. No index is created; broad or unindexed queries can still scan. See [measurements and write costs](performance.md).

## Lite integration boundary

The adapter handles SQLite containment on declared `jsonb` columns only; other types and PostgreSQL compilation are unchanged. It preserves each REST operand separately, parses strict JSON, and retains SQL negation. JSON `->` paths support negative array indexes; missing paths yield SQL NULL. Text extraction (`->>`) is rejected with `42883`. Repeated-column filters depend on [#18](https://github.com/jmonster/supalite/pull/18).

## Limits and input boundary

Defaults:

- Per filter: depth 16 (root zero), 128 value nodes including containers, 64 emitted parameter occurrences
- Per extraction path: 16 steps
- Per compiled feature-bearing SQLite request: 100 parameters and 100,000 UTF-8 SQL bytes, including other predicates and pagination

Budget and JSON-value failures return HTTP 400: complexity `54000`; invalid JSON/surrogates `22P02`; Unicode NUL `22P05`; filter integers outside `Number.isSafeInteger` `22003`, including JavaScript-supplied values. Finite-number checks do not reproduce every PostgreSQL numeric-input error.

JSON null is a supported filter; an SQL-null filter expression is outside the API. Stored JSON must be valid. JavaScript/SQLite numeric representation cannot preserve arbitrary-precision PostgreSQL distinctions, and duplicate stored object labels may produce different results rather than rejection.

Budgets bound generated-query complexity, not document/table size or latency. Native Node SQLite and local libSQL are tested; other runtime adapters require their own execution tests.
