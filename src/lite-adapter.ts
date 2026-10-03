/**
 * Original adapter for the published 0.11.0 AST/planner boundary.
 * Only JSONB columns on SQLite enter the new compiler. The bundle patch passes
 * its existing identifier resolver; PostgreSQL and SQL-array paths fall through.
 */
import { sql, type Expression, type RawBuilder } from "kysely";
import {
  jsonbContainment,
  JsonbFilterError,
  type Json,
} from "./jsonb-containment.js";

const LITERAL_KEYS = {
  $contains: Symbol.for("supalite-jsonb-parity.raw-contains"),
  $containedBy: Symbol.for("supalite-jsonb-parity.raw-contained-by"),
} as const;
type Operators = Record<string, unknown> & { [key: symbol]: unknown };
export function markJsonbLiteral(
  operators: Operators,
  operator: string,
  raw: string,
): Operators {
  // The upstream parser merges per-column maps with Object.assign. Separate
  // symbol keys preserve BOTH cs and cd literals when used on one column.
  if (operator === "$contains" || operator === "$containedBy")
    operators[LITERAL_KEYS[operator]] = raw;
  return operators;
}
interface Column {
  name: string;
  table: string;
  schema?: string;
  pg_type?: string;
  type: string;
}
interface Context {
  dialect: string;
  currentTable?: string;
  currentTableAlias?: string;
  currentSchema?: string;
  introspection?: { default_schema?: string; columns?: Column[] };
}
interface Resolvers {
  parsePath: (column: string) => {
    col: string;
    parts: Array<{ op: string; key: string }>;
  };
  reference: (column: string, context: Context) => Expression<unknown>;
}

function findColumn(name: string, context: Context): Column | undefined {
  const columns = context.introspection?.columns ?? [];
  const schema =
    context.currentSchema ?? context.introspection?.default_schema ?? "public";
  const table = context.currentTable;
  // A physical column named 'a.b' takes precedence over qualifier splitting.
  const direct = columns.find(
    (column) =>
      column.name === name &&
      column.table === table &&
      (column.schema ?? "public") === schema,
  );
  if (direct) return direct;
  const dot = name.lastIndexOf(".");
  if (dot < 0) return undefined;
  const qualifier = name.slice(0, dot);
  if (qualifier !== table && qualifier !== context.currentTableAlias)
    return undefined;
  return columns.find(
    (column) =>
      column.name === name.slice(dot + 1) &&
      column.table === table &&
      (column.schema ?? "public") === schema,
  );
}

export function tryJsonbContainment(
  column: string,
  operator: string,
  value: unknown,
  context: Context,
  operators: Operators,
  resolvers: Resolvers,
): RawBuilder<boolean | null> | null {
  if (
    context.dialect !== "sqlite" ||
    (operator !== "$contains" && operator !== "$containedBy")
  )
    return null;
  const path = resolvers.parsePath(column);
  const info = findColumn(path.col, context);
  if ((info?.pg_type ?? info?.type)?.toLowerCase() !== "jsonb") return null;
  if (path.parts.some((part) => part.op !== "->")) {
    throw new JsonbFilterError(
      "JSONB containment requires JSON extraction (->), not text extraction (->>)",
      "42883",
    );
  }

  let filter: Json;
  const literal = operators[LITERAL_KEYS[operator]];
  if (typeof literal === "string") {
    try {
      filter = JSON.parse(literal) as Json;
    } catch {
      throw new JsonbFilterError("invalid input syntax for type json", "22P02");
    }
  } else {
    // Direct AST callers already supply a JSON value. REST literals keep their
    // raw text above so strings such as "[1]" never turn into JSON arrays.
    filter = value as Json;
  }

  let input = resolvers.reference(path.col, context);
  if (path.parts.length > 16)
    throw new JsonbFilterError("JSONB extraction path exceeds 16 steps");
  if (path.parts.length) {
    const document = sql.ref("__jsonb_path_input.document");
    const ctes: RawBuilder<unknown>[] = [
      sql`__jsonb_path_tree as materialized (select id, parent, key, type, value from json_tree(${document}))`,
      sql`__jsonb_path_0 as materialized (select id from __jsonb_path_tree where parent is null)`,
    ];
    for (const [step, part] of path.parts.entries()) {
      const previous = sql.ref(`__jsonb_path_${step}`);
      const next = sql.ref(`__jsonb_path_${step + 1}`);
      const key: string | number = /^-?\d+$/.test(part.key)
        ? Number(part.key)
        : part.key;
      const index =
        typeof key === "number" && key < 0
          ? sql`json_array_length(parent.value) + ${key}`
          : sql`${key}`;
      ctes.push(sql`${next} as materialized (select child.id from ${previous} p
        cross join __jsonb_path_tree parent cross join __jsonb_path_tree child
        where parent.id = p.id and child.parent = p.id and child.key = ${index})`);
    }
    const last = sql.ref(`__jsonb_path_${path.parts.length}`);
    // Dependency-first joins preserve both bounded syntax and evaluation. The
    // outer capture also protects input columns named key/type/value/id.
    input = sql`(select (with ${sql.join(ctes, sql`, `)}
      select case n.type when 'text' then json_quote(n.value) when 'null' then 'null'
        when 'true' then 'true' when 'false' then 'false' else n.value end
      from ${last} p cross join __jsonb_path_tree n where n.id = p.id limit 1)
      from (select ${input} as document) as __jsonb_path_input)`;
  }
  return jsonbContainment(
    input,
    filter,
    operator === "$contains" ? "contains" : "containedBy",
  );
}

/** Portable D1-sized request budget, including other filters, paths and paging. */
export function assertJsonbQueryLimits(query: { sql: string; parameters: readonly unknown[] }): void {
  if (!['__jsonb_fast_input', '__jsonb_walk', '__jsonb_path_input', '__jsonb_shallow_input'].some(marker => query.sql.includes(marker))) return;
  if (query.parameters.length > 100) throw new JsonbFilterError('JSONB request exceeds 100 total bound parameters');
  if (new TextEncoder().encode(query.sql).byteLength > 100_000) throw new JsonbFilterError('JSONB request exceeds 100000 SQL bytes');
}
