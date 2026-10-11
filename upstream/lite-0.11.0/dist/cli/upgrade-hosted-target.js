/** Adapt Management API row arrays to the SQL result used by replay and verification. */
export function hostedUpgradeTarget(api, projectRef, apiUrl, serviceRoleKey) {
  return {
    status: { target: "hosted", projectRef, apiUrl, serviceRoleKey },
    async runSql(sql) {
      const rows = await api.runSql(projectRef, sql);
      if (!Array.isArray(rows))
        throw new Error(
          "Supabase Management API returned an invalid SQL result",
        );
      return { rows };
    },
    updateAuthConfig: (config) => api.updateAuthConfig(projectRef, config),
  };
}
