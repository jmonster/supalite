# Auth user compatibility during upgrade

Lite 0.11.0 could migrate schema, users and data successfully yet return
`400 invalid_credentials` on fresh password sign-in.

## Cause

Lite omits `instance_id`; Supabase's [nullable column has no default](https://github.com/supabase/auth/blob/f3425cf742c69ad663776105e0363d81c5d4d731/migrations/00_init_auth_schema.up.sql#L4),
but [GoTrue lookups require the zero UUID](https://github.com/supabase/auth/blob/f3425cf742c69ad663776105e0363d81c5d4d731/internal/models/user.go#L618-L631).
Separately, Lite's NULL inactive token/change fields conflict with
[GoTrue's non-nullable strings](https://github.com/supabase/auth/blob/f3425cf742c69ad663776105e0363d81c5d4d731/internal/models/user.go#L37-L56),
causing [login scan errors](https://supabase.com/docs/guides/troubleshooting/scan-error-on-column-confirmation_token-converting-null-to-string-is-unsupported-during-auth-login-a0c686).
Neither mismatch requires password rehashing or resets.

## Correction

[`upgrade-auth-users.js`](../upstream/lite-0.11.0/dist/cli/upgrade-auth-users.js)
normalizes Supabase-target `auth.users` exports:

- Missing/null `instance_id` becomes `00000000-0000-0000-0000-000000000000`
- Missing/null confirmation, recovery, email-change, phone-change and
  reauthentication token/change strings become empty strings
- Existing values, password hashes, user/identity IDs, confirmation timestamps,
  metadata and nullable contacts are preserved; no credentials, confirmations or
  sessions are created

Real local and hosted upgrades use this mapping. The Lite-schema `local`
rehearsal and non-user exports retain their existing behavior, including SQL
quoting, JSON/boolean conversion, generated-column omission and migration order.

## Verification

```sh
bun install --frozen-lockfile
bun test --bail --timeout 60000 test/auth-upgrade.test.mjs
```

Tests replay production-exporter SQL in PGlite: lookup eligibility, exact hashes,
correct/wrong passwords, IDs, confirmation state, metadata, pending tokens,
nullable contacts, quoting, multiple users and source immutability. PGlite does
not run GoTrue.

## Real-stack qualification

The same synthetic fixture [failed before correction](https://github.com/jmonster/supalite/actions/runs/37150789045)
(`071d9749379568e9e0a77a17c8c8484d92a7cef4`) and
[passed afterward](https://github.com/jmonster/supalite/actions/runs/37152316112)
(`ceab795a23541d5f972587b0f5df56bb5a3d3ea1`). Only the upgrade package changed.

Versions: Lite 0.11.0 `sqlite-postgres`, Node 24.21.0, supabase-js 2.117.2,
CLI 2.98.1 ([GoTrue 2.188.1](https://github.com/supabase/cli/blob/b89a94567975321f9eb58a487825fb2a35f11188/pkg/config/templates/Dockerfile#L13)),
PostgreSQL 15, Ubuntu 24.04 with Docker.

Assertions covered fresh sign-in; preserved IDs, owner-private data and JSONB;
native RLS and anonymous/cross-owner isolation; foreign keys and serial
high-water marks; recorded migration SQL despite an edited file; unchanged
source config and a disposable target. No sessions/refresh tokens transferred;
cleanup succeeded.

This historical run predates the current package layout and was not rerun for
that packaging change. It qualifies this synthetic SQLite-to-local-Supabase
path, not hosted Management API behavior, session transfer, Storage/Realtime
migration, production data or arbitrary schemas.
