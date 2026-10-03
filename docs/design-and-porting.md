# JSONB containment design

The compiler translates constant JSONB containment filters into SQLite JSON1 predicates. The adapter integrates those predicates with the published Lite 0.11.0 runtime.

## Behavioral contract

PostgREST `cs` and `cd` map to PostgreSQL JSONB `@>` and `<@`. The compiler accepts a SQL expression for the stored document and one constant JSON filter:

```ts
jsonbContainment(input, filter, 'contains' | 'containedBy', limits?)
```

It returns a Kysely `RawBuilder<boolean | null>` to compose with the existing query. It does not load rows into JavaScript or register a database function.

The differential fixtures establish the following contract within the [input boundary](#limits-and-input-boundary):

- Objects match recursively by key; extra members are permitted on the containing side
- Array order and repeated requirements do not change containment
- Each required array object matches a complete candidate element; matching fields from different candidates cannot be combined
- One candidate may satisfy multiple required array elements
- Nesting is significant: `[[1, 2]]` contains `[[1]]`, but not `[1]`
- The root primitive exception allows `[1, 2]` to contain `1`; it does not let `{ a: [1, 2] }` contain `{ a: 1 }`
- Empty objects and empty arrays require their respective container types
- JSON null, missing members, and SQL NULL remain distinct; a SQL-null document produces NULL under either operator and under SQL `NOT`
- Booleans are distinct from numbers; string comparisons are binary and case-sensitive

The expected values come from PostgreSQL operators running in PGlite, rather than a JavaScript reimplementation. The [PostgreSQL containment contract](https://www.postgresql.org/docs/current/datatype-json.html#JSON-CONTAINMENT) and [PostgREST operator mapping](https://docs.postgrest.org/en/stable/references/api/tables_views.html#operators) provide the reference behavior.

## Compiler structure

After validation, dispatch tries the object-only `contains` specialization, then the shallow helper, then the general ancestor-carrying walk. All three share the same semantic contract and parameter budget.

### Validate before emitting SQL

An iterative pass validates the constant filter and checks its complexity. It rejects invalid values before query execution, including when the target table is empty. Keys and scalar values are bound parameters; generated aliases, JSON type names, and traversal metadata are internal SQL constants.

### Specialized object containment

`jsonb-object-fast-path.ts` handles `contains` patterns consisting only of objects and scalar values, with keys matching `[A-Za-z_][A-Za-z0-9_]*`. It emits bound JSON paths, guards every object ancestor, and compares each scalar with its JSON type intact.

Unsupported shapes return to the caller before consuming parameter budget. Punctuation-bearing keys remain supported by the other plans. A missing path is a false match; a SQL-null input remains NULL. This specialization avoids the general walk for a common filter shape without changing the semantic contract.

### Bounded shallow containment

`jsonb-shallow.ts` specializes filters of depth three or less, including arrays, in both directions. It uses typed `json_each` nodes and bounded nested `EXISTS` / `NOT EXISTS` predicates. A required array object is evaluated against one candidate node, preserving element boundaries. Keys and values remain bound, wrong-type scalar inputs are guarded before JSON iteration, and SQL NULL remains NULL.

The depth check runs before spending parameter budget. Deeper shapes return to the general walk. The depth limit bounds SQL nesting. Its tests cover the maximum eligible depth together with long extraction paths and embedding wrappers on both SQLite drivers.

### General containment with ancestor metadata

The general plan has three stages:

1. Capture the input expression in an outer scope. This avoids accidental capture when the physical column is named `key`, `type`, `value`, or `id`.
2. Walk the runtime document with a materialized recursive JSON1 CTE. Each node carries its key-path identity and a compact stack of ancestor keys/types. Traverse only through filter depth plus one; the extra level is needed to witness a disallowed child for `containedBy`.
3. Build materialized match relations bottom-up, one per constant pattern node. Primitive matches compare type and value. `contains` intersects compatible parent identities with each required child's matching parent identities. `containedBy` subtracts parents with a direct child outside the permitted alternatives.

Matching retains complete node identities. A matched child's parent can be projected from its ancestor metadata without joining back across every runtime node. This is what keeps both same-element semantics and the cost of wide, repetitive arrays manageable. The root primitive-array exception is handled at the final root check rather than applied recursively.

JSON iteration uses a guarded container expression. Values returned for JSON strings by `json_each` are already dequoted; interpreting them as fresh JSON would lose type information or raise a malformed-JSON error. The implementation carries the JSON1 type alongside the value. See [SQLite JSON1](https://www.sqlite.org/json1.html).

The general walk bounds traversal by filter depth and retains each node’s parent metadata. JSON1 can still parse subdocuments repeatedly; the compiler does not guarantee parse-once or linear-time execution.

## Lite integration boundary

`lite-adapter.ts` is deliberately narrower than the core compiler:

1. Intercept only `$contains` / `$containedBy` on the SQLite dialect
2. Resolve the physical column from the current table, schema, and alias; require declared `jsonb` metadata
3. Preserve each operator's original REST literal in separate symbol metadata, so quoted JSON strings remain strings and `cs` plus `cd` on one column retain both operands
4. Parse the raw literal as strict JSON, then invoke the core compiler
5. Preserve JSON type through `->` paths; reject `->>` for JSONB containment with `42883`
6. Wrap negated predicates with the existing query builder's SQL `NOT`
7. Check the complete compiled feature-bearing query's parameter and SQL-byte budgets before execution

The existing identifier resolver still owns qualification and quoting. The adapter resolves actual column metadata before choosing JSONB behavior; plain `json`, SQL arrays, ranges, and PostgreSQL's operator compiler are not silently reinterpreted.

The JSON-path adapter uses direct-parent steps over a materialized tree and supports negative array indexes. Path extraction is a separate layer from containment. A path with more than 16 steps is rejected; a missing path yields SQL NULL.

### Repeated-column filters are a separate fix

The baseline parser merges per-column operator objects. Repeating an operator could overwrite an earlier predicate, including nested `$not` maps. `mergeFilter` moves a repeated operator into an explicit `$and` term; distinct operators can still share a column's operator map. Existing conjunction groups must also be appended to rather than overwritten.

This parser correction applies to both dialects and is independently portable. It does not require the JSONB SQL compiler. In particular, `NOT A AND NOT B` must never become `NOT (A AND B)` during a merge.

## Limits and input boundary

Default budgets are defined in the code, with two different scopes:

- Per JSON filter: maximum depth 16, root at depth zero; 128 value nodes, including containers; 64 emitted bound-parameter occurrences
- Per JSON extraction path: 16 steps
- Per compiled SQLite request that uses the feature: 100 total parameters and 100,000 UTF-8 SQL bytes, including other predicates and pagination

Complexity failures become HTTP 400 with code `54000` through the artifact bridge. Invalid JSON and invalid surrogate sequences use `22P02`; an escaped Unicode NUL uses `22P05`; filter integers outside `Number.isSafeInteger` use `22003`. These validation failures are HTTP 400 responses. The finite-number and strict-JSON checks do not reproduce every PostgreSQL numeric-input error.

The core API accepts JavaScript JSON values, not an SQL expression as its filter operand. SQL NULL as the stored document is covered; SQL NULL as the filter expression is outside that API. JSON null is a supported filter value.

The fidelity boundary matters even for syntactically valid input:

- Filter integers outside `Number.isSafeInteger` are rejected, including numbers supplied as JavaScript values and serialized with `JSON.stringify`; this is not limited to raw numeric literals
- JavaScript parsing and SQLite numeric atoms also do not preserve arbitrary-precision PostgreSQL `numeric` distinctions
- Raw stored documents with duplicate object labels can behave differently in JSON1 path lookup and iteration; no duplicate-label parity is claimed
- Stored JSON must be valid for the selected JSON1 operations; the filter compiler is not a general repair or validation layer for externally written database text

Stored numeric-fidelity and duplicate-label cases can produce different results rather than being uniformly rejected. The test corpus records those cases separately from supported-domain cases.

Budgets limit generated-query complexity, not table size or total latency. A broad filter can still scan many large documents. The SQL uses recursive CTEs and materialization features available in the two tested engines; other Lite runtime adapters need their own execution tests.

## Published-artifact bridge

[`upstream/lite-0.11.0/`](../upstream/lite-0.11.0/) contains the complete published npm distribution. [`upstream/manifest.json`](../upstream/manifest.json) records its npm integrity, tarball SHA-256, and the SHA-256, size, and mode of each of its 77 files.

`scripts/prepare-baseline.mjs` verifies the package name and version, lockfile integrity, complete file inventory, and every file's checksum and mode in both the installed package and the vendored distribution. It copies the verified vendored distribution into `.generated/baseline/node_modules/@supabase/lite/` and prepares a separate patched copy. The installed package and the tracked upstream files remain unchanged.

Patching is split into two modules:

- `scripts/patch-repeated-filters.mjs` changes two parser locations: repeated-column merging and preservation of existing conjunction groups
- `scripts/patch-jsonb-containment.mjs` changes four JSONB integration locations: raw-literal preservation, ordinary predicate dispatch, negated predicate dispatch, and final-query validation

Every replacement must match exactly one known location in the bundle. Generated imports point to this checkout's compiled helpers, so generated output must be rebuilt after moving the checkout. The baseline smoke tests explicitly use the unmodified baseline; regression tests compare the relevant baseline and patched behavior.

The npm artifact includes bundled JavaScript, type declarations, documentation, and an Apache-2.0 license. Its original TypeScript implementation, source maps, and upstream test/build setup are not included. The compiler and parser helper under `src/` are maintained separately. Generated package copies are excluded from version control.
