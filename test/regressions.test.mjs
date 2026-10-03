import test from "node:test";
import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";
import { fixtures } from "./fixtures/regressions.mjs";
import { createHarness } from "./helpers/lite.mjs";

test("34 selected published-package regressions: before/after through actual supabase-js", async () => {
  const oracle = new PGlite();
  try {
    const expected = await Promise.all(
      fixtures.map(
        async ([, lhs, rhs]) =>
          (
            await oracle.query(
              "select $1::jsonb @> $2::jsonb as contains, $1::jsonb <@ $2::jsonb as contained_by",
              [JSON.stringify(lhs), JSON.stringify(rhs)],
            )
          ).rows[0],
      ),
    );
    for (const flavor of ["baseline", "patched"]) {
      for (const backend of ["node", "libsql", "pglite"]) {
        const h = await createHarness({
          flavor,
          backend,
          ddl: "CREATE TABLE documents(id integer PRIMARY KEY, body jsonb)",
        });
        let mismatches = 0;
        const previousError = console.error;
        if (flavor === "baseline" && backend !== "pglite")
          console.error = () => {};
        try {
          for (const [index, [name, lhs, rhs]] of fixtures.entries()) {
            const inserted = await h.client
              .from("documents")
              .insert({ id: index + 1, body: lhs });
            assert.equal(
              inserted.error,
              null,
              `${flavor}/${backend}: insert ${name}`,
            );
            for (const operation of ["contains", "containedBy"]) {
              const filter =
                Array.isArray(rhs) || rhs === null || typeof rhs !== "object"
                  ? JSON.stringify(rhs)
                  : rhs;
              const result = await h.client
                .from("documents")
                .select("id")
                .eq("id", index + 1)
                [operation]("body", filter);
              const wanted =
                expected[index][
                  operation === "contains" ? "contains" : "contained_by"
                ];
              const mismatch =
                Boolean(result.error) || (result.data.length === 1) !== wanted;
              if (mismatch) mismatches++;
              if (flavor === "patched" || backend === "pglite")
                assert.equal(
                  mismatch,
                  false,
                  `${flavor}/${backend}: ${name}/${operation}: ${JSON.stringify(result)}`,
                );
            }
          }
          assert.equal(
            mismatches,
            flavor === "baseline" && backend !== "pglite" ? 31 : 0,
          );
          console.log(
            `${flavor}/${backend}: ${34 - mismatches}/34 selected cases match PostgreSQL`,
          );
        } finally {
          console.error = previousError;
          await h.close();
        }
      }
    }
  } finally {
    await oracle.close();
  }
});
