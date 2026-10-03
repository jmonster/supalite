import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { patchUpgradeBinary } from "../../scripts/patch-upgrade-binary.mjs";

// Expose the shipped formatter and exporter without invoking the CLI. Verify
// the complete input first; the bridge does not replace any export logic.
export async function upgradeApi(flavor) {
  const packageRoot = new URL(`../../.generated/${flavor}/node_modules/@supabase/lite/`, import.meta.url);
  const source = await readFile(new URL("dist/cli/index.js", packageRoot), "utf8");
  const original = await readFile(new URL("../../upstream/lite-0.11.0/dist/cli/index.js", import.meta.url), "utf8");
  assert.equal(source, flavor === "baseline" ? original : patchUpgradeBinary(original));
  const entry = 'process.on("unhandledRejection",e=>{if(!Rn(e))throw e});process.on("uncaughtException",e=>{Rn(e)||(console.error(e),$n(true,e).finally(()=>process.exit(1)));});NC().then(null).catch(async e=>{Rn(e)||(console.error(e),await $n(true,e),process.exitCode=1);});';
  assert.equal(source.split(entry).length - 1, 1);
  const bridge = new URL("dist/cli/test-upgrade-api.js", packageRoot);
  await writeFile(bridge, source.replace(entry,
    "oo();Rc();Dh();Xh();\nexport { co as exportUserData, Oh as formatSqlValue };"));
  return import(bridge);
}
