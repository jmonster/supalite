import test from "node:test";
import assert from "node:assert/strict";
import { createHarness } from "./helpers/lite.mjs";

const ddl = `
CREATE TABLE parents (id integer PRIMARY KEY);
CREATE TABLE items (
  id integer PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  label text NOT NULL,
  quantity integer NOT NULL CHECK (quantity >= 0),
  parent_id integer NOT NULL REFERENCES parents(id)
);`;
const row = (id, overrides = {}) => ({
  id, slug: `item-${id}`, label: "good", quantity: 1, parent_id: 1, ...overrides,
});

for (const backend of ["node", "libsql", "pglite"]) {
  test(`${backend}: mutation constraints retain SQLSTATE, HTTP status, and atomicity`, async (t) => {
    const { client, app, connection, close } = await createHarness({ backend, ddl });
    t.after(close);
    // Failed requests are intentional; assertions below retain their error details.
    t.mock.method(console, "error", () => {});
    assert.equal((await client.from("parents").insert([{ id: 1 }, { id: 2 }])).error, null);
    assert.equal((await client.from("items").insert([row(1), row(2)])).error, null);

    async function snapshot() {
      const state = {};
      for (const table of ["parents", "items"]) {
        const result = await client.from(table).select("*").order("id");
        assert.equal(result.error, null, JSON.stringify(result.error));
        state[table] = result.data;
      }
      return state;
    }
    const initial = await snapshot();
    const cases = [
      ["insert UNIQUE", "23505", 409, () => client.from("items").insert(row(3, { slug: "item-1" })).select()],
      ["insert PRIMARY KEY", "23505", 409, () => client.from("items").insert(row(1, { slug: "new-slug" })).select()],
      ["insert NOT NULL", "23502", 400, () => client.from("items").insert(row(3, { label: null })).select()],
      ["insert FOREIGN KEY", "23503", 409, () => client.from("items").insert(row(3, { parent_id: 999 })).select()],
      ["raw HTTP CHECK", "23514", 400, async () => {
        const response = await app.fetch(new Request("http://localhost/rest/v1/items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(row(3, { quantity: -1 })),
        }));
        assert.match(response.headers.get("Content-Type"), /application\/json/);
        return { status: response.status, error: await response.json(), data: null };
      }],
      ["update CHECK", "23514", 400, () => client.from("items").update({ quantity: -1 }).eq("id", 1).select()],
      ["delete FOREIGN KEY", "23503", 409, () => client.from("parents").delete().eq("id", 1).select()],
      ["atomic bulk insert CHECK", "23514", 400, () => client.from("items").insert([row(3), row(4, { quantity: -1 })]).select()],
    ];
    for (const [name, code, status, request] of cases) {
      await t.test(name, async () => {
        const result = await request();
        assert.deepEqual(await snapshot(), initial, "failed mutations must not persist rows");
        assert.equal(result.status, status, JSON.stringify(result.error));
        assert.equal(result.data, null);
        assert.deepEqual(Object.keys(result.error).sort(), ["code", "details", "hint", "message"]);
        assert.equal(result.error.code, code);
        assert.equal(typeof result.error.message, "string");
        assert.ok(result.error.message.length > 0);
        assert.equal(typeof result.error.details, "string");
        assert.ok(result.error.details.length > 0);
        assert.equal(result.error.hint, null);
      });
    }
    if (backend !== "pglite") {
      for (const error of [
        Object.assign(new Error("unrecognized SQLite error"), { code: "ERR_SQLITE_ERROR", errcode: 1 }),
        Object.assign(new Error("not a SQLite error"), { code: "OTHER", errcode: 275 }),
        new Error("CHECK constraint failed: not a driver error"),
      ]) {
        assert.equal(connection.normalizeDbError(error), error, "unknown errors must pass through unchanged");
      }
    }
  });
}
