import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { modules } from "./helpers/lite.mjs";

test("supabase-js integration: logic, counts, paths, embedding, mutation filters and direct RLS", async () => {
  const { App, factories } = await modules();
  const createConnection = factories.node;
  const createLibsqlConnection = factories.libsql;
  const secret = "test-only-application-qa-not-a-production-secret";
  const uid = "11111111-1111-4111-8111-111111111111";
  const other = "22222222-2222-4222-8222-222222222222";
  const encoded = [
    { alg: "HS256", typ: "JWT" },
    {
      sub: uid,
      role: "authenticated",
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    },
  ]
    .map((value) => Buffer.from(JSON.stringify(value)).toString("base64url"))
    .join(".");
  const jwt =
    encoded +
    "." +
    createHmac("sha256", secret).update(encoded).digest("base64url");
  const results = [];
  for (const [backend, factory] of [
    ["sqlite", createConnection],
    ["libsql", createLibsqlConnection],
  ]) {
    const connection = factory({ url: ":memory:" });
    const app = new App({
      connection,
      auth: {
        enabled: true,
        jwt_secret: secret,
        email: { enable_confirmations: false },
      },
      options: { server: { admin: false, disableStudio: true } },
    });
    await app.ensureSystemSchema();
    await connection
      .createMigrator(
        `CREATE TABLE folders(id integer PRIMARY KEY,name text);
CREATE TABLE documents(id integer PRIMARY KEY,folder_id integer REFERENCES folders(id),owner_id uuid NOT NULL,body jsonb,tags text[],touched boolean DEFAULT false);
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY self_docs ON documents FOR ALL TO authenticated USING(owner_id=auth.uid()) WITH CHECK(owner_id=auth.uid());`,
      )
      .migrate();
    await connection.kysely
      .insertInto("folders")
      .values([
        { id: 1, name: "Shared" },
        { id: 2, name: "Other" },
      ])
      .execute();
    await connection.kysely
      .insertInto("documents")
      .values([
        {
          id: 1,
          folder_id: 1,
          owner_id: uid,
          body: JSON.stringify({
            profile: { plan: "pro", active: true },
            tags: [{ slug: "red", rank: 1 }],
            active: true,
          }),
          tags: '["red","blue"]',
        },
        {
          id: 2,
          folder_id: 1,
          owner_id: uid,
          body: JSON.stringify({
            profile: { plan: "starter" },
            tags: [{ slug: "blue" }],
            active: false,
          }),
          tags: '["blue"]',
        },
        {
          id: 3,
          folder_id: 2,
          owner_id: other,
          body: JSON.stringify({
            profile: { plan: "pro", active: true },
            active: true,
          }),
          tags: '["blue"]',
        },
        { id: 4, folder_id: 1, owner_id: uid, body: null, tags: "[]" },
        { id: 5, folder_id: 1, owner_id: uid, body: "null", tags: "[]" },
        {
          id: 6,
          folder_id: 1,
          owner_id: uid,
          body: JSON.stringify("not JSON"),
          tags: "[]",
        },
        {
          id: 7,
          folder_id: 1,
          owner_id: uid,
          body: JSON.stringify({
            "quote,key": { value: "it's (fine)" },
            child: "not JSON",
          }),
          tags: "[]",
        },
      ])
      .execute();
    const client = createClient("http://localhost", "test-key", {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        headers: { Authorization: `Bearer ${jwt}` },
        fetch: (url, opts) => app.fetch(new Request(url, opts)),
      },
    });
    async function check(
      name,
      query,
      expected,
      project = (r) => r.data?.map((x) => x.id),
    ) {
      const r = await query;
      const actual = project(r);
      const result = {
        backend,
        name,
        expected,
        actual,
        status: r.status,
        error: r.error,
      };
      try {
        assert.equal(r.error, null);
        assert.deepEqual(actual, expected);
        result.pass = true;
      } catch {
        result.pass = false;
      }
      results.push(result);
    }
    await check(
      "rls_control",
      client.from("documents").select("id").order("id"),
      [1, 2, 4, 5, 6, 7],
    );
    await check(
      "repeated_jsonb_filters_with_direct_rls",
      client
        .from("documents")
        .select("id")
        .contains("body", { active: true })
        .contains("body", { profile: { plan: "pro" } })
        .order("id"),
      [1],
    );
    await check(
      "nested_contains",
      client
        .from("documents")
        .select("id")
        .contains("body", { profile: { plan: "pro" } })
        .order("id"),
      [1],
    );
    await check(
      "negative_null_semantics",
      client
        .from("documents")
        .select("id")
        .not("body", "cs", JSON.stringify({ profile: { plan: "pro" } }))
        .order("id"),
      [2, 5, 6, 7],
    );
    await check(
      "path_object",
      client
        .from("documents")
        .select("id")
        .contains("body->profile", { plan: "pro" })
        .order("id"),
      [1],
    );
    await check(
      "path_boolean",
      client
        .from("documents")
        .select("id")
        .contains("body->active", "true")
        .order("id"),
      [1],
    );
    await check(
      "path_null_missing",
      client
        .from("documents")
        .select("id")
        .contains("body->missing", "null")
        .order("id"),
      [],
    );
    await check(
      "json_null",
      client
        .from("documents")
        .select("id")
        .contains("body", "null")
        .order("id"),
      [5],
    );
    await check(
      "mixed_type_object_filter",
      client.from("documents").select("id").contains("body", {}).order("id"),
      [1, 2, 7],
    );
    await check(
      "mixed_type_object_not",
      client.from("documents").select("id").not("body", "cs", "{}").order("id"),
      [5, 6],
    );
    await check(
      "raw_or_punctuation",
      client
        .from("documents")
        .select("id")
        .or(`body.cs.{"quote,key":{"value":"it's (fine)"}},id.eq.1`)
        .order("id"),
      [1, 7],
    );
    await check(
      "mixed_type_nested_scalar",
      client
        .from("documents")
        .select("id")
        .contains("body", { child: "not JSON" })
        .order("id"),
      [7],
    );
    await check(
      "native_array_unchanged",
      client
        .from("documents")
        .select("id")
        .contains("tags", ["blue"])
        .order("id"),
      [1, 2],
    );
    await check(
      "count_before_limit",
      client
        .from("documents")
        .select("id", { count: "exact", head: true })
        .contains("body", { profile: { plan: "pro" } })
        .limit(1),
      1,
      (r) => r.count,
    );
    await check(
      "logical_or",
      client
        .from("documents")
        .select("id")
        .or('body.cs.{"profile":{"plan":"pro"}},id.eq.2')
        .order("id"),
      [1, 2],
    );
    await check(
      "embed_filter_selected_parent",
      client
        .from("folders")
        .select("id,documents(id,body)")
        .eq("id", 1)
        .contains("documents.body", { profile: { plan: "pro" } })
        .order("id"),
      [{ id: 1, ids: [1] }],
      (r) =>
        r.data?.map((x) => ({ id: x.id, ids: x.documents.map((y) => y.id) })),
    );
    await check(
      "embed_alias_selected_parent",
      client
        .from("folders")
        .select("id,docs:documents(id,body)")
        .eq("id", 1)
        .contains("docs.body", { profile: { plan: "pro" } })
        .order("id"),
      [{ id: 1, ids: [1] }],
      (r) => r.data?.map((x) => ({ id: x.id, ids: x.docs.map((y) => y.id) })),
    );
    await check(
      "mutation_filter",
      client
        .from("documents")
        .update({ touched: true })
        .contains("body", { profile: { plan: "pro" } })
        .select("id"),
      [1],
    );
    const rows = await connection.kysely
      .selectFrom("documents")
      .select(["id", "touched"])
      .orderBy("id")
      .execute();
    results.push({
      backend,
      name: "mutation_rls_integrity",
      expected: [1],
      actual: rows.filter((x) => x.touched).map((x) => x.id),
      pass:
        JSON.stringify(rows.filter((x) => x.touched).map((x) => x.id)) ===
        "[1]",
    });
    await connection.close();
  }
  assert.equal(
    results.filter((result) => !result.pass).length,
    0,
    JSON.stringify(
      results.filter((result) => !result.pass),
      null,
      2,
    ),
  );
});
