import test from "node:test";
import assert from "node:assert/strict";
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { App } from "../upstream/lite-0.11.0/dist/index.js";
import { createConnection } from "../upstream/lite-0.11.0/dist/db/node/index.js";
import { createLibsqlConnection } from "../upstream/lite-0.11.0/dist/db/libsql/index.js";
import { createPgliteConnection } from "../upstream/lite-0.11.0/dist/db/postgres/pglite/PgliteConnection.js";
import { modules } from "./helpers/lite.mjs";

const packageRoot = new URL("../upstream/lite-0.11.0/", import.meta.url);
const pkg = JSON.parse(await readFile(new URL("package.json", packageRoot), "utf8"));

test("shared harness uses the tracked implementation and adapters directly", () => {
  const actual = modules();
  assert.equal(actual.App, App);
  assert.equal(actual.factories.node, createConnection);
  assert.equal(actual.factories.libsql, createLibsqlConnection);
  assert.equal(actual.factories.pglite, createPgliteConnection);
});

test("all package export and CLI targets exist", async () => {
  async function visit(value) {
    if (typeof value === "string") {
      assert.ok(value.startsWith("./"));
      // Wildcard exports designate a directory, not one literal filename.
      await access(new URL(value.split("*")[0], packageRoot));
    } else {
      for (const child of Object.values(value)) await visit(child);
    }
  }
  await visit(pkg.exports);
  await visit(pkg.bin);
  await visit(pkg.main);
  await visit(pkg.types);
});

for (const args of [["--version"], ["--help"], ["start", "--help"]]) {
  test(`tracked CLI ${args.join(" ")}`, () => {
    const run = spawnSync(
      process.execPath,
      [fileURLToPath(new URL(pkg.bin.lite, packageRoot)), ...args],
      {
        encoding: "utf8",
        timeout: 15_000,
        env: { ...process.env, LITE_TELEMETRY: "0", DO_NOT_TRACK: "1", NO_COLOR: "1" },
      },
    );
    assert.equal(run.error, undefined);
    assert.equal(run.status, 0, run.stderr);
    assert.equal(run.signal, null);
    if (args[0] === "--version") assert.equal(run.stdout.trim(), pkg.version);
    else assert.match(run.stdout, /Usage: lite/);
  });
}

test("tracked CLI executes a normal local SQL query", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "supalite-cli-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  await mkdir(join(directory, ".lite"));
  const config = join(directory, "config.toml");
  await writeFile(config, `
[db]
driver = "sqlite-postgres"
url = ${JSON.stringify(join(directory, "database.sqlite"))}
[auth]
enabled = false
`);
  const run = spawnSync(process.execPath, [
    fileURLToPath(new URL(pkg.bin.lite, packageRoot)),
    "--no-telemetry", "db", "query", "select 42 as answer", "--config", config,
  ], {
    cwd: directory,
    encoding: "utf8",
    timeout: 15_000,
    env: { ...process.env, HOME: directory, LITE_TELEMETRY: "0", DO_NOT_TRACK: "1", NO_COLOR: "1" },
  });
  assert.equal(run.error, undefined);
  assert.equal(run.status, 0, run.stderr);
  assert.match(run.stdout, /answer/);
  assert.match(run.stdout, /42/);
});
