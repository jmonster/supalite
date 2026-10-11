import test from "node:test";
import assert from "node:assert/strict";
import { parse } from "libpg-query";
import { reconstructSchema } from "../upstream/lite-0.11.0/dist/cli/index.js";
test("upgrade reconstruction preserves reserved and mixed-case SQL identifiers", async () => {
  const ddl = await reconstructSchema(
    'CREATE TABLE public.owned (id text PRIMARY KEY, "user" uuid NOT NULL, "order" integer, "MixedCase" text);',
  );
  assert.match(ddl, /"user" uuid NOT NULL/);
  assert.match(ddl, /"order" integer/);
  assert.match(ddl, /"MixedCase" text/);
  await parse(ddl);
});
