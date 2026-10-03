import assert from "node:assert/strict";
import { createHash } from "node:crypto";

export const cliSha256 = "b4646e383c5de5962afb49adbb4eb20ac6b58bef17c64c5a7c7e80d731178600";
export const originalFallback = 'return e instanceof Date?Pn(e.toISOString()):typeof e=="object"?`${Pn(JSON.stringify(e))}::jsonb`:Pn(String(e))';
const header = "#!/usr/bin/env node\n";

// Preserve the published distribution. Insert the readable binary formatter
// after upstream's typed JSON handling and before its generic object fallback.
export function patchUpgradeBinary(source) {
  assert.equal(createHash("sha256").update(source).digest("hex"), cliSha256,
    "Refusing to patch an unrecognized Lite CLI");
  assert.equal(source.split(originalFallback).length - 1, 1,
    "Expected exactly one upgrade value fallback");
  assert.ok(source.startsWith(header), "Unexpected CLI header");
  return source.replace(header,
    `${header}import { formatBinaryValue } from "./upgrade-binary-value.js";\n`)
    .replace(originalFallback,
      `let binary=formatBinaryValue(e);if(binary!==undefined)return binary;${originalFallback}`);
}
