import postgres from 'postgres';
import { I as IBasePostgresConnectionConfig, B as BasePostgresConnection } from './BasePostgresConnection-xaPv2E6u.js';
import '@supabase/lite';
import 'kysely';

interface IPostgresConnectionConfig extends IBasePostgresConnectionConfig {
    /**
     * Extra options forwarded to the underlying `postgres` (postgres.js) driver,
     * merged over lite's defaults. `connection` and `types` are deep-merged (your
     * keys win, lite's other defaults are kept); every other key is shallow-spread.
     *
     * Example — run the session in a non-UTC timezone instead of the UTC default:
     * `{ connection: { TimeZone: "America/New_York" } }`.
     */
    postgresOptions?: postgres.Options<Record<string, postgres.PostgresType>>;
}
declare class PostgresConnection extends BasePostgresConnection<postgres.Sql, any> {
    driver: postgres.Sql<any>;
    dialect: "postgres";
    constructor(config: IPostgresConnectionConfig);
    close(): Promise<void>;
}
declare function createPostgresConnection(config: IPostgresConnectionConfig): PostgresConnection;

export { type IPostgresConnectionConfig, PostgresConnection, createPostgresConnection };
