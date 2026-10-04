import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { patchStreaming } from "../../scripts/patch-streaming.mjs";
export async function upgradeApi(flavor = "streaming") {
  const root = new URL(`../../.generated/${flavor}/node_modules/@supabase/lite/`, import.meta.url);
  const source = await readFile(new URL("dist/cli/index.js", root), "utf8");
  const original = await readFile(new URL("../../upstream/lite-0.11.0/dist/cli/index.js", import.meta.url), "utf8");
  assert.equal(source, flavor === "baseline" ? original : patchStreaming(original));
  const entry = 'process.on("unhandledRejection",e=>{if(!Rn(e))throw e});process.on("uncaughtException",e=>{Rn(e)||(console.error(e),$n(true,e).finally(()=>process.exit(1)));});NC().then(null).catch(async e=>{Rn(e)||(console.error(e),await $n(true,e),process.exitCode=1);});';
  assert.equal(source.split(entry).length - 1, 1);
  const bridge = new URL("dist/cli/test-upgrade-api.js", root);
  await writeFile(bridge, source.replace(entry,
    "oo();Rc();Dh();Xh();Ah();Hh();\nexport { co as exportUserData, Oh as formatSqlValue, Ch as readiness, Oc as audit, Ih as rehearsal, Lc as apply, Ph as schema, xh as validateRows };"));
  return import(bridge);
}
export function migration(sql) {
  const filename = "20260101000000_application.sql";
  const parts = sql.split(";").map(value => value.trim()).filter(Boolean);
  return { sql, files: [{ filename, sql }], statements: parts.map((sql, i) => ({ file: filename, index: i + 1, total: parts.length, sql })) };
}
export async function materialize(tables) {
  const output = [];
  for (const table of tables) {
    const inserts = [];
    for await (const sql of table.inserts) inserts.push(sql);
    output.push({ ...table, inserts });
  }
  return output;
}
