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

Run the existing Lite CLI under Bun to serve `supabase/functions/<name>/index.ts` through normal `dev` / `start`. Functions export a conventional default `{ fetch }` handler and use ordinary package imports. Lite, SQLite, and native Bun workers share one process. The app's SDK calls and portable function source can graduate unchanged to Supabase, with dependency and deployment configuration for each runtime.

[Install Bun 1.4.2 or later](https://bun.com/docs/installation), run `bun install` at the repository root, then start the portable SQLite example:

```sh
cd examples/functions-portable
bun install
bun ../../upstream/lite-0.11.0/dist/cli/index.js dev \
  --config supabase/config.lite.toml --no-admin
```

In a second terminal, from `examples/functions-portable`:

```sh
SUPABASE_URL=http://127.0.0.1:54321 \
SUPABASE_PUBLISHABLE_KEY=sb_publishable_portability_demo \
bun app/acceptance.mjs
```

The eight checks cover SDK create/read/update, independent Data API reads, validation, routing, and function-owned CORS. SQLite persists the data. The function and original client checks have also passed locally against official Supabase Edge Runtime 1.77.1 with the exact same function source; its Supabase `deno.json` maps both SDK imports to the same pinned package version used by Bun. Hosted deployment has not been tested.

The separate local config adapts the database and keys and deliberately disables gateway JWT verification and user sign-in for this demo. Bun resolves installed packages directly; Lite does not interpret Deno import maps or emulate `Deno.serve`, Deno APIs, or direct `npm:` / `jsr:` imports. Workers execute trusted project code and are not a permission sandbox. See [Functions support and limits](upstream/lite-0.11.0/docs/other/edge-functions.mdx).

## License

The upstream Apache-2.0 license is preserved in [LICENSE](LICENSE) and [upstream/lite-0.11.0/LICENSE](upstream/lite-0.11.0/LICENSE). See [NOTICE](NOTICE) for attribution.
