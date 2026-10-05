import test from "node:test";
import assert from "node:assert/strict";
import { createHarness } from "./helpers/lite.mjs";

const cases = [
  { name: "exact end", offset: 6, status: 206, count: 6 },
  { name: "filtered end", minId: 3, offset: 3, status: 206, count: 3 },
  { name: "past end", offset: 7, status: 416, count: null },
  { name: "past filtered end", minId: 3, offset: 4, status: 416, count: null },
  { name: "empty result", minId: 6, offset: 0, status: 200, count: 0 },
  { name: "past empty result", minId: 6, offset: 1, status: 416, count: null },
  { name: "last row", offset: 5, status: 206, count: 6, data: [{ id: 6 }] },
];

for (const backend of ["node", "libsql", "pglite"]) {
  test(`${backend}: counted pagination boundaries`, async (t) => {
    const { client, close } = await createHarness({
      backend,
      ddl: "CREATE TABLE page_docs (id integer PRIMARY KEY);",
    });
    t.after(close);
    const inserted = await client.from("page_docs").insert(
      Array.from({ length: 6 }, (_, i) => ({ id: i + 1 })),
    );
    assert.equal(inserted.error, null, JSON.stringify(inserted.error));

    for (const head of [false, true]) {
      for (const { name, minId, offset, status, count, data = [] } of cases) {
        await t.test(`${head ? "HEAD" : "GET"}: ${name}`, async () => {
          let query = client.from("page_docs").select("id", { count: "exact", head });
          if (minId !== undefined) query = query.gt("id", minId);
          const result = await query.order("id").range(offset, offset + 1);

          assert.equal(result.status, status);
          assert.equal(result.count, count);
          if (status === 416) {
            assert.notEqual(result.error, null);
            if (!head) assert.equal(result.error.code, "PGRST103");
            assert.equal(result.data, null);
          } else {
            assert.equal(result.error, null);
            assert.deepEqual(result.data, head ? null : data);
          }
        });
      }
    }
  });
}
