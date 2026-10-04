import test from "node:test";
import assert from "node:assert/strict";
import { serve } from "@hono/node-server";
import { createHarness } from "./helpers/lite.mjs";

const row = { id: 1, label: "é🙂", body: { active: true }, nullable: null };
const singular = "application/vnd.pgrst.object+json";
const exact = { prefer: "count=exact" };
async function fixture(t, backend = "node") {
  const h = await createHarness({ backend, ddl: "CREATE TABLE head_docs(id integer PRIMARY KEY, label text, body jsonb, nullable text); CREATE VIEW head_view AS SELECT * FROM head_docs;" });
  t.after(h.close);
  await h.connection.kysely.insertInto("head_docs").values([1, 2, 3].map(id => ({ ...row, id, body: JSON.stringify(row.body) }))).execute();
  return h;
}
const request = (h, path, method = "HEAD", headers = {}) => h.app.fetch(new Request(`http://localhost/rest/v1/${path}`, { method, headers }));

for (const backend of ["node", "libsql"]) {
  test(`${backend}: HEAD preserves GET status, range, validation and headers except successful content length`, async t => {
    const h = await fixture(t, backend);
    t.mock.method(console, "error", () => {});
    const firstTwo = [{ id: 1 }, { id: 2 }];
    for (const [query, headers, status, range, expected] of [
      ["select=id&limit=2", {}, 200, "0-1/*", firstTwo],
      ...["exact", "planned", "estimated"].map(count => ["select=id&limit=2", { prefer: `count=${count}` }, 206, "0-1/3", firstTwo]),
      ["select=id&offset=2", exact, 206, "2-2/3", [{ id: 3 }]],
      ["select=id&offset=3", exact, 416, "*/3", "PGRST103"],
      ["select=id&offset=4", exact, 416, "*/3", "PGRST103"],
      ["select=id&offset=3", {}, 200, "*/*", []],
      ["select=id&limit=0", exact, 206, "*/3", []],
      ["select=id&id=gt.100", exact, 200, "*/0", []],
      ["select=id", { ...exact, range: "1-2", "range-unit": "items" }, 206, "1-2/3", [{ id: 2 }, { id: 3 }]],
      ["select=id&id=eq.1", { ...exact, accept: singular }, 200, "0-0/1", { id: 1 }],
      ["select=id&limit=2", { accept: singular }, 406, null, "PGRST116"],
      ["select=id&id=gt.100", { accept: singular }, 406, null, "PGRST116"],
      ["select=missing", {}, backend === "node" ? 500 : 400, null, backend === "node" ? "SUP" : "42703"],
      ["select=id&id=invalid.1", {}, 400, null, "PGRST100"],
      ["select=label->missing", {}, 500, null, "SUP"],
    ]) {
      await t.test(query + JSON.stringify(headers), async () => {
        const get = await request(h, `head_docs?${query}`, "GET", headers);
        const head = await request(h, `head_docs?${query}`, "HEAD", headers);
        const body = await get.text(), parsed = JSON.parse(body);
        assert.equal(get.status, status);
        assert.equal(head.status, status);
        assert.deepEqual(status < 300 ? parsed : parsed.code, expected);
        assert.equal(get.headers.get("content-range"), range);
        assert.equal(Number(get.headers.get("content-length")), Buffer.byteLength(body));
        if (status < 300) get.headers.delete("content-length");
        assert.deepEqual(Object.fromEntries(head.headers), Object.fromEntries(get.headers));
        assert.equal(await head.text(), "");
      });
    }
  });
}

