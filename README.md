# Supalite

This repository preserves the published `@supabase/lite` **0.11.0** npm distribution as a reproducible baseline.

This focused patch makes a counted page starting exactly at the matching row
count succeed with an empty result. See [exact-end pagination](docs/exact-end-pagination.md)
for the SDK example, official source evidence, and preserved behavior.

## Contents

- `upstream/lite-0.11.0/`: all 77 files from the [published npm tarball](https://registry.npmjs.org/@supabase/lite/-/lite-0.11.0.tgz), with their original bytes and file modes
- `upstream/manifest.json`: package version, npm integrity, tarball SHA-256, and each file's SHA-256, size, and mode
- `scripts/prepare-baseline.mjs`: validates the installed package, lockfile integrity, and complete vendored distribution, then copies the vendored files into `.generated/baseline/node_modules/@supabase/lite/`
- `scripts/patch-pagination.mjs`: a guarded one-operator correction to the empty-page boundary
- `scripts/prepare-pagination.mjs`: prepares a separate candidate without changing the baseline
- `test/`: baseline smoke tests and focused pagination regressions using `@supabase/supabase-js` with the Node SQLite, libSQL, and PGlite adapters

The npm artifact contains bundled JavaScript, type declarations, and package documentation. It does not contain the original upstream TypeScript implementation. The files under `upstream/lite-0.11.0/` are the published distribution.

## Run

Requires Node.js 24 or later.

```sh
npm ci
npm test
```

`npm test` verifies and prepares the baseline and candidate, runs the original
baseline guards/smoke tests, and checks exact-end pagination plus unchanged
boundary controls across Node SQLite, libSQL, and PGlite. It includes real SDK
GET/HEAD requests and stable set-returning RPCs. These tests do not establish
comprehensive compatibility.

To verify and copy the distribution without running the smoke tests:

```sh
npm run prepare:baseline
```

Generated files and installed dependencies are ignored; the vendored `dist/` files are tracked.

## License

The upstream Apache-2.0 license is preserved in [LICENSE](LICENSE) and [upstream/lite-0.11.0/LICENSE](upstream/lite-0.11.0/LICENSE). See [NOTICE](NOTICE) for attribution.
