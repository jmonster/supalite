// Deliberately small adapter for the official experimental native CLI. The legacy
// Docker-oriented upgrade remains the default; this module never launches services.
import { constants } from "node:fs";
import { lstat, realpath, readdir, readFile, writeFile, mkdir, open } from "node:fs/promises";
import { dirname, resolve, relative, isAbsolute, join, sep, basename, extname } from "node:path";
import { createHash } from "node:crypto";

export const NATIVE_CLI_VERSION = "2.119.0";
const fail = message => { throw new Error(`Local upgrade: ${message}`); };
const inside = (root, path) => {
  const part = relative(root, path);
  return part === "" || (part !== ".." && !part.startsWith(`..${sep}`) && !isAbsolute(part));
};
const digest = bytes => createHash("sha256").update(bytes).digest("hex");
async function optionalStat(path) {
  try { return await lstat(path); } catch (error) { if (error.code === "ENOENT") return null; throw error; }
}
async function noSymlinks(path) {
  for (let current = resolve(path); ; current = dirname(current)) {
    const info = await optionalStat(current);
    if (info?.isSymbolicLink()) fail(`symlink is unsupported: ${current}. Use regular files and directories.`);
    if (dirname(current) === current) break;
  }
}

export function resolveLocalRuntime(runtime, target) {
  if (runtime !== undefined && target !== "local") fail("--local-runtime only applies to --target local.");
  const value = runtime ?? "legacy";
  if (!["legacy", "native"].includes(value)) fail(`unknown local runtime '${value}'; use 'legacy' or 'native'.`);
  return value;
}

export function nativeCommand(operation, directory, { storage = false, functions = false } = {}) {
  const base = ["stack", operation, "--workdir", directory];
  if (operation === "start") return [...base, "--runtime", "native", "--eager", "--exclude", [
    "realtime", "studio", "mail", "analytics", "pooler", ...(!storage ? ["storage"] : []), ...(!functions ? ["functions"] : []),
  ].join(","), "--output-format", "json"];
  if (operation === "status") return [...base, "--output-format", "json"];
  if (operation === "stop") return [...base, "--output-format", "json"];
  fail(`unsupported native operation '${operation}'.`);
}

export function parseNativeStatus(text) {
  const parsed = JSON.parse(text), output = parsed.result ?? parsed, env = output.env;
  if (output.runtime !== "native" || output.readiness !== "ready") fail("native CLI status must report runtime=native and readiness=ready before applying data.");
  if (!env || typeof env !== "object") fail("native CLI status is missing its env map.");
  const field = (names, required = true) => {
    for (const name of names) if (typeof env[name] === "string" && env[name]) return env[name];
    if (required) fail(`native CLI status is missing ${names.join(" or ")}.`);
  };
  const apiUrl = field(["API_URL"]), dbUrl = field(["DB_URL"]);
  for (const value of [apiUrl, dbUrl]) {
    if (!["127.0.0.1", "localhost", "[::1]"].includes(new URL(value).hostname)) fail("native CLI returned a non-loopback target URL.");
  }
  return {
    apiUrl, dbUrl, studioUrl: field(["STUDIO_URL"], false),
    anonKey: field(["PUBLISHABLE_KEY", "ANON_KEY"]),
    serviceRoleKey: field(["SERVICE_ROLE_KEY", "SECRET_KEY"]),
    secretKey: field(["SECRET_KEY"], false),
    jwtSecret: field(["JWT_SECRET"], false),
  };
}

export function assertNativeStopped(text) {
  let parsed;
  try { parsed = JSON.parse(text); } catch { fail("native cleanup was not confirmed: stop returned invalid JSON. Inspect the owned stack before retrying."); }
  const output = parsed?.result ?? parsed;
  if (!output || !Array.isArray(output.stopped) || !Array.isArray(output.unavailable))
    fail("native cleanup was not confirmed: stop returned no acknowledgment. Inspect the owned stack before retrying.");
  if (output.unavailable.length)
    fail("native cleanup was not confirmed: the stack owner is unavailable. Inspect the owned stack; do not assume its processes stopped.");
  if (output.stopped.length !== 1 || typeof output.stopped[0] !== "string" || !output.stopped[0])
    fail("native cleanup was not confirmed: stop did not acknowledge exactly one owned stack. Inspect it before retrying.");
}

