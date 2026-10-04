// Independent semantic inputs. JSON operands remain raw text so the oracle can
// preserve precision, duplicate labels, JSON null, and whitespace faithfully.
const j = JSON.stringify;
const caseOf = (name, lhs, rhs, category = "core") => ({
  name,
  lhs: j(lhs),
  rhs: j(rhs),
  category,
});
const raw = (name, lhs, rhs, category = "fidelity") => ({
  name,
  lhs,
  rhs,
  category,
});

export const namedCases = [
  caseOf(
    "nested_object_subset",
    { profile: { plan: "pro", active: true } },
    { profile: { plan: "pro" } },
  ),
  caseOf(
    "nested_object_wrong_value",
    { profile: { plan: "free", active: true } },
    { profile: { plan: "pro" } },
  ),
  caseOf(
    "nesting_is_not_flattened",
    { profile: { plan: "pro" } },
    { plan: "pro" },
  ),
  caseOf("nested_missing_key", { profile: {} }, { profile: { plan: "pro" } }),
  caseOf(
    "key_order_irrelevant",
    { child: { a: 1, b: 2 } },
    { child: { b: 2, a: 1 } },
  ),
  caseOf("array_order_irrelevant", [1, 2, 3], [3, 1]),
  caseOf("array_duplicates_rhs", [1, 2], [1, 1]),
  caseOf("array_duplicates_both", [1, 1, 2], [2, 2, 1]),
  caseOf("array_missing_member", [1, 2], [1, 3]),
  caseOf("nested_array_subset", [[1, 2, 3], 9], [[3, 1]]),
  caseOf("nested_array_no_flattening", [[1, 2]], [1]),
  caseOf("nested_array_no_flattening_mixed", [1, 2, [1, 3]], [1, 3]),
  caseOf("nested_array_same_level", [1, 2, [1, 3]], [[3, 1]]),
  caseOf("nested_array_duplicate_member", [[1, 2]], [[1, 1]]),
  caseOf(
    "array_object_subset",
    [{ sku: "shirt", size: "M" }, { sku: "hat" }],
    [{ sku: "shirt" }],
  ),
  caseOf(
    "array_object_cannot_split_predicates",
    [{ sku: "shirt" }, { size: "M" }],
    [{ sku: "shirt", size: "M" }],
  ),
  caseOf(
    "array_object_independent_requirements",
    [{ sku: "shirt" }, { size: "M" }],
    [{ sku: "shirt" }, { size: "M" }],
  ),
  caseOf(
    "array_object_can_reuse_one_member",
    [{ sku: "shirt", size: "M" }],
    [{ sku: "shirt" }, { size: "M" }],
  ),
  caseOf(
    "array_object_extra_item",
    [{ sku: "shirt", sizes: ["M", "L"] }],
    [{ sku: "shirt", sizes: ["M"] }],
  ),
  caseOf(
    "array_object_wrong_nested_type",
    [{ sku: "shirt", sizes: ["M"] }],
    [{ sku: "shirt", sizes: "M" }],
  ),
  caseOf("root_scalar_in_array_number", [1, 2], 1),
  caseOf("root_scalar_in_array_string", ["foo", "bar"], "bar"),
  caseOf("root_scalar_in_array_boolean", [true, false], false),
  caseOf("root_scalar_in_array_null", [null, 1], null),
  caseOf("root_scalar_cannot_contain_array", "bar", ["bar"]),
  caseOf("root_object_not_member_shortcut", [{ a: 1, b: 2 }], { a: 1 }),
  caseOf("nested_scalar_in_array_forbidden", { a: [1, 2] }, { a: 1 }),
  caseOf("nested_array_scalar_reverse", { a: 1 }, { a: [1, 2] }),
  caseOf("empty_object_matches_object", { a: 1 }, {}),
  caseOf("empty_object_not_array", [1, 2], {}),
  caseOf("empty_object_not_scalar", "x", {}),
  caseOf("empty_array_matches_array", [1, 2], []),
  caseOf("empty_array_not_object", { a: 1 }, []),
  caseOf("empty_array_not_scalar", 1, []),
  caseOf("nested_empty_object", { a: { b: 1 } }, { a: {} }),
  caseOf("nested_empty_array", { a: [1] }, { a: [] }),
  caseOf("nested_empty_container_types", { a: [1] }, { a: {} }),
  caseOf("array_empty_object_member", [{ a: 1 }], [{}]),
  caseOf("array_empty_array_member", [[1]], [[]]),
  caseOf("array_empty_container_mismatch", [{ a: 1 }], [[]]),
  caseOf("json_null_value", { a: null }, { a: null }),
  caseOf("missing_differs_from_json_null", {}, { a: null }),
  caseOf("null_differs_from_string", null, "null"),
  caseOf("null_array_member", [null, 1], [null]),
  caseOf("null_object_wrong_type", { a: "null" }, { a: null }),
  caseOf("boolean_differs_from_number", true, 1),
  caseOf("false_differs_from_zero", false, 0),
  caseOf("array_boolean_differs_from_number", [true], [1]),
  caseOf("object_boolean_differs_from_number", { a: false }, { a: 0 }),
  caseOf("number_differs_from_string", 1, "1"),
  caseOf("string_case_sensitive", "A", "a"),
  caseOf("string_not_substring", { tags: ["important"] }, { tags: ["port"] }),
  caseOf("empty_key", { "": 1 }, { "": 1 }),
  caseOf("dotted_key_is_literal", { "a.b": 1 }, { "a.b": 1 }),
  caseOf("dotted_key_not_path", { a: { b: 1 } }, { "a.b": 1 }),
  caseOf("quoted_key", { 'a"b': 1 }, { 'a"b': 1 }),
  caseOf("apostrophe_key", { "O'Reilly": 1 }, { "O'Reilly": 1 }),
  caseOf("backslash_key", { "a\\b": 1 }, { "a\\b": 1 }),
  caseOf("jsonpath_looking_key", { "$[0].a": 1 }, { "$[0].a": 1 }),
  caseOf(
    "sql_looking_key_and_value",
    { "'); DROP TABLE documents; --": "' OR 1=1 --" },
    { "'); DROP TABLE documents; --": "' OR 1=1 --" },
  ),
  caseOf("numeric_looking_object_key", { 0: [1] }, { 0: [] }),
  raw(
    "prototype_key",
    '{"__proto__":{"polluted":true},"constructor":{"prototype":1}}',
    '{"__proto__":{},"constructor":{"prototype":1}}',
    "core",
  ),
  caseOf("unicode_emoji_key", { "🐘": "café" }, { "🐘": "café" }),
  raw("escaped_unicode_equal", '"\\u0061"', '"a"', "core"),
  raw("unicode_nfc_not_normalized", '"é"', '"é"', "core"),
  raw("integer_real_numeric_equality", "1.00", "1e0", "core"),
  raw("negative_zero_numeric_equality", "-0", "0", "core"),
  raw(
    "nested_number_spelling_equality",
    '{"x":1.2300,"y":[1e2]}',
    '{"x":1.23,"y":[100.0]}',
    "core",
  ),
  raw("whitespace_irrelevant", ' { "a" : [ 1, 2 ] } ', '{"a":[2,1]}', "core"),
  raw("duplicate_lhs_key_last_wins_false", '{"a":1,"a":2}', '{"a":1}'),
  raw("duplicate_lhs_key_last_wins_true", '{"a":1,"a":2}', '{"a":2}'),
  raw("duplicate_rhs_key_last_wins", '{"a":2}', '{"a":1,"a":2}'),
  raw("nested_duplicate_key_last_wins", '{"a":{"x":1,"x":2}}', '{"a":{"x":2}}'),
  raw("integer_above_js_safe_boundary", "9007199254740993", "9007199254740992"),
  raw(
    "integer_above_sqlite_int64_boundary",
    "9223372036854775809",
    "9223372036854775808",
  ),
  raw("decimal_double_rounding_boundary", "0.10000000000000001", "0.1"),
  raw("double_overflow_distinct", "1e400", "2e400"),
  raw("double_underflow_distinct", "1e-400", "2e-400"),
  raw("sql_null_lhs", null, "{}", "sql-null"),
  raw("sql_null_rhs", "{}", null, "sql-null"),
  raw("both_sql_null", null, null, "sql-null"),
  caseOf(
    "catalog_variant_same_item_positive",
    {
      variants: [
        { color: "blue", size: "M", stock: 4 },
        { color: "red", size: "S" },
      ],
    },
    { variants: [{ color: "blue", size: "M" }] },
    "product",
  ),
  caseOf(
    "catalog_variant_same_item_negative",
    {
      variants: [
        { color: "blue", size: "S" },
        { color: "red", size: "M" },
      ],
    },
    { variants: [{ color: "blue", size: "M" }] },
    "product",
  ),
  caseOf(
    "local_ticket_structured_filters",
    {
      status: "open",
      labels: ["mobile", "urgent"],
      customer: { plan: "pro", region: "EU" },
    },
    { labels: ["urgent"], customer: { plan: "pro" } },
    "product",
  ),
  caseOf(
    "offline_capability_match",
    { device: { codecs: ["h264", "av1"], features: { hdr: true } } },
    { device: { codecs: ["av1"], features: { hdr: true } } },
    "product",
  ),
  caseOf(
    "workflow_event_metadata",
    {
      event: {
        source: "checkout",
        flags: { retryable: false },
        attempts: [{ result: "ok", latency: 20 }],
      },
    },
    { event: { flags: { retryable: false }, attempts: [{ result: "ok" }] } },
    "product",
  ),
];

