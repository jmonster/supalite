import assert from "node:assert/strict";
import { createHarness } from "./lite.mjs";

export const rows = Array.from({ length: 6 }, (_, i) => ({ id: i + 1, label: `item ${i + 1}` }));

export async function fixture(backend, flavor) {
  const h = await createHarness({
    backend, flavor,
    ddl: "CREATE TABLE page_docs(id integer PRIMARY KEY, label text NOT NULL);",
  });
  try {
    const seeded = await h.client.from("page_docs").insert(rows);
    assert.equal(seeded.error, null, JSON.stringify(seeded.error));
    return h;
  } catch (error) {
    await h.close();
    throw error;
  }
}

export async function request(h, { method = "GET", count = "exact", offset = 0, limit = 2,
  filter, style = "query", singular = false, relation = "page_docs", accept } = {}) {
  const params = new URLSearchParams({ select: "id", order: "id" });
  if (filter) params.set("id", filter);
  const headers = {};
  if (count !== "omitted") headers.prefer = `count=${count}`;
  if (singular) headers.accept = "application/vnd.pgrst.object+json";
  if (accept) headers.accept = accept;
  if (style === "range") {
    headers.range = `${offset}-${offset + limit - 1}`;
    headers["range-unit"] = "items";
  } else {
    params.set("offset", offset);
    params.set("limit", limit);
  }
  const response = await h.app.fetch(new Request(`http://localhost/rest/v1/${relation}?${params}`, { method, headers }));
  return { status: response.status, headers: Object.fromEntries(response.headers), body: await response.text() };
}

export async function assertFixed(baseline, candidate, options, total = 6) {
  const b = await request(baseline, options);
  const c = await request(candidate, options);
  assert.equal(b.status, 416, JSON.stringify(b));
  assert.equal(b.headers["content-range"], `*/${total}`);
  assert.equal(c.status, 206, JSON.stringify(c));
  assert.equal(c.headers["content-range"], `*/${total}`);
  assert.equal(c.headers["preference-applied"], `count=${options.count ?? "exact"}`);
  assert.equal(c.body, options.method === "HEAD" ? "" : "[]");
  assert.equal(c.headers["content-length"], "2");
  if (options.method !== "HEAD") assert.equal(JSON.parse(b.body).code, "PGRST103");
}

export async function assertUnchanged(baseline, candidate, options, status, range) {
  const b = await request(baseline, options);
  const c = await request(candidate, options);
  assert.deepEqual(c, b);
  assert.equal(c.status, status, JSON.stringify(c));
  if (range !== undefined) assert.equal(c.headers["content-range"], range);
  if (options.method === "HEAD") assert.equal(c.body, "");
  return c;
}
