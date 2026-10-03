/** A table identity from the connection's postprocessed schema inventory. */
export interface UpgradeTableIdentity {
  schema?: string | null;
  name: string;
}

/**
 * Migration records supply the upgrade's schema SQL; they are not application
 * rows. Match the exact identities rather than reserving an entire schema or
 * matching a table-name prefix, which would silently drop application data.
 */
export function isUpgradeMigrationMetadata(table: UpgradeTableIdentity): boolean {
  return table.schema === "supabase_migrations" &&
    (table.name === "schema_migrations" || table.name === "seed_files");
}
