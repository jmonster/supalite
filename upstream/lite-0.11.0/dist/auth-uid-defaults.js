// Only a bare, zero-argument auth.uid() column default is supported. Keep this
// out of the general SQL function registry: SQLite has no request-local JWT.
export function isAuthUidDefault(expression) {
  const call = expression?.FuncCall;
  const name = call?.funcname?.map((part) => part.String?.sval ?? part.String?.str);
  return name?.length === 2 && name[0] === "auth" && name[1] === "uid" &&
    (call.args?.length ?? 0) === 0 &&
    !call.agg_star && !call.agg_distinct && !call.agg_filter &&
    !call.agg_within_group && !call.agg_order?.length && !call.over;
}

// An omitted INSERT column is not part of ON CONFLICT's UPDATE column list.
export const authUidImplicitColumns = Symbol("auth.uid implicit insert columns");

export function applyAuthUidDefaults(ast, vars, schema) {
  if (!["insert", "upsert"].includes(ast.type) || !ast.from || !ast.values) return ast;
  const fields = schema?.get(`${ast.schema ?? "public"}.${ast.from}`)?.all() ?? [];
  const defaults = fields.filter((field) => field.context.defaultValue === "auth.uid()");
  if (defaults.length === 0) return ast;
  const rows = Array.isArray(ast.values) ? ast.values : [ast.values];
  if (rows.length === 0 || rows.some((row) =>
    row === null || typeof row !== "object" || Array.isArray(row),
  )) return ast;
  const columns = ast.$meta?.columns;
  // Preserve the existing error for malformed raw bulk requests. SDK bulk
  // requests supply their union of keys in the columns parameter.
  const keys = (row) => Object.keys(row).sort().join(",");
  if (!columns && rows.some((row) => keys(row) !== keys(rows[0]))) return ast;
  const requested = new Set(columns ?? Object.keys(rows[0]));
  const implicit = defaults.map((field) => field.context.column).filter((name) => !requested.has(name));
  // Match native auth.uid(): NULLIF(current_setting(...), '')::uuid.
  const uid = vars?.auth?.uid === "" ? null : vars?.auth?.uid ?? null;
  const values = rows.map((row) => {
    const result = { ...row };
    for (const field of defaults) {
      const name = field.context.column;
      // A columns projection ignores unlisted body values, including owners.
      if (columns && !requested.has(name)) delete result[name];
      if (!Object.hasOwn(result, name)) {
        result[name] = requested.has(name) && ast.$meta?.missing !== "default"
          ? null
          : uid;
      }
    }
    return result;
  });
  return {
    ...ast,
    values: Array.isArray(ast.values) ? values : values[0],
    ...(columns ? { $meta: { ...ast.$meta, columns: [...columns, ...implicit] } } : {}),
    [authUidImplicitColumns]: implicit,
  };
}
