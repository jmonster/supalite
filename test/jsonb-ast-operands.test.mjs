import test from "node:test";
import assert from "node:assert/strict";
import { createHarness } from "./helpers/lite.mjs";

const ddl = "CREATE TABLE ast_docs(id integer PRIMARY KEY, body jsonb, expected jsonb)";
const queryOperand = { type: "query", from: "ast_docs", select: ["expected"] };
const documents = [
  { $ref: "expected" },
  queryOperand,
  { $ref: "expected", type: "query" },
  { x: 1 },
];

async function fixture(backend) {
  const h = await createHarness({ backend, ddl });
  for (const [index, body] of documents.entries()) {
    await h.connection.kysely.insertInto("ast_docs").values({
      id: index + 1,
      body: JSON.stringify(body),
      expected: '{"x":1}',
    }).execute();
  }
  return h;
}

for (const backend of ["node", "libsql"]) {
  test(`${backend}: public AST hook rejects dynamic JSONB operands before reads or writes`, async (t) => {
    const h = await fixture(backend);
    t.after(h.close);
    t.mock.method(console, "error", () => {});
    const original = h.connection.onPostgrestAST.bind(h.connection);
    let where;
    h.connection.onPostgrestAST = async (ast, vars) => ({
      ...await original(ast, vars),
      where,
    });
    try {
      for (const operand of [
        { $ref: "expected" },
        Object.create({ $ref: "expected" }),
        { ...queryOperand, $ref: "expected" },
        queryOperand,
      ]) {
        for (const operator of ["$contains", "$containedBy"]) {
          for (const negate of [false, true]) {
            where = {
              body: negate ? { $not: { [operator]: operand } } : { [operator]: operand },
            };
            const expectedMessage = "$ref" in operand
              ? `Unsupported ref operator: ${operator}`
              : "JSONB containment requires a constant JSON filter";
            for (const result of [
              await h.client.from("ast_docs").select("id"),
              await h.client.from("ast_docs").update({ expected: { changed: true } }),
            ]) {
              assert.equal(result.status, 500, JSON.stringify({ operator, negate, operand, result }));
              assert.equal(result.data, null);
              assert.ok(result.error?.message.includes(expectedMessage), JSON.stringify(result.error));
            }
          }
        }
      }
    } finally {
      h.connection.onPostgrestAST = original;
    }
    const unchanged = await h.client.from("ast_docs").select("expected");
    assert.equal(unchanged.error, null);
    assert.deepEqual(unchanged.data, documents.map(() => ({ expected: { x: 1 } })));
  });

  test(`${backend}: marked SDK JSON literals may contain AST-shaped keys`, async (t) => {
    const h = await fixture(backend);
    t.after(h.close);
    const ids = async (request, expected) => {
      const result = await request.order("id");
      assert.equal(result.error, null, JSON.stringify(result.error));
      assert.deepEqual(result.data, expected.map(id => ({ id })));
    };
    for (const [literal, contains, containedBy] of [
      [documents[0], [1, 3], [1]],
      [documents[1], [2], [2]],
      [documents[2], [3], [1, 3]],
    ]) {
      await ids(h.client.from("ast_docs").select("id").contains("body", literal), contains);
      await ids(h.client.from("ast_docs").select("id").containedBy("body", literal), containedBy);
      await ids(h.client.from("ast_docs").select("id").not("body", "cs", JSON.stringify(literal)),
        [1, 2, 3, 4].filter(id => !contains.includes(id)));
    }
    await ids(h.client.from("ast_docs").select("id")
      .contains("body", { $ref: "expected" }).contains("body", { type: "query" }), [3]);
  });
}
