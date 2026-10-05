# Supalite

Contributions cover SQLite API compatibility and migration to full Supabase. The integration branch combines the unmerged changes in an authenticated app verified against the official Supabase stack, run locally.

- [JSONB compatibility (#19)](https://github.com/jmonster/supalite/pull/19): nested object and array containment in Data API filters, within documented input and runtime limits
- Safe Auth/data migration: [preserve password sign-in (#21)](https://github.com/jmonster/supalite/pull/21), [preserve identity columns (#24)](https://github.com/jmonster/supalite/pull/24), and [stop on table-read errors (#30)](https://github.com/jmonster/supalite/pull/30)
- [Authenticated graduation demo](https://github.com/jmonster/supalite/blob/integration/graduation-demo/examples/functions-portable/README.md): preserve users, private tasks, attachment bytes and portable TypeScript function source when moving to the full Supabase stack (run locally)

An editable baseline of the published `@supabase/lite` **0.11.0** package. Main retains the original package's functionality; feature changes remain on their respective branches until merged.

## Package

`upstream/lite-0.11.0/` contains the working JavaScript implementation, declarations, and package assets. The published JavaScript has been formatted for readability. The npm artifact does not include the original TypeScript sources.

The exact original package is preserved in Git commit `514fe6148b412ad4fdfe3eb2b3baed916e7e4911` and the [npm tarball](https://registry.npmjs.org/@supabase/lite/-/lite-0.11.0.tgz). `upstream/manifest.json` records that original artifact's provenance and checksums.

## Run

Requires Bun. Tested with Bun 1.4.2.

```sh
bun install --frozen-lockfile
bun run test
bun upstream/lite-0.11.0/dist/cli/index.js --help
```

Tests import the tracked working package directly:

```js
import { App } from "../upstream/lite-0.11.0/dist/index.js";
```

`test/helpers/lite.mjs` supplies the shared SQLite, libSQL, and PGlite SDK harness. The pinned npm `@supabase/lite@0.11.0` dev dependency is available for explicit original-version comparisons.

Tests cover SDK insert, select, equality-filter, exact-count operations, export targets, and normal CLI behavior. They do not establish comprehensive compatibility.

## PGlite NULL-array fix

### Problem

When Lite reads temporal or text arrays, PGlite 0.4.5 decodes SQL NULL elements as the string `"NULL"`. Lite's upgrade exporter consequently writes quoted `'NULL'` elements, causing `date[]`, `time[]`, `timetz[]`, `timestamp[]`, and `timestamptz[]` imports to fail with SQLSTATE `22007`. In `text[]`, the same bug silently changes nulls into literal strings.

### Change

Pin the working package and regression dependencies to PGlite 0.4.6, the first release containing the [upstream array-NULL parser fix](https://github.com/electric-sql/pglite/commit/2aa4d1ae89ba20283441f4b7088e1d25c1b60f8e). The checked-in working package's `package.json` is updated directly, along with the root dependency and lockfile. A root npm override keeps the pinned reference dependency on the same PGlite version. No parser or exporter algorithm is replaced.

### Tests

The regression tests import the tracked PGlite adapter and CLI upgrade exporter directly. They do not copy, rewrite, or generate runtime code. They check all five temporal array types and `text[]`, including mixed and all-null arrays, whole-column NULL, empty arrays, six-digit fractional seconds, timezone offsets, and quoted `"NULL"` versus SQL NULL. Exported inserts are replayed into emptied fixture tables in the same PGlite instance and compared using server-side SQL text and null checks.

Multidimensional decoding is also checked. Multidimensional upgrade export remains an existing exporter limitation and is outside this dependency fix. PGlite 0.4.6 also includes ICU, initialization/exit-code, and filesystem API changes; the full [release changelog](https://github.com/electric-sql/pglite/blob/main/packages/pglite/CHANGELOG.md#046) lists them.

## License

The upstream Apache-2.0 license is preserved in [LICENSE](LICENSE) and [upstream/lite-0.11.0/LICENSE](upstream/lite-0.11.0/LICENSE). See [NOTICE](NOTICE) for attribution.
