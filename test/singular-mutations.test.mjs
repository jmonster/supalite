import test from "node:test";
import assert from "node:assert/strict";
import { createHarness } from "./helpers/lite.mjs";

for (const backend of ["node", "libsql", "pglite"]) {
  test(`${backend}: singular mutations commit only one returned row`, async (t) => {
    const { client, connection, close } = await createHarness({
      backend,
      ddl: `
        CREATE TABLE items (id integer PRIMARY KEY, value text NOT NULL);
        CREATE TABLE changes (item_id integer NOT NULL);
        ${backend === "pglite" ? `
        CREATE FUNCTION record_item_change() RETURNS trigger AS $$
        BEGIN INSERT INTO changes (item_id) VALUES (OLD.id); RETURN OLD; END;
        $$ LANGUAGE plpgsql;
        CREATE TRIGGER item_updates AFTER UPDATE ON items
        FOR EACH ROW EXECUTE FUNCTION record_item_change();
        CREATE TRIGGER item_deletes AFTER DELETE ON items
        FOR EACH ROW EXECUTE FUNCTION record_item_change();
        CREATE FUNCTION skip_item() RETURNS trigger AS $$
        BEGIN
          IF NEW.value = 'skip' THEN
            INSERT INTO changes (item_id) VALUES (NEW.id); RETURN NULL;
          END IF;
          RETURN NEW;
        END; $$ LANGUAGE plpgsql;
        CREATE TRIGGER skip_item BEFORE INSERT ON items
        FOR EACH ROW EXECUTE FUNCTION skip_item();
        ` : ""}
      `,
    });
    t.after(close);
    if (backend !== "pglite") {
      for (const event of ["UPDATE", "DELETE"]) {
        await connection.exec(`CREATE TRIGGER item_${event} AFTER ${event} ON items
          BEGIN INSERT INTO changes (item_id) VALUES (OLD.id); END;`);
      }
      await connection.exec(`CREATE TRIGGER skip_item BEFORE INSERT ON items WHEN NEW.value = 'skip'
        BEGIN INSERT INTO changes (item_id) VALUES (NEW.id); SELECT RAISE(IGNORE); END;`);
    }
    const initial = [{ id: 1, value: "original" }, { id: 2, value: "original" }];
    const stored = async () => (await connection.kysely.selectFrom("items").selectAll().orderBy("id").execute()).map((row) => ({ ...row }));

    for (const mode of ["single", "maybeSingle", "plural"]) {
      for (const operation of ["insert", "update", "delete"]) {
        for (const count of mode === "plural" ? [2] : [0, 1, 2]) {
          await connection.kysely.deleteFrom("items").execute();
          await connection.kysely.insertInto("items").values(initial).execute();
          await connection.kysely.deleteFrom("changes").execute();
          const inserted = Array.from({ length: count }, (_, index) => ({ id: index + 3, value: "inserted" }));
          let query = client.from("items");
          query = operation === "insert" ? query.insert(inserted)
            : operation === "update" ? query.update({ value: "updated" }).lte("id", count)
              : query.delete().lte("id", count);
          query = query.select("id,value");
          const result = await (mode === "plural" ? query : query[mode]());
          const label = `${operation}/${mode}/${count}`;
          const error = mode === "single" ? count !== 1 : mode === "maybeSingle" && count > 1;
          assert.equal(result.error?.code ?? null, error ? "PGRST116" : null, label);
          assert.equal(result.status, error ? 406 : operation === "insert" ? 201 : 200, label);

          const changed = operation === "insert" ? inserted
            : initial.filter((row) => row.id <= count).map((row) => operation === "update" ? { ...row, value: "updated" } : row);
          assert.deepEqual(result.data, error ? null : mode === "plural" ? changed : changed[0] ?? null, label);
          const expected = mode === "single" && error ? initial
            : operation === "insert" ? [...initial, ...inserted]
              : operation === "update" ? initial.map((row) => row.id <= count ? { ...row, value: "updated" } : row)
                : initial.filter((row) => row.id > count);
          assert.deepEqual(await stored(), expected, label);
          const changes = await connection.kysely.selectFrom("changes").selectAll().execute();
          assert.equal(changes.length, operation === "insert" || mode === "single" && error ? 0 : count, label);
        }
      }
    }
    // Input length is one, but a trigger can suppress the row after other writes.
    await connection.kysely.deleteFrom("changes").execute();
    const skipped = await client.from("items").insert({ id: 3, value: "skip" }).select().single();
    assert.equal(skipped.error?.code, "PGRST116");
    assert.deepEqual(await stored(), []);
    assert.deepEqual(await connection.kysely.selectFrom("changes").selectAll().execute(), []);
  });
}

for (const backend of ["node", "libsql", "pglite"]) {
  test(`${backend}: singular rollback preserves the caller's outer transaction`, async (t) => {
    const { client, connection, close } = await createHarness({
      backend,
      ddl: "CREATE TABLE items (id integer PRIMARY KEY, value text NOT NULL);",
    });
    t.after(close);
    assert.equal((await client.from("items").insert([{ id: 1, value: "original" }, { id: 2, value: "original" }])).error, null);
    const exercise = async (db) => {
      await db.insertInto("items").values({ id: 3, value: "caller" }).execute();
      const failed = await client.from("items").update({ value: "wrong" }).lte("id", 2).select().single();
      assert.equal(failed.error?.code, "PGRST116");
      assert.deepEqual((await db.selectFrom("items").selectAll().orderBy("id").execute()).map((row) => ({ ...row })),
        [{ id: 1, value: "original" }, { id: 2, value: "original" }, { id: 3, value: "caller" }]);
      const invalid = await client.from("items").update({ value: null }).eq("id", 1).select().single();
      assert.notEqual(invalid.error, null);
      const success = await client.from("items").update({ value: "changed" }).eq("id", 1).select().single();
      assert.equal(success.error, null);
      assert.equal(success.data.value, "changed");
    };
    if (backend === "pglite") {
      await connection.exec("BEGIN");
      connection.harnessHoldingOuterTx = true;
      try {
        await exercise(connection.kysely);
      } finally {
        await connection.exec("ROLLBACK");
        connection.harnessHoldingOuterTx = false;
      }
    } else {
      const withContext = connection.withContext.bind(connection);
      const rollback = new Error("caller rollback");
      try {
        await assert.rejects(connection.runInTransaction(async (transaction) => {
          connection.withContext = (vars, fn, options) => withContext(vars, fn, { ...options, transaction });
          await exercise(transaction);
          throw rollback;
        }), (error) => error === rollback);
      } finally {
        connection.withContext = withContext;
      }
    }
    assert.deepEqual((await connection.exec("SELECT * FROM items ORDER BY id")).rows.map((row) => ({ ...row })),
      [{ id: 1, value: "original" }, { id: 2, value: "original" }]);
  });
}
