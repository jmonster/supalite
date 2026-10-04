# Supalite

## Start here

Contributions cover SQLite API compatibility and migration to full Supabase. The integration branch combines the unmerged changes in an authenticated app verified against the official Supabase stack, run locally.

- [Authenticated graduation demo](https://github.com/jmonster/supalite/blob/integration/graduation-demo/examples/functions-portable/README.md): preserve users, private tasks, attachment bytes and portable TypeScript function source when moving to the full Supabase stack (run locally)
- [Lifecycle measurements](https://github.com/jmonster/supalite/blob/integration/graduation-demo/docs/evidence/README.md): reproducible process restarts, persistence checks, timing and memory observations with explicit limits
- Focused fixes to review: [repeated filters (#18)](https://github.com/jmonster/supalite/pull/18), [password sign-in after upgrade (#21)](https://github.com/jmonster/supalite/pull/21), and [singular-mutation rollback (#34)](https://github.com/jmonster/supalite/pull/34)

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

## License

The upstream Apache-2.0 license is preserved in [LICENSE](LICENSE) and [upstream/lite-0.11.0/LICENSE](upstream/lite-0.11.0/LICENSE). See [NOTICE](NOTICE) for attribution.
