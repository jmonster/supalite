// Native Bun worker bootstrap. Importing the function here avoids Bun's CLI
// auto-serve behavior; this bootstrap owns the sole managed HTTP listener.
let server;
let initialized = false;
let stopping = false;

function fail(error) {
  let message = error?.message ?? String(error);
  if (/\bDeno\b/.test(message))
    message += " Deno APIs are not supported. Export default { fetch(request) { ... } }, use portable Web APIs, and read environment values through node:process as in the portable example.";
  if (/(?:npm|jsr):/.test(message))
    message += " Deno npm:/jsr: imports are not supported. Install pinned packages with Bun and use bare package imports.";
  self.postMessage({ type: "error", message, diagnostics: `${message}\n${Bun.inspect(error, { colors: false })}` });
  stopping = true;
  process.exit(1);
}

self.onmessage = async ({ data }) => {
  if (data?.type === "shutdown") {
    stopping = true;
    try { await server?.stop(false); }
    finally { process.exit(0); }
    return;
  }
  if (initialized || stopping || data?.type !== "init") return;
  initialized = true;
  try {
    const module = await import(data.entrypoint);
    if (stopping) return;
    if (typeof module.default?.fetch !== "function")
      throw new TypeError("Function must export default { fetch(request) { ... } }; Deno.serve is not supported.");
    server = Bun.serve({
      hostname: "127.0.0.1", port: 0, development: false, idleTimeout: 0,
      fetch: request => module.default.fetch(request),
      error(error) {
        console.error("[functions]", error);
        return new Response("Internal Server Error", { status: 500 });
      },
    });
    self.postMessage({ type: "ready", port: server.port });
  } catch (error) { fail(error); }
};
