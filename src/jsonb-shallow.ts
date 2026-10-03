import { sql, type Expression, type RawBuilder } from "kysely";
import type { Containment, Json } from "./jsonb-containment.js";

type Predicate = RawBuilder<boolean>;
type Node = { type: RawBuilder<string>; value: RawBuilder<unknown> };
const TRUE = sql<boolean>`1`;
const FALSE = sql<boolean>`0`;
const and = (parts: Predicate[]): Predicate =>
  parts.length ? sql<boolean>`(${sql.join(parts, sql` and `)})` : TRUE;
const or = (parts: Predicate[]): Predicate =>
  parts.length ? sql<boolean>`(${sql.join(parts, sql` or `)})` : FALSE;

/**
 * Bounded JSON1 specialization for shallow filters. The caller validates JSON
 * and owns the parameter budget. Deeper filters return null before spending
 * that budget and remain the responsibility of the general compiler.
 */
export function jsonbShallow(
  input: Expression<unknown>,
  filter: Json,
  direction: Containment,
  parameter: (value: string | number) => RawBuilder<unknown>,
): RawBuilder<boolean | null> | null {
  const pending: Array<{ value: Json; depth: number }> = [
    { value: filter, depth: 0 },
  ];
  while (pending.length) {
    const { value, depth } = pending.pop()!;
    if (depth > 3) return null;
    if (value !== null && typeof value === "object") {
      for (const child of Object.values(value))
        pending.push({ value: child, depth: depth + 1 });
    }
  }
  let aliasIndex = 0;
  const isType = (node: Node, type: string): Predicate =>
    sql<boolean>`${node.type} = ${sql.lit(type)}`;
  function each(
    node: Node,
    type: "array" | "object",
    predicate: (child: Node, key: RawBuilder<unknown>) => Predicate,
    negate = false,
  ): Predicate {
    const alias = `__jsonb_shallow_${++aliasIndex}`;
    const child: Node = {
      type: sql.ref(`${alias}.type`),
      value: sql.ref(`${alias}.value`),
    };
    // Wrong-type scalar text must never be passed to json_each as JSON text.
    const source = sql`case when ${isType(node, type)} then ${node.value} else 'null' end`;
    const query = sql`(select 1 from json_each(${source}) as ${sql.ref(alias)}
      where ${predicate(child, sql.ref(`${alias}.key`))})`;
    return negate
      ? sql<boolean>`not exists ${query}`
      : sql<boolean>`exists ${query}`;
  }
  function scalar(node: Node, value: Json): Predicate {
    if (value === null) return isType(node, "null");
    if (typeof value === "boolean")
      return isType(node, value ? "true" : "false");
    if (typeof value === "number")
      return and([
        sql<boolean>`${node.type} in ('integer', 'real')`,
        sql<boolean>`${node.value} = ${parameter(value)}`,
      ]);
    if (typeof value === "string")
      return and([
        isType(node, "text"),
        sql<boolean>`${node.value} collate binary = ${parameter(value)}`,
      ]);
    return FALSE;
  }
  function contains(node: Node, value: Json, root = false): Predicate {
    if (Array.isArray(value))
      return and([
        isType(node, "array"),
        ...value.map((item) =>
          each(node, "array", (child) => contains(child, item)),
        ),
      ]);
    if (value !== null && typeof value === "object")
      return and([
        isType(node, "object"),
        ...Object.entries(value).map(([key, item]) =>
          each(node, "object", (child, runtimeKey) =>
            and([
              sql<boolean>`${runtimeKey} collate binary = ${parameter(key)}`,
              contains(child, item),
            ]),
          ),
        ),
      ]);
    const equal = scalar(node, value);
    return root
      ? or([
          equal,
          and([
            isType(node, "array"),
            each(node, "array", (child) => scalar(child, value)),
          ]),
        ])
      : equal;
  }
  function containedBy(node: Node, value: Json, root = false): Predicate {
    if (Array.isArray(value)) {
      const array = and([
        isType(node, "array"),
        each(
          node,
          "array",
          (child) =>
            sql<boolean>`not ${or(value.map((item) => containedBy(child, item)))}`,
          true,
        ),
      ]);
      return root
        ? or([
            array,
            ...value
              .filter((item) => item === null || typeof item !== "object")
              .map((item) => scalar(node, item)),
          ])
        : array;
    }
    if (value !== null && typeof value === "object")
      return and([
        isType(node, "object"),
        each(
          node,
          "object",
          (child, runtimeKey) =>
            sql<boolean>`not ${or(
              Object.entries(value).map(([key, item]) =>
                and([
                  sql<boolean>`${runtimeKey} collate binary = ${parameter(key)}`,
                  containedBy(child, item),
                ]),
              ),
            )}`,
          true,
        ),
      ]);
    return scalar(node, value);
  }
  const document = sql.ref("__jsonb_shallow_input.document");
  const node: Node = {
    type: sql<string>`json_type(${document})`,
    value: sql`json_extract(${document}, '$')`,
  };
  const predicate =
    direction === "contains"
      ? contains(node, filter, true)
      : containedBy(node, filter, true);
  return sql<
    boolean | null
  >`(select case when ${document} is null then null else ${predicate} end
    from (select ${input} as document) as __jsonb_shallow_input)`;
}
