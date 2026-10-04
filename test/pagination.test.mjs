import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { patch } from "../scripts/patch-pagination.mjs";
import { fixture, request, assertFixed, assertUnchanged } from "./helpers/pagination.mjs";

test("pagination patch changes only one boundary operator and rejects missing/repeated anchors", async () => {
  const source = await readFile(new URL("../upstream/lite-0.11.0/dist/index.js", import.meta.url), "utf8");
  const candidate = await readFile(new URL("../.generated/candidate/node_modules/@supabase/lite/dist/index.js", import.meta.url), "utf8");
  assert.equal(candidate, patch(source));
  assert.equal(source.length - candidate.length, 1);
  assert.equal(candidate.replace("if(J!==void 0&&C>0&&B===0&&C>J){", "if(J!==void 0&&C>0&&B===0&&C>=J){"), source);
  assert.throws(() => patch(""), /exactly one/);
  assert.throws(() => patch(source + source), /exactly one/);
  assert.throws(() => patch(candidate), /exactly one|already patched/);
});

for (const backend of ["node", "libsql"]) {
  test(`${backend}: counted empty end pages and unchanged pagination controls`, async t => {
    const b = await fixture(backend, "baseline");
    t.after(() => b.close());
    const c = await fixture(backend, "candidate");
    t.after(() => c.close());
    for (const method of ["GET", "HEAD"]) for (const style of ["query", "range"]) {
      // HEAD Range parsing is an existing Lite behavior, not a PostgREST parity claim.
      for (const count of ["exact", "planned", "estimated"]) {
        const options = { method, style, count };
        await assertFixed(b, c, { ...options, offset: 6 });
        await assertFixed(b, c, { ...options, filter: "gt.3", offset: 3 }, 3);
        await assertUnchanged(b, c, { ...options, offset: 7 }, 416, "*/6");
        await assertUnchanged(b, c, { ...options, filter: "gt.100" }, 200, "*/0");
        await assertUnchanged(b, c, { ...options, filter: "gt.100", offset: 1 }, 416, "*/0");
        await assertUnchanged(b, c, { ...options, offset: 5 }, 206, "5-5/6");
        await assertUnchanged(b, c, { ...options, limit: 8 }, 200, "0-5/6");
        for (const offset of [6, 7]) {
          const singular = await assertUnchanged(b, c, { ...options, offset, singular: true }, 406);
          if (method === "GET") assert.equal(JSON.parse(singular.body).code, "PGRST116");
        }
      }
      for (const count of ["omitted", "none"]) for (const offset of [6, 7]) {
        await assertUnchanged(b, c, { method, style, count, offset }, 200, "*/*");
      }
    }
    for (const method of ["GET", "HEAD"]) for (const count of ["exact", "planned", "estimated", "none", "omitted"]) {
      const counted = !["none", "omitted"].includes(count);
      await assertUnchanged(b, c, { method, count, limit: 0 }, counted ? 206 : 200, counted ? "*/6" : "*/*");
      await assertUnchanged(b, c, { method, count, limit: 0, filter: "gt.100" }, 200, counted ? "*/0" : "*/*");
      // Nonzero offset plus limit=0 is rejected earlier; this patch leaves it alone.
      await assertUnchanged(b, c, { method, count, limit: 0, offset: 6 }, 416);
      await assertUnchanged(b, c, { method, count, limit: -1 }, 416);
      await assertUnchanged(b, c, { method, count, style: "range", offset: 1, limit: 0 }, 416);
    }
    for (const accept of ["text/csv", "application/vnd.pgrst.array+json;nulls=stripped"]) {
      const result = await request(c, { offset: 6, accept });
      assert.equal(result.status, 206);
      assert.equal(result.headers["content-range"], "*/6");
      assert.equal(result.body, accept === "text/csv" ? "" : "[]");
    }
  });

  test(`${backend}: supabase-js end-page result keeps the count for GET and HEAD`, async t => {
    const b = await fixture(backend, "baseline");
    t.after(() => b.close());
    const c = await fixture(backend, "candidate");
    t.after(() => c.close());
    for (const count of ["exact", "planned", "estimated"]) for (const head of [false, true]) {
      const query = h => h.client.from("page_docs").select("id", { count, head }).order("id").range(6, 7);
      const baseline = await query(b);
      const candidate = await query(c);
      assert.equal(baseline.status, 416);
      assert.notEqual(baseline.error, null);
      assert.equal(baseline.count, null);
      assert.equal(candidate.status, 206);
      assert.equal(candidate.error, null);
      assert.equal(candidate.count, 6);
      assert.deepEqual(candidate.data, head ? null : []);
    }
  });
}
