# SQL application compatibility

The SQLite backend supports named `LANGUAGE sql` RPC arguments and defaults, scalar results and `SETOF` application tables, execute grants for API roles, JWT claim functions, JSON builders/recordsets, transactional writes, and singular-result rollback. Table-reading RPCs require explicit `SECURITY DEFINER`, `SET search_path = ''`, and ownership predicates because SQLite has no engine RLS. Unsupported constructs return an error; PostgreSQL composite/array RPC types, arbitrary PL/pgSQL, and result filtering of RPCs are outside this surface.

The ordered migration path preserves partial indexes and supports the literal guards, `NEW` assignments, static DML, and `RETURN NEW/OLD` trigger bodies used by Poolometer. SQLite implements `NEW` assignments through row correction after the write; this is not a general implementation of PostgreSQL trigger ordering. Declarative schema reconstruction does not currently preserve the same trigger surface.

Poolometer uses one migration for twelve tables, composite parent/owner foreign keys, immutable identity and ownership, atomic/idempotent pass check-in, and set-based task reconciliation. The same official SDK contract passes on Node SQLite Supalite and the official full native Supabase stack. A populated graduation preserves UUIDs and password sign-in, all fixture rows and counters, and avatar bytes by SHA-256. Browser verification runs in a VirtualBuddy VM.

Graduation quotes reconstructed identifiers, reports actual table counts, neutralizes migration-owned application trigger bodies only during replay, and restores their exact definitions afterward. Constraint and platform triggers remain active. Empty migration-seeded bucket declarations must match the source snapshot exactly; their removal uses the Storage API before replaying original bucket metadata. Unrelated or conflicting target data stops the transfer.

Each native destination owns `lite-` plus the first 24 hex characters of SHA-256 of its absolute directory path. Start/status/stop pass this explicit stack name. The default stack is never selected by the native adapter.

Focused coverage includes both SQLite drivers for RPC and CORS, trigger-definition restoration, reserved-name reconstruction, exact bucket seed matching, native stack isolation, Storage replay, truthful readiness counts, and dry-run success/failure channels. Hosted Supabase deployment has not been qualified by this local integration.
