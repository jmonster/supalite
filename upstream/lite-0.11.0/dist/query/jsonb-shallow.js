import { sql } from "kysely";
const TRUE = sql`1`;
const FALSE = sql`0`;
const and = (parts) =>
  parts.length ? sql`(${sql.join(parts, sql` and `)})` : TRUE;
const or = (parts) =>
  parts.length ? sql`(${sql.join(parts, sql` or `)})` : FALSE;
/**
 * Bounded JSON1 specialization for shallow filters. The caller validates JSON
 * and owns the parameter budget. Deeper filters return null before spending
 * that budget and remain the responsibility of the general compiler.
 */
export function jsonbShallow(input, filter, direction, parameter) {
  const pending = [{ value: filter, depth: 0 }];
  while (pending.length) {
    const { value, depth } = pending.pop();
    if (depth > 3) return null;
    if (value !== null && typeof value === "object") {
      for (const child of Object.values(value))
        pending.push({ value: child, depth: depth + 1 });
    }
  }
  let aliasIndex = 0;
  const isType = (node, type) => sql`${node.type} = ${sql.lit(type)}`;
  function each(node, type, predicate, negate = false) {
    const alias = `__jsonb_shallow_${++aliasIndex}`;
    const child = {
      type: sql.ref(`${alias}.type`),
      value: sql.ref(`${alias}.value`),
    };
    // Wrong-type scalar text must never be passed to json_each as JSON text.
    const source = sql`case when ${isType(node, type)} then ${node.value} else 'null' end`;
    const query = sql`(select 1 from json_each(${source}) as ${sql.ref(alias)}
      where ${predicate(child, sql.ref(`${alias}.key`))})`;
    return negate ? sql`not exists ${query}` : sql`exists ${query}`;
  }
  function scalar(node, value) {
    if (value === null) return isType(node, "null");
    if (typeof value === "boolean")
      return isType(node, value ? "true" : "false");
    if (typeof value === "number")
      return and([
        sql`${node.type} in ('integer', 'real')`,
        sql`${node.value} = ${parameter(value)}`,
      ]);
    if (typeof value === "string")
      return and([
        isType(node, "text"),
        sql`${node.value} collate binary = ${parameter(value)}`,
      ]);
    return FALSE;
  }
  function contains(node, value, root = false) {
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
              sql`${runtimeKey} collate binary = ${parameter(key)}`,
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
  function containedBy(node, value, root = false) {
    if (Array.isArray(value)) {
      const array = and([
        isType(node, "array"),
        each(
          node,
          "array",
          (child) =>
            sql`not ${or(value.map((item) => containedBy(child, item)))}`,
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
            sql`not ${or(
              Object.entries(value).map(([key, item]) =>
                and([
                  sql`${runtimeKey} collate binary = ${parameter(key)}`,
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
  const node = {
    type: sql`json_type(${document})`,
    value: sql`json_extract(${document}, '$')`,
  };
  const predicate =
    direction === "contains"
      ? contains(node, filter, true)
      : containedBy(node, filter, true);
  return sql`(select case when ${document} is null then null else ${predicate} end
    from (select ${input} as document) as __jsonb_shallow_input)`;
}
