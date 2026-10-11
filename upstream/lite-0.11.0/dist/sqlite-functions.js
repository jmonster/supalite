import { parseSync } from "pgsql-parser";

const nameParts = (nodes) =>
  (nodes ?? [])
    .map((node) => node.String?.sval ?? node.String?.str)
    .filter((value) => value !== undefined);
const option = (node, name) =>
  node.options?.find((item) => item.DefElem?.defname === name)?.DefElem?.arg;
const fail = (message) => {
  throw new Error(`SQLite SQL function: ${message}`);
};
const pgError = (code, message) => Object.assign(new Error(message), { code });
const jsonResponse = (value, status = 200, headers = {}) =>
  new Response(JSON.stringify(value), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...headers },
  });
const isJsonType = (type) => /^(?:pg_catalog\.)?jsonb?$/.test(type ?? "");
const isBooleanType = (type) =>
  /^(?:pg_catalog\.)?(?:boolean|bool)$/.test(type ?? "");
const scalarTypes = new Set([
  "text",
  "varchar",
  "uuid",
  "int2",
  "int4",
  "int8",
  "integer",
  "bigint",
  "smallint",
  "numeric",
  "float4",
  "float8",
  "real",
  "double precision",
  "boolean",
  "bool",
  "json",
  "jsonb",
  "timestamptz",
  "timestamp",
  "date",
  "void",
]);
const typeName = (type) =>
  nameParts(type?.names)
    .filter((part) => part !== "pg_catalog")
    .join(".");
const walk = (value, visit) => {
  if (!value || typeof value !== "object") return;
  visit(value);
  for (const child of Object.values(value)) {
    if (Array.isArray(child)) child.forEach((item) => walk(item, visit));
    else walk(child, visit);
  }
};
const constant = (node) => {
  const value = node?.A_Const;
  if (!value) fail("argument defaults must be literal constants");
  if (value.isnull) return null;
  if (value.sval) return value.sval.sval ?? "";
  if (value.ival) return value.ival.ival ?? 0;
  if (value.fval) return Number(value.fval.fval);
  if (value.boolval) return value.boolval.boolval ?? false;
  fail("unsupported argument default");
};

function aliasesFor(ast, schemas) {
  const aliases = new Map();
  walk(ast, (node) => {
    const range = node.RangeVar;
    if (!range) return;
    const fields =
      schemas?.get(`${range.schemaname ?? "public"}.${range.relname}`)?.all() ??
      [];
    aliases.set(
      range.alias?.aliasname ?? range.relname,
      new Map(
        fields.map((field) => [field.context.column, field.context.pgTypeName]),
      ),
    );
  });
  return aliases;
}
function expressionType(node, aliases, args = []) {
  if (node?.ParamRef) return args[node.ParamRef.number - 1]?.type;
  if (node?.TypeCast) return typeName(node.TypeCast.typeName);
  if (node?.A_Const?.boolval) return "boolean";
  const call = nameParts(node?.FuncCall?.funcname).at(-1);
  if (
    call?.startsWith("json") ||
    nameParts(node?.FuncCall?.funcname).join(".") === "auth.jwt"
  )
    return "jsonb";
  const fields = nameParts(node?.ColumnRef?.fields);
  if (fields?.length === 2) return aliases.get(fields[0])?.get(fields[1]);
  if (fields?.length === 1) {
    const candidates = [...aliases.values()]
      .map((map) => map.get(fields[0]))
      .filter(Boolean);
    if (candidates.length && candidates.every((type) => type === candidates[0]))
      return candidates[0];
  }
  return undefined;
}

