import test from "node:test";
import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";
import { withUpgradeApplicationTriggers } from "../upstream/lite-0.11.0/dist/cli/upgrade-triggers.js";
test("stored profile, settings and counters replay exactly; trigger modes and foreign keys survive success and failure", async (t) => {
  const db = new PGlite();
  t.after(() => db.close());
  await db.exec(`CREATE SCHEMA auth;CREATE SCHEMA storage;
 CREATE TABLE auth.users(id text PRIMARY KEY);
 CREATE TABLE public.profile(id text PRIMARY KEY REFERENCES auth.users(id),name text);
 CREATE TABLE public.events(id text PRIMARY KEY,owner text REFERENCES auth.users(id));
 CREATE TABLE public.counts(id text PRIMARY KEY,value integer DEFAULT 0);
 INSERT INTO public.counts VALUES ('count',0);
 CREATE FUNCTION public.provision() RETURNS trigger LANGUAGE plpgsql AS $$BEGIN INSERT INTO public.profile VALUES(NEW.id,'generated');RETURN NEW;END$$;
 CREATE TRIGGER provision AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.provision();
 CREATE FUNCTION public.count_event() RETURNS trigger LANGUAGE plpgsql AS $$BEGIN UPDATE public.counts SET value=value+1 WHERE id='count';RETURN NEW;END$$;
 CREATE TRIGGER count_event AFTER INSERT ON public.events FOR EACH ROW EXECUTE FUNCTION public.count_event();
 ALTER TABLE public.events ENABLE ALWAYS TRIGGER count_event;
 CREATE TABLE storage.platform(id text);
 CREATE FUNCTION storage.platform_guard() RETURNS trigger LANGUAGE plpgsql AS $$BEGIN RAISE EXCEPTION 'platform preserved';END$$;
 CREATE TRIGGER platform_guard BEFORE INSERT ON storage.platform FOR EACH ROW EXECUTE FUNCTION storage.platform_guard();`);
  const query = (sql) => db.exec(sql);
  const definitions = (
    await db.query(
      "SELECT pg_get_functiondef(oid) AS definition FROM pg_proc WHERE proname IN ('provision','count_event') ORDER BY oid",
    )
  ).rows;
  await withUpgradeApplicationTriggers(query, ["public"], async () => {
    await db.exec(
      "INSERT INTO auth.users VALUES('imported');INSERT INTO public.profile VALUES('imported','preserved');INSERT INTO public.events VALUES('event','imported');UPDATE public.counts SET value=7",
    );
    await assert.rejects(
      db.exec("INSERT INTO public.events VALUES('invalid','missing')"),
      (error) => error.code === "23503",
    );
    await assert.rejects(
      db.exec("INSERT INTO storage.platform VALUES('invalid')"),
      /platform preserved/,
    );
  });
  assert.deepEqual((await db.query("SELECT * FROM public.profile")).rows, [
    { id: "imported", name: "preserved" },
  ]);
  assert.equal(
    (await db.query("SELECT value FROM public.counts")).rows[0].value,
    7,
  );
  const modes = await db.query(
    "SELECT tgname,tgenabled FROM pg_trigger WHERE NOT tgisinternal ORDER BY tgname",
  );
  assert.deepEqual(modes.rows, [
    { tgname: "count_event", tgenabled: "A" },
    { tgname: "platform_guard", tgenabled: "O" },
    { tgname: "provision", tgenabled: "O" },
  ]);
  await assert.rejects(
    withUpgradeApplicationTriggers(query, ["public"], async () => {
      throw new Error("import failed");
    }),
    /import failed/,
  );
  assert.deepEqual(
    (
      await db.query(
        "SELECT pg_get_functiondef(oid) AS definition FROM pg_proc WHERE proname IN ('provision','count_event') ORDER BY oid",
      )
    ).rows,
    definitions,
  );
  await db.exec(
    "INSERT INTO auth.users VALUES('new');INSERT INTO public.events VALUES('new-event','new')",
  );
  assert.equal(
    (await db.query("SELECT name FROM public.profile WHERE id='new'")).rows[0]
      .name,
    "generated",
  );
  assert.equal(
    (await db.query("SELECT value FROM public.counts")).rows[0].value,
    8,
  );
});
