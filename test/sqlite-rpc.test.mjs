import test from "node:test";
import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";
import { createHarness as baseHarness } from "./helpers/lite.mjs";
import {
  SqliteConnection,
  splitSqlStatements,
} from "../upstream/lite-0.11.0/dist/index.js";

// Use the same imperative DDL path as Lite's ordered application migrations.
async function createHarness({ ddl, ...options } = {}) {
  const harness = await baseHarness(options);
  if (ddl) {
    const translated = await harness.connection.translateDdl(
      [harness.connection.config.baseSchema, ddl].filter(Boolean).join("\n"),
      { strict: true },
    );
    await harness.connection.transaction(splitSqlStatements(translated.ddl), {
      intent: "migration",
    });
    harness.connection.updateDeparseInfo(
      SqliteConnection.parseDeparseInfo(translated, { strict: true }),
    );
  }
  return harness;
}
const auth = {
  enabled: true,
  jwt_secret: "rpc-fixture-only-secret-123",
  publishable_key: "test-only-key",
  secret_key: "sb_secret_fixtureonly",
  email: { enable_confirmations: false },
};
const ddl = `
create table public.counters(id text primary key, owner_id uuid not null default auth.uid() references auth.users(id), value integer not null default 0 check(value>=0), enabled boolean not null default true, document jsonb not null default '{}');
alter table public.counters enable row level security;
create policy own_counter on public.counters for all to authenticated using(owner_id=auth.uid()) with check(owner_id=auth.uid());
create table public.events(id text primary key, counter_id text not null references public.counters(id), owner_id uuid not null references auth.users(id));
alter table public.events enable row level security;
create policy own_event on public.events for all to authenticated using(owner_id=auth.uid()) with check(owner_id=auth.uid());
create function public.echo(value text default 'default') returns text language sql immutable as $$ select $1 $$;
create function public.empty_defaults(empty text default '', zero integer default 0, disabled boolean default false) returns jsonb language sql immutable as $$ select jsonb_build_object('empty',$1,'zero',$2,'disabled',$3) $$;
create function public.list_counters() returns setof public.counters language sql stable security definer set search_path='' as $$ select c.* from public.counters c where c.owner_id=auth.uid() $$;
create function public.context_value() returns jsonb language sql stable as $$ select jsonb_build_object('uid',auth.uid(),'role',auth.role(),'jwt',auth.jwt()) $$;
create function public.apply_delta(counter_id text, event_id text, delta integer default 1) returns jsonb language sql security definer set search_path='' as $$
 select c.id from public.counters c where c.id=$1 and c.owner_id=auth.uid() for update;
 insert into public.events(id,counter_id,owner_id) select $2,c.id,auth.uid() from public.counters c where c.id=$1 and c.owner_id=auth.uid();
 update public.counters c set value=c.value+$3 where c.id=$1 and c.owner_id=auth.uid();
 select jsonb_build_object('id',c.id,'value',c.value,'enabled',c.enabled,'document',c.document) from public.counters c where c.id=$1 and c.owner_id=auth.uid();
$$;
revoke all on function public.apply_delta(text,text,integer) from public;
grant execute on function public.apply_delta(text,text,integer) to authenticated;
create function public.admin_value(counter_id text) returns integer language sql stable security definer set search_path='' as $$ select c.value from public.counters c where c.id=$1 $$;
revoke all on function public.admin_value(text) from public;
grant execute on function public.admin_value(text) to service_role;
create function public.guard_identity() returns trigger language plpgsql as $$ begin
 if new.id is distinct from old.id then raise exception 'Immutable counter identity' using errcode='23514'; end if;
 return new;
end; $$;
create trigger guard_identity before update on public.counters for each row execute function public.guard_identity();
`;
const ok = (result) => {
  assert.equal(result.error, null, JSON.stringify(result.error));
  return result.data;
};
const clientFor = (app, key = auth.publishable_key) =>
  createClient("http://localhost", key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (url, options) => app.fetch(new Request(url, options)) },
  });
