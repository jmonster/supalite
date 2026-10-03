/** GoTrue uses this legacy tenant value when looking up project-local users. */
export const SUPABASE_AUTH_INSTANCE_ID = "00000000-0000-0000-0000-000000000000";

/**
 * These nullable Lite columns are plain strings in GoTrue's User model.
 * An inactive token/change is represented by an empty string in Supabase.
 * Nullable credentials, contact fields, and timestamps are intentionally absent.
 */
export const SUPABASE_AUTH_EMPTY_STRING_FIELDS = [
  "confirmation_token",
  "recovery_token",
  "email_change",
  "email_change_token_new",
  "email_change_token_current",
  "phone_change",
  "phone_change_token",
  "reauthentication_token",
] as const;

/** Normalize only target-specific auth.users fields, without changing source rows. */
export function normalizeSupabaseAuthUser(
  source: Record<string, unknown>,
): Record<string, unknown> {
  const user = { ...source };
  user.instance_id ??= SUPABASE_AUTH_INSTANCE_ID;
  for (const field of SUPABASE_AUTH_EMPTY_STRING_FIELDS) {
    user[field] ??= "";
  }
  return user;
}
