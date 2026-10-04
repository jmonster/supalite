# Binary values during upgrades

The tracked SQL formatter recognizes ArrayBuffer and typed-array/DataView values before its generic object fallback and emits PostgreSQL `decode(hex, 'hex')`. Views preserve their byte offsets and lengths, including empty values. Typed JSON handling remains ahead of binary handling, and bytea arrays recursively preserve binary elements and NULLs.

The package-local implementation is `upstream/lite-0.11.0/dist/cli/upgrade-binary-value.js`. Run `bun install --frozen-lockfile`, then `bun test --bail --timeout 60000 test/upgrade-binary.test.mjs` to exercise the production formatter and exporter directly. Tests replay Node SQLite, libSQL and PGlite exports into PGlite, verify exact bytes, JSON, nullable/empty values, foreign keys, computed columns, generated-ID continuation, and unchanged source data. A fixed-input formatter fixture records the published behavior for nonbinary values; it is data, not a copy of the formatter.

These are local SQL replay tests, not hosted or Docker-backed Supabase provisioning tests.
