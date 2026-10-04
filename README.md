# Supalite

An editable `@supabase/lite` **0.11.0** implementation with repeated-column filters preserved as conjunctions.

## Repeated filters

Both exclusions apply in this request:

```js
const result = await client
  .from('items')
  .select('id,name')
  .neq('category', 'fruit')
  .neq('category', 'vegetable')
  .order('id')
```

The original parser overwrote the first `neq` filter. The checked-in parser now retains both conditions, including repeated negated filters and composition with existing `and` groups. The change applies to Node SQLite, libSQL, and PGlite requests.

[`upstream/lite-0.11.0/dist/index.js`](upstream/lite-0.11.0/dist/index.js) contains the two direct parser edits. [`upstream/lite-0.11.0/dist/query/merge-filters.js`](upstream/lite-0.11.0/dist/query/merge-filters.js) is a separately maintained helper that preserves repeated operators as conjunction terms and treats column names as own data properties. The helper is checked in with the package, so no build or preparation step is needed.

## Package

`upstream/lite-0.11.0/` contains the working JavaScript implementation, declarations, and package assets. The published JavaScript has been formatted for readability. The npm artifact does not include the original TypeScript sources.

The exact original package is preserved in Git commit `514fe6148b412ad4fdfe3eb2b3baed916e7e4911` and the [npm tarball](https://registry.npmjs.org/@supabase/lite/-/lite-0.11.0.tgz). `upstream/manifest.json` records that original artifact's provenance and checksums.

## Run

Requires Node.js 24 or later.

```sh
npm ci
npm test
node upstream/lite-0.11.0/dist/cli/index.js --help
```

Tests import the tracked working package directly:

```js
import { App } from "../upstream/lite-0.11.0/dist/index.js";
```

`test/helpers/lite.mjs` supplies the shared SQLite, libSQL, and PGlite SDK harness. The pinned npm `@supabase/lite@0.11.0` dev dependency is available for explicit original-version comparisons.

The repeated-filter suite covers equality, inequality, `in`, negation, SQL arrays, explicit logical groups, parameter order, chained Supabase-js calls, and unusual column names on all three adapters. Tests also cover SDK insert, select, exact-count operations, export targets, and normal CLI behavior. They do not establish comprehensive compatibility.

## License

The upstream Apache-2.0 license is preserved in [LICENSE](LICENSE) and [upstream/lite-0.11.0/LICENSE](upstream/lite-0.11.0/LICENSE). See [NOTICE](NOTICE) for attribution.
