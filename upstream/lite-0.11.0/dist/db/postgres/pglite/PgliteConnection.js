import { PGlite } from "@electric-sql/pglite";
export { PGlite } from "@electric-sql/pglite";
import {
  Kysely,
  sql,
  PostgresQueryCompiler,
  PostgresIntrospector,
  PostgresAdapter,
  CompiledQuery,
} from "kysely";
import {
  Connection,
  invariant,
  RelationNotFoundError,
  DataLossError,
} from "@supabase/lite";
import { isn } from "@electric-sql/pglite/contrib/isn";
import { ltree } from "@electric-sql/pglite/contrib/ltree";
import { file_fdw } from "@electric-sql/pglite/contrib/file_fdw";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";
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
var B = class {
    #e;
    #t;
    constructor(e, t) {
      ((this.#e = e), (this.#t = t));
    }
    async acquireConnection() {
      return new D(this.#e);
    }
    async beginTransaction(e, t) {
      await e.executeQuery(CompiledQuery.raw("BEGIN"));
    }
    async commitTransaction(e) {
      await e.executeQuery(CompiledQuery.raw("COMMIT"));
    }
    async rollbackTransaction(e) {
      await e.executeQuery(CompiledQuery.raw("ROLLBACK"));
    }
    async destroy() {
      this.#t && (await this.#e.close());
    }
    async init() {}
    async releaseConnection(e) {}
  },
  D = class {
    #e;
    constructor(e) {
      this.#e = e;
    }
    async executeQuery(e) {
      let t = await this.#e.query(e.sql, [...e.parameters]),
        s = t.affectedRows;
      return {
        rows: t.rows,
        numAffectedRows: typeof s == "number" ? BigInt(s) : void 0,
      };
    }
    async *streamQuery() {
      throw new Error("PGlite does not support streaming.");
    }
  },
  T = class {
    client;
    #e = true;
    constructor(e, t) {
      let s = { ...t };
      if (typeof e == "object" && e instanceof PGlite) {
        ((this.client = e), (this.#e = false));
        return;
      }
      (typeof e == "string" ? (s = { dataDir: e, ...s }) : (s = e ?? {}),
        (this.client = new PGlite(s)));
    }
    dialect = {
      createAdapter: () => new PostgresAdapter(),
      createDriver: () => new B(this.client, this.#e),
      createIntrospector: (e) => new PostgresIntrospector(e),
      createQueryCompiler: () => new PostgresQueryCompiler(),
    };
  };
var O = ["anon", "authenticated", "service_role"];
function Te(n) {
  return n === "service_role" ? "NOLOGIN BYPASSRLS" : "NOLOGIN";
}
function C(n) {
  return n.size === 0
    ? ""
    : `DO $$ BEGIN${[...n]
        .map(
          (t) => `
   IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${t}') THEN
      CREATE ROLE ${t} ${Te(t)};
   END IF;`,
        )
        .join("")}
END $$;
`;
}
var Q = C(new Set(O));
function Y(n, e) {
  return n ? (n.quoted ? n.value === e : n.value.toLowerCase() === e) : false;
}
function h(n) {
  return n?.quoted ? n.value : n?.value.toLowerCase();
}
function Oe(n, e) {
  let t = "",
    s = e + 1;
  for (; s < n.length; ) {
    if (n[s] === '"' && n[s + 1] === '"') {
      ((t += '"'), (s += 2));
      continue;
    }
    if (n[s] === '"') return { token: { value: t, quoted: true }, end: s + 1 };
    ((t += n[s]), s++);
  }
  return { token: { value: t, quoted: true }, end: s };
}
function Ce(n, e) {
  let t = e + 1;
  for (; t < n.length; ) {
    if (n[t] === "'" && n[t + 1] === "'") {
      t += 2;
      continue;
    }
    if (n[t] === "'") return t + 1;
    t++;
  }
  return t;
}
function Le(n, e) {
  let t = /^\$[A-Za-z_][A-Za-z0-9_]*\$|^\$\$/.exec(n.slice(e))?.[0];
  if (!t) return;
  let s = e + t.length,
    o = n.indexOf(t, s);
  return o === -1 ? n.length : o + t.length;
}
function V(n) {
  let e = [],
    t = 0;
  for (; t < n.length; ) {
    let s = n[t],
      o = n[t + 1];
    if (/\s/.test(s)) {
      t++;
      continue;
    }
    if (s === "-" && o === "-") {
      for (
        t += 2;
        t < n.length &&
        n[t] !==
          `
`;

      )
        t++;
      continue;
    }
    if (s === "/" && o === "*") {
      for (t += 2; t < n.length && !(n[t] === "*" && n[t + 1] === "/"); ) t++;
      t = t < n.length ? t + 2 : t;
      continue;
    }
    if (s === "'") {
      t = Ce(n, t);
      continue;
    }
    if (s === "$") {
      let a = Le(n, t);
      if (a !== void 0) {
        t = a;
        continue;
      }
    }
    if (s === '"') {
      let { token: a, end: c } = Oe(n, t);
      (e.push(a), (t = c));
      continue;
    }
    if (s === "," || s === ";") {
      (e.push({ value: s, quoted: false }), t++);
      continue;
    }
    if (/[A-Za-z_]/.test(s)) {
      let a = t;
      for (t++; t < n.length && /[A-Za-z0-9_$]/.test(n[t]); ) t++;
      e.push({ value: n.slice(a, t).toLowerCase(), quoted: false });
      continue;
    }
    t++;
  }
  return e;
}
function xe(n, e) {
  let t = h(n[e]),
    s = h(n[e + 1]);
  if (
    (t === "create" || t === "alter") &&
    (s === "role" || s === "user" || s === "group")
  )
    return n[e + 2];
}
function L(n) {
  let e = new Set(),
    t = V(n);
  for (let s = 0; s < t.length; s++) {
    if (h(t[s]) !== "create") continue;
    let o = xe(t, s);
    for (let a of O) Y(o, a) && e.add(a);
  }
  return e;
}
function $(n, e, t) {
  let s = new Set([
    ";",
    "as",
    "by",
    "check",
    "for",
    "granted",
    "in",
    "on",
    "option",
    "using",
    "where",
    "with",
  ]);
  for (let o = e; o < n.length; o++) {
    let a = h(n[o]);
    if (!a || s.has(a)) return;
    for (let c of O) Y(n[o], c) && t.add(c);
  }
}
function Ie(n) {
  let e = [],
    t = [];
  for (let s of n) {
    if (h(s) === ";") {
      (t.length > 0 && e.push(t), (t = []));
      continue;
    }
    t.push(s);
  }
  return (t.length > 0 && e.push(t), e);
}
function j(n, e) {
  return n.some((t) => h(t) === e);
}
function ke(n) {
  let e = new Set(),
    t = Ie(V(n));
  for (let s of t) {
    let o = h(s[0]);
    for (let r = 0; r < s.length; r++) {
      let l = h(s[r]);
      (l === "to" &&
        (j(s, "grant") || j(s, "policy") || h(s[r - 1]) === "owner") &&
        $(s, r + 1, e),
        l === "from" && o === "revoke" && $(s, r + 1, e));
    }
    let a = s.findIndex((r) => h(r) === "to"),
      c = s.findIndex((r) => h(r) === "on");
    o === "grant" && a > 1 && (c === -1 || a < c) && $(s, 1, e);
  }
  return e;
}
function v(n) {
  let e = L(n);
  return new Set([...ke(n)].filter((t) => !e.has(t)));
}
function z(n) {
  let e = L(n);
  return new Set(O.filter((t) => !e.has(t)));
}
function F(n) {
  let e = n.trim();
  return (e.startsWith('"') && e.endsWith('"')) ||
    (e.startsWith("`") && e.endsWith("`")) ||
    (e.startsWith("[") && e.endsWith("]"))
    ? e.slice(1, -1)
    : e;
}
function Pe(n) {
  let e = [],
    t = "",
    s = 0,
    o = null;
  for (let a = 0; a < n.length; a++) {
    let c = n[a];
    if (o) {
      ((t += c), c === o && (o = null));
      continue;
    }
    if (c === '"' || c === "`" || c === "'") {
      ((o = c), (t += c));
      continue;
    }
    if ((c === "(" ? s++ : c === ")" && s > 0 && s--, c === "," && s === 0)) {
      (e.push(t.trim()), (t = ""));
      continue;
    }
    t += c;
  }
  return (t.trim() && e.push(t.trim()), e);
}
function Be(n) {
  let e = n.match(/^(.*?)\s+as\s+(.+)$/i),
    t = e ? e[1].trim() : n.trim(),
    s = e ? e[2].trim() : void 0;
  if (!s) {
    let c = n.match(/^(.+?)\s+((?:"[^"]+"|`[^`]+`|\[[^\]]+\]|\w+))$/);
    c && !/[()]/.test(c[1]) && ((t = c[1].trim()), (s = c[2].trim()));
  }
  let o = t.split(".").map(F);
  if (o.length > 2) return null;
  let a = o.at(-1);
  return !a || !/^[A-Za-z_][\w$]*$/.test(a)
    ? null
    : { baseColumn: a, viewColumn: s ? F(s) : a };
}
function X(n) {
  return !!(n && /[A-Za-z0-9_$]/.test(n));
}
function De(n) {
  let e = /\bselect\b/i.exec(n);
  if (!e) return null;
  let t = 0,
    s = null;
  for (let o = e.index + e[0].length; o < n.length; o++) {
    let a = n[o];
    if (s) {
      a === s && (s = null);
      continue;
    }
    if (a === '"' || a === "`" || a === "'") {
      s = a;
      continue;
    }
    if (a === "(") {
      t++;
      continue;
    }
    if (a === ")" && t > 0) {
      t--;
      continue;
    }
    if (
      t === 0 &&
      n.slice(o, o + 4).toLowerCase() === "from" &&
      !X(n[o - 1]) &&
      !X(n[o + 4])
    )
      return {
        selectList: n.slice(e.index + e[0].length, o).trim(),
        fromRest: n.slice(o + 4).trim(),
      };
  }
  return null;
}
function $e(n) {
  let e = 0,
    t = [];
  for (; e < n.length; ) {
    for (; /\s/.test(n[e] ?? ""); ) e++;
    let s = n[e],
      o = "";
    if (s === '"' || s === "`") {
      let r = n.indexOf(s, e + 1);
      if (r === -1) return null;
      ((o = n.slice(e, r + 1)), (e = r + 1));
    } else if (s === "[") {
      let r = n.indexOf("]", e + 1);
      if (r === -1) return null;
      ((o = n.slice(e, r + 1)), (e = r + 1));
    } else {
      let r = /^[A-Za-z_][\w$]*/.exec(n.slice(e));
      if (!r) return null;
      ((o = r[0]), (e += o.length));
    }
    t.push(o);
    let a = n.slice(e),
      c = /^\s*\./.exec(a);
    if (!c) break;
    e += c[0].length;
  }
  return t.length === 0 ? null : { raw: t.join("."), rest: n.slice(e).trim() };
}
function Z(n, e, t) {
  let s = n.get(e) ?? [];
  (s.includes(t) || s.push(t), n.set(e, s));
}
function ve(n, e) {
  if (!n) return null;
  let t = De(n);
  if (!t) return null;
  let s = $e(t.fromRest);
  if (!s) return null;
  let { raw: o, rest: a } = s;
  if (/\b(join|union|intersect|except)\b/i.test(a)) return null;
  let c = o.split(".").map(F).at(-1);
  if (!c) return null;
  let r = new Map(),
    l = e.get(c) ?? new Set();
  for (let f of Pe(t.selectList)) {
    let m = f.trim();
    if (m === "*" || m.endsWith(".*")) {
      for (let g of l) Z(r, g, g);
      continue;
    }
    let p = Be(f);
    p && Z(r, p.baseColumn, p.viewColumn);
  }
  return r.size === 0 ? null : { baseTable: c, columns: r };
}
function Fe(n, e) {
  let t = new Map();
  for (let [s, o] of e) {
    let a = [];
    for (let c of o) {
      let r = n.get(c);
      if (r) for (let l of r) a.includes(l) || a.push(l);
    }
    a.length > 0 && t.set(s, a);
  }
  return t;
}
function Me(n) {
  let e = new Map(),
    t = new Map();
  for (let r of n.columns ?? []) {
    let l = t.get(r.table) ?? new Set();
    (l.add(r.name), t.set(r.table, l));
  }
  let s = (r, l) => {
    let f = e.get(r) ?? [];
    (f.some((m) => m.name === l.name && m.schema === l.schema) || f.push(l),
      e.set(r, f));
  };
  for (let r of n.tables ?? []) {
    if (r.type !== "table") continue;
    let l = t.get(r.name);
    l &&
      s(r.name, {
        name: r.name,
        schema: r.schema,
        columnByBaseColumn: new Map([...l].map((f) => [f, [f]])),
      });
  }
  let o = new Map();
  for (let r of n.views ?? []) {
    let l = ve(r.sql, t);
    if (!l) continue;
    let f = t.get(r.name);
    if (!f) continue;
    let m = new Map();
    for (let [g, y] of l.columns) {
      let d = y.filter((_) => f.has(_));
      d.length > 0 && m.set(g, d);
    }
    if (m.size === 0) continue;
    let p = {
      name: r.name,
      schema: r.schema,
      columnByBaseColumn: m,
      fromRelation: l.baseTable,
    };
    o.set(r.name, p);
  }
  let a = 16;
  function c(r, l, f) {
    if (l > a) return null;
    let m = r.fromRelation;
    if (e.has(m))
      return { physicalBase: m, columnByBaseColumn: r.columnByBaseColumn };
    let p = o.get(m);
    if (!p || f.has(m)) return null;
    f.add(m);
    let g = c(p, l + 1, f);
    if ((f.delete(m), !g)) return null;
    let y = Fe(r.columnByBaseColumn, g.columnByBaseColumn);
    return y.size === 0
      ? null
      : { physicalBase: g.physicalBase, columnByBaseColumn: y };
  }
  for (let r of o.values()) {
    let l = c(r, 0, new Set([r.name]));
    l &&
      s(l.physicalBase, {
        name: r.name,
        schema: r.schema,
        columnByBaseColumn: l.columnByBaseColumn,
      });
  }
  return e;
}
function ee(n) {
  return `${n.foreign_key_group ?? ""}:${n.table}.${n.column}->${n.ref_table}.${n.ref_column}`;
}
function He(n) {
  let e = new Map();
  for (let t of n) {
    let s = `${t.schema}.${t.table}.${t.foreign_key_name}.${t.ref_schema ?? ""}.${t.ref_table}`,
      o = e.get(s);
    o ? o.push(t) : e.set(s, [t]);
  }
  return [...e.values()];
}
function Ue(n) {
  let e = [[]];
  for (let t of n) {
    let s = [];
    for (let o of e) for (let a of t) s.push([...o, a]);
    e = s;
  }
  return e;
}
function We(n, e, t, s) {
  let o = s.map((c) => c.childColumn).join(","),
    a = s.map((c) => c.parentColumn).join(",");
  return `${t}:${n.name}(${o})->${e.name}(${a})`;
}
function te(n) {
  if (!n.foreign_keys?.length || !n.views?.length) return n;
  let e = Me(n),
    t = new Set(n.foreign_keys.map(ee)),
    s = [];
  for (let o of He(n.foreign_keys)) {
    let a = o[0],
      c = e.get(a.table) ?? [],
      r = e.get(a.ref_table) ?? [];
    for (let l of c)
      for (let f of r) {
        if (l.schema !== f.schema) continue;
        let m = [];
        for (let p of o) {
          let g = l.columnByBaseColumn.get(p.column) ?? [],
            y = f.columnByBaseColumn.get(p.ref_column) ?? [],
            d = g.flatMap((_) =>
              y.map((S) => ({ fk: p, childColumn: _, parentColumn: S })),
            );
          if (d.length === 0) {
            m.length = 0;
            break;
          }
          m.push(d);
        }
        for (let p of Ue(m)) {
          let y =
            l.name === a.table &&
            f.name === a.ref_table &&
            p.every(
              (d) =>
                d.childColumn === d.fk.column &&
                d.parentColumn === d.fk.ref_column,
            )
              ? void 0
              : We(l, f, a.foreign_key_name, p);
          for (let d of p) {
            let _ = {
                ...d.fk,
                table: l.name,
                column: d.childColumn,
                schema: l.schema,
                ref_table: f.name,
                ref_column: d.parentColumn,
                ref_schema: f.schema,
                foreign_key_group: y,
              },
              S = ee(_);
            t.has(S) || (t.add(S), s.push(_));
          }
        }
      }
  }
  return s.length ? { ...n, foreign_keys: [...n.foreign_keys, ...s] } : n;
}
var A = "anon, authenticated, service_role",
  Ge = new Set(["anon", "authenticated", "service_role"]);
function ne(n) {
  return `"${n.replace(/"/g, '""')}"`;
}
var N = class extends Error {
    constructor(t) {
      super("Force rollback");
      this.result = t;
    }
  },
  x = class extends Connection {
    dialect = "postgres";
    harnessHoldingOuterTx = false;
    constructor(e) {
      super({
        ...e,
        baseSchema: `
            ${e.baseSchema ?? ""}
         
            CREATE SCHEMA IF NOT EXISTS auth;

            -- Function to get current user ID (for RLS policies)
            CREATE OR REPLACE FUNCTION auth.uid() RETURNS UUID AS $$
              SELECT NULLIF(current_setting('request.jwt.claim.sub', true), '')::uuid;
            $$ LANGUAGE SQL STABLE;
            
            -- Function to get current user role (for RLS policies)
            CREATE OR REPLACE FUNCTION auth.role() RETURNS TEXT AS $$
              SELECT NULLIF(current_setting('request.jwt.claim.role', true), '');
            $$ LANGUAGE SQL STABLE;
            
            -- Function to get current user email (for RLS policies)
            CREATE OR REPLACE FUNCTION auth.email() RETURNS TEXT AS $$
              SELECT NULLIF(current_setting('request.jwt.claim.email', true), '');
            $$ LANGUAGE SQL STABLE;
            
            -- Function to get JWT claims (for RLS policies)
            CREATE OR REPLACE FUNCTION auth.jwt() RETURNS JSONB AS $$
              SELECT COALESCE(
                NULLIF(current_setting('request.jwt.claims', true), ''),
                '{}'
              )::jsonb;
            $$ LANGUAGE SQL STABLE;
         `,
      });
    }
    async introspect(e) {
      invariant(
        typeof e == "object" || e === void 0,
        "options must be an object",
      );
      let t = e?.useCache ?? false,
        s = await this.readCachedIntrospection({ useCache: t });
      if (s) return s;
      try {
        let o = await sql`
            SELECT
               tbls.table_name AS "name",
               tbls.table_schema AS "schema",
               tbls.table_type AS "type",
               COALESCE(s.n_live_tup, 0) AS "rows"
            FROM information_schema.tables tbls
               LEFT JOIN pg_stat_user_tables s
                         ON tbls.table_schema = s.schemaname AND tbls.table_name = s.relname
            WHERE
               tbls.table_schema NOT IN ('information_schema', 'pg_catalog')
               AND tbls.table_type IN ('BASE TABLE', 'FOREIGN TABLE')
               -- Individual partitions are hidden from the relation cache (like PostgREST):
               -- direct access -> PGRST205, embedding -> PGRST200. The partitioned parent
               -- (relkind 'p', relispartition = false) stays exposed.
               AND NOT EXISTS (
                  SELECT 1
                  FROM pg_catalog.pg_class pc
                     JOIN pg_catalog.pg_namespace pn ON pn.oid = pc.relnamespace
                  WHERE pc.relname = tbls.table_name
                     AND pn.nspname = tbls.table_schema
                     AND pc.relispartition
               )
            ORDER BY tbls.table_schema, tbls.table_name
         `.execute(this.kysely),
          a = await sql`
            SELECT
               mv.schemaname AS "schema",
               mv.matviewname AS "name",
               mv.definition  AS "sql"
            FROM pg_catalog.pg_matviews mv
            WHERE mv.schemaname NOT IN ('information_schema', 'pg_catalog')
            ORDER BY mv.schemaname, mv.matviewname
         `.execute(this.kysely),
          c = await sql`
            SELECT
               n.nspname          AS "schema",
               c.relname          AS "table",
               a.attname          AS "name",
               a.attnum           AS "ordinal_position",
               format_type(a.atttypid, a.atttypmod) AS "type",
               NOT a.attnotnull   AS "nullable",
               pg_get_expr(d.adbin, d.adrelid) AS "default_value"
            FROM pg_catalog.pg_class c
               JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
               JOIN pg_catalog.pg_attribute a ON a.attrelid = c.oid
               LEFT JOIN pg_catalog.pg_attrdef d
                         ON d.adrelid = c.oid AND d.adnum = a.attnum
            WHERE
               c.relkind = 'm'
               AND n.nspname NOT IN ('information_schema', 'pg_catalog')
               AND a.attnum > 0
               AND NOT a.attisdropped
            ORDER BY n.nspname, c.relname, a.attnum
         `.execute(this.kysely),
          r = o.rows.map((i) => ({
            name: i.name,
            schema: i.schema,
            type: "table",
            rows: Number(i.rows),
            sql: "",
            engine: "",
            collation: "",
          }));
        for (let i of a.rows)
          r.push({
            name: i.name,
            schema: i.schema,
            type: "table",
            rows: 0,
            sql: "",
            engine: "",
            collation: "",
          });
        let f = (
          await sql`
            SELECT
               cols.table_name AS "table",
               cols.table_schema AS "schema",
               cols.column_name AS "name",
               cols.ordinal_position AS "ordinal_position",
               CASE
                  WHEN cols.column_default IS NOT NULL AND cols.column_default LIKE 'nextval(%' THEN
                     CASE
                        WHEN LOWER(cols.data_type) = 'smallint' THEN 'smallserial'
                        WHEN LOWER(cols.data_type) = 'integer' THEN 'serial'
                        WHEN LOWER(cols.data_type) = 'bigint' THEN 'bigserial'
                        ELSE LOWER(cols.data_type)
                        END
                  WHEN cols.data_type = 'ARRAY' THEN format_type(pt.typelem, NULL)
                  WHEN LOWER(cols.data_type) = 'user-defined' THEN format_type(pt.oid, NULL)
                  ELSE LOWER(cols.data_type)
                  END AS "type",
               CASE WHEN cols.is_nullable = 'YES' THEN true ELSE false END AS "nullable",
               CASE
                  WHEN cols.column_default IS NOT NULL AND cols.column_default LIKE 'nextval(%'
                     THEN NULL
                  ELSE cols.column_default
                  END AS "default_value",
               cols.character_maximum_length::text AS "character_maximum_length", CASE
                                                                                     WHEN cols.data_type IN ('numeric', 'decimal')
                                                                                        THEN
                                                                                        json_build_object(
                                                                                           'precision',
                                                                                           cols.numeric_precision,
                                                                                           'scale',
                                                                                           cols.numeric_scale)
                                                                                     ELSE NULL
               END AS "precision",
               CASE
                  WHEN cols.is_identity = 'YES' THEN true
                  WHEN cols.column_default IS NOT NULL AND cols.column_default LIKE 'nextval(%'
                     THEN true
                  ELSE false
                  END AS "is_identity",
               COALESCE(cols.collation_name, '') AS "collation",
               cols.udt_name AS "udt_name",
               cols.udt_schema AS "udt_schema",
               CASE WHEN pt.typtype = 'd' THEN pt.typname ELSE cols.udt_name END AS "domain_type",
               CASE WHEN cols.is_generated = 'NEVER' THEN false ELSE true END AS "is_generated"
            FROM information_schema.columns cols
               LEFT JOIN pg_catalog.pg_class c ON c.relname = cols.table_name
               JOIN pg_catalog.pg_namespace n
                    ON n.oid = c.relnamespace AND n.nspname = cols.table_schema
               LEFT JOIN pg_catalog.pg_attribute attr
                         ON attr.attrelid = c.oid AND attr.attname = cols.column_name
               LEFT JOIN pg_catalog.pg_type pt ON pt.oid = attr.atttypid
            WHERE cols.table_schema NOT IN ('information_schema', 'pg_catalog')
            ORDER BY cols.table_schema, cols.table_name, cols.ordinal_position
         `.execute(this.kysely)
        ).rows.map((i) => ({
          table: i.table,
          schema: i.schema,
          name: i.name,
          type: i.type,
          nullable: i.nullable,
          default_value: i.default_value,
          is_primary_key: !1,
          ordinal_position: Number(i.ordinal_position),
          character_maximum_length: i.character_maximum_length ?? null,
          precision: i.precision ?? null,
          is_identity: i.is_identity,
          collation: i.collation,
          pg_type: i.domain_type ?? i.udt_name ?? void 0,
          udt_schema: i.udt_schema ?? void 0,
          is_generated: i.is_generated ?? !1,
        }));
        for (let i of c.rows)
          f.push({
            table: i.table,
            schema: i.schema,
            name: i.name,
            type: i.type ?? "",
            nullable: i.nullable ?? !0,
            default_value: i.default_value ?? null,
            is_primary_key: !1,
            ordinal_position: Number(i.ordinal_position),
            character_maximum_length: null,
            precision: null,
            is_identity: !1,
            collation: "",
            pg_type: void 0,
            udt_schema: void 0,
            is_generated: !1,
          });
        let p = (
            await sql`
            SELECT
               ns.nspname AS "schema",
               cl.relname AS "table",
               att.attname AS "column",
               nr.nspname AS "ref_schema",
               ref_cl.relname AS "ref_table",
               ref_att.attname AS "ref_column",
               con.conname AS "foreign_key_name",
               pg_get_constraintdef(con.oid) AS "fk_def"
            FROM pg_constraint con
               JOIN pg_class cl ON cl.oid = con.conrelid
               JOIN pg_namespace ns ON ns.oid = cl.relnamespace
               JOIN pg_class ref_cl ON ref_cl.oid = con.confrelid
               JOIN pg_namespace nr ON nr.oid = ref_cl.relnamespace
               CROSS JOIN LATERAL unnest(con.conkey, con.confkey) WITH ORDINALITY AS cols(conkey_num, confkey_num, ord)
            JOIN pg_attribute att
            ON att.attrelid = con.conrelid AND att.attnum = cols.conkey_num
               JOIN pg_attribute ref_att ON ref_att.attrelid = con.confrelid AND ref_att.attnum = cols.confkey_num
            WHERE
               con.contype = 'f'
               AND ns.nspname NOT IN (
               'information_schema'
               , 'pg_catalog')
               -- Skip FK rows on/to individual partitions (partition-level copies of an
               -- inherited FK). Keeps the partitioned parent's FK; prevents a partition
               -- surfacing as a spurious embed candidate.
               AND NOT cl.relispartition
               AND NOT ref_cl.relispartition
            ORDER BY ns.nspname, cl.relname, con.conname, cols.ord
         `.execute(this.kysely)
          ).rows.map((i) => ({
            table: i.table,
            column: i.column,
            schema: i.schema,
            ref_table: i.ref_table,
            ref_column: i.ref_column,
            foreign_key_name: i.foreign_key_name,
            fk_def: i.fk_def,
            on_update: "",
            on_delete: "",
          })),
          y = (
            await sql`
            SELECT
               ns.nspname AS "schema",
               cl.relname AS "table",
               array_agg(att.attname ORDER BY cols.ord) AS "columns"
            FROM pg_constraint con
               JOIN pg_class cl ON cl.oid = con.conrelid
               JOIN pg_namespace ns ON ns.oid = cl.relnamespace
               CROSS JOIN LATERAL unnest(con.conkey) WITH ORDINALITY AS cols(attnum, ord)
            JOIN pg_attribute att
            ON att.attrelid = con.conrelid AND att.attnum = cols.attnum
            WHERE
               con.contype = 'p'
               AND ns.nspname NOT IN (
               'information_schema'
               , 'pg_catalog')
            GROUP BY ns.nspname, cl.relname, con.oid
         `.execute(this.kysely)
          ).rows.map((i) => ({
            table: i.table,
            columns: i.columns,
            schema: i.schema,
            field_count: i.columns.length,
          })),
          d = new Set(
            y.flatMap((i) =>
              i.columns.map((w) => `${i.schema}.${i.table}.${w}`),
            ),
          );
        for (let i of f)
          i.is_primary_key = d.has(`${i.schema}.${i.table}.${i.name}`);
        let S = (
            await sql`
            SELECT
               tnsp.nspname AS "schema",
               cl.relname AS "table",
               ic.relname AS "name",
               idx.indisunique AS "unique",
               array_agg(att.attname ORDER BY a.ord) AS "columns"
            FROM pg_index idx
               JOIN pg_class cl ON cl.oid = idx.indrelid
               JOIN pg_namespace tnsp ON cl.relnamespace = tnsp.oid
               JOIN pg_class ic ON ic.oid = idx.indexrelid
               CROSS JOIN LATERAL unnest(idx.indkey) WITH ORDINALITY AS a(attnum, ord)
            JOIN pg_attribute att
            ON att.attrelid = cl.oid AND att.attnum = a.attnum
            WHERE
               idx.indisunique = true
               AND NOT idx.indisprimary
               AND tnsp.nspname NOT IN (
               'information_schema'
               , 'pg_catalog')
            GROUP BY tnsp.nspname, cl.relname, ic.relname, idx.indisunique
         `.execute(this.kysely)
          ).rows.map((i) => ({
            table: i.table,
            name: i.name,
            unique: i.unique,
            columns: i.columns,
            schema: i.schema,
          })),
          q = (
            await sql`
            SELECT
               views.schemaname AS "schema",
               views.viewname AS "name",
               views.definition AS "sql"
            FROM pg_views views
            WHERE views.schemaname NOT IN ('information_schema', 'pg_catalog')
            ORDER BY views.schemaname, views.viewname
         `.execute(this.kysely)
          ).rows.map((i) => ({
            name: i.name,
            schema: i.schema,
            sql: i.sql ?? "",
          }));
        for (let i of a.rows)
          q.push({ name: i.name, schema: i.schema, sql: i.sql ?? "" });
        let me = (
            await sql`
            SELECT
               n.nspname AS "schema",
               cl.relname AS "table",
               substring(pg_get_constraintdef(c.oid) FROM 'CHECK \\((.*)\\)') AS "expression"
            FROM pg_constraint c
               JOIN pg_class cl ON cl.oid = c.conrelid
               JOIN pg_namespace n ON n.oid = cl.relnamespace
            WHERE
               c.contype = 'c'
               AND n.nspname NOT IN ('information_schema', 'pg_catalog')
            ORDER BY n.nspname, cl.relname
         `.execute(this.kysely)
          ).rows.map((i) => ({
            schema: i.schema,
            table: i.table,
            expression: i.expression ?? "",
          })),
          pe = (
            await sql`
            SELECT
               n.nspname AS "schema",
               cl.relname AS "table",
               c.conname AS "name",
               array_agg(att.attname ORDER BY cols.ord) AS "columns"
            FROM pg_constraint c
               JOIN pg_class cl ON cl.oid = c.conrelid
               JOIN pg_namespace n ON n.oid = cl.relnamespace
               CROSS JOIN LATERAL unnest(c.conkey) WITH ORDINALITY AS cols(attnum, ord)
               JOIN pg_attribute att ON att.attrelid = c.conrelid AND att.attnum = cols.attnum
            WHERE
               c.contype = 'u'
               AND n.nspname NOT IN ('information_schema', 'pg_catalog')
            GROUP BY n.nspname, cl.relname, c.conname, c.oid
         `.execute(this.kysely)
          ).rows.map((i) => ({
            schema: i.schema,
            table: i.table,
            name: i.name,
            columns: i.columns,
          })),
          fe = (
            await sql`
            SELECT
               n.nspname AS "schema",
               cl.relname AS "table",
               att.attname AS "column",
               d.description AS "text"
            FROM pg_description d
               JOIN pg_class cl ON cl.oid = d.objoid
               JOIN pg_namespace n ON n.oid = cl.relnamespace
               LEFT JOIN pg_attribute att
                         ON att.attrelid = cl.oid AND att.attnum = d.objsubid AND d.objsubid > 0
            WHERE
               n.nspname NOT IN ('information_schema', 'pg_catalog')
               AND cl.relkind IN ('r', 'v', 'm', 'f', 'p')
               AND d.description IS NOT NULL
         `.execute(this.kysely)
          ).rows.map((i) => ({
            schema: i.schema,
            table: i.table,
            column: i.column ?? void 0,
            text: i.text,
          })),
          ge = await sql`
            SELECT
               n.nspname AS "schema",
               t.typname AS "type",
               'enum' AS "kind",
               array_agg(e.enumlabel ORDER BY e.enumsortorder) AS "values"
            FROM pg_type t
               JOIN pg_enum e ON t.oid = e.enumtypid
               JOIN pg_namespace n ON n.oid = t.typnamespace
            WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
            GROUP BY n.nspname, t.typname
         `.execute(this.kysely),
          de = await sql`
            SELECT
               n.nspname AS "schema",
               t.typname AS "type",
               'composite' AS "kind",
               json_agg(json_build_object(
                  'name',
                  a.attname,
                  'type',
                  format_type(a.atttypid, a.atttypmod)) ORDER BY a.attnum
               ) AS "fields"
            FROM pg_type t
               JOIN pg_namespace n ON n.oid = t.typnamespace
               JOIN pg_class c ON c.oid = t.typrelid
               JOIN pg_attribute a ON a.attrelid = c.oid
            WHERE
               t.typtype = 'c'
               AND c.relkind = 'c'
               AND a.attnum > 0
               AND NOT a.attisdropped
               AND n.nspname NOT IN ('pg_catalog', 'information_schema')
            GROUP BY n.nspname, t.typname
         `.execute(this.kysely),
          ye = [
            ...ge.rows.map((i) => ({
              schema: i.schema,
              type: i.type,
              kind: "enum",
              values: i.values,
            })),
            ...de.rows.map((i) => ({
              schema: i.schema,
              type: i.type,
              kind: "composite",
              fields: i.fields,
            })),
          ],
          he = (
            await sql`
            SELECT
               n.nspname AS "schema",
               p.proname AS "name",
               p.proargnames AS "arg_names_raw",
               p.proargmodes::text[] AS "arg_modes_raw",
               p.pronargdefaults AS "arg_defaults",
               p.provariadic <> 0 AS "has_variadic",
               p.provolatile AS "volatility",
               p.proretset AS "return_is_setof",
               p.prorows AS "return_rows",
               format_type(p.prorettype, NULL) AS "return_type",
               rt.typtype AS "return_typtype",
               CASE WHEN rt.typtype = 'd' AND rt.typbasetype <> 0
                  THEN format_type(rt.typbasetype, NULL) END AS "return_base_type",
               (SELECT array_agg(format_type(t, NULL) ORDER BY ord)
                  FROM unnest(p.proargtypes) WITH ORDINALITY AS at(t, ord)) AS "arg_types_raw"
            FROM pg_proc p
               JOIN pg_namespace n ON n.oid = p.pronamespace
               LEFT JOIN pg_type rt ON rt.oid = p.prorettype
            WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
               AND p.prokind = 'f'
            ORDER BY n.nspname, p.proname
         `.execute(this.kysely)
          ).rows.map((i) => {
            let w = i.arg_names_raw ?? [],
              E = i.arg_modes_raw ?? null,
              Ne =
                E && E.length === w.length
                  ? w.filter(
                      (R, k) => E[k] === "i" || E[k] === "b" || E[k] === "v",
                    )
                  : w,
              we = !!E?.some((R) => R === "o" || R === "b" || R === "t");
            return {
              schema: i.schema,
              name: i.name,
              arg_names: Ne,
              arg_types: i.arg_types_raw ?? [],
              arg_defaults: Number(i.arg_defaults ?? 0),
              has_variadic: i.has_variadic === !0,
              volatility: i.volatility ?? "v",
              return_type: i.return_type ?? "",
              return_is_setof: i.return_is_setof === !0,
              return_rows: Number(i.return_rows ?? 0),
              return_typtype: i.return_typtype ?? "",
              return_base_type: i.return_base_type ?? void 0,
              has_out_args: we,
            };
          }),
          _e = (
            await sql`
            SELECT
               c.relname AS "name",
               n.nspname AS "schema",
               p.relname AS "parent"
            FROM pg_catalog.pg_inherits i
               JOIN pg_catalog.pg_class c ON c.oid = i.inhrelid AND c.relispartition
               JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
               JOIN pg_catalog.pg_class p ON p.oid = i.inhparent
            WHERE n.nspname NOT IN ('information_schema', 'pg_catalog')
         `.execute(this.kysely)
          ).rows.map((i) => ({
            name: i.name,
            schema: i.schema,
            parent: i.parent,
          })),
          Se = (
            await sql`SELECT name FROM pg_catalog.pg_timezone_names`.execute(
              this.kysely,
            )
          ).rows.map((i) => i.name),
          Ee =
            (
              await sql`SELECT current_database() AS "name"`.execute(
                this.kysely,
              )
            ).rows[0]?.name ?? "postgres",
          G = te({
            tables: r,
            columns: f,
            indexes: S,
            foreign_keys: p,
            primary_keys: y,
            views: q,
            triggers: [],
            functions: he,
            check_constraints: me,
            unique_constraints: pe,
            comments: fe,
            custom_types: ye,
            partitions: _e,
            database_name: Ee,
            version: "",
            default_schema: "public",
            timezones: Se,
          });
        return (await this.writeCachedIntrospection(G, { useDriver: t }), G);
      } catch (o) {
        return (
          console.error("Introspection failed:", o),
          {
            tables: [],
            columns: [],
            indexes: [],
            foreign_keys: [],
            primary_keys: [],
            views: [],
            triggers: [],
            check_constraints: [],
            unique_constraints: [],
            comments: [],
            custom_types: [],
            database_name: "postgres",
            version: "",
          }
        );
      }
    }
    rlsState = "unknown";
    async ensureRlsContext() {
      if (this.rlsState !== "unknown") return this.rlsState === "active";
      let e = await sql`
         SELECT count(*) ::text as count FROM pg_class WHERE relrowsecurity = true
      `.execute(this.kysely);
      if (!(Number(e.rows[0]?.count ?? 0) > 0))
        return ((this.rlsState = "inactive"), false);
      ((this.rlsState = "active"), await sql.raw(Q).execute(this.kysely));
      let s = await sql`
         SELECT DISTINCT n.nspname FROM pg_class c
         JOIN pg_namespace n ON n.oid = c.relnamespace
         WHERE c.relrowsecurity = true
      `.execute(this.kysely);
      for (let { nspname: o } of s.rows) {
        let a = ne(o);
        (await sql
          .raw(`GRANT USAGE ON SCHEMA ${a} TO ${A}`)
          .execute(this.kysely),
          await sql
            .raw(`GRANT ALL ON ALL TABLES IN SCHEMA ${a} TO ${A}`)
            .execute(this.kysely),
          await sql
            .raw(`GRANT ALL ON ALL SEQUENCES IN SCHEMA ${a} TO ${A}`)
            .execute(this.kysely),
          await sql
            .raw(
              `ALTER DEFAULT PRIVILEGES IN SCHEMA ${a} GRANT ALL ON TABLES TO ${A}`,
            )
            .execute(this.kysely),
          await sql
            .raw(
              `ALTER DEFAULT PRIVILEGES IN SCHEMA ${a} GRANT ALL ON SEQUENCES TO ${A}`,
            )
            .execute(this.kysely));
      }
      return true;
    }
    async postgresTransactionActive(e) {
      try {
        return (
          await sql`SAVEPOINT __supalite_outer_tx_check`.execute(e),
          await sql`RELEASE SAVEPOINT __supalite_outer_tx_check`.execute(e),
          !0
        );
      } catch {
        return false;
      }
    }
    async applyJwtSessionContext(e, t, s) {
      let o = t.auth,
        a = o?.role || "anon",
        c = String(o?.uid ?? ""),
        r = o?.jwt,
        l = t.storage?.operation;
      (await sql`SELECT set_config('role', ${a}, true)`.execute(e),
        await sql`SELECT set_config('request.jwt.claim.sub', ${c}, true)`.execute(
          e,
        ),
        await sql`SELECT set_config('request.jwt.claim.role', ${a}, true)`.execute(
          e,
        ),
        await sql`SELECT set_config('storage.operation', ${String(l ?? "")}, true)`.execute(
          e,
        ),
        s && (await sql.raw(`SET LOCAL ROLE ${ne(a)}`).execute(e)),
        r &&
          typeof r == "object" &&
          (await sql`SELECT set_config('request.jwt.claims', ${JSON.stringify(r)}, true)`.execute(
            e,
          )));
    }
    async applyRpcRequestGucs(e, t) {
      (await sql`SELECT set_config('response.status', '', true)`.execute(e),
        await sql`SELECT set_config('response.headers', '', true)`.execute(e),
        await sql`SELECT set_config('request.method', ${t.method}, true)`.execute(
          e,
        ),
        await sql`SELECT set_config('request.path', ${t.path}, true)`.execute(
          e,
        ),
        await sql`SELECT set_config('request.headers', ${JSON.stringify(t.requestHeaders ?? {})}, true)`.execute(
          e,
        ));
    }
    async withContext(e, t, s) {
      let o = s?.forceRollback === true;
      if (!o && !e) return t(this.kysely);
      let a = e ? await this.ensureRlsContext() : false,
        r = e?.auth?.role || "anon",
        l =
          typeof r == "string" &&
          /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(r) &&
          !Ge.has(r);
      if (s?.transaction) {
        if (o) throw new Error("Cannot force rollback an existing transaction");
        return (
          e &&
            (a || l) &&
            (await this.applyJwtSessionContext(s.transaction, e, l)),
          t(s.transaction)
        );
      }
      let f = s?.rpc;
      if (f) {
        let m = async (p) => {
          (e && (a || l) && (await this.applyJwtSessionContext(p, e, l)),
            await this.applyRpcRequestGucs(p, f),
            f.readOnly &&
              (await sql`SET LOCAL transaction_read_only = on`.execute(p)));
        };
        if (this.harnessHoldingOuterTx)
          return (
            invariant(
              await this.postgresTransactionActive(this.kysely),
              "harnessHoldingOuterTx is set but the connection has no open PostgreSQL transaction; wrap REST requests in BEGIN/ROLLBACK in the spec harness",
            ),
            await m(this.kysely),
            t(this.kysely)
          );
        try {
          return await this.kysely.transaction().execute(async (p) => {
            await m(p);
            let g = await t(p);
            if (o) throw new N(g);
            return g;
          });
        } catch (p) {
          if (p instanceof N) return p.result;
          throw p;
        }
      }
      if (!o && !a && !l) return t(this.kysely);
      if (!o && l)
        return this.harnessHoldingOuterTx
          ? (invariant(
              await this.postgresTransactionActive(this.kysely),
              "harnessHoldingOuterTx is set but the connection has no open PostgreSQL transaction; wrap REST requests in BEGIN/ROLLBACK in the spec harness",
            ),
            await this.applyJwtSessionContext(this.kysely, e, true),
            t(this.kysely))
          : this.kysely
              .transaction()
              .execute(
                async (m) => (
                  await this.applyJwtSessionContext(m, e, true),
                  t(m)
                ),
              );
      if (!o && a && !l)
        return this.kysely
          .transaction()
          .execute(
            async (m) => (await this.applyJwtSessionContext(m, e, true), t(m)),
          );
      try {
        return await this.kysely.transaction().execute(async (m) => {
          e && (a || l) && (await this.applyJwtSessionContext(m, e, l));
          let p = await t(m);
          if (o) throw new N(p);
          return p;
        });
      } catch (m) {
        if (m instanceof N) return m.result;
        throw m;
      }
    }
    async onPostgrestAST(e) {
      if (!e.from) return e;
      let t = e.schema ?? "public",
        s = e.from,
        o = await this.introspect({ useCache: true });
      if (
        !o.tables.some((a) => a.name === s && a.schema === t) &&
        !o.views.some((a) => a.name === s && a.schema === t)
      )
        throw new RelationNotFoundError(t, s);
      return e;
    }
    async transaction(e, t) {
      await this.exec("BEGIN");
      try {
        for (let s of e) await this.exec(s);
        await this.exec("COMMIT");
      } catch (s) {
        throw (await this.exec("ROLLBACK"), s);
      } finally {
        t?.intent === "migration" && (await this.clearSchemaCache());
      }
    }
    get supportsRpc() {
      return true;
    }
    async viewOptionsMetadata(e, t) {
      let { rows: s } = await sql`
         select is_insertable_into, is_updatable,
                is_trigger_insertable_into, is_trigger_updatable, is_trigger_deletable
         from information_schema.views
         where table_schema = ${t} and table_name = ${e}
      `.execute(this.kysely),
        o = s[0],
        a = (r) => r === "YES",
        { rows: c } = await sql`
         select table_schema, table_name from information_schema.view_table_usage
         where view_schema = ${t} and view_name = ${e}
      `.execute(this.kysely);
      return {
        canInsert: a(o?.is_insertable_into) || a(o?.is_trigger_insertable_into),
        canUpdate: a(o?.is_updatable) || a(o?.is_trigger_updatable),
        canDelete: a(o?.is_updatable) || a(o?.is_trigger_deletable),
        baseTables: c.map((r) => ({
          schema: r.table_schema,
          name: r.table_name,
        })),
      };
    }
  };
var se = (n, e = (t) => t) => {
    if (!n || n === "{}") return [];
    let t = n.slice(1, -1);
    if (t === "") return [];
    let s = [],
      o = "",
      a = false,
      c = 0;
    for (let r = 0; r < t.length; r++) {
      let l = t[r];
      l === '"' && t[r - 1] !== "\\"
        ? ((a = !a), (o += l))
        : l === "{" && !a
          ? (c++, (o += l))
          : l === "}" && !a
            ? (c--, (o += l))
            : l === "," && !a && c === 0
              ? (s.push(e(o)), (o = ""))
              : (o += l);
    }
    return (o !== "" && s.push(e(o)), s);
  },
  Ke = (n) =>
    n === "NULL"
      ? null
      : n.startsWith('"') && n.endsWith('"')
        ? n.slice(1, -1).replace(/\\(.)/g, "$1")
        : n,
  je = (n) => (n === "NULL" ? null : Number.parseInt(n, 10));
function Qe(n, e) {
  if (n == null) return n;
  switch (e) {
    case 20:
      return typeof n == "bigint" ? n : BigInt(n);
    case 22:
      return Array.isArray(n)
        ? n
        : typeof n == "string"
          ? n
              .split(" ")
              .map(Number)
              .filter((t) => !Number.isNaN(t))
          : n;
    case 1002:
    case 1009:
    case 1015:
      return typeof n == "string" ? se(n, Ke) : n;
    case 1005:
    case 1007:
    case 1016:
      return typeof n == "string" ? se(n, je) : n;
    default:
      return n;
  }
}
function H(n) {
  let e = async (t, s) => {
    let o = await n.driver.query(t, s ? [...s] : []);
    return {
      rows: o.rows.map((c) =>
        Object.fromEntries(
          o.fields.map((r) => [r.name, Qe(c[r.name], r.dataTypeID)]),
        ),
      ),
    };
  };
  return {
    query: e,
    connect: async () => ({ query: e, release: () => {} }),
    end: async () => {},
  };
}
async function oe() {
  try {
    let [{ extract: n }, { plan: e }, { segmentActions: t }] =
      await Promise.all([
        import("@supabase/pg-delta/extract"),
        import("@supabase/pg-delta/plan"),
        import("@supabase/pg-delta/apply"),
      ]);
    return { extract: n, plan: e, segmentActions: t };
  } catch (n) {
    throw new Error(
      "Postgres schema diffing requires pg-delta to be available.",
      { cause: n },
    );
  }
}
function W(n) {
  let e = [...(n.assumedRoles ?? [])],
    t = [
      {
        match: {
          all: [
            { kind: "acl" },
            { idField: { field: "grantee", glob: "postgres" } },
          ],
        },
        action: "exclude",
      },
      {
        match: {
          all: [
            { verb: ["link", "unlink"] },
            { edgeTo: { edgeKind: "owner" } },
          ],
        },
        action: "exclude",
      },
    ];
  return (
    e.length > 0 &&
      t.push({
        match: { all: [{ kind: "role" }, { name: e }] },
        action: "exclude",
      }),
    n.only
      ? t.push({ match: { not: { any: ae(n.only) } }, action: "exclude" })
      : n.exclude?.length &&
        t.push({ match: { any: ae(n.exclude) }, action: "exclude" }),
    { id: "supabase-lite", filter: t, assumedRoles: ["postgres", ...e] }
  );
}
function ae(n) {
  let e = [...n];
  return [
    { all: [{ kind: "schema" }, { name: e }] },
    { schema: e },
    { target: { schema: e } },
  ];
}
function ie(n, e) {
  return n.segmentActions(e.actions).map((t) => ({
    transactional: t.transactional,
    statements: e.actions.slice(t.start, t.end).map((s) => s.sql),
  }));
}
function re(n) {
  let e = [];
  for (let t of n) {
    let s = !t.nonTransactional,
      o = e[e.length - 1];
    !o || t.newTransaction || o.transactional !== s
      ? e.push({ statements: [t.sql], transactional: s })
      : o.statements.push(t.sql);
  }
  return e;
}
function ce(n) {
  return n.preamble
    .filter((e) => e.name !== "search_path")
    .map((e) => `SET LOCAL ${e.name} = ${Ye(e.value)}`);
}
function Ye(n) {
  return `'${n.replace(/'/g, "''")}'`;
}
function le(n) {
  let e = [];
  for (let t of n.actions) t.dataLoss === "destructive" && e.push(Ve(t));
  return e;
}
function Ve(n) {
  for (let e of n.destroys)
    if (e.kind === "table")
      return { table: U(e.schema, e.name), reason: "drop table" };
  for (let e of n.destroys)
    if (e.kind === "column")
      return { table: U(e.schema, e.table), reason: `drop column ${e.name}` };
  for (let e of n.destroys)
    if (e.kind === "sequence")
      return { table: U(e.schema, e.name), reason: "drop sequence" };
  return { table: "unknown", reason: n.sql };
}
function U(n, e) {
  return n === "public" ? e : `${n}.${e}`;
}
var ze = new Set(["public", "supabase_migrations"]),
  Xe = /\bCREATE\s+SCHEMA\b(?:\s+IF\s+NOT\s+EXISTS)?\s+"?([\w$]+)"?/gi;
function Ze(n, e) {
  let t = e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
    s = new RegExp(`(?<![\\w$])"?${t}"?\\.`);
  return n.some((o) => s.test(o));
}
function ue(n, e) {
  let t = new Set();
  for (let s of e) for (let o of s.matchAll(Xe)) t.add(o[1]);
  return n
    .facts()
    .filter((s) => s.id.kind === "schema")
    .map((s) => s.id.name)
    .filter((s) => !ze.has(s) && !t.has(s) && Ze(e, s))
    .map((s) => `CREATE SCHEMA IF NOT EXISTS "${s}";`);
}
var tt = ["supabase_migrations"],
  I = class {
    constructor(e, t) {
      this.from = e;
      this.desiredSchema = t;
    }
    #e;
    async #t(e) {
      if (this.#e) return this.#e;
      let t = new this.from.constructor();
      try {
        let s = C(v(this.desiredSchema));
        (s && (await t.exec(s)), await t.exec(this.desiredSchema));
        let { factBase: o } = await e.extract(H(t));
        return ((this.#e = o), o);
      } finally {
        await t.close();
      }
    }
    async diff(e) {
      let t = await oe(),
        s = await this.#t(t),
        { factBase: o } = await t.extract(H(this.from)),
        a = z(this.desiredSchema),
        c = e?.schemas
          ? W({ only: e.schemas, assumedRoles: a })
          : W({ exclude: tt, assumedRoles: a }),
        r = t.plan(o, s, { policy: c });
      if (r.actions.length === 0)
        return { diff: "", plan: { steps: [], warnings: [], unsafe: false } };
      let l = ie(t, r),
        f = ue(
          s,
          l.flatMap((g) => g.statements),
        );
      f.length > 0 &&
        l[0] &&
        (l[0] = { ...l[0], statements: [...f, ...l[0].statements] });
      let m = ce(r),
        p = [];
      for (let [g, y] of l.entries()) {
        let d = y.transactional ? [...m, ...y.statements] : y.statements;
        for (let [_, S] of d.entries()) {
          let b = { sql: S };
          (g > 0 && _ === 0 && (b.newTransaction = true),
            y.transactional || (b.nonTransactional = true),
            p.push(b));
        }
      }
      return {
        diff: p.map((g) => g.sql).join(`

`),
        plan: {
          steps: p,
          warnings: le(r),
          unsafe: r.safetyReport.destructiveActions > 0,
        },
      };
    }
    async migratePlan(e, t) {
      if (e.steps.length === 0) return;
      if (e.unsafe && !t?.force) throw new DataLossError(e.warnings ?? []);
      let s = e.steps.map((r) => r.sql).join(`
`),
        o = L(s),
        a = new Set(
          e.steps.flatMap((r) => [...v(r.sql)]).filter((r) => !o.has(r)),
        ),
        c = C(a);
      c && (await this.from.exec(c));
      for (let r of re(e.steps)) {
        if (r.transactional) {
          await this.from.transaction(r.statements, { intent: "migration" });
          continue;
        }
        for (let l of r.statements) await this.from.exec(l);
      }
    }
    async migrate(e) {
      let t = await this.diff({ schemas: e?.schemas });
      return (await this.migratePlan(t.plan, e), t);
    }
    safeSortPlanSteps(e) {
      return e;
    }
  };
var J = class extends x {
  driver;
  dialect = "postgres";
  #e = false;
  constructor(e = {}) {
    let t = e.url;
    if (t && !t.includes("://")) {
      let a = globalThis.process?.getBuiltinModule?.("node:fs");
      a && !a.existsSync(t) && a.mkdirSync(t, { recursive: true });
    }
    let s = new PGlite({
        ...e.pgliteOptions,
        dataDir: e.url ?? void 0,
        extensions: {
          ...e.pgliteOptions?.extensions,
          isn: isn,
          ltree: ltree,
          file_fdw: file_fdw,
          pgcrypto: pgcrypto,
        },
        parsers: {
          20: (a) => {
            let c = Number(a);
            return Number.isSafeInteger(c) ? c : BigInt(a);
          },
          114: (a) => JSON.parse(a),
          3802: (a) => JSON.parse(a),
          1700: (a) => {
            let c = Number(a);
            return Number.isFinite(c) && String(c) === a ? c : a;
          },
          1082: (a) => a,
          1083: (a) => a,
          1114: (a) => a,
          1184: (a) => a,
          1266: (a) => a,
          ...e.pgliteOptions?.parsers,
        },
      }),
      { dialect: o } = new T(s);
    (super(e), (this.driver = s), (this.kysely = new Kysely({ dialect: o })));
  }
  async exec(e, ...t) {
    try {
      if (t.length > 0) {
        let { rows: o } = await sql(e, ...(t ?? [])).execute(this.kysely);
        return { rows: o };
      }
      return { rows: (await this.driver.exec(e))[0].rows };
    } catch (s) {
      throw (console.error(s), new Error(`Failed to execute query: ${e}`));
    }
  }
  async close() {
    this.#e ||
      ((this.#e = true),
      await this.clearSchemaCache(),
      await this.kysely.destroy(),
      await this.driver.close());
  }
  createMigrator(e) {
    let t = [this.config.baseSchema, e].filter(Boolean).join(`

`);
    return new I(this, t);
  }
};
async function Gt(n = {}) {
  return new J(n);
}
export { J as PgliteConnection, Gt as createPgliteConnection };
