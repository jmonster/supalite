# Supalite

This repository preserves the published `@supabase/lite` **0.11.0** npm distribution as a reproducible baseline.

## Contents

- `upstream/lite-0.11.0/`: all 77 files from the [published npm tarball](https://registry.npmjs.org/@supabase/lite/-/lite-0.11.0.tgz), with their original bytes and file modes
- `upstream/manifest.json`: package version, npm integrity, tarball SHA-256, and each file's SHA-256, size, and mode
- `scripts/prepare-baseline.mjs`: validates the installed package, lockfile integrity, and complete vendored distribution, then copies the vendored files into `.generated/baseline/node_modules/@supabase/lite/`
- `test/`: basic integration smoke tests using `@supabase/supabase-js` with the Node SQLite, libSQL, and PGlite adapters

The npm artifact contains bundled JavaScript, type declarations, and package documentation. It does not contain the original upstream TypeScript implementation. The files under `upstream/lite-0.11.0/` are the published distribution.

## Run

Requires Node.js 24 or later.

```sh
npm ci
npm test
```

`npm test` first verifies and prepares the baseline, then checks the PGlite array regressions below and SDK insert, select, equality-filter, and exact-count operations on each adapter. Schema setup in the SDK smoke tests uses the package's migrator. These checks do not establish comprehensive compatibility.

To verify and copy the distribution without running the smoke tests:

```sh
npm run prepare:baseline
```

Generated files and installed dependencies are ignored; the vendored `dist/` files are tracked.

## PGlite NULL-array fix

### Problem

When Lite reads temporal or text arrays, PGlite 0.4.5 decodes SQL NULL elements as the string `"NULL"`. Lite's upgrade exporter consequently writes quoted `'NULL'` elements, causing `date[]`, `time[]`, `timetz[]`, `timestamp[]`, and `timestamptz[]` imports to fail with SQLSTATE `22007`. In `text[]`, the same bug silently changes nulls into literal strings.

### Change

Pin PGlite to 0.4.6, the first release containing the [upstream array-NULL parser fix](https://github.com/electric-sql/pglite/commit/2aa4d1ae89ba20283441f4b7088e1d25c1b60f8e). A root npm override applies it to Lite's exact 0.4.5 dependency. All 77 published Lite files, including its original `package.json`, remain byte-identical; the equivalent upstream source change is a PGlite dependency and lockfile bump. No parser or exporter implementation is replaced.

### Tests

The regression tests use Lite's actual PGlite adapter and the bundled upgrade exporter. They check all five temporal array types and `text[]`, including mixed and all-null arrays, whole-column NULL, empty arrays, six-digit fractional seconds, timezone offsets, and quoted `"NULL"` versus SQL NULL. Exported inserts are replayed into a fresh PGlite database and compared using server-side SQL text and null checks.

Multidimensional decoding is also checked. Multidimensional upgrade export remains an existing exporter limitation and is outside this dependency fix. PGlite 0.4.6 also includes ICU, initialization/exit-code, and filesystem API changes; the full [release changelog](https://github.com/electric-sql/pglite/blob/main/packages/pglite/CHANGELOG.md#046) lists them.

## License

The upstream Apache-2.0 license is preserved in [LICENSE](LICENSE) and [upstream/lite-0.11.0/LICENSE](upstream/lite-0.11.0/LICENSE). See [NOTICE](NOTICE) for attribution.
