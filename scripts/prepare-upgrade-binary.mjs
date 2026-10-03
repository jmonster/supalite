import "./prepare-baseline.mjs";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { patchUpgradeBinary } from "./patch-upgrade-binary.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const target = resolve(root, ".generated/upgrade-binary/node_modules/@supabase/lite");
await mkdir(dirname(target), { recursive: true });
await rm(target, { recursive: true, force: true });
await cp(resolve(root, ".generated/baseline/node_modules/@supabase/lite"), target, { recursive: true });
const cli = resolve(target, "dist/cli/index.js");
await writeFile(cli, patchUpgradeBinary(await readFile(cli, "utf8")));
await cp(resolve(root, "dist/upgrade/binary-value.js"), resolve(target, "dist/cli/upgrade-binary-value.js"));
console.log("Prepared binary upgrade export over the verified Lite baseline");
