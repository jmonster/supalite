# Native local upgrade

Requires Bun, the `postgres` adapter (pinned to 3.4.8 here), and official
**Supabase CLI 2.119.0** on a supported native host. Linux/macOS must permit
Unix-domain sockets. The legacy local runtime remains the default.

Stop source writers and choose a new or empty directory outside the source project:

```sh
LITE_SUPABASE_CLI=/absolute/path/to/official/supabase \
  bun upstream/lite-0.11.0/dist/cli/index.js --no-telemetry upgrade \
  --target local --local-runtime native --local-dir ../graduated-project \
  --config supabase/config.lite.toml \
  --storage-quiescent --no-migrate-sessions --force \
  --dump-credentials /private/path/local-credentials.json
```

Without the override, native mode uses `bunx --bun supabase@2.119.0`. Other CLI versions
are rejected. The override is whitespace-separated; use an executable path without
spaces. `--bun` runs the npm launcher under Bun rather than its Node shebang;
the pinned CLI/platform packages need no install-script trust grant. Native child commands enable `SUPABASE_EXPERIMENTAL_STACK=1`.

## Supported subset

- Postgres 17, Auth, REST, optional Storage and supported Functions; other services are disabled
- The existing local schema/data/Auth/Storage migration pipeline; sessions and signing secrets are not migrated, so users must sign in again
- Auth: enabled, site URL, redirects, JWT expiry, signup, anonymous sign-in, minimum password length and email confirmation; other Auth settings need destination configuration
- Regular Functions modules under the source config directory's `functions/`, including `_shared`, plain-JSON `deno.json`, `import_map.json` and `import-map.json`
- Function `enabled`, `verify_jwt`, in-tree `entrypoint`/`import_map`, and Edge Runtime `oneshot`/`per_worker` policy
- Relative import mappings within the Functions tree and runtime-resolved `npm:`, `jsr:`, `node:` or credential-free `https:` mappings

Source modules must be reviewed for embedded secrets. Dotenv/private-key files,
configured Functions environment values, Edge Runtime secrets, caches,
`node_modules` and `deno.lock` are omitted. Reconfigure required secrets at the
destination; its runtime supplies new SUPABASE_* values. Pin dependency versions.

Symlinks, special files, external entrypoints, arbitrary assets, JSONC,
workspace/extends configs and explicit lockfile settings are rejected. Raw module
imports are not exhaustively parsed: external relative imports, unmapped bare
packages and computed imports may pass copying but fail at runtime. Verify the
real target with your acceptance client; dry-run and fake-CLI tests do not qualify
a host or prove Bun-to-Deno compatibility.

## Safety and retry limits

Functions are hashed during readiness and rechecked before copying. Native mode
never rewrites source config or Functions; destination files use exclusive creation.
Credential dumps are new files only, mode 0600. `anonKey` prefers the target's
publishable key; `serviceRoleKey` retains its legacy JWT for Storage import, while
`secretKey` separately records the opaque key when available. Keep dumps and
credential-bearing status output private.

The target remains running after success. Stop only this owned stack:

```sh
SUPABASE_EXPERIMENTAL_STACK=1 supabase stack stop --workdir ../graduated-project --output-format json
```

Stop preserves data. Cleanup is confirmed only when its JSON acknowledges the
owned stack in `stopped` with no `unavailable` entries; exit code zero alone is
insufficient. A cleanup error leaves files and stop state available for inspection
and retry. After any partial failure, inspect and stop that target, then
retry into another fresh directory. Never reuse a populated destination or use
`stack stop --all`.
