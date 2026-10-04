// Run this same script in each checkout; results are local timings, not throughput claims.
import assert from "node:assert/strict";
import { cpus } from "node:os";
import { createHarness } from "../test/helpers/lite.mjs";

console.log(JSON.stringify({ node: process.version, cpu: cpus()[0]?.model, warmups: 4, samples: 20 }));
for (const backend of ["node", "libsql"]) {
  const h = await createHarness({ backend, ddl: "CREATE TABLE head_docs(id integer PRIMARY KEY, body jsonb);" });
  try {
    for (let id = 1; id <= 1000; id++) await h.connection.kysely.insertInto("head_docs").values({
      id, body: JSON.stringify({ active: true, notes: "x".repeat(4096) }),
    }).execute();
    for (const select of ["id", "id,body"]) for (const csv of [false, true]) {
      const samples = [];
      for (let iteration = -4; iteration < 20; iteration++) {
        let query = h.client.from("head_docs").select(select, { head: true, count: "exact" }).contains("body", { active: true });
        if (csv) query = query.csv();
        const start = performance.now();
        const result = await query;
        const elapsed = performance.now() - start;
        assert.equal(result.error, null);
        assert.equal(result.data, null);
        assert.equal(result.count, 1000);
        assert.equal(result.status, 200);
        if (iteration >= 0) samples.push(elapsed);
      }
      const sorted = samples.toSorted((a, b) => a - b);
      console.log(JSON.stringify({ backend, select, format: csv ? "csv" : "json", medianMs: (sorted[9] + sorted[10]) / 2, samples }));
    }
  } finally {
    await h.close();
  }
}
