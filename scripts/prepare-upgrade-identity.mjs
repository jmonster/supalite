import "./prepare-baseline.mjs";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { patchUpgradeIdentity } from "./patch-upgrade-identity.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const target = resolve(root, ".generated/upgrade-identity/node_modules/@supabase/lite");
await mkdir(dirname(target), { recursive: true });
await rm(target, { recursive: true, force: true });
await cp(resolve(root, ".generated/baseline/node_modules/@supabase/lite"), target, { recursive: true });
const cli = resolve(target, "dist/cli/index.js");
await writeFile(cli, patchUpgradeIdentity(await readFile(cli, "utf8")));
await cp(resolve(root, "dist/upgrade/identity.js"), resolve(target, "dist/cli/upgrade-identity.js"));
console.log("Prepared identity-safe upgrade exporter over the verified Lite baseline");
