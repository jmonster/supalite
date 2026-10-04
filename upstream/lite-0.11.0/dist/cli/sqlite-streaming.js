import { createRequire } from "node:module";
const requireBuiltin = createRequire(import.meta.url);
let databaseConstructor;
let builtinChecked = false;
/** Only the actual Node runtime and its native DatabaseSync qualify. Bun and
 * other adapters retain their shipped path, including Bun versions which
 * implement a node:sqlite compatibility module. Never load that module during
 * CLI startup or on an unsupported runtime. */
export function isNodeSqlite(connection) {
  if (
    connection.dialect !== "sqlite" ||
    !connection.driver ||
    process.release.name !== "node" ||
    !process.versions.node ||
    process.versions.bun ||
    process.versions.deno
  )
    return false;
  if (!builtinChecked) {
    builtinChecked = true;
    try {
      databaseConstructor = requireBuiltin("node:sqlite").DatabaseSync;
    } catch {
      /* A runtime without the native builtin keeps the legacy path. */
    }
  }
  return (
    typeof databaseConstructor === "function" &&
    connection.driver instanceof databaseConstructor
  );
}
/** Readiness/audit prepare eagerly; the cursor opens only when iteration starts. */
export async function openUpgradeRows(connection, sql, signal) {
  signal?.throwIfAborted();
  if (!isNodeSqlite(connection)) {
    const rows = (await connection.exec(sql))?.rows ?? [];
    return (async function* () {
      for (const row of rows) {
        signal?.throwIfAborted();
        yield row;
      }
    })();
  }
  const statement = connection.driver.prepare(sql);
  return (async function* () {
    const iterator = statement.iterate();
    try {
      for (;;) {
        signal?.throwIfAborted();
        const next = iterator.next();
        if (next.done) return;
        yield next.value;
      }
    } finally {
      iterator.return?.();
    }
  })();
}
/** One native SELECT cursor: the same per-SELECT snapshot as .all(). Finalize
 * on exhaustion, error, abort, or early return. No OFFSET paging or row copies. */
export async function* upgradeRows(connection, sql, signal) {
  yield* await openUpgradeRows(connection, sql, signal);
}
const busyConnections = new WeakSet();
/** A single application-data pass uses one read snapshot. The connection must
 * not be used concurrently by the caller. A borrowed transaction is never ended.
 * An owned transaction is rolled back after consumption, cancellation or error.
 * Its read lock/WAL history can be held across slow target awaits. */
export function beginReadSnapshot(connection, options = {}) {
  options.signal?.throwIfAborted();
  if (!isNodeSqlite(connection))
    throw new Error("Native Node SQLite connection required");
  const database = connection.driver;
  if (busyConnections.has(database))
    throw new Error("Upgrade source connection is already in use");
  const ownsTransaction = !database.isTransaction;
  if (ownsTransaction) database.exec("BEGIN");
  busyConnections.add(database);
  let disposed = false;
  const cursors = new Set();
  const close = () => {
    if (disposed) return;
    disposed = true;
    const failures = [];
    for (const cursor of cursors) {
      try {
        cursor.return?.();
      } catch (error) {
        failures.push(error);
      }
    }
    cursors.clear();
    if (ownsTransaction && database.isTransaction) {
      try {
        database.exec("ROLLBACK");
      } catch (error) {
        failures.push(error);
      }
    }
    options.signal?.removeEventListener("abort", abort);
    busyConnections.delete(database);
    if (failures.length)
      throw new AggregateError(
        failures,
        "Could not release upgrade source snapshot",
      );
  };
  const abort = () => {
    try {
      close();
    } catch (error) {
      console.error(error);
    }
  };
  options.signal?.addEventListener("abort", abort, { once: true });
  const assertOpen = () => {
    options.signal?.throwIfAborted();
    if (disposed) throw new Error("Upgrade source snapshot has been disposed");
    if (!database.isTransaction)
      throw new Error("Upgrade source transaction ended before consumption");
  };
  return {
    async dispose() {
      close();
    },
    attach(tables) {
      Object.defineProperty(tables, "dispose", { value: async () => close() });
      return tables;
    },
    rows(sql) {
      assertOpen();
      const statement = database.prepare(sql);
      const count = database
        .prepare(`SELECT COUNT(*) AS count FROM (${sql})`)
        .get()?.count;
      if (
        typeof count !== "number" ||
        !Number.isSafeInteger(count) ||
        count < 0
      )
        throw new Error("Invalid upgrade source row count");
      let started = false;
      return {
        length: count,
        async *[Symbol.asyncIterator]() {
          assertOpen();
          if (started)
            throw new Error("Upgrade rows can only be consumed once");
          started = true;
          const cursor = statement.iterate();
          cursors.add(cursor);
          let seen = 0;
          try {
            for (;;) {
              assertOpen();
              const next = cursor.next();
              if (next.done) break;
              if (++seen > count)
                throw new Error("Upgrade source row count changed");
              yield next.value;
            }
            if (seen !== count)
              throw new Error("Upgrade source row count changed");
          } finally {
            if (cursors.delete(cursor)) cursor.return?.();
          }
        },
      };
    },
    statements(length, generate) {
      let started = false;
      return {
        length,
        async *[Symbol.asyncIterator]() {
          assertOpen();
          if (started) throw new Error("Upgrade SQL can only be consumed once");
          started = true;
          yield* generate();
        },
      };
    },
  };
}
export async function disposeUserData(data, originalError) {
  try {
    await data?.dispose?.();
  } catch (cleanupError) {
    if (originalError === undefined) throw cleanupError;
    throw new AggregateError(
      [originalError, cleanupError],
      `${String(originalError)}; source snapshot cleanup also failed`,
      { cause: originalError },
    );
  }
}
/** Retain the existing 50/10/1 retry algorithm within each bounded chunk.
 * Bound UTF-8 bytes and rows; send a single oversized statement alone. */
export async function* sqlBatches(
  statements,
  { maxRows = 50, maxBytes = 256 * 1024 } = {},
) {
  if (
    !Number.isSafeInteger(maxRows) ||
    maxRows < 1 ||
    !Number.isSafeInteger(maxBytes) ||
    maxBytes < 1
  )
    throw new Error("SQL batch limits must be positive safe integers");
  let batch = [],
    bytes = 0;
  for await (const statement of statements) {
    const size = Buffer.byteLength(statement, "utf8") + 2;
    if (batch.length && (batch.length >= maxRows || bytes + size > maxBytes)) {
      yield batch;
      batch = [];
      bytes = 0;
    }
    batch.push(statement);
    bytes += size;
    if (batch.length >= maxRows || bytes >= maxBytes) {
      yield batch;
      batch = [];
      bytes = 0;
    }
  }
  if (batch.length) yield batch;
}