// The PostgreSQL AST, rather than string replacement, identifies arguments and
// request claims. SQLite receives only driver-bound values, never caller SQL.
export function compileSqlFunction(node, translator, context) {
  const names = nameParts(node.funcname);
  const name = names.at(-1),
    schema = names.length === 1 ? "public" : names.at(-2);
  if (!name || names.length > 2)
    fail("expected a schema-qualified function name");
  if (option(node, "language")?.String?.sval !== "sql")
    fail(`${schema}.${name} requires LANGUAGE sql`);
  const parameters = (node.parameters ?? []).map(
    (item) => item.FunctionParameter,
  );
  if (
    parameters.some(
      (parameter) =>
        !["FUNC_PARAM_DEFAULT", "FUNC_PARAM_IN"].includes(parameter.mode),
    )
  )
    fail("OUT, INOUT and VARIADIC arguments are unsupported");
  const args = parameters.map((parameter, index) => {
    if (!parameter.name) fail("RPC input arguments must be named");
    const type = typeName(parameter.argType);
    if (!scalarTypes.has(type) || parameter.argType?.arrayBounds?.length)
      fail(`unsupported argument type ${type}`);
    return {
      name: parameter.name ?? `$${index + 1}`,
      type,
      ...(parameter.defexpr ? { default: constant(parameter.defexpr) } : {}),
    };
  });
  const returnType = typeName(node.returnType);
  const composite = !scalarTypes.has(returnType);
  if (node.returnType?.arrayBounds?.length)
    fail("array results are unsupported");
  if (
    composite &&
    (!node.returnType?.setof ||
      !translator.sqlFunctionSchemas?.has(
        returnType.includes(".") ? returnType : `public.${returnType}`,
      ))
  )
    fail("table results require RETURNS SETOF with a known table type");
  const definer = option(node, "security")?.Boolean?.boolval === true;
  const volatilityName = option(node, "volatility")?.String?.sval ?? "volatile";
  const volatility = { stable: "s", immutable: "i", volatile: "v" }[
    volatilityName
  ];
  const source = option(node, "as")?.List?.items?.[0]?.String?.sval;
  if (!source) fail(`${schema}.${name} has no SQL body`);
  const body = parseSync(source);
  if (!body.stmts?.length) fail("empty SQL body");
  const searchPath = (node.options ?? [])
    .map((item) => item.DefElem)
    .find(
      (item) =>
        item.defname === "set" &&
        item.arg?.VariableSetStmt?.name === "search_path",
    )?.arg.VariableSetStmt;
  if (
    definer &&
    (searchPath?.args?.length !== 1 || constant(searchPath.args[0]) !== "")
  )
    fail("SECURITY DEFINER requires SET search_path = ''");
  let hasRelations = false;
  walk(body, (child) => {
    if (child.RangeVar) hasRelations = true;
  });
  // SQLite has no native engine RLS. Never silently run invoker table accesses
  // with definer privileges; privileged SQL must make that intent explicit.
  if (hasRelations && !definer)
    fail(
      "table access requires SECURITY DEFINER with explicit authorization predicates",
    );
  const statements = body.stmts.map((raw) => {
    const statement = raw.stmt;
    const kind = Object.keys(statement)[0];
    if (
      !["SelectStmt", "InsertStmt", "UpdateStmt", "DeleteStmt"].includes(kind)
    )
      fail(`unsupported statement ${kind}`);
    if (volatility !== "v" && kind !== "SelectStmt")
      fail("STABLE/IMMUTABLE functions cannot modify data");
    walk(statement, (child) => {
      if (
        child.SelectStmt?.intoClause ||
        child.SelectStmt?.withClause?.ctes?.some(
          (cte) => !cte.CommonTableExpr?.ctequery?.SelectStmt,
        )
      )
        fail("SELECT INTO and writable CTEs are unsupported");
    });
    const slots = [],
      aliases = aliasesFor(statement, translator.sqlFunctionSchemas);
    const previous = translator.sqlFunctionContext;
    translator.sqlFunctionContext = { name, args, aliases, slots };
    try {
      return { sql: translator.deparse(statement, context), slots, kind };
    } finally {
      translator.sqlFunctionContext = previous;
    }
  });
  const final = body.stmts.at(-1).stmt;
  if (
    returnType !== "void" &&
    !final.SelectStmt &&
    !Object.values(final)[0]?.returningList?.length
  )
    fail("the final statement must SELECT or RETURNING the declared result");
  return {
    schema,
    name,
    args,
    statements,
    definer,
    grants: ["public"],
    arg_names: args.map((arg) => arg.name),
    arg_types: args.map((arg) => arg.type),
    arg_defaults: args.filter((arg) => Object.hasOwn(arg, "default")).length,
    has_variadic: false,
    volatility,
    return_type: returnType,
    return_is_setof: node.returnType?.setof === true,
    return_typtype: composite ? "c" : returnType === "void" ? "p" : "b",
    has_out_args: false,
  };
}

