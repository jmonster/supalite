---
name: supalite
description: Use when building or debugging an app that uses `@supabase/lite` (a Supabase-compatible local / browser / edge SQLite runtime). Triggers on phrases like "supabase locally", "local supabase", "supabase lite", "supalite", "offline supabase", "browser sqlite supabase", "@supabase/lite", or when the project's package.json depends on `@supabase/lite`.
---

# supalite

`@supabase/lite` (a.k.a. supalite) is a lightweight TypeScript implementation of the Supabase REST + Auth APIs over SQLite (with PGlite / Postgres as alternative drivers). `@supabase/supabase-js` works against it unchanged.

The package is pre-1.0 and changes fast. **Do not rely on this skill's specifics — fetch the installed package's docs first.** Authoritative content (limitations, anti-patterns, patterns, full status) ships inside the package and updates with every `npm install`. The full product documentation ships too, at `node_modules/@supabase/lite/docs/` (MDX, matching the installed version), and is published at https://docs.lite.dev.

## Cold start (do this before writing code)

1. `bun add @supabase/lite @supabase/supabase-js` (or `npm install` — honor pinned versions like `pkg.pr.new/...` exactly if the user provided one).
2. `cat node_modules/@supabase/lite/LIMITATIONS.md` — agent-facing cheat sheet of what's not supported and what to avoid (anti-patterns). One-line bullets, links into STATUS.md for detail. Read this **first**.
3. `cat node_modules/@supabase/lite/PATTERNS.md` — canonical recipes (per-user RLS, embedded filters, custom server logic, Vite cold start, triggers).
4. `cat node_modules/@supabase/lite/README.md` — install, quick start, CLI, Vite plugin, project layout.
5. `cat node_modules/@supabase/lite/docs/llms.txt` — index of the full product docs (database, auth, storage, integrations, CLI). Read the page for the area you're touching, e.g. `docs/database/rls.mdx`, `docs/integrations/vite.mdx`.
6. `cat node_modules/@supabase/lite/STATUS.md` only when you need detail behind a LIMITATIONS bullet, or when planning a feature that touches RLS / embedding / auth.
7. Pick the right runtime path (see decision rule below) before writing the dev server / client.

## Decision rule

| Scenario | Use | Notes |
|---|---|---|
| Vite project | `@supabase/lite/vite` plugin (same-process) | No separate CLI. Pass `window.location.origin` + the project's `sb_publishable_*` key (or any string if no API keys are configured) to `createClient`. |
| Non-Vite app, want auto schema-reload | `lite dev` (separate process) | Watches `schemas/*.sql`. |
| Non-Vite app, manual control / CI / prod-like | `lite start` (separate process) | No watch, no auto-migrate. |

**Never** run more than one backend for a project: do not combine `lite dev`, `lite start`, or the Vite plugin against the same SQLite file.

## Patterns, limitations, anti-patterns

The skill deliberately does not duplicate these. They live in the installed package and update on every `npm install`:

- **What's limited / what to avoid** → `node_modules/@supabase/lite/LIMITATIONS.md`
- **How to do common things** → `node_modules/@supabase/lite/PATTERNS.md`
- **Per-area product docs** → `node_modules/@supabase/lite/docs/` (index: `llms.txt`), or https://docs.lite.dev

Re-read both when starting work on a supalite project, or when the user reports an unexpected behavior — they may already be documented.
