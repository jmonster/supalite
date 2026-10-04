import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { createTaskClient } from "./client.mjs";

// The same application checks run before and after graduation. Only URL/key change.
export const attachmentBytes = Buffer.from([0, 1, 127, 128, 255, 13, 10, ...Buffer.from("Task attachment: ship it!\n")]);
const digest = bytes => createHash("sha256").update(bytes).digest("hex");
export const columns = "id,owner_id,title,completed,attachment_path";
export const verificationChecks = ["same-password-signin", "same-user-uuids", "owned-record", "caller-identity", "private-file-bytes", "other-user-read-denied", "other-user-update-denied", "other-user-function-denied", "other-user-file-denied", "forged-owner-denied", "anonymous-function-denied", "function-owned-options"];

export async function exercise({ url, key, phase = "seed", state, password, id = crypto.randomUUID() }) {
  assert.ok(url && key && password, "URL, key and fixture password are required");
  assert.ok(["seed", "verify"].includes(phase), "phase must be seed or verify");
  const owner = createTaskClient(url, key);
  const other = createTaskClient(url, key);
  if (phase === "seed") {
    const ownerEmail = `owner-${id}@example.test`;
    const otherEmail = `other-${id}@example.test`;
    const first = await owner.signUp(ownerEmail, password);
    const second = await other.signUp(otherEmail, password);
    const bucket = await owner.supabase.storage.createBucket("task-attachments", {
      public: false, fileSizeLimit: 1024 * 1024, allowedMimeTypes: ["application/octet-stream"],
    });
    assert.equal(bucket.error, null, JSON.stringify(bucket.error));
    const created = await owner.createTask(id, "Ship a private task without rewriting the app");
    assert.equal(created.owner_id, first.id, "owner_id must come from DEFAULT auth.uid(), not caller-supplied data");
    const completed = await owner.completeTask(id);
    assert.equal(completed.completed, 1);
    const path = `${first.id}/${id}.bin`;
    const upload = await owner.attachFile(id, path, attachmentBytes);
    state = { version: 1, id, ownerEmail, otherEmail, ownerId: first.id, otherId: second.id,
      objectId: upload.id, path, sha256: digest(attachmentBytes), bytes: attachmentBytes.length,
      task: { id, owner_id: first.id, title: created.title, completed: 1, attachment_path: path } };
    assert.ok(state.objectId, "Storage must return the uploaded object's UUID");
    await owner.supabase.auth.signOut();
    await other.supabase.auth.signOut();
  }
  assert.equal(state?.version, 1, "A seed receipt is required for verification");
  // Reauthenticate even during seed checks; sessions are intentionally not migrated.
  assert.equal((await owner.signIn(state.ownerEmail, password)).id, state.ownerId);
  assert.equal((await other.signIn(state.otherEmail, password)).id, state.otherId);
  const direct = await owner.supabase.from("tasks").select(columns).eq("id", state.id).single();
  assert.equal(direct.error, null, JSON.stringify(direct.error));
  assert.deepEqual(direct.data, state.task);
  const invoked = await owner.supabase.functions.invoke(`tasks/${state.id}?view=full%20detail`, { method: "GET" });
  assert.equal(invoked.error, null, JSON.stringify(invoked.error));
  assert.deepEqual(invoked.data, state.task);
  assert.equal(invoked.response.headers.get("X-Caller-ID"), state.ownerId);
  assert.equal(invoked.response.headers.get("X-Function-Path"), `/tasks/${state.id}`);
  assert.equal(invoked.response.headers.get("X-Function-Query"), "?view=full%20detail");
  const downloaded = await owner.supabase.storage.from("task-attachments").download(state.path);
  assert.equal(downloaded.error, null, JSON.stringify(downloaded.error));
  const bytes = Buffer.from(await downloaded.data.arrayBuffer());
  assert.equal(bytes.length, state.bytes);
  assert.equal(digest(bytes), state.sha256);
  const hidden = await other.supabase.from("tasks").select(columns).eq("id", state.id);
  assert.equal(hidden.error, null); assert.deepEqual(hidden.data, []);
  const changed = await other.supabase.from("tasks").update({ completed: 0 }).eq("id", state.id).select(columns);
  assert.equal(changed.error, null); assert.deepEqual(changed.data, []);
  const deniedFunction = await other.supabase.functions.invoke(`tasks/${state.id}`, { method: "GET" });
  assert.equal(deniedFunction.response?.status, 404);
  const deniedFile = await other.supabase.storage.from("task-attachments").download(state.path);
  assert.ok(deniedFile.error, "A second user must not download the private attachment");
  const forged = await other.supabase.from("tasks").insert({ id: `forged-${state.id}`, owner_id: state.ownerId, title: "Not mine" });
  assert.ok(forged.error, "A second user must not forge record ownership");
  const anonymous = createTaskClient(url, key);
  const deniedAnonymous = await anonymous.supabase.functions.invoke(`tasks/${state.id}`, { method: "GET" });
  assert.ok([401, 403].includes(deniedAnonymous.response?.status), "Function requires a verified caller JWT");
  const options = await fetch(`${url}/functions/v1/tasks`, { method: "OPTIONS", headers: {
    Origin: "https://app.example", "Access-Control-Request-Headers": "apikey,authorization,content-type",
  } });
  assert.equal(options.status, 204); assert.equal(options.headers.get("Access-Control-Allow-Origin"), "*");
  assert.deepEqual(await owner.readTask(state.id), state.task, "Denied writes must not alter the owned task");
  if (phase === "verify") {
    const newId = `after-${crypto.randomUUID()}`;
    const created = await owner.createTask(newId, "Keep building after graduation");
    assert.equal(created.owner_id, state.ownerId);
    assert.equal((await owner.completeTask(newId)).completed, 1);
    const hiddenNew = await other.supabase.from("tasks").select("id").eq("id", newId);
    assert.equal(hiddenNew.error, null); assert.deepEqual(hiddenNew.data, []);
  }
  return { passed: true, phase, state, checks: [...(phase === "seed" ? ["signup-two-users", "owner-default", "private-upload", "function-create-update"] : ["post-graduation-owned-write"]), ...verificationChecks] };
}

if (import.meta.main) {
  const phase = process.env.DEMO_PHASE ?? "seed";
  const stateFile = process.env.DEMO_STATE_FILE ?? ".lite/graduation-state.json";
  const result = await exercise({ url: process.env.SUPABASE_URL, key: process.env.SUPABASE_PUBLISHABLE_KEY,
    password: process.env.DEMO_PASSWORD ?? "Local-fixture-only-password-44!", phase,
    id: process.env.TEST_TASK_ID,
    state: phase === "verify" ? JSON.parse(await readFile(stateFile, "utf8")) : undefined });
  if (phase === "seed") await writeFile(stateFile, JSON.stringify(result.state, null, 2) + "\n", { mode: 0o600 });
  console.log(JSON.stringify(result));
}
