import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { patchUpgradeIdentity } from "../../scripts/patch-upgrade-identity.mjs";

// Expose only the shipped exporter/schema readers for local execution. No auth,
// network, remote upgrade runner, or CLI output is stubbed or replaced.
export async function exporter(flavor = "upgrade-identity") {
  const root = new URL(`../../.generated/${flavor}/node_modules/@supabase/lite/dist/cli/`, import.meta.url);
  const original = await readFile(new URL("../../upstream/lite-0.11.0/dist/cli/index.js", import.meta.url), "utf8");
  const source = await readFile(new URL("index.js", root), "utf8");
  assert.equal(source, flavor === "baseline" ? original : patchUpgradeIdentity(original));
  const entry = 'process.on("unhandledRejection",e=>{if(!Rn(e))throw e});process.on("uncaughtException",e=>{Rn(e)||(console.error(e),$n(true,e).finally(()=>process.exit(1)));});NC().then(null).catch(async e=>{Rn(e)||(console.error(e),await $n(true,e),process.exitCode=1);});';
  assert.equal(source.split(entry).length - 1, 1);
  const bridge = new URL("test-upgrade-api.js", root);
  await writeFile(bridge, source.replace(entry,
    "oo();Rc(); export { co as exportUserData, vh as reconstructSchema, io as upgradeSchema };"));
  return import(bridge.href);
}

export async function replay(target, groups) {
  for (const group of groups) for (const insert of group.inserts) await target.exec(insert);
  for (const group of groups) for (const reset of group.sequenceResets) await target.exec(reset);
}
