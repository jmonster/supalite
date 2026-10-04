import * as production from "../../upstream/lite-0.11.0/dist/cli/index.js";

// Compare the native path with the retained adapter path through the same
// importable production operations. Only native capability is hidden; queries,
// deserialization, introspection, formatting, and target execution stay real.
export async function upgradeApi(flavor = "streaming") {
  const api = { ...production, apply: production.runUpgrade, schema: production.collectUpgradeSource, rehearsal: production.rehearseUpgrade };
  if (flavor !== "legacy") return api;
  return Object.fromEntries(Object.entries(api).map(([name, operation]) => [name, (...args) => {
    if (args[0]?.connection) {
      const app = args[0], connection = app.connection;
      const adapter = new Proxy(connection, { get(target, key) {
        if (key === "driver") return undefined;
        const value = Reflect.get(target, key, target);
        return typeof value === "function" ? value.bind(target) : value;
      } });
      args[0] = new Proxy(app, { get(target, key) { return key === "connection" ? adapter : Reflect.get(target, key, target); } });
    }
    return operation(...args);
  }]));
}
export function migration(sql) {
  const filename = "20260101000000_application.sql";
  const parts = sql.split(";").map(value => value.trim()).filter(Boolean);
  return { sql, files: [{ filename, sql }], statements: parts.map((sql, i) => ({ file: filename, index: i + 1, total: parts.length, sql })) };
}
export async function materialize(tables) {
  const output = [];
  for (const table of tables) {
    const inserts = [];
    for await (const sql of table.inserts) inserts.push(sql);
    output.push({ ...table, inserts });
  }
  return output;
}
