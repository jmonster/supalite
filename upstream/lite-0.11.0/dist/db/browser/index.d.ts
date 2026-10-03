import { Kysely } from 'kysely';
import { SqliteConnection, ISqliteConnectionConfig } from '@supabase/lite';
import { Database } from '@sqlite.org/sqlite-wasm';

interface IBrowserSqliteConnectionConfig extends ISqliteConnectionConfig {
    db: Database;
    debug?: boolean;
}
declare class BrowserSqliteConnection<DB = any> extends SqliteConnection<Database, DB, IBrowserSqliteConnectionConfig> {
    kysely: Kysely<DB>;
    driver: Database;
    constructor(config: IBrowserSqliteConnectionConfig);
    exec<T = {
        rows: Record<string, unknown>[];
    } | void>(query: string, ...parameters: readonly unknown[]): Promise<T>;
    close(): Promise<void>;
    transaction(statements: string[]): Promise<void>;
}
declare function createConnection(config?: Partial<IBrowserSqliteConnectionConfig>): Promise<BrowserSqliteConnection>;

export { BrowserSqliteConnection, type IBrowserSqliteConnectionConfig, createConnection };
