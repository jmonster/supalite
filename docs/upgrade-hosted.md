# Hosted Supabase graduation

The hosted target creates a fresh Supabase project, applies the recorded PostgreSQL migrations, replays Auth identities and password hashes, transfers verified Storage, and imports application rows in foreign-key order. Application provisioning/counter trigger functions are neutralized during replay and restored exactly; constraints and platform triggers remain active. Management API query responses use row arrays, which the hosted adapter supplies to the shared verification pipeline.

Stop source writers and keep them stopped throughout the upgrade. The stock filesystem source requires `EXPERIMENTAL_STORAGE=1` and PostgreSQL migrations on SQLite. Storage preserves bucket/object IDs, owners, creation times, restrictions and logical metadata. It streams file bytes through the target Storage API, verifies downloaded SHA-256 and checks application imports did not alter Storage. Operational file versions and modification/access times may change. Stored cache-control is retained and verified; response cache directives follow the target Storage gateway.

```sh
EXPERIMENTAL_STORAGE=1 lite upgrade --target hosted --dry-run --json --storage-quiescent
EXPERIMENTAL_STORAGE=1 lite upgrade --target hosted --org-id "$SUPABASE_ORG_ID" \
  --region us-east-1 --project-name my-poc --storage-quiescent \
  --no-migrate-sessions --force --dump-credentials private-credentials.json
```

Supply `SUPABASE_ACCESS_TOKEN` through your existing credential manager. Select a free organization with project capacity when a free project is required. The upgrade does not choose a billing plan or change subscriptions. Credentials are written exclusively in mode 0600; the CLI also prints them, so capture its output in a private log.

Storage accepts the exact `https://<project-ref>.supabase.co` origin and a service-role JWT whose `ref` matches, with no `sub` claim. Local Storage remains limited to loopback origins. Requests reject redirects. Custom hosted domains and arbitrary endpoint hosts are outside this supported transfer.

Auth site URL, allowed redirects, signup behavior and password requirements follow source configuration. Reconfigure the application origin and recovery redirects for the deployed frontend; public recovery email needs a suitable mail provider. With `--no-migrate-sessions`, existing users sign in again with their retained passwords.

Target application is not atomic across all services. Failure can leave a partial target; preserve the frozen source and inspect the failed target before retrying. Hosted boundaries have focused SQL/HTTP regression coverage; the Poolometer managed-project demonstration requires operator account access and remains separately qualified from local runtime tests.
