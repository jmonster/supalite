import { registerHooks } from 'node:module';

// A deterministic regression check for parser avoidance, without a flaky RSS ceiling.
registerHooks({
  load(url, context, nextLoad) {
    if (/\/node_modules\/(?:pgsql-parser|libpg-query)\//.test(url)) {
      throw new Error(`Prepared startup unexpectedly loaded PostgreSQL parser: ${url}`);
    }
    return nextLoad(url, context);
  },
});
await import('../../scripts/startup/worker.mjs');
