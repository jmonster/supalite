import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout as delay } from "node:timers/promises";
import { createClient } from "@supabase/supabase-js";

test("normal CLI starts the working source and serves guest-to-password onboarding", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "guest-cli-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const reservation = createServer();
  reservation.listen(0, "127.0.0.1");
  await once(reservation, "listening");
  const port = reservation.address().port;
  await new Promise((resolve) => reservation.close(resolve));
  const config = join(directory, "config.toml");
  await mkdir(join(directory, ".lite"));
  const key = "sb_publishable_guest_cli_fixture";
  await writeFile(config, `
[api]
port = ${port}
[db]
driver = "sqlite-postgres"
url = ${JSON.stringify(join(directory, "database.sqlite"))}
[auth]
enabled = true
jwt_secret = "guest-cli-only-c8727fc6d6c848b8bf2cb68615af7c94"
publishable_key = "${key}"
enable_anonymous_sign_ins = true
[auth.email]
enable_confirmations = false
`);
  const cli = fileURLToPath(new URL("../upstream/lite-0.11.0/dist/cli/index.js", import.meta.url));
  const child = spawn(process.execPath, [cli, "--no-telemetry", "start", "--config", config, "--host", "127.0.0.1", "--no-admin"], {
    cwd: directory, env: { ...process.env, HOME: directory }, stdio: ["ignore", "pipe", "pipe"],
  });
  let output = "";
  child.stdout.on("data", (chunk) => { output += chunk; });
  child.stderr.on("data", (chunk) => { output += chunk; });
  t.after(async () => {
    if (child.exitCode === null && child.signalCode === null) {
      const exited = once(child, "exit");
      child.kill("SIGTERM");
      const hardStop = setTimeout(() => child.kill("SIGKILL"), 3000);
      try { await exited; } finally { clearTimeout(hardStop); }
    }
  });
  const url = `http://127.0.0.1:${port}`;
  let ready = false;
  for (let attempt = 0; attempt < 150; attempt++) {
    assert.equal(child.exitCode, null, output);
    try {
      const response = await fetch(`${url}/auth/v1/health`, {
        headers: { apikey: key }, signal: AbortSignal.timeout(300),
      });
      if (response.ok) { ready = true; break; }
    } catch {}
    await delay(100);
  }
  assert.ok(ready, `CLI failed to start: ${output}`);
  const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const guest = await client.auth.signInAnonymously({ options: { data: { source: "cli-smoke" } } });
  assert.equal(guest.error, null, `${JSON.stringify(guest.error)}\n${output}`);
  assert.equal(guest.data.user.is_anonymous, true);
  const id = guest.data.user.id;
  const email = "cli-guest@example.test", password = "Guest-cli-password-42!";
  const converted = await client.auth.updateUser({ email });
  assert.equal(converted.error, null, JSON.stringify(converted.error));
  assert.equal(converted.data.user.id, id);
  assert.equal(converted.data.user.is_anonymous, false);
  assert.equal((await client.auth.updateUser({ password })).error, null);
  assert.equal((await client.auth.signOut()).error, null);
  const login = await client.auth.signInWithPassword({ email, password });
  assert.equal(login.error, null, JSON.stringify(login.error));
  assert.equal(login.data.user.id, id);
});
