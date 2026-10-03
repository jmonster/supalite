import assert from "node:assert/strict";
import { createHash } from "node:crypto";

export const cliSha256 = "b4646e383c5de5962afb49adbb4eb20ac6b58bef17c64c5a7c7e80d731178600";
export const originalFilter = "n.tables.filter(a=>!PT.has(ao(a.schema)))";
const replacementFilter = "n.tables.filter(a=>!PT.has(ao(a.schema))&&!isUpgradeMigrationMetadata(a))";
const header = "#!/usr/bin/env node\n";

// The published package has no original TypeScript. Keep its distribution
// untouched and attach the readable predicate only at the user-data boundary.
export function patchUpgradeHistory(source) {
  assert.equal(createHash("sha256").update(source).digest("hex"), cliSha256,
    "Refusing to patch an unrecognized Lite CLI");
  assert.equal(source.split(originalFilter).length - 1, 1,
    "Expected exactly one upgrade user-table filter");
  assert.ok(source.startsWith(header), "Unexpected CLI header");
  return source.replace(header,
    `${header}import { isUpgradeMigrationMetadata } from "./upgrade-migration-metadata.js";\n`)
    .replace(originalFilter, replacementFilter);
}
