# Limitations (quick reference)

Token-efficient cheat sheet for agents and humans. Read this before authoring schema or client code. Detailed semantics, status tables, and workarounds live in [STATUS.md](https://github.com/supabase/lite/blob/HEAD/STATUS.md).

Anchors below point to the corresponding STATUS.md section. If a limitation here is fixed, delete the bullet (do not strike-through). If you ship a feature change in STATUS.md, update this file in the same commit (see [AGENTS.md](https://github.com/supabase/lite/blob/HEAD/AGENTS.md)).

## SQL / DDL (SQLite path)

- Extension declarations are no-ops only for `plpgsql`, `pgcrypto`, and `uuid-ossp`; schema moves and drops for those names are ignored for declarative convergence, while unsupported names and other mutations fail. Only the documented PL/pgSQL trigger subset and UUID v4 defaults are emulated. See [Extension Statements](https://github.com/supabase/lite/blob/HEAD/STATUS.md#extension-statements).
- `DEFAULT auth.uid()` (and `auth.role()`, `auth.email()`, `auth.jwt()`) on columns → not supported. Drop the default, pass `user_id` from the client, rely on RLS `WITH CHECK`. See [Column Defaults](https://github.com/supabase/lite/blob/HEAD/STATUS.md#column-defaults).
- Subquery `WITH CHECK` on `INSERT` (`user_id IN (SELECT …)`, `EXISTS (…)`) → throws. Denormalise the owning column. See [RLS known limitations](https://github.com/supabase/lite/blob/HEAD/STATUS.md#row-level-security-rls).
- Dynamic Storage path concatenation such as `name LIKE workspace_id || '/%'` → not supported in translated RLS. Compare `storage.foldername()`, `storage.filename()`, or `storage.extension()` with a column inside `EXISTS`, or use `IN (SELECT …)`. See [Storage API](https://github.com/supabase/lite/blob/HEAD/STATUS.md#storage-api).
- Scalar functions outside the allow-list in `DEFAULT` or `CHECK` (`char_length`, `trim`/`btrim`, `regexp_replace`, custom functions) → `Function call "<name>" not supported`, and the whole `CREATE TABLE` fails. `length`, `lower`, `upper`, `ltrim`, `rtrim` work. See [Column Defaults](https://github.com/supabase/lite/blob/HEAD/STATUS.md#column-defaults) and [CHECK constraint functions](https://github.com/supabase/lite/blob/HEAD/STATUS.md#check-constraint-functions).
- `LIKE` or regex `~` inside `CHECK` → translation fails for the whole `CREATE TABLE`. See [CHECK constraint functions](https://github.com/supabase/lite/blob/HEAD/STATUS.md#check-constraint-functions).
- `now()` / `current_timestamp` inside `CHECK` → the table is created, but SQLite rejects every insert and update on it (`non-deterministic use of datetime() in a CHECK constraint`). See [CHECK constraint functions](https://github.com/supabase/lite/blob/HEAD/STATUS.md#check-constraint-functions).
- Bare operator expressions in `DEFAULT` (`DEFAULT 1 + 1`) → translate to invalid SQLite DDL (`near "+": syntax error`). Use a literal. Function calls such as `DEFAULT lower('X')` work. See [Column Defaults](https://github.com/supabase/lite/blob/HEAD/STATUS.md#column-defaults).
- `currval`, `clock_timestamp`, `statement_timestamp`, `txid_current`, user-defined functions in `DEFAULT` → not supported. See [Column Defaults](https://github.com/supabase/lite/blob/HEAD/STATUS.md#column-defaults).
- `CREATE SEQUENCE`, `ALTER SEQUENCE ... OWNED BY`, and `DEFAULT nextval(...)` on a column that is not a `serial`/identity primary key → silently dropped (no error, no warning). A `NOT NULL` column then fails on insert. See [Column Defaults](https://github.com/supabase/lite/blob/HEAD/STATUS.md#column-defaults).
- `FORCE ROW LEVEL SECURITY` / `NO FORCE` → accepted and ignored (no table-owner exemption to toggle). See [RLS known limitations](https://github.com/supabase/lite/blob/HEAD/STATUS.md#row-level-security-rls).
- Trigger functions can be defined in earlier migrations, but PL/pgSQL `DECLARE`, `IF`, `LOOP`, `RAISE`, and variables are not supported in their bodies. See [PL/pgSQL Trigger Functions](https://github.com/supabase/lite/blob/HEAD/STATUS.md#plpgsql-trigger-functions).
- `ALTER TYPE ... ADD VALUE` / `RENAME VALUE` (enum value changes) → not supported; the error names the type and operation. Recreate the type with all values, or use a manual migration. See [Translated Field Types](https://github.com/supabase/lite/blob/HEAD/STATUS.md#translated-field-types).
- `sqlite-postgres` seed files use the same supported Postgres-to-SQLite subset as migrations. Unsupported Postgres syntax fails translation. Bare `sqlite` seed files must use native SQLite. See [CLI](https://github.com/supabase/lite/blob/HEAD/STATUS.md#cli).
- SQLite encodes non-public relations as `"schema.table"` and treats bare relations as `public`. A public table name containing a dot collides with this encoding. See [Postgres-to-SQLite Translation](https://github.com/supabase/lite/blob/HEAD/STATUS.md#postgres-to-sqlite-translation).

## supabase-js (SQLite path)

- `rpc()` → not supported. Use a regular HTTP endpoint for custom logic. See [Control & Specialized](https://github.com/supabase/lite/blob/HEAD/STATUS.md#control--specialized).
- `contains` / `containedBy` / `overlaps` → partial. Arrays of scalars and shallow objects work; arrays of objects and nested objects do not. See [Array & JSON Filters](https://github.com/supabase/lite/blob/HEAD/STATUS.md#array--json-filters).
- `textSearch` (fts/plfts/phfts/wfts) → not implemented on SQLite. See [Full-Text Search](https://github.com/supabase/lite/blob/HEAD/STATUS.md#full-text-search).
- `regexMatch` / `regexIMatch` → partial. Only simple anchored/literal patterns (`^foo`, `bar$`, substrings) work; classes, quantifiers and alternation fail. See [Regex](https://github.com/supabase/lite/blob/HEAD/STATUS.md#regex).
- Range operators (`rangeGt`, …) and quantified comparisons (`eq(any)`, …) → not implemented on SQLite. See [Range Operators](https://github.com/supabase/lite/blob/HEAD/STATUS.md#range-operators) and [Quantified Comparison Operators](https://github.com/supabase/lite/blob/HEAD/STATUS.md#quantified-comparison-operators).
- `schema()` → partial. Works on `sqlite-postgres` for schemas in `api.schemas`; no namespace isolation, embeds across two schemas return `PGRST205`, and bare `sqlite` has no schema handling. See [Control & Specialized](https://github.com/supabase/lite/blob/HEAD/STATUS.md#control--specialized).
- `rollback()` / `Prefer: tx=rollback` → not implemented. The response echoes `Preference-Applied: tx=rollback`, but the write still commits. Do not use it for cleanup. See [Control & Specialized](https://github.com/supabase/lite/blob/HEAD/STATUS.md#control--specialized).

## Auth (shipped with caveats)

- Anonymous guest/email conversion is opt-in for controlled deployments; CAPTCHA verification, anonymous IP rate limits and cleanup are not provided. See [deployment limits](../../docs/anonymous-onboarding.md#deployment-boundary).

- `double_confirm_changes = true` (secure email change) is spec-compatible but **not** GoTrue's full two-mailbox flow: it finalizes from the current-email confirmation only, so it does not require the new mailbox to also confirm. It still prevents a session thief from changing the email using only a mailbox they control. See [Auth email delivery & templates](https://github.com/supabase/lite/blob/HEAD/docs/src/content/docs/auth/email.mdx).
- OAuth / social sign-in (`signInWithOAuth`, `exchangeCodeForSession`) only implements `github` and `google`. Enabling any other configured provider (including `apple`) returns "provider ... is not yet implemented". Automatic account linking on a verified-email match works; manual `linkIdentity()`/`unlinkIdentity()` do not. On the D1 backend, multi-statement Auth transaction spans (OAuth callback/token writes, email-change and other OTP verification) run best-effort without a wrapping transaction (D1 has no callback transaction API; single-statement guards still prevent code/state reuse) — all other backends are fully transactional. See [Auth API: Implemented](https://github.com/supabase/lite/blob/HEAD/STATUS.md#auth-api-gotrue-compatible).
- `/.well-known/jwks.json` returns an empty key set: tokens are HS256 only, with no asymmetric signing keys. See [Auth API: Implemented](https://github.com/supabase/lite/blob/HEAD/STATUS.md#-implemented).
- Legacy JWT-as-apikey (`ANON_KEY`/`SERVICE_ROLE_KEY` HS256) → not supported. Use the opaque `sb_publishable_*`/`sb_secret_*` keys instead. See [API Keys](https://github.com/supabase/lite/blob/HEAD/STATUS.md#api-keys).
- API key enforcement is opt-in: with no `auth.publishable_key`/`auth.secret_key` configured, `/rest/v1` and `/auth/v1` accept any/no `apikey` (unchanged old behavior). See [API Keys](https://github.com/supabase/lite/blob/HEAD/STATUS.md#api-keys).
- A key passed only via `Authorization` (no `apikey` header/query param) → 401. Use `apikey` header or `?apikey=` query param. See [API Keys](https://github.com/supabase/lite/blob/HEAD/STATUS.md#api-keys).
- No local mailbox UI: `[auth.email.smtp] enabled = true` sends real mail via `SmtpEmailDriver` (Nodemailer; e.g. to Mailpit/Inbucket at `localhost:1025`), but there is no built-in mailbox web UI to browse those messages — use the SMTP server's own UI. `[inbucket]` config is still parsed but not acted on: no local Inbucket-compatible service is started. The default `ConsoleEmailDriver` prints emails (To/Subject/text) to the console instead. `SmtpEmailDriver` requires Node or Bun; it is not supported on Cloudflare Workers or in the browser. See [Auth email delivery & templates](https://github.com/supabase/lite/blob/HEAD/STATUS.md#auth-api-gotrue-compatible).

## Auth (planned, not yet shipped)

- Other OAuth providers (Apple and the rest of the 18-provider config surface), manual identity linking, admin API, MFA → planned. See [Auth API: Planned](https://github.com/supabase/lite/blob/HEAD/STATUS.md#-planned).

## Runtime / dev

- `lite upgrade` replays recorded Postgres migration history plus pending files; applied-file mirrors are not required. Run `lite db diff -f prepare_upgrade` for declarative-only projects. Native bare-`sqlite` history cannot be replayed on Supabase. See [Upgrade to Supabase](https://github.com/supabase/lite/blob/HEAD/STATUS.md#upgrade-to-supabase).
- Hosted database pushes use Postgres-format `supabase/migrations/*.sql` only. They do not deploy declarative schemas or seeds, and bare-`sqlite` projects cannot use `lite db push`; generate migrations with `lite db diff -f <name>` before deploying. See [CLI](https://github.com/supabase/lite/blob/HEAD/STATUS.md#cli).
- `vite preview` mounts the API and runs boot migrations, but does **not** watch schemas and never enables admin mode (it simulates production). `vite build` and standalone production servers do not mount the API at all. See [Vite plugin scope](https://github.com/supabase/lite/blob/HEAD/STATUS.md#vite-plugin-scope).
- Run only one backend per project: never combine `lite dev`, `lite start`, or the Vite plugin against the same SQLite file. See [When to use what](https://github.com/supabase/lite/blob/HEAD/README.md#when-to-use-what).
- `lite start` is migration-only: it ignores migration files and `schemas/*.sql`, rebuilding metadata from recorded applied SQL. Invalid history or live structural drift requires `lite db reset`; declarative-only live changes therefore cannot be recovered by `start`. See [RLS](https://github.com/supabase/lite/blob/HEAD/STATUS.md#row-level-security-rls).
- `supabase/.temp/.runtime-metadata-cache.json` is disposable: missing, corrupt, stale, or tampered caches rebuild automatically when applied history matches the live structure. Only `sqlite-postgres` uses it. See [RLS](https://github.com/supabase/lite/blob/HEAD/STATUS.md#row-level-security-rls).
- **Admin mode is on by default only on loopback listeners.** `lite dev`/`lite start` bind `127.0.0.1`; `--host [host]` exposes/selects an address and defaults admin off unless `--admin` is explicit. Vite does the same for non-loopback hosts. Credentialed requests are unaffected. See [API Keys](https://github.com/supabase/lite/blob/HEAD/STATUS.md#api-keys).
- Admin mode never elevates `/auth/v1`, cross-origin requests, requests from a non-loopback socket, or requests for a non-loopback hostname. Public tunnels can make remote traffic appear loopback, so always use `--no-admin` when forwarding the port. Embedders get the hostname check unless their adapter supplies `AppRequestContext.peerAddress`.
- The Vite plugin mounts `/rest/v1` but not `/storage/v1`, so admin mode covers storage on the CLI only unless you add the prefix. See [Vite plugin scope](https://github.com/supabase/lite/blob/HEAD/STATUS.md#vite-plugin-scope).
- The protected `storage` schema is not exposed through `/rest/v1` by default. Use `supabase.storage`; adding `storage` to `api.schemas` intentionally enables direct metadata endpoints. See [Storage API](https://github.com/supabase/lite/blob/HEAD/STATUS.md#storage-api).

## Postgres backends (pglite, postgres)

Most SQLite-only limitations above do not apply. `rpc()`, ranges, regex, quantified comparisons, full-text search, and native `DEFAULT auth.uid()` all work on the Postgres path. See per-section status tables in [STATUS.md](https://github.com/supabase/lite/blob/HEAD/STATUS.md).

- Custom domain types (data representations): read/`RETURNING` output formats via the domain's `CAST(… AS json)`, and mutating JSON values **into** a domain column (epoch→`timestamptz`, base64→`bytea`, decimal-string→`numeric`) is converted on the Postgres path. Remaining gap: domain formatting through cross-relation embeds. See [Translated Field Types](https://github.com/supabase/lite/blob/HEAD/STATUS.md#translated-field-types).
- Postgres sessions run in **UTC** by default (so `timestamptz` rendering is deterministic regardless of the server's host timezone). Override via the `postgresOptions.connection.TimeZone` connection option. See [Translated Field Types](https://github.com/supabase/lite/blob/HEAD/STATUS.md#translated-field-types).
- Embedding **through views** resolves for views whose FK column is a plain projection of a base-table column — including **materialized views** and **multi-level recursive view-of-view** chains (the column mapping is composed across each hop to the underlying base table). Views whose FK column is not a plain projection (CTE, GROUP BY, subselect-in-FROM, or any JOIN view) are still not traced. View-FK resolution matches relations by **bare name**: if two exposed schemas expose a relation with the same name, an embed through a view may resolve against the wrong one — keep colliding names out of co-exposed schemas, or embed via an explicit FK/constraint-name hint.

## Anti-patterns

Common ways code goes wrong against supalite. The fix for each is the corresponding bullet above.

- Don't put `DEFAULT auth.uid()` on a column. Drop the default; pass `user_id` from the client; let RLS `WITH CHECK` enforce ownership.
- Don't call `rpc()` on the SQLite path. Run a regular HTTP endpoint, or switch the driver to `pglite` / `postgres` in `config.toml`.
- Don't run more than one of `lite dev`, `lite start`, or the Vite plugin for a project — they race one SQLite database even when ports differ.
- Don't `lite db reset` then `lite start` on a declarative project and expect your schema to be there. Reset is destructive and replays migrations only, adopting that state (RLS included) as the authoritative one — run `lite db diff -f <name>` first so the declarative schema exists as a migration.
- Don't test RLS with a keyless request while admin mode is on — it runs as `service_role` and sees everything. Send `apikey: $PUBLISHABLE_KEY` (for `anon`), plus `Authorization: Bearer $USER_JWT` for `authenticated`, or start with `--no-admin`.
- Don't send only `Authorization: Bearer $USER_JWT` and expect `authenticated` RLS. With keys configured that's a 401 — the `apikey` is required as well.
- Don't rely on `vite preview` for a production-like surface beyond the API mount: it skips schema watching and admin mode, but it is still a dev tool. Use `lite start` or a real backend for non-dev environments.
- Don't use `trim`, `char_length`, `LIKE`, regex, or `now()` inside `CHECK` constraints on SQLite. `length`, `lower`, `upper`, `ltrim`, `rtrim`, and operator comparisons are fine.
