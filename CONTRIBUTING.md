# Contributing

Requires Node.js 24 or newer.

```sh
npm ci
npm test
```

`npm test` builds the TypeScript, prepares checksum-verified baseline and patched packages, and runs compiler and request-level tests. `npm run test:core` runs only the compiler differential tests; use the full suite for parser, adapter, path, or request-composition changes.

## Changes

Keep pull requests focused on one behavior and include a regression test. SQL-compatibility tests should execute the corresponding PostgreSQL operation as a reference. Cover positive and negative cases, type distinctions, missing values, SQL NULL, and interactions with existing filters.

For performance changes, run `npm run benchmark`. Record engine versions and workload sizes, verify returned rows and counts, and distinguish compilation, SQL execution, and request timings. Document remaining correctness and runtime limitations.

Do not commit `node_modules/`, `dist/`, `.generated/`, or generated benchmark reports. Edit `src/`, tests, or the preparation script; generated files are rebuilt.

## Baseline updates

The package version, lockfile integrity, bundle checksum, and patch locations must match the published artifact. A baseline update requires checking those values and running the complete test suite. Keep the exact-match guards in `scripts/prepare-baseline.mjs`.
