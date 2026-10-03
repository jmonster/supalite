import test from "node:test";
import assert from "node:assert/strict";
import { createHarness } from "./helpers/lite.mjs";

// Set SUPALITE_TEST_FLAVOR=baseline to run these same assertions against stock
// 0.11.0. That negative-control run must fail on the repeated-filter cases.
const flavor = process.env.SUPALITE_TEST_FLAVOR ?? "patched";
assert.ok(["baseline", "patched"].includes(flavor));

const rows = [
  [1, 10, "red", ["red"]],
  [2, 20, "blue", ["blue"]],
  [3, 30, "green", ["red", "blue"]],
  [4, 40, "red", ["green"]],
  [5, 50, "blue", ["blue", "green"]],
  [6, null, null, null],
  [7, 60, "amber", []],
];

// Real PostgREST requests preserve the exact duplicate parameters and their
// order. No JSONB columns or containment compiler changes are involved.
async function requestIds(h, parameters, expected) {
  const url = new URL("http://localhost/rest/v1/filter_rows");
  url.search = new URLSearchParams([
    ["select", "id"],
    ["order", "id.asc"],
    ...parameters,
  ]).toString();
  const response = await h.app.fetch(new Request(url));
  const body = await response.json();
  assert.equal(response.status, 200, JSON.stringify(body));
  assert.deepEqual(body, expected.map((id) => ({ id })), url.search);
}

const repeatedCases = [
  ["integer eq", [["amount", "eq.10"], ["amount", "eq.20"]], []],
  ["integer neq", [["amount", "neq.10"], ["amount", "neq.20"]], [3, 4, 5, 7]],
  [
    "integer in",
    [["amount", "in.(10,20,30)"], ["amount", "in.(20,30,40)"]],
    [2, 3],
  ],
  ["text eq", [["label", "eq.red"], ["label", "eq.blue"]], []],
  ["text neq", [["label", "neq.red"], ["label", "neq.blue"]], [3, 7]],
  [
    "text in",
    [["label", "in.(red,blue)"], ["label", "in.(blue,green)"]],
    [2, 5],
  ],
  [
    "integer NOT eq",
    [["amount", "not.eq.10"], ["amount", "not.eq.20"]],
    [3, 4, 5, 7],
  ],
  [
    "text NOT eq",
    [["label", "not.eq.red"], ["label", "not.eq.blue"]],
    [3, 7],
  ],
  [
    "NOT with different inner operators",
    [["amount", "not.eq.10"], ["amount", "not.in.(20,30)"]],
    [4, 5, 7],
  ],
  [
    "SQL array contains",
    [["tags", "cs.{red}"], ["tags", "cs.{blue}"]],
    [3],
  ],
  [
    // Guard the SQL NULL row: baseline SQLite array NOT semantics differ from
    // PostgreSQL independently of duplicate-parameter parsing.
    "SQL array NOT contains",
    [["tags", "not.cs.{red}"], ["tags", "not.cs.{blue}"], ["id", "neq.6"]],
    [4, 7],
  ],
];

