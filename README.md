# Supalite

An editable baseline of the published `@supabase/lite` **0.11.0** package. Main retains the original package's functionality; feature changes remain on their respective branches until merged.

## JSONB containment

SQLite JSONB filters support `.contains()` and `.containedBy()` on nested objects and arrays, including counts, pagination, updates, and deletes. This applies to columns declared as `jsonb`; PostgreSQL and SQL-array operators keep their existing behavior.

Pass object operands directly, but serialize JSON arrays and scalars, for example `.contains('body', JSON.stringify([{ color: 'red', size: 'M' }]))`. Supabase-js encodes a directly supplied JavaScript array as a PostgreSQL array literal.

Run `bun run demo` for the [catalog example](examples/catalog.mjs), `bun run test:core` for compiler differential tests, and `bun run benchmark` for [local measurements](docs/performance.md). See [design and limits](docs/design-and-porting.md) for supported behavior and runtime limitations.

## Repeated filters

Repeated filters on one column are combined with AND. For example, `.neq('category', 'fruit').neq('category', 'vegetable')` excludes both categories. This also preserves repeated negated filters and existing logical groups on Node SQLite, libSQL, and PGlite; `bun run test` includes regressions across all three adapters.

## Guest accounts

Opt-in anonymous sign-in lets a guest save data, verify an email, and add a
password while retaining the same user ID. See [the workflow and deployment
requirements](docs/anonymous-onboarding.md).

Tests cover the guest lifecycle, email-auth regressions, rollback, and conflict handling.

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

## Auth upgrade compatibility

See [behavior, validation and limits](docs/upgrade-auth-users.md). Run `bun run test` against the tracked implementation.

## Native local upgrade

Opt in with `lite upgrade --target local --local-runtime native --local-dir <fresh-directory>`. See [official native stack support, Functions preservation and safety limits](docs/upgrade-native-local.md). The legacy local runtime remains the default.

## Binary upgrade fidelity

See [behavior, validation and limits](docs/upgrade-binary-values.md). Run `bun run test` against the tracked implementation.

## Identity upgrade continuation

See [behavior, validation and limits](docs/upgrade-identity.md). Run `bun run test` against the tracked implementation.

## PGlite NULL-array fix

### Problem

When Lite reads temporal or text arrays, PGlite 0.4.5 decodes SQL NULL elements as the string `"NULL"`. Lite's upgrade exporter consequently writes quoted `'NULL'` elements, causing `date[]`, `time[]`, `timetz[]`, `timestamp[]`, and `timestamptz[]` imports to fail with SQLSTATE `22007`. In `text[]`, the same bug silently changes nulls into literal strings.

### Change

Pin the working package and regression dependencies to PGlite 0.4.6, the first release containing the [upstream array-NULL parser fix](https://github.com/electric-sql/pglite/commit/2aa4d1ae89ba20283441f4b7088e1d25c1b60f8e). The checked-in working package's `package.json` is updated directly, along with the root dependency and lockfile. A root package override keeps the pinned reference dependency on the same PGlite version. No parser or exporter algorithm is replaced.

### Tests

The regression tests import the tracked PGlite adapter and CLI upgrade exporter directly. They do not copy, rewrite, or generate runtime code. They check all five temporal array types and `text[]`, including mixed and all-null arrays, whole-column NULL, empty arrays, six-digit fractional seconds, timezone offsets, and quoted `"NULL"` versus SQL NULL. Exported inserts are replayed into emptied fixture tables and compared with captured server-side SQL text and null checks.

Multidimensional decoding is also checked. Multidimensional upgrade export remains an existing exporter limitation and is outside this dependency fix. PGlite 0.4.6 also includes ICU, initialization/exit-code, and filesystem API changes; the full [release changelog](https://github.com/electric-sql/pglite/blob/main/packages/pglite/CHANGELOG.md#046) lists them.

## Bounded Node SQLite upgrades

See [behavior, validation and limits](docs/streaming-upgrade.md). Run `bun run test` against the tracked implementation.

## HEAD response serialization

Successful table/view HEAD responses skip final JSON/CSV formatting and UTF-8 encoding and omit `Content-Length`. Queries, row transformations, counts, validation, GET, RPC and error responses are unchanged.

`bun run benchmark:head` prints raw timings for narrow and 4 KiB-wide JSON/CSV HEAD requests over 1,000 rows on local Node SQLite/libSQL. Run the same script in the baseline checkout for comparison. A prior paired run on Node 24.19.0 / AMD EPYC 9V74 measured 38–52% lower wide-response medians; narrow results were small and mixed (including a 7% slowdown). These are shared-machine microbenchmarks, not production throughput or database-work savings; hosted backends and heap allocation were not measured.

## Authenticated graduation example

[Graduate a private task and attachment](examples/functions-portable/README.md) from SQLite to local Supabase using the same SDK client and portable TypeScript function. The example signs up two users, enforces row and file ownership, migrates populated state, and verifies fresh password sign-in with the same UUIDs and attachment bytes. Sessions are not migrated.

```sh
bun examples/functions-portable/graduate.mjs --lite-only
```

For the complete native Supabase route, install Supabase CLI 2.119.0 and follow the example's one-command instructions. The route needs a host that permits PostgreSQL Unix sockets. The example is an integration demonstration of the open contributions on this branch; individual contributions remain separately reviewable.

Functions use ordinary package imports and default `{ fetch }` handlers. Bun runs Lite, SQLite and function workers in one process; Supabase resolves the same function through its `deno.json`. Trusted workers are not a permission sandbox. See [Functions support and limits](upstream/lite-0.11.0/docs/other/edge-functions.mdx).

## License

The upstream Apache-2.0 license is preserved in [LICENSE](LICENSE) and [upstream/lite-0.11.0/LICENSE](upstream/lite-0.11.0/LICENSE). See [NOTICE](NOTICE) for attribution.
