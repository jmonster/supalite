import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import "./prepare-baseline.mjs";
import { patch } from "./patch-pagination.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = resolve(root, ".generated/baseline/node_modules/@supabase/lite");
const target = resolve(root, ".generated/candidate/node_modules/@supabase/lite");
const patched = patch(await readFile(resolve(source, "dist/index.js"), "utf8"));
await mkdir(dirname(target), { recursive: true });
await rm(target, { recursive: true, force: true });
await cp(source, target, { recursive: true });
await writeFile(resolve(target, "dist/index.js"), patched);
console.log("Prepared the exact-end pagination candidate from the verified baseline");
