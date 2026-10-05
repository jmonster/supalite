> [!WARNING]
> **🚧 Alpha.** Supalite is pre-1.0 and under active development. APIs, config shape, and on-disk format may change. Not for production use yet. See [Feature Overview](#feature-overview) for current state.

![npm version](https://img.shields.io/npm/v/@supabase/lite)
![Status](https://img.shields.io/badge/status-alpha-orange)

![Supalite Banner](https://docs.lite.dev/banner.png)

# Supabase Lite

Lightweight TypeScript-native Supabase implementation. SQLite as the primary database, with PGlite and Postgres support. Ships a PostgREST-compatible REST API and a GoTrue-compatible Auth API, so `@supabase/supabase-js` works as-is.

Supalite targets AI builders who want quick, cheap prototypes today with a clear path to upgrade later. It supplements Supabase rather than replacing it. The project stays lightweight by implementing only what fits on top of stock SQLite: roughly 60% of the most-used Supabase features, focused on the subset most useful for fast iteration.

**Scope:** Both declarative schema (`supabase/schemas/*.sql`) and imperative Postgres migrations (`supabase/migrations/*.sql`, Supabase-CLI compatible) are supported. See [Migrations](#migrations). Advanced Postgres-specific column types (ranges, arrays of composites, and similar) are not available.

Correctness is checked against an internal spec suite derived from the upstream PostgREST and GoTrue test suites: ~2,400 Data API and ~500 Auth cases, replayed against every backend with zero failures. Together with the repo's own suite that's ~32k assertions. See [Testing](https://github.com/supabase/lite/blob/HEAD/STATUS.md#testing) for current pass rates and skips.

---

## Agents & Skill

If you're an agent working on a supalite project, read these first:

- [`LIMITATIONS.md`](https://github.com/supabase/lite/blob/HEAD/LIMITATIONS.md) — what's unsupported / partial, plus anti-patterns. Token-efficient cheat sheet.
- [`PATTERNS.md`](https://github.com/supabase/lite/blob/HEAD/PATTERNS.md) — canonical recipes (per-user RLS, embedded filter workarounds, custom server logic, Vite cold start, triggers).
- The full product documentation, shipped in the package at `node_modules/@supabase/lite/docs/` (index: `llms.txt`) and published at [docs.lite.dev](https://docs.lite.dev).

The npm package ships a [`supalite` skill](https://github.com/supabase/lite/blob/HEAD/skills/supalite/SKILL.md). After `npm install`, link it into your agent's skills dir so the cold-start checklist, routing rule, and limitation pointers trigger automatically:

```bash
# Agent standard: project-scoped install
mkdir -p .agents/skills && ln -s ../../node_modules/@supabase/lite/skills/supalite .agents/skills/supalite

# Claude Code: project-scoped install
mkdir -p .claude/skills && ln -s ../../node_modules/@supabase/lite/skills/supalite .claude/skills/supalite
```

The skill itself points at the installed docs (not their content), so updates land for every consumer on the next `npm install`.

---

## Feature overview

Compatibility is measured from the `@supabase/supabase-js` surface. The goal is that code written against Supabase keeps working when pointed at @supabase/lite. Direct database access (raw SQL clients, Postgres wire protocol, `psql`) is **not** a target; everything below is scoped to what supabase-js exercises.

For a per-capability parity view with effort estimates and feasibility notes for unsupported features, see [FEATURES.md](https://github.com/supabase/lite/blob/HEAD/FEATURES.md).

| Service                 | Status | Notes                                                              |
|-------------------------|--------|--------------------------------------------------------------------|
| [Databases](https://github.com/supabase/lite/blob/HEAD/STATUS.md#database-support)               | ✅     | `bun:sqlite`, `node:sqlite`, sqlite-wasm, Cloudflare D1 + DO, PGlite, PostgreSQL |
| [Data API (PostgREST)](https://github.com/supabase/lite/blob/HEAD/STATUS.md#database-api-postgrest-compatible)    | ✅     | 54/74 supabase-js methods on SQLite: `from`, `select`, `insert`, `update`, `delete`, `upsert`, `eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `in`, `notIn`, `is`, `isDistinct`, `like`, `ilike`, `likeAllOf`, `likeAnyOf`, `ilikeAllOf`, `ilikeAnyOf`, `match`, `or`, `not`, `filter`, `order`, `limit`, `range`, `single`, `maybeSingle`, `csv`, `abortSignal`, `setHeader`, `throwOnError`, `maxAffected`, `returns`, `overrideTypes`, plus full resource embedding (FK joins, `!inner`, spreads, nested, aggregates). Partial: `contains`, `containedBy`, `overlaps`, `textSearch` (LIKE-based lexeme approximation), `regexMatch`/`regexIMatch` (simple anchored patterns), `schema` (configured schemas, no namespace isolation). `rpc` not supported on SQLite. 72/74 on Postgres. |
| [Auth API (GoTrue)](https://github.com/supabase/lite/blob/HEAD/STATUS.md#auth-api-gotrue-compatible)       | ✅     | 23/63 supabase-js methods (13 backend + 10 client-side helpers): `signUp`, `signInWithPassword`, `signInWithOtp`, `verifyOtp`, `refreshSession`, `signOut`, `getUser`, `updateUser`, `resetPasswordForEmail`, `resend`, `reauthenticate`, `signInWithOAuth`, `exchangeCodeForSession`. OAuth covers `github`/`google` only (PKCE + implicit, automatic account linking); other providers (incl. Apple), anonymous sign-in, manual identity linking, admin API, and MFA planned. |
| [Storage API](https://github.com/supabase/lite/blob/HEAD/STATUS.md#storage-api-compatible)             | 🧪     | 20/20 supabase-js methods: `upload`, `download`, `list`, `remove`, `move`, `copy`, `info`, `exists`, `update`, `getPublicUrl`, `createSignedUrl`, `createSignedUrls`, `createSignedUploadUrl`, `uploadToSignedUrl`, `listBuckets`, `getBucket`, `createBucket`, `updateBucket`, `deleteBucket`, `emptyBucket`. For access-control behavior and policy limits, see the [Storage guide](docs/storage/overview.mdx#whats-implemented) and [limitations](docs/storage/limitations.mdx). <br />⚠️ Gated behind `EXPERIMENTAL_STORAGE`. |
| Realtime                | 🔄     | Coming soon                                                        |
| Edge Functions          | 🔄     | Coming soon                                                        |
| Cloud Hosting           | 🔄     | Coming soon |
| [CLI](https://github.com/supabase/lite/blob/HEAD/STATUS.md#cli)                                 | ✅     | Upstream `supabase` CLI parity for: `init`, `start`, `db diff`, `db query`. Aligned to v2.98.2 command shape. |
| [Upgrade to Supabase](UPGRADE.md)                    | 🧪    | `lite upgrade` migrates a project to hosted or local Supabase: schema + user-table data + auth sessions (signing-key import). [Local filesystem Storage](UPGRADE.md#local-filesystem-storage) migrates only from quiescent `sqlite-postgres` projects into fresh targets; hosted/custom-adapter Storage and Realtime migration remain unsupported. SQLite shim health audit via `--dry-run`. |

---

## Install

```bash
npm install -g @supabase/lite     # global, exposes `lite` CLI
# or per-project: npm install @supabase/lite  (run via `npx @supabase/lite <cmd>`)
```

## Quick start

```bash
lite init      # scaffold supabase/ directory
lite dev       # start server with schema hot-reload
```

The API is now running at `http://127.0.0.1:54321`. Point `@supabase/supabase-js` at it:

`lite init` also generates any missing publishable/secret API key(s) into root `.env` (per-variable, never overwrites an existing one) and prints them:

```typescript
import { createClient } from "@supabase/supabase-js";

const supabase = createClient("http://127.0.0.1:54321", "<sb_publishable_...>");
const { data } = await supabase.from("todos").select("*");
```

> Use the printed `sb_publishable_*` key as the anon key. If no keys are configured, any/no `apikey` is accepted (old behavior) — see [API keys](#api-keys).

Edit `supabase/schemas/schema.sql` and the dev server re-applies the schema automatically.

---

## When to use what

| Scenario | Use | Notes |
|---|---|---|
| Vite frontend (React/Vue/Svelte/…) | [`@supabase/lite/vite` plugin](#vite-plugin) | Same-process. No separate CLI. API mounted on the Vite dev server. |
| Non-Vite app, want auto schema-reload | `lite dev` | Separate process. Watches `schemas/*.sql`, re-applies on change. |
| Non-Vite app, manual control / CI / prod-like | `lite start` | Separate process. No watch, no auto-migrate. |

> Run only one backend per project. Never run `lite dev` and `lite start` together, or either command alongside the Vite plugin: they would race migrations and schema reconciliation against the same SQLite file.

Known limitations across all paths: see [LIMITATIONS.md](https://github.com/supabase/lite/blob/HEAD/LIMITATIONS.md). Canonical recipes: see [PATTERNS.md](https://github.com/supabase/lite/blob/HEAD/PATTERNS.md).

---

## CLI

```
lite <command> [options]
```

By default, command output stays pipe-friendly: SQL, JSON, and query results are
not prefixed with banners or config diagnostics. Use `lite --verbose <command>`
to show details like the config file and database location on stderr.

### Local commands

| Command          | Description                                                   |
|------------------|---------------------------------------------------------------|
| `init`           | Scaffold `supabase/` (config, schema, seed, data dir); generates any missing API key(s) into `.env` |
| `generate-keys`  | (Re)generate the publishable/secret API key pair, upsert `.env`        |
| `dev`            | Start server + watch `schemas/*.sql`, auto-apply on change    |
| `start`          | Start server (no watch, no auto-migrate)                      |
| `db schema`      | Print current DB schema; `--diff` compares vs `schemas/*.sql` |
| `db diff`        | Emit a new pg-DDL migration from the declarative schema diff  |
| `db translate`   | Translate Postgres SQL to this project's backend dialect (arg or stdin) |
| `db query`       | Run a SQL statement against the local DB (arg or stdin)       |
| `db reset`       | Drop everything, replay migrations, run seed (`--hard` = fresh DB file) |
| `migration new`  | Create an empty migration file in `supabase/migrations/`      |
| `migration up`   | Apply pending migrations (`--dry-run` to preview)             |
| `migration list` | Show applied vs pending migrations                           |
| `repl`           | Interactive REPL with `app`, `client`, `conn` in scope        |
| `upgrade`        | Replay Postgres migrations and move Auth/data to hosted or local Supabase (see [UPGRADE.md](https://github.com/supabase/lite/blob/HEAD/UPGRADE.md)) |
| `debug`          | Show runtime/config info                                      |

`lite dev` and `lite start` bind `127.0.0.1` by default. Pass `--host` to listen on all interfaces, matching Vite's flag, or `--host <address>` to choose one explicitly. An exposed listener defaults admin mode off; add `--admin` only when peer-scoped local Studio access is intentional.

### Hosted push commands

Set `EXPERIMENTAL_CLOUD=1`, sign in with `lite login`, and link the local project with `lite link`. Hosted pushes use `supabase/migrations/*.sql` as the database source of truth:

```bash
lite db push          # apply pending migrations only
lite config push      # update project config only
lite cloud deploy     # db push, then config push
lite cloud diff       # list pending migrations (--sql prints their SQL)
```

`cloud deploy` stops before config if a migration fails. It does not deploy declarative `schemas/*.sql` or seed files; generate and commit a migration first with `lite db diff -f <name>`.

Common flags:

```bash
lite init --pglite          # use PGlite instead of SQLite
lite db reset --hard        # delete the DB file, replay migrations + seed
lite db schema --diff       # diff current DB vs schemas/*.sql
lite db schema --sql        # print raw CREATE statements
lite db diff -f add_col     # write a new pg-DDL migration file
lite db query "select count(*) from todos"

# db translate and db query take SQL as an argument or via stdin, so they compose:
cat supabase/migrations/*.sql | lite db translate            # inspect the sqlite SQL for a migration
cat supabase/seed.sql | lite db translate | lite db query    # translate + apply ad-hoc SQL
lite db translate "alter table public.todos add column done boolean" | lite db query
echo "select * from todos" | lite db query                   # pipe a one-off statement in
lite db diff -f prepare_upgrade # required first for declarative-only projects
lite upgrade --dry-run          # migration rehearsal plus SQLite shim audit
lite upgrade --dry-run --json   # machine-readable shim audit output
lite generate-keys              # (re)generate the API key pair, upsert .env
```

Upgrade targets:

```bash
lite upgrade --target hosted  # default: create/migrate to hosted Supabase
lite upgrade --target local   # initialize/migrate local Supabase in the current directory
lite upgrade --target local --local-dir ../my-local-supabase
```

See [UPGRADE.md](https://github.com/supabase/lite/blob/HEAD/UPGRADE.md) for upgrade behavior, target differences, session migration, known gaps, and test strategy.

### Telemetry

The `lite` CLI sends anonymous usage telemetry to help prioritize fixes and features. No personally identifiable information is collected: no file paths, project names, DB URLs, env values, hostnames, IPs, or stack traces. Only the command name, CLI flag presence (boolean, never values), runtime (node/bun/deno), node version, platform/arch, CI/agent/container detection, DB driver (`sqlite`/`sqlite-postgres`/`pglite`/`postgres`), DB location (`file`/`memory`/`local`/`remote`), and DB size bucket.

Opt out with any of:

```bash
lite --no-telemetry <cmd>
LITE_TELEMETRY=0 lite <cmd>
DO_NOT_TRACK=1 lite <cmd>     # https://consoledonottrack.com
```

## Vite plugin

If your frontend uses Vite, skip the separate CLI + proxy setup. The
`@supabase/lite/vite` plugin runs the supalite backend inline inside the Vite dev
server, so one process serves both your app and the API.

```ts
// vite.config.ts
import { defineConfig } from "vite";
import { supalite } from "@supabase/lite/vite";

export default defineConfig({
   plugins: [supalite()],
});
```

Then from your frontend, the canonical snippet works with no setup. The plugin
injects `VITE_SUPABASE_URL` (the current origin, since the API rides on the Vite
server) and a dev `VITE_SUPABASE_ANON_KEY`:

```ts
import { createClient } from "@supabase/supabase-js";

const client = createClient(
   import.meta.env.VITE_SUPABASE_URL,
   import.meta.env.VITE_SUPABASE_ANON_KEY,
);
```

Set either var in a `.env` file to override the injected defaults — your values
always win.

The plugin auto-resolves `./supabase/config.toml`, applies the schema on boot,
watches `schemas/*.sql` for hot-reload, and mounts `/auth/v1`, `/rest/v1`, and
`/_system` on the Vite server. Active in both `vite` / `vite dev` and `vite
preview` (preview mounts the API and runs boot migrations, but does not watch
schemas — it simulates production).

> Do not run `lite dev` or `lite start` next to the plugin — both bind the API and will collide. See [When to use what](#when-to-use-what).

See [`examples/todo`](https://github.com/supabase/lite/tree/HEAD/examples/todo) for a full Vite + React + Tailwind + RLS example, or [`examples/next-todo`](https://github.com/supabase/lite/tree/HEAD/examples/next-todo) for the same pattern using Next.js App Router catch-all route handlers.

---

## Project layout

`lite init` creates a Supabase-compatible directory layout:

```
supabase/
├── config.toml          # API port, auth settings, DB path, etc.
├── migrations/          # Postgres migrations; source for hosted DB pushes
├── schemas/
│   └── schema.sql       # Postgres DDL, auto-translated to SQLite
├── seed.sql             # Seed data, applied after migrations
└── .temp/
    └── data.db          # SQLite database (git-ignored)
```

`config.toml` follows the [Supabase CLI config format](https://supabase.com/docs/guides/local-development/cli/config). Minimal example:

```toml
[api]
port = 54321

[db]
driver = "sqlite-postgres"    # or "sqlite" | "pglite" | "postgres"
url = "file:./supabase/.temp/data.db"

[db.migrations]
schema_paths = ["./schemas/schema.sql"]

[db.seed]
sql_paths = ["./seed.sql"]

[auth]
enabled = true
jwt_secret = "dev-secret-change-me"
jwt_expiry = 3600
enable_signup = true
publishable_key = "env(SUPABASE_PUBLISHABLE_KEY)"
secret_key = "env(SUPABASE_SECRET_KEY)"

[auth.email]
enable_confirmations = false
```

> **`auth.jwt_secret`**: if omitted, auth falls back to the insecure placeholder `"unsafe-secret-change-me"` so local dev doesn't break. Always set your own for anything beyond throwaway local use.

### API keys

`lite init` generates a `sb_publishable_*`/`sb_secret_*` key pair into root `.env` (`SUPABASE_PUBLISHABLE_KEY`/`SUPABASE_SECRET_KEY`) and wires `auth.publishable_key`/`auth.secret_key` to reference them via `env(VAR)`, same field names as the upstream `supabase` CLI. It's per-variable: only whichever key is actually missing gets (re)generated — an existing `SUPABASE_PUBLISHABLE_KEY` or `SUPABASE_SECRET_KEY` is never overwritten. `lite start`/`lite dev` print the resolved keys under the server URL.

Enforcement kicks in once at least one key is configured: `sb_publishable_*` authenticates as `anon`, `sb_secret_*` as `service_role` (bypasses RLS, including on SQLite). An unconfigured key simply never matches. With no keys configured at all, `/rest/v1` and `/auth/v1` keep the old behavior (any/no `apikey` accepted). Keys must be sent via the `apikey` header or `?apikey=` query param — supabase-js does this automatically — a key sent only via `Authorization` is rejected. A real user session JWT in `Authorization` always outranks the API key. `/storage/v1` is transform-only (like upstream self-hosted Kong): it never 401s on a missing/invalid key, so public/signed/S3-presigned URLs stay keyless, but a secret key still satisfies storage's own authed routes as `service_role`. Legacy JWT-as-apikey (`ANON_KEY`/`SERVICE_ROLE_KEY` HS256) is not supported.

Lost or rotating keys: `lite generate-keys` mints a fresh pair and upserts `.env`.

### Admin mode (local only)

`lite dev`, `lite start`, and a loopback-bound Vite dev server run with admin mode **on**. A request carrying no credential at all — no `apikey`, no `Authorization` — on `/rest/v1` (and `/storage/v1` on the CLI) is served as `service_role`. That's what lets the built-in studio read and edit any table without a secret key shipping to the browser, mirroring self-hosted Supabase Studio where the server holds the key.

Elevation additionally requires the request to be same-origin (or carry no `Origin`), to arrive on a loopback socket, and to name a loopback host. Both locality checks are needed: the socket peer stops a machine on your network from spoofing `Host: localhost`, and the hostname stops DNS rebinding, where a hostile page re-resolves its own domain to `127.0.0.1` so the socket is genuinely loopback. `/auth/v1` is never elevated, and the Vite plugin only mounts `/rest/v1`.

```bash
lite start --no-admin              # loopback server, admin explicitly off
lite start --host                  # all interfaces, admin defaults off and warns
lite start --host --no-admin       # all interfaces, explicit/silent admin opt-out
lite start --host --admin          # all interfaces, local peers may use admin
```
```ts
supalite({ admin: false })         # off for the Vite dev server
```

On a loopback CLI listener, precedence is explicit flag > `options.server.admin` in `config.toml` > the on-by-default launcher value. A non-loopback `--host` forces admin off unless `--admin` is present, so config cannot silently re-enable it. Vite follows the same rule: an exposed Vite host requires `supalite({ admin: true })`; preview and embedded `App` instances remain off by default.

A sandbox or tunnel may publish even a loopback listener and make remote traffic appear local. Use `--no-admin` whenever another system forwards the port publicly; locality is not an authentication mechanism across a proxy.

Because keyless requests skip RLS, test policies with a credential: `apikey: $PUBLISHABLE_KEY` for `anon`, and that **plus** `Authorization: Bearer $USER_JWT` for `authenticated`. A bearer token alone is a 401.

Embedding the `App` class directly: `app.getClient()` defaults to the configured publishable key (override via `{ apikey }`). Disable enforcement entirely with `options.server.apiKeys: false`, or supply your own key→role mapping via `options.server.apiKeys.resolver`:

```ts
new App({
  connection,
  options: {
    server: {
      apiKeys: { resolver: async (key) => key === myKey ? { type: "secret", claims: { role: "service_role" } } : null },
    },
  },
});
```

---

## Writing schemas

Write **Postgres DDL** in `supabase/schemas/*.sql`. When the DB driver is SQLite, DDL is translated on the fly (`SERIAL` → `INTEGER PRIMARY KEY AUTOINCREMENT`, `NOW()` → `datetime('now')`, `JSONB` → `TEXT` with a `json_valid()` check, and so on). Postgres-only features that don't translate (ranges, `LATERAL`, table inheritance) throw a descriptive error.

RLS works across all backends: on SQLite, policies are extracted from DDL and enforced at the application layer by rewriting the query AST; on PGlite/Postgres, native RLS is used. `auth.uid()`, `auth.jwt()`, and roles (`anon`, `authenticated`, `service_role`) resolve from the JWT.

Full translation reference: [STATUS.md#postgres-to-sqlite-translation](https://github.com/supabase/lite/blob/HEAD/STATUS.md#postgres-to-sqlite-translation) and [`app/POSTGRES-SQLITE-COMPAT.md`](https://github.com/supabase/lite/blob/HEAD/app/POSTGRES-SQLITE-COMPAT.md).

---

## Migrations

Imperative Postgres migrations live in `supabase/migrations/*.sql` (Supabase-CLI compatible — same filename format `<14-digit-ts>_<name>.sql`, same history table `supabase_migrations.schema_migrations`). On `sqlite-postgres`, `pglite`, and `postgres` drivers, write raw Postgres DDL — the runtime translates it on the fly. On the bare `sqlite` driver, write sqlite DDL in `supabase/sqlite-migrations/*.sql` instead.

Use Postgres SQL in `supabase/seed.sql` on `sqlite-postgres`, `pglite`, and `postgres`. The `sqlite-postgres` driver translates qualified table names and supported casts before it runs the seed. The bare `sqlite` driver runs seed files as native SQLite SQL.

```bash
lite migration new add_users    # create supabase/migrations/<ts>_add_users.sql
# ... edit the file ...
lite migration up               # apply pending migrations
lite migration list             # show applied vs pending
lite db diff -f tweak           # diff schemas/ against applied migrations, emit a new pg-DDL migration
lite db reset                   # drop everything, replay migrations, run seed
```

Migrations and declarative schemas coexist: `lite dev` and the Vite plugin apply pending migrations on boot, then run the declarative diff. `lite start` is migration-only: the ordered SQL recorded in `supabase_migrations.schema_migrations` is authoritative, so pending, edited, deleted, or declarative files do not change runtime metadata until their SQL is applied and recorded. On `sqlite-postgres`, deleting `supabase/.temp/.runtime-metadata-cache.json` is safe; startup rebuilds it from applied history and asks for `lite db reset` only when that history is invalid or does not match the live structure.

---

## Using `@supabase/supabase-js`

Two ways to get a client:

### Over HTTP

```typescript
import { createClient } from "@supabase/supabase-js";

const client = createClient("http://127.0.0.1:54321", "<anon-key>");

// database
const { data } = await client.from("todos").select("*");

// auth
await client.auth.signUp({ email: "a@b.com", password: "secret123" });
const { data: session } = await client.auth.signInWithPassword({
   email: "a@b.com",
   password: "secret123",
});
```

### In-process (no network)

When you embed the app:

```typescript
const client = app.getClient();
const { data } = await client.from("todos").select("*");
```

Queries route through `app.fetch` internally. Same API, no HTTP round trip. `getClient()` defaults to the configured `auth.publishable_key` (override with `getClient({ apikey })`).

---

## Embedded / programmatic

Embed @supabase/lite in any Web-API-compliant runtime (Bun, Node, browser, and edge runtimes).

### Bun / Node

```typescript
import { App } from "@supabase/lite";
import { createConnection } from "@supabase/lite/sqlite";   // picks driver per runtime

const connection = await createConnection({ url: "file:./data.db" });
const app = new App({ connection, auth: { enabled: true } });

// optionally apply schema on boot
const schema = await Bun.file("./schema.sql").text();
await app.connection.createMigrator(schema).migrate();

export default app;   // app.fetch handles requests
```

### Supported databases

| Runtime/DB   | Driver                           |
|--------------|----------------------------------|
| Bun          | `bun:sqlite` (auto)              |
| Node.js ≥ 22 | `node:sqlite` (auto)             |
| Browser      | `@sqlite.org/sqlite-wasm` (auto) |
| Workerd      | `@supabase/lite/workerd`         |
| PGlite       | `@supabase/lite/pglite`          |
| Postgres     | `@supabase/lite/postgres`        |
| libsql/Turso | `@supabase/lite/libsql`          |


---

## REPL

```bash
lite repl
```

Gives you an interactive session with `app`, `client` (supabase-js), `conn`, and `db` in scope. Built-in commands: `.tables`, `.table <name>`, `.indexes`, `.config [path]`.

```
> await client.from("todos").select("*")
> .tables
> .table todos
```
