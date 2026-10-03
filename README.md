# Supalite

This repository preserves the published `@supabase/lite` **0.11.0** npm distribution as a reproducible baseline. This branch adds a focused upgrade correction that keeps migration metadata out of application-data export.

## Contents

- `upstream/lite-0.11.0/`: all 77 files from the [published npm tarball](https://registry.npmjs.org/@supabase/lite/-/lite-0.11.0.tgz), with their original bytes and file modes
- `upstream/manifest.json`: package version, npm integrity, tarball SHA-256, and each file's SHA-256, size, and mode
- `scripts/prepare-baseline.mjs`: validates the installed package, lockfile integrity, and complete vendored distribution, then copies the vendored files into `.generated/baseline/node_modules/@supabase/lite/`
- `src/upgrade/migration-metadata.ts`: exact-identity classification for upgrade metadata
- `scripts/prepare-upgrade-history.mjs`: a hash-guarded candidate integration over the baseline
- `test/`: adapter smoke tests and real CLI/export/replay regression tests

The npm artifact contains bundled JavaScript, type declarations, and package documentation. It does not contain the original upstream TypeScript implementation. The files under `upstream/lite-0.11.0/` are the published distribution.

## Run

Requires Node.js 24 or later.

```sh
npm ci
npm test
```

`npm test` compiles the TypeScript predicate, verifies and prepares the baseline, builds a separate candidate, and runs the SDK smoke tests plus SQLite/PGlite upgrade regressions.

See [upgrade migration metadata](docs/upgrade-migration-metadata.md) for the reproduction, exact filtering boundary, tests, and verification limits.

To verify and copy the distribution without running the smoke tests:

```sh
npm run prepare:baseline
```

Generated files and installed dependencies are ignored; the vendored `dist/` files are tracked.

## License

The upstream Apache-2.0 license is preserved in [LICENSE](LICENSE) and [upstream/lite-0.11.0/LICENSE](upstream/lite-0.11.0/LICENSE). See [NOTICE](NOTICE) for attribution.
