// CLI-only discovery and native Bun worker lifecycle. App stays Fetch-native.
import { readdir, readFile, stat } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";
import { parse } from "dotenv";
import { SignJWT } from "jose";
import { createFunctionWorker, endToEndHeaders } from "./execution.js";

async function isFile(path) {
  try { return (await stat(path)).isFile(); }
  catch (error) { if (["ENOENT", "ENOTDIR"].includes(error.code)) return false; throw error; }
}

async function discoverFunctions(config, directory) {
  const configured = config.functions ?? {}, names = new Set(Object.keys(configured));
  try {
    for (const entry of await readdir(join(directory, "functions"), { withFileTypes: true }))
      if (entry.isDirectory()) names.add(entry.name);
  } catch (error) { if (error.code !== "ENOENT") throw error; }
  const services = Object.create(null), merged = { ...configured };
  for (const name of [...names].sort()) {
    if (name === "_shared" || !/^[a-zA-Z0-9_-]+$/.test(name)) continue;
    const settings = Object.hasOwn(configured, name) ? configured[name] : undefined;
    if (settings?.enabled === false) continue;
    const entrypoint = resolve(directory, settings?.entrypoint ?? join("functions", name, "index.ts"));
    if (!(await isFile(entrypoint))) {
      if (settings !== undefined) throw new Error(`Function "${name}" entrypoint not found: ${entrypoint}`);
      continue;
    }
    if (settings?.import_map) throw new Error(`Function "${name}": Bun does not apply import_map. Install ordinary package dependencies; use deno.json mappings for Supabase deployment.`);
    services[name] = { entrypoint };
    if (!Object.hasOwn(merged, name)) Object.defineProperty(merged, name, { value: {}, enumerable: true, configurable: true, writable: true });
  }
  return { services, merged };
}

