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
function m(r, e, t) {
  return {
    db: r,
    query: (s, n, l) => {
      let o = t(l);
      try {
        e.debug && console.log("[browser:sqlite] query", n, o);
        let i = n.trimStart().toUpperCase();
        if (i.startsWith("SELECT") || i.startsWith("WITH"))
          return {
            rows: r.exec(n, {
              bind: o,
              returnValue: "resultRows",
              rowMode: "object",
            }),
          };
        let d = r.prepare(n);
        try {
          (o.length > 0 && d.bind(o), d.stepReset());
        } finally {
          d.finalize();
        }
        let w = r.changes?.() ?? 0;
        return {
          numAffectedRows: w,
          insertId: w > 0 ? Number(r.lastInsertRowid?.() ?? 0) : void 0,
        };
      } catch (i) {
        let a = new Error(`Failed to execute query: ${n}
${JSON.stringify(o)}`);
        throw ((a.cause = i), (a.code = i?.code), a);
      }
    },
    close: () => r.close(),
    iterator: () => {
      throw new Error(
        "Browser sqlite-wasm does not support streaming iteration",
      );
    },
  };
}
var c = class extends SqliteConnection {
  kysely;
  driver;
  constructor(e) {
    (super(e), (this.driver = e.db));
    let t = new GenericSqliteDialect(
      () => m(this.driver, e, (s) => this.prepareBindParams(s)),
      (s) => {
        this.driver.exec("pragma foreign_keys = on");
      },
    );
    this.kysely = new Kysely({ dialect: t, plugins: this.withSqlitePlugins() });
  }
  async exec(e, ...t) {
    let s = e.trimStart().toUpperCase(),
      n = this.prepareBindParams(t);
    if (s.startsWith("SELECT") || s.startsWith("WITH"))
      return {
        rows: this.driver.exec(e, {
          bind: n,
          returnValue: "resultRows",
          rowMode: "object",
        }),
      };
    if (n.length > 0) {
      let o = this.driver.prepare(e);
      try {
        (o.bind(n), o.stepReset());
      } finally {
        o.finalize();
      }
    } else this.driver.exec(e);
  }
  async close() {
    this.driver.close();
  }
  async transaction(e) {
    this.driver.exec("BEGIN");
    try {
      for (let t of e) await this.exec(t);
      this.driver.exec("COMMIT");
    } catch (t) {
      try {
        this.driver.exec("ROLLBACK");
      } catch {}
      throw t;
    }
  }
};
async function f(r = {}) {
  let t = await (
      await import("@sqlite.org/sqlite-wasm").then((n) => n.default)
    )({ print: () => {}, printErr: () => {} }),
    s = new t.oo1.DB(r.url ?? ":memory:");
  return new c({ ...r, db: s });
}
export { c as BrowserSqliteConnection, f as createConnection };
