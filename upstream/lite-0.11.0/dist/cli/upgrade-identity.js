export function identityDefinition(column) {
  if (column.is_identity !== "YES")
    throw new Error("Expected an identity column");
  const mode = column.identity_generation;
  if (mode !== "ALWAYS" && mode !== "BY DEFAULT")
    throw new Error("Unknown identity generation mode");
  const options = [
    ["START WITH", column.identity_start],
    ["INCREMENT BY", column.identity_increment],
    ["MINVALUE", column.identity_minimum],
    ["MAXVALUE", column.identity_maximum],
  ].map(([name, value]) => {
    if (typeof value !== "string" || !/^-?\d+$/.test(value))
      throw new Error(`Invalid identity ${name}`);
    return `${name} ${value}`;
  });
  options.push(column.identity_cycle === "YES" ? "CYCLE" : "NO CYCLE");
  return `GENERATED ${mode} AS IDENTITY (${options.join(" ")})`;
}
/** Read the parser's AST of the reconstructed catalog, not the original CREATE
 * text: intervening ALTER TABLE migrations may have changed identity mode. */
export function preserveUpgradeIdentities(parsed) {
  for (const statement of parsed.ast.stmts ?? []) {
    const create = statement.stmt?.CreateStmt;
    if (!create?.relation?.relname) continue;
    const table = parsed.schema.get(
      `${create.relation.schemaname ?? "public"}.${create.relation.relname}`,
    );
    for (const element of create.tableElts ?? []) {
      const column = element.ColumnDef;
      const identity = column?.constraints?.find(
        (item) => item.Constraint?.contype === "CONSTR_IDENTITY",
      )?.Constraint;
      if (!identity || !column?.colname) continue;
      const field = table?.get(column.colname);
      if (!field)
        throw new Error("Identity column is missing from upgrade schema");
      if (identity.generated_when !== "a" && identity.generated_when !== "d")
        throw new Error("Unknown identity generation mode");
      field.context.identityGeneration =
        identity.generated_when === "a" ? "ALWAYS" : "BY DEFAULT";
    }
  }
  return parsed.schema;
}
export function identityOverride(columns, table) {
  return columns.some(
    (column) =>
      table?.get(column.name)?.context.identityGeneration === "ALWAYS",
  )
    ? " OVERRIDING SYSTEM VALUE"
    : "";
}
const quoteIdentifier = (name) => `"${name.replace(/"/g, '""')}"`;
const quoteLiteral = (value) => `'${value.replace(/'/g, "''")}'`;
/** Continue beyond imported IDs in the configured direction and increment.
 * Use target catalog values and numeric arithmetic: bigint boundary arithmetic
 * must not overflow. Exact div avoids rounded quotients at large increments;
 * the direction/start guard keeps its quotient nonnegative. Explicitly supplied
 * IDs may be outside sequence bounds.
 * This restores safe continuation from rows, not a source sequence's used gaps. */
export function identitySequenceReset(schema, table, column) {
  const relation = `${quoteIdentifier(schema)}.${quoteIdentifier(table)}`;
  const identifier = quoteIdentifier(column);
  const body = `
DECLARE
  identity_sequence regclass := pg_get_serial_sequence(${quoteLiteral(relation)}, ${quoteLiteral(column)});
  options pg_catalog.pg_sequence%ROWTYPE;
  boundary numeric;
  next_value numeric;
BEGIN
  IF identity_sequence IS NULL THEN
    RAISE EXCEPTION 'Upgrade identity sequence is missing' USING ERRCODE = '55000';
  END IF;
  SELECT * INTO STRICT options FROM pg_catalog.pg_sequence WHERE seqrelid = identity_sequence;
  IF options.seqcycle THEN
    RAISE EXCEPTION 'Upgrade identity sequence reset does not support CYCLE' USING ERRCODE = '0A000';
  END IF;
  SELECT CASE WHEN options.seqincrement > 0 THEN MAX(${identifier}) ELSE MIN(${identifier}) END
    INTO boundary FROM ${relation};
  next_value := options.seqstart;
  IF (options.seqincrement > 0 AND boundary >= options.seqstart)
     OR (options.seqincrement < 0 AND boundary <= options.seqstart) THEN
    next_value := options.seqstart + (pg_catalog.div(boundary - options.seqstart, options.seqincrement) + 1) * options.seqincrement;
  END IF;
  IF next_value > options.seqmax OR next_value < options.seqmin THEN
    PERFORM pg_catalog.setval(identity_sequence, CASE WHEN options.seqincrement > 0 THEN options.seqmax ELSE options.seqmin END, true);
  ELSE
    PERFORM pg_catalog.setval(identity_sequence, next_value::bigint, false);
  END IF;
END
`;
  let delimiter = "$lite_identity$";
  while (body.includes(delimiter)) delimiter = `${delimiter.slice(0, -1)}_$`;
  return `DO ${delimiter}${body}${delimiter};`;
}
export function upgradeSequenceReset(
  schema,
  table,
  column,
  field,
  serialReset,
) {
  return field?.context.identityGeneration
    ? identitySequenceReset(schema, table, column)
    : serialReset(schema, table, column);
}