export function functionKey(definition) {
  return `${definition.schema}.${definition.name}(${definition.arg_types.join(",")})`;
}
export function dropSqlFunction(node, functions) {
  if (node.behavior === "DROP_CASCADE")
    fail("DROP FUNCTION CASCADE is unsupported");
  for (const item of node.objects ?? []) {
    const object = item.ObjectWithArgs,
      names = nameParts(object?.objname);
    const schema = names.length === 1 ? "public" : names.at(-2),
      name = names.at(-1);
    let key = `${schema}.${name}(${(object?.objargs ?? []).map((arg) => typeName(arg.TypeName)).join(",")})`;
    if (object?.args_unspecified) {
      const matches = [...functions.entries()].filter(
        ([, fn]) => fn.schema === schema && fn.name === name,
      );
      if (matches.length > 1)
        fail(`DROP FUNCTION ${schema}.${name} requires its signature`);
      if (matches.length) key = matches[0][0];
    }
    if (!functions.delete(key) && !node.missing_ok)
      fail(`function ${key} does not exist`);
  }
}
export function applyFunctionGrant(node, functions) {
  if (
    node.objtype !== "OBJECT_FUNCTION" ||
    node.targtype !== "ACL_TARGET_OBJECT"
  )
    fail("only explicit function EXECUTE grants are supported");
  if (
    node.privileges?.some(
      (privilege) =>
        privilege.AccessPriv?.priv_name?.toLowerCase() !== "execute",
    )
  )
    fail("only EXECUTE privilege applies to SQL functions");
  const roles = (node.grantees ?? []).map(
    (item) =>
      item.RoleSpec?.rolename ??
      (item.RoleSpec?.roletype === "ROLESPEC_PUBLIC" ? "public" : null),
  );
  if (
    roles.some(
      (role) =>
        !["public", "anon", "authenticated", "service_role"].includes(role),
    )
  )
    fail("unsupported function execution role");
  for (const object of node.objects ?? []) {
    const definition = object.ObjectWithArgs;
    const names = nameParts(definition?.objname);
    const key = `${names.length === 1 ? "public" : names[0]}.${names.at(-1)}(${(definition?.objargs ?? []).map((item) => typeName(item.TypeName)).join(",")})`;
    const fn = functions.get(key);
    if (!fn) fail(`GRANT/REVOKE references unknown function ${key}`);
    const grants = new Set(fn.grants);
    for (const role of roles)
      node.is_grant ? grants.add(role) : grants.delete(role);
    fn.grants = [...grants];
  }
}

export function translateFunctionParameter(node, translator) {
  const context = translator.sqlFunctionContext;
  if (!context) return undefined;
  if (node.ParamRef) {
    const index = node.ParamRef.number - 1;
    if (index < 0 || index >= context.args.length)
      fail(`argument $${index + 1} is out of range`);
    context.slots.push({ argument: index });
    return "?";
  }
  const fields = nameParts(node.ColumnRef?.fields);
  const index = context.args.findIndex(
    (argument) => argument.name === fields.at(-1),
  );
  if (
    index >= 0 &&
    ((fields.length === 2 &&
      fields[0] === context.name &&
      !context.aliases.has(context.name)) ||
      (fields.length === 1 &&
        ![...context.aliases.values()].some((columns) =>
          columns.has(fields[0]),
        )))
  ) {
    context.slots.push({ argument: index });
    return "?";
  }
  const call = node.FuncCall;
  const names = nameParts(call?.funcname);
  if (
    names.length === 2 &&
    names[0] === "auth" &&
    ["uid", "role", "jwt"].includes(names[1]) &&
    !call.args?.length
  ) {
    context.slots.push({ claim: names[1] });
    return "?";
  }
  return undefined;
}

export function translateJsonFunction(call, translator, context) {
  const name = nameParts(call.funcname).at(-1)?.toLowerCase();
  const args = call.args ?? [];
  const render = (node) => translator.deparse(node, context);
  const jsonValue = (node) => {
    const type = expressionType(
      node,
      translator.sqlFunctionContext?.aliases ??
        translator.triggerAliases ??
        new Map(),
      translator.sqlFunctionContext?.args,
    );
    if (isBooleanType(type))
      return `json(CASE WHEN ${render(node)} THEN 'true' WHEN ${render(node)} IS NULL THEN 'null' ELSE 'false' END)`;
    return isJsonType(type) ? `json(${render(node)})` : render(node);
  };
  if (["json_build_object", "jsonb_build_object"].includes(name)) {
    if (args.length % 2) fail("jsonb_build_object requires key/value pairs");
    return `json_object(${args.map((arg, index) => (index % 2 ? jsonValue(arg) : render(arg))).join(", ")})`;
  }
  if (["json_agg", "jsonb_agg"].includes(name)) {
    if (args.length !== 1 || call.agg_distinct || call.agg_filter || call.over)
      fail("unsupported JSON aggregate shape");
    const order = call.agg_order?.length
      ? ` ORDER BY ${call.agg_order.map((item) => render(item)).join(", ")}`
      : "";
    return `json_group_array(${jsonValue(args[0])}${order})`;
  }
  if (name === "jsonb_set") {
    if (
      args.length < 3 ||
      args.length > 4 ||
      (args[3] && constant(args[3]) !== true)
    )
      fail("jsonb_set supports create_missing=true");
    const pathNode = args[1]?.TypeCast?.arg ?? args[1];
    const path = constant(pathNode);
    if (typeof path !== "string" || !/^\{[A-Za-z_][A-Za-z0-9_]*\}$/.test(path))
      fail("jsonb_set supports a literal single object key");
    return `json_set(${render(args[0])}, '$.${path.slice(1, -1)}', json(${render(args[2])}))`;
  }
  if (["greatest", "least"].includes(name))
    return `${name === "greatest" ? "max" : "min"}(${args.map(render).join(", ")})`;
  return undefined;
}

