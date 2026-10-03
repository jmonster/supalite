import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { normalizeSupabaseAuthUser } from "../../dist/upgrade/auth-users.js";
import { cliSha256, patchAuthUpgrade } from "../../scripts/patch-auth-upgrade.mjs";

/**
 * The distribution has no public auth-export API. Exercise its actual bundled
 * exporter, not a reimplementation: extract its self-contained closure after
 * verifying the entire bundle, then initialize its original constant tables.
 * This test-only loader never writes or imports a modified upstream artifact.
 */
export async function authExporter(flavor = "auth-upgrade") {
  const original = await readFile(new URL("../../upstream/lite-0.11.0/dist/cli/index.js", import.meta.url), "utf8");
  assert.equal(createHash("sha256").update(original).digest("hex"), cliSha256);
  const source = await readFile(new URL(`../../.generated/${flavor}/node_modules/@supabase/lite/dist/cli/index.js`, import.meta.url), "utf8");
  assert.equal(source, flavor === "baseline" ? original : patchAuthUpgrade(original));
  const first = "function xT(";
  const last = "async function vh(";
  assert.equal(source.split(first).length - 1, 1);
  assert.equal(source.split(last).length - 1, 1);
  const start = source.indexOf(first);
  const end = source.indexOf(last);
  assert.ok(end > start);
  const closure = source.slice(start, end);
  return new Function("normalizeSupabaseAuthUser", `const b = (initialize) => initialize; ${closure}; $c(); return ro;`)(normalizeSupabaseAuthUser);
}