export async function requireFreshLocalDirectory(directory, sourceDirectory) {
  const target = resolve(directory), source = await realpath(sourceDirectory);
  await noSymlinks(target);
  if (inside(source, target) || inside(target, source)) fail("--local-dir must be outside the source project and cannot contain it.");
  const info = await optionalStat(target);
  if (info && (!info.isDirectory() || (await readdir(target)).length)) fail("--local-dir must be a new or empty directory; existing targets are never overwritten.");
}

// Preserve only a self-contained source tree. Dotenv, caches, package installs,
// private keys and arbitrary assets are deliberately not copied or dereferenced.
const sourceExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".mts", ".cts", ".cjs"]);
const skippedDirectories = new Set(["node_modules", ".git", ".cache", ".deno"]);
const secretFile = name => name === ".env" || name.startsWith(".env.") || /\.(?:pem|key|p12|pfx|crt)$/i.test(name);
const configNames = new Set(["deno.json", "import_map.json", "import-map.json"]);
function validateImportTarget(value, path, root) {
  if (typeof value !== "string") fail(`non-string import mapping in ${path}.`);
  if (value.startsWith("./") || value.startsWith("../")) {
    if (!inside(root, resolve(dirname(path), value))) fail(`import mapping leaves supabase/functions in ${path}. Move shared code into functions/_shared.`);
    return;
  }
  if (/^(npm:|jsr:|node:)/.test(value)) return;
  if (value.startsWith("https://")) {
    const url = new URL(value);
    if (!url.username && !url.password && !url.search && !url.hash) return;
  }
  fail(`unsupported import target in ${path}; use relative Functions paths or credential-free https:, npm:, jsr:, node: imports.`);
}
function validateDenoConfig(bytes, path, root) {
  let config;
  try { config = JSON.parse(bytes.toString("utf8")); } catch { fail(`invalid JSON in ${path}; convert JSONC configs to deno.json before upgrading.`); }
  if (!config || typeof config !== "object" || Array.isArray(config)) fail(`invalid import configuration: ${path}.`);
  const allowed = new Set(["imports", "scopes", "compilerOptions", "nodeModulesDir", "lock", "lint", "fmt", "$schema"]);
  for (const key of Object.keys(config)) if (!allowed.has(key)) fail(`unsupported Deno config '${key}' in ${path}; use a self-contained imports/scopes config for the upgrade.`);
  if (config.nodeModulesDir && config.nodeModulesDir !== "none") fail(`nodeModulesDir in ${path} is unsupported; use runtime-resolved npm: dependencies.`);
  if (config.lock && config.lock !== false) fail(`explicit lock settings in ${path} are unsupported; set lock = false for the portable function config.`);
  for (const [name, value] of Object.entries(config.imports ?? {})) validateImportTarget(value, path, root);
  for (const [scope, mappings] of Object.entries(config.scopes ?? {})) {
    validateImportTarget(scope, path, root);
    for (const value of Object.values(mappings)) validateImportTarget(value, path, root);
  }
}

