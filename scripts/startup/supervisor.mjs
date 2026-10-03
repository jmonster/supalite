import { fork } from 'node:child_process';
import { performance } from 'node:perf_hooks';

export function runWorker({ worker, env, timeoutMs }) {
  return new Promise((resolve, reject) => {
    const start = performance.now();
    const child = fork(worker, [], { env, execArgv: [], silent: true });
    let ready;
    let complete;
    let spawnToVerifiedResponseMs;
    let stderr = '';
    let timedOut = false;
    child.stdout.on('data', () => {});
    child.stderr.on('data', (chunk) => { stderr = (stderr + chunk).slice(-16384); });
    child.on('message', (message) => {
      if (message?.type === 'ready') {
        ready = message.value;
        spawnToVerifiedResponseMs = performance.now() - start;
      }
      if (message?.type === 'complete') complete = message.value;
    });
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGKILL'); // The worker may be blocked in synchronous SQLite.
    }, Math.max(1, timeoutMs));
    child.on('error', (error) => { clearTimeout(timer); reject(error); });
    child.on('close', (code, signal) => {
      clearTimeout(timer);
      if (timedOut || code !== 0 || !ready || !complete) {
        reject(new Error(`Startup worker ${timedOut ? 'exceeded budget' : 'failed'} (exit=${code}, signal=${signal})${stderr ? `\n${stderr}` : ''}`));
        return;
      }
      resolve({ ...complete, spawnToVerifiedResponseMs, spawnToExitMs: performance.now() - start });
    });
  });
}

export function summarize(values) {
  const sorted = values.toSorted((a, b) => a - b);
  if (!sorted.length) throw new Error('Cannot summarize zero observations');
  const middle = Math.floor(sorted.length / 2);
  return {
    n: sorted.length,
    min: sorted[0],
    median: sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2,
    max: sorted.at(-1),
  };
}
