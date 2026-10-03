// Black-box counterexamples reproduced against published Lite 0.11.0.
export const fixtures = [
  [
    "nested_object_subset",
    { profile: { plan: "pro", active: true } },
    { profile: { plan: "pro" } },
  ],
  ["array_object_subset", [{ id: 1, name: "one" }, { id: 2 }], [{ id: 1 }]],
  ["duplicate_rhs_array", [1, 2], [1, 1]],
  ["boolean_number_distinct", { value: true }, { value: 1 }],
  ["null_object_value", { value: null }, { value: null }],
  ["missing_not_null", { other: null }, { value: null }],
  ["nested_array_order", { tags: [1, 2, 3] }, { tags: [3, 1] }],
  ["object_key_order", { child: { a: 1, b: 2 } }, { child: { b: 2, a: 1 } }],
  ["empty_object_only_objects", [1, 2], {}],
  ["empty_array_only_arrays", { a: 1 }, []],
  ["null_array_value", [null, 1], [null]],
  ["boolean_array_not_numeric", [true], [1]],
  ["scalar_in_array", [1, 2], 1],
  ["primitive_object", { name: "one" }, { name: "one" }],
  ["primitive_array", [1, 2], [2]],
  ["dotted_object_key", { "a.b": 1 }, { "a.b": 1 }],
  ["quoted_object_key", { 'a"b': 1 }, { 'a"b': 1 }],
];