for (const backend of ["node", "libsql"]) {
  test(`${backend}: bound SQL RPCs, grants, claims, concurrency and transaction rollback`, async (t) => {
    const h = await createHarness({ backend, auth, ddl });
    t.after(h.close);
    const a = h.client,
      b = clientFor(h.app),
      anon = clientFor(h.app),
      admin = clientFor(h.app, auth.secret_key);
    const signed = ok(
      await a.auth.signUp({
        email: "alice-rpc@example.test",
        password: "Fixture-only-password-9!",
      }),
    );
    ok(
      await b.auth.signUp({
        email: "bob-rpc@example.test",
        password: "Fixture-only-password-9!",
      }),
    );
    ok(
      await a
        .from("counters")
        .insert({
          id: "alice",
          value: 0,
          document: { nested: [true, { value: 7 }] },
        }),
    );
    assert.equal(ok(await a.rpc("echo")), "default");
    assert.deepEqual(ok(await a.rpc("empty_defaults")), {
      empty: "",
      zero: 0,
      disabled: false,
    });
    assert.equal(ok(await a.rpc("list_counters")).length, 1);
    assert.equal(ok(await a.rpc("list_counters").single()).id, "alice");
    assert.equal(
      (await b.rpc("list_counters").single()).error?.code,
      "PGRST116",
    );
    const injection = "'); delete from counters; --";
    assert.equal(
      ok(await a.rpc("echo", { value: injection }, { get: true })),
      injection,
    );
    const claims = ok(await a.rpc("context_value"));
    assert.equal(claims.uid, signed.user.id);
    assert.equal(claims.role, "authenticated");
    assert.equal(claims.jwt.sub, signed.user.id);
    assert.equal(
      (await anon.rpc("apply_delta", { counter_id: "alice", event_id: "anon" }))
        .error?.code,
      "42501",
    );
    assert.equal(
      ok(
        await b.rpc("apply_delta", {
          counter_id: "alice",
          event_id: "foreign",
        }),
      ),
      null,
    );
    const applied = ok(
      await a.rpc("apply_delta", { counter_id: "alice", event_id: "first" }),
    );
    assert.deepEqual(applied, {
      id: "alice",
      value: 1,
      enabled: true,
      document: { nested: [true, { value: 7 }] },
    });
    const failed = await a.rpc("apply_delta", {
      counter_id: "alice",
      event_id: "rollback",
      delta: -2,
    });
    assert.equal(failed.error?.code, "23514");
    assert.equal(ok(await a.from("counters").select().single()).value, 1);
    assert.deepEqual(ok(await a.from("events").select("id")), [
      { id: "first" },
    ]);
    assert.equal(
      (await a.from("counters").update({ id: "changed" }).eq("id", "alice"))
        .error?.code,
      "23514",
    );
    (
      await Promise.all(
        Array.from({ length: 12 }, (_, index) =>
          a.rpc("apply_delta", {
            counter_id: "alice",
            event_id: `parallel-${index}`,
          }),
        ),
      )
    ).forEach(ok);
    assert.equal(ok(await a.from("counters").select().single()).value, 13);
    assert.equal(
      (await a.rpc("admin_value", { counter_id: "alice" })).error?.code,
      "42501",
    );
    assert.equal(
      ok(await admin.rpc("admin_value", { counter_id: "alice" })),
      13,
    );
    assert.equal(
      (
        await a.rpc(
          "apply_delta",
          { counter_id: "alice", event_id: "get" },
          { get: true },
        )
      ).error?.code,
      "25006",
    );
    assert.ok(
      (
        await a.rpc("apply_delta", {
          counter_id: "alice",
          event_id: "bad-int",
          delta: "bogus",
        })
      ).error,
    );
    const rollback = await h.app.fetch(
      new Request("http://localhost/rest/v1/rpc/apply_delta", {
        method: "POST",
        headers: {
          apikey: auth.publishable_key,
          Authorization: `Bearer ${signed.session.access_token}`,
          "Content-Type": "application/json",
          Prefer: "tx=rollback",
        },
        body: JSON.stringify({ counter_id: "alice", event_id: "preference" }),
      }),
    );
    assert.equal(rollback.status, 200);
    assert.equal(rollback.headers.get("Preference-Applied"), "tx=rollback");
    assert.equal((await rollback.json()).value, 14);
    assert.equal(ok(await a.from("counters").select().single()).value, 13);
    const persisted = SqliteConnection.serializeDeparseInfo(
      h.connection.config.translation.deparse,
    );
    h.connection.updateDeparseInfo(
      SqliteConnection.parseDeparseInfo(JSON.parse(JSON.stringify(persisted)), {
        strict: true,
      }),
    );
    await h.connection.clearSchemaCache();
    assert.equal(
      ok(await admin.rpc("admin_value", { counter_id: "alice" })),
      13,
    );
  });
  test(`${backend}: JSON recordsets reconcile in SQL and preserve null/boolean/JSON values`, async (t) => {
    const h = await createHarness({
      backend,
      ddl: `create table docs(id text primary key,flag boolean,document jsonb); create function public.replace_docs(rows jsonb) returns void language sql security definer set search_path='' as $$ delete from public.docs; insert into public.docs(id,flag,document) select d.id,d.flag,d.document from jsonb_to_recordset($1) as d(id text,flag boolean,document jsonb) $$;`,
    });
    t.after(h.close);
    ok(
      await h.client.rpc("replace_docs", {
        rows: [
          { id: "one", flag: false, document: { enabled: true } },
          { id: "two", flag: true, document: null },
        ],
      }),
    );
    assert.deepEqual(ok(await h.client.from("docs").select().order("id")), [
      { id: "one", flag: false, document: { enabled: true } },
      { id: "two", flag: true, document: null },
    ]);
    const schemaSql = `create schema audit; create table audit.entries(id text primary key, tag text not null default ''); create unique index nonempty_tag on audit.entries(tag) where tag <> ''; create function public.add_entry(entry_id text,entry_tag text default '') returns text language sql security definer set search_path='' as $$ insert into audit.entries(id,tag) values($1,$2); update audit.entries set tag=$2 where audit.entries.id=$1; select audit.entries.id from audit.entries where audit.entries.id=$1 $$;`;
    const translated = await h.connection.translateDdl(schemaSql, {
      strict: true,
    });
    await h.connection.transaction(splitSqlStatements(translated.ddl), {
      intent: "migration",
    });
    const metadata = SqliteConnection.parseDeparseInfo(translated, {
      strict: true,
    });
    metadata.functions = [
      ...h.connection.config.translation.deparse.functions,
      ...metadata.functions,
    ];
    h.connection.updateDeparseInfo(metadata);
    assert.equal(
      ok(await h.client.rpc("add_entry", { entry_id: "first" })),
      "first",
    );
    assert.equal(
      ok(await h.client.rpc("add_entry", { entry_id: "second" })),
      "second",
    );
    assert.equal(
      ok(
        await h.client.rpc("add_entry", {
          entry_id: "third",
          entry_tag: "unique",
        }),
      ),
      "third",
    );
    assert.equal(
      (
        await h.client.rpc("add_entry", {
          entry_id: "fourth",
          entry_tag: "unique",
        })
      ).error?.code,
      "23505",
    );
    const failure = await h.client.rpc("replace_docs", {
      rows: [{ id: "duplicate" }, { id: "duplicate" }],
    });
    assert.equal(failure.error?.code, "23505");
    assert.equal(ok(await h.client.from("docs").select()).length, 2);
  });
  test(`${backend}: definitions reject unsafe invoker access and unsupported PL/pgSQL`, async (t) => {
    const h = await createHarness({ backend });
    t.after(h.close);
    const lifecycle = await h.connection.translateDdl(
      "create function public.lifecycle(value text) returns text language sql as $$select $1$$; revoke all on function public.lifecycle(text) from public; create or replace function public.lifecycle(value text) returns text language sql as $$select upper($1)$$",
    );
    assert.deepEqual(
      lifecycle.functions.find((fn) => fn.name === "lifecycle").grants,
      [],
    );
    const dropped = await h.connection.translateDdl(
      "create function public.lifecycle(value text) returns text language sql as $$select $1$$; drop function public.lifecycle(text); drop function if exists public.missing(text)",
    );
    assert.equal(dropped.functions.length, 0);
    await assert.rejects(
      h.connection.translateDdl(
        "create function public.unnamed(text) returns text language sql as $$select $1$$",
      ),
      /must be named/,
    );
    await assert.rejects(
      h.connection.translateDdl(
        "create function public.duplicate(value text) returns text language sql as $$select $1$$; create function public.duplicate(value text) returns text language sql as $$select $1$$",
      ),
      /already exists/,
    );
    await assert.rejects(
      h.connection.translateDdl(
        "create table x(id int); create function public.unsafe() returns integer language sql as $$ select id from public.x $$",
      ),
      /SECURITY DEFINER/,
    );
    await assert.rejects(
      h.connection.translateDdl(
        "create function public.unsafe() returns integer language sql security definer as $$ select 1 $$",
      ),
      /search_path/,
    );
    await assert.rejects(
      h.connection.translateDdl(
        "create function public.unsafe() returns integer language plpgsql as $$ begin return 1; end $$",
      ),
      /LANGUAGE sql/,
    );
    await assert.rejects(
      h.connection.translateDdl(
        "create function public.guard() returns trigger language plpgsql as $$ begin if new.id=1 then return new; else return old; end if; end $$",
      ),
      /RAISE/,
    );
  });
}
