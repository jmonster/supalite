import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { chmod, cp, lstat, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { patchRepeatedFilters } from "./patch-repeated-filters.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(
  await readFile(resolve(root, "upstream/manifest.json"), "utf8"),
);
export const baseline = Object.freeze({
  name: "@supabase/lite",
  version: "0.11.0",
  integrity:
    "sha512-F7Z/um+cAedEECNhVffMM04Rl25pmJUiJp3jqW4tKmij2A+Us24r3CyIRjeuhW+fNnTvJQVIshNn6tDb3oB52g==",
  tarballSha256:
    "f8b399ab700ed0ae34a44a38112c86be0fe33cf3e671473799048afa0d496adf",
  indexSha256:
    "f5cf75c6bcb10cec0c175cd4a8237b831368f7dbfc77e12652b965dde6a5685d",
});
const tarballUrl =
  "https://registry.npmjs.org/@supabase/lite/-/lite-0.11.0.tgz";
const source = resolve(root, "upstream/lite-0.11.0");
const installed = resolve(root, "node_modules/@supabase/lite");
const target = resolve(root, ".generated/baseline/node_modules/@supabase/lite");

assert.equal(manifest.name, baseline.name, "Unexpected manifest package");
assert.equal(manifest.version, baseline.version, "Unexpected manifest version");
assert.equal(manifest.directory, "lite-0.11.0", "Unexpected manifest directory");
assert.equal(manifest.tarball.url, tarballUrl, "Unexpected tarball URL");
assert.equal(manifest.tarball.integrity, baseline.integrity, "Unexpected npm integrity");
assert.equal(manifest.tarball.sha256, baseline.tarballSha256, "Unexpected tarball SHA-256");
assert.equal(manifest.files.length, 77, "Expected all 77 published files");
const paths = manifest.files.map((file) => file.path);
assert.equal(new Set(paths).size, paths.length, "Duplicate manifest path");
for (const file of manifest.files) {
  assert.match(file.path, /^(?!\/)(?!.*\\)[^\0]+$/, "Invalid manifest path");
  assert.ok(
    file.path.split("/").every((part) => part && part !== "." && part !== ".."),
    `Invalid manifest path: ${file.path}`,
  );
  assert.match(file.sha256, /^[a-f0-9]{64}$/, `Invalid SHA-256: ${file.path}`);
  assert.ok(Number.isSafeInteger(file.size) && file.size >= 0, `Invalid size: ${file.path}`);
  assert.match(file.mode, /^0[0-7]{3}$/, `Invalid mode: ${file.path}`);
}
assert.equal(
  manifest.files.find((file) => file.path === "dist/index.js")?.sha256,
  baseline.indexSha256,
  "Unexpected baseline bundle SHA-256",
);

async function filePaths(directory, prefix = "") {
  const results = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      results.push(...await filePaths(resolve(directory, entry.name), relative));
    } else {
      assert.ok(entry.isFile(), `Expected a regular file: ${relative}`);
      results.push(relative);
    }
  }
  return results.sort();
}

export async function verifyDistribution(directory) {
  assert.deepEqual(
    await filePaths(directory),
    [...paths].sort(),
    `Published file inventory differs: ${directory}`,
  );
  for (const file of manifest.files) {
    const path = resolve(directory, file.path);
    const [bytes, stat] = await Promise.all([readFile(path), lstat(path)]);
    assert.equal(bytes.length, file.size, `File size differs: ${path}`);
    assert.equal(
      createHash("sha256").update(bytes).digest("hex"),
      file.sha256,
      `SHA-256 differs: ${path}`,
    );
    if (process.platform !== "win32") {
      assert.equal(stat.mode & 0o777, Number.parseInt(file.mode, 8), `Mode differs: ${path}`);
    }
  }
  const pkg = JSON.parse(await readFile(resolve(directory, "package.json"), "utf8"));
  assert.equal(pkg.name, baseline.name, "Unexpected package name");
  assert.equal(pkg.version, baseline.version, "Unexpected package version");
}

const lock = JSON.parse(await readFile(resolve(root, "package-lock.json"), "utf8"));
const rootPackage = JSON.parse(await readFile(resolve(root, "package.json"), "utf8"));
const lockedPackage = lock.packages?.["node_modules/@supabase/lite"];
assert.equal(rootPackage.devDependencies?.[baseline.name], baseline.version, "Baseline dependency must be pinned");
assert.equal(lock.packages?.[""]?.devDependencies?.[baseline.name], baseline.version, "Lockfile baseline must be pinned");
assert.equal(lockedPackage?.version, baseline.version, "Unexpected locked package version");
assert.equal(lockedPackage?.integrity, baseline.integrity, "Unexpected lockfile integrity");
assert.equal(lockedPackage?.resolved, tarballUrl, "Unexpected lockfile package URL");
await verifyDistribution(source);
await verifyDistribution(installed);

await mkdir(dirname(target), { recursive: true });
await rm(target, { recursive: true, force: true });
await cp(source, target, { recursive: true });
for (const file of manifest.files) {
  await chmod(resolve(target, file.path), Number.parseInt(file.mode, 8));
}
await verifyDistribution(target);

const input = await readFile(resolve(source, "dist/index.js"), "utf8");
const mergerUrl = pathToFileURL(resolve(root, "dist/merge-filters.js")).href;
const output = patchRepeatedFilters(input, mergerUrl);
const patchedTarget = resolve(root, ".generated/patched/node_modules/@supabase/lite");
await mkdir(dirname(patchedTarget), { recursive: true });
await rm(patchedTarget, { recursive: true, force: true });
await cp(source, patchedTarget, { recursive: true });
for (const file of manifest.files) {
  await chmod(resolve(patchedTarget, file.path), Number.parseInt(file.mode, 8));
}
await writeFile(resolve(patchedTarget, "dist/index.js"), output);
await writeFile(
  resolve(root, ".generated/provenance.json"),
  JSON.stringify({
    ...baseline,
    source: "upstream/lite-0.11.0",
    files: paths.length,
    patchedIndexSha256: createHash("sha256").update(output).digest("hex"),
    patches: 2,
  }, null, 2) + "\n",
);
console.log(`Verified ${baseline.name} ${baseline.version} (${paths.length} unmodified files) and prepared repeated-filter patch (2 parser seams)`);
