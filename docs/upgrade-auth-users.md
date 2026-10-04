# Auth user compatibility during upgrade

A real local-Supabase qualification of the unmodified Lite 0.11.0 upgrade reached a specific failure: schema/auth/data migration completed and preserved user and identity IDs, but fresh password sign-in returned `400 invalid_credentials`. The same synthetic fixture signed in successfully before upgrade. [Qualification run](https://github.com/jmonster/supalite/actions/runs/37150789045)

## Cause

Lite's packaged `auth.users` schema has no `instance_id` column, so its auth exporter omits that column. The Supabase target's column is nullable with no default. GoTrue's user lookup explicitly requires the zero UUID in that column; migrated rows with `NULL` are therefore invisible to the lookup.

This follows the versions used by the published local upgrade path:

- Supabase CLI 2.98.1 [pins GoTrue 2.188.1](https://github.com/supabase/cli/blob/b89a94567975321f9eb58a487825fb2a35f11188/pkg/config/templates/Dockerfile#L13)
- GoTrue's initial schema declares [nullable `instance_id` without a default](https://github.com/supabase/auth/blob/f3425cf742c69ad663776105e0363d81c5d4d731/migrations/00_init_auth_schema.up.sql#L4)
- Its [email, phone and ID lookups require the zero UUID](https://github.com/supabase/auth/blob/f3425cf742c69ad663776105e0363d81c5d4d731/internal/models/user.go#L618-L631)

The fixture's bcrypt hash was preserved and verified against the original password. No password rehashing or password reset is needed to correct the lookup mismatch.

There is a second field-representation mismatch in the same export: Lite uses `NULL` for inactive token/change text fields, while the [GoTrue User model uses non-nullable strings](https://github.com/supabase/auth/blob/f3425cf742c69ad663776105e0363d81c5d4d731/internal/models/user.go#L37-L56). Supabase documents the resulting [NULL-to-string scan error during login](https://supabase.com/docs/guides/troubleshooting/scan-error-on-column-confirmation_token-converting-null-to-string-is-unsupported-during-auth-login-a0c686).

## Correction

`upstream/lite-0.11.0/dist/cli/upgrade-auth-users.js` normalizes only Supabase-target `auth.users` records:

- A missing or null `instance_id` becomes `00000000-0000-0000-0000-000000000000`
- Missing or null inactive token/change text fields become empty strings
- Existing non-null values, password hashes, identity IDs, confirmation timestamps, metadata and nullable contacts remain unchanged

The field list is limited to confirmation, recovery, email-change, phone-change and reauthentication token/change strings. Email addresses, phone numbers, password hashes and timestamps are not coerced to empty strings. The normalizer does not confirm users or create credentials or sessions.

The existing exporter still handles SQL quoting, JSON/boolean conversion, generated-column omission, identity export and migration order. The Lite-schema rehearsal export and all non-user auth table exports remain unchanged. Both real local Supabase and hosted upgrades use the Supabase-target mapping; the internal `local` export mode is for the packaged rehearsal schema.

The tracked CLI calls this package-local helper directly in its Supabase-target user export. The working JavaScript contains the behavior change; no generated package or source-rewriting step is needed.

## Verification

```sh
bun install --frozen-lockfile
bun test --bail --timeout 60000 test/auth-upgrade.test.mjs
```

Tests create real Lite Auth users, import the tracked production exporter, and apply its SQL to PGlite with the relevant Supabase auth-schema difference. The corrected user is discoverable by GoTrue's lookup predicate, retains the exact password hash, verifies the original password, rejects a different password, and preserves IDs, confirmation state and metadata. The local rehearsal export retains its original representation.

Additional tests check multiple users, pending nonempty token values and SQL quoting, preservation of nullable unique contacts, source-row immutability, and unchanged non-user export behavior. These are SQL-level tests; PGlite does not run GoTrue itself. The historical real-stack qualification below predates this direct-source packaging and has not been rerun as part of that packaging change.

## Real-stack qualification

The same fixture that failed fresh sign-in on the published exporter passed with this correction:

- [Published exporter: migration completed, fresh sign-in failed](https://github.com/jmonster/supalite/actions/runs/37150789045), qualification commit `071d9749379568e9e0a77a17c8c8484d92a7cef4`
- [Corrected exporter: complete before/after SDK contract passed](https://github.com/jmonster/supalite/actions/runs/37152316112), qualification commit `ceab795a23541d5f972587b0f5df56bb5a3d3ea1`

The successful run used Node.js 24.21.0, the verified Lite 0.11.0 distribution with this auth-export integration, supabase-js 2.117.2, and Supabase CLI 2.98.1 on a Docker-capable Ubuntu 24.04 runner. The published local upgrade runner configures PostgreSQL major version 15; CLI 2.98.1 pins GoTrue 2.188.1. The source used Lite's `sqlite-postgres` backend. These version and fixture details bound the result.

One real-stack test passed in 129.8 seconds, with zero failures or skips. It checked:

- Fresh password sign-in after migration, with unchanged user and identity IDs
- Preserved owner-private records and JSONB values
- Enabled native PostgreSQL RLS, anonymous isolation and cross-owner read/write isolation
- Foreign-key rejection and newly generated serial IDs above the migrated high-water marks
- Authoritative recorded migration SQL despite an edited applied migration file
- An unchanged source config, a separate disposable target directory, and no transferred sessions or refresh tokens

The source fixture and shared SDK assertions were unchanged between the failing and successful runs. Only the actual upgrade invocation selected the corrected auth-export package. The test's teardown and the workflow's independent cleanup both completed successfully. No hosted Supabase project, real-user credentials, or production data were involved.

This qualifies the synthetic SQLite-to-local-Supabase path above. It does not establish hosted Management API behavior, session transfer, Storage or Realtime migration, or compatibility with every source schema and data set.
