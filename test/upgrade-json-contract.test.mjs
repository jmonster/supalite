import test from "node:test";
import assert from "node:assert/strict";
import { readFile, writeFile, rm, access } from "node:fs/promises";
import { DatabaseSync } from "node:sqlite";
import { resolve } from "node:path";
import { appliedFile, dryRun, fixture, jsonResult, run, worker } from "./helpers/upgrade.mjs";

const pendingFile = "supabase/migrations/20260102000000_pending.sql";
async function snapshot(project) {
  return (await worker(project, "snapshot")).match(/SNAPSHOT:([a-f0-9]+)/)[1];
}

test("real CLI JSON dry-run rehearses fixture auth, FK-ordered data and sequence SQL without mutating source or creating a target", async (t) => {
  const project = await fixture(t);
  const config = await readFile(resolve(project, "supabase/config.toml"), "utf8");
  const before = await snapshot(project);
  const target = resolve(project, "must-not-exist");
  const report = jsonResult(await run(project, ["upgrade", "--target", "local", "--local-dir", target, "--dry-run", "--json", "--no-migrate-sessions"]));
  assert.equal(report.summary.upgrade_safe, true);
  assert.equal(report.readiness.ok, true);
  assert.deepEqual(report.readiness.auth, { users: 2, sessions: 0, refresh_tokens: 0, identities: 2, jwt_secret_set: true });
  assert.equal(report.rehearsal.ok, true);
  assert.equal(report.rehearsal.schemaStatements, 9);
  assert.equal(report.rehearsal.authInserts, 4);
  assert.equal(report.rehearsal.dataInserts, 4);
  assert.deepEqual(report.rehearsal.failures, []);
  assert.deepEqual(report.errors, []);
  assert.equal(report.results.find((field) => field.field === "public.a_records.payload").rows_checked, 2);
  assert.equal(await snapshot(project), before);
  assert.equal(await readFile(resolve(project, "supabase/config.toml"), "utf8"), config);
  await assert.rejects(access(target), { code: "ENOENT" });
  await assert.rejects(access(resolve(project, "supabase/config.toml.bak")), { code: "ENOENT" });
});

test("same source returns false/nonzero when otherwise-valid data cannot replay", async (t) => {
  const project = await fixture(t);
  await writeFile(resolve(project, pendingFile), "ALTER TABLE public.z_projects ADD CONSTRAINT name_too_long CHECK (length(name) > 100);\n");
  const before = await snapshot(project);
  const report = jsonResult(await dryRun(project), 1);
  assert.equal(report.summary.upgrade_safe, false);
  assert.equal(report.summary.failed, 0, "storage audit succeeds for this fixture");
  assert.equal(report.readiness.ok, true);
  assert.equal(report.rehearsal.ok, false);
  assert.ok(report.rehearsal.failures.some((failure) => failure.phase === "data" && /name_too_long/.test(failure.error)));
  assert.equal(await snapshot(project), before);

  // Negative control proves the same pinned distribution falsely accepts it.
  const baseline = jsonResult(await dryRun(project, { flavor: "baseline" }));
  assert.equal(baseline.summary.upgrade_safe, true);
  assert.equal(baseline.rehearsal, undefined);
  const human = await dryRun(project, { json: false, flavor: "baseline" });
  assert.equal(human.code, 1);
  assert.match(human.stdout, /rehearsal failed/);
});

test("normal CLI dry-run output and exit behavior remain identical", async (t) => {
  const project = await fixture(t);
  for (const failing of [false, true]) {
    if (failing) await writeFile(resolve(project, pendingFile), "ALTER TABLE public.z_projects ADD CONSTRAINT bad_name CHECK (length(name) > 100);\n");
    const original = await dryRun(project, { flavor: "baseline", json: false });
    const candidate = await dryRun(project, { flavor: "upgrade", json: false });
    assert.equal(candidate.code, original.code);
    assert.equal(candidate.stdout, original.stdout);
    assert.equal(candidate.stderr, original.stderr);
  }
});

