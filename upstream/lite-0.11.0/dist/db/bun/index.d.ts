import Database from 'bun:sqlite';
import { Kysely } from 'kysely';
import { ISqliteConnectionConfig, SqliteConnection } from '@supabase/lite';

interface IBunSqliteConnectionConfig extends ISqliteConnectionConfig {
    debug?: boolean;
}
declare class BunSqliteConnection<DB = any> extends SqliteConnection<Database, DB, IBunSqliteConnectionConfig> {
    kysely: Kysely<DB>;
    driver: Database;
    private closed;
    constructor(config?: IBunSqliteConnectionConfig);
    exec<T = {
        rows: unknown[];
    } | void>(query: string, ...parameters: readonly unknown[]): Promise<T>;
    close(): Promise<void>;
}
declare function createConnection(config?: IBunSqliteConnectionConfig): BunSqliteConnection<any>;

export { type IBunSqliteConnectionConfig, createConnection };
