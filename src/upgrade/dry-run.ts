/** Readiness and replay results are produced by the published Lite upgrade runner. */
export interface ReadinessReport {
  ok: boolean;
  errors: string[];
  [key: string]: unknown;
}
export interface AuditReport {
  summary: {
    total: number;
    passed: number;
    warned: number;
    failed: number;
    upgrade_safe: boolean;
  };
  results: unknown[];
}
export interface RehearsalReport {
  ok: boolean;
  [key: string]: unknown;
}
export interface DryRunStages {
  readiness(): Promise<ReadinessReport>;
  audit(): Promise<AuditReport>;
  rehearsal(): Promise<RehearsalReport>;
}
export interface DryRunReport extends AuditReport {
  readiness: ReadinessReport | null;
  rehearsal: RehearsalReport | null;
  errors: { phase: keyof DryRunStages; message: string }[];
}

/**
 * Machine-readable counterpart of the human dry-run pipeline. A successful
 * storage audit alone does not establish that schema/auth/data can be replayed.
 * Stages stop at the first failure, just as the human CLI path does. Null stage
 * results mean that the stage was skipped or threw before returning a report.
 */
export async function runUpgradeDryRun(stages: DryRunStages): Promise<DryRunReport> {
  const report: DryRunReport = {
    summary: { total: 0, passed: 0, warned: 0, failed: 0, upgrade_safe: false },
    results: [],
    readiness: null,
    rehearsal: null,
    errors: [],
  };
  let phase: keyof DryRunStages = "readiness";
  try {
    report.readiness = await stages.readiness();
    if (!report.readiness.ok) return report;

    phase = "audit";
    const audit = await stages.audit();
    // Keep the existing audit counters and field results, while reserving the
    // overall safety flag for completion of every required dry-run stage.
    report.summary = { ...audit.summary, upgrade_safe: false };
    report.results = audit.results;
    if (!audit.summary.upgrade_safe) return report;

    phase = "rehearsal";
    report.rehearsal = await stages.rehearsal();
    report.summary.upgrade_safe = report.rehearsal.ok;
  } catch (error) {
    report.errors.push({ phase, message: String(error) });
  }
  return report;
}

/** Flush the entire JSON document before the CLI's immediate exit wrapper runs. */
export async function writeUpgradeDryRunReport(
  report: DryRunReport,
  output: { write(text: string, callback: (error?: Error | null) => void): unknown },
): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    output.write(JSON.stringify(report, null, 2) + "\n", (error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}
