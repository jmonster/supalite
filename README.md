# Supalite

Node SQLite upgrades stream application rows through the existing formatter into bounded target batches, without a temporary SQL export. The published `@supabase/lite` **0.11.0** distribution remains an unmodified baseline.

The pipeline completes the recorded 96 MiB text/JSON upgrades under a 128 MiB V8 old-space limit that exhausts the stock CLI. Successful-stock timing comparisons are included too: this change bounds application buffering, with no claim of a universal speedup or lower hosting cost. PGlite/native memory remains substantial. [Behavior, tradeoffs and measurements](docs/streaming-upgrade.md)

## Contents

- `upstream/lite-0.11.0/`: all 77 published files, with their original bytes and modes
- `upstream/manifest.json`: npm provenance and file checksums
- `src/upgrade/sqlite-streaming.ts`: native row iteration, counted read snapshots, cleanup and bounded batching
- `scripts/patch-streaming.mjs`: exact-hash guarded integration into a generated CLI
- `test/`: adapter parity, target batching, snapshot ownership, failure and cancellation tests
- `scripts/benchmark-streaming.mjs`: opt-in actual CLI and shared-target comparisons
- `reports/`: measured results and runtime compatibility

## Run

Requires Node.js 24 or later:

```sh
npm ci
npm test
```

Tests build the TypeScript, verify the baseline and create `.generated/streaming/`. Large benchmarks are opt-in; see the [reproduction commands](docs/streaming-upgrade.md#reproduce).

The npm artifact does not include its original upstream TypeScript. Generated files and dependencies are ignored; the vendored distribution is tracked. To verify and copy just the baseline:

```sh
npm run prepare:baseline
```

## License

The upstream Apache-2.0 license is preserved in [LICENSE](LICENSE) and [upstream/lite-0.11.0/LICENSE](upstream/lite-0.11.0/LICENSE). See [NOTICE](NOTICE) for attribution.
