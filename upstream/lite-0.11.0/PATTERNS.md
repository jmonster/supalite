# Patterns

Canonical recipes for apps built on `@supabase/lite`. Pair with [LIMITATIONS.md](https://github.com/supabase/lite/blob/HEAD/LIMITATIONS.md) (what to avoid) and [STATUS.md](https://github.com/supabase/lite/blob/HEAD/STATUS.md) (full reference).

This file is the authoritative source — the bundled [`supalite` skill](https://github.com/supabase/lite/blob/HEAD/skills/supalite/SKILL.md) points agents here, so updates land for every consumer on the next `npm install`.

## Per-user multi-tenant ("each user sees only their own X")

Most-common shape. Works the same on SQLite, PGlite, and Postgres.

Schema:

```sql
create table <thing> (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  -- domain columns
  created_at timestamptz not null default now()
);

alter table <thing> enable row level security;

create policy "select own" on <thing> for select to authenticated using (auth.uid() = user_id);
create policy "insert own" on <thing> for insert to authenticated with check (auth.uid() = user_id);
create policy "update own" on <thing> for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete own" on <thing> for delete to authenticated using (auth.uid() = user_id);
```

With the schema above, the client supplies `user_id`. Alternatively, add `DEFAULT auth.uid()` to that column and omit it from Data API inserts; SQLite resolves it before the ownership check. Direct SQL and trigger/view-mediated writes still need explicit owner values; see [Column Defaults](STATUS.md#column-defaults).

```ts
const { data: { session } } = await supabase.auth.getSession();
await supabase.from("<thing>").insert({
  user_id: session.user.id,
  // ...
});
```

## Per-user Storage ownership and folders

Uploads made with a verified JWT carrying a `sub` claim set both `storage.objects.owner_id` and the legacy `owner` field from that claim; `service_role` uploads remain ownerless. Custom string roles are preserved, so policies such as `TO manager` work when the database role and grants are configured. Use `owner_id` for per-user policies:

```sql
create policy "read own avatars"
on storage.objects for select to authenticated
using (bucket_id = 'avatars' and owner_id = auth.uid()::text);

create policy "upload own avatars"
on storage.objects for insert to authenticated
with check (bucket_id = 'avatars' and owner_id = auth.uid()::text);

create policy "update own avatars"
on storage.objects for update to authenticated
using (bucket_id = 'avatars' and owner_id = auth.uid()::text)
with check (bucket_id = 'avatars' and owner_id = auth.uid()::text);

create policy "delete own avatars"
on storage.objects for delete to authenticated
using (bucket_id = 'avatars' and owner_id = auth.uid()::text);
```

For a bucket laid out as `<user-id>/<filename>`, scope uploads to the caller's first folder:

```sql
create policy "upload to own avatar folder"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);
```

The indexed `storage.foldername()` form uses PostgreSQL's one-based indexing and works on SQLite, PGlite, and PostgreSQL. The upstream `storage.filename()` and `storage.extension()` helpers work across the same backends.

For shared workspaces, authorize the first path segment through an active membership row:

```sql
create table workspace_members (
  workspace_id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null,
  primary key (workspace_id, user_id)
);

create policy "read workspace files"
on storage.objects for select to authenticated
using (
  bucket_id = 'workspace-files'
  and owner_id = auth.uid()::text
  and (storage.foldername(name))[1] in (
    select workspace_id
    from workspace_members
    where user_id = auth.uid() and status = 'active'
  )
);
```

`IN (SELECT ...)` is the portable form for SQLite, PGlite, and PostgreSQL. A correlated `EXISTS` comparing `(storage.foldername(name))[1]` to `workspace_members.workspace_id` works too, in either operand order. The same dynamic comparisons work with `storage.filename()` and `storage.extension()`. On SQLite, do not rewrite this as `name LIKE workspace_members.workspace_id || '/%'`; general SQL concatenation in translated RLS expressions is unsupported.

Policy subqueries preserve both `FROM table AS alias` and implicit `FROM table alias` syntax. Separate aliases remain distinct when nested subqueries reference the same membership table, so use the normal PostgreSQL shape when each query level needs its own row identity.

On SQLite, keep membership subqueries in `USING` policies. Subqueries in `WITH CHECK` remain unsupported, so write upload and update checks against columns on the candidate row; see [RLS known limitations](https://github.com/supabase/lite/blob/HEAD/STATUS.md#row-level-security-rls).

Use the operation helpers when one SQL command backs multiple Storage actions. This policy permits downloads without exposing the same objects through list:

```sql
create policy "download avatars without listing"
on storage.objects for select to authenticated
using (
  bucket_id = 'avatars'
  and storage.allow_any_operation(array[
    'object.get_authenticated',
    'object.get_authenticated_info'
  ])
);
```

`storage.operation()` returns the complete route identifier, such as `storage.object.upload`. `storage.allow_only_operation()` and `storage.allow_any_operation()` accept operation names with or without the `storage.` prefix. Public buckets bypass RLS only when serving objects through `GET`, `HEAD`, and info. Keep `SELECT` policies for listing, signing, copy sources, and move sources, plus mutation policies for uploads, deletes, moves, and copies.

## Verifying RLS policies locally

Local admin mode is on by default for loopback `lite dev`, `lite start`, and Vite dev listeners. A request with **no** credential then runs as `service_role`, so a bare `curl` sees every row and proves nothing about your policies. Always test with a credential; those requests are never elevated and behave exactly as they will in production.

```bash
# anon: what a logged-out visitor sees
curl -H "apikey: $SUPABASE_PUBLISHABLE_KEY" \
  "http://127.0.0.1:54321/rest/v1/<thing>?select=*"

# authenticated: the apikey is required IN ADDITION to the user JWT
JWT=$(curl -s -H "apikey: $SUPABASE_PUBLISHABLE_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"email":"a@b.co","password":"secret123"}' \
  "http://127.0.0.1:54321/auth/v1/token?grant_type=password" | jq -r .access_token)

curl -H "apikey: $SUPABASE_PUBLISHABLE_KEY" -H "Authorization: Bearer $JWT" \
  "http://127.0.0.1:54321/rest/v1/<thing>?select=*"
```

`Authorization` alone is a 401 — opaque keys are only read from `apikey`, matching upstream. supabase-js sends both automatically, so app code needs no special handling. To take admin mode out of the picture entirely, start with `--no-admin` (or `supalite({ admin: false })`); keyless requests are not elevated and normal auth rules apply.

For a container, mobile device, or LAN client, expose the listener without exposing admin mode:

```bash
lite dev --host --no-admin
```

Bare `--host` has the same auth behavior but warns so the implicit admin shutdown is visible. `--host --admin` is only for direct trusted-network access: remote peers still require credentials, and a public tunnel can erase the peer boundary.

## Filtering an embedded resource

Dotted-path filters (`.eq('rel.col', v)`) work on every backend, with PostgREST semantics. A filter on the embed narrows the embedded array only. Use `!inner` when parent rows without a match must go away too.

```ts
// Every trip; `days` holds only the Paris days (`[]` when there are none):
const { data } = await supabase.from("trips").select("*, days(*)").eq("days.city", "Paris");

// Only trips that have at least one Paris day:
const { data: parisTrips } = await supabase.from("trips").select("*, days!inner(*)").eq("days.city", "Paris");
```

See [Embedded filters](https://github.com/supabase/lite/blob/HEAD/STATUS.md#embedded-filters).

## Custom server logic without `rpc()`

`rpc()` is not implemented on the SQLite path. Three options, in order of preference:

1. Express the logic as a SQL view or trigger in `schemas/schema.sql`.
2. Switch the driver to `pglite` or `postgres` in `supabase/config.toml`. `rpc()` works there.
3. Run a regular server endpoint (Hono / Express / Next route handler / Vite middleware) and call it directly from the client.

## Portable seed SQL

Use Postgres SQL in `supabase/seed.sql` with the `sqlite-postgres`, `pglite`, and `postgres` drivers:

```sql
insert into public.todos (id, metadata)
values (1, '{"source":"seed"}'::jsonb);
```

The `sqlite-postgres` driver translates schema-qualified targets and supported casts before it runs the seed. It hashes the original file and skips unchanged files. The bare `sqlite` driver does not translate seed files, so use native SQLite SQL with that driver.

## Vite + supalite cold start

The canonical Vite recipe:

1. `bun add @supabase/lite @supabase/supabase-js`
2. `vite.config.ts`:
   ```ts
   import { defineConfig } from "vite";
   import { supalite } from "@supabase/lite/vite";
   export default defineConfig({ plugins: [supalite()] });
   ```
3. `bunx lite init` to scaffold `supabase/`.
4. Write Postgres DDL in `supabase/schemas/schema.sql` (RLS enabled).
5. `src/lib/supabase.ts`:
   ```ts
   import { createClient } from "@supabase/supabase-js";
   export const supabase = createClient(window.location.origin, "<sb_publishable_...>");
   ```
6. `bun run dev`.

Same-process, same origin, hot-reload on schema changes. This plugin is the project's only backend process: do **not** run `lite dev` or `lite start` alongside it.

## `updated_at` timestamps via trigger

```sql
create or replace function set_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_<thing>_updated_at on <thing>;

create trigger set_<thing>_updated_at
before update on <thing>
for each row execute function set_updated_at();
```

The translator inlines `NEW.updated_at = now()` into a SQLite `CREATE TRIGGER` body. Physical trigger names include the table name, so the same PostgreSQL trigger name can be used on several tables and dropped independently. The function and trigger can live in separate ordered migrations. See [STATUS.md#plpgsql-trigger-functions](https://github.com/supabase/lite/blob/HEAD/STATUS.md#plpgsql-trigger-functions) for the supported subset.

## Profiles row on signup (`handle_new_user`)

```sql
create or replace function handle_new_user() returns trigger language plpgsql as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function handle_new_user();
```

Supported on all backends.
