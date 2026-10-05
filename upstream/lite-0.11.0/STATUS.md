# Status & Compatibility

Feature and API compatibility tracking for @supabase/lite. For usage docs, see [README.md](https://github.com/supabase/lite/blob/HEAD/README.md).

## Status Legend

| Status           | Icon | Meaning                                                  |
|------------------|------|----------------------------------------------------------|
| **Supported**    | ✅    | Works end-to-end                                         |
| **Partial**      | ⚠️   | Parsed/recognized but limited (see notes)                |
| **Incompatible** | ❌    | Not possible due to platform limitations                 |
| **Backlog**      | 🔄   | Backlog for future consideration/implementation          |
| **N/A**          | ⚫    | Not applicable (client-side only, TypeScript-only, etc.) |

---

## Database Support

| Runtime                    | Module                    | Status |
|----------------------------|---------------------------|--------|
| Node.js (SQLite)           | `node:sqlite`             | ✅      |
| Bun (SQLite)               | `bun:sqlite`              | ✅      |
| Browser (SQLite WASM)      | `@sqlite.org/sqlite-wasm` | ✅      |
| Cloudflare D1              | Workers binding           | ✅      |
| Cloudflare Durable Objects | DO SQLite                 | ✅      |
| PGlite                     | `@electric-sql/pglite`    | ✅      |
| PostgreSQL                 | `postgres` (node driver)  | ✅      |
| Supabase Cloud             | Cloud connection          | ✅      |
| LibSQL                     | `@libsql/client`          | ✅      |
| Turso                      | `@tursodatabase/database` | 🔄     |
| SQLite.ai                  |                           | 🔄     |

---

## Postgres-to-SQLite Translation

When using SQLite databases, SQL schemas written in Postgres dialect are translated on the fly. The translator extends the Postgres deparser. It passes through 1:1 compatible syntax unchanged, rewrites constructs that have SQLite equivalents (for example `SERIAL` → `INTEGER PRIMARY KEY AUTOINCREMENT`, `NOW()` → `datetime('now')`), silently drops Postgres-only decorators and relation/schema privilege metadata (storage parameters, locking clauses, table/schema/sequence grants), and errors on features that have no SQLite counterpart (`LATERAL` joins, table inheritance, function grants).

SQLite schema names use one fixed physical mapping. Relations in `public` stay bare (`public.todos` → `todos`); relations in other schemas become one quoted dotted identifier (`storage.objects` → `"storage.objects"`). Introspection reverses this mapping. A public identifier containing a dot is therefore ambiguous and is interpreted as a non-public schema-qualified relation.

📋 See [`app/POSTGRES-SQLITE-COMPAT.md`](https://github.com/supabase/lite/blob/HEAD/app/POSTGRES-SQLITE-COMPAT.md) for the full auto-generated compatibility reference (74 entries).

Here is an example of a Postgres schema that is translated to SQLite:

```sql
-- Postgres DDL
CREATE TYPE order_status AS ENUM('pending', 'processing', 'shipped', 'delivered');

CREATE TABLE users
(
   id         SERIAL PRIMARY KEY,
   email      VARCHAR(255) UNIQUE NOT NULL,
   name       TEXT                NOT NULL,
   is_active  BOOLEAN   DEFAULT true,
   tags       TEXT[],
   metadata   JSONB,
   created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE orders
(
   id         BIGSERIAL PRIMARY KEY,
   user_id    INTEGER REFERENCES users (id) ON DELETE CASCADE,
   status     order_status DEFAULT 'pending',
   total      NUMERIC(10, 2) CHECK (total >= 0) NOT NULL,
   items      JSONB,
   notes      TEXT,
   ordered_at TIMESTAMP    DEFAULT NOW()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE
POLICY user_orders ON orders FOR
SELECT
   USING (
   user_id = auth.uid (
   ))
```

Translated to SQLite:

```sql
-- CREATE TYPE not emitted

CREATE TABLE users
(
   id         INTEGER PRIMARY KEY AUTOINCREMENT,
   email      TEXT UNIQUE NOT NULL CHECK (length(email) <= 255),
   name       TEXT        NOT NULL,
   is_active  INTEGER DEFAULT true CHECK (is_active IN (0, 1)),
   tags       TEXT CHECK (
      tags IS NULL
         OR (
         json_valid(tags)
            AND json_type(tags) = 'array'
         )
      ),
   metadata   TEXT CHECK (
      metadata IS NULL
         OR json_valid(metadata)
      ),
   created_at TEXT    DEFAULT (datetime('now')) CHECK (
      created_at IS NULL
         OR datetime(created_at) IS NOT NULL
      )
) STRICT;

CREATE TABLE orders
(
   id         INTEGER PRIMARY KEY AUTOINCREMENT,
   user_id    INTEGER REFERENCES users (id) ON DELETE CASCADE,
   status     TEXT DEFAULT 'pending' CHECK (
      status IN ('pending', 'processing', 'shipped', 'delivered')
      ),
   total      REAL CHECK (total >= 0) NOT NULL CHECK (
      ABS(ROUND(total * 100) - total * 100) < 0.0001
         AND ABS(total) < 100000000
      ),
   items      TEXT CHECK (
      items IS NULL
         OR json_valid(items)
      ),
   notes      TEXT,
   ordered_at TEXT DEFAULT (datetime('now')) CHECK (
      ordered_at IS NULL
         OR datetime(ordered_at) IS NOT NULL
      )
) STRICT;

-- RLS statements not emitted
```

### Extension Statements

On the SQLite translation path, `CREATE EXTENSION` is accepted only for `plpgsql`, `pgcrypto`, and `uuid-ossp`, then omitted from the emitted DDL. The `plpgsql` declaration is accepted for `pg_dump` schema compatibility; PL/pgSQL support remains limited to the documented trigger-function subset. The UUID declarations allow migrations that use the supported `gen_random_uuid()` and `uuid_generate_v4()` defaults to run, but no other extension APIs are provided. Valid creation modifiers such as `IF NOT EXISTS`, `WITH SCHEMA`, `VERSION`, and `CASCADE` are accepted for those three exact names; quoted names remain case-sensitive.

To keep declarative `db diff` state convergent, `ALTER EXTENSION <accepted-name> SET SCHEMA ...` and `DROP EXTENSION` containing only accepted names are also omitted. Every other `CREATE EXTENSION`, all extension updates/member changes, schema moves for unsupported extensions, and drops containing an unsupported name fail during translation before any statement in that migration is executed. PGlite and PostgreSQL run extension statements natively; the bare `sqlite` driver does not translate PostgreSQL DDL.

### Translated Field Types

| PostgreSQL type / syntax | SQLite storage | Field implementation | Mapping / validation |
|--------------------------|----------------|----------------------|----------------------|
| `int2`, `smallint`, `int4`, `integer`, `int`, `int8`, `bigint` | `INTEGER` | `IntegerField` | Integer storage. |
| `serial`, `serial4`, `bigserial`, `serial8`, `smallserial`, `serial2` | `INTEGER` | `SerialField` | Primary keys become `INTEGER PRIMARY KEY AUTOINCREMENT`. |
| `float4`, `real`, `float8`, `double precision` | `REAL` | `RealField` | Real-number storage. |
| `numeric`, `decimal` | `REAL` | `RealField` | Precision/scale emits portable `CHECK` constraints when declared. |
| `text` | `TEXT` | `TextField` | Text storage. |
| `varchar`, `varchar(n)`, `character varying`, `character varying(n)`, `char`, `char(n)`, `character`, `character(n)` | `TEXT` | `TextField` | Length-constrained forms emit `length(...) <= n`. |
| `bpchar` | `TEXT` | `TextField` | Text storage. |
| `name` | `TEXT` | `TextField` | Emits a 63-character length check. |
| `bytea` | `BLOB` | `BlobField` | Binary storage. |
| `bool`, `boolean` | `INTEGER` | `BooleanField` | Stored as `0`/`1` with `CHECK (... IN (0, 1))`. |
| `date` | `TEXT` | `DateField` | Emits `date(...) IS NOT NULL` validation. |
| `time`, `time without time zone`, `timetz`, `time with time zone` | `TEXT` | `TimeField` | Emits `time(...) IS NOT NULL` validation. |
| `timestamp`, `timestamp without time zone`, `timestamptz`, `timestamp with time zone` | `TEXT` | `TimestampField` | Emits `datetime(...) IS NOT NULL` validation. |
| `interval` | `TEXT` | `IntervalField` | Stored as text; interval arithmetic is not emulated. |
| `json`, `jsonb` | `TEXT` | `JsonField` | Stored as JSON text with `json_valid(...)` checks. |
| `uuid` | `TEXT` | `UuidField` | Validates UUID shape and normalizes to lowercase. |
| `inet` | `TEXT` | `InetField` | Validates IPv4/IPv6 strings with optional CIDR prefixes. |
| `CREATE TYPE ... AS ENUM` | `TEXT` | `EnumField` | Emits allowed-value `CHECK (... IN (...))`. |
| `<type>[]`, `_type` arrays | `TEXT` | `ArrayField` | Stores JSON arrays and delegates element serialization where possible. |

Mutating an existing enum on the SQLite path (`ALTER TYPE ... ADD VALUE` / `RENAME VALUE`) is not supported; the translator fails with a clear error that names the type and operation. Recreate the type with the full value set, or track the change in a manual migration.

Unsupported PostgreSQL data types currently include `oid`, `xid`, `xid8`, `cid`, `money`, `citext`, `cidr`, `macaddr`, `macaddr8`, `bit`, `bit varying`, `varbit`, geometric types (`point`, `line`, `lseg`, `box`, `path`, `polygon`, `circle`), `xml`, text-search types (`tsvector`, `tsquery`), range and multirange types, `reg*` catalog reference types, internal types (`tid`, `pg_lsn`, `internal`), pseudo-types, and handler types.

**Custom domains & data representations.** On the Postgres path (PGlite/PostgreSQL), a column typed as a domain that defines `CAST(<domain> AS json)` (the PostgREST "data representations" feature) renders through that cast on reads and `RETURNING` — e.g. a `unixtz` domain over `timestamptz` returns epoch seconds, a `monetary` domain over `numeric` returns a fixed-precision string. On the SQLite path the known representation types (`color`, `unixtz`, `isodate`, `monetary`, `bytea_b64`) are handled by built-in field shims. Mutating JSON values **into** a domain column (epoch→`timestamptz`, base64→`bytea`, decimal-string→`numeric`) is converted on the Postgres path via `buildDomainInputValue`. Not yet handled: domain formatting through cross-relation embeds. Postgres connections run with `TimeZone=UTC` by default so `timestamptz` rendering is deterministic regardless of the server's host timezone; override via the `postgresOptions.connection.TimeZone` connection option.

### Column Defaults

Column `DEFAULT` expressions in Postgres DDL are evaluated by the SQLite translator at CREATE TABLE time. Only constant expressions and a small allow-list of functions are honored.

**Honored:**

| Default expression                          | SQLite emission                           | Notes                       |
|---------------------------------------------|-------------------------------------------|-----------------------------|
| Literals (`'pending'`, `true`, `0`, `NULL`) | as-is                                     | Booleans map to `0`/`1`     |
| `gen_random_uuid()`, `uuid_generate_v4()`   | inline `randomblob`-based UUID expression | RFC 4122 v4 shape           |
| `now()`, `current_timestamp`                | `datetime('now')`                         |                             |
| `current_date`                              | `date('now')`                             |                             |
| `current_time`                              | `time('now')`                             |                             |
| `random()`                                  | `random()`                                |                             |
| Calls to other registry functions (`lower('X')`) | parenthesized (`DEFAULT (lower('X'))`) | Same function registry as [CHECK constraint functions](#check-constraint-functions) |

**Known issue: operator expressions.** A bare operator expression such as `DEFAULT 1 + 1` translates without an error to `DEFAULT 1 + 1`. SQLite rejects this DDL (`near "+": syntax error`) because a non-literal default must be in parentheses, so the migration fails when it runs. Use a literal (`DEFAULT 2`) instead.

**Not honored — fails with `Function call "<name>" not supported`:**

- `auth.uid()`, `auth.role()`, `auth.email()`, `auth.jwt()` — these read JWT claims and have no SQLite equivalent. They only work inside RLS `USING` / `WITH CHECK` (rewritten on the AST), not as column defaults.
- `currval(...)`, and a bare `SELECT nextval(...)` statement.
- `clock_timestamp()`, `statement_timestamp()`, `transaction_timestamp()`, `txid_current()`, and other volatile catalog functions.
- User-defined functions and any function not in the allow-list above.

**Silently dropped (no error, no warning):**

- `CREATE SEQUENCE` and `ALTER SEQUENCE ... OWNED BY` emit no SQLite DDL. Sequences are not modeled.
- `DEFAULT nextval('seq')` on a `serial` or identity primary key becomes `INTEGER PRIMARY KEY AUTOINCREMENT`, also in the expanded `CREATE SEQUENCE` + `DEFAULT nextval(...)` form. On any other column the default is removed. A `NOT NULL` column then fails on the next insert that does not supply a value.

**Workaround for `default auth.uid()`:**

Drop the default; pass `user_id` from the client on insert (sourced from the authenticated session). RLS `WITH CHECK (user_id = auth.uid())` already enforces ownership server-side.

```sql
-- Instead of:
user_id uuid not null default auth.uid() references auth.users (id),

-- Use:
user_id uuid not null references auth.users (id),
-- and rely on a WITH CHECK policy to bind the row to the caller.
```

This limitation applies only to the SQLite path. On PGlite/Postgres backends, `auth.uid()` works as a column default because the `auth.uid()` SQL function is bootstrapped natively.

### CHECK constraint functions

`CHECK (…)` constraints in Postgres DDL are translated and then evaluated by SQLite at write time. Function calls use the same function registry as column defaults (`app/src/db/translation/fields/function-registry.ts`).

**Works and is enforced:** `length`, `lower`, `upper`, `ltrim`, `rtrim`, plus literal/operator comparisons. Example: `CHECK (email = lower(email))` rejects `'Upper@X.com'`.

**Rejected at translation time:**

- `char_length`, `character_length` → `Function call "char_length" not supported`. Use `length`.
- `trim(x)`, `btrim(x)` → `Function call "btrim" not supported` (Postgres parses 1-argument `trim` as `btrim`). Use `ltrim(rtrim(x))`.
- `regexp_replace`, custom functions, extension scalars → `Function call "<name>" not supported`.
- Regex `~` → `Operator "~" is not supported in SQLite`.
- `LIKE` → `Operator "~~" is not supported in SQLite`. SQLite has `LIKE`, but the DDL translator does not map it inside `CHECK`.

One rejected function or operator fails the whole `CREATE TABLE` statement, not only that constraint, so the migration does not apply.

**Known issue: `now()` in `CHECK`.** `CHECK (created <= now())` translates to `datetime('now')` and `CREATE TABLE` succeeds. SQLite then rejects every `INSERT` and `UPDATE` on the table with `non-deterministic use of datetime() in a CHECK constraint`, also for values that pass the check. Do not use `now()` or `current_timestamp` in `CHECK` on SQLite.

**Workaround:** validate richer rules in the app or via RLS `WITH CHECK` predicates.

On the Postgres / PGlite path these functions work as in upstream Postgres.

### Row Level Security (RLS)

RLS is supported on all database backends. The enforcement strategy differs by dialect:

- **SQLite:** Policies are extracted from the Postgres DDL during translation and enforced at the application layer by rewriting the PostgREST AST before query execution. `USING` conditions are merged into the query's `WHERE` clause; `WITH CHECK` conditions are evaluated in-memory against INSERT/UPDATE values.
- **PGlite / PostgreSQL:** Native Postgres RLS. Each request runs inside a transaction with `SET LOCAL role` and `set_config('request.jwt.claim.sub', ...)` so the database enforces policies directly.

**Auth context:** `auth.role` is resolved from the JWT `role` claim (set during token signing). A missing JWT or missing claim defaults to `"anon"`. This matches PostgREST behavior, where `request.jwt.claim.role` determines the database role. `auth.uid()` resolves to the JWT `sub` claim. `auth.jwt()` exposes the full JWT payload. A missing JWT or claim makes `auth.jwt() ->> 'x'` NULL, so the policy does not match, same as Postgres.

**Supported:**

| Feature                                        | SQLite | PGlite/Postgres | Notes                                                       |
|------------------------------------------------|--------|-----------------|-------------------------------------------------------------|
| `ENABLE ROW LEVEL SECURITY`                    | ✅      | ✅               | Default-deny when no policies match                         |
| `DISABLE ROW LEVEL SECURITY`                   | ✅      | ✅               | Policies remain stored but inert until RLS is enabled again |
| `CREATE POLICY ... USING (expr)`               | ✅      | ✅               | SQLite: merged into `WHERE`; Postgres: native               |
| `CREATE POLICY ... WITH CHECK (expr)`          | ✅      | ✅               | SQLite: validated in-memory; Postgres: native               |
| `AS PERMISSIVE` (default)                      | ✅      | ✅               | Multiple permissive policies `OR`'d                         |
| `AS RESTRICTIVE`                               | ✅      | ✅               | `AND`'d with combined permissive result                     |
| `FOR SELECT / INSERT / UPDATE / DELETE / ALL`  | ✅      | ✅               | Per-command policy targeting                                |
| `TO role` (`anon`, `authenticated`, `PUBLIC`)  | ✅      | ✅               | Role-based policy filtering; omitting `TO` = PUBLIC (warns) |
| Auth placeholders (`auth.uid()`, `auth.jwt()`) | ✅      | ✅               | Resolved at runtime from JWT context                        |
| `SELECT` / `EXISTS` policy subqueries           | ✅      | ✅               | Each relation keeps its schema and `AS`/implicit alias, including distinct aliases in nested same-table queries |
| `DROP POLICY` / `ALTER POLICY` (incl. rename)  | ✅      | ✅               | SQLite: applied to the collected RLS registry, not emitted as DDL |

Each supported behavior is regression-covered against both backends in [`app/test/db/rls/pglite-comparison.test.ts`](https://github.com/supabase/lite/blob/HEAD/app/test/db/rls/pglite-comparison.test.ts) (LITE-271), so a silent SQLite bypass fails the suite.

**Known limitations (SQLite):**

| Limitation                              | Details                                                                                                                                                     |
|-----------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Subquery `WITH CHECK` on `INSERT`       | `WITH CHECK` expressions containing subqueries (e.g. `user_id IN (SELECT ...)`, `EXISTS (...)`) cannot be evaluated in-memory. Currently throws an error. **Workaround:** denormalise the authorising column (e.g. `user_id` onto the child table) and use `auth.uid() = user_id`. See [WITH CHECK subqueries](https://github.com/supabase/lite/blob/HEAD/internal/docs/limitations/rls-with-check-subqueries.md). |
| `UPSERT` applies `INSERT` policies only | Postgres applies `UPDATE` policies on conflict; supalite applies `INSERT WITH CHECK` to all upsert rows since conflict resolution is unknown pre-execution. |
| `FORCE ROW LEVEL SECURITY`              | Accepted and ignored (`FORCE` / `NO FORCE`): there is no table-owner exemption to toggle. As on Postgres, `FORCE` alone does not enable RLS.                 |
| `RETURNING` + `SELECT` policy           | Postgres errors if `RETURNING` references rows not visible to `SELECT` policy. Not checked.                                                                 |

📖 See [`internal/docs/postgres/rls.md`](https://github.com/supabase/lite/blob/HEAD/internal/docs/postgres/rls.md) for the full RLS reference and behavior matrix.

**SQLite runtime metadata (`sqlite-postgres`):** Policies, Postgres field types, enums, constraints, comments, variables, and relationship metadata are collected during translation and stored in the disposable runtime metadata cache at `supabase/.temp/.runtime-metadata-cache.json`. For `lite start`, the only authority is the ordered `{version, statements}` history in `supabase_migrations.schema_migrations`: applied files may be edited or deleted, pending files and `schemas/*.sql` are ignored, and a missing, corrupt, old, stale, or tampered cache is rebuilt automatically from the recorded SQL. Startup also replays the same history into an in-memory SQLite database and compares its raw structure with the live database; introspection is used only for equality checking, never to invent metadata. Invalid history or out-of-band structural DDL exits with a `lite db reset` hint. `lite migration up` and `lite db reset` refresh migration-derived metadata even when no new migration was applied. `lite dev` and the Vite plugin remain declarative: after applying migrations they replace the complete metadata payload from the applied declarative schema, including after watched migrations. Cache writes use a sibling temporary file plus atomic rename and are best-effort; a write failure leaves the previous file intact while the rebuilt in-memory payload remains usable. Embedded/programmatic use retains the history-based deny backstop as a last resort. `pglite` / `postgres` (native RLS) and bare `sqlite` are unaffected.

**PGlite / PostgreSQL auto-setup:** When any table has `ENABLE ROW LEVEL SECURITY`, supalite creates `anon`, `authenticated`, and `service_role` roles (if missing; `service_role` uses `BYPASSRLS`) and grants default privileges on all tables and sequences in the relevant schemas. No manual `CREATE ROLE` or `GRANT` statements needed for these built-in roles.

### SQLite Physical Object Names

PostgreSQL trigger names are scoped per table, while index names are scoped per schema. SQLite uses one database-wide namespace for each object type, so the translator preserves the PostgreSQL scopes in physical names. Trigger names include the folded table name. Index names include the folded schema only when that schema is present in the configured table mapping: default mode emits `ix` for `public.ix` and `"auth.ix"` for `auth.ix`; prefix mode emits `public__ix` and `auth__ix`. Explicit indexes are never prefixed with their table name.

Unnamed indexes use PostgreSQL-style `<table>_<key-labels>_idx` names. Column keys use the column name, simple function expressions use the function name, and other expressions use `expr`; conflicts add a numeric suffix. `DROP INDEX` and `DROP TRIGGER` apply the same physical mapping, while PostgreSQL-facing introspection reports logical schema, table, and object names.

This physical naming change is breaking for existing pre-1.0 SQLite databases. Recreate the local database after upgrading to avoid retaining legacy unprefixed triggers or indexes.

### PL/pgSQL Trigger Functions

Postgres trigger functions (`RETURNS TRIGGER`, `LANGUAGE plpgsql`) are translated into inline SQLite `CREATE TRIGGER` statements. The function body is parsed and stored in a schema-aware registry. Unqualified names resolve against `public`. When the corresponding `CREATE TRIGGER` is reached, the body is inlined directly. Imperative migrations rebuild this registry from ordered, recorded migration history, so a trigger can reference a function created by an earlier migration. Pending files and edits to applied files do not affect the registry.

**Supported statements:**

| Statement                   | Example                                     | SQLite translation                                                      |
|-----------------------------|---------------------------------------------|-------------------------------------------------------------------------|
| `NEW.col = expr`            | `NEW.updated_at = now()`                    | `UPDATE table SET updated_at = datetime('now') WHERE rowid = NEW.rowid` |
| `NEW.col := expr`           | `NEW.name := upper(NEW.name)`               | Same as above                                                           |
| `INSERT INTO ...`           | `INSERT INTO profiles (id) VALUES (NEW.id)` | Pass-through inside trigger body                                        |
| `UPDATE ...` / `DELETE ...` | Any DML                                     | Pass-through inside trigger body                                        |
| `RETURN NEW` / `RETURN OLD` | Required in PG                              | Not emitted (implicit in SQLite)                                        |

Multiple `NEW.col = expr` assignments are merged into a single `UPDATE ... SET` statement.

**Trigger options:** `BEFORE`/`AFTER` timing, `INSERT`/`UPDATE`/`DELETE` events (and combinations), `UPDATE OF col1, col2`, `FOR EACH ROW`. SQLite trigger names are internally prefixed with the folded table name and mapped back during introspection, preserving PostgreSQL's per-table trigger namespace. `DROP TRIGGER [IF EXISTS] name ON table` targets that physical name. `SECURITY DEFINER` is silently ignored.

**Common Supabase patterns:** `handle_new_user` (insert into profiles on signup), `updated_at` timestamps, audit logging with `OLD`/`NEW` refs, counter updates.

**Unsupported (throws descriptive error):** `DECLARE`, `IF`/`ELSIF`/`ELSE`, `LOOP`, `RAISE`, `PERFORM`, `SELECT INTO`, `EXECUTE`, variables, non-trigger functions.

---

## Database API (PostgREST-compatible)

Request pipeline: HTTP request → PostgREST parser → internal AST → dialect-specific SQL (SQLite or Postgres).

SQLite compatibility targets the [Cloudflare workerd SQLite version](https://github.com/cloudflare/workerd/blob/3861a920e639af7c3ab6bf10ee42f1235c415ac2/MODULE.bazel#L26) (currently 3.47).

All operators are parsed into the AST. The "Status" column reflects whether a working **deparser handler** exists for that operator on each dialect.

### Core Operations

| Method     | SQLite | Postgres | Notes                                                               |
|------------|--------|----------|---------------------------------------------------------------------|
| `from()`   | ✅      | ✅        | Table/view selection                                                |
| `select()` | ✅      | ✅        | Columns, aliases, aggregates (implicit GROUP BY), JSON paths, casts |
| `insert()` | ✅      | ✅        | Single/batch, RETURNING (SQLite 3.35+)                              |
| `update()` | ✅      | ✅        | With WHERE, RETURNING (SQLite 3.35+)                                |
| `delete()` | ✅      | ✅        | With WHERE, RETURNING (SQLite 3.35+)                                |
| `upsert()` | ✅      | ✅        | ON CONFLICT (SQLite 3.24+)                                          |

### Comparison Filters

| Method         | SQLite | Postgres | Notes                          |
|----------------|--------|----------|--------------------------------|
| `eq()`         | ✅      | ✅        |                                |
| `neq()`        | ✅      | ✅        |                                |
| `gt()`         | ✅      | ✅        |                                |
| `gte()`        | ✅      | ✅        |                                |
| `lt()`         | ✅      | ✅        |                                |
| `lte()`        | ✅      | ✅        |                                |
| `in()`         | ✅      | ✅        |                                |
| `notIn()`      | ✅      | ✅        |                                |
| `is()`         | ✅      | ✅        | `NULL`, `true`, `false` checks |
| `isDistinct()` | ✅      | ✅        |                                |

### Pattern Matching

| Method         | SQLite | Postgres | Notes                                                 |
|----------------|--------|----------|-------------------------------------------------------|
| `like()`       | ✅      | ✅        |                                                       |
| `ilike()`      | ✅      | ✅        | SQLite lowers both operands before `LIKE`             |
| `likeAllOf()`  | ✅      | ✅        | SQLite expands quantified `LIKE` to `AND` predicates  |
| `likeAnyOf()`  | ✅      | ✅        | SQLite expands quantified `LIKE` to `OR` predicates   |
| `ilikeAllOf()` | ✅      | ✅        | SQLite lowers operands and expands to `AND` predicates |
| `ilikeAnyOf()` | ✅      | ✅        | SQLite lowers operands and expands to `OR` predicates |

### Array & JSON Filters

| Method          | SQLite | Postgres | Notes                                                                                         |
|-----------------|--------|----------|-----------------------------------------------------------------------------------------------|
| `contains()`    | ⚠️     | ✅        | SQLite: scalar arrays via `json_each`; shallow objects via `json_extract`. See caveats below. |
| `containedBy()` | ⚠️     | ✅        | SQLite: scalar arrays via `NOT EXISTS` over `json_each`. Objects/nested not supported.        |
| `overlaps()`    | ⚠️     | ✅        | SQLite: scalar arrays via `EXISTS` over `json_each`. Objects/nested not supported.            |
| `->` / `->>`    | ✅      | ✅        | JSON path in `select`, `order`, and `where` filters                                           |
| `jsonb` column  | ✅      | ✅        | Stored as TEXT + `json_valid()` check on SQLite                                               |

**SQLite containment caveats:**

- ✅ **Arrays of scalars** (`tags=cs.{a,b}`): matches Postgres `@>` semantics via `json_each`.
- ✅ **Shallow objects with scalar values** (`meta=cs.{"theme":"dark"}`): matched per-key with `json_extract(col, '$.key') = value`.
- ✅ **NULL columns** are safely skipped (no `json_each(NULL)` error).
- ✅ **Empty array input:** `cs []` → always true for non-null; `cd []` → only empty array matches; `ov []` → always false.
- ❌ **Arrays of objects** (`[{a:1}] @> [{a:1}]`): `json_each` yields JSON text for object elements; equality against JS-serialized binds is not reliable. _Follow-up:_ emit a per-element `EXISTS` with recursive key matching, or a correlated subquery comparing `json_extract` of each target key.
- ❌ **Nested objects in `cs` filter** (`data=cs.{"user":{"id":1}}`): `json_extract` returns the sub-object as JSON text which won't equal the JS-object bind. _Follow-up:_ recursively walk the filter object and emit one `json_extract` comparison per leaf scalar key (`json_extract(col, '$.user.id') = 1`).
- ❌ **`cd`/`ov` with object values:** the operators currently require array inputs. _Follow-up:_ define semantics (does `cd` mean "all top-level keys in set"?) and add handlers.

### Full-Text Search

| Method                 | SQLite | Postgres | Notes                                        |
|------------------------|--------|----------|----------------------------------------------|
| `textSearch()` (fts)   | ⚠️     | ✅        | SQLite: LIKE-based tsvector-lexeme approximation, not FTS5 ranking. Language/dictionary variants and computed-column FTS are limited. |
| `textSearch()` (plfts) | ⚠️     | ✅        | SQLite: phrase query split into per-lexeme `AND` over the approximation |
| `textSearch()` (phfts) | ⚠️     | ✅        | SQLite: same lexeme approximation; dictionary/stemming differences not modeled |
| `textSearch()` (wfts)  | ⚠️     | ✅        | SQLite: websearch query parsed to lexemes over the approximation |

### Advanced Filters

| Method     | SQLite | Postgres | Notes                                           |
|------------|--------|----------|-------------------------------------------------|
| `match()`  | ✅      | ✅        | Multiple eq, expanded by parser, uses base ops |
| `or()`     | ✅      | ✅        | Logical OR via `$or` in AST                     |
| `not()`    | ✅      | ✅        | Logical NOT via `$not` in AST                   |
| `filter()` | ✅      | ✅        | Delegates to individual operator handlers       |

### Regex

| Method          | SQLite | Postgres | Notes                                            |
|-----------------|--------|----------|--------------------------------------------------|
| `regexMatch()`  | ⚠️     | ✅        | SQLite: simple anchored/literal patterns (`^foo`, `bar$`, `^exact$`, substrings) translated to `GLOB`; complex regex (classes, quantifiers, alternation) unsupported |
| `regexIMatch()` | ⚠️     | ✅        | SQLite: case-insensitive variant of the above via `LIKE`; complex regex unsupported |

### Range Operators

| Method            | SQLite | Postgres | Notes                    |
|-------------------|--------|----------|--------------------------|
| `rangeGt()`       | ❌      | ✅        | No range types in SQLite |
| `rangeGte()`      | ❌      | ✅        |                          |
| `rangeLt()`       | ❌      | ✅        |                          |
| `rangeLte()`      | ❌      | ✅        |                          |
| `rangeAdjacent()` | ❌      | ✅        |                          |

### Quantified Comparison Operators

| Method                  | SQLite | Postgres | Notes                        |
|-------------------------|--------|----------|------------------------------|
| `eq(any)` / `eq(all)`   | ❌     | ✅        | Not implemented on SQLite    |
| `neq(any)` / `neq(all)` | ❌     | ✅        |                              |
| `gt(any)` / `gt(all)`   | ❌     | ✅        |                              |
| `gte(any)` / `gte(all)` | ❌     | ✅        |                              |
| `lt(any)` / `lt(all)`   | ❌     | ✅        |                              |
| `lte(any)` / `lte(all)` | ❌     | ✅        |                              |

> Postgres `col=eq(any).{1,2,3}` compiles to `col = ANY(ARRAY[…])`. SQLite has no array type and no `ANY`/`ALL` quantified form on scalars; emulating it would require expanding to `OR`/`AND` chains over the literal list. Not implemented.

### Transforms

| Method          | SQLite | Postgres | Notes                           |
|-----------------|--------|----------|---------------------------------|
| `order()`       | ✅      | ✅        | NULLS FIRST/LAST (SQLite 3.30+) |
| `limit()`       | ✅      | ✅        |                                 |
| `range()`       | ✅      | ✅        | LIMIT + OFFSET                  |
| `single()`      | ✅      | ✅        | Via Prefer header               |
| `maybeSingle()` | ✅      | ✅        | Via Prefer header               |

### Resource Embedding

| Feature               | SQLite | Postgres | Notes                                                                                           |
|-----------------------|--------|----------|-------------------------------------------------------------------------------------------------|
| Foreign key joins     | ✅      | ✅        | Auto-resolved from introspection; embed null/not-null filters use relationship existence checks |
| Spread (`...`)        | ✅      | ✅        | Inline embedded columns; array spreads preserve JSON object/array values and related ordering   |
| Inner join (`!inner`) | ✅      | ✅        |                                                                                                 |
| Nested embedding      | ✅      | ✅        | Multi-level joins                                                                               |
| Aggregates            | ✅      | ✅        | count, sum, avg, min, max; spread aggregates return PGRST127                                    |

### Embedded filters

Filtering an embedded resource by one of its own columns (the dotted-path syntax `.eq('rel.col', value)` from supabase-js, `rel.col=eq.value` in the URL) works on SQLite. The filter is applied inside the embedded subquery. As in PostgREST, it narrows the embedded array and does not remove parent rows. Add `!inner` to also remove parents with no match.

```ts
// Every trip, with only its Paris days (a trip without one gets `days: []`):
await client.from("trips").select("*, days(*)").eq("days.city", "Paris");

// Only trips that have a Paris day:
await client.from("trips").select("*, days!inner(*)").eq("days.city", "Paris");
```

Verified on SQLite: comparison operators, `in`, `not`, `rel.or=(...)`, `!inner`, and a second-level embed (`days.stops.place=eq.X`). The spec cases `curated::embedding::embedded_filter` and `curated::filters_extended::embedded_filter_nonexistent_resource_error` pass. The Postgres / PGlite path behaves the same.

### Response Shaping & Utilities

| Method           | SQLite | Postgres | Notes                                 |
|------------------|--------|----------|---------------------------------------|
| `csv()`          | ✅     | ✅       | Input + output via `text/csv` Accept/Content-Type |
| `geojson()`      | ❌      | ❌       | Requires SpatiaLite or PostGIS; not wired up |
| `explain()`      | ⚠️     | ⚠️       | Returns compiled SQL via `application/vnd.pgrst.plan`; real plan output not surfaced |
| `abortSignal()`  | ✅      | ✅        | Signal check before execution         |
| `setHeader()`    | ✅      | ✅        | HTTP layer                            |
| `throwOnError()` | ✅      | ✅        | JS error mode                         |
| `maxAffected()`  | ✅      | ✅        | Check `changes()` after execution     |

**CORS / `OPTIONS` preflight:** Handled across `/rest/v1`, `/auth/v1`, and `/storage/v1` (not a supabase-js method, so excluded from the counts below). Each surface matches its upstream service: on `/rest`, `OPTIONS` follows PostgREST semantics — `200` with CORS headers for a known table, `404` (PGRST205) for an unknown one — and never requires auth (preflight succeeds even when anonymous access is disabled); `/auth` mirrors GoTrue's `204` preflight (reflected method, credentials, wildcard origin); `/storage` answers preflight with `204`. Origin is `*` (matches the Supabase CLI), and `Content-Range`, `Content-Location`, and `Preference-Applied` are exposed via `Access-Control-Expose-Headers`.

### Control & Specialized

| Method            | SQLite | Postgres | Notes                                                 |
|-------------------|--------|----------|-------------------------------------------------------|
| `rpc()`           | ❌     | ✅        | Not supported on SQLite. Postgres RPC depends on stored procedures (`CREATE FUNCTION ... LANGUAGE sql/plpgsql`); SQLite has no stored-procedure model and we don't intend to introduce a parallel JS-function registry. Use a regular HTTP/server endpoint for custom logic. |
| `schema()`        | ⚠️     | ✅        | SQLite (`sqlite-postgres` driver): schemas listed in `api.schemas` are served through `Accept-Profile` / `Content-Profile`, for reads and writes; other schemas return 406 `PGRST106`. A non-public table is stored as one dotted identifier (`private.secrets` → `"private.secrets"`, see [Postgres-to-SQLite Translation](#postgres-to-sqlite-translation)), so there is no namespace isolation. Embeds across two schemas return `PGRST205`. The bare `sqlite` driver has no schema handling. |
| `rollback()`      | ❌      | ❌        | Not implemented. `Prefer: tx=rollback` is echoed in `Preference-Applied`, but the write still commits (verified on SQLite). Do not treat the header as proof of a rollback. Supabase runs PostgREST with `PGRST_DB_TX_END=commit` by default, which ignores the preference. |
| `returns()`       | ⚫      | ⚫        | TypeScript-only, no runtime effect                    |
| `overrideTypes()` | ⚫      | ⚫        | TypeScript-only, no runtime effect                    |

### Summary: Database API

| Category        | SQLite                  | Postgres                |
|-----------------|-------------------------|-------------------------|
| Core CRUD (6)   | ✅ 6  ⚠️ 0  ❌ 0          | ✅ 6  ⚠️ 0  ❌ 0          |
| Comparison (10) | ✅ 10 ⚠️ 0  ❌ 0          | ✅ 10 ⚠️ 0  ❌ 0          |
| Pattern (6)     | ✅ 6  ⚠️ 0  ❌ 0          | ✅ 6  ⚠️ 0  ❌ 0          |
| Array/JSON (3)  | ✅ 0  ⚠️ 3  ❌ 0          | ✅ 3  ⚠️ 0  ❌ 0          |
| Full-Text (4)   | ✅ 0  ⚠️ 4  ❌ 0          | ✅ 4  ⚠️ 0  ❌ 0          |
| Advanced (4)    | ✅ 4  ⚠️ 0  ❌ 0          | ✅ 4  ⚠️ 0  ❌ 0          |
| Regex (2)       | ✅ 0  ⚠️ 2  ❌ 0          | ✅ 2  ⚠️ 0  ❌ 0          |
| Range (5)       | ✅ 0  ⚠️ 0  ❌ 5          | ✅ 5  ⚠️ 0  ❌ 0          |
| Quantified (12) | ✅ 0  ⚠️ 0  ❌ 12         | ✅ 12 ⚠️ 0  ❌ 0          |
| Transforms (5)  | ✅ 5  ⚠️ 0  ❌ 0          | ✅ 5  ⚠️ 0  ❌ 0          |
| Embedding (5)   | ✅ 5  ⚠️ 0  ❌ 0          | ✅ 5  ⚠️ 0  ❌ 0          |
| Response (7)    | ✅ 5  ⚠️ 1  ❌ 1          | ✅ 5  ⚠️ 1  ❌ 1          |
| Control (5)     | ✅ 0  ⚠️ 1  ❌ 2  ⚫ 2     | ✅ 2  ⚠️ 0  ❌ 1  ⚫ 2     |
| **Total (74)**  | **✅ 41 ⚠️ 11 ❌ 20 ⚫ 2** | **✅ 69 ⚠️ 1  ❌ 2  ⚫ 2** |

> Counting effective availability (✅ + ⚠️ + ⚫): **54/74 on SQLite**, **72/74 on Postgres** (`geojson()` and `rollback()` are the only gaps on Postgres). The 2 ⚫ methods (`returns`, `overrideTypes`) are TypeScript-only and need no backend.

### PostgREST spec: SQLite skip breakdown

The 25 cases skipped on SQLite (out of 1,702) cluster into a small set of upstream Postgres features that have no SQLite analogue, would require generic product work, or remain tracked REST-spec deltas. Generated from the **actual skipped cases by code** section in `cd app && bun run test:spec:status`.

| Category | Skipped | Why                                                                                  |
|----------|--------:|--------------------------------------------------------------------------------------|
| `lite_anon_bearer_fallback`         |  4 | Lite-specific JWT fallback handling                                                  |
| `computed_column`                   |  4 | PostgREST computed columns require PG function metadata                              |
| `custom_media_handlers`             | 10 | Fixture raw-media handlers require generic custom media metadata/config             |
| `pg_role_set`                       |  2 | `SET LOCAL role` / JWT-driven role switching                                         |
| `private_schema_visibility`         |  2 | Private-schema junction visibility must not be emulated via `private_*` names       |
| `collation_locale`                  |  1 | Locale-sensitive ordering                                                            |
| `computed_relations`                |  1 | PG computed relationship overrides                                                   |
| `mutation_embed_two_query_limit`    |  1 | Embedded mutation w/ two-query plan                                                  |

Run `bun run test:spec:analyze` (or `:sqlite-postgres`, `:pglite`, `:postgres`) to regenerate per backend.

---

## Auth API (GoTrue-compatible)

Backend implementation in `app/src/auth/`. GoTrue-compatible HTTP endpoints at `/auth/v1/*`.

Auth behaves identically across database backends, with one caveat: on Cloudflare D1, multi-statement Auth transaction spans (OAuth callback/token writes, email-change and other OTP verification) run best-effort without a wrapping transaction — D1 has no callback transaction API, so errors propagate but prior writes persist. Single-statement atomic guards (conditional `UPDATE`/`DELETE` with rowcount checks) still prevent auth-code/state/token reuse on D1. All other backends, including Durable Objects, are fully transactional.

### ✅ Implemented

| Method                 | Endpoint                               | Notes                                                                 |
|------------------------|----------------------------------------|-----------------------------------------------------------------------|
| `signUp()`             | `POST /signup`                         | Email/password, optional metadata, email confirmation; repeated unconfirmed signup honors `auth.email.max_frequency` and rotates the confirmation OTP after expiry. If confirmations are disabled later, retrying implicitly confirms the existing account |
| `signInAnonymously()` | `POST /signup` | Opt-in guest session and email/password conversion with the same user ID; [controlled deployment and backend limits](../../docs/anonymous-onboarding.md) |
| `signInWithPassword()` | `POST /token?grant_type=password`      | JWT + refresh token                                                   |
| `signInWithOtp()`      | `POST /otp`                            | Magic link / OTP via email                                            |
| `verifyOtp()`          | `POST /verify`, `GET /verify`          | signup, magiclink, recovery, email_change, reauthentication. Numeric code + `token_hash` both verify against the DB (durable on Workers); `otp_expiry`/`otp_length` honored. `GET /verify` 303-redirects to `redirect_to` (allow-list checked) |
| `refreshSession()`     | `POST /token?grant_type=refresh_token` | Token rotation, immediate reuse compatibility, session expiry checks  |
| `signOut()`            | `POST /logout`                         | Scopes: local, global, others                                         |
| `getUser()`            | `GET /user`                            | JWT-authenticated                                                     |
| `updateUser()`         | `PUT /user`                            | Metadata, password, email change                                      |
| `recover()`            | `POST /recover`                        | Password reset email; honors `auth.email.max_frequency` and rotates the recovery OTP after expiry |
| `resend()`             | `POST /resend`                         | Resend confirmation / email change; both email flows honor `auth.email.max_frequency` and rotate their OTPs after expiry |
| `reauthenticate()`     | `GET /reauthenticate`                  | Request reauthentication nonce                                        |
| `signInWithOAuth()`    | `GET /authorize`                       | `github` and `google` providers; authorization-code (PKCE) and implicit flows |
| `exchangeCodeForSession()` | `GET`/`POST /callback`, `POST /token?grant_type=pkce` | PKCE code exchange; automatic account linking on verified-email match; other configured providers (incl. `apple`) return "provider ... is not yet implemented" |

Supporting infrastructure:

- JWT signing/verification (HS256)
- `GET /.well-known/jwks.json` and `GET /.well-known/openid-configuration`: ⚠️ served, but the key set is empty because tokens are HS256 only. There are no asymmetric signing keys, so JWKS-based verification (for example `getClaims()` with asymmetric keys) is not available.
- Password hashing (bcrypt-compatible)
- Refresh token rotation with revocation, reuse, and parent-chain tracking
- Session management (create, validate, refresh, expire, delete)
- Configurable email signup, confirmations, and secure/insecure email change. Note: `double_confirm_changes=true` is spec-compatible (finalizes from the current-email confirmation, delivered to the current address) but does not implement GoTrue's full two-mailbox confirmation. See [LIMITATIONS.md](https://github.com/supabase/lite/blob/HEAD/LIMITATIONS.md#auth-shipped-with-caveats).
- Mailer integration (confirmation, recovery, magic link, email change, reauthentication)
- Default Supabase-styled email templates with `api.external_url`-hosted verify links that redirect to `auth.site_url`; when `api.external_url` is unset, links use `auth.site_url`. Per-type overrides use `auth.email.template.<type>.{subject,content_path}` (GoTrue `{{ .ConfirmationURL }}` etc. variables).
- Email drivers `Resend` / `AWS SES` / `Sendmail` / `SMTP` (injected via `options.drivers.email`, or auto-selected for SMTP when `[auth.email.smtp] enabled = true`); `SMTP` sends via Nodemailer and requires Node or Bun (not Workers/browser); default `ConsoleEmailDriver` is a console mail catcher — prints To/Subject + the text body (including OTP codes and verification links) to the console instead of delivering

### API Keys

Opaque `sb_publishable_*` / `sb_secret_*` keys, matching Supabase's current key format. Generated per project (never hardcoded); configured via `auth.publishable_key` / `auth.secret_key` in `config.toml` (same field names as upstream `supabase` CLI), values sourced from root `.env` (`SUPABASE_PUBLISHABLE_KEY` / `SUPABASE_SECRET_KEY`) via `env(VAR)`.

| Behavior | Status | Notes |
|----------|--------|-------|
| `sb_publishable_*` → `anon`, `sb_secret_*` → `service_role` | ✅ | Enforced on `/rest/v1` and `/auth/v1` only when keys are configured; unconfigured projects keep the old behavior (any/no `apikey` accepted) |
| Auth exemptions (`/verify`, `callback`, `authorize`, `oauth`, `sso/saml`, `.well-known`, `scim`) | ✅ | Mirrors upstream's gateway exemption list |
| Key source: `apikey` header or `?apikey=` query param | ✅ | A key in `Authorization` alone is rejected (401), matching upstream self-hosted conformance |
| Real user session JWT in `Authorization` | ✅ | Always outranks the API key |
| `/storage/v1` | ⚠️ | Transform-only, like upstream self-hosted Kong: keys map to roles when present, but a missing/invalid key never 401s at the gateway (public objects, signed URLs, S3 presigned flows stay keyless). Storage's own route auth still applies; a secret key satisfies storage's authed routes as `service_role` (including bypassing RLS-equivalent checks on SQLite) |
| Secret key + browser `User-Agent` (`Mozilla/5.0`) | ✅ | Rejected (401), mirrors the hosted gateway's browser guard |
| OpenAPI root (`GET /rest/v1/`) | ✅ | Requires the secret key: publishable → 403, secret → 200, mirroring upstream's admin-only ACL on that route (LITE-35) |
| Local admin mode (`options.server.admin`) | ✅ | Local-dev only. A request with **no** credential (no `apikey` header/query, no `Authorization`) on `/rest/v1` or `/storage/v1` is served as `service_role`, so browser Studio can do admin work without receiving a secret key. Elevation requires same-origin (or no `Origin`), a loopback **socket peer**, and a loopback **hostname**; transport adapters pass the peer through `App.fetch(request, { peerAddress })`, which fails closed when unavailable. `/auth/v1` is never elevated. `lite dev`/`lite start` bind `127.0.0.1` and default admin on; `--host [host]` exposes/selects an address and defaults it off unless `--admin` is explicit. Exposed Vite hosts likewise require `supalite({ admin: true })`; preview and embedders default off. Credentialed requests are never elevated (LITE-309, LITE-332) |
| Secrets redacted from `/_system/config` / `/_system/info` | ✅ | `auth.secret_key` and `auth.jwt_secret` are masked in both responses |
| Legacy JWT-as-apikey (`ANON_KEY`/`SERVICE_ROLE_KEY` HS256) | ❌ | Not supported |
| `options.server.apiKeys: false` | ✅ | Disables enforcement entirely (embedders) |
| `options.server.apiKeys.resolver` | ✅ | Custom resolver override (embedders) |

CLI: `lite init` generates whichever key(s) are missing into root `.env` (per-variable — an existing key is never overwritten) and prints them; `lite generate-keys` (re)generates the whole pair and upserts `.env`; `lite start`/`lite dev` print the resolved keys under the server URL, or a hint that none are configured. `app.getClient()` defaults to the configured publishable key (override via `{ apikey }`).

### 🔄 Planned

| Method                      | Notes                                                         |
|-----------------------------|---------------------------------------------------------------|
| `linkIdentity()`            | Manual link of an OAuth identity to an existing user (automatic linking on OAuth sign-in already works) |
| `unlinkIdentity()`          | Remove linked identity                                        |
| `admin.createUser()`        | Direct user creation (skip confirmation)                      |
| `admin.listUsers()`         | Paginated user list                                           |
| `admin.getUserById()`       | Fetch user by ID                                              |
| `admin.updateUserById()`    | Direct user update                                            |
| `admin.deleteUser()`        | User deletion                                                 |
| `admin.inviteUserByEmail()` | Send invite                                                   |
| `admin.generateLink()`      | Generate verification/reset links                             |
| `admin.signOut()`           | Admin-initiated logout                                        |
| `admin.mfa.listFactors()`   | List user MFA factors                                         |
| `admin.mfa.deleteFactor()`  | Remove MFA factor                                             |

### ⚫ Not Planned

| Method                                 | Reason                         |
|----------------------------------------|--------------------------------|
| `mfa.enroll()`                         | MFA deferred                   |
| `mfa.challenge()`                      | MFA deferred                   |
| `mfa.verify()`                         | MFA deferred                   |
| `mfa.challengeAndVerify()`             | MFA deferred                   |
| `mfa.unenroll()`                       | MFA deferred                   |
| `mfa.listFactors()`                    | MFA deferred                   |
| `mfa.getAuthenticatorAssuranceLevel()` | MFA deferred                   |
| `mfa.webauthn.*` (5 methods)           | WebAuthn deferred              |
| `signInWithSSO()`                      | SAML/SSO deferred              |
| `signInWithWeb3()`                     | Web3 deferred                  |
| `signInWithIdToken()`                  | OIDC token validation deferred |
| `oauth.getAuthorizationDetails()`      | OAuth server deferred          |
| `oauth.approveAuthorization()`         | OAuth server deferred          |
| `oauth.denyAuthorization()`            | OAuth server deferred          |
| `oauth.listGrants()`                   | OAuth server deferred          |
| `oauth.revokeGrant()`                  | OAuth server deferred          |
| `oauth.listClients()`                  | OAuth admin deferred           |
| `oauth.createClient()`                 | OAuth admin deferred           |
| `oauth.getClient()`                    | OAuth admin deferred           |
| `oauth.updateClient()`                 | OAuth admin deferred           |
| `oauth.deleteClient()`                 | OAuth admin deferred           |
| `oauth.regenerateClientSecret()`       | OAuth admin deferred           |

### ⚫ Client-Side Only (N/A)

These methods exist in `@supabase/supabase-js` but are client-side concerns, not backend endpoints:

| Method                    | Notes                                                |
|---------------------------|------------------------------------------------------|
| `onAuthStateChange()`     | Client event listener                                |
| `startAutoRefresh()`      | Client timer                                         |
| `stopAutoRefresh()`       | Client timer                                         |
| `getSession()`            | Client storage read                                  |
| `setSession()`            | Client storage write                                 |
| `initialize()`            | Client initialization                                |
| `getClaims()`             | Client JWT parsing; the server JWKS is empty (HS256 only), see Supporting infrastructure |
| `isThrowOnErrorEnabled()` | Client error mode                                    |
| `resetPasswordForEmail()` | Client-side wrapper for `recover()`                  |
| `getUserIdentities()`     | Client-side wrapper for identity data in `getUser()` |

### Summary: Auth API

| Status            | Count |
|-------------------|-------|
| ✅ Implemented     | 14    |
| 🔄 Planned        | 12    |
| ⚫ Not Planned     | 27    |
| ⚫ Client-side N/A | 10    |

### Auth spec: SQLite skip breakdown

In the upstream 0.11.0 snapshot, the 223 cases skipped against the supabase-spec Auth corpus break down by deferred feature. Generated by `cd app && bun run test:spec:auth:analyze:sqlite` (writes `.context/auth-analysis-sqlite.json`). The 24 `oauth_redirect.json` cases now pass, closing the `oauth` category; they cover github/google authorize redirects, provider config validation, PKCE parameter persistence/validation, and callback error handling. The corpus has no successful provider callback and no `/token?grant_type=pkce` exchange, so that coverage lives in the focused mock-provider tests in `app/test/auth/oauth-*.test.ts` (implicit and PKCE round-trips, account linking, concurrency).

| Category                        | Skipped | Why                                                                |
|---------------------------------|--------:|--------------------------------------------------------------------|
| `admin_api`                     | 69      | `/admin/*` endpoints (createUser, listUsers, generateLink, etc.)   |
| `mfa`                           | 44      | TOTP/WebAuthn enroll/challenge/verify                              |
| `non_runnable_spec_placeholder` | 29      | Upstream rows with `expected.status: null`; see `app/test/supabase-spec/auth/NON_RUNNABLE_PLACEHOLDERS.md` |
| `phone_sms`                     | 23      | Phone signup / SMS OTP                                             |
| `saml_sso`                      | 18      | SAML / SSO                                                         |
| `session_admin`                 | 12      | Admin session management                                           |
| `anonymous`                     | 10      | `signInAnonymously()` and conversion flows                         |
| `identity_linking`              | 9       | `linkIdentity()` / `unlinkIdentity()`                              |
| `notification_hooks`            | 9       | Send-email/SMS hooks                                               |

---

## Storage API

Backend implementation in `app/src/storage/`. HTTP endpoints at `/storage/v1/*`. Pluggable storage backends (filesystem, S3).

### ✅ Implemented

| Endpoint                               | Method   | Notes                                         |
|----------------------------------------|----------|-----------------------------------------------|
| `POST /bucket`                         | Create   | id, name, public, file_size_limit, mime types |
| `GET /bucket`                          | List     |                                               |
| `GET /bucket/:id`                      | Get      |                                               |
| `PUT /bucket/:id`                      | Update   | public, file_size_limit, allowed_mime_types   |
| `DELETE /bucket/:id`                   | Delete   | Fails if non-empty                            |
| `POST /bucket/:id/empty`               | Empty    |                                               |
| `POST /object/:bucketId/*`             | Upload   | Raw body, Storage JS `File`/`Blob` multipart, upsert via `x-upsert` |
| `PUT /object/:bucketId/*`              | Replace  | Raw body or Storage JS `File`/`Blob` multipart |
| `GET /object/:bucketId/*`              | Download | Authenticated                                 |
| `GET /object/public/:bucketId/*`       | Download | Public buckets, no auth                       |
| `HEAD /object/:bucketId/*`             | Exists   |                                               |
| `DELETE /object/:bucketId`             | Remove   | Batch delete by prefixes                      |
| `POST /object/list/:bucketId`          | List     | prefix, limit, offset, sortBy, search         |
| `POST /object/move`                    | Move     |                                               |
| `POST /object/copy`                    | Copy     |                                               |
| `GET /object/info/:bucketId/*`         | Info     | Object metadata                               |
| `POST /object/sign/:bucketId/*`        | Sign     | Create signed download URL (JWT)              |
| `POST /object/upload/sign/:bucketId/*` | Sign     | Create signed upload URL                      |
| `GET /object/sign/:bucketId/*`         | Download | Via signed URL token                          |
| `PUT /object/upload/sign/:bucketId/*`  | Upload   | Raw body or Storage JS `File`/`Blob` multipart |
| `GET /status`                          | Health   | No authentication required                    |

Storage metadata operations use the same verified JWT claims and RLS execution path as the Data API on SQLite, PGlite, and PostgreSQL. The `storage` schema is protected and omitted from the default PostgREST `api.schemas` list; `/storage/v1` remains the supported client surface, while explicitly adding `storage` enables direct metadata endpoints. On SQLite, the system schema declaration keeps `storage.buckets` and `storage.objects` RLS-enforced even when supplied runtime metadata omits them: no policies deny access and `service_role` still bypasses. Missing credentials run as `anon`; protected operations return a Storage-shaped 401 for invalid or expired bearer JWTs, while object `GET`, `HEAD`, and info tolerate invalid JWTs so public objects remain retrievable. Unauthenticated private retrieval returns `NoSuchBucket`, matching upstream; a verified `anon` JWT can still reach an `anon` `SELECT` policy. `service_role` bypasses RLS, and custom string roles are preserved for `TO role` policies. Uploads made with a verified JWT carrying a `sub` claim set both `owner_id` and the legacy `owner` field from that claim; `service_role` uploads remain ownerless. Public object retrieval through `GET`, `HEAD`, and info bypasses object `SELECT`; list, signing, copy, and move remain caller-scoped.

Bucket CRUD maps to matching policies on `storage.buckets`; PostgreSQL/PGlite bucket deletion runs trusted, row-locking existence and emptiness preflights plus the caller-scoped `DELETE` in one transaction. SQLite/D1 uses trusted preflights followed by one caller-scoped `DELETE`, with the bucket-object foreign key keeping that mutation race-safe. Object upload maps to `INSERT`; private download and info, list, and signing map to `SELECT`; remove maps to `DELETE`; move maps to source `SELECT` plus `UPDATE`; copy maps to source `SELECT` plus destination `INSERT`. Upsert additionally requires `SELECT` and `UPDATE`. Permission probes roll back before adapter writes, so denied mutations cannot change filesystem or S3 data. Public `GET`, `HEAD`, and info bypass `SELECT`, while signed URL redemption uses the authorization decision captured when the URL was created. The canonical `storage.foldername()`, `storage.filename()`, `storage.extension()`, `storage.operation()`, `storage.allow_only_operation()`, and `storage.allow_any_operation()` policy helpers work on every backend. On SQLite/D1, the three path helpers compare with correlated subquery columns in either operand order and support `IN (SELECT ...)`; general concatenation such as `name LIKE workspace_id || '/%'` remains unsupported in translated policies. `storage.operation()` preserves the complete upstream route identifier and supports comparison, pattern, membership, and null predicates with SQL null semantics.

### Storage Adapters

| Adapter            | Status | Notes                                      |
|--------------------|--------|--------------------------------------------|
| Filesystem         | ✅      | Local file storage                         |
| S3 / S3-compatible | ✅      | MinIO, AWS S3, Cloudflare R2 via aws4fetch |
| Cloudflare R2      | ✅      | Via S3 adapter                             |

### Transformation Adapters

| Adapter    | Status | Notes                       |
|------------|--------|-----------------------------|
| Noop       | ✅      | Passthrough (no transforms) |
| Sharp      | ✅      | Resize, format conversion   |
| Cloudflare | ✅      | URL-based image transforms  |

### 🔄 Not Yet Implemented

| Feature                        | Notes                                                      |
|--------------------------------|------------------------------------------------------------|
| Bucket list query params       | `?search=`, `?limit=`, `?offset=` on `GET /bucket`         |
| S3-compatible protocol         | `PUT/GET/DELETE` via S3 API paths (`/s3/`)                 |
| TUS resumable uploads          | `POST/PATCH/HEAD` on `/upload/resumable`                   |
| Webhooks                       | ObjectCreated/ObjectRemoved events                         |

### Summary: Storage API

| Status              | Count                        |
|---------------------|------------------------------|
| ✅ Endpoints         | 20 supabase-js + health      |
| ✅ Adapters          | 3 storage + 3 transformation |
| 🔄 Missing features | 4                            |

### Spec Test Results

Tests run via supabase-spec JSON test cases against Postgres (pgserve). Run: `cd app && bun run test:phenotype:storage`

| Category         | Pass | Fail | Notes                                       |
|------------------|------|------|---------------------------------------------|
| bucket_crud      | 38   | 0    | Full current category                       |
| object_upload    | 20   | 2    | Residual size-limit fixture and auth-envelope shape |
| access_control   | 70   | 7    | Core authorization passes; residual fixture body bytes and a legacy null-owner assertion |
| object_read      | --   | 28   | Cascade from setup/access issues            |
| object_list      | --   | 26   | Cascade from setup/access issues            |
| signed_urls      | --   | 24   | Cascade from setup/access issues            |
| errors           | 44   | 10   | Includes unrelated TUS, signed-URL shape, validation, and one legacy missing-auth validation shape; 4 skipped TUS steps |
| object_move_copy | --   | 21   | Cascade from setup/access issues            |
| object_naming    | --   | 15   | Cascade from setup/access issues            |
| user_metadata    | --   | 10   | Cascade from setup/access issues            |
| file_types       | --   | 8    | Cascade from setup/access issues            |
| health           | 6    | 0    | Full current category                       |
| object_delete    | --   | 3    | Cascade from setup/access issues            |

> Counts reflect the current vendored phenotype files, whose `access_control` category contains 77 setup/action assertions rather than the older 48-case snapshot. Remaining failures are tracked by their actual response-shape, fixture, or unrelated feature root cause; `storage_auth_policy` is no longer a skip category.
>
> `bun run test:spec:storage` completes with zero failures on PostgreSQL, PGlite, SQLite, and SQLite-Postgres. Its default report lists seven vendored expectation conflicts separately: five fixture-body byte mismatches, one legacy missing-auth validation shape, and one legacy null-owner assertion. `SKIP=0` retains the raw phenotype counts above.

---

## CLI

Backend implementation in `app/src/cli/`. Aligned to upstream `supabase` CLI command shape (v2.98.2). Reference: [`internal/docs/cli/`](https://github.com/supabase/lite/tree/HEAD/internal/docs/cli/). Lite-only commands carry a `[lite]` tag in `--help` output.

Help groups match upstream: **Local Development** (commands you run from a project) and **Management APIs** (commands that manage remote resources).

Default command output is pipe-friendly: no global banner, and config/database-location diagnostics are hidden unless `--verbose` is passed.

### Top-Level

| Command   | Status | Notes                                                              |
|-----------|--------|--------------------------------------------------------------------|
| `init`    | ✅      | Scaffolds API, migration/seed paths, and auth defaults; generates any missing publishable/secret API key(s) into root `.env` (per-variable, never overwrites an existing one); flags differ upstream |
| `start`   | ✅      | In-process; prints resolved API keys under the server URL; no Docker stack flags (`-x`, `--ignore-health-check`). Never migrates; the entry point for the migrations workflow. On `sqlite-postgres` it restores/recalculates RLS metadata first and refuses to boot if it cannot (see [RLS](#row-level-security-rls)) |
| `generate-keys` | ✅ | `[lite]`: (re)generates the publishable/secret API key pair and upserts root `.env` |
| `status`  | 🧪      | `[experimental]` `[lite]`: shows linked project metadata          |
| `login`   | 🧪      | `[experimental]` Email/password against supalite cloud             |
| `logout`  | 🧪      | `[experimental]` Parity                                            |
| `link`    | 🧪      | `[experimental]` Parity at verb; no `--password`/`--skip-pooler`   |
| `unlink`  | 🧪      | `[experimental]` Parity                                            |
| `dev`     | ✅      | `[lite]`: schema-watching dev server; emits experimental warning  |
| `repl`    | ✅      | `[lite]`: Node-only interactive REPL                              |
| `debug`   | ✅      | `[lite]`: runtime info dump                                       |
| `signup`  | 🧪      | `[experimental]` `[lite]`: register supalite cloud account        |
| `whoami`  | 🧪      | `[experimental]` `[lite]`: current authenticated user             |
| `upgrade` | ✅      | `[lite]`: migrate supalite project to hosted/local Supabase       |
| `bootstrap` | ⚫    | Not planned (starter-template scaffolding belongs to upstream CLI) |
| `stop`    | 🔄     | Not registered yet                                                 |
| `services` | 🚫    | Not applicable; no Docker stack                                   |
| `seed buckets` | 🔄 | Depends on storage support                                         |
| `test db` / `test new` | 🚫 | Not applicable on SQLite (no pgTAP)                            |

### `db` group

| Command       | Status | Notes                                                                |
|---------------|--------|----------------------------------------------------------------------|
| `db diff`     | ✅      | `--local` semantics; `-f` emits pg-DDL migrations from declarative schemas |
| `db translate`| ✅      | `[lite]`: translates Postgres SQL to the project's backend dialect (arg or stdin) |
| `db query`    | ✅      | Renamed from top-level `exec`; supports `--remote`, `--config`, and stdin |
| `db schema`   | ✅      | `[lite]`: moved from top-level; `--diff` and `--sql` modes          |
| `db push`     | 🧪     | `[experimental]` Pushes pending Postgres migration files to the linked Supalite cloud project; no seed/roles flags |
| `db reset`    | ✅      | Replays migrations and seed. `sqlite-postgres` translates qualified seed targets and supported Postgres casts. Bare `sqlite` runs native SQLite seed SQL. Does not apply declarative schema_paths. Clears `supabase/.temp` caches and rewrites the runtime metadata cache from replayed migrations. Reset is destructive, so migration state becomes authoritative, including RLS. Declarative schemas require a migration from `lite db diff -f <name>`. |
| `db pull`, `db dump`, `db lint`, `db advisors` | 🔄 | Not registered                       |
| `db start`    | 🚫     | Not applicable; in-process, no separate DB start                    |

### `migration` group

| Command             | Status | Notes                                                  |
|---------------------|--------|--------------------------------------------------------|
| `migration new`     | ✅      | Create an empty migration file in `supabase/migrations/` |
| `migration up`      | ✅      | Apply pending migrations; `--dry-run` lists without applying. On `sqlite-postgres`, refreshes complete runtime metadata from recorded history even on a no-op run. |
| `migration list`    | ✅      | Show applied vs pending migrations                    |
| `migration down`, `migration repair`, `migration squash`, `migration fetch` | 🔄 | Not registered |

### `cloud` group `[lite]` `[experimental]`

| Command         | Status | Notes                                                                       |
|-----------------|--------|-----------------------------------------------------------------------------|
| `cloud deploy`  | 🧪      | Pushes pending migrations, then config, to linked Supalite cloud; no declarative schema or seed push |
| `cloud diff`    | 🧪      | Lists pending cloud migrations; `--sql` prints their raw SQL                |

### `config` group

| Command       | Status | Notes |
|---------------|--------|-------|
| `config push` | 🧪     | `[experimental]` Pushes config only through Supalite's combined project-config endpoint |

### `projects` group `[experimental]`

| Command           | Status | Notes                                                  |
|-------------------|--------|--------------------------------------------------------|
| `projects list`   | 🧪      | List supalite cloud projects                           |
| `projects create` | 🧪      | Create project; flags differ (no `--org-id`/`--region`) |
| `projects api-keys` | 🔄   | Not registered                                         |
| `projects delete`   | 🔄   | Not registered                                         |

### Management API groups

All management-API groups are deferred per LITE-177. None registered as placeholders to keep `--help` output clean. Re-evaluate per group as supalite cloud exposes matching endpoints.

| Group | Status | Reason |
|-------|--------|--------|
| `orgs`, `secrets`, `branches`, `domains`, `network-bans`, `network-restrictions`, `ssl-enforcement`, `vanity-subdomains`, `encryption`, `sso` | 🔄 | Depends on supalite cloud surface area |
| `gen`, `functions`, `inspect`, `storage`, `telemetry` | 🔄 | Depends on respective service support |
| `backups`, `snippets`, `postgres-config`, `services` | 🚫 | Not applicable (SQLite / no dashboard / no Docker / no GUC) |

### Environment & `.env`

Mirrors upstream behavior documented in [`internal/docs/cli/environment.md`](https://github.com/supabase/lite/blob/HEAD/internal/docs/cli/environment.md). Loader runs in `ProjectLocalApi.readConfig` before TOML parsing; `env(VAR)` substitution runs after parsing, before schema validation.

| Behavior                                                         | Status | Notes                                                            |
|------------------------------------------------------------------|--------|------------------------------------------------------------------|
| Dotenv directory walk (config dir → CWD)                         | ✅      | First-write-wins; deeper dir wins over parent                    |
| `SUPABASE_ENV` flavor (default `development`; `test` skips `.env.local`) | ✅ | Filename order: `.env.<flavor>.local` → `.env.local` → `.env.<flavor>` → `.env` |
| Process env never overwritten by files                           | ✅      | Shell/CI wins over every file                                    |
| `env(VAR_NAME)` substitution in config                           | ✅      | Anchored match; missing → empty string                           |
| `secrets set --env-file`                                         | ⚫      | Depends on `secrets` group (deferred)                            |
| `functions serve --env-file` / `supabase/functions/.env`         | ⚫      | Depends on `functions` group (deferred)                          |

### Summary: CLI

| Status                      | Count |
|-----------------------------|-------|
| ✅ Implemented               | 28    |
| 🔄 Planned (not registered) | 13    |
| 🚫 Not Applicable           | 7     |

> Counts include only commands tracked in this file (excludes management-API groups represented as a single row each).

---

## Other Services

| Service            | Status | Notes                                                                                                 |
|--------------------|--------|-------------------------------------------------------------------------------------------------------|
| **Storage**        | 🔄     | Config schema defined (`app/src/config/storage.ts`). Buckets, file size limits, image transformation. |
| **Drivers**        | ✅      | Minimal email, SMS, and cache driver interfaces. Configured via `options.drivers`, exposed at `app.drivers`. |
| **Realtime**       | 🔄     | Config schema defined (`app/src/config/realtime.ts`).                                                 |
| **Edge Functions** | 🔄     | Config schema defined (`app/src/config/functions.ts`). Per-function JWT verification, entrypoints.    |
| **Vite plugin**    | ✅      | `@supabase/lite/vite` subpath export mounts supalite as middleware in a Vite dev server (`app/src/vite/`). See [Vite plugin scope](#vite-plugin-scope). |

### Vite plugin scope

- **Active during `vite` / `vite dev` and `vite preview`.** `vite dev` watches `schemas/*.sql` for hot-reload; `vite preview` mounts the API and runs boot migrations but does **not** watch schemas (it simulates production). `vite build` and any standalone production server do **not** mount the API — use a real backend (`lite start`, hosted Supabase, or equivalent) there.
- **Same-process by design.** The plugin mounts `/auth/v1`, `/rest/v1`, and `/_system` on the Vite dev server. `/storage/v1` is not mounted by default — add it to `prefixes` if you need it. Run only one backend per project: never combine the plugin with `lite dev` or `lite start`, and never run both CLI backends together.
- **Admin mode on for loopback dev, never in preview.** `vite`/`vite dev` default to `admin: true` only when Vite binds a loopback host. `vite --host` and other non-loopback hosts default it off and require `supalite({ admin: true })` to opt in; `configurePreviewServer` always forces it off. See [API Keys](#api-keys).
- **Env-var injection.** The plugin's `config()` hook injects `VITE_SUPABASE_URL` (the current origin) and a dev `VITE_SUPABASE_ANON_KEY`, so `createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)` works with no `.env`. A user-provided `.env` overrides either value.

---

## Upgrade to Supabase

See [UPGRADE.md](https://github.com/supabase/lite/blob/HEAD/UPGRADE.md) for the upgrade command contract, target behavior, known gaps, and test strategy.

| Capability                 | Status | Notes                                                                                           |
|----------------------------|--------|-------------------------------------------------------------------------------------------------|
| Self-service upgrade       | ⚠️     | User-mode CLI flow creates a hosted Supabase project by default, or upgrades the current directory into a local Supabase CLI workdir with `--target local`; replays authoritative Postgres SQL in recorded history order followed by pending-file order after provisioning Auth in rehearsal, migrates auth/data, syncs hosted config, and preserves hosted sessions via signing-key import with weak-secret assessment. Migration-only projects do not need applied-file mirrors; declarative-only projects must generate a pending migration first. Native bare-SQLite migrations cannot be replayed on Supabase. Disposable local Supabase rehearsals are available as opt-in Docker integration coverage. |
| Auth schema migration      | ⚠️     | Core `auth.*` divergences are documented; auth export has explicit local/Supabase generated-column rules. |
| User table data migration  | ✅     | Emits FK-ordered INSERTs, deserializes SQLite shim-backed fields before Postgres literal generation, and resets serial/bigserial sequences after explicit migrated IDs. |
| SQLite shim health audit   | ✅     | `lite upgrade --dry-run` scans shim-backed fields with affected counts, sample raw values, and sample row IDs; `--json` switches the audit output to structured JSON. |
| Storage/realtime migration | 🔄     | Upgrade command warns; migration support is deferred until those services land.                  |

---

## Testing

These test counts and `app/` / `packages/` commands are preserved upstream 0.11.0 results, not fresh results for this branch. See the [repository README](../../README.md) for this checkout's checks.

| Test Suite | Passing           | Skipped     | Failed          | Assertions        | Files          |
|------------|-------------------|-------------|-----------------|-------------------|----------------|
| App        | **3,385 passing** | 486 skipped | 0 failed        | 20,741 assertions | 228 test files |
| App (vitest: node + browser + D1 + DO + KV) | **65 passing** | 0 skipped | 0 failed | — | 5 test files |
| Repo       | **4,413 passing** | 540 skipped | 0 failed | 34,523 assertions | 233 test files |

Latest `cd app && bun test`, `cd app && bun run vitest`, and root `bun test --recursive` completed with zero failures.

PostgREST spec status (`cd app && bun run test:spec:status`):

| Backend | Total | Passing | Pass % | Skipped | Skip % | Failed |
|---------|------:|--------:|-------:|--------:|-------:|-------:|
| Postgres | 2,460 | **2,339** | 95.1% | 121 | 4.9% | 0 |
| PGlite | 2,460 | **2,347** | 95.4% | 113 | 4.6% | 0 |
| SQLite | 1,702 | **1,677** | 98.5% | 25 | 1.5% | 0 |
| SQLite-Postgres | 1,702 | **1,677** | 98.5% | 25 | 1.5% | 0 |

Auth supabase-spec status (`cd app && bun run test:spec:auth`):

| Backend | Total | Passing | Pass % | Skipped | Skip % | Failed |
|---------|------:|--------:|-------:|--------:|-------:|-------:|
| Postgres | 488 | **265** | 54.3% | 223 | 45.7% | 0 |
| PGlite | 488 | **265** | 54.3% | 223 | 45.7% | 0 |
| SQLite | 488 | **265** | 54.3% | 223 | 45.7% | 0 |
| SQLite-Postgres | 488 | **265** | 54.3% | 223 | 45.7% | 0 |

### Methodology

Feature status tables above are validated by ported test suites run against both the **vendor implementation** and **this project**, ensuring claimed compatibility is real.

**PostgREST (Database API):** 501 test cases extracted from the upstream [PostgREST Haskell test suite](https://github.com/PostgREST/postgrest) into JSON specs (`packages/postgrest-test-suite/`). Verified by running against real PostgREST and PostgreSQL via Docker. All 501 pass against vendor. The same suite runs against lite's implementation on four backends (`postgres`, `pglite`, `sqlite`, `sqlite-postgres`), with skips documented per dialect for known incompatibilities (JSON operators, range types, full-text search locale differences). Run `bun run test:spec:status` in `app/` to regenerate the baseline table. `sqlite-postgres` exercises the deparser path end users hit with `driver: "sqlite-postgres"`.

**Auth (GoTrue):** 51 test cases across 12 spec files (`packages/gotrue-test-suite/`) covering the 11 pre-OAuth implemented endpoints; the OAuth `/authorize` and `/callback` endpoints are covered by the supabase-spec cases below, and the PKCE token exchange (`/token?grant_type=pkce`) is covered solely by the focused integration tests in `app/test/auth/oauth-*.test.ts`. Verified by running against the vendor GoTrue Docker image (v2.186.0) with PostgreSQL + Inbucket (email trap). The same suite runs against lite's auth implementation on both SQLite and PostgreSQL. The upstream `supabase-spec` Auth JSON cases also run against lite's SQLite auth implementation under `app/test/supabase-spec/auth/`; the baseline now unskips passing email/password/refresh/user, error-shape, health/settings/JWKS, response-shape, email side-effect, logout/reauthenticate DB-change, magic-link, email OTP/verify token, refresh rotation, session lifecycle, short JWT-expiry, non-phone config-variant, recovery password-change, duplicate-signup/form-token response-shape, and OAuth redirect (github/google authorize, callback error handling, PKCE challenge persistence/validation) cases. The upstream corpus contains no `/token?grant_type=pkce` case, so PKCE code redemption is covered only by `app/test/auth/oauth-flow.test.ts` (authorize -> callback -> token round-trips, verifier mismatch, replay) and `app/test/auth/oauth-concurrency.test.ts` (concurrent redemption races). Remaining Auth skips are hard-scoped product areas (admin API, MFA, phone/SMS, SAML/SSO, anonymous, manual identity linking) or non-runnable upstream placeholder rows documented in `app/test/supabase-spec/auth/NON_RUNNABLE_PLACEHOLDERS.md`; there are no current addressable Auth skips. Run `bun run test:spec:auth:analyze` in `app/` to execute all Auth JSON cases and group current mismatch signatures.

Both test suites are reusable packages exposing `definePostgrestTests()` and `defineAuthTests()`. They accept either a URL (for vendor) or a fetch handler (for direct in-process testing).

### Running Tests

```bash
bun test                    # all app tests (bun:sqlite connection suite runs here)
bun test:coverage           # all app tests + coverage report
bun test:postgrest          # PostgREST suite against Postgres
bun test:gotrue             # GoTrue suite against vendor Docker
bun run test:spec:auth      # supabase-spec Auth JSON suite against SQLite
bun run test:spec:auth:analyze # grouped Auth supabase-spec mismatch report
bun run vitest              # node:sqlite + D1 + DO connection suites
```

**Connection contract suite** (`app/test/db/connection-suite/`): one
`suite.ts` defines the contract every `SqliteConnection` must honour
(bind normalization, CRUD, RLS-guarded select, transactions,
introspection), and runs against each backend via thin per-runner
entries. `bun:sqlite` uses `bun:test` (runs as part of `bun test`);
`node:sqlite`, `D1`, and `DurableObject` use `vitest`, with D1/DO routed
through `@cloudflare/vitest-pool-workers`. See the suite README for scope
differences per runtime.

Full GoTrue test suite:

```bash
cd packages/gotrue-test-suite && bun test
```

Full PostgREST test suite:

```bash
cd packages/postgrest-test-suite && bun run test:postgres
cd packages/postgrest-test-suite && bun run test:pgserve
```

---

## Documentation

Detailed API research docs are in `internal/docs/sdk/`:

- [`internal/docs/sdk/database/`](https://github.com/supabase/lite/blob/HEAD/internal/docs/sdk/database/README.md): 66 database methods with SQLite compatibility analysis
- [`internal/docs/sdk/auth/`](https://github.com/supabase/lite/blob/HEAD/internal/docs/sdk/auth/README.md): 68 auth methods with implementation complexity analysis
