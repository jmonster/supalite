export function validId(id: unknown): string {
  if (typeof id !== "string" || !/^[a-zA-Z0-9_-]{1,80}$/.test(id)) throw new Error("Invalid task id");
  return id;
}
