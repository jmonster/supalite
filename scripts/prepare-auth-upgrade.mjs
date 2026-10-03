import "./prepare-baseline.mjs";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { patchAuthUpgrade } from "./patch-auth-upgrade.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const target = resolve(root, ".generated/auth-upgrade/node_modules/@supabase/lite");
await mkdir(dirname(target), { recursive: true });
await rm(target, { recursive: true, force: true });
await cp(resolve(root, ".generated/baseline/node_modules/@supabase/lite"), target, { recursive: true });
const cli = resolve(target, "dist/cli/index.js");
await writeFile(cli, patchAuthUpgrade(await readFile(cli, "utf8")));
await cp(resolve(root, "dist/upgrade/auth-users.js"), resolve(target, "dist/cli/upgrade-auth-users.js"));
console.log("Prepared Supabase auth-user export integration over the verified Lite baseline");