export async function inspectFunctionUpgrade(config, configPath) {
  const directory = resolve(dirname(configPath)), root = join(directory, "functions");
  await noSymlinks(directory);
  const files = [], omitted = [], names = new Set(Object.keys(config.functions ?? {}));
  async function walk(current) {
    for (const entry of await readdir(current, { withFileTypes: true })) {
      const path = join(current, entry.name), info = await lstat(path);
      if (info.isSymbolicLink()) fail(`Functions symlink is unsupported: ${path}. Copy its reviewed contents into the Functions tree.`);
      if (info.isDirectory()) {
        if (skippedDirectories.has(entry.name)) { omitted.push(relative(directory, path)); continue; }
        if (current === root && entry.name !== "_shared") names.add(entry.name);
        await walk(path); continue;
      }
      if (!info.isFile()) fail(`Functions path must be a regular file: ${path}.`);
      if (secretFile(entry.name) || entry.name === "deno.lock" || entry.name === ".DS_Store") { omitted.push(relative(directory, path)); continue; }
      if (!sourceExtensions.has(extname(path)) && !configNames.has(entry.name)) {
        if (/^(README|LICENSE)(\.|$)/i.test(entry.name)) continue;
        fail(`unsupported Functions asset: ${path}. Only source modules and deno.json/import maps are copied; move other assets or configure them manually.`);
      }
      const bytes = await readFile(path);
      if (configNames.has(entry.name)) validateDenoConfig(bytes, path, root);
      files.push({ path, relative: relative(directory, path), hash: digest(bytes) });
    }
  }
  const rootInfo = await optionalStat(root);
  if (rootInfo) {
    if (rootInfo.isSymbolicLink() || !rootInfo.isDirectory()) fail(`Functions root must be a regular directory: ${root}.`);
    await walk(root);
  }
  const functions = {};
  for (const name of [...names].sort()) {
    if (name === "_shared") continue;
    if (!/^[A-Za-z0-9_-]+$/.test(name)) fail(`unsupported Functions name ${JSON.stringify(name)}.`);
    const settings = config.functions?.[name] ?? {};
    const entrypoint = settings.entrypoint || `functions/${name}/index.ts`;
    const absolute = resolve(directory, entrypoint);
    if (!inside(root, absolute)) fail(`Function '${name}' entrypoint must remain within supabase/functions. Move shared code into functions/_shared.`);
    if (!files.some(file => file.path === absolute)) {
      if (settings.enabled === false) { functions[name] = { enabled: false }; continue; }
      if (Object.hasOwn(config.functions ?? {}, name)) fail(`Function '${name}' entrypoint is missing or unsupported: ${entrypoint}.`);
      continue;
    }
    const allowed = new Set(["enabled", "verify_jwt", "entrypoint", "import_map", "env", "static_files"]);
    for (const key of Object.keys(settings)) if (!allowed.has(key)) fail(`unsupported Functions setting '${key}' for '${name}'.`);
    if (settings.static_files?.length) fail(`Function '${name}' uses static_files, which this upgrade cannot copy safely.`);
    if (Object.keys(settings.env ?? {}).length) omitted.push(`functions.${name}.env`);
    const target = { enabled: settings.enabled !== false, verify_jwt: settings.verify_jwt !== false, entrypoint: relative(directory, absolute).split(sep).join("/") };
    if (settings.import_map) {
      const map = resolve(directory, settings.import_map);
      if (!inside(root, map) || !files.some(file => file.path === map && configNames.has(basename(map)))) fail(`Function '${name}' import_map must name an included JSON import map inside supabase/functions.`);
      target.import_map = relative(directory, map).split(sep).join("/");
    }
    functions[name] = target;
  }
  if (Object.keys(config.edge_runtime?.secrets ?? {}).length) omitted.push("edge_runtime.secrets");
  const enabled = config.edge_runtime?.enabled !== false && Object.values(functions).some(value => value.enabled);
  const policy = config.edge_runtime?.policy ?? "oneshot";
  if (!["oneshot", "per_worker"].includes(policy)) fail(`unsupported Edge Runtime policy: ${policy}.`);
  return { root, directory, files, functions, enabled, policy, omitted };
}

export async function copyFunctions(plan, directory) {
  // Verify the complete snapshot before the first destination write. Use exclusive
  // creation and no-follow reads; source files are never changed.
  const current = await inspectFunctionUpgrade({ functions: plan.functions, edge_runtime: { enabled: plan.enabled, policy: plan.policy } }, join(plan.directory, "config.toml"));
  const signature = files => files.map(file => `${file.relative}:${file.hash}`).sort().join("\n");
  if (signature(current.files) !== signature(plan.files)) fail("Functions source changed since readiness. Stop writers and retry with a fresh target.");
  const contents = [];
  for (const file of plan.files) {
    await noSymlinks(file.path);
    const handle = await open(file.path, constants.O_RDONLY | constants.O_NOFOLLOW);
    try {
      if (!(await handle.stat()).isFile()) fail(`Functions source is no longer regular: ${file.path}.`);
      const bytes = await handle.readFile();
      if (digest(bytes) !== file.hash) fail(`Functions source changed since readiness: ${file.path}. Stop writers and retry with a fresh target.`);
      contents.push([file, bytes]);
    } finally { await handle.close(); }
  }
  for (const [file, bytes] of contents) {
    const destination = join(directory, "supabase", file.relative);
    await noSymlinks(destination);
    await mkdir(dirname(destination), { recursive: true });
    const handle = await open(destination, "wx", 0o600);
    try { await handle.writeFile(bytes); } finally { await handle.close(); }
  }
}

export function functionConfigToml(plan) {
  return Object.entries(plan.functions).map(([name, settings]) => `\n[functions.${name}]\n${Object.entries(settings).map(([key, value]) => `${key} = ${JSON.stringify(value)}`).join("\n")}\n`).join("");
}

export async function writeLocalCredentials(path, contents) {
  await writeFile(path, contents, { encoding: "utf-8", mode: 0o600, flag: "wx" });
}
