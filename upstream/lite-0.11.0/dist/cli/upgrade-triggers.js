const ident = (value) => `"${String(value).replaceAll('"', '""')}"`;
const literal = (value) => `'${String(value).replaceAll("'", "''")}'`;
const rows = (result) =>
  Array.isArray(result)
    ? result.flatMap((value) => value.rows ?? [])
    : (result.rows ?? []);
/** Replay stored rows without repeating application side effects. Constraint and platform triggers stay enabled. */
export async function withUpgradeApplicationTriggers(
  query,
  schemas,
  importRows,
) {
  const names = [...new Set(schemas)];
  if (!names.length) return importRows();
  const list = names.map(literal).join(",");
  const functions = rows(
    await query(`SELECT DISTINCT p.oid,fn.nspname AS schema,p.proname AS name,
    pg_get_functiondef(p.oid) AS definition, p.pronargs AS arguments, language.lanname AS language,
    p.proowner=(SELECT oid FROM pg_roles WHERE rolname=current_user) AS owned,
    EXISTS(SELECT 1 FROM pg_depend dependency WHERE dependency.classid='pg_proc'::regclass AND dependency.objid=p.oid AND dependency.deptype='e') AS extension
    FROM pg_catalog.pg_trigger tg JOIN pg_catalog.pg_class c ON c.oid=tg.tgrelid
    JOIN pg_catalog.pg_namespace ns ON ns.oid=c.relnamespace
    JOIN pg_catalog.pg_proc p ON p.oid=tg.tgfoid JOIN pg_catalog.pg_namespace fn ON fn.oid=p.pronamespace
    JOIN pg_catalog.pg_language language ON language.oid=p.prolang
    WHERE NOT tg.tgisinternal AND tg.tgenabled<>'D'
      AND (ns.nspname IN (${list}) OR (ns.nspname='auth' AND fn.nspname IN (${list})))
    ORDER BY p.oid`),
  );
  for (const fn of functions) {
    if (
      !names.includes(fn.schema) ||
      !fn.owned ||
      fn.extension ||
      fn.arguments !== 0 ||
      fn.language !== "plpgsql"
    )
      throw new Error(
        `Upgrade cannot safely suppress application trigger function ${fn.schema}.${fn.name}: requires a migration-owned, zero-argument PL/pgSQL function`,
      );
  }
  if (!functions.length) return importRows();
  const suppressed = functions
    .map(
      (fn) =>
        `CREATE OR REPLACE FUNCTION ${ident(fn.schema)}.${ident(fn.name)}() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER AS $supalite_import$ BEGIN IF TG_OP='DELETE' THEN RETURN OLD; END IF; RETURN NEW; END $supalite_import$;`,
    )
    .join("\n");
  await query(`BEGIN;\n${suppressed}\nCOMMIT;`);
  let value, error;
  try {
    value = await importRows();
  } catch (cause) {
    error = cause;
  }
  try {
    await query(
      `BEGIN;\n${functions.map((fn) => fn.definition + ";").join("\n")}\nCOMMIT;`,
    );
  } catch (cause) {
    throw new AggregateError(
      error ? [error, cause] : [cause],
      "Upgrade did not restore application trigger functions; target is incomplete",
    );
  }
  if (error) throw error;
  return value;
}
