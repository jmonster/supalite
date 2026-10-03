import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runUpgradeDryRun, writeUpgradeDryRunReport } from "../dist/upgrade/dry-run.js";
import { patchUpgradeCli, originalBranch } from "../scripts/patch-upgrade-cli.mjs";

const readiness = { ok: true, errors: [], dbReachable: true };
const audit = { summary: { total: 1, passed: 1, warned: 0, failed: 0, upgrade_safe: true }, results: [{ field: "public.records.payload", status: "pass" }] };
const rehearsal = { ok: true, schemaStatements: 3, authInserts: 4, dataInserts: 4, failures: [] };
function stages(overrides = {}) {
  const calls = [];
  return {
    calls,
    stages: Object.fromEntries(Object.entries({ readiness, audit, rehearsal }).map(([phase, result]) => [phase, async () => {
      calls.push(phase);
      return phase in overrides ? overrides[phase]() : result;
    }])),
  };
}

test("machine-readable dry-run executes all stages and preserves audit fields", async () => {
  const run = stages();
  const report = await runUpgradeDryRun(run.stages);
  assert.deepEqual(run.calls, ["readiness", "audit", "rehearsal"]);
  assert.deepEqual(report, { ...audit, readiness, rehearsal, errors: [] });
  assert.notEqual(report.summary, audit.summary);
});

test("failed readiness stops before audit and rehearsal", async () => {
  const run = stages({ readiness: () => ({ ok: false, errors: ["Database not reachable"] }) });
  const report = await runUpgradeDryRun(run.stages);
  assert.deepEqual(run.calls, ["readiness"]);
  assert.equal(report.summary.upgrade_safe, false);
  assert.equal(report.rehearsal, null);
  assert.deepEqual(report.readiness.errors, ["Database not reachable"]);
});

test("unsafe shim audit stops before rehearsal and retains field diagnostics", async () => {
  const unsafe = { summary: { ...audit.summary, passed: 0, failed: 1, upgrade_safe: false }, results: [{ field: "payload", status: "fail" }] };
  const run = stages({ audit: () => unsafe });
  const report = await runUpgradeDryRun(run.stages);
  assert.deepEqual(run.calls, ["readiness", "audit"]);
  assert.deepEqual(report.summary, unsafe.summary);
  assert.deepEqual(report.results, unsafe.results);
  assert.equal(report.rehearsal, null);
});

for (const phase of ["schema", "auth", "data"]) {
  test(`${phase} replay failure cannot report upgrade_safe`, async () => {
    const failed = { ...rehearsal, ok: false, failures: [{ phase, label: "fixture failure", statement: "SELECT 1", error: "rejected" }] };
    const run = stages({ rehearsal: () => failed });
    const report = await runUpgradeDryRun(run.stages);
    assert.equal(report.summary.upgrade_safe, false);
    assert.equal(report.summary.passed, 1, "audit counts still describe the audit");
    assert.deepEqual(report.rehearsal, failed);
    assert.equal(audit.summary.upgrade_safe, true, "input audit is not mutated");
  });
}
for (const phase of ["readiness", "audit", "rehearsal"]) {
  test(`thrown ${phase} error yields a serializable failure and stops`, async () => {
    const run = stages({ [phase]: () => { throw new Error(`${phase} failure`); } });
    const report = JSON.parse(JSON.stringify(await runUpgradeDryRun(run.stages)));
    assert.equal(report.summary.upgrade_safe, false);
    assert.deepEqual(report.errors, [{ phase, message: `Error: ${phase} failure` }]);
    assert.equal(run.calls.at(-1), phase);
  });
}

test("CLI integration is limited to the exact published JSON branch", async () => {
  const source = await readFile(new URL("../upstream/lite-0.11.0/dist/cli/index.js", import.meta.url), "utf8");
  const patched = patchUpgradeCli(source);
  assert.equal(patched.includes(originalBranch), false);
  assert.equal(patched.split('from "./upgrade-dry-run.js"').length - 1, 1);
  assert.throws(() => patchUpgradeCli(source + "\n"), /unrecognized Lite CLI/);
  assert.throws(() => patchUpgradeCli(patched), /unrecognized Lite CLI/);
});


test("JSON output waits for writable completion and propagates stream errors", async () => {
  const report = await runUpgradeDryRun(stages().stages);
  let complete;
  let resolved = false;
  let json;
  const pending = writeUpgradeDryRunReport(report, { write(text, callback) { json = text; complete = callback; } }).then(() => { resolved = true; });
  await Promise.resolve();
  assert.equal(resolved, false);
  assert.deepEqual(JSON.parse(json), report);
  complete();
  await pending;
  assert.equal(resolved, true);
  await assert.rejects(writeUpgradeDryRunReport(report, { write(text, callback) { callback(new Error("write failed")); } }), /write failed/);
});
