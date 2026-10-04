import { DatabaseSync } from 'node:sqlite';
import { Kysely } from 'kysely';
import { ISqliteConnectionConfig, SqliteConnection } from '@supabase/lite';

interface INodeSqliteConnectionConfig extends ISqliteConnectionConfig {
}
declare class NodeSqliteConnection<DB = any> extends SqliteConnection<DatabaseSync, DB, INodeSqliteConnectionConfig> {
    kysely: Kysely<DB>;
    driver: DatabaseSync;
    private closed;
    constructor(config?: INodeSqliteConnectionConfig);
    exec<T = {
        rows: unknown[];
    } | void>(query: string, ...parameters: readonly unknown[]): Promise<T>;
    close(): Promise<void>;
}
declare function createConnection(config?: INodeSqliteConnectionConfig): NodeSqliteConnection<any>;

export { type INodeSqliteConnectionConfig, createConnection };
