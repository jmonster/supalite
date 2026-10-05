import { sql, RawNode, ReferenceNode } from "kysely";
// Lite's resolver emits quoted raw identifiers; sql.ref emits ReferenceNodes.
// Only duplicate plain column references, never computed or path expressions.
function isColumnReference(node) {
  if (ReferenceNode.is(node)) return node.column.kind === "ColumnNode";
  if (!RawNode.is(node)) return false;
  const { sqlFragments: parts, parameters } = node;
  if (parameters.length === 0)
    return parts.length === 1 && /^"(?:[^"]|"")+"$/.test(parts[0]);
  if (
    parameters.length === 1 &&
    parts.length === 2 &&
    parts.every((p) => p === "")
  )
    return isColumnReference(parameters[0]);
  return (
    parameters.length === 2 &&
    parts.length === 3 &&
    parts[0] === "" &&
    parts[1] === "." &&
    parts[2] === "" &&
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
  input,
  filter,
  parameter,
  storedColumn = false,
) {
  if (filter === null || typeof filter !== "object" || Array.isArray(filter))
    return null;
  const pending = [{ value: filter, path: "$" }];
  const entries = [];
  while (pending.length) {
    const entry = pending.pop();
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
  const predicates = [];
  const equalities = [];
  // A reference can hide a volatile view expression. Hoist only when the
  // caller has also verified stored-column provenance outside this AST.
  const plainColumn =
    storedColumn && isColumnReference(input.toOperationNode());
  for (const { value, path } of entries) {
    const type =
      path === "$"
        ? sql`json_type(${document})`
        : sql`json_type(${document}, ${parameter(path)})`;
    if (value === null) {
      predicates.push(sql`${type} = 'null'`);
    } else if (typeof value === "object") {
      // Ancestor guards preserve object structure, including empty objects.
      predicates.push(sql`${type} = 'object'`);
    } else if (typeof value === "boolean") {
      predicates.push(sql`${type} = ${sql.lit(value ? "true" : "false")}`);
    } else if (plainColumn && path.split(".").length === 2) {
      predicates.push(
        typeof value === "number"
          ? sql`${type} in ('integer', 'real')`
          : sql`${type} = 'text'`,
      );
      // Match the ordinary migrated (body ->> 'key') expression index. Only
      // already-allowlisted top-level keys become literals; values stay bound.
      equalities.push(
        sql`(${input}->>${sql.lit(path.slice(2))}) collate binary = ${parameter(value)}`,
      );
    } else if (typeof value === "number") {
      predicates.push(sql`(${type} in ('integer', 'real') and
        json_extract(${document}, ${parameter(path)}) = ${parameter(value)})`);
    } else {
      predicates.push(sql`(${type} = 'text' and
        json_extract(${document}, ${parameter(path)}) collate binary = ${parameter(value)})`);
    }
  }
  // Missing paths produce SQL NULL. They are a false match, while a SQL-NULL
  // document must stay NULL so the surrounding NOT/OR retain SQL semantics.
  const guarded = sql`(select case when ${document} is null then null
    else coalesce((${sql.join(predicates, sql` and `)}), 0) end
    from (select ${input} as document) as __jsonb_fast_input)`;
  // Keep equalities visible to the planner. For a missing/wrong-type member the
  // guard is false; for SQL NULL both sides stay NULL, including under NOT/OR.
  return equalities.length
    ? sql`(${guarded} and ${sql.join(equalities, sql` and `)})`
    : guarded;
}
