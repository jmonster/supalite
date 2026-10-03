import { PGliteOptions, PGlite } from '@electric-sql/pglite';
export { PGlite } from '@electric-sql/pglite';
import { I as IBasePostgresConnectionConfig, B as BasePostgresConnection } from '../BasePostgresConnection-xaPv2E6u.js';
import { ConnectionMigrator, MigrateScope, SchemaDiffResult, PlanResult, PlanStep } from '@supabase/lite';
import 'kysely';

declare class PostgresMigrator implements ConnectionMigrator {
    #private;
    private readonly from;
    private readonly desiredSchema;
    constructor(from: PgliteConnection, desiredSchema: string);
    diff(scope?: MigrateScope): Promise<SchemaDiffResult>;
    migratePlan(planResult: PlanResult, opts?: {
        force?: boolean;
    }): Promise<void>;
    migrate(opts?: {
        force?: boolean;
    } & MigrateScope): Promise<SchemaDiffResult>;
    safeSortPlanSteps(steps: PlanStep[]): PlanStep[];
}

interface IPgliteConnectionConfig extends IBasePostgresConnectionConfig {
    pgliteOptions?: Omit<PGliteOptions, "dataDir">;
}
declare class PgliteConnection extends BasePostgresConnection<PGlite, any> {
    #private;
    driver: PGlite;
    dialect: "postgres";
    constructor(config?: IPgliteConnectionConfig);
    exec<T = {
        rows: unknown[];
    } | void>(query: string, ...parameters: readonly unknown[]): Promise<T>;
    close(): Promise<void>;
    createMigrator(desiredSchema: string): PostgresMigrator;
}
declare function createPgliteConnection(config?: IPgliteConnectionConfig): Promise<PgliteConnection>;

export { type IPgliteConnectionConfig, PgliteConnection, createPgliteConnection };
