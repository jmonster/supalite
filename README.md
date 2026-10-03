# Supalite

Preserves repeated filters on the same column as conjunctions in the published `@supabase/lite@0.11.0` request parser.

For example, both exclusions apply in this request:

```js
const result = await client
  .from('items')
  .select('id,name')
  .neq('category', 'fruit')
  .neq('category', 'vegetable')
  .order('id')
```

The baseline parser overwrites the first `neq` filter. The patched parser preserves both conditions, including repeated negated filters and composition with existing `and` groups. The change applies to Node SQLite, libSQL, and PGlite requests.

## Run

Requires Node.js 24 or later.

```sh
npm ci
npm test
```

Tests prepare separate baseline and patched packages, then exercise the parser through Supabase-js requests and direct unit tests. Installing the published npm package alone does not apply the fix.

## Implementation

- [`src/merge-filters.ts`](src/merge-filters.ts) preserves repeated operators as separate conjunction terms and treats column names as own data properties
- [`scripts/patch-repeated-filters.mjs`](scripts/patch-repeated-filters.mjs) applies the repeated-filter merge and existing-`and` preservation changes at exact, checked locations in the baseline bundle
- [`test/`](test/) contains regression tests and baseline smoke tests

Generated package copies live in `.generated/`; the installed package and vendored baseline remain unchanged.

## Baseline

[`upstream/lite-0.11.0/`](upstream/lite-0.11.0/) contains all 77 files from the published npm distribution. [`upstream/manifest.json`](upstream/manifest.json) records npm integrity, the tarball SHA-256, and per-file checksums and modes. Preparation verifies the distribution before applying any patch.

The npm artifact includes bundled JavaScript, declarations, and package documentation. It does not include the original upstream TypeScript implementation. The parser helper and regression tests in this repository are maintained separately.

Licensed under [Apache-2.0](LICENSE). See [NOTICE](NOTICE) for attribution.
