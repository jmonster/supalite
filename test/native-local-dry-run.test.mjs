import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, readFile, writeFile, access, symlink } from "node:fs/promises";
import { join } from "node:path";
import { fixture, run, jsonResult, worker } from "./helpers/upgrade.mjs";

test("public native JSON dry run includes Functions without changing source or creating a target", async t => {
  const source = await fixture(t);
  const directory = join(source, "supabase/functions/tasks");
  await mkdir(directory, { recursive: true });
  const code = 'export default { fetch: () => new Response("portable") };\n';
  await writeFile(join(directory, "index.ts"), code);
  await writeFile(join(directory, "deno.json"), '{"imports":{"@supabase/supabase-js":"npm:@supabase/supabase-js@2.117.2"}}\n');
  await writeFile(join(source, "supabase/functions/.env"), "OMITTED_FIXTURE_SECRET=fixture\n");
  const configBefore = await readFile(join(source, "supabase/config.toml"), "utf8");
  const before = await worker(source, "snapshot");
  const target = `${source}-native-target`;
  const result = jsonResult(await run(source, ["upgrade", "--target", "local", "--local-runtime", "native", "--local-dir", target, "--dry-run", "--json", "--no-migrate-sessions"]));
  assert.equal(result.summary.upgrade_safe, true);
  assert.equal(result.readiness.ok, true);
  assert.equal(result.rehearsal.ok, true);
  assert.deepEqual(result.functions, { enabled: true, names: ["tasks"], files: 2, omitted: ["functions/.env"] });
  assert.equal(await readFile(join(directory, "index.ts"), "utf8"), code);
  assert.equal(await readFile(join(source, "supabase/config.toml"), "utf8"), configBefore);
  assert.equal(await worker(source, "snapshot"), before);
  await assert.rejects(access(target), { code: "ENOENT" });
});


test("unsupported native Functions source produces structured readiness failure", async t => {
  const source = await fixture(t), directory = join(source, "supabase/functions");
  await mkdir(directory, { recursive: true });
  await symlink(join(source, "supabase/config.toml"), join(directory, "external.ts"));
  const before = await worker(source, "snapshot"), target = `${source}-native-target`;
  const result = jsonResult(await run(source, ["upgrade", "--target", "local", "--local-runtime", "native", "--local-dir", target, "--dry-run", "--json", "--no-migrate-sessions"]), 1);
  assert.equal(result.summary.upgrade_safe, false);
  assert.equal(result.rehearsal, null);
  assert.equal(result.errors[0].phase, "readiness");
  assert.match(result.errors[0].message, /symlink is unsupported/);
  assert.equal(await worker(source, "snapshot"), before);
  await assert.rejects(access(target), { code: "ENOENT" });
});