for (const backend of ["node", "libsql", "pglite"]) {
  test(`${flavor}/${backend}: repeated filters through real requests`, async (t) => {
    const h = await createHarness({
      flavor,
      backend,
      ddl: `CREATE TABLE filter_rows (
        id integer PRIMARY KEY,
        amount integer,
        label text,
        tags text[],
        "__proto__" text,
        "constructor" text,
        "toString" text
      )`,
    });
    try {
      // Seed through SQL to isolate query parsing. Stock Lite's JSON insert
      // conversion separately drops a data property named __proto__.
      for (const [id, amount, label, tags] of rows) {
        const storedTags =
          backend === "pglite" || tags === null ? tags : JSON.stringify(tags);
        const row = Object.fromEntries([
          ["id", id],
          ["amount", amount],
          ["label", label],
          ["tags", storedTags],
          ...["__proto__", "constructor", "toString"].map((name) => [name, label]),
        ]);
        await h.connection.kysely.insertInto("filter_rows").values(row).execute();
      }

      await t.test("single filters and native SQL arrays retain baseline support", async () => {
        await requestIds(h, [["amount", "eq.20"]], [2]);
        await requestIds(h, [["label", "neq.red"]], [2, 3, 5, 7]);
        await requestIds(h, [["tags", "cs.{red}"]], [1, 3]);
        await requestIds(h, [["tags", "cs.{blue}"]], [2, 3, 5]);
        await requestIds(h, [["tags", "not.cs.{red}"], ["id", "neq.6"]], [2, 4, 5, 7]);
        await requestIds(h, [["tags", "not.cs.{blue}"], ["id", "neq.6"]], [1, 4, 7]);
      });

      for (const [name, parameters, expected] of repeatedCases) {
        for (const reversed of [false, true]) {
          await t.test(`${name}, ${reversed ? "reverse" : "forward"} parameter order`, () =>
            requestIds(h, reversed ? [...parameters].reverse() : parameters, expected),
          );
        }
      }

      await t.test("three occurrences preserve all predicates", () =>
        requestIds(h, [["amount", "neq.10"], ["amount", "neq.20"], ["amount", "neq.30"]], [4, 5, 7]),
      );
      await t.test("identical repeated predicates are idempotent", () =>
        requestIds(h, [["amount", "eq.20"], ["amount", "eq.20"]], [2]),
      );

      for (const reversed of [false, true]) {
        await t.test(`distinct operators, ${reversed ? "reverse" : "forward"} parameter order`, async () => {
          const numeric = [["amount", "gt.10"], ["amount", "lt.50"]];
          const text = [["label", "neq.red"], ["label", "in.(red,blue)"]];
          await requestIds(h, reversed ? numeric.reverse() : numeric, [2, 3, 4]);
          await requestIds(h, reversed ? text.reverse() : text, [2, 5]);
        });
        await t.test(`repeated and distinct operators on one column, ${reversed ? "reverse" : "forward"} parameter order`, () => {
          const parameters = [["amount", "neq.10"], ["amount", "lt.50"], ["amount", "neq.20"]];
          return requestIds(h, reversed ? parameters.reverse() : parameters, [3, 4]);
        });
      }

      for (const logicalFirst of [false, true]) {
        await t.test(`explicit AND ${logicalFirst ? "before" : "after"} repeated parameters`, () => {
          const repeated = [["amount", "neq.10"], ["amount", "neq.20"]];
          const explicit = [["and", "(amount.lt.50,label.neq.green)"]];
          return requestIds(h, logicalFirst ? [...explicit, ...repeated] : [...repeated, ...explicit], [4]);
        });
        await t.test(`existing OR ${logicalFirst ? "before" : "after"} repeated parameters`, () => {
          const repeated = [["amount", "neq.10"], ["amount", "neq.20"]];
          const explicit = [["or", "(amount.eq.10,amount.eq.20,amount.eq.30)"]];
          return requestIds(h, logicalFirst ? [...explicit, ...repeated] : [...repeated, ...explicit], [3]);
        });
      }

      await t.test("supabase-js chained filters use the same request path", async () => {
        const result = await h.client
          .from("filter_rows")
          .select("id")
          .neq("amount", 10)
          .neq("amount", 20)
          .not("label", "eq", "red")
          .not("label", "eq", "blue")
          .order("id");
        assert.equal(result.error, null);
        assert.deepEqual(result.data, [{ id: 3 }, { id: 7 }]);
      });

      for (const column of ["__proto__", "constructor", "toString"]) {
        await t.test(`special column ${column} remains a filter without prototype mutation`, async () => {
          // Also keep a deliberately failing stock-package run isolated: its
          // parser mutates inherited objects instead of making own properties.
          const snapshots = [Object.prototype, Object, Object.prototype.toString].map(
            (object) => [object, Object.getOwnPropertyDescriptors(object)],
          );
          try {
            await requestIds(h, [[column, "neq.red"], [column, "neq.blue"]], [3, 7]);
            for (const [object, descriptors] of snapshots) {
              assert.deepEqual(Object.getOwnPropertyDescriptors(object), descriptors);
            }
          } finally {
            for (const [object, descriptors] of snapshots) {
              for (const key of Reflect.ownKeys(object)) {
                if (!Object.hasOwn(descriptors, key)) Reflect.deleteProperty(object, key);
              }
              Object.defineProperties(object, descriptors);
            }
          }
        });
      }
    } finally {
      await h.close();
    }
  });
}
