# Supalite

An experimental integration of open contributions to the published `@supabase/lite` **0.11.0** package. [Main](https://github.com/jmonster/supalite/tree/main) retains the editable baseline; the contributions remain separately reviewable and unmerged.

## Graduate an authenticated app

[Move a private task and attachment to the full Supabase stack, run locally](examples/functions-portable/README.md), using the same SDK client and portable TypeScript function. The example signs up two users, enforces ownership, migrates populated SQLite state, and verifies fresh password sign-in with the same UUIDs and attachment bytes.

From this branch's repository root, using Bun 1.4.2:

```sh
bun install --frozen-lockfile
bun examples/functions-portable/graduate.mjs --lite-only
```

For the complete route, follow the [graduation guide](examples/functions-portable/README.md) with Supabase CLI 2.119.0 on a host permitting PostgreSQL Unix sockets. The [passing qualification](https://github.com/jmonster/supalite/actions/runs/37235887887) uses official Supabase services locally; managed-hosted deployment remains unqualified. The guide documents session handling and migration limits.

Bun hosts Lite, SQLite and trusted function workers in one process. Functions use ordinary imports and default `{ fetch }` handlers, with host permissions. See [runtime support and limits](upstream/lite-0.11.0/docs/other/edge-functions.mdx).

## Evidence and review

- [Lifecycle measurements](docs/evidence/README.md): reproducible restarts, persisted Auth/data/private-file checks, timing, memory and measurement scope
- Focused fixes: [repeated filters (#18)](https://github.com/jmonster/supalite/pull/18), [password sign-in after upgrade (#21)](https://github.com/jmonster/supalite/pull/21), and [singular-mutation rollback (#34)](https://github.com/jmonster/supalite/pull/34)
- [Further contributions](https://github.com/jmonster/supalite/pulls), [JSONB design](docs/design-and-porting.md) and [benchmark reproduction](docs/performance.md)

Optionally run `bun run test` for the supported suite. Tests import the tracked implementation; [native-Node streaming cases remain skipped under Bun](docs/streaming-upgrade.md#verification).

## Package and provenance

`upstream/lite-0.11.0/` contains editable JavaScript, declarations and assets from the npm package; original TypeScript sources were not published. Original bytes are preserved in [commit 514fe614](https://github.com/jmonster/supalite/commit/514fe6148b412ad4fdfe3eb2b3baed916e7e4911) and the [npm tarball](https://registry.npmjs.org/@supabase/lite/-/lite-0.11.0.tgz), with [checksums](upstream/manifest.json).

The upstream Apache-2.0 [license](LICENSE) and [attribution](NOTICE) are preserved.