function serviceURL(host, port) {
  let hostname = host ?? "127.0.0.1";
  if (hostname === "0.0.0.0") hostname = "127.0.0.1";
  if (hostname === "::" || hostname === "[::]") hostname = "::1";
  if (typeof hostname !== "string" || /[\s/@?#]/.test(hostname)) throw new Error("Functions require a valid configured API hostname");
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Functions require a configured API port between 1 and 65535");
  if (hostname.includes(":") && !hostname.startsWith("[")) hostname = `[${hostname}]`;
  return new URL(`http://${hostname}:${port}`).origin;
}

async function functionEnvironment(config, directory, host, port) {
  let values = {};
  try { values = parse(await readFile(join(directory, "functions", ".env"))); }
  catch (error) { if (error.code !== "ENOENT") throw error; }
  const auth = config.auth ?? {};
  const legacyKey = async role => auth.jwt_secret ? new SignJWT({ role })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" }).setIssuer("supabase")
    .setIssuedAt().setExpirationTime("10y").sign(new TextEncoder().encode(auth.jwt_secret)) : undefined;
  const anon = auth.anon_key || auth.publishable_key || await legacyKey("anon");
  const service = auth.service_role_key || auth.secret_key || await legacyKey("service_role");
  for (const name of Object.keys(values)) if (name.startsWith("SUPABASE_")) delete values[name];
  return {
    ...values, SUPABASE_URL: serviceURL(host, port),
    ...(anon ? { SUPABASE_ANON_KEY: anon } : {}), ...(service ? { SUPABASE_SERVICE_ROLE_KEY: service } : {}),
    SUPABASE_PUBLISHABLE_KEYS: JSON.stringify(auth.publishable_key ? { default: auth.publishable_key } : {}),
    SUPABASE_SECRET_KEYS: JSON.stringify(auth.secret_key ? { default: auth.secret_key } : {}),
  };
}

function abortable(promise, signal) {
  signal.throwIfAborted();
  let onAbort;
  return Promise.race([promise, new Promise((_, reject) => {
    onAbort = () => reject(signal.reason); signal.addEventListener("abort", onAbort, { once: true });
  })]).finally(() => signal.removeEventListener("abort", onAbort));
}

export async function prepareFunctions(app, {
  configPath, host, port = app.config.api?.port ?? 54321,
  startupTimeoutMs = 60000, shutdownTimeoutMs = 2000, requestTimeoutMs = 150000,
  idleTimeoutMs = 60000, maxWorkers = 4, maxInFlight = 8,
} = {}) {
  if (app.drivers.functions != null) return;
  for (const [name, value] of Object.entries({ startupTimeoutMs, shutdownTimeoutMs, requestTimeoutMs, idleTimeoutMs, maxWorkers, maxInFlight }))
    if (!Number.isFinite(value) || value <= 0) throw new Error(`${name} must be positive and finite`);
  let absoluteConfigPath = resolve(configPath ?? "supabase/config.toml");
  if (!configPath) for (const extension of ["toml", "json", "ts", "mts", "js", "mjs", "cjs"]) {
    const candidate = resolve("supabase", `config.${extension}`);
    if (await isFile(candidate)) { absoluteConfigPath = candidate; break; }
  }
  const directory = dirname(absoluteConfigPath);
  const projectDirectory = basename(directory) === "supabase" ? dirname(directory) : directory;
  let configuration = { ...app.config }, closed = false, reloading, generation = 0;
  const workers = new Set();
  async function discover(config) {
    const { services, merged } = config.edge_runtime?.enabled === false
      ? { services: Object.create(null), merged: { ...config.functions } }
      : await discoverFunctions(config, directory);
    const policy = config.edge_runtime?.policy ?? "oneshot";
    if (!["oneshot", "per_worker"].includes(policy)) throw new Error(`Unsupported Functions policy: ${policy}`);
    const environment = Object.keys(services).length ? await functionEnvironment(config, directory, host, port) : {};
    const paths = new Set([absoluteConfigPath, join(directory, "functions"), join(projectDirectory, "package.json"), join(projectDirectory, "bun.lock")]);
    for (const settings of Object.values(config.functions ?? {})) {
      if (settings?.entrypoint) paths.add(resolve(directory, settings.entrypoint));
    }
    return { services, merged, policy, environment, paths };
  }
  let prepared = await discover(configuration);
  function requireBun(services) {
    if (Object.keys(services).length && !globalThis.Bun?.version)
      throw new Error("Local function files require Bun 1.4.2 or later. Run: bun <lite-cli> dev");
  }
  requireBun(prepared.services);
  function retire(slot) {
    if (slot.closing) return slot.closing;
    clearTimeout(slot.idle);
    // Abort listeners may synchronously release the last request and retire again.
    slot.closing = slot.ready.then(runtime => runtime.close(), error => { if (error.shutdownFailed) throw error; }).then(() => workers.delete(slot))
      .catch(error => console.error(`[functions] Could not stop ${slot.name}; restart Lite to release its capacity:`, error.message));
    slot.abort.abort(new Error("Function worker retired"));
    return slot.closing;
  }
  function release(slot) {
    slot.active--;
    if (slot.active || slot.closing) return;
    if (prepared.policy === "oneshot" || slot.draining || !slot.runtime) void retire(slot);
    else { slot.idle = setTimeout(() => { void retire(slot); }, idleTimeoutMs); slot.idle.unref?.(); }
  }
  async function acquire(name) {
    if (closed || reloading || !Object.hasOwn(prepared.services, name)) return undefined;
    let slot = prepared.policy === "per_worker" && [...workers].find(value => value.name === name && !value.draining && !value.abort.signal.aborted && value.active < maxInFlight);
    if (!slot && workers.size >= maxWorkers) {
      const idle = [...workers].find(value => value.active === 0 && !value.closing);
      if (!idle) return undefined;
      await retire(idle);
      return acquire(name);
    }
    if (!slot) {
      slot = { name, active: 0, abort: new AbortController() };
      workers.add(slot);
      const epoch = generation, settings = prepared.services[name], environment = { ...prepared.environment, SUPABASE_FUNCTION_SLUG: name };
      const timer = setTimeout(() => slot.abort.abort(new Error("Function startup timed out")), startupTimeoutMs);
      slot.ready = (async () => {
        if (closed || epoch !== generation) throw new Error("Function generation is no longer active");
        return slot.runtime = await createFunctionWorker(settings.entrypoint, environment, { signal: slot.abort.signal, startupTimeoutMs, shutdownTimeoutMs });
      })().finally(() => clearTimeout(timer));
      slot.ready.catch(() => {});
    }
    clearTimeout(slot.idle); slot.active++;
    return slot;
  }
  const runner = {
    get watchPaths() { return [...prepared.paths]; },
    reload(nextConfig = {}) {
      const pending = (reloading ?? Promise.resolve()).catch(() => {}).then(async () => {
        if (closed) throw new Error("Functions are closed");
        const next = { ...configuration, ...nextConfig }, discovered = await discover(next);
        requireBun(discovered.services);
        generation++;
        await Promise.all([...workers].map(retire));
        if (closed) throw new Error("Functions are closed");
        configuration = next; prepared = discovered;
        if (app.drivers.functions != null && app.drivers.functions !== runner) return runner;
        app.config.functions = prepared.merged; app.config.edge_runtime = configuration.edge_runtime;
        app.drivers.functions = Object.keys(prepared.services).length ? runner : undefined;
        return runner;
      });
      const operation = pending.finally(() => { if (reloading === operation) reloading = undefined; });
      return reloading = operation;
    },
    async fetch(request, context) {
      request.signal.throwIfAborted();
      if (reloading) {
        void request.body?.cancel().catch(() => {});
        return Response.json({ code: "BUSY", message: "Functions are reloading" }, { status: 503 });
      }
      if (closed) { void request.body?.cancel().catch(() => {}); return Response.json({ code: "UNAVAILABLE", message: "Functions are closed" }, { status: 503 }); }
      for (const worker of [...workers]) if (!worker.closing && worker.runtime?.signal.aborted) await retire(worker);
      const name = context?.name ?? new URL(request.url).pathname.split("/")[3];
      if (!Object.hasOwn(prepared.services, name)) { void request.body?.cancel().catch(() => {}); return new Response("Function not found", { status: 404 }); }
      const slot = await acquire(name);
      if (!slot) {
        void request.body?.cancel().catch(() => {});
        return Response.json({ code: "BUSY", message: "Function capacity reached" }, { status: 503 });
      }
      const deadline = new AbortController();
      const timer = setTimeout(() => deadline.abort(new Error("Function request timed out")), requestTimeoutMs);
      let finished = false, keepBody = false;
      const done = () => { if (!finished) { finished = true; clearTimeout(timer); release(slot); } };
      const signal = AbortSignal.any([request.signal, slot.abort.signal, deadline.signal]);
      try {
        let runtime;
        try { runtime = await abortable(slot.ready, signal); }
        catch (error) {
          if (request.signal.aborted || deadline.signal.aborted) throw error;
          console.error(`[functions] Could not prepare ${name}:`, error.diagnostics ?? error.message);
          void retire(slot);
          void request.body?.cancel().catch(() => {});
          return Response.json({ code: "BOOT_ERROR", message: "Function could not start; see server logs. Export a default fetch handler and install its dependencies." }, { status: 503 });
        }
        const callSignal = AbortSignal.any([signal, runtime.signal]);
        const original = new URL(request.url), url = new URL(runtime.url);
        url.pathname = original.pathname.replace(/^\/functions\/v1(?=\/|$)/, "") || "/"; url.search = original.search;
        const headers = endToEndHeaders(request.headers); headers.delete("expect"); headers.set("accept-encoding", "identity");
        if (!headers.has("host")) headers.set("host", original.host);
        const response = await fetch(url, { method: request.method, headers, body: request.body, signal: callSignal, redirect: "manual", duplex: "half" });
        const responseHeaders = endToEndHeaders(response.headers);
        const encodings = response.headers.get("content-encoding")?.toLowerCase().split(",").map(value => value.trim());
        if (response.body && encodings?.length && encodings.every(value => ["gzip", "x-gzip", "deflate", "br"].includes(value))) {
          responseHeaders.delete("content-encoding"); responseHeaders.delete("content-length");
        }
        if (!response.body) return new Response(null, { status: response.status, statusText: response.statusText, headers: responseHeaders });
        const reader = response.body.getReader();
        let controller;
        const cleanup = () => { callSignal.removeEventListener("abort", onAbort); done(); };
        const onAbort = () => {
          void reader.cancel(callSignal.reason).catch(() => {}); controller.error(callSignal.reason);
          if (deadline.signal.aborted || runtime.signal.aborted) void retire(slot);
          else slot.draining = true;
          cleanup();
        };
        const body = new ReadableStream({
          start(value) { controller = value; },
          async pull(value) {
            try { const chunk = await reader.read(); if (chunk.done) { value.close(); cleanup(); } else value.enqueue(chunk.value); }
            catch (error) { value.error(error); cleanup(); }
          },
          async cancel(reason) { slot.draining = true; callSignal.removeEventListener("abort", onAbort); try { await reader.cancel(reason); } catch {} finally { cleanup(); } },
        }, { highWaterMark: 0 });
        callSignal.addEventListener("abort", onAbort, { once: true });
        if (callSignal.aborted) onAbort();
        const result = new Response(body, { status: response.status, statusText: response.statusText, headers: responseHeaders });
        keepBody = true;
        return result;
      } catch (error) {
        void request.body?.cancel().catch(() => {});
        if (deadline.signal.aborted) { void retire(slot); return Response.json({ code: "TIMEOUT", message: "Function request timed out" }, { status: 504 }); }
        if (request.signal.aborted) { slot.draining = true; request.signal.throwIfAborted(); }
        console.error(`[functions] Request failed for ${name}:`, error.message);
        void retire(slot);
        return Response.json({ code: "WORKER_ERROR", message: "Function request failed; see server logs" }, { status: 500 });
      } finally { if (!keepBody) done(); }
    },
    async close() {
      closed = true; generation++;
      await Promise.all([...workers].map(retire));
      await reloading?.catch(() => {});
    },
  };
  app.config.functions = prepared.merged;
  if (Object.keys(prepared.services).length) app.drivers.functions = runner;
  return runner;
}
