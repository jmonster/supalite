import { sql, type Expression, type RawBuilder } from "kysely";
import type { Json } from "./jsonb-containment.js";

/**
 * Fast path for object-only JSONB contains patterns with simple member names.
 *
 * The caller validates JSON and enforces complexity budgets first. Unsupported
 * shapes return null before consuming any parameter budget. Paths and values
 * are bound separately at every occurrence; the callback owns that budget.
 * Arrays and arbitrary member names use the general containment compiler.
 */
export function jsonbObjectFastPath(
  input: Expression<unknown>,
  filter: Json,
  parameter: (value: string | number) => RawBuilder<unknown>,
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
  return sql<boolean | null>`(select case when ${document} is null then null
    else coalesce((${sql.join(predicates, sql` and `)}), 0) end
    from (select ${input} as document) as __jsonb_fast_input)`;
}
