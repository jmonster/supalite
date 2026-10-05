# Feature Parity

Capability-level view of how @supabase/lite maps to Supabase. [STATUS.md](https://github.com/supabase/lite/blob/HEAD/STATUS.md) is the per-method API matrix; this document groups features into capabilities and, for anything not yet supported, adds two columns: an **Effort** estimate and the **Blocker** reason.

Compatibility is measured from the `@supabase/supabase-js` surface; direct Postgres wire-protocol access is not a target.

## Legend

Status (same icons as [STATUS.md](https://github.com/supabase/lite/blob/HEAD/STATUS.md)):

| Icon | Meaning |
|------|---------|
| ✅ | Supported end-to-end |
| ⚠️ | Partial, works with caveats |
| 🔄 | Planned / not built yet |
| ❌ | Not feasible on this path |
| ⚫ | N/A (client-side only, or no backend needed) |

For rows that are not fully ✅, two columns estimate the cost of closing the gap.

**Effort** (T-shirt size, relative engineering cost):

| Size | Rough meaning |
|------|---------------|
| `S` | Small, self-contained change |
| `M` | A feature's worth of work |
| `L` | Large, multi-part or new subsystem |
| `XL` | Major subsystem or new runtime |

**Blocker** (why it isn't trivial):

| Blocker | Meaning |
|---------|---------|
| `platform-limited` | SQLite lacks the primitive (range types, stored procedures, logical replication); any emulation is partial/lossy |
| `extension-required` | Needs an extension not loadable across all targets (e.g. pgvector / sqlite-vec, full REGEXP) |
| `external-service` | Needs an outside dependency (SMTP, SMS provider, OAuth provider apps) |

`-` marks not-applicable: both columns on ✅ rows, and the Blocker column on planned features with no hard blocker (just ordinary backlog work).

> **The SQLite vs Postgres split matters.** @supabase/lite runs on SQLite backends (`node:sqlite`, `bun:sqlite`, WASM, Cloudflare D1/DO) and on Postgres backends (PGlite, PostgreSQL, Supabase Cloud). Many "not feasible on SQLite" features work natively on the Postgres path. The Data tables below carry both columns; Auth and Storage are backend services that behave the same across drivers. One exception: on the Cloudflare D1 backend, multi-statement Auth transaction spans (OAuth callback/token writes, email-change and other OTP verification) run best-effort without a wrapping transaction (D1 has no callback transaction API); single-statement guards still prevent auth-code/state reuse. All other backends, including Durable Objects, are fully transactional.

---

## Data API (PostgREST)

CRUD, filtering, embedding, and RLS over your tables. This is the most complete surface. Method-level detail and per-operator notes live in [STATUS.md → Database API](https://github.com/supabase/lite/blob/HEAD/STATUS.md#database-api-postgrest-compatible).

| Capability | SQLite | Postgres | Effort | Blocker | Notes |
|------------|:------:|:--------:|:------:|:-------:|-------|
| select / insert / update / delete / upsert | ✅ | ✅ | - | - | Batch ops, `ON CONFLICT`, `RETURNING` |
| Comparison filters (eq, neq, gt/gte/lt/lte, in, is, …) | ✅ | ✅ | - | - | 10/10 |
| Pattern matching (like, ilike, + quantified) | ✅ | ✅ | - | - | 6/6 |
| Ordering, limit, range/offset, single/maybeSingle | ✅ | ✅ | - | - | NULLS FIRST/LAST |
| Logical (or, and, not, match, filter) | ✅ | ✅ | - | - | |
| JSON path (`->`, `->>`) in select/order/where | ✅ | ✅ | - | - | |
| Resource embedding (FK joins, `!inner`, spreads, nested, aggregates) | ✅ | ✅ | - | - | |
| Embedding through views (view→base-table FK tracing) | ⚠️ | ⚠️ | `M` | `platform-limited` | Simple updatable views resolve embeds via their base-table FKs on both paths. Postgres path additionally supports: **materialized views** (introspected via `pg_matviews`/`relkind 'm'` and treated as routable relations with derived FKs) and **multi-level recursive view-of-view** (column maps composed transitively to the ultimate physical base via a fixpoint loop with a depth-16 cap and cycle guard). Not yet traced on either path: complex views (CTE, GROUP BY, subselect-in-FROM, JOINs), and same-name relation collisions across two exposed schemas. See [STATUS.md](https://github.com/supabase/lite/blob/HEAD/STATUS.md#database-api-postgrest-compatible) / [LIMITATIONS.md](https://github.com/supabase/lite/blob/HEAD/LIMITATIONS.md). |
| Bulk ops & `Prefer` headers (representation, merge/ignore-duplicates, max-affected) | ✅ | ✅ | - | - | |
| RLS enforcement (`auth.uid()`/`role()`/`jwt()`, permissive/restrictive, per-command, roles) | ✅ | ✅ | - | - | App-layer rewrite on SQLite; native on Postgres. Cross-table `SELECT`/`EXISTS` policies resolve every relation from its own explicit schema or `public` and preserve `AS` or implicit aliases through nested same-table queries. On `sqlite-postgres`, `lite start` restores or fully rebuilds runtime metadata from authoritative recorded migration SQL, validates it against live structure, and fails with a reset hint on invalid history or drift. See [STATUS.md](https://github.com/supabase/lite/blob/HEAD/STATUS.md#row-level-security-rls). |
| CSV input/output (`csv()`) | ✅ | ✅ | - | - | Via `text/csv` Accept/Content-Type |
| Response utilities (`abortSignal`, `setHeader`, `throwOnError`, `maxAffected`) | ✅ | ✅ | - | - | |
| CORS / `OPTIONS` preflight | ✅ | ✅ | - | - | Server-wide on `/auth`, `/rest`, `/storage`; preflight answered before auth, origin `*`, exposes `Content-Range`. Functions handlers own CORS and preflight responses. |
| PostgreSQL extension declarations | ⚠️ | ⚠️ | `XL` | `extension-required` | SQLite treats `plpgsql`, `pgcrypto`, and `uuid-ossp` declarations plus their declarative schema/drop reconciliation as compatibility no-ops; unsupported creates and mutations fail during translation. PGlite runs only its configured extensions; PostgreSQL delegates to the server. See [STATUS.md](https://github.com/supabase/lite/blob/HEAD/STATUS.md#extension-statements). |
| PL/pgSQL trigger functions | ⚠️ | ✅ | `XL` | `platform-limited` | SQLite inlines the documented trigger-body subset, resolves functions from ordered migration history, and preserves per-table trigger names for create/drop/introspection. Postgres runs PL/pgSQL natively. See [STATUS.md](https://github.com/supabase/lite/blob/HEAD/STATUS.md#plpgsql-trigger-functions). |
| Full-text search (fts/plfts/phfts/wfts) | ⚠️ | ✅ | `L` | `platform-limited` | SQLite uses a LIKE-based lexeme approximation, not FTS5 ranking or tsvector semantics. See [STATUS.md](https://github.com/supabase/lite/blob/HEAD/STATUS.md#full-text-search). |
| Regex (`regexMatch`/`regexIMatch`) | ⚠️ | ✅ | `M` | `extension-required` | Only simple anchored/literal patterns today. Full regex needs a registered `REGEXP` function, available on `node:`/`bun:sqlite` but not WASM/D1. See [STATUS.md](https://github.com/supabase/lite/blob/HEAD/STATUS.md#regex). |
| Array/JSON containment (`contains`, `containedBy`, `overlaps`) | ⚠️ | ✅ | `M` | `platform-limited` | Data API `jsonb` `contains`/`containedBy` supports nested objects and arrays within [documented limits](../../docs/design-and-porting.md#limits-and-input-boundary). SQL-array operators and `overlaps` are unchanged; other runtime adapters need qualification. |
| Custom domain types / data representations | ⚠️ | ⚠️ | `M` | `platform-limited` | Postgres: domain columns with `CAST(… AS json)` render via that cast on reads/`RETURNING`, and JSON values mutated **into** a domain (epoch/base64/decimal) are converted; sessions run in UTC by default (configurable). SQLite: built-in shims for the known data-rep types. Remaining gap: domain formatting through cross-relation embeds. See [STATUS.md](https://github.com/supabase/lite/blob/HEAD/STATUS.md#translated-field-types). |
| `explain()` | ⚠️ | ⚠️ | `M` | `-` | Returns compiled SQL, not a real query plan. |
| OpenAPI / schema spec at `/rest/v1/` | ⚠️ | ⚠️ | `M` | `-` | A mock spec is served; not generated from live schema. |
| `count=planned` / `count=estimated` | ⚠️ | ⚠️ | `S` | `-` | Parsed but treated as exact on SQLite. |
| Quantified comparisons (`eq(any)`, `gt(all)`, …) | 🔄 | ✅ | `M` | `-` | No SQLite array type, but emulatable by expanding to `OR`/`AND` chains over the literal list. |
| Embedded dotted-path filters (`.eq('rel.col', v)`) | ✅ | ✅ | - | - | Applied inside the embedded subquery on SQLite. Narrows the embedded array like PostgREST; add `!inner` to also filter parent rows. See [STATUS.md](https://github.com/supabase/lite/blob/HEAD/STATUS.md#embedded-filters). |
| `rpc()` (stored procedures) | ❌ | ✅ | `XL` | `platform-limited` | Postgres RPC depends on `CREATE FUNCTION … LANGUAGE sql/plpgsql`. SQLite has no stored-procedure model, and the project deliberately avoids a parallel JS-function registry. Use an HTTP endpoint, or a Postgres driver. Supports PostgREST function response control: `response.status`/`response.headers` GUCs override the HTTP status/headers (invalid → PGRST112/PGRST111), GET/HEAD calls run in a read-only transaction (a mutating function raises 25006 → 405), and `request.method`/`path`/`headers` GUCs are injected for functions that read the HTTP context. A function returning a media-type **domain** (e.g. `returns "text/plain"`/`"image/png"`/`"*/*"`) and matched by the request `Accept` emits the raw scalar (text or bytes) with that `Content-Type` instead of JSON; the `response.headers` GUC can override the Content-Type. Gap: table custom-aggregate media handlers. |
| Computed columns & relationships (PostgREST) | ❌ | ✅ | `L` | `platform-limited` | Postgres: function-based computed columns `fn(row)→scalar` (select + filter, incl. FTS) and computed relationships `fn(row)→[SETOF] table` (embed with no FK, incl. FK/o2o override, self-joins, nested, and on `SETOF` RPC results). Resolved from introspected `pg_proc` metadata, schema-scoped. SQLite has no stored functions. Gap: computed columns on an RPC result (`*_on_rpc`). |
| Composite-type columns (`CREATE TYPE … AS (…)`) | ❌ | ✅ | `M` | `platform-limited` | Postgres: composite-field access in select/order/filter (`->`/`->>` → `(col).field`) and composite columns rendered as JSON objects (`to_jsonb`) on reads and `RETURNING`. SQLite has no composite types (spec fixtures store the column as JSON there). |
| Partitioned tables (declarative partitioning) | ❌ | ✅ | `M` | `platform-limited` | Postgres: the partitioned parent is queryable; individual partitions are hidden from the relation cache like PostgREST — direct access → 404, embedding a partition → no-relationship error with a "did you mean '<parent>'" hint. SQLite has no partitioning. |
| Range operators (`rangeGt`, `rangeAdjacent`, …) | ❌ | ✅ | `XL` | `platform-limited` | No range types in SQLite. |
| `schema()` (multi-schema) | ⚠️ | ✅ | `L` | `platform-limited` | On `sqlite-postgres`, schemas in `api.schemas` are served through `Accept-Profile`/`Content-Profile` (reads and writes). Public relations stay bare; other schemas use one dotted physical identifier (`"private.secrets"`), so there is no namespace isolation. Gaps: embeds across two schemas return `PGRST205`; bare `sqlite` has no schema handling. See [STATUS.md](https://github.com/supabase/lite/blob/HEAD/STATUS.md#control--specialized). |
| `geojson()` | ❌ | ❌ | `XL` | `extension-required` | Needs SpatiaLite (SQLite) or PostGIS (Postgres). |
| `rollback()` (Prefer tx-rollback) | ❌ | ❌ | `S` | `-` | Not implemented on either path. `Prefer: tx=rollback` is echoed in `Preference-Applied`, but the write still commits (verified on SQLite). Supabase's default `PGRST_DB_TX_END=commit` ignores the preference. |
| Vector / semantic search (`pgvector`) | ❌ | ❌ | `XL` | `extension-required` | Hosted/CLI Supabase ships `pgvector`; lite does not. `sqlite-vec` is a loadable extension unavailable on WASM/D1, and the PGlite/`postgres` drivers here don't enable `pgvector`. Point users at hosted Supabase for embeddings. |

---

## Auth (GoTrue)

GoTrue-compatible endpoints at `/auth/v1/*`, backed by `app/src/auth/`. Email/password, OTP, sessions, RLS auth context, and OAuth sign-in (`github`/`google`) are solid; other OAuth providers, admin, and MFA are the main gaps. Method list in [STATUS.md → Auth API](https://github.com/supabase/lite/blob/HEAD/STATUS.md#auth-api-gotrue-compatible).

| Capability | Status | Effort | Blocker | Notes |
|------------|:------:|:------:|:-------:|-------|
| Email + password sign-up / sign-in | ✅ | - | - | bcrypt, optional metadata, confirmation flow; repeated unconfirmed signup honors `auth.email.max_frequency`, rotates the OTP after expiry, and implicitly confirms when confirmations are later disabled |
| Magic link / email OTP (`signInWithOtp`, `verifyOtp`) | ✅ | - | - | signup, magiclink, recovery, email_change, reauthentication; numeric code + `token_hash` both verify against the DB (durable on Workers), `otp_expiry`/`otp_length` honored |
| JWT issuance, refresh-token rotation, sessions | ✅ | - | - | Revocation, reuse handling, timebox/inactivity expiry |
| Password recovery (`recover`, `resend`, `reauthenticate`) | ✅ | - | - | Recovery, signup-confirmation resend, and email-change resend honor `auth.email.max_frequency` and rotate their OTPs after expiry |
| `getUser` / `updateUser` (metadata, password, email change) | ✅ | - | - | Secure email change (`double_confirm_changes=true`) is ⚠️ partial: spec-compatible (confirms from the current mailbox before finalizing) but not GoTrue's full two-mailbox flow. See [LIMITATIONS.md](https://github.com/supabase/lite/blob/HEAD/LIMITATIONS.md#auth-shipped-with-caveats). |
| RLS auth context (`auth.uid()`, `auth.role()`, `auth.jwt()`) | ✅ | - | - | Shared with the Data API |
| API keys (`sb_publishable_*` → `anon`, `sb_secret_*` → `service_role`) | ✅ | - | - | Enforced on `/rest/v1` and `/auth/v1` when `auth.publishable_key`/`auth.secret_key` are configured; legacy JWT-as-apikey not supported. See [STATUS.md](https://github.com/supabase/lite/blob/HEAD/STATUS.md#api-keys). |
| Local admin mode (keyless local requests run as `service_role`) | ✅ | - | - | On by default for loopback `lite dev`/`lite start` and Vite dev listeners. `--host [host]` or an exposed Vite host defaults it off; opt in with `--admin` / `supalite({ admin: true })`. Elevation requires keyless + same-origin + loopback socket + loopback hostname. See [STATUS.md](https://github.com/supabase/lite/blob/HEAD/STATUS.md#api-keys). |
| Email delivery (default templates + customization) | ✅ | - | - | Supabase-styled default HTML, `api.external_url`-hosted verify links, and GET `/auth/v1/verify` redirects to `auth.site_url`. When `api.external_url` is unset, links use `auth.site_url`. Override subject + HTML per type via `auth.email.template.<type>.content_path` (GoTrue `{{ .ConfirmationURL }}` etc.). |
| Email driver (SMTP / provider) | ✅ | - | - | `SmtpEmailDriver` (via Nodemailer) auto-selects when `[auth.email.smtp] enabled = true` in `config.toml` (e.g. pointing at Mailpit or a real SMTP server); `Resend`/`SES`/`Sendmail` remain available via `options.drivers.email`. Default without config or explicit driver is `ConsoleEmailDriver`. `SmtpEmailDriver` requires Node or Bun; not supported on Cloudflare Workers or in the browser. |
| OAuth / social providers + PKCE (`signInWithOAuth`, `exchangeCodeForSession`) | ⚠️ | `S` per provider | `external-service` | `github` and `google` implemented: authorization-code (PKCE) and implicit flows, automatic account linking. Other configured providers (incl. `apple`) return "not yet implemented"; each is roughly `S` effort, gated on registering a provider app. |
| Anonymous sign-in (`signInAnonymously`) | ⚠️ | - | - | Opt-in guest creation and email/password conversion preserve the user ID. Controlled deployments only without external abuse protection; see [workflow and limits](../../docs/anonymous-onboarding.md). |
| Admin user API (create/list/get/update/delete, generateLink, signOut) | 🔄 | `M` | `-` | Mostly CRUD over `auth.users`; ~69 skipped spec cases. |
| Identity linking (`linkIdentity` / `unlinkIdentity`) | 🔄 | `M` | `-` | Automatic linking on OAuth sign-in (verified-email match) already works; the explicit link/unlink API is still planned. Unlink is `S`. |
| Phone / SMS OTP | 🔄 | `M` | `external-service` | Needs an SMS provider (e.g. Twilio). |
| MFA / TOTP (enroll, challenge, verify) | 🔄 | `M` | `-` | TOTP via a library (e.g. otplib) + QR; AAL tracking. |
| `getClaims()` / JWKS verification | ⚠️ | `M` | `-` | `/.well-known/jwks.json` and `/.well-known/openid-configuration` are served, but the key set is empty (HS256 only). Remaining gap: asymmetric signing keys and JWKS-based verification. |
| OIDC ID-token sign-in (`signInWithIdToken`) | 🔄 | `M` | `-` | Validate provider ID token + nonce; lighter than full OAuth handshake. |
| WebAuthn / passkeys (`mfa.webauthn.*`) | 🔄 | `XL` | `-` | FIDO2/CTAP2 registration + assertion ceremonies; credential storage, signature verification. |
| OAuth 2.1 authorization server + client admin | 🔄 | `L` | `-` | Lite acting as an OAuth provider: authorization endpoint + client management. |
| Web3 sign-in (`signInWithWeb3`, SIWE/SIWS) | 🔄 | `L` | `-` | Wallet message + signature verification. |
| SAML / SSO (`signInWithSSO`) | 🔄 | `XL` | `-` | Enterprise SSO: XML signing, IdP metadata exchange, assertion validation. |

---

## Storage

storage-api-compatible endpoints at `/storage/v1/*` (`app/src/storage/`), with pluggable filesystem and S3 backends, Sharp/Cloudflare image transforms, and Storage-table RLS across every database backend. Currently gated behind `EXPERIMENTAL_STORAGE`. Detail in [STATUS.md → Storage API](https://github.com/supabase/lite/blob/HEAD/STATUS.md#storage-api).

| Capability | Status | Effort | Blocker | Notes |
|------------|:------:|:------:|:-------:|-------|
| Bucket CRUD (create, list, get, update, delete, empty) | ✅ | - | - | Public/private, file-size limits, allowed MIME types |
| Object CRUD (upload, replace, download, list, move, copy, remove, info, exists) | ✅ | - | - | Raw uploads, canonical Storage JS `File`/`Blob` multipart, upsert via `x-upsert`, and range requests |
| Public buckets & public URLs | ✅ | - | - | |
| Signed URLs (download, batch, upload) | ✅ | - | - | JWT-signed, configurable TTL; canonical Storage JS `Blob` multipart uploads |
| Image transformations (resize, format, quality) | ✅ | - | - | Sharp (buffer) and Cloudflare (URL) adapters |
| Storage backends | ✅ | - | - | Filesystem + S3-compatible (AWS S3, MinIO, R2) |
| Role-based access (service_role / anon / authenticated gating) | ✅ | - | - | Verified JWT/API-key claims are shared with the Data API; invalid bearer JWTs return 401 on protected operations, retrieval routes still serve public objects, and `service_role` bypasses RLS. |
| RLS policies on storage tables | ✅ | - | - | Native on Postgres/PGlite and translated on SQLite, including cross-schema membership lookups, custom JWT roles, ownership, full route-operation context and helpers, serving-only public bypass, signed exceptions, and path-helper comparisons with correlated membership columns or `IN (SELECT ...)`. SQLite fails closed for system Storage tables omitted from runtime metadata; `storage` is not exposed through PostgREST by default. |
| `/status` health endpoint | ✅ | - | - | Returns 200 without auth. |
| Bucket-list query params (`search`/`limit`/`offset`) | 🔄 | `S` | `-` | |
| TUS resumable uploads | 🔄 | `L` | `-` | `POST/PATCH/HEAD /upload/resumable`; spec cases exist, endpoints don't. |
| S3-compatible protocol paths (`/s3/`) | 🔄 | `L` | `-` | |
| Webhooks (ObjectCreated/ObjectRemoved) | 🔄 | `M` | `-` | |

---

## Upgrade to Supabase

| Capability | Status | Effort | Blocker | Notes |
|------------|:------:|:------:|:-------:|-------|
| Self-service upgrade | ⚠️ | `L` | `-` | Replays authoritative Postgres SQL in recorded history order followed by pending-file order after an Auth-first PGlite rehearsal, then migrates Auth and application data to hosted or local Supabase. Migration-only projects do not need applied-file mirrors; declarative-only projects must generate a pending migration first. Quiescent `sqlite-postgres` filesystem Storage can migrate to a fresh local target; hosted/custom-adapter Storage, native bare-SQLite migrations and Realtime config remain unsupported. See [Storage limits](UPGRADE.md#local-filesystem-storage). |

---

## Edge Functions

Partial: Bun 1.4.2+ serves portable default-export `{ fetch }` handlers through `dev` / `start`. Workers run trusted code with host permissions; see the [canonical setup and compatibility guide](docs/other/edge-functions.mdx).

| Capability | Status | Effort | Blocker | Notes |
|------------|:------:|:------:|:-------:|-------|
| Invoke routing (`/functions/v1/{name}`) | ✅ | - | - | SDK calls, nested paths, query, headers, body, and abort signal. Built-in handlers see `/name/subpath`, matching Supabase routing; advanced executors receive the original gateway URL. |
| Per-function credential verification (`verify_jwt`) | ⚠️ | - | - | Defaults on; recognized configured/resolved API keys or HS256 JWTs. Authorization header takes precedence over `apikey`. JWTs need no user lookup. No asymmetric JWT/JWKS support. `false` permits keyless requests; handlers still own authorization. |
| Body / Content-Type handling + response dispatch | ✅ | - | - | Web Request/Response transport; SDK serialization/decoding and HTTP/relay/fetch error classification. Handler-owned CORS and `OPTIONS`. |
| Streaming responses (SSE passthrough) | ⚠️ | - | `platform-limited` | Incremental streams pass through without buffering; request abort and stream cancellation are forwarded. Handler-level abort/cancel callbacks depend on runtime behavior and are not guaranteed. |
| Region routing (`x-region` / `forceFunctionRegion`) | ⚠️ | `S` | `-` | Header + query passthrough only; no actual region selection. |
| Portable function source and dependencies | ⚠️ | - | `platform-limited` | Default-export `{ fetch }` TypeScript source, relative shared modules, and ordinary installed packages. Matching Supabase import mappings preserve source on graduation. No `Deno.serve`, Deno APIs, direct `npm:` / `jsr:` specifiers, or local Deno import-map resolution. |
| Bun host + worker lifecycle | ⚠️ | - | `platform-limited` | Bun 1.4.2+ CLI; native workers in one process, `oneshot` (default) / `per_worker`, four workers, eight active requests per reused worker, startup/request deadlines, idle cleanup, and `503 BUSY` at capacity. Timeouts terminate workers. No permission sandbox. See the guide for lifecycle details. |
| Trusted injected executor | ✅ | - | - | Advanced Web-API-compatible `fetch(request, { name, jwt, apiKeyType })`; an explicit driver overrides automatic discovery/runtime setup. Executes trusted host code with host permissions. |
| Local `dev` file refresh | ⚠️ | - | `platform-limited` | Functions tree, configured entrypoints, project package manifest/Bun lock, and TOML/JSON function/runtime settings. Restart for executable configs, other server settings, imports outside watched paths, or `node_modules` changes. `start` does not watch. |
| Separate `functions serve` command | 🔄 | `L` | `-` | Use normal `dev` / `start` for local execution. |
| Deployment / management API (deploy, list, get, update, delete, body) | 🔄 | `L` | `-` | Use Supabase's deployment tooling; Lite does not implement these commands. |
| Secrets / env injection (`process.env`) | ✅ | - | - | Worker environment from `supabase/functions/.env` plus managed local URL/key values. Host environment is not inherited through `process.env`; this is not a security boundary. No user identity is fabricated. |
| Database Webhooks (`supabase_functions.hooks`, `http_request` trigger) | 🔄 | `M` | `platform-limited` | Separate from invoking an HTTP function; database-trigger delivery is not implemented. |

---

## Realtime

Planned, not started. Only a config schema exists (`app/src/config/realtime.ts`: `enabled`, `ip_version`, `max_header_length`). No WebSocket server, no channels.

The `@supabase/realtime-js` surface is one channel abstraction (`supabase.channel(...).on(...).subscribe()`) carrying three feature families. **Broadcast** and **Presence** are pure pub/sub over a WebSocket and don't touch the database, so they're tractable once the socket transport exists. **Postgres Changes** is the harder one: Supabase streams it from Postgres logical replication (WAL), which SQLite does not have. Rather than reach for an extension, lite can capture changes at the app layer: every mutation flows through the Data API, so change events can be emitted from there without DB triggers or replication. The tradeoff is that this only sees writes made through lite, not out-of-band writes straight to the database.

| Capability | Status | Effort | Blocker | Notes |
|------------|:------:|:------:|:-------:|-------|
| WebSocket transport + channel protocol (`/realtime/v1`) | 🔄 | `M` | `-` | Foundation: socket server, Phoenix-style channel join/leave, heartbeat. |
| Broadcast (ephemeral pub/sub messages) | 🔄 | `M` | `-` | Independent of the database; fan-out to channel subscribers. |
| Presence (track / sync / join / leave state) | 🔄 | `M` | `-` | Built on the same channel + a per-channel state CRDT. |
| Channel authorization (private channels / RLS) | 🔄 | `M` | `-` | Reuse the existing RLS engine + JWT to gate join and message access. |
| Postgres Changes / CDC (`postgres_changes` on INSERT/UPDATE/DELETE) | 🔄 | `L` | `platform-limited` | No SQLite logical replication. Capture changes at the app layer (all mutations flow through the Data API), avoiding extensions and DB triggers. Caveat: only catches writes made through lite, not out-of-band direct DB writes. |
| Broadcast-from-database (`realtime.broadcast_changes`) | 🔄 | `L` | `platform-limited` | Same app-layer change capture as CDC; emits broadcast messages from row changes. |

---

> Maintenance: update this file alongside [STATUS.md](https://github.com/supabase/lite/blob/HEAD/STATUS.md) whenever feature support changes. Statuses here must agree with STATUS.md; this doc only adds the effort/blocker lens, it never overrides a support verdict. See [AGENTS.md](https://github.com/supabase/lite/blob/HEAD/AGENTS.md).