export function translateJsonRecordset(node, translator, context) {
  if (node.lateral || node.ordinality || node.functions?.length !== 1)
    return undefined;
  const item = node.functions[0]?.List?.items;
  const call = item?.[0]?.FuncCall;
  if (
    !["jsonb_to_recordset", "json_to_recordset"].includes(
      nameParts(call?.funcname).at(-1),
    )
  )
    return undefined;
  if (
    call.args?.length !== 1 ||
    !node.coldeflist?.length ||
    !node.alias?.aliasname
  )
    fail("jsonb_to_recordset requires a typed record alias");
  const quote = (value) => `"${value.replaceAll('"', '""')}"`;
  const columns = node.coldeflist.map((item) => {
    const column = item.ColumnDef;
    if (!column || !/^[A-Za-z_][A-Za-z0-9_]*$/.test(column.colname))
      fail("unsupported JSON record field");
    const type = typeName(column.typeName);
    if (!scalarTypes.has(type) || column.typeName.arrayBounds?.length)
      fail(`unsupported JSON record type ${type}`);
    const value = `json_extract(value, '$.${column.colname}')`;
    const expression = isJsonType(type)
      ? value
      : /^(?:int[248]|integer|bigint|smallint|boolean|bool)$/.test(type)
        ? `CAST(${value} AS INTEGER)`
        : /^(?:float[48]|numeric|real|double precision)$/.test(type)
          ? `CAST(${value} AS REAL)`
          : `CAST(${value} AS TEXT)`;
    return `${expression} AS ${quote(column.colname)}`;
  });
  return `(SELECT ${columns.join(", ")} FROM json_each(${translator.deparse(call.args[0], context)})) AS ${quote(node.alias.aliasname)}`;
}

