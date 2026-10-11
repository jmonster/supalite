import test from "node:test";
import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";
import { createHarness } from "./helpers/lite.mjs";
import { audit } from "../upstream/lite-0.11.0/dist/cli/index.js";
const ddl =
  "CREATE TABLE public.timestamp_inputs(id integer PRIMARY KEY,stamp timestamp, zoned timestamptz);";
const source = { sql: ddl };
const quote = (value) => "'" + value.replaceAll("'", "''") + "'";
for (const backend of ["node", "libsql"])
  test(`${backend}: timestamp upgrade audit accepts ISO dates and rejects invalid calendars consistently with PostgreSQL`, async (t) => {
    const h = await createHarness({ backend, ddl });
    t.after(h.close);
    const db = new PGlite();
    t.after(() => db.close());
    await db.exec("SET TIME ZONE 'UTC';" + ddl);
    const valid = [
      "2026-10-11",
      "2000-02-29",
      "0001-01-01",
      "0099-12-31",
      "2026-10-11 09:10:11",
      "2026-10-11T09:10:11.123456+05:45",
    ];
    for (const [index, value] of valid.entries()) {
      const sql = `INSERT INTO timestamp_inputs VALUES(${index},${quote(value)},${quote(value)})`;
      await h.connection.exec(sql);
      await db.exec(sql);
    }
    const report = await audit(h.app, source);
    assert.equal(
      report.summary.upgrade_safe,
      true,
      JSON.stringify(report.results),
    );
    assert.equal(
      report.results.find(
        (row) => row.field === "public.timestamp_inputs.stamp",
      ).rows_checked,
      valid.length,
    );
    const invalid = [
      "2023-02-29",
      "1900-02-29",
      "2026-04-31",
      "2026-13-01",
      "0000-01-01",
      "2026-10-11T25:00:00Z",
    ];
    await h.connection.exec("PRAGMA ignore_check_constraints=ON;");
    for (const value of invalid) {
      const sql = `INSERT INTO timestamp_inputs VALUES(100,${quote(value)},${quote(value)})`;
      await assert.rejects(db.exec(sql));
      await h.connection.exec(sql);
      const invalidReport = await audit(h.app, source);
      assert.equal(invalidReport.summary.upgrade_safe, false, value);
      assert.equal(
        invalidReport.results.find(
          (row) => row.field === "public.timestamp_inputs.stamp",
        ).status,
        "fail",
      );
      await h.connection.exec("DELETE FROM timestamp_inputs WHERE id=100");
    }
  });
