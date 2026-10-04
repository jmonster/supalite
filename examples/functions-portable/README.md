# Graduate a private task and its attachment

A two-user app, one unchanged TypeScript function, SQLite and local Supabase. The app signs up two people, saves an owned task, completes it through a function, and uploads a private binary attachment. Then it stops Lite, upgrades the populated project and signs back in with the same password and user UUIDs.

## Run

From the repository root, with Bun 1.4.2 and Supabase CLI 2.119.0 installed:

```sh
bun install --frozen-lockfile
LITE_SUPABASE_CLI=/absolute/path/to/supabase bun examples/functions-portable/graduate.mjs
```

The command creates isolated source and target workdirs, runs the real `lite upgrade --target local --local-runtime native` command, verifies both backends and stops only the processes it started. Native Supabase downloads its service binaries on first use. It needs a host that permits PostgreSQL Unix sockets. No Docker or hosted account is required for this native route.

To exercise Lite alone:

```sh
bun examples/functions-portable/graduate.mjs --lite-only
```

A JSON receipt records the task, user UUIDs, attachment hash, source hashes and checks. Generated workdirs are retained under `.graduation/` for inspection. Credentials are private local test data and are not part of the public receipt.

## What must survive

- Password sign-in and both user UUIDs after reauthentication
- The populated task, its owner, completion state and attachment link
- Private attachment UUID, owner, creation time, metadata and exact bytes
- Function invocation with a verified caller JWT and `auth.uid()` ownership defaults
- Denial of the other user's row reads, writes, function reads and file downloads
- Byte-identical application files, function source, shared/import configuration and migration SQL

The example uses the normal Supabase SDK throughout. The function calls `auth.getUser()` and passes the caller's Authorization header to the Data API. It never uses a service key. RLS restricts records and Storage objects to their owner. `owner_id` is omitted on insert and populated by `DEFAULT auth.uid()`.

## Manual use

Run Lite from this directory:

```sh
EXPERIMENTAL_STORAGE=1 bun ../../upstream/lite-0.11.0/dist/cli/index.js dev --config supabase/config.lite.toml --no-admin
```

In another terminal:

```sh
SUPABASE_URL=http://127.0.0.1:54321 SUPABASE_PUBLISHABLE_KEY=sb_publishable_portability_demo bun app/acceptance.mjs
```

Stop Lite before migration and keep other writers stopped. Upgrade into a new separate directory:

```sh
EXPERIMENTAL_STORAGE=1 bun ../../upstream/lite-0.11.0/dist/cli/index.js upgrade --config supabase/config.lite.toml --target local --local-runtime native --local-dir ../graduated-tasks --storage-quiescent --no-migrate-sessions --force
```

Point the same client at the printed target URL/key and run `DEMO_PHASE=verify` with the same `.lite/graduation-state.json`. The fixture password defaults to `Local-fixture-only-password-44!`; these are disposable `.test` accounts.

## Limits

This demonstrates one SQLite-filesystem-to-local-Supabase route. It does not establish hosted deployment, Realtime, email delivery, OAuth, every RLS expression or every Storage backend. Sessions and refresh tokens are deliberately not migrated. Users sign in again. Signed URLs must be recreated. Storage backend versions, ETags and update/access times may change; logical object identity and bytes must not.

Both configurations disable email confirmation only for disposable local accounts. The checked-in keys, JWT secret and password are fixture values, unsuitable for a real deployment. Functions execute trusted project code; Lite's Bun worker is not a security sandbox. The qualification requires native Supabase Storage and Edge Runtime together in one run; older independent receipts are not evidence for this complete route.