for (const changed of ["edited", "deleted"]) {
  test(`recorded migration history remains authoritative when applied file is ${changed}`, async (t) => {
    const project = await fixture(t);
    if (changed === "edited") await writeFile(resolve(project, appliedFile), "THIS IS NOT VALID POSTGRES;\n");
    else await rm(resolve(project, appliedFile));
    const report = jsonResult(await dryRun(project));
    assert.equal(report.summary.upgrade_safe, true);
    assert.equal(report.rehearsal.schemaStatements, 9);
    assert.equal(report.rehearsal.dataInserts, 4);
  });
}

test("pending files replay after recorded history in filename order", async (t) => {
  const project = await fixture(t);
  // Write in reverse order; the constraint requires the earlier function.
  await writeFile(resolve(project, "supabase/migrations/20260103000000_constraint.sql"), "ALTER TABLE public.z_projects ADD CONSTRAINT names_nonempty CHECK (public.upgrade_name_ok(name));\n");
  await writeFile(resolve(project, pendingFile), "CREATE FUNCTION public.upgrade_name_ok(text) RETURNS boolean LANGUAGE sql IMMUTABLE AS $$ SELECT length($1) > 0 $$;\n");
  const before = await snapshot(project);
  const report = jsonResult(await dryRun(project));
  assert.equal(report.rehearsal.schemaStatements, 11);
  assert.equal(report.rehearsal.dataInserts, 4);
  assert.equal(await snapshot(project), before);
});

test("schema inspection error produces parseable JSON, a phase diagnostic and failure exit", async (t) => {
  const project = await fixture(t);
  await writeFile(resolve(project, pendingFile), "CREATE TABLE public.broken (id integer DEFAULT no_such_upgrade_function());\n");
  const report = jsonResult(await dryRun(project), 1);
  assert.equal(report.summary.upgrade_safe, false);
  assert.equal(report.rehearsal, null);
  assert.equal(report.errors[0].phase, "audit");
  assert.match(report.errors[0].message, /no_such_upgrade_function/);
});

test("unsafe at-rest JSONB stops before replay with original audit field diagnostics", async (t) => {
  const project = await fixture(t);
  const db = new DatabaseSync(resolve(project, "supabase/fixture.db"));
  try {
    // Deliberate corruption is scoped to this disposable test connection.
    db.exec("PRAGMA ignore_check_constraints = ON");
    db.exec("UPDATE a_records SET payload = 'not valid json' WHERE id = 1000");
    assert.equal(db.prepare("SELECT payload FROM a_records WHERE id = 1000").get().payload, "not valid json");
  } finally { db.close(); }
  const before = await snapshot(project);
  const report = jsonResult(await dryRun(project), 1);
  assert.equal(report.summary.upgrade_safe, false);
  assert.equal(report.summary.failed, 1);
  assert.equal(report.rehearsal, null);
  assert.equal(report.results.find((field) => field.field === "public.a_records.payload").status, "fail");
  assert.equal(await snapshot(project), before);
});

test("large replay failure flushes a complete JSON document before exiting", async (t) => {
  const project = await fixture(t);
  const state = JSON.parse(await readFile(resolve(project, "fixture-state.json"), "utf8"));
  const db = new DatabaseSync(resolve(project, "supabase/fixture.db"));
  try {
    db.exec("PRAGMA foreign_keys = ON");
    const insert = db.prepare("INSERT INTO a_records(id, project_id, owner_id, title, payload) VALUES (?, ?, ?, ?, ?)");
    for (let id = 10000; id < 10600; id++) {
      insert.run(id, state.projects[0].id, state.users[0].id, "title ".repeat(50), JSON.stringify({ text: "value ".repeat(50) }));
    }
  } finally { db.close(); }
  await writeFile(resolve(project, pendingFile), "ALTER TABLE public.a_records ADD CONSTRAINT rejected_titles CHECK (title = 'never');\n");
  const result = await dryRun(project);
  assert.ok(Buffer.byteLength(result.stdout) > 512 * 1024, "exercise pipe backpressure beyond a small report");
  const report = jsonResult(result, 1);
  assert.equal(report.summary.upgrade_safe, false);
  assert.equal(report.rehearsal.failures.length, 602);
  assert.deepEqual(report.errors, []);
});
