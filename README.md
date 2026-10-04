# Supalite

This repository preserves the published `@supabase/lite` **0.11.0** npm distribution as a reproducible baseline.

The focused HEAD response patch avoids formatting and encoding a body that the
server discards. It applies only to successful table/view HEAD requests; query
execution, counts, transformations, singular checks, and errors are preserved.

## Contents

- `upstream/lite-0.11.0/`: all 77 files from the [published npm tarball](https://registry.npmjs.org/@supabase/lite/-/lite-0.11.0.tgz), with their original bytes and file modes
- `upstream/manifest.json`: package version, npm integrity, tarball SHA-256, and each file's SHA-256, size, and mode
- `scripts/prepare-baseline.mjs`: validates the installed package, lockfile integrity, and complete vendored distribution, then copies the vendored files into `.generated/baseline/node_modules/@supabase/lite/`
- `scripts/patch-head-response.mjs`: two exact-match, guarded replacements for final HEAD response formatting
- `scripts/prepare-head.mjs`: prepares `.generated/candidate/` from the verified baseline without modifying installed or vendored files
- `test/`: basic integration smoke tests using `@supabase/supabase-js` with the Node SQLite, libSQL, and PGlite adapters

The npm artifact contains bundled JavaScript, type declarations, and package documentation. It does not contain the original upstream TypeScript implementation. The files under `upstream/lite-0.11.0/` are the published distribution.

## Run

Requires Node.js 24 or later.

```sh
npm ci
npm test
```

`npm test` verifies both the installed and vendored distributions, prepares the
baseline and patched copies, and runs baseline guards/smoke tests plus focused
HEAD regressions. Coverage includes Node SQLite, local libSQL, PGlite table/view
and RPC responses, and an ephemeral loopback HTTP server. Performance
measurements are separate from the test suite:

```sh
npm run benchmark:head
```

The optional benchmark writes raw paired timings to `.generated/head-benchmark.json`.
See [HEAD response behavior and measurements](docs/head-responses.md) for the
intentional header change, measured results, and remaining limits. These checks
do not establish comprehensive compatibility.

To verify and copy the distribution without running the smoke tests:

```sh
npm run prepare:baseline
```

Generated files and installed dependencies are ignored; the vendored `dist/` files are tracked.

## License

The upstream Apache-2.0 license is preserved in [LICENSE](LICENSE) and [upstream/lite-0.11.0/LICENSE](upstream/lite-0.11.0/LICENSE). See [NOTICE](NOTICE) for attribution.
