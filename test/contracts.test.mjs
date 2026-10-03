import test from "node:test";
import assert from "node:assert/strict";
import { createHarness } from "./helpers/lite.mjs";

for (const backend of ["node", "libsql"]) {
  test(`${backend}: composed filters, pagination, strings, paths and request limits`, async () => {
    const h = await createHarness({
      backend,
      ddl: "CREATE TABLE docs(id integer PRIMARY KEY, body jsonb, key jsonb, type jsonb)",
    });
    try {
      const values = [
        [1],
        [2],
        [1, 2],
        null,
        "[1]",
        { value: "Case", active: true },
        { value: "case", active: false },
      ];
      for (const [index, value] of values.entries()) {
        const row = {
          id: index + 1,
          body: JSON.stringify(value),
          key: JSON.stringify(value),
          type: JSON.stringify(value),
        };
        await h.connection.kysely.insertInto("docs").values(row).execute();
      }
      await h.connection.kysely
        .insertInto("docs")
        .values({ id: 8, body: null })
        .execute();
      const ids = async (query, wanted) => {
        const r = await query.order("id");
        assert.equal(r.error, null);
        assert.deepEqual(
          r.data.map((row) => row.id),
          wanted,
        );
      };
      const from = () => h.client.from("docs").select("id");
      await ids(
        from().filter("body", "cs", "[1]").filter("body", "cd", "[1,2]"),
        [1, 3],
      );
      await ids(
        from().filter("body", "cd", "[1,2]").filter("body", "cs", "[1]"),
        [1, 3],
      );
      await ids(
        from().filter("body", "cs", "[1]").filter("body", "cs", "[2]"),
        [3],
      );
      await ids(
        from().not("body", "cs", "[1]").not("body", "cs", "[2]"),
        [4, 5, 6, 7],
      );
      await ids(from().or("and(body.cs.[1],body.cs.[2])"), [3]);
      await ids(
        from()
          .filter("body", "cs", "[1]")
          .filter("body", "cs", "[2]")
          .or("id.eq.1,id.eq.3"),
        [3],
      );
      await ids(from().contains("body", '"[1]"'), [5]);
      await ids(from().contains("body", { value: "Case" }), [6]);
      await ids(from().contains("key->active", "true"), [6]);
      await ids(from().contains("type->active", "true"), [6]);
      await ids(from().not("body", "cs", "{}"), [1, 2, 3, 4, 5]);
      const page = await h.client
        .from("docs")
        .select("id", { count: "exact" })
        .containedBy("body", "[1,2]")
        .order("id")
        .range(1, 1);
      assert.equal(page.error, null);
      assert.equal(page.count, 3);
      assert.deepEqual(page.data, [{ id: 2 }]);
      const head = await h.client
        .from("docs")
        .select("id", { count: "exact", head: true })
        .containedBy("body", "[1,2]")
        .limit(1);
      assert.equal(head.error, null);
      assert.equal(head.count, 3);
      const deleted = await h.client
        .from("docs")
        .delete()
        .contains("body", { value: "Case" })
        .select("id");
      assert.equal(deleted.error, null);
      assert.deepEqual(deleted.data, [{ id: 6 }]);

      let deep = 0;
      for (let i = 0; i < 17; i++) deep = { child: deep };
      const errors = [
        ["{bad:1}", "22P02"],
        ["[1,]", "22P02"],
        ['"\\u0000"', "22P05"],
        ['"\\ud800"', "22P02"],
        [JSON.stringify(deep), "54000"],
        [JSON.stringify(Array(130).fill(null)), "54000"],
        [
          JSON.stringify(
            Object.fromEntries(
              Array.from({ length: 33 }, (_, i) => [`p${i}`, i]),
            ),
          ),
          "54000",
        ],
      ];
      const largeObject = Object.fromEntries(Array.from({ length: 21 }, (_, index) => [`field${index}`, index]));
      const aggregate = await from().contains('body', largeObject).containedBy('body', largeObject);
      assert.equal(aggregate.status, 400);
      assert.equal(aggregate.error?.code, '54000');
      assert.match(aggregate.error.message, /100 total bound parameters/);
      // Expected rejected requests are part of the contract, not noisy failures.
      const oldError = console.error;
      console.error = () => {};
      try {
        for (const [literal, code] of errors) {
          const result = await from().filter("body", "cs", literal);
          assert.equal(result.status, 400, literal);
          assert.equal(result.error?.code, code, literal);
        }
      } finally {
        console.error = oldError;
      }

      let pathValue = { leaf: [1, 2] };
      for (let i = 0; i < 16; i++) pathValue = { child: pathValue };
      await h.connection.kysely
        .insertInto("docs")
        .values({ id: 20, body: JSON.stringify(pathValue) })
        .execute();
      await ids(from().contains(`body${"->child".repeat(16)}`, { leaf: [2] }), [
        20,
      ]);
      const tooLong = await from().contains(`body${"->child".repeat(17)}`, {});
      assert.equal(tooLong.status, 400);
      assert.equal(tooLong.error?.code, "54000");
    } finally {
      await h.close();
    }
  });
}