export const crossValues = [
  null,
  false,
  true,
  0,
  1,
  -1,
  1.5,
  "",
  "1",
  "true",
  "null",
  "a",
  [],
  {},
  [null],
  [false],
  [true],
  [0],
  [1],
  ["1"],
  [1, 1],
  [1, 2],
  [2, 1],
  [null, false, 0, "0"],
  [[]],
  [{}],
  [[1]],
  [[1, 2]],
  [[1], [2]],
  { a: null },
  { a: false },
  { a: 0 },
  { a: 1 },
  { a: "1" },
  { a: [] },
  { a: {} },
  { a: [1] },
  { a: [1, 2] },
  { a: { b: 1 } },
  { a: 1, b: 2 },
  { b: 2 },
  [{ a: 1 }],
  [{ a: 1, b: 2 }],
  [{ a: 1 }, { b: 2 }],
  [{ a: 1 }, { a: 2 }],
  { a: [{ b: 1, c: 2 }] },
  { a: [{ b: 1 }, { c: 2 }] },
];

export const crossCases = crossValues.flatMap((lhs, i) =>
  crossValues.map((rhs, k) =>
    caseOf(`cross_${i}_${k}`, lhs, rhs, "cross-product"),
  ),
);

// Deterministic bounded-tree cases. Includes matching pruned subtrees, unrelated
// trees, and every selected case's reversal; expected answers come from PG only.
export function generatedCases(seed = 0x5eedb, count = 500) {
  let state = seed >>> 0;
  const rand = (n) => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) % n;
  };
  const atoms = [
    null,
    true,
    false,
    -1,
    0,
    1,
    2,
    0.5,
    "",
    "a",
    "1",
    "null",
    "a,b.(c)",
    "🐘",
  ];
  const keys = ["a", "b", "x.y", 'q"r', "", "0", "__proto__"];
  const tree = (depth) => {
    const kind = depth === 0 ? 0 : rand(4);
    if (kind < 2) return atoms[rand(atoms.length)];
    if (kind === 2)
      return Array.from({ length: rand(4) }, () => tree(depth - 1));
    const obj = Object.create(null);
    for (let i = rand(4); i > 0; i--)
      obj[keys[rand(keys.length)]] = tree(depth - 1);
    return obj;
  };
  const prune = (value) => {
    if (Array.isArray(value))
      return value
        .filter(() => rand(3) !== 0)
        .map(prune)
        .reverse();
    if (value && typeof value === "object")
      return Object.fromEntries(
        Object.entries(value)
          .filter(() => rand(3) !== 0)
          .map(([key, v]) => [key, prune(v)]),
      );
    return value;
  };
  return Array.from({ length: count }, (_, i) => {
    const a = tree(4),
      b = i % 3 ? prune(a) : tree(4);
    return i % 2
      ? caseOf(`seed_${seed}_${i}`, a, b, "generated")
      : caseOf(`seed_${seed}_${i}`, b, a, "generated");
  });
}
