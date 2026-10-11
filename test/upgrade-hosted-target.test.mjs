import test from "node:test";
import assert from "node:assert/strict";
import { hostedUpgradeTarget } from "../upstream/lite-0.11.0/dist/cli/upgrade-hosted-target.js";
import { waitForStorage } from "../upstream/lite-0.11.0/dist/cli/upgrade-storage.js";
import { withUpgradeApplicationTriggers } from "../upstream/lite-0.11.0/dist/cli/upgrade-triggers.js";
import { PGlite } from "@electric-sql/pglite";
const ref = "abcdefghijabcdefghij";
const key = (claims) =>
  `e30.${Buffer.from(JSON.stringify(claims)).toString("base64url")}.fixture`;
const origin = `https://${ref}.supabase.co`;
test("hosted Storage binds the exact project HTTPS origin and rejects mismatched keys before SQL or network", async (t) => {
  let requests = 0;
  t.mock.method(globalThis, "fetch", async (url, options) => {
    requests++;
    assert.equal(url, `${origin}/storage/v1/bucket`);
    assert.equal(options.redirect, "error");
    return new Response("[]");
  });
  const api = {
    runSql: () => assert.fail("origin readiness never writes SQL"),
  };
  for (const [url, claims, projectRef] of [
    ["http://" + ref + ".supabase.co", { role: "service_role", ref }, ref],
    ["https://evil.example.test", { role: "service_role", ref }, ref],
    [origin + "/path", { role: "service_role", ref }, ref],
    [origin + "?redirect=1", { role: "service_role", ref }, ref],
    [origin, { role: "service_role", ref: "another-project" }, ref],
    [origin, { role: "service_role", ref, sub: "user" }, ref],
    [origin, { role: "authenticated", ref }, ref],
    [origin, { role: "service_role", ref }, "malformed"],
  ])
    await assert.rejects(
      waitForStorage(hostedUpgradeTarget(api, projectRef, url, key(claims)), 1),
      /Storage upgrade:/,
    );
  assert.equal(requests, 0);
  await waitForStorage(
    hostedUpgradeTarget(api, ref, origin, key({ role: "service_role", ref })),
    1000,
  );
  assert.equal(requests, 1);
});
test("Management API row arrays suppress and restore application provisioning around replay", async (t) => {
  const db = new PGlite();
  t.after(() => db.close());
  await db.exec(`CREATE TABLE public.events(id integer PRIMARY KEY);
    CREATE TABLE public.counter(n integer); INSERT INTO public.counter VALUES(0);
    CREATE FUNCTION public.count_event() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN UPDATE public.counter SET n=n+1; RETURN NEW; END $$;
    CREATE TRIGGER count_event AFTER INSERT ON public.events FOR EACH ROW EXECUTE FUNCTION public.count_event();`);
  const api = {
    runSql: async (projectRef, sql) => {
      assert.equal(projectRef, ref);
      return (await db.exec(sql)).flatMap((result) => result.rows);
    },
    updateAuthConfig: async (projectRef, config) => {
      assert.equal(projectRef, ref);
      assert.equal(config.mailer_autoconfirm, true);
    },
  };
  const target = hostedUpgradeTarget(
    api,
    ref,
    origin,
    key({ role: "service_role", ref }),
  );
  await withUpgradeApplicationTriggers(
    (sql) => target.runSql(sql),
    ["public"],
    async () => {
      await target.runSql("INSERT INTO public.events VALUES(1)");
      assert.equal(
        (await target.runSql("SELECT n FROM public.counter")).rows[0].n,
        0,
      );
    },
  );
  await target.runSql("INSERT INTO public.events VALUES(2)");
  assert.equal(
    (await target.runSql("SELECT n FROM public.counter")).rows[0].n,
    1,
  );
  await target.updateAuthConfig({ mailer_autoconfirm: true });
  await assert.rejects(
    hostedUpgradeTarget(
      { runSql: async () => ({ unexpected: true }) },
      ref,
      origin,
      "",
    ).runSql("SELECT 1"),
    /invalid SQL result/,
  );
});
