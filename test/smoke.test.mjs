import test from "node:test";
import assert from "node:assert/strict";
import { createHarness } from "./helpers/lite.mjs";

for (const backend of ["node", "libsql", "pglite"]) {
  test(`${backend}: tracked implementation SDK insert, select, filter, and count`, async (t) => {
    const { client, close } = await createHarness({
      backend,
      ddl: "CREATE TABLE items (id integer PRIMARY KEY, name text NOT NULL, category text NOT NULL);",
    });
    t.after(close);
    const rows = [
      { id: 1, name: "Apple", category: "fruit" },
      { id: 2, name: "Pear", category: "fruit" },
      { id: 3, name: "Carrot", category: "vegetable" },
    ];

    const inserted = await client.from("items").insert(rows).select("id,name,category");
    assert.equal(inserted.error, null, JSON.stringify(inserted.error));
    assert.deepEqual(inserted.data?.toSorted((a, b) => a.id - b.id), rows);

    const selected = await client.from("items").select("id,name,category").order("id");
    assert.equal(selected.error, null, JSON.stringify(selected.error));
    assert.deepEqual(selected.data, rows);

    const filtered = await client.from("items").select("id,name,category").eq("category", "fruit").order("id");
    assert.equal(filtered.error, null, JSON.stringify(filtered.error));
    assert.deepEqual(filtered.data, rows.slice(0, 2));

    const counted = await client.from("items").select("id", { count: "exact", head: true }).eq("category", "fruit");
    assert.equal(counted.error, null, JSON.stringify(counted.error));
    assert.equal(counted.count, 2);
    assert.equal(counted.data, null);
  });
}
