import { parseSync } from "pgsql-parser";

function endOfStatement(source, start) {
  let quote = null,
    depth = 0;
  for (let index = start; index < source.length; index++) {
    const char = source[index];
    if (quote) {
      if (char === quote) {
        if (source[index + 1] === quote) index++;
        else quote = null;
      }
    } else if (char === "'" || char === '"') quote = char;
    else if (char === "(") depth++;
    else if (char === ")") depth--;
    else if (char === ";" && depth === 0) return index;
  }
  return source.length;
}
function keywordPosition(source, keyword) {
  let quote = null,
    depth = 0;
  for (let index = 0; index < source.length; index++) {
    const char = source[index];
    if (quote) {
      if (char === quote) {
        if (source[index + 1] === quote) index++;
        else quote = null;
      }
    } else if (char === "'" || char === '"') quote = char;
    else if (char === "(") depth++;
    else if (char === ")") depth--;
    else if (
      depth === 0 &&
      source.slice(index, index + keyword.length).toUpperCase() === keyword &&
      !/[\w$]/.test(source[index - 1] ?? "") &&
      !/[\w$]/.test(source[index + keyword.length] ?? "")
    )
      return index;
  }
  return -1;
}
function parseRaise(source) {
  const match = source.match(
    /^RAISE\s+EXCEPTION\s+'((?:[^']|'')*)'(?:\s+USING\s+ERRCODE\s*=\s*'([A-Z0-9]{5})')?\s*$/i,
  );
  if (!match || match[1].includes("%"))
    throw new Error(
      "SQLite trigger: RAISE requires a literal message and optional literal ERRCODE",
    );
  return { message: match[1].replaceAll("''", "'"), code: match[2] ?? "P0001" };
}
export function parseTriggerFunction(source) {
  const block = source.trim().match(/^BEGIN\b([\s\S]*)\bEND\s*;?\s*$/i);
  if (!block)
    throw new Error(
      "SQLite trigger: expected BEGIN ... END without declarations",
    );
  let rest = block[1].trim(),
    returnValue = null;
  const statements = [];
  while (rest) {
    if (/^IF\b/i.test(rest)) {
      const then = keywordPosition(rest, "THEN");
      if (then < 0) throw new Error("SQLite trigger: IF requires THEN");
      const condition = rest.slice(2, then).trim();
      rest = rest.slice(then + 4).trim();
      const end = endOfStatement(rest, 0);
      const guard = parseRaise(rest.slice(0, end).trim());
      rest = rest.slice(end + 1).trim();
      const close = rest.match(/^END\s+IF\s*;/i);
      if (!close)
        throw new Error(
          "SQLite trigger: IF supports one RAISE EXCEPTION; nested branches and ELSE are unsupported",
        );
      rest = rest.slice(close[0].length).trim();
      // Validate the condition with PostgreSQL's parser before retaining it.
      parseSync(`SELECT ${condition}`);
      statements.push({ type: "guard", condition, ...guard });
      continue;
    }
    const end = endOfStatement(rest, 0);
    const statement = rest.slice(0, end).trim();
    rest = rest.slice(Math.min(end + 1, rest.length)).trim();
    if (!statement) continue;
    const returned = statement.match(/^RETURN\s+(NEW|OLD)$/i);
    if (returned) {
      returnValue = returned[1].toUpperCase();
      statements.push({ type: "return", value: returnValue });
      if (rest) throw new Error("SQLite trigger: RETURN must be last");
      continue;
    }
    const assignment = statement.match(
      /^NEW\.([A-Za-z_][\w$]*|"(?:[^"]|"")+")\s*(?::=|=)\s*([\s\S]+)$/i,
    );
    if (assignment) {
      statements.push({
        type: "assignment",
        column: assignment[1],
        expression: assignment[2],
      });
      continue;
    }
    if (/^(INSERT|UPDATE|DELETE)\b/i.test(statement)) {
      statements.push({ type: "dml", sql: statement });
      continue;
    }
    if (/^RAISE\b/i.test(statement)) {
      statements.push({
        type: "guard",
        condition: "true",
        ...parseRaise(statement),
      });
      continue;
    }
    throw new Error(
      `SQLite trigger: unsupported statement ${statement.slice(0, 60)}`,
    );
  }
  if (!returnValue)
    throw new Error(
      "SQLite trigger: body must end with RETURN NEW or RETURN OLD",
    );
  return { statements, returnValue };
}
export function translateTriggerExpression(source, translator, context) {
  const statement = parseSync(`SELECT ${source}`).stmts[0].stmt.SelectStmt;
  return translator.deparse(statement.targetList[0].ResTarget.val, context);
}
export function translateTriggerDml(source, translator, context) {
  const parsed = parseSync(source);
  if (parsed.stmts.length !== 1)
    throw new Error("SQLite trigger: expected one DML statement");
  return translator.deparse(parsed.stmts[0].stmt, context);
}
export function buildTriggerBody(parsed, table, translator, context) {
  const output = [],
    assignments = [];
  for (const statement of parsed.statements) {
    if (statement.type === "return") continue;
    if (statement.type === "guard") {
      const message = `${statement.code}:${statement.message}`.replaceAll(
        "'",
        "''",
      );
      output.push(
        `SELECT RAISE(ABORT, '${message}') WHERE ${translateTriggerExpression(statement.condition, translator, context)}`,
      );
    } else if (statement.type === "assignment") assignments.push(statement);
    else output.push(translateTriggerDml(statement.sql, translator, context));
  }
  if (assignments.length) {
    if (parsed.statements.some((statement) => statement.type === "dml"))
      throw new Error(
        "SQLite trigger: NEW assignments cannot be mixed with DML",
      );
    const rendered = assignments.map((statement) => ({
      column: statement.column,
      expression: translateTriggerExpression(
        statement.expression,
        translator,
        context,
      ),
    }));
    output.push(
      `UPDATE ${table} SET ${rendered.map((item) => `${item.column} = ${item.expression}`).join(", ")} WHERE rowid = NEW.rowid AND (${rendered.map((item) => `${item.column} IS NOT (${item.expression})`).join(" OR ")})`,
    );
  }
  return output;
}
export function compileSqliteTrigger(node, parsed, translator, context) {
  const relation = translator.getRelationName(node.relation);
  const table = translator.RangeVar(node.relation, context);
  const fields =
    translator.sqlFunctionSchemas
      ?.get(`${node.relation.schemaname ?? "public"}.${node.relation.relname}`)
      ?.all() ?? [];
  const types = new Map(
    fields.map((field) => [field.context.column, field.context.pgTypeName]),
  );
  const previous = translator.triggerAliases;
  translator.triggerAliases = new Map([
    ["new", types],
    ["old", types],
  ]);
  try {
    const timing =
      node.timing === 2
        ? "BEFORE"
        : node.timing === 64
          ? "INSTEAD OF"
          : "AFTER";
    const events = [];
    if (node.events & 4) events.push("INSERT");
    if (node.events & 8) events.push("DELETE");
    if (node.events & 16)
      events.push(
        node.columns?.length
          ? `UPDATE OF ${node.columns.map((item) => '"' + item.String.sval.replaceAll('"', '""') + '"').join(", ")}`
          : "UPDATE",
      );
    const assignments = parsed.statements.filter(
      (statement) => statement.type === "assignment",
    );
    const quote = (value) => translator.quoteIfNeeded(value);
    const trigger = (name, when, event, body) =>
      `CREATE TRIGGER ${quote(name)} ${when} ${event} ON ${table} FOR EACH ROW${node.whenClause ? ` WHEN ${translator.deparse(node.whenClause, context)}` : ""} BEGIN\n${body.map((sql) => `  ${sql};`).join("\n")}\nEND;`;
    const output = [];
    events.forEach((event, index) => {
      const name = `${relation}_${node.trigname}${events.length > 1 ? `_${index}` : ""}`;
      if (assignments.length && timing === "BEFORE") {
        if (
          event === "DELETE" ||
          parsed.statements.some((statement) => statement.type === "dml")
        )
          throw new Error(
            "SQLite trigger: BEFORE NEW assignments support INSERT/UPDATE with guards only",
          );
        const guards = buildTriggerBody(
          {
            ...parsed,
            statements: parsed.statements.filter(
              (statement) => statement.type !== "assignment",
            ),
          },
          table,
          translator,
          context,
        );
        if (guards.length) output.push(trigger(name, "BEFORE", event, guards));
        output.push(
          trigger(
            `${name}_assign`,
            "AFTER",
            event,
            buildTriggerBody(
              { ...parsed, statements: assignments },
              table,
              translator,
              context,
            ),
          ),
        );
      } else
        output.push(
          trigger(
            name,
            timing,
            event,
            buildTriggerBody(parsed, table, translator, context),
          ),
        );
    });
    return output.join("\n");
  } finally {
    translator.triggerAliases = previous;
  }
}
