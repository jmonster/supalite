# Supalite

SQLite JSONB containment filters for `@supabase/lite@0.11.0`, with PostgreSQL differential tests and a repeated-column filter fix.

The JSONB compiler supports `.contains()` and `.containedBy()` on nested objects and arrays. Predicates execute in SQL and apply to row selection, counts, pagination, updates, and deletes. The adapter targets SQLite columns declared as `jsonb`; PostgreSQL and SQL-array operators retain their existing behavior.

## Run locally

Requires Node.js 24 or newer.

```sh
npm ci
npm test
npm run demo
```

Tests use Node SQLite, local libSQL, and PostgreSQL through PGlite. `npm test` compiles the TypeScript and prepares separate baseline and patched packages in `.generated/`. Preparation checks the pinned package version, npm integrity, and all 77 published file hashes and modes in both the installed and vendored distributions. The patch modules require exact matches at their integration points. The installed package and vendored files remain unchanged.

- `npm run test:core`: compiler differential tests
- `npm run benchmark`: local workload measurements, written to `reports/benchmark.json`

## JSONB filters

For a `documents` table with a `jsonb` column named `body`:

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
// result.data: [{ id: 1 }]
```

Use the patched package prepared by this repository to run this example; installing the published 0.11.0 package alone does not enable these filters. See [the executable catalog example](examples/catalog.mjs) for client setup and baseline comparisons.

Array matching preserves element boundaries: `[{ color: 'red' }, { size: 'M' }]` does not contain `[{ color: 'red', size: 'M' }]`.

Pass JSON arrays and scalars as serialized JSON. A JavaScript array passed directly to Supabase-js `.contains()` is encoded as a PostgreSQL array literal:

```js
client.from('documents').select('id')
  .contains('body', JSON.stringify([{ color: 'red', size: 'M' }]))
```

Object operands can be passed directly. `.not()` and `.or()` accept raw PostgREST filter syntax.

## Tests and limitations

Tests compare SQLite containment results with PostgreSQL `@>` and `<@` in PGlite, then exercise client requests on Node SQLite, libSQL, and PGlite. They cover nested containers, JSON types, missing values, SQL NULL, negation, JSON-preserving paths, counts, pagination, filtered mutations, and repeated filters on one column.

- Hosted D1, Durable Objects, Bun, browser SQLite, and hosted Supabase have not been tested here
- Filter integers outside `Number.isSafeInteger` are rejected; arbitrary-precision numbers and raw stored duplicate object labels can differ from PostgreSQL
- Default limits are depth 16, 128 value nodes, and 64 bound parameters per filter; requests using the feature allow 100 total parameters and 100,000 SQL bytes
- Broad scans and large nested arrays can be expensive; no JSON index is added

See [design and limits](docs/design-and-porting.md) and [performance measurements](docs/performance.md).

## Implementation

- [`src/jsonb-containment.ts`](src/jsonb-containment.ts), [`src/jsonb-object-fast-path.ts`](src/jsonb-object-fast-path.ts), and [`src/jsonb-shallow.ts`](src/jsonb-shallow.ts): JSON validation and SQLite predicate compilation
- [`src/lite-adapter.ts`](src/lite-adapter.ts): JSONB column dispatch, literal preservation, JSON paths, and query budgets
- [`src/merge-filters.ts`](src/merge-filters.ts): repeated-column conjunction handling
- [`scripts/patch-repeated-filters.mjs`](scripts/patch-repeated-filters.mjs): two parser patch locations
- [`scripts/patch-jsonb-containment.mjs`](scripts/patch-jsonb-containment.mjs): four JSONB integration locations

## Baseline

[`upstream/lite-0.11.0/`](upstream/lite-0.11.0/) contains all 77 files from the published `@supabase/lite@0.11.0` npm artifact. [`upstream/manifest.json`](upstream/manifest.json) records npm integrity, the tarball SHA-256, and per-file checksums and modes. [`scripts/prepare-baseline.mjs`](scripts/prepare-baseline.mjs) verifies the installed and vendored distributions and copies the vendored baseline before patching.

The npm artifact includes bundled JavaScript, declarations, and package documentation. It does not include the original upstream TypeScript implementation. The TypeScript under `src/` and the tests in this repository are maintained separately. This repository is not published to npm.

See [CONTRIBUTING.md](CONTRIBUTING.md) for development commands. Licensed under [Apache-2.0](LICENSE); generated package copies retain the baseline license.
