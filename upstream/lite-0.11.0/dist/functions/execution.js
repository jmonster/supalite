import { pathToFileURL } from "node:url";

export async function createFunctionWorker(entrypoint, environment, { signal, startupTimeoutMs = 15000, shutdownTimeoutMs = 2000 } = {}) {
  signal?.throwIfAborted();
  if (!globalThis.Bun) throw new Error("Local Functions require the Bun-hosted CLI (Bun 1.4.2).");
  for (const [name, value] of Object.entries({ startupTimeoutMs, shutdownTimeoutMs }))
    if (!Number.isFinite(value) || value <= 0) throw new Error(`${name} must be positive and finite`);
  const entrypointURL = pathToFileURL(entrypoint).href;
  const worker = new Worker(new URL("./worker.js", import.meta.url).href, {
    type: "module",
    // Bun gives each worker its own process.env/Bun.env. Do not inherit host secrets.
    // Workers run trusted local code; this is not a permissions sandbox.
    env: { ...environment },
  });
  const ready = Promise.withResolvers();
  const stopped = Promise.withResolvers();
  const lifetime = new AbortController();
  let closing, didClose = false;
  const stop = error => {
    lifetime.abort(error);
    ready.reject(error);
  };
  const onError = event => {
    event.preventDefault();
    const error = new Error(event.message || "Function worker failed");
    console.error("[functions] Worker failed:", error.message);
    stop(error);
    worker.terminate();
  };
  const onMessage = ({ data }) => {
    if (data?.type === "ready" && Number.isInteger(data.port) && data.port > 0 && data.port <= 65535) ready.resolve(data.port);
    else if (data?.type === "error") {
      const error = new Error(data.message || "Function worker failed to start");
      error.diagnostics = data.diagnostics || error.message;
      stop(error);
      worker.terminate();
    }
  };
  const onClose = event => {
    didClose = true;
    stopped.resolve();
    stop(new Error(`Function worker stopped (exit code ${event.code ?? 0})`));
  };
  worker.addEventListener("error", onError);
  worker.addEventListener("message", onMessage);
  worker.addEventListener("close", onClose);
  const onAbort = () => stop(signal.reason);
  signal?.addEventListener("abort", onAbort, { once: true });
  const timer = setTimeout(() => stop(new Error(`Function startup timed out after ${startupTimeoutMs}ms`)), startupTimeoutMs);
  async function waitForClose() {
    let timer;
    try {
      await Promise.race([stopped.promise, new Promise(resolve => { timer = setTimeout(resolve, shutdownTimeoutMs); })]);
    } finally { clearTimeout(timer); }
  }
  function close() {
    return closing ??= (async () => {
      stop(new Error("Function worker is closing"));
      try {
        if (!didClose) {
          try { worker.postMessage({ type: "shutdown" }); } catch {}
          await waitForClose();
        }
        if (!didClose) {
          worker.terminate();
          // A shutdown message is not confirmation. Observe Bun's native close event.
          await waitForClose();
        }
      } finally {
        signal?.removeEventListener("abort", onAbort);
        worker.removeEventListener("error", onError);
        worker.removeEventListener("message", onMessage);
        worker.removeEventListener("close", onClose);
      }
      if (!didClose) {
        const error = new Error("Bun function worker did not emit close after termination", { cause: lifetime.signal.reason });
        error.code = "FUNCTION_WORKER_SHUTDOWN";
        throw error;
      }
      return true;
    })();
  }
  let port;
  try {
    worker.postMessage({ type: "init", entrypoint: entrypointURL });
    port = await ready.promise;
    signal?.throwIfAborted();
    if (lifetime.signal.aborted) throw lifetime.signal.reason;
    signal?.removeEventListener("abort", onAbort);
  } catch (reason) {
    const error = reason instanceof Error ? reason : new Error(String(reason));
    try { await close(); }
    catch (shutdownError) {
      error.shutdownFailed = true;
      error.diagnostics = `${error.diagnostics ?? error.stack ?? error.message}\n${shutdownError.message}`;
    }
    throw error;
  } finally { clearTimeout(timer); }
  return {
    url: `http://127.0.0.1:${port}`,
    signal: lifetime.signal,
    close,
  };
}

// Framing belongs to each HTTP connection, not the application response.
export function endToEndHeaders(input) {
  const headers = new Headers(input);
  for (const token of (headers.get("connection") ?? "").split(","))
    if (/^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/.test(token.trim())) headers.delete(token.trim());
  for (const name of ["connection", "keep-alive", "proxy-connection", "proxy-authenticate", "proxy-authorization", "te", "trailer", "transfer-encoding", "upgrade"])
    headers.delete(name);
  return headers;
}
