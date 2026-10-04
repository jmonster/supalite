import assert from "node:assert/strict";

const before = "if(J!==void 0&&C>0&&B===0&&C>=J){";
const after = "if(J!==void 0&&C>0&&B===0&&C>J){";

export function patch(source) {
  assert.equal(source.split(before).length - 1, 1, "Expected exactly one published pagination boundary guard");
  assert.equal(source.includes(after), false, "Pagination boundary is already patched");
  // C is the offset; J is the reported total; B is the returned row count.
  // An empty page starting exactly at a positive total is valid in PostgREST.
  return source.replace(before, after);
}
