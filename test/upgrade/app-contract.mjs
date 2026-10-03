import assert from "node:assert/strict";

export const accounts = [
  { email: "alice@example.test", password: "Fixture-only-password-44!" },
  { email: "bob@example.test", password: "Fixture-only-password-55!" },
];
export const payloads = [
  { label: "Alice's café 雪", active: true, tags: ["red", "blue"], nested: { score: 4, missing: null } },
  { label: "Bob's record", active: false, tags: [], nested: { score: 0, missing: null } },
];
export function success(result, label) {
  assert.equal(result.error, null, `${label}: ${JSON.stringify(result.error)}`);
  return result.data;
}

/** The same fresh-login SDK contract is used for Lite and a real upgraded API. */
export async function runAppContract(newClient, state) {
  const clients = accounts.map(() => newClient());
  const anonymous = newClient();
  for (let i = 0; i < accounts.length; i++) {
    const login = success(await clients[i].auth.signInWithPassword(accounts[i]), "fresh password sign-in");
    assert.equal(login.user.id, state.users[i].id);
    assert.equal(login.user.email, accounts[i].email);
    const user = success(await clients[i].auth.getUser(), "get current user").user;
    assert.equal(user.id, state.users[i].id);
    assert.ok(user.identities.some((identity) => identity.provider === "email" && identity.identity_id === state.users[i].identityId));
    const projects = success(await clients[i].from("z_projects").select("id,owner_id,name").order("id"), "owner projects");
    assert.deepEqual(projects, [state.projects[i]]);
    const records = success(await clients[i].from("a_records").select("id,project_id,owner_id,title,payload").order("id"), "owner records");
    assert.deepEqual(records, [state.records[i]]);
  }
  for (const table of ["z_projects", "a_records"]) {
    assert.deepEqual(success(await anonymous.from(table).select("id"), "anonymous isolation"), []);
  }
  const alice = clients[0];
  const bobRecord = state.records[1];
  assert.deepEqual(success(await alice.from("a_records").select("id").eq("id", bobRecord.id), "other owner's record"), []);
  assert.deepEqual(success(await alice.from("a_records").update({ title: "not permitted" }).eq("id", bobRecord.id).select("id"), "cross-owner update"), []);
  assert.deepEqual(success(await alice.from("a_records").delete().eq("id", bobRecord.id).select("id"), "cross-owner delete"), []);
  assert.deepEqual(success(await clients[1].from("a_records").select("id,project_id,owner_id,title,payload").single(), "other owner unchanged"), bobRecord);

  const project = success(await alice.from("z_projects").insert({ owner_id: state.users[0].id, name: "Generated project" }).select("id").single(), "generated project ID");
  assert.ok(project.id > Math.max(...state.projects.map((row) => row.id)));
  const record = success(await alice.from("a_records").insert({ project_id: project.id, owner_id: state.users[0].id, title: "Generated record", payload: payloads[0] }).select("id,payload").single(), "generated record ID");
  assert.ok(record.id > Math.max(...state.records.map((row) => row.id)));
  assert.deepEqual(record.payload, payloads[0]);
  const forbidden = await alice.from("a_records").insert({ project_id: state.projects[1].id, owner_id: state.users[1].id, title: "Forbidden", payload: {} });
  assert.equal(forbidden.error?.code, "42501", `RLS must reject writing another owner's row: ${JSON.stringify(forbidden.error)}`);
  const orphan = await alice.from("a_records").insert({ project_id: 999999, owner_id: state.users[0].id, title: "Orphan", payload: {} });
  assert.ok(orphan.error?.code === "23503" ||
    (orphan.error?.code === "SUP" && /FOREIGN KEY constraint failed/.test(orphan.error.message)),
    `foreign key must reject an unknown project: ${JSON.stringify(orphan.error)}`);
  const update = { ...payloads[0], active: false, nested: { score: 8, missing: null } };
  assert.deepEqual(success(await alice.from("a_records").update({ payload: update }).eq("id", record.id).select("payload").single(), "own JSONB update").payload, update);
  success(await alice.from("a_records").delete().eq("id", record.id), "own record delete");
  success(await alice.from("z_projects").delete().eq("id", project.id), "own project delete");
  for (const client of clients) success(await client.auth.signOut(), "sign out");
}