function bindArgument(value, type) {
  if (value === null) return null;
  if (isJsonType(type)) {
    if (typeof value === "string") {
      try {
        JSON.parse(value);
        return value;
      } catch {
        throw pgError("22P02", "invalid input syntax for type json");
      }
    }
    return JSON.stringify(value);
  }
  if (isBooleanType(type)) {
    if ([true, "true", "t", "1", 1].includes(value)) return 1;
    if ([false, "false", "f", "0", 0].includes(value)) return 0;
    throw pgError("22P02", "invalid input syntax for type boolean");
  }
  if (
    /^(int[248]|integer|bigint|smallint|numeric|float[48]|real|double precision)$/.test(
      type,
    )
  ) {
    const number =
      typeof value === "number"
        ? value
        : typeof value === "string" && value.trim()
          ? Number(value)
          : NaN;
    if (
      !Number.isFinite(number) ||
      (/^(int[248]|integer|bigint|smallint)$/.test(type) &&
        !Number.isSafeInteger(number))
    )
      throw pgError("22P02", `invalid input syntax for type ${type}`);
    return number;
  }
  if (typeof value !== "string")
    throw pgError("22P02", `invalid input syntax for type ${type}`);
  if (
    type === "uuid" &&
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      value,
    )
  )
    throw pgError("22P02", "invalid input syntax for type uuid");
  if (["timestamptz", "timestamp", "date"].includes(type)) {
    if (Number.isNaN(Date.parse(value)))
      throw pgError("22007", "invalid input syntax for timestamp");
    return type === "date"
      ? new Date(value).toISOString().slice(0, 10)
      : new Date(value).toISOString();
  }
  return value;
}
class RpcRollback {
  constructor(response) {
    this.response = response;
  }
}
export async function executeSqliteRpc(connection, ast, vars, request) {
  const functions = connection.config.translation?.deparse?.functions ?? [];
  const supplied = ast.args ?? {};
  if (
    !supplied ||
    typeof supplied !== "object" ||
    Array.isArray(supplied) ||
    ast.inputType === "text"
  )
    throw pgError(
      "PGRST102",
      "SQL RPC requires a JSON object of named arguments",
    );
  const schema = ast.schema ?? "public";
  const candidates = functions.filter(
    (fn) =>
      fn.schema === schema &&
      fn.name === ast.function &&
      Object.keys(supplied).every((key) => fn.arg_names.includes(key)) &&
      fn.args.every(
        (arg) =>
          Object.hasOwn(supplied, arg.name) || Object.hasOwn(arg, "default"),
      ),
  );
  if (candidates.length !== 1)
    throw pgError(
      candidates.length ? "PGRST203" : "PGRST202",
      `Could not resolve ${schema}.${ast.function} with the supplied arguments`,
    );
  const fn = candidates[0],
    role = vars.auth?.role ?? "anon";
  if (!fn.grants.includes("public") && !fn.grants.includes(role))
    throw pgError("42501", `permission denied for function ${fn.name}`);
  if (["GET", "HEAD"].includes(request.method) && fn.volatility === "v")
    throw pgError(
      "25006",
      "Cannot execute a volatile function in a read-only transaction",
    );
  if (
    ast.where ||
    ast.order?.length ||
    ast.join ||
    ast.limit !== undefined ||
    ast.offset !== undefined ||
    ast.select?.some((item) => item !== "*" && !item?.star)
  )
    throw pgError("0A000", "SQL RPC result filtering is not supported");
  const values = fn.args.map((arg) =>
    bindArgument(
      Object.hasOwn(supplied, arg.name) ? supplied[arg.name] : arg.default,
      arg.type,
    ),
  );
  const claims = {
    uid: vars.auth?.uid ?? null,
    role,
    jwt: JSON.stringify(vars.auth?.jwt ?? {}),
  };
  const execute = async (db) => {
    let rows = [];
    for (const statement of fn.statements) {
      const parameters = statement.slots.map((slot) =>
        slot.claim ? claims[slot.claim] : values[slot.argument],
      );
      connection.assertParamLimit(parameters);
      const result = await db.executeQuery({
        sql: statement.sql,
        parameters,
        query: { kind: "RawNode" },
      });
      rows = result.rows ?? [];
    }
    let response;
    if (fn.return_type === "void")
      response = new Response(null, { status: 204 });
    else {
      const decode = (row) => {
        if (fn.return_typtype === "c") {
          const fields = connection.config.translation?.deparse?.schema?.get(
            fn.return_type.includes(".")
              ? fn.return_type
              : `public.${fn.return_type}`,
          );
          return fields
            ? fields.deserializeRow(row)
            : connection.deserializeRow(row);
        }
        const value = Object.values(row)[0] ?? null;
        if (isJsonType(fn.return_type))
          return typeof value === "string" ? JSON.parse(value) : value;
        if (isBooleanType(fn.return_type))
          return value === null ? null : Boolean(value);
        return value;
      };
      const value = fn.return_is_setof
        ? rows.map(decode)
        : rows.length
          ? decode(rows[0])
          : null;
      const singular = /application\/vnd\.pgrst\.object(?:\+json)?/.test(
        request.headers.get("Accept") ?? "",
      );
      if (singular && fn.return_is_setof && rows.length !== 1)
        throw new RpcRollback(
          jsonResponse(
            {
              code: "PGRST116",
              message: "Cannot coerce the result to a single JSON object",
              details: `The result contains ${rows.length} rows`,
              hint: null,
            },
            406,
          ),
        );
      response =
        request.method === "HEAD"
          ? new Response(null, { status: 200 })
          : jsonResponse(singular && fn.return_is_setof ? value[0] : value);
    }
    if (
      request.headers
        .get("Prefer")
        ?.split(",")
        .some((value) => value.trim() === "tx=rollback")
    ) {
      response.headers.set("Preference-Applied", "tx=rollback");
      throw new RpcRollback(response);
    }
    return response;
  };
  try {
    return await connection.runInTransaction(execute);
  } catch (error) {
    if (error instanceof RpcRollback) return error.response;
    throw error;
  }
}