test("HEAD skips final JSON/CSV serialization and UTF-8 encoding, but retains rows, transforms and count queries", async t => {
  const h = await fixture(t);
  let transformed = 0, serialized = 0, encoded = 0;
  const queries = [];
  const deserialize = h.connection.deserializeRow.bind(h.connection);
  const prepare = h.connection.driver.prepare.bind(h.connection.driver);
  const stringify = JSON.stringify, encode = TextEncoder.prototype.encode;
  t.mock.method(h.connection, "deserializeRow", value => { transformed++; return deserialize(value); });
  t.mock.method(h.connection.driver, "prepare", sql => {
    const statement = prepare(sql), all = statement.all.bind(statement);
    statement.all = (...args) => {
      const rows = all(...args);
      if (sql.includes('from "head_docs"')) queries.push({ sql, rows: rows.length });
      return rows;
    };
    return statement;
  });
  t.mock.method(JSON, "stringify", (value, ...args) => {
    if (value?.label === row.label || value?.[0]?.label === row.label || value?.active === true) serialized++;
    return stringify(value, ...args);
  });
  t.mock.method(TextEncoder.prototype, "encode", function (value) {
    if (/^(\[?\{"id":|id,label)/.test(value)) encoded++;
    return encode.call(this, value);
  });
  for (const accept of ["application/json", "text/csv", singular, "application/vnd.pgrst.array+json;nulls=stripped", `${singular};nulls=stripped`]) {
    transformed = serialized = encoded = 0;
    queries.length = 0;
    const headers = { ...exact, accept }, path = "head_docs?select=id,label,body,nullable&id=eq.1";
    const head = await request(h, path, "HEAD", headers);
    assert.equal(head.status, 200);
    assert.equal(transformed, 1);
    assert.equal(serialized, 0);
    assert.equal(encoded, 0);
    assert.equal(head.headers.get("content-length"), null);
    assert.equal(await head.text(), "");
    assert.deepEqual(queries.map(q => q.rows), [1, 1]);
    assert.match(queries[0].sql, /select "id", "label", json\("body"\) as "body"/);
    assert.match(queries[1].sql, /count\(\*\)/);
    const headQueries = queries.splice(0);
    const get = await request(h, path, "GET", headers), body = await get.text();
    assert.ok(serialized > 0);
    assert.equal(encoded, 1);
    assert.deepEqual(queries, headQueries);
    assert.equal(get.status, 200);
    assert.equal(get.headers.get("content-type"), `${accept}; charset=utf-8`);
    assert.equal(Number(get.headers.get("content-length")), Buffer.byteLength(body));
    const expected = accept.includes("nulls=stripped") ? { id: 1, label: row.label, body: row.body } : row;
    assert.equal(body, accept === "text/csv" ? 'id,label,body,nullable\n1,é🙂,"{""active"":true}",' : stringify(accept.startsWith(singular) ? expected : [expected]));
    get.headers.delete("content-length");
    assert.deepEqual(Object.fromEntries(head.headers), Object.fromEntries(get.headers));
  }
  t.mock.method(console, "error", () => {});
  t.mock.method(h.connection, "deserializeRow", () => { throw new Error("row transformation failed"); });
  const failed = await request(h, "head_docs?select=id&id=eq.1");
  assert.equal(failed.status, 500);
  assert.equal(await failed.text(), "");
});

test("PGlite table/view HEAD omits length; RPC scalar, JSON, set, void and error responses retain their contracts", async t => {
  const h = await fixture(t, "pglite");
  t.mock.method(console, "error", () => {});
  await h.connection.exec(`
    CREATE FUNCTION head_scalar() RETURNS integer LANGUAGE sql STABLE AS $$ SELECT 7 $$;
    CREATE FUNCTION head_json() RETURNS jsonb LANGUAGE sql STABLE AS $$ SELECT '{"hello":"é🙂"}'::jsonb $$;
    CREATE FUNCTION head_set() RETURNS SETOF head_docs LANGUAGE sql STABLE AS $$ SELECT * FROM head_docs WHERE id=1 $$;
    CREATE FUNCTION head_void() RETURNS void LANGUAGE sql STABLE AS $$ SELECT NULL::void $$;
    CREATE FUNCTION head_fails() RETURNS integer LANGUAGE sql STABLE AS $$ SELECT 1/0 $$;
  `);
  for (const table of ["head_docs", "head_view"]) {
    const response = await request(h, `${table}?select=id&limit=1`, "HEAD", exact);
    assert.equal(response.status, 206);
    assert.equal(response.headers.get("content-range"), "0-0/3");
    assert.equal(response.headers.get("content-length"), null);
    assert.equal(await response.text(), "");
  }
  for (const [fn, accept, status, expected] of [
    ["head_scalar", "application/json", 200, "7"],
    ["head_json", "application/json", 200, '{"hello":"é🙂"}'],
    ["head_set", "application/json", 200, JSON.stringify([row])],
    ["head_set", singular, 200, JSON.stringify(row)],
    ["head_set", "text/csv", 200, 'id,label,body,nullable\n1,é🙂,"{""active"":true}",'],
    ["head_void", "application/json", 204, ""],
    ["head_fails", "application/json", 400, null],
  ]) {
    const get = await request(h, `rpc/${fn}`, "GET", { accept });
    const head = await request(h, `rpc/${fn}`, "HEAD", { accept });
    const body = await get.text();
    assert.equal(get.status, status);
    assert.equal(head.status, status);
    if (expected !== null) assert.equal(body, expected);
    else assert.equal(JSON.parse(body).code, "22012");
    if (status === 200) assert.equal(Number(head.headers.get("content-length")), Buffer.byteLength(body));
    assert.deepEqual(Object.fromEntries(head.headers), Object.fromEntries(get.headers));
    assert.equal(await head.text(), "");
  }
});

test("real Node HTTP adapter omits successful HEAD length and preserves GET bytes", async t => {
  const h = await fixture(t);
  const server = serve({ fetch: request => h.app.fetch(request), hostname: "127.0.0.1", port: 0 });
  t.after(async () => { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); });
  if (!server.listening) await new Promise((resolve, reject) => { server.once("listening", resolve); server.once("error", reject); });
  const url = `http://127.0.0.1:${server.address().port}/rest/v1/head_docs?select=id,label&id=eq.1`;
  const get = await fetch(url), head = await fetch(url, { method: "HEAD" });
  assert.equal(get.status, 200);
  assert.equal(await get.text(), '[{"id":1,"label":"é🙂"}]');
  assert.equal(Number(get.headers.get("content-length")), Buffer.byteLength('[{"id":1,"label":"é🙂"}]'));
  assert.equal(head.status, 200);
  assert.equal(head.headers.get("content-length"), null);
  assert.equal(head.headers.get("content-type"), get.headers.get("content-type"));
  assert.equal(head.headers.get("content-range"), get.headers.get("content-range"));
  assert.equal(await head.text(), "");
});
