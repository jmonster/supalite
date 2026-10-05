# Supalite

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

## Portable Edge Functions

Bun-hosted `dev` and `start` serve default-export `{ fetch }` handlers through the Supabase SDK. See the [setup guide and SQLite example](upstream/lite-0.11.0/docs/other/edge-functions.mdx) for commands and dependency mappings. The unchanged example function and client passed against official local Supabase; its demo disables sign-in and gateway JWT verification.

Workers run trusted code with host permissions. Deno APIs and import-map resolution are unsupported; hosted deployment remains untested.

## License

The upstream Apache-2.0 license is preserved in [LICENSE](LICENSE) and [upstream/lite-0.11.0/LICENSE](upstream/lite-0.11.0/LICENSE). See [NOTICE](NOTICE) for attribution.
