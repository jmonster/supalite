import test from "node:test";
import assert from "node:assert/strict";
import { request } from "./helpers/pagination.mjs";
import { createHarness } from "./helpers/lite.mjs";

const cases = [];
for (const relation of ["page_docs", "page_view", "rpc/page_set"]) {
  for (const method of ["GET", "HEAD"]) {
    for (const offset of [5, 6, 7]) {
      cases.push({ relation, method, offset, expected: offset === 5 ? 206 : offset === 6 ? "fixed" : 416 });
      cases.push({ relation, method, offset, singular: true, expected: offset === 5 ? 200 : 406 });
    }
    cases.push({ relation, method, filter: "gt.100", expected: 200 });
    cases.push({ relation, method, filter: "gt.100", offset: 1, expected: 416 });
    cases.push({ relation, method, offset: 6, count: "none", expected: 200 });
    cases.push({ relation, method, limit: 0, expected: 206 });
  }
}
// Stable SETOF functions share the boundary response path for POST too.
cases.push({ relation: "rpc/page_set", method: "POST", offset: 6, expected: "fixed" });
cases.push({ relation: "rpc/page_set", method: "POST", offset: 7, expected: 416 });
for (const method of ["GET", "HEAD"]) {
  cases.push({ relation: "rpc/page_volatile", method, offset: 6, expected: 200 });
  cases.push({ relation: "rpc/page_volatile", method, offset: 7, expected: 200 });
}

async function collect(flavor) {
  const h = await createHarness({ backend: "pglite", flavor });
  try {
    await h.connection.exec(`
      CREATE TABLE page_docs(id integer PRIMARY KEY, label text NOT NULL);
      INSERT INTO page_docs SELECT i, 'item ' || i FROM generate_series(1,6) AS i;
      CREATE VIEW page_view AS SELECT * FROM page_docs;
      CREATE FUNCTION page_set() RETURNS SETOF page_docs LANGUAGE sql STABLE
        AS $$ SELECT * FROM page_docs ORDER BY id $$;
      CREATE FUNCTION page_volatile() RETURNS SETOF page_docs LANGUAGE sql VOLATILE
        AS $$ SELECT * FROM page_docs ORDER BY id $$;
      CREATE FUNCTION page_scalar() RETURNS integer LANGUAGE sql STABLE AS $$ SELECT 7 $$;
      CREATE FUNCTION page_void() RETURNS void LANGUAGE sql STABLE AS $$ SELECT NULL::void $$;
    `);
    const responses = [];
    for (const options of cases) responses.push(await request(h, options));
    const sdk = [];
    for (const head of [false, true]) {
      sdk.push(await h.client.rpc("page_set", {}, { head, count: "exact" }).select("id").order("id").range(6, 7));
    }
    const otherRpc = [];
    for (const fn of ["page_scalar", "page_void"]) for (const method of ["GET", "HEAD"]) {
      const r = await h.app.fetch(new Request(`http://localhost/rest/v1/rpc/${fn}`, { method }));
      otherRpc.push({ fn, method, status: r.status, headers: Object.fromEntries(r.headers), body: await r.text() });
    }
    return { responses, sdk, otherRpc };
  } finally {
    await h.close();
  }
}

test("PGlite: table/view and stable SETOF RPC end pages, with unrelated RPC behavior preserved", async () => {
  // Keep only one PGlite engine alive at a time.
  const baseline = await collect("baseline");
  const candidate = await collect("candidate");
  for (const [i, options] of cases.entries()) {
    const b = baseline.responses[i];
    const c = candidate.responses[i];
    const message = JSON.stringify({ options, baseline: b, candidate: c });
    if (options.expected === "fixed") {
      assert.equal(b.status, 416, message);
      assert.equal(c.status, 206, message);
      assert.equal(c.headers["content-range"], "*/6", message);
      assert.equal(c.body, options.method === "HEAD" ? "" : "[]", message);
    } else {
      assert.deepEqual(c, b, message);
      assert.equal(c.status, options.expected, message);
    }
  }
  for (const [i, result] of candidate.sdk.entries()) {
    assert.equal(baseline.sdk[i].status, 416);
    assert.equal(result.status, 206);
    assert.equal(result.error, null);
    assert.equal(result.count, 6);
    assert.deepEqual(result.data, i === 1 ? null : []);
  }
  assert.deepEqual(candidate.otherRpc, baseline.otherRpc);
  for (const response of candidate.otherRpc) {
    assert.equal(response.status, response.fn === "page_void" ? 204 : 200);
    if (response.method === "HEAD") assert.equal(response.body, "");
  }
});
