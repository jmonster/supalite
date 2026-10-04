import { IConnectionConfig, Connection, IntrospectResult, VarsContext, ConnectionContextOptions, AnyAST, TransactionOptions, ViewOptionsMetadata } from '@supabase/lite';
import { Kysely } from 'kysely';

interface IBasePostgresConnectionConfig extends IConnectionConfig {
}
declare abstract class BasePostgresConnection<Driver = unknown, DB = any> extends Connection<Driver, DB> {
    abstract driver: Driver;
    dialect: "postgres";
    /** REST spec harness sets this while a per-case `BEGIN` is open on the shared connection. */
    harnessHoldingOuterTx: boolean;
    constructor(options: IBasePostgresConnectionConfig);
    introspect(options?: {
        useCache?: boolean;
    }): Promise<IntrospectResult>;
    private rlsState;
    /**
     * Detect if any table has RLS enabled, and if so ensure Supabase request
     * roles exist with default privileges. Runs once per connection.
     */
    private ensureRlsContext;
    private postgresTransactionActive;
    private applyJwtSessionContext;
    /**
     * Inject PostgREST's `request.*` context GUCs and reset `response.*` for an RPC
     * request. A function may read the HTTP context via `current_setting('request.headers')`
     * etc.; that call (used without the `missing_ok` arg in the fixtures) errors 42704
     * if the GUC is unset, so request.method/path/headers are always set. response.status
     * and response.headers are reset to empty first so a value set by an earlier step in
     * the harness's shared outer transaction can't leak into this request (in production
     * each RPC gets its own tx, so the leak is harness-only — but the reset is correct
     * either way). All transaction-local (`is_local = true`).
     */
    private applyRpcRequestGucs;
    withContext<T>(vars: VarsContext | undefined, fn: (db: Kysely<any>) => Promise<T>, opts?: ConnectionContextOptions): Promise<T>;
    onPostgrestAST(ast: AnyAST): Promise<AnyAST>;
    transaction(statements: string[], opts?: TransactionOptions): Promise<void>;
    get supportsRpc(): boolean;
    viewOptionsMetadata(viewName: string, viewSchema: string): Promise<ViewOptionsMetadata>;
}

export { BasePostgresConnection as B, type IBasePostgresConnectionConfig as I };
