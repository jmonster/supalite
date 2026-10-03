/** Preserve repeated PostgREST query parameters as conjunctions. */
export function mergeFilter(
  where: Record<string, unknown>,
  column: string,
  operators: Record<string, unknown>,
): void {
  const existing = where[column] as Record<string, unknown> | undefined;
  if (!existing) {
    where[column] = operators;
    return;
  }
  if (
    Object.keys(operators).some((operator) => Object.hasOwn(existing, operator))
  ) {
    // Separate $not maps must also remain separate: merging them would change
    // NOT A AND NOT B into NOT (A AND B), or silently drop the first predicate.
    const conjunction = (where.$and ??= []) as Array<Record<string, unknown>>;
    conjunction.push({ [column]: operators });
  } else {
    Object.assign(existing, operators);
  }
}
