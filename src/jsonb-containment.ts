import { sql, type Expression, type RawBuilder } from "kysely";
import { jsonbObjectFastPath } from "./jsonb-object-fast-path.js";
import { jsonbShallow } from "./jsonb-shallow.js";

/** JSON values supported by the JavaScript/PostgREST boundary. */
export type Json =
  | null
  | boolean
  | number
  | string
  | Json[]
  | { [key: string]: Json };
export type Containment = "contains" | "containedBy";
export interface CompileLimits {
  maxDepth: number;
  maxNodes: number;
  maxParameters: number;
}
export interface CompileOptions extends Partial<CompileLimits> {
  /** Caller guarantees a stored, non-generated source column, not a view. */
  storedColumn?: boolean;
}
export const DEFAULT_LIMITS: Readonly<CompileLimits> = Object.freeze({
  maxDepth: 16,
  maxNodes: 128,
  // Leave headroom below Lite's default 100 for the rest of the request.
  maxParameters: 64,
});

export class JsonbFilterError extends Error {
  readonly code: string;
  constructor(message: string, code = "54000") {
    super(message);
    this.name = "JsonbFilterError";
    this.code = code;
  }
}

type Predicate = RawBuilder<boolean>;
const TRUE = sql<boolean>`1`;
const FALSE = sql<boolean>`0`;
const and = (parts: Predicate[]): Predicate =>
  parts.length ? sql<boolean>`(${sql.join(parts, sql` and `)})` : TRUE;
const or = (parts: Predicate[]): Predicate =>
  parts.length ? sql<boolean>`(${sql.join(parts, sql` or `)})` : FALSE;

function validateString(value: string): void {
  if (value.includes("\0"))
    throw new JsonbFilterError(
      "JSONB cannot represent the Unicode null character",
      "22P05",
    );
  for (let index = 0; index < value.length; index++) {
    const unit = value.charCodeAt(index);
    if (unit >= 0xd800 && unit <= 0xdbff) {
      const next = value.charCodeAt(++index);
      if (!(next >= 0xdc00 && next <= 0xdfff))
        throw new JsonbFilterError(
          "Invalid Unicode surrogate in JSONB filter",
          "22P02",
        );
    } else if (unit >= 0xdc00 && unit <= 0xdfff) {
      throw new JsonbFilterError(
        "Invalid Unicode surrogate in JSONB filter",
        "22P02",
      );
    }
  }
}

/** Check budgets iteratively, before building a recursive SQL expression. */
function validate(value: Json, limits: CompileLimits): number {
  for (const limit of Object.values(limits)) {
    if (!Number.isSafeInteger(limit) || limit < 1)
      throw new JsonbFilterError("Invalid JSONB compiler limit");
  }
  let count = 0;
  let depth = 0;
  const stack: Array<{ value: Json; depth: number }> = [{ value, depth: 0 }];
  while (stack.length) {
    const current = stack.pop()!;
    depth = Math.max(depth, current.depth);
    if (++count > limits.maxNodes)
      throw new JsonbFilterError(
        `JSONB filter exceeds ${limits.maxNodes} nodes`,
      );
    if (current.depth > limits.maxDepth)
      throw new JsonbFilterError(
        `JSONB filter exceeds depth ${limits.maxDepth}`,
      );
    if (typeof current.value === "string") validateString(current.value);
    if (
      typeof current.value === "number" &&
      Number.isInteger(current.value) &&
      !Number.isSafeInteger(current.value)
    ) {
      throw new JsonbFilterError(
        "JSONB filter integers must be within JavaScript's safe integer range",
        "22003",
      );
    }
    if (typeof current.value === "number" && !Number.isFinite(current.value)) {
      throw new JsonbFilterError(
        "JSONB filter contains a non-finite number",
        "22P02",
      );
    }
    if (current.value && typeof current.value === "object") {
      for (const [key, child] of Object.entries(current.value)) {
        validateString(key);
        stack.push({ value: child, depth: current.depth + 1 });
      }
    } else if (
      !["string", "number", "boolean"].includes(typeof current.value) &&
      current.value !== null
    ) {
      throw new JsonbFilterError("JSONB filter must be a JSON value", "22P02");
    }
  }
  return depth;
}

/**
 * Compile PostgreSQL JSONB @> / <@ semantics for SQLite JSON1.
 *
 * The filter is a known tree; recursion happens at compile time. Bottom-up
 * match sets compare direct children from a JSON1 tree walk. No UDFs,
 * post-filtering, or new runtime dependencies.
 *
 * Numeric equality is limited by JavaScript and SQLite number representation;
 * this is not an arbitrary-precision PostgreSQL numeric implementation.
 */
