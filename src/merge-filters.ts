/** Preserve repeated PostgREST query parameters as conjunctions. */
export function mergeFilter(
  where: Record<string, unknown>,
  column: string,
  operators: Record<string, unknown>,
): void {
  const define = (target: object, key: PropertyKey, value: unknown): void => {
    Object.defineProperty(target, key, {
      value,
      enumerable: true,
      configurable: true,
      writable: true,
    });
  };
  // Column names are user input. Never resolve inherited constructor/__proto__
  // members or invoke Object.prototype's legacy __proto__ setter.
  const existing = Object.hasOwn(where, column)
    ? (where[column] as Record<string, unknown>)
    : undefined;
  if (!existing) {
    define(where, column, operators);
    return;
  }
  if (
    Object.keys(operators).some((operator) => Object.hasOwn(existing, operator))
  ) {
    const conjunction = Object.hasOwn(where, "$and") ? where.$and : undefined;
    const terms = Array.isArray(conjunction) ? conjunction : [];
    if (terms !== conjunction) define(where, "$and", terms);
    // Keep NOT A AND NOT B as separate terms, rather than NOT (A AND B).
    terms.push({ [column]: operators });
  } else {
    for (const key of Reflect.ownKeys(operators)) {
      define(existing, key, (operators as Record<PropertyKey, unknown>)[key]);
    }
  }
}
