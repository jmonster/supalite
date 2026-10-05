import test from "node:test";
import assert from "node:assert/strict";
import { mergeFilter } from "../upstream/lite-0.11.0/dist/query/merge-filters.js";

test("special column names remain own data properties without prototype mutation", () => {
  const before = Object.getOwnPropertyDescriptors(Object.prototype);
  for (const name of ["__proto__", "constructor", "toString"]) {
    const where = {};
    const first = { $contains: { x: 1 } };
    const second = { $contains: { y: 2 } };
    mergeFilter(where, name, first);
    mergeFilter(where, name, second);
    assert.equal(Object.getPrototypeOf(where), Object.prototype);
    assert.equal(Object.hasOwn(where, name), true);
    assert.equal(where[name], first);
    assert.deepEqual(where.$and, [{ [name]: second }]);
  }
  assert.deepEqual(Object.getOwnPropertyDescriptors(Object.prototype), before);
});

test("inherited conjunctions are not modified; symbol literal metadata survives", () => {
  const inherited = [];
  const where = Object.create({
    $and: inherited,
    body: { $contains: "inherited" },
  });
  const key = Symbol("wire-literal");
  mergeFilter(where, "body", { $contains: "first" });
  mergeFilter(where, "body", {
    $containedBy: "second",
    [key]: "original wire value",
  });
  mergeFilter(where, "body", { $contains: "third" });
  assert.equal(inherited.length, 0);
  assert.equal(where.body[key], "original wire value");
  assert.deepEqual(where.$and, [{ body: { $contains: "third" } }]);
});