export function jsonbContainment(
  input: Expression<unknown>,
  filter: Json,
  direction: Containment,
  options: CompileOptions = {},
): RawBuilder<boolean | null> {
  const { storedColumn = false, ...overrides } = options;
  const limits = { ...DEFAULT_LIMITS, ...overrides };
  const filterDepth = validate(filter, limits);
  let aliases = 0;
  let parameters = 0;
  const ctes: RawBuilder<unknown>[] = [];
  const parameter = (value: string | number): RawBuilder<unknown> => {
    if (++parameters > limits.maxParameters)
      throw new JsonbFilterError(
        `JSONB filter exceeds ${limits.maxParameters} bound parameters`,
      );
    return sql`${value}`;
  };
  if (direction === "contains") {
    const fast = jsonbObjectFastPath(input, filter, parameter, storedColumn);
    if (fast) return fast;
  }
  const shallow = jsonbShallow(input, filter, direction, parameter);
  if (shallow) return shallow;
  const isType = (type: string): Predicate =>
    sql<boolean>`n.type = ${sql.lit(type)}`;
  const nodes = sql.ref("__jsonb_nodes");

  function scalar(value: Json): Predicate {
    if (value === null) return isType("null");
    if (typeof value === "boolean") return isType(value ? "true" : "false");
    if (typeof value === "number")
      return and([
        sql<boolean>`n.type in ('integer', 'real')`,
        sql<boolean>`n.atom = ${parameter(value)}`,
      ]);
    if (typeof value === "string")
      return and([
        isType("text"),
        sql<boolean>`n.atom collate binary = ${parameter(value)}`,
      ]);
    return FALSE;
  }

  // Each match row carries a compact ancestor stack. Projecting its parent is
  // O(depth), with no join back across every document node. Set operations use
  // complete node identities, so one array member can satisfy multiple RHS
  // requirements without ever combining fields from different members.
  const parent = sql`json_remove(n.id, '$[#-1]') as id,
    json_extract(n.ancestors, '$[#-1].key') as key,
    json_extract(n.ancestors, '$[#-1].type') as type,
    null as atom, json_remove(n.ancestors, '$[#-1]') as ancestors`;
  const columns = sql`n.id, n.key, n.type, n.atom, n.ancestors`;
  function relation(value: Json): RawBuilder<unknown> {
    const id = ++aliases;
    const name = sql.ref(`__jsonb_match_${id}`);
    let query: RawBuilder<unknown>;
    if (value !== null && typeof value === "object") {
      const array = Array.isArray(value);
      const children = Object.entries(value).map(([key, item]) => ({
        key: array ? null : parameter(key),
        relation: relation(item),
      }));
      const candidates = children.map(
        (child) => sql`select ${direction === "contains" ? parent : columns}
        from ${child.relation} n where n.ancestors != '[]'
        ${child.key === null ? sql`` : sql`and n.key collate binary = ${child.key}`}`,
      );
      const base = sql`select ${columns} from ${nodes} n where ${isType(array ? "array" : "object")}`;
      query = base;
      if (direction === "contains" && candidates.length) {
        query = sql`${base} intersect ${sql.join(candidates, sql` intersect `)}`;
      } else if (direction === "containedBy") {
        const rejected = sql.ref(`__jsonb_rejected_${id}`);
        const allowed = candidates.length
          ? sql.join(candidates, sql` union `)
          : sql`select ${columns} from ${nodes} n where 0`;
        ctes.push(
          sql`${rejected} as materialized (select ${columns} from ${nodes} n except select * from (${allowed}))`,
        );
        query = sql`${base} except select ${parent} from ${rejected} n where n.ancestors != '[]'`;
      }
    } else {
      query = sql`select ${columns} from ${nodes} n where ${scalar(value)}`;
    }
    ctes.push(sql`${name} as materialized (${query})`);
    return name;
  }

  const match = relation(filter);
  const root = sql`select 1 from ${match} n where n.ancestors = '[]'`;
  let matchedRoot: RawBuilder<unknown> = root;
  if (
    direction === "contains" &&
    (filter === null || typeof filter !== "object")
  ) {
    matchedRoot = sql`${root} union select 1 from ${match} n
      where json_array_length(n.ancestors) = 1 and json_extract(n.ancestors, '$[0].type') = 'array'`;
  } else if (direction === "containedBy" && Array.isArray(filter)) {
    const scalars = filter
      .filter((item) => item === null || typeof item !== "object")
      .map(scalar);
    if (scalars.length)
      matchedRoot = sql`${root} union select 1 from ${nodes} n where n.ancestors = '[]' and ${or(scalars)}`;
  }
  const doc = sql.ref("__jsonb_input.document");
  // The runtime walk carries only ancestor identity/key/type, never whole
  // ancestor documents. json_each is guarded against dequoted scalar strings.
  // Capture source references outside the CTE scope to protect columns named
  // key/type/value/id. All names and JSON path fragments below are internal.
  return sql<boolean | null>`(select (with recursive
    __jsonb_walk(id, key, type, value, ancestors) as materialized (
      select '[]', null, json_type(${doc}), json_extract(${doc}, '$'), '[]'
      union all
      select json_insert(p.id, '$[#]', j.key), j.key, j.type, j.value,
        json_insert(p.ancestors, '$[#]', json_object('key', p.key, 'type', p.type))
      from __jsonb_walk p, json_each(case when p.type in ('object', 'array') then p.value else 'null' end) j
      where p.type in ('object', 'array') and json_array_length(p.id) < ${sql.lit(filterDepth + 1)}
    ),
    __jsonb_nodes as materialized (select id, key, type,
      case when type in ('object', 'array') then null else value end as atom, ancestors from __jsonb_walk),
    ${sql.join(ctes, sql`, `)}
    select case when ${doc} is null then null else exists (${matchedRoot}) end
    ) from (select ${input} as document) as __jsonb_input)`;
}
