import assert from "node:assert/strict";
import { createHarness } from "../test/helpers/lite.mjs";

const products = [
  {
    id: 1,
    name: "Blue medium jacket",
    attributes: {
      published: true,
      retiredAt: null,
      variants: [
        { color: "blue", size: "M", stock: 8 },
        { color: "red", size: "S", stock: 2 },
      ],
    },
  },
  {
    id: 2,
    name: "Blue small / red medium jacket",
    attributes: {
      published: true,
      retiredAt: null,
      variants: [
        { color: "blue", size: "S", stock: 8 },
        { color: "red", size: "M", stock: 2 },
      ],
    },
  },
  {
    id: 3,
    name: "Draft jacket",
    attributes: {
      published: false,
      variants: [{ color: "blue", size: "M", stock: 8 }],
    },
  },
  {
    id: 4,
    name: "Legacy numeric flag",
    attributes: {
      published: 1,
      variants: [{ color: "blue", size: "M", stock: 8 }],
    },
  },
];
const scenarios = [
  {
    title: "Published products with blue AND M on the same variant",
    filter: { published: true, variants: [{ color: "blue", size: "M" }] },
    expected: [1],
  },
  {
    title: "Published means JSON true (a numeric 1 is a different value)",
    filter: { published: true },
    expected: [1, 2],
  },
  {
    title: "Explicit JSON null retirement date (missing is different)",
    filter: { retiredAt: null },
    expected: [1, 2],
  },
];

console.log(
  "JSONB filters through supabase-js\n",
);
for (const scenario of scenarios) {
  console.log(scenario.title);
  console.log(`  .contains('attributes', ${JSON.stringify(scenario.filter)})`);
  for (const [label, flavor, backend] of [
    ["Published 0.11.0 / SQLite", "baseline", "node"],
    ["Patched / SQLite", "patched", "node"],
    ["Patched / libSQL", "patched", "libsql"],
    ["PGlite PostgreSQL", "baseline", "pglite"],
  ]) {
    const h = await createHarness({
      flavor,
      backend,
      ddl: "CREATE TABLE products(id integer PRIMARY KEY, name text, attributes jsonb)",
    });
    const oldError = console.error;
    if (flavor === "baseline" && backend === "node") console.error = () => {};
    try {
      const insert = await h.client.from("products").insert(products);
      assert.equal(insert.error, null);
      const result = await h.client
        .from("products")
        .select("id,name", { count: "exact" })
        .contains("attributes", scenario.filter)
        .order("id")
        .limit(10);
      const ids = result.data?.map((row) => row.id);
      if (flavor === "patched" || backend === "pglite") {
        assert.equal(result.error, null);
        assert.deepEqual(ids, scenario.expected);
        assert.equal(result.count, scenario.expected.length);
      }
      console.log(
        `  ${label}: ${result.error ? `HTTP ${result.status} (${result.error.code})` : `${JSON.stringify(ids)}; count=${result.count}`}`,
      );
    } finally {
      console.error = oldError;
      await h.close();
    }
  }
  console.log("");
}
console.log(
  "Reference results use PostgreSQL operators executed locally in PGlite.",
);
