import "./prepare-baseline.mjs";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { patchGuestOnboarding, patchAuthTypes } from "./patch-guest-onboarding.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const target = resolve(root, ".generated/guest-onboarding/node_modules/@supabase/lite");
await mkdir(dirname(target), { recursive: true });
await rm(target, { recursive: true, force: true });
await cp(resolve(root, ".generated/baseline/node_modules/@supabase/lite"), target, { recursive: true });
const bundle = resolve(target, "dist/index.js");
const types = resolve(target, "dist/index.d.ts");
await writeFile(bundle, patchGuestOnboarding(await readFile(bundle, "utf8")));
await writeFile(types, patchAuthTypes(await readFile(types, "utf8")));
await cp(resolve(root, "src/auth/anonymous-auth.mjs"), resolve(target, "dist/anonymous-auth.mjs"));
console.log("Prepared anonymous guest-to-email onboarding over the verified Lite baseline");
