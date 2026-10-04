import assert from "node:assert/strict";
import { createTaskClient } from "./client.mjs";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_PUBLISHABLE_KEY;
assert.ok(url && key, "SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY are required");
const client = createTaskClient(url, key);
const id = process.env.TEST_TASK_ID ?? crypto.randomUUID();
const task = { id, title: "Ship an unchanged Supabase function", completed: 0 };
assert.deepEqual(await client.createTask(id, task.title), task);
assert.deepEqual(await client.readTask(id), task);
assert.deepEqual(await client.completeTask(id), { ...task, completed: 1 });
assert.deepEqual(await client.readTask(id), { ...task, completed: 1 });
// Read through the independent Data API, proving the function persisted the row.
const { data, error } = await client.supabase.from("tasks").select("id,title,completed").eq("id", id).single();
assert.equal(error, null);
assert.deepEqual(data, { ...task, completed: 1 });
const pathCheck = await client.supabase.functions.invoke(`tasks/${encodeURIComponent(id)}?view=full%20detail`, { method: "GET" });
assert.equal(pathCheck.error, null);
assert.equal(pathCheck.response.headers.get("X-Function-Path"), `/tasks/${id}`);
assert.equal(pathCheck.response.headers.get("X-Function-Query"), "?view=full%20detail");
const invalid = await client.supabase.functions.invoke("tasks", { body: { action: "create", id: "invalid", title: "" } });
assert.equal(invalid.error?.context?.status, 400);
const options = await fetch(`${url}/functions/v1/tasks`, { method: "OPTIONS", headers: { Origin: "https://app.example", "Access-Control-Request-Headers": "apikey,authorization,content-type" } });
assert.equal(options.status, 204);
assert.equal(options.headers.get("Access-Control-Allow-Origin"), "*");
console.log(JSON.stringify({ passed: true, id, checks: ["create", "read", "update", "read-after-update", "independent-data-api-read", "validation-400", "function-owned-options", "production-path-and-query"] }));
