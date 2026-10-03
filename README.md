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

`npm test` verifies the baseline, builds the binary export fix, and runs the focused upgrade regression tests plus the SDK smoke tests. Schema setup uses the package's migrator. These tests do not establish comprehensive compatibility.

To verify and copy the distribution without running the smoke tests:

```sh
npm run prepare:baseline
```

Generated files and installed dependencies are ignored; the vendored `dist/` files are tracked.

## Binary upgrade export

### Problem

The published user-data exporter treats binary driver values as JSON objects.
For a `bytea` column, both nonempty and empty binary values become `::jsonb`
expressions, and PostgreSQL rejects the generated insert with SQLSTATE `42804`.
The documented PostgreSQL-to-SQLite mapping supports `bytea` as `BLOB`.

### Change

[`src/upgrade/binary-value.ts`](src/upgrade/binary-value.ts) formats `ArrayBuffer`
and its views as hexadecimal `decode(..., 'hex')` expressions, which return
`bytea`. Views use their exact byte offset and length. The helper does not coerce
plain objects, arrays, strings, or nulls into binary data, and existing typed JSON
handling remains unchanged.

The package does not publish its original TypeScript source. A small exact-hash
guarded seam in `scripts/patch-upgrade-binary.mjs` attaches this implementation to
a generated copy of the shipped CLI. All 77 vendored files remain unmodified.

### Tests

- The shipped exporter fails with `42804`; the candidate exporter round-trips
  mixed bytes, every byte value, empty binary values, and nulls into PGlite
- Source adapters include Node SQLite and PGlite (`Uint8Array`), plus libSQL
  (`ArrayBuffer`), using real driver results
- Buffer and typed-array slices, DataView offsets, JSON objects, strings, nulls,
  and recursive `bytea[]` formatting have focused regression coverage
- Foreign-key ordering, generated-column omission, serial sequence resets, and
  source rows are unchanged

Run `npm test` for the type build, distribution guards, SDK smoke tests, and
binary export regressions. All database execution is local to the test process.

## License

The upstream Apache-2.0 license is preserved in [LICENSE](LICENSE) and [upstream/lite-0.11.0/LICENSE](upstream/lite-0.11.0/LICENSE). See [NOTICE](NOTICE) for attribution.
