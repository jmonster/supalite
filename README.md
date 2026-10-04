# Supalite

This repository preserves the published `@supabase/lite` **0.11.0** npm distribution as a reproducible baseline.

## Anonymous onboarding candidate

The candidate adds opt-in anonymous sign-in and same-user email conversion.
See [the workflow and deployment boundary](docs/anonymous-onboarding.md).
The readable implementation is in `src/auth/anonymous-auth.mjs`; no vendored
files are edited.

## Contents

- `upstream/lite-0.11.0/`: all 77 files from the [published npm tarball](https://registry.npmjs.org/@supabase/lite/-/lite-0.11.0.tgz), with their original bytes and file modes
- `upstream/manifest.json`: package version, npm integrity, tarball SHA-256, and each file's SHA-256, size, and mode
- `scripts/prepare-baseline.mjs`: validates the installed package, lockfile integrity, and complete vendored distribution, then copies the vendored files into `.generated/baseline/node_modules/@supabase/lite/`
- `test/`: guest onboarding, email-auth regressions, CLI and baseline integration checks using `@supabase/supabase-js` with Node SQLite, libSQL, and PGlite

The npm artifact contains bundled JavaScript, type declarations, and package documentation. It does not contain the original upstream TypeScript implementation. The files under `upstream/lite-0.11.0/` are the published distribution.

## Run

Requires Node.js 24 or later.

```sh
npm ci
npm test
```

`npm test` verifies the baseline and prepares the guarded candidate, then runs the guest lifecycle, existing email-auth regressions, CLI startup, and baseline SDK insert/select/filter/count checks. The adapter tests cover Node SQLite, libSQL, and PGlite. Schema setup uses the package's migrator.

To verify and copy the distribution without running the smoke tests:

```sh
npm run prepare:baseline
```

Generated files and installed dependencies are ignored; the vendored `dist/` files are tracked.

## License

The upstream Apache-2.0 license is preserved in [LICENSE](LICENSE) and [upstream/lite-0.11.0/LICENSE](upstream/lite-0.11.0/LICENSE). See [NOTICE](NOTICE) for attribution.
