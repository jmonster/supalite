# Supalite

This repository preserves the published `@supabase/lite` **0.11.0** npm distribution as a reproducible baseline. This branch corrects Supabase-target auth-user field compatibility during upgrade.

## Contents

- `upstream/lite-0.11.0/`: all 77 files from the [published npm tarball](https://registry.npmjs.org/@supabase/lite/-/lite-0.11.0.tgz), with their original bytes and file modes
- `upstream/manifest.json`: package version, npm integrity, tarball SHA-256, and each file's SHA-256, size, and mode
- `scripts/prepare-baseline.mjs`: validates the installed package, lockfile integrity, and complete vendored distribution, then copies the vendored files into `.generated/baseline/node_modules/@supabase/lite/`
- `src/upgrade/auth-users.ts`: focused Supabase-target auth-user normalization
- `scripts/prepare-auth-upgrade.mjs`: creates a separately generated candidate through a hash-guarded integration seam
- `test/`: adapter smoke tests and auth-export regression tests using real Lite Auth users and PostgreSQL-compatible SQL execution

The npm artifact contains bundled JavaScript, type declarations, and package documentation. It does not contain the original upstream TypeScript implementation. The files under `upstream/lite-0.11.0/` are the published distribution.

## Run

Requires Node.js 24 or later.

```sh
npm ci
npm test
```

`npm test` builds the TypeScript contribution, verifies the baseline, and tests a separately generated candidate. It runs the adapter smoke tests plus auth-export regressions. See [auth user compatibility during upgrade](docs/upgrade-auth-users.md) for the reproduced failure, source references, implementation boundary and verification limits.

To verify and copy the distribution without running the smoke tests:

```sh
npm run prepare:baseline
```

Generated files and installed dependencies are ignored; the vendored `dist/` files are tracked.

## License

The upstream Apache-2.0 license is preserved in [LICENSE](LICENSE) and [upstream/lite-0.11.0/LICENSE](upstream/lite-0.11.0/LICENSE). See [NOTICE](NOTICE) for attribution.
