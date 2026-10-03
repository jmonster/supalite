# Supalite contributions

Independent, testable improvements to Supabase Lite, starting with SQLite JSONB containment and a small repeated-filter parser fix.

The main contribution makes `.contains()` and `.containedBy()` useful for nested documents: catalog variants, structured issue filters, capability sets, and event metadata. Filtering stays in SQL, so the same predicate selects rows for counts, pagination, updates, and deletes. It uses Lite's existing Kysely/SQLite JSON1 stack, with no UDF registration or additional production dependency.

This is a development workspace built around the published `@supabase/lite@0.11.0` package. The compiler and integration helpers in [`src/`](src/) are new TypeScript. The published package supplies the baseline runtime; its original TypeScript source tree and upstream test/build setup are not shipped. This repository is not published as an npm package.

## Try it

Requires Node.js 24 or newer and npm. Tests use local Node SQLite, libSQL, and the PostgreSQL engine in PGlite; no hosted database is required.

```sh
npm ci
npm test
npm run demo
```

`npm test` builds the TypeScript, prepares untouched and patched copies of the exact baseline, and runs the tests. The installed package is left untouched. Generated files live in `.generated/`; `prepare:baseline` refuses to patch a version, checksum, or integration point it does not recognize.

For the compiler tests alone, run `npm run test:core`. For the local workload benchmark, run `npm run benchmark` and read the [performance notes](docs/performance.md) before comparing timings.

## Before and after

Given a `documents` table with a `jsonb` column named `body`:

```js
await client.from('documents').insert([
  { id: 1, body: { profile: { plan: 'pro', active: true } } },
  { id: 2, body: { profile: { plan: 'starter' } } },
])

const result = await client
  .from('documents')
  .select('id')
  .contains('body', { profile: { plan: 'pro' } })
  .order('id')
```

With the untouched 0.11.0 artifact, Node SQLite and libSQL return HTTP 500 because the nested object reaches SQL as an unsupported bound value. With the patch, both return HTTP 200 and `[{ id: 1 }]`, matching Lite's PGlite backend. This case is included in the [before/after regression tests](test/regressions.test.mjs).

Array matching also preserves element boundaries. A document containing `[{ color: 'red' }, { size: 'M' }]` must not match `[{ color: 'red', size: 'M' }]`. All fields in a required object have to match one candidate array element.

When the JSONB operand is an array, pass JSON text:

```js
client.from('documents').select('id')
  .contains('body', JSON.stringify([{ color: 'red', size: 'M' }]))
```

Supabase-js encodes a JavaScript array passed directly to `.contains()` as a PostgreSQL array literal. Object operands can be passed directly; JSON scalars and JSON arrays should be supplied as serialized JSON. `.not()` and `.or()` accept raw PostgREST syntax. See the [client serialization source](https://raw.githubusercontent.com/supabase/postgrest-js/master/src/PostgrestFilterBuilder.ts).

## What is covered

- Nested object subsets, unordered arrays, duplicate array requirements, empty containers, and same-element matching
- JSON type distinctions, case-sensitive strings, missing keys, JSON null, and SQL NULL under `NOT`
- Both containment directions, logical composition, JSON-preserving `->` paths, counts, pagination, and filtered mutations
- A separate parser fix that preserves repeated filters on one column as conjunctions, including repeated negated filters

The adapter selects the new compiler only for SQLite columns identified as `jsonb`. PostgreSQL's containment operators and Lite's native SQL-array handling retain their existing paths.

## Verification and limits

The [compiler tests](test/compiler.test.mjs) compare executed SQLite predicates against actual PostgreSQL `@>` and `<@` results from PGlite. The [regression tests](test/regressions.test.mjs) exercise real supabase-js requests against the untouched and patched packages on Node SQLite, libSQL, and PGlite. [Request contract](test/contracts.test.mjs) and [application tests](test/application.test.mjs) cover behavior beyond isolated booleans.

The selected before/after set improves from 3/34 to 34/34 matches with PostgreSQL on each SQLite driver. The full compiler corpus executes 11,136 SQLite/PostgreSQL comparisons across both drivers, with additional specialization and request-level tests.

These are focused contribution tests, not the absent upstream test suite or a claim of complete Supabase compatibility. Node SQLite and libSQL have been exercised. Hosted D1, Durable Objects, Bun, browser SQLite, and hosted Supabase have not been certified by this work.

Filter parsing is strict JSON, and filter integers outside `Number.isSafeInteger` are rejected with `22003`. Arbitrary-precision numeric fidelity and raw stored duplicate object labels remain outside the parity claim and can produce different results without an error. The default filter budget is depth 16, 128 value nodes, and 64 bound parameters per predicate; feature-bearing SQLite requests are also checked against 100 total parameters and 100,000 SQL bytes. See [the design guide](docs/design-and-porting.md#limits-and-input-boundary) for details.

Broad JSON scans can still be expensive, especially for deeply nested arrays or large documents. Prefer a selective relational predicate where available. The implementation does not add a JSON index; [benchmarks](docs/performance.md) report specific workloads rather than a general speed claim.

## Review and contribute

- [`src/jsonb-containment.ts`](src/jsonb-containment.ts): validation and general SQL compiler
- [`src/jsonb-object-fast-path.ts`](src/jsonb-object-fast-path.ts): object-only specialization
- [`src/jsonb-shallow.ts`](src/jsonb-shallow.ts): bounded shallow-filter specialization, including arrays
- [`src/lite-adapter.ts`](src/lite-adapter.ts): JSONB type gate, literal preservation, JSON paths, and request budgets
- [`src/merge-filters.ts`](src/merge-filters.ts): independently portable repeated-filter fix
- [`scripts/prepare-baseline.mjs`](scripts/prepare-baseline.mjs): checksum-guarded artifact bridge
- [Design and upstream porting](docs/design-and-porting.md): semantics, integration assumptions, and what belongs in an upstream patch
- [Contribution workflow](CONTRIBUTING.md) and [roadmap](docs/roadmap.md): keep the next improvement independently reviewable

Apache-2.0. The baseline's license is retained in each generated package copy; this repository includes its [license](LICENSE).
