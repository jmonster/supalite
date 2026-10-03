# Contributing

Keep each contribution small enough to review independently: a concrete user-visible problem, a reproducible baseline, the implementation, and evidence that it changes the intended behavior.

## Local workflow

Use Node.js 24 or newer.

```sh
npm ci
npm test
npm run demo
```

`npm test` rebuilds both the TypeScript and generated integration package. Use `npm run test:core` while iterating on the compiler; run the full suite after changing parsing, paths, request composition, or the adapter. The focused command alone does not exercise the complete request path.

For performance work, run `npm run benchmark`, record the engine versions and workload, and check returned rows/counts before interpreting timings. Keep observed measurements separate from claims about untested deployments.

## A useful change includes

1. A failing request or semantic case against the pinned baseline
2. A reference expectation, preferably executed PostgreSQL behavior for SQL compatibility work
3. A narrow source change with clear input and complexity limits
4. Positive and negative cases, including composition with existing behavior
5. A concise description of verified runtimes, untested paths, and remaining limitations

New SQL specializations should be checked against the general semantics, including mixed types, missing values, SQL NULL under `NOT`, punctuation-bearing keys, and split-element array counterexamples. Avoid a fast path that silently accepts a wider shape than its tests cover.

Keep generated output and installed dependencies out of commits. Do not edit `.generated/` or `node_modules/` as the implementation: those files are recreated. Change the original source or the explicit bridge instead.

## Baseline upgrades

An npm version bump is a new integration review. Inspect the new public artifact, verify its license and provenance, reproduce the old behavior, locate the intended parser/compiler boundaries again, and update the exact checksum and integration checks. Do not make the bridge accept arbitrary versions or broadly matching bundle text.

The [porting guide](docs/design-and-porting.md#porting-upstream) explains which pieces belong in a native upstream patch. This workspace's tests complement the upstream suite; they cannot replace missing upstream source and tests.

## Adding another contribution

Start with a focused source module, test/reproduction, and a short design note. Reuse the existing commands and fixtures when appropriate. Add a package or a general-purpose abstraction only after there is a concrete need. The [roadmap](docs/roadmap.md) records candidate work separately from implemented features.
