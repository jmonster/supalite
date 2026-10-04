import { D1Database, D1DatabaseSession, DurableObjectState } from '@cloudflare/workers-types';
import { Kysely } from 'kysely';
import { SqliteConnection, ISqliteConnectionConfig, TransactionOptions } from '@supabase/lite';

interface ID1SqliteConnectionConfig extends ISqliteConnectionConfig {
    binding: D1;
}
type D1 = D1Database | D1DatabaseSession;
declare class D1SqliteConnection<DB = any> extends SqliteConnection<D1, DB, ID1SqliteConnectionConfig> {
    kysely: Kysely<DB>;
    driver: D1;
    constructor(config: ID1SqliteConnectionConfig);
    normalizeBindParams(parameters: readonly unknown[] | undefined): unknown[];
    exec<T = {
        rows: unknown[];
    } | void>(query: string, ...parameters: readonly unknown[]): Promise<T>;
    runInTransaction<T>(fn: (trx: Kysely<DB>) => Promise<T>): Promise<T>;
    transaction(statements: string[], opts?: TransactionOptions): Promise<void>;
}
declare function createD1SqliteConnection(config: ID1SqliteConnectionConfig): D1SqliteConnection<any>;
declare function d1(config: ID1SqliteConnectionConfig): D1SqliteConnection<any>;

type DurableObjectStorage = DurableObjectState["storage"];
interface IDoSqliteConnectionConfig extends ISqliteConnectionConfig {
    storage: DurableObjectStorage;
}
declare class DoSqliteConnection<DB = any> extends SqliteConnection<DurableObjectStorage, DB, IDoSqliteConnectionConfig> {
    kysely: Kysely<DB>;
    driver: DurableObjectStorage;
    constructor(config: IDoSqliteConnectionConfig);
    normalizeBindParams(parameters: readonly unknown[] | undefined): unknown[];
    exec<T = {
        rows: unknown[];
    } | void>(query: string, ...parameters: readonly unknown[]): Promise<T>;
    runInTransaction<T>(fn: (trx: Kysely<DB>) => Promise<T>): Promise<T>;
    transaction(_statements: string[], opts?: TransactionOptions): Promise<void>;
}
declare function createDoSqliteConnection(config: IDoSqliteConnectionConfig): DoSqliteConnection<any>;
declare function doSqlite(config: IDoSqliteConnectionConfig): DoSqliteConnection<any>;

declare function createConnection(_config: any): Promise<void>;

export { D1SqliteConnection, DoSqliteConnection, type ID1SqliteConnectionConfig, type IDoSqliteConnectionConfig, createConnection, createD1SqliteConnection, createDoSqliteConnection, d1, doSqlite };
