import {
  sql,
  RawNode,
  ReferenceNode,
  type Expression,
  type OperationNode,
  type RawBuilder,
} from "kysely";
import type { Json } from "./jsonb-containment.js";

// Lite's resolver emits quoted raw identifiers; sql.ref emits ReferenceNodes.
// Only duplicate plain column references, never computed or path expressions.
function isColumnReference(node: OperationNode): boolean {
  if (ReferenceNode.is(node)) return node.column.kind === "ColumnNode";
  if (!RawNode.is(node)) return false;
  const { sqlFragments: parts, parameters } = node;
  if (parameters.length === 0)
    return parts.length === 1 && /^"(?:[^"]|"")+"$/.test(parts[0]!);
  if (
    parameters.length === 1 && parts.length === 2 &&
    parts.every((p) => p === "")
  )
    return isColumnReference(parameters[0]!);
  return (
    parameters.length === 2 && parts.length === 3 &&
    parts[0] === "" && parts[1] === "." && parts[2] === "" &&
    parameters.every(isColumnReference)
  );
}

/**
 * Fast path for object-only JSONB contains patterns with simple member names.
 *
 * The caller validates JSON and enforces complexity budgets first. Unsupported
 * shapes return null before consuming any parameter budget. Values and guard
 * paths are bound at every occurrence; the callback owns that budget.
 * Arrays and arbitrary member names use the general containment compiler.
 */
export function jsonbObjectFastPath(
  input: Expression<unknown>,
  filter: Json,
  parameter: (value: string | number) => RawBuilder<unknown>,
  storedColumn = false,
): RawBuilder<boolean | null> | null {
  if (filter === null || typeof filter !== "object" || Array.isArray(filter))
    return null;

  const pending: Array<{ value: Json; path: string }> = [
    { value: filter, path: "$" },
  ];
  const entries: Array<{ value: Json; path: string }> = [];
  while (pending.length) {
    const entry = pending.pop()!;
    if (Array.isArray(entry.value)) return null;
    entries.push(entry);
    if (entry.value !== null && typeof entry.value === "object") {
      for (const [key, value] of Object.entries(entry.value)) {
        // Deliberately narrow. Quoted/dotted/path-like keys are supported by
        // the general compiler, not converted into ambiguous SQLite paths.
        if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) return null;
        pending.push({ value, path: `${entry.path}.${key}` });
      }
    }
  }

  // Resolve the original expression before introducing inner query aliases.
  const document = sql.ref("__jsonb_fast_input.document");
  const predicates: RawBuilder<boolean>[] = [];
  const equalities: RawBuilder<boolean>[] = [];
  // A reference can hide a volatile view expression. Hoist only when the
  // caller has also verified stored-column provenance outside this AST.
  const plainColumn = storedColumn && isColumnReference(input.toOperationNode());
  for (const { value, path } of entries) {
    const type =
      path === "$"
        ? sql<string>`json_type(${document})`
        : sql<string>`json_type(${document}, ${parameter(path)})`;
    if (value === null) {
      predicates.push(sql<boolean>`${type} = 'null'`);
    } else if (typeof value === "object") {
      // Ancestor guards preserve object structure, including empty objects.
      predicates.push(sql<boolean>`${type} = 'object'`);
    } else if (typeof value === "boolean") {
      predicates.push(
        sql<boolean>`${type} = ${sql.lit(value ? "true" : "false")}`,
      );
    } else if (plainColumn && path.split(".").length === 2) {
      predicates.push(
        typeof value === "number"
          ? sql<boolean>`${type} in ('integer', 'real')`
          : sql<boolean>`${type} = 'text'`,
      );
      // Match the ordinary migrated (body ->> 'key') expression index. Only
      // already-allowlisted top-level keys become literals; values stay bound.
      equalities.push(
        sql<boolean>`(${input}->>${sql.lit(path.slice(2))}) collate binary = ${parameter(value)}`,
      );
    } else if (typeof value === "number") {
      predicates.push(sql<boolean>`(${type} in ('integer', 'real') and
        json_extract(${document}, ${parameter(path)}) = ${parameter(value)})`);
    } else {
      predicates.push(sql<boolean>`(${type} = 'text' and
        json_extract(${document}, ${parameter(path)}) collate binary = ${parameter(value)})`);
    }
  }

  // Missing paths produce SQL NULL. They are a false match, while a SQL-NULL
  // document must stay NULL so the surrounding NOT/OR retain SQL semantics.
  const guarded = sql<boolean | null>`(select case when ${document} is null then null
    else coalesce((${sql.join(predicates, sql` and `)}), 0) end
    from (select ${input} as document) as __jsonb_fast_input)`;
  // Keep equalities visible to the planner. For a missing/wrong-type member the
  // guard is false; for SQL NULL both sides stay NULL, including under NOT/OR.
  return equalities.length
    ? sql<boolean | null>`(${guarded} and ${sql.join(equalities, sql` and `)})`
    : guarded;
}
