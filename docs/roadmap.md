# Small follow-on roadmap

This is a list of bounded contribution candidates, not a delivery commitment.

## Current contribution: SQLite JSONB containment

The implementation and local tests cover JSONB containment in both directions, focused object and shallow-filter specializations, and repeated-column conjunction preservation. Follow-on work should retain that narrow scope:

- Port the compiler and parser fix into readable upstream source when the relevant source boundaries are available
- Run the existing cases in actual D1/Workers, Bun, and browser SQLite environments before claiming those runtimes
- Extend workload evidence for larger documents, nested arrays, and selective relational prefilters; require a measured benefit and differential tests for each specialization

Unsafe-integer and arbitrary-precision numeric comparison, along with raw duplicate-key fidelity, would need separate designs. They are outside the current parity claim.

## Research candidate: evals migration-history parity

The public `supabase/evals` platform-lite [database management routes](https://github.com/supabase/evals/blob/main/packages/platform-lite/src/management-api/database.ts) explicitly keep API migration history in `project.migrations`, separate from `supabase_migrations.schema_migrations`. Their source comment explains why API and PostgreSQL-wire migration histories can disagree. This is a possible separate contribution to that project; it is not implemented here.

A useful first proposal would establish one durable history model and test both directions of visibility, explicit version handling, retries, and concurrent submissions. Start with the existing public routes and [database tests](https://github.com/supabase/evals/blob/main/packages/platform-lite/test/database.test.ts), agree the intended behavior with maintainers, then add the smallest transactional change that meets it.

This candidate is based on source review and local route/table reproductions. No end-to-end Supabase CLI migration workflow is claimed. The links target `main` and should be rechecked and pinned before implementation.
