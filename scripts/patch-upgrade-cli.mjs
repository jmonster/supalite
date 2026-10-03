import assert from "node:assert/strict";
import { createHash } from "node:crypto";

// Exact seam in the unmodified @supabase/lite 0.11.0 CLI. All export,
// readiness, audit and PGlite replay implementations remain upstream's.
export const originalBranch = 'if(n){let R=await Oc(i,o);r(JSON.stringify(R,null,2)),R.summary.upgrade_safe||process.exit(1);return}';
const replacementBranch = 'if(n){let R=await runUpgradeDryRun({readiness:()=>Ch(i,o),audit:()=>Oc(i,o),rehearsal:()=>Ih(i,o)});await writeUpgradeDryRunReport(R,process.stdout);R.summary.upgrade_safe||process.exit(1);return}';
export const cliSha256 = "b4646e383c5de5962afb49adbb4eb20ac6b58bef17c64c5a7c7e80d731178600";

export function patchUpgradeCli(source) {
  assert.equal(createHash("sha256").update(source).digest("hex"), cliSha256,
    "Refusing to patch an unrecognized Lite CLI");
  assert.equal(source.split(originalBranch).length - 1, 1,
    "Expected exactly one JSON dry-run branch");
  assert.ok(source.startsWith("#!/usr/bin/env node\n"), "Unexpected CLI header");
  return source.replace("#!/usr/bin/env node\n", '#!/usr/bin/env node\nimport { runUpgradeDryRun, writeUpgradeDryRunReport } from "./upgrade-dry-run.js";\n')
    .replace(originalBranch, replacementBranch);
}
