import { Config, Client } from '@libsql/client';
import { Kysely } from 'kysely';
import { ISqliteConnectionConfig, SqliteConnection, TransactionOptions } from '@supabase/lite';

/**
 * Connection config: Lite's SQLite options plus every libsql client option
 * (`authToken`, `syncUrl`, `encryptionKey`, `intMode`, `tls`, ...). `url` comes
 * from `ISqliteConnectionConfig` and is normalized before reaching libsql.
 */
interface ILibsqlConnectionConfig extends ISqliteConnectionConfig, Omit<Config, "url"> {
    /**
     * Pass an already-constructed libsql `Client` for full control. When set,
     * `url` and the other libsql options are ignored.
     */
    client?: Client;
}
declare class LibsqlConnection<DB = any> extends SqliteConnection<Client, DB, ILibsqlConnectionConfig> {
    kysely: Kysely<DB>;
    driver: Client;
    constructor(config?: ILibsqlConnectionConfig);
    exec<T = {
        rows: unknown[];
    } | void>(query: string, ...parameters: readonly unknown[]): Promise<T>;
    transaction(statements: string[], opts?: TransactionOptions): Promise<void>;
    close(): Promise<void>;
}
declare function createLibsqlConnection(config?: ILibsqlConnectionConfig): LibsqlConnection<any>;
declare function libsql(config?: ILibsqlConnectionConfig): LibsqlConnection<any>;

export { type ILibsqlConnectionConfig, LibsqlConnection, createLibsqlConnection, libsql };
