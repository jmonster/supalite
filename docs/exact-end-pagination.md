# Exact-end pagination

A page beginning exactly at the number of matching rows should be an empty
successful page. Published Lite 0.11.0 instead returns `416 / PGRST103` when a
count is requested. For six rows, this SDK request loses both the data and count:

```js
const result = await supabase.from('page_docs')
  .select('id', { count: 'exact' }).order('id').range(6, 7)
```

The candidate returns `status: 206`, `data: []`, `count: 6`, and `error: null`.
With `head: true`, the same successful response has `data: null` and `count: 6`.
Its HTTP `Content-Range` is `*/6`. The offset refers to the filtered result;
filters reducing the match count to three also permit an empty page at offset 3.

## Source and scope

PostgREST's versioned [v12.2.12 range-status implementation](https://github.com/PostgREST/postgrest/blob/v12.2.12/src/PostgREST/RangeQuery.hs#L89-L113)
and [v13.0.7 implementation](https://github.com/PostgREST/postgrest/blob/v13.0.7/src/PostgREST/RangeQuery.hs#L89-L113)
reject an offset only when it exceeds the reported total. When that total is
positive, an empty end page is partial content. The
[v13.0.7 response code](https://github.com/PostgREST/postgrest/blob/v13.0.7/src/PostgREST/Response.hs#L60-L85)
uses this rule for table reads; it also uses it for
[RPC responses](https://github.com/PostgREST/postgrest/blob/v13.0.7/src/PostgREST/Response.hs#L182-L205).
These expectations come from official source inspection, not a live PostgREST
comparison in this repository.

The guarded patch changes one operator in the shared empty-page response guard:
`offset >= total` becomes `offset > total`. It does not change query execution,
count calculation, request parsing, or singular validation.

- Positive total, offset equal to total, empty page: `416` becomes `206`
- Offset greater than total with a count: remains `416`
- Zero matches, offset 0: remains `200`, `Content-Range: */0`
- Zero matches, positive offset with a count: remains `416`
- Omitted count or `count=none`: empty pages remain `200`, `Content-Range: */*`
- Singular requests returning no rows: remain `406 / PGRST116`
- Zero/negative limits and invalid Range headers retain their existing behavior

SQLite `exact`, `planned`, and `estimated` counts all use the existing exact-count
fallback; tests cover each. PostgreSQL estimate accuracy is outside this patch.
GET Range headers and GET/HEAD query `limit`/`offset` are covered. Lite also
applies Range headers to HEAD, unlike
[PostgREST v13.0.7](https://github.com/PostgREST/postgrest/blob/v13.0.7/src/PostgREST/ApiRequest.hs#L208-L224),
which ignores them. This patch retains Lite's parsing and does not claim to fix
that separate difference.

## Verification

Run `npm test` on Node.js 24+. It verifies the original 77-file distribution,
prepares a separate patched copy, and runs:

- Baseline drift guards and SDK smoke tests on Node SQLite, libSQL, and PGlite
- Raw response and SDK end-page regressions on both SQLite adapters
- Filtered counts, last/full pages, beyond-end/empty sets, count modes, singular,
  CSV/null-stripped output, and limit/range validation controls
- PGlite table/view and stable SETOF RPC GET/HEAD end pages, plus POST RPC
- Unchanged volatile, scalar, and void RPC behavior

PGlite comparisons run one engine at a time. The vendored and installed baseline
files are never patched. This focused suite does not establish complete
PostgREST compatibility.
