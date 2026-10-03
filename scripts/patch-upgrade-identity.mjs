import assert from "node:assert/strict";
import { createHash } from "node:crypto";

export const cliSha256 = "b4646e383c5de5962afb49adbb4eb20ac6b58bef17c64c5a7c7e80d731178600";
const seams = [
  ["is_generated, generation_expression, ordinal_position", "is_generated, generation_expression, ordinal_position, is_identity, identity_generation, identity_start, identity_increment, identity_minimum, identity_maximum, identity_cycle"],
  ['e.is_generated==="ALWAYS"&&e.generation_expression?n.push(`GENERATED ALWAYS AS (${e.generation_expression}) STORED`)', 'e.is_identity==="YES"?n.push(identityDefinition(e)):e.is_generated==="ALWAYS"&&e.generation_expression?n.push(`GENERATED ALWAYS AS (${e.generation_expression}) STORED`)'],
  ["vh(e.sql,no()).then(async r=>(await ah(r)).schema)", "vh(e.sql,no()).then(async r=>preserveUpgradeIdentities(await ah(r)))"],
  ['}) VALUES (${$.join(", ")}) ON CONFLICT DO NOTHING`);', '})${identityOverride(f,u)} VALUES (${$.join(", ")}) ON CONFLICT DO NOTHING`);'],
  [".map(x=>LT(l,a.name,x.name))", ".map(x=>upgradeSequenceReset(l,a.name,x.name,u?.get(x.name),LT))"],
];

// The original source is not published. Keep the distribution immutable and
// bridge these exact seams to readable TypeScript instead of rewriting a bundle.
export function patchUpgradeIdentity(source) {
  assert.equal(createHash("sha256").update(source).digest("hex"), cliSha256,
    "Refusing to patch an unrecognized Lite CLI");
  const header = "#!/usr/bin/env node\n";
  assert.ok(source.startsWith(header), "Unexpected CLI header");
  for (const [before, after] of seams) {
    assert.equal(source.split(before).length - 1, 1, `Expected exactly one identity seam: ${before}`);
    source = source.replace(before, after);
  }
  return source.replace(header, `${header}import { identityDefinition, preserveUpgradeIdentities, identityOverride, upgradeSequenceReset } from "./upgrade-identity.js";\n`);
}
