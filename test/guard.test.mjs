import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile, cp, rm, access, appendFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

for (const corruption of ["version", "bundle", "integrity", "vendored"]) {
  test(`baseline verification rejects ${corruption} drift before producing artifacts`, async () => {
    const root = await mkdtemp(join(tmpdir(), "supalite-guard-"));
    try {
      for (const entry of ["scripts", "upstream", "package.json", "package-lock.json"]) {
        await cp(new URL(`../${entry}`, import.meta.url), join(root, entry), { recursive: true });
      }
      const installed = join(root, "node_modules/@supabase/lite");
      await mkdir(join(root, "node_modules/@supabase"), { recursive: true });
      await cp(new URL("../node_modules/@supabase/lite/", import.meta.url), installed, { recursive: true });
      if (corruption === "version") {
        const path = join(installed, "package.json");
        const pkg = JSON.parse(await readFile(path, "utf8"));
        pkg.version = "0.11.1";
        await writeFile(path, JSON.stringify(pkg));
      } else if (corruption === "bundle") {
        await appendFile(join(installed, "dist/index.js"), "\n");
      } else if (corruption === "vendored") {
        await appendFile(join(root, "upstream/lite-0.11.0/dist/index.js"), "\n");
      } else {
        const path = join(root, "package-lock.json");
        const lock = JSON.parse(await readFile(path, "utf8"));
        lock.packages["node_modules/@supabase/lite"].integrity = "sha512-invalid";
        await writeFile(path, JSON.stringify(lock));
      }
      const run = spawnSync(process.execPath, [join(root, "scripts/prepare-baseline.mjs")], {
        encoding: "utf8", timeout: 10_000,
      });
      assert.equal(run.error, undefined);
      assert.notEqual(run.status, 0);
      assert.match(run.stderr, /differs|Unexpected lockfile integrity/);
      await assert.rejects(access(join(root, ".generated")));
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
}
