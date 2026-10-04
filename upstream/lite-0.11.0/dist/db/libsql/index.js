import c from "node:fs";
import a from "node:path";
import { createClient } from "@libsql/client";
import { Kysely } from "kysely";
import { GenericSqliteDialect } from "kysely-generic-sqlite";
import { SqliteConnection } from "@supabase/lite";
try {
  /**
   * Adding this to avoid warnings from node:sqlite being experimental
   */
  const { emitWarning } = process;
  process.emitWarning = (warning, ...args) => {
    if (warning.includes("SQLite is an experimental feature")) return;
    return emitWarning(warning, ...args);
  };
} catch {}
function u(e) {
  if (!e || e === ":memory:" || e === "file::memory:") return ":memory:";
  if (/^(libsql|https?|wss?):/.test(e)) return e;
  let t = e.startsWith("file://")
    ? e.slice(7)
    : e.startsWith("file:")
      ? e.slice(5)
      : e;
  return !t || t === ":memory:"
    ? ":memory:"
    : `file:${a.isAbsolute(t) ? t : a.resolve(process.cwd(), t)}`;
}
function l(e) {
  return e.rows.map((t) =>
    Object.fromEntries(e.columns.map((n, i) => [n, t[i]])),
  );
}
function y(e, t) {
  return {
    db: e,
    query: async (n, i, r = []) => {
      let s = await e.execute({ sql: i, args: t(r) });
      return {
        rows: l(s),
        insertId:
          s.lastInsertRowid !== void 0 ? BigInt(s.lastInsertRowid) : void 0,
        numAffectedRows: BigInt(s.rowsAffected),
      };
    },
    close: () => e.close(),
  };
}
var o = class extends SqliteConnection {
  kysely;
  driver;
  constructor(t = {}) {
    if ((super(t), t.client)) this.driver = t.client;
    else {
      let i = u(t.url);
      if (i.startsWith("file:")) {
        let r = a.dirname(i.slice(5));
        c.existsSync(r) || c.mkdirSync(r, { recursive: true });
      }
      this.driver = createClient({ ...t, url: i });
    }
    let n = new GenericSqliteDialect(
      () => y(this.driver, (i) => this.prepareBindParams(i)),
      async (i) => {
        await this.driver.execute("pragma foreign_keys = on");
      },
    );
    this.kysely = new Kysely({ dialect: n, plugins: this.withSqlitePlugins() });
  }
  async exec(t, ...n) {
    let i = t.trimStart().toUpperCase(),
      r = this.prepareBindParams(n);
    if (i.startsWith("SELECT") || i.startsWith("WITH")) {
      let s = await this.driver.execute({ sql: t, args: r });
      return { rows: l(s) };
    }
    r.length > 0
      ? await this.driver.execute({ sql: t, args: r })
      : await this.driver.executeMultiple(t);
  }
  async transaction(t, n) {
    n?.intent === "migration" &&
      (await this.driver.execute("PRAGMA foreign_keys=OFF;"));
    try {
      await this.driver.batch(t, "write");
    } finally {
      n?.intent === "migration" &&
        (await this.driver.execute("PRAGMA foreign_keys=ON;"),
        await this.clearSchemaCache());
    }
  }
  async close() {
    this.driver.close();
  }
};
function C(e = {}) {
  return new o(e);
}
function w(e = {}) {
  return new o(e);
}
export { o as LibsqlConnection, C as createLibsqlConnection, w as libsql };
