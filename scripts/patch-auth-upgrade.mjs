import assert from "node:assert/strict";
import { createHash } from "node:crypto";

export const cliSha256 = "b4646e383c5de5962afb49adbb4eb20ac6b58bef17c64c5a7c7e80d731178600";
export const authUserBranch = 'if(n==="supabase"&&o==="users"){let y=h.confirmed_at;';
export function patchAuthUpgrade(source) {
  assert.equal(createHash("sha256").update(source).digest("hex"), cliSha256,
    "Refusing to patch an unrecognized Lite CLI");
  assert.equal(source.split(authUserBranch).length - 1, 1,
    "Expected exactly one Supabase auth.users export branch");
  assert.ok(source.startsWith("#!/usr/bin/env node\n"));
  return source.replace("#!/usr/bin/env node\n", '#!/usr/bin/env node\nimport { normalizeSupabaseAuthUser } from "./upgrade-auth-users.js";\n')
    .replace(authUserBranch, 'if(n==="supabase"&&o==="users"){h=normalizeSupabaseAuthUser(h);let y=h.confirmed_at;');
}
