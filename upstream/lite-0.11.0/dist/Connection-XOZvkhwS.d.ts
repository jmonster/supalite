import { SelectQueryBuilder, InsertQueryBuilder, UpdateQueryBuilder, DeleteQueryBuilder, KyselyConfig, Kysely } from 'kysely';

interface CacheSetOptions {
    ttl?: number;
}
interface CacheDriver {
    get(key: string): Promise<string | undefined>;
    set(key: string, value: string, options?: CacheSetOptions): Promise<void>;
    delete(key: string): Promise<void>;
}

interface TableInfo {
    name: string;
    sql: string;
    schema: string;
    type: "table" | "view";
    rows: number;
    engine: string;
    collation: string;
}
interface ColumnInfo {
    table: string;
    name: string;
    type: string;
    nullable: boolean;
    default_value: string | null;
    is_primary_key: boolean;
    schema: string;
    ordinal_position: number;
    collation: string;
    character_maximum_length: string | null;
    precision: {
        precision: number | null;
        scale: number | null;
    } | null;
    is_identity: boolean;
    pg_type?: string;
    /**
     * Schema of the column's data type (information_schema `udt_schema`). For a
     * composite/enum/domain typed column this is the schema the *type* lives in,
     * which can differ from the table's `schema` — used to resolve the type
     * against `custom_types` without cross-schema false matches. Postgres only.
     */
    udt_schema?: string;
    is_generated?: boolean;
}
interface IndexInfo {
    table: string;
    name: string;
    unique: boolean;
    columns: string[];
    schema: string;
    sql?: string;
}
interface ForeignKeyInfo {
    table: string;
    column: string;
    ref_table: string;
    ref_column: string;
    on_update: string;
    on_delete: string;
    schema: string;
    ref_schema?: string;
    foreign_key_name: string;
    /** Internal grouping key for derived FK paths that share a display constraint name. */
    foreign_key_group?: string;
    fk_def: string;
    is_visible?: boolean;
}
interface PrimaryKeyInfo {
    table: string;
    columns: string[];
    schema: string;
    field_count: number;
}
interface ViewInfo {
    name: string;
    sql: string;
    schema: string;
}
interface CheckConstraintInfo {
    schema: string;
    table: string;
    expression: string;
    name?: string;
    column?: string;
}
interface UniqueConstraintInfo {
    schema: string;
    table: string;
    name: string;
    columns: string[];
}
interface CommentInfo {
    schema: string;
    table: string;
    column?: string;
    text: string;
}
interface TriggerInfo {
    table: string;
    name: string;
    sql: string;
    schema: string;
}
interface CustomTypesInfo {
    schema: string;
    type: string;
    kind: "enum" | "composite";
    values?: string[];
    fields?: {
        name: string;
        type: string;
    }[];
}
interface FunctionInfo {
    schema: string;
    name: string;
    /** Input parameter names, in declaration order. Empty for unnamed-param functions. */
    arg_names: string[];
    /** Input parameter type names (format_type), aligned with proargtypes order. */
    arg_types: string[];
    /** Count of trailing input params that have a DEFAULT (pronargdefaults). */
    arg_defaults: number;
    /** True when the function has a VARIADIC parameter. */
    has_variadic: boolean;
    /** provolatile: 'i' immutable, 's' stable, 'v' volatile. */
    volatility: string;
    /** Formatted return type (e.g. "integer", "SETOF" is conveyed via return_is_setof). */
    return_type: string;
    /** proretset — function returns a set (SETOF / TABLE). */
    return_is_setof: boolean;
    /**
     * prorows — planner row-count estimate. A SETOF function declared `ROWS 1`
     * has prorows === 1, which PostgREST reads as a to-one computed relationship.
     * SETOF without ROWS defaults to 1000; non-set functions to 0.
     */
    return_rows?: number;
    /**
     * pg_type.typtype of the return type: 'b' base, 'c' composite, 'd' domain,
     * 'e' enum, 'p' pseudo (record/void), 'r' range, 'm' multirange. 'c'/'p'
     * indicate a row/record (object) result rather than a scalar.
     */
    return_typtype: string;
    /**
     * When the return type is a domain ('d'), the formatted name of its underlying
     * base type (pg_type.typbasetype via format_type) — e.g. a `"text/plain"`
     * domain over `text` carries `return_base_type: "text"`. Empty/undefined for
     * non-domain returns. Used to decode a media-type-domain RPC result as raw
     * text vs raw bytea. See server/data/response/media-domain.ts.
     */
    return_base_type?: string;
    /** True when the function has OUT/INOUT/TABLE output columns (object-shaped result). */
    has_out_args: boolean;
}
type IntrospectOptions = {
    exclude_tables?: string[];
    name?: string;
    version?: string;
};
interface IntrospectResult {
    tables: TableInfo[];
    columns: ColumnInfo[];
    indexes: IndexInfo[];
    foreign_keys: ForeignKeyInfo[];
    primary_keys: PrimaryKeyInfo[];
    views: ViewInfo[];
    check_constraints: CheckConstraintInfo[];
    unique_constraints: UniqueConstraintInfo[];
    comments: CommentInfo[];
    custom_types: CustomTypesInfo[];
    triggers: TriggerInfo[];
    /** Stored functions/procedures. Populated on the Postgres dialects only. */
    functions?: FunctionInfo[];
    /**
     * Individual table partitions and their partitioned parent. Populated on the
     * Postgres dialects only. Partitions are hidden from `tables`/`foreign_keys`
     * (like PostgREST), so this carries the partition→parent mapping used to emit
     * the "Perhaps you meant '<parent>'" hint when a partition is requested.
     */
    partitions?: {
        name: string;
        schema: string;
        parent: string;
    }[];
    database_name: string;
    version: string;
    ddl_dialect?: "postgres" | "sqlite";
    /**
     * The API's configured default schema (PostgREST `db-schemas` head). Used to
     * resolve schema-sensitive catalog lookups (e.g. computed relationships/
     * columns) for requests that omit `Accept-/Content-Profile`, where the
     * deparser's `currentSchema` is undefined but the DB still reads this schema.
     */
    default_schema?: string;
    /**
     * Valid time-zone names from `pg_timezone_names`. Populated on the Postgres
     * dialects only and cached with the rest of the introspection. Mirrors
     * PostgREST's cached `TimezoneNames`: a `Prefer: timezone=` value with
     * `handling=strict` is rejected (PGRST122) unless it is a member. Absent on
     * sqlite (no such catalog), where the preference stays lenient. Stored as an
     * array (not a Set) so it survives the JSON schema-cache round-trip.
     */
    timezones?: readonly string[];
}
interface TableDiff {
    type: "added" | "removed" | "modified";
    name: string;
    sql?: string;
}
interface ColumnDiff {
    type: "added" | "removed" | "modified";
    table: string;
    name: string;
    changes?: {
        type?: {
            from: string;
            to: string;
        };
        nullable?: {
            from: boolean;
            to: boolean;
        };
        default_value?: {
            from: string | null;
            to: string | null;
        };
    };
    column?: ColumnInfo;
}
interface IndexDiff {
    type: "added" | "removed";
    table: string;
    name: string;
    unique: boolean;
    columns: string[];
}
interface ForeignKeyDiff {
    type: "added" | "removed";
    table: string;
    column: string;
    ref_table: string;
    ref_column: string;
    on_update: string;
    on_delete: string;
}
interface DiffResult {
    tables: TableDiff[];
    columns: ColumnDiff[];
    indexes: IndexDiff[];
    foreign_keys: ForeignKeyDiff[];
    has_changes: boolean;
}
declare const enum PlanStepType {
    DISABLE_FOREIGN_KEYS = "disable_foreign_keys",
    ENABLE_FOREIGN_KEYS = "enable_foreign_keys",
    BEGIN_TRANSACTION = "begin_transaction",
    COMMIT_TRANSACTION = "commit_transaction",
    CREATE_TABLE = "create_table",
    ADD_COLUMN = "add_column",
    DROP_COLUMN = "drop_column",
    ADD_INDEX = "add_index",
    DROP_INDEX = "drop_index",
    DROP_TABLE = "drop_table",
    RENAME_TABLE = "rename_table",
    COPY_DATA = "copy_data",
    CREATE_TRIGGER = "create_trigger"
}
interface PlanStep {
    sql: string;
    description?: string;
    type?: PlanStepType;
    /**
     * Commit the current transaction and begin a new one before running this
     * step. Set where the planner requires a commit boundary — a statement whose
     * effect is unusable until its transaction commits, e.g. `ALTER TYPE … ADD
     * VALUE` followed by anything that uses the new value.
     *
     * Execution metadata lives on the step (rather than alongside the plan) so it
     * survives cloning and JSON round-trips of a `PlanResult`.
     */
    newTransaction?: boolean;
    /** Run this step outside a transaction entirely (e.g. `CREATE INDEX CONCURRENTLY`). */
    nonTransactional?: boolean;
}
interface DataLossWarning {
    table: string;
    reason: string;
}
interface PlanResult {
    steps: PlanStep[];
    warnings?: DataLossWarning[];
    unsafe: boolean;
}
declare class DataLossError extends Error {
    warnings: DataLossWarning[];
    constructor(warnings: DataLossWarning[]);
}
declare class MigrationError extends Error {
    stepIndex: number;
    sql: string;
    cause: Error;
    constructor(stepIndex: number, sql: string, cause: Error);
}
interface SchemaDiffResult {
    current?: IntrospectResult;
    desired?: IntrospectResult;
    diff: DiffResult | string;
    plan: PlanResult;
}
/**
 * Restricts a diff/migrate to a set of schemas (LITE-291). When set, both the
 * current and desired catalogs are filtered to these schemas, so out-of-scope
 * (e.g. user-land `public`) objects are invisible to the diff and are never
 * dropped. Used by `App.ensureSystemSchema()` to reconcile only system schemas.
 */
interface MigrateScope {
    schemas?: string[];
}
interface ConnectionMigrator {
    diff(scope?: MigrateScope): Promise<SchemaDiffResult>;
    migrate(opts?: {
        force?: boolean;
    } & MigrateScope): Promise<SchemaDiffResult>;
    migratePlan(planResult: PlanResult, opts?: {
        force?: boolean;
    }): Promise<void>;
    safeSortPlanSteps(steps: PlanStep[]): PlanStep[];
}

/**
 * Nested object for runtime variable substitution.
 * Paths are resolved via lodash-style dot-path access (e.g. "auth.jwt.role" → vars.auth.jwt.role).
 * e.g. { auth: { uid: "uuid-here", role: "authenticated", jwt: { role: "admin" } } }
 */
type VarsContext = Record<string, unknown>;

type ASTType = "query" | "insert" | "update" | "delete" | "upsert" | "put" | "rpc";
type QbSelect = SelectQueryBuilder<any, any, any>;
type QbInsert = InsertQueryBuilder<any, any, any>;
type QbUpdate = UpdateQueryBuilder<any, any, any, any>;
type QbDelete = DeleteQueryBuilder<any, any, any>;
type Qb = QbSelect | QbInsert | QbUpdate | QbDelete;
type ColumnDef = {
    column?: string;
    cast?: string;
    preCast?: string;
    aggregate?: AggregateFunction;
    bareCount?: boolean;
    path?: string;
    /** True when the trailing JSON-path operator was `->>` (text extract). */
    pathText?: boolean;
    /** First key reached after an earlier `->>` text extraction. */
    invalidJsonTextTraversalKey?: string;
};
type EmbedDef = {
    select?: SelectEntry[];
    where?: Where;
    order?: OrderEntry[];
    limit?: number;
    offset?: number;
    spread?: boolean;
    join?: JoinMap;
};
type SelectEntry = string | Record<string, ColumnDef | EmbedDef>;
type JoinDef = {
    from?: string;
    type?: "inner" | "left";
    hint?: string;
    on?: Where;
};
type JoinMap = Record<string, JoinDef>;
type ColumnRef = {
    $ref: string;
};
declare function isRef(val: unknown): val is ColumnRef;
type WhereValue = {
    [op: string]: unknown;
};
type Where = Record<string, unknown>;
type OrderEntry = {
    column: string;
    direction?: "asc" | "desc";
    nullsFirst?: boolean;
    /** For ordering by embedded resource column: embed alias */
    embed?: string;
};
type TextSearchValue = {
    query: string;
    type?: "plain" | "phrase" | "websearch";
    config?: string;
};
type ExplainOptions = {
    analyze?: boolean;
    verbose?: boolean;
    settings?: boolean;
    buffers?: boolean;
    wal?: boolean;
};
type Meta = {
    cardinality?: "one" | "maybe" | "many";
    count?: "exact" | "planned" | "estimated";
    head?: boolean;
    maxAffected?: number;
    rollback?: boolean;
    missing?: "null" | "default";
    handling?: "strict" | "lenient";
    timezone?: string;
    columns?: string[];
    stripNulls?: boolean;
    explain?: ExplainOptions;
    headers?: Record<string, string>;
    return?: "minimal" | "headers-only" | "representation";
    tx?: "commit" | "rollback";
};
interface BaseAST {
    from: string;
    schema?: string;
    select?: SelectEntry[];
    $meta?: Meta;
}
interface QueryAST extends BaseAST {
    type: "query";
    alias?: string;
    join?: JoinMap;
    where?: Where;
    order?: OrderEntry[];
    limit?: number;
    offset?: number;
    group?: string[];
}
interface InsertAST extends BaseAST {
    type: "insert";
    values: object | object[];
}
interface UpdateAST extends BaseAST {
    type: "update";
    values: object;
    where?: Where;
    order?: OrderEntry[];
    limit?: number;
    offset?: number;
}
interface DeleteAST extends BaseAST {
    type: "delete";
    where?: Where;
    order?: OrderEntry[];
    limit?: number;
    offset?: number;
}
interface UpsertAST extends BaseAST {
    type: "upsert" | "put";
    values: object;
    onConflict?: string[];
    ignoreDuplicates?: boolean;
}
interface RpcAST extends BaseAST {
    type: "rpc";
    function: string;
    args?: object | unknown[];
    /** Embed joins, when `select=` embeds related tables on a `SETOF <table>` result. */
    join?: JoinMap;
    where?: Where;
    order?: OrderEntry[];
    limit?: number;
    offset?: number;
    httpMethod?: "GET" | "POST";
    paramsType?: "named" | "positional";
    inputType?: "json" | "text" | "binary" | "xml";
}
type AST = QueryAST | InsertAST | UpdateAST | DeleteAST | UpsertAST | RpcAST;
type AnyAST = {
    type?: string;
    from?: string;
    function?: string;
    schema?: string;
    join?: JoinMap;
    select?: SelectEntry[];
    where?: Where;
    values?: object | object[];
    args?: object | unknown[];
    order?: OrderEntry[];
    limit?: number;
    offset?: number;
    group?: string[];
    onConflict?: string[];
    ignoreDuplicates?: boolean;
    httpMethod?: "GET" | "POST";
    paramsType?: "named" | "positional";
    inputType?: "json" | "text" | "binary" | "xml";
    $meta?: Meta;
};
type AggregateFunction = "count" | "sum" | "avg" | "min" | "max";
type RouteResult = {
    from?: string;
    function?: string;
    isRpc: boolean;
};
type PreferToken = {
    key: "count";
    value: "exact" | "planned" | "estimated";
} | {
    key: "resolution";
    value: "merge-duplicates" | "ignore-duplicates";
} | {
    key: "return";
    value: "minimal" | "headers-only" | "representation";
} | {
    key: "tx";
    value: "commit" | "rollback";
} | {
    key: "missing";
    value: "default" | "null";
} | {
    key: "handling";
    value: "strict" | "lenient";
} | {
    key: "max-affected";
    value: number;
} | {
    key: "timezone";
    value: string;
} | {
    key: "params";
    value: "single-object" | "multiple-objects";
};
type HeadersResult = {
    schema?: string;
    preferTokens: PreferToken[];
    accept: string;
};
type SelectResult = {
    select: SelectEntry[];
    join: JoinMap;
    embeddedAliases: Set<string>;
};
type BodyResult = {
    values?: object | object[];
    args?: object;
    raw?: string;
};
type QueryParamsResult = Map<string, string[]>;
type FiltersResult = {
    where: Where;
    embeddedWheres: Record<string, Where>;
};
type EmbedTransform = {
    order?: OrderEntry[];
    limit?: number;
    offset?: number;
    _nested?: Record<string, {
        order?: OrderEntry[];
        limit?: number;
        offset?: number;
    }>;
};
type TransformsResult = {
    order?: OrderEntry[];
    limit?: number;
    offset?: number;
    embeddedTransforms: Record<string, EmbedTransform>;
};
type RpcResult = {
    args?: object | unknown[];
    httpMethod?: "GET" | "POST";
    paramsType?: "named" | "positional";
    inputType?: "json" | "text" | "binary" | "xml";
};
type UpsertResult = {
    onConflict?: string[];
    ignoreDuplicates: boolean;
};
type TranslatorConfig = {
    parseRoute?: (req: Request) => RouteResult;
    parseHeaders?: (req: Request) => HeadersResult;
    parseSelect?: (req: Request) => SelectResult;
    parseBody?: (req: Request) => Promise<BodyResult>;
    parseQueryParams?: (req: Request) => QueryParamsResult;
    resolveType?: (route: RouteResult, method: string, headers: HeadersResult) => ASTType;
    resolveFilters?: (queryParams: QueryParamsResult, embeddedAliases: Set<string>, fromTable?: string, parentColumns?: ReadonlySet<string>) => FiltersResult;
    /** Physical columns on the request table (for embed/column homonym filters). */
    parentColumns?: ReadonlySet<string>;
    resolveTransforms?: (queryParams: QueryParamsResult, embeddedAliases: Set<string>) => TransformsResult;
    resolveMeta?: (headers: HeadersResult, queryParams: QueryParamsResult, method: string) => Meta;
    resolveRpcParams?: (route: RouteResult, method: string, queryParams: QueryParamsResult, body: BodyResult) => RpcResult;
    resolveUpsertParams?: (queryParams: QueryParamsResult, headers: HeadersResult) => UpsertResult;
    basePath?: string;
};

interface IConnectionConfig extends Partial<KyselyConfig> {
    url?: string;
    introspection?: IntrospectOptions;
    schemaCache?: CacheDriver;
    /**
     * Base schema of the connection that is always prepended to any schema operations.
     * E.g. when migrating to a desired schema, `baseSchema` is always prepended.
     * This is useful for when auth is enabled, and auth schema must be present.
     */
    baseSchema?: string;
    /** System-owned tables whose own schema enables RLS. */
    systemRls?: Array<{
        schema: string;
        tables: string[];
    }>;
}
type Dialect = "sqlite" | "postgres";
type TransactionOptions = {
    intent?: "migration";
};
type ConnectionContextOptions = {
    forceRollback?: boolean;
    /** Reuse an existing transaction so trusted preflights and scoped writes stay atomic. */
    transaction?: Kysely<any>;
    /**
     * Present for RPC (`/rpc/*`) requests on the postgres backend only. Forces the
     * call into one explicit transaction so request.* GUC injection, GET read-only
     * mode, and the function's transaction-local response.* GUCs (read back by the
     * handler) are atomic. Without it, the common anon path runs with no
     * transaction and `set_config(...,true)` would be lost before the read-back.
     * Ignored by the base/sqlite pass-through `withContext` (RPC is rejected on
     * sqlite at server/data.ts, so sqlite never constructs this).
     */
    rpc?: {
        method: string;
        path: string;
        readOnly: boolean;
        requestHeaders?: Record<string, string>;
    };
};
declare class RelationNotFoundError extends Error {
    readonly schema: string | undefined;
    readonly relation: string;
    constructor(schema: string | undefined, relation: string);
}
declare abstract class Connection<Driver = unknown, DB = any, Config extends IConnectionConfig = IConnectionConfig> {
    config: Config;
    kysely: Kysely<DB>;
    abstract driver: Driver;
    abstract dialect: Dialect;
    protected introspection: IntrospectResult | undefined;
    protected constructor(config: Config);
    /**
     * Connection-level DDL translation, mainly for SQLite connections to override.
     */
    translateDdl(ddl: string): Promise<unknown>;
    /** Return connection config in the shape persisted by external consumers. */
    serializeConfig(): Config;
    clearSchemaCache(): Promise<void>;
    protected readCachedIntrospection(options?: {
        useCache?: boolean;
    }): Promise<IntrospectResult | undefined>;
    protected writeCachedIntrospection(result: IntrospectResult, options?: {
        useDriver?: boolean;
    }): Promise<void>;
    protected deleteCachedIntrospection(): Promise<void>;
    protected schemaCacheKey(): string;
    exec<T = {
        rows: unknown[];
    } | void>(query: string, ...parameters: readonly unknown[]): Promise<T>;
    ping(): Promise<boolean | void>;
    abstract introspect(options?: {
        useCache?: boolean;
    }): Promise<IntrospectResult>;
    transaction(_statements: string[], _opts?: TransactionOptions): Promise<void>;
    /**
     * Callback-based transaction API for application code (e.g. AuthRepository)
     * that needs atomicity across several kysely operations without hand-rolling
     * BEGIN/COMMIT/ROLLBACK. `fn` is handed a kysely instance bound to the
     * transaction — use it (not `this.kysely`) for every operation that must
     * participate.
     *
     * Default implementation issues a real BEGIN/COMMIT/ROLLBACK via kysely's
     * `transaction().execute()`, appropriate for backends where `sql\`BEGIN\``
     * is meaningful (base sqlite drivers, Postgres). Durable Objects storage
     * has no such thing — `DoSqliteConnection` overrides this to use
     * `storage.transaction()` instead, running `fn` against the *same* kysely
     * instance (see that class for why).
     */
    runInTransaction<T>(fn: (trx: Kysely<DB>) => Promise<T>): Promise<T>;
    abstract close(): Promise<void>;
    createMigrator(_desiredSchema: string): ConnectionMigrator;
    onPostgrestAST(ast: AnyAST, _vars?: VarsContext): Promise<AnyAST>;
    /**
     * Per-row response coercion run after schema-typed deserialization.
     * Subclasses fix wire-protocol-shape quirks (e.g. JSON-as-text on
     * Postgres `json_agg`, numeric-as-string from postgres.js). Default = no-op.
     */
    deserializeRow(row: Record<string, unknown>): Record<string, unknown>;
    /**
     * Normalize a database error into a PG-style error object.
     * Override in subclasses to map dialect-specific error codes.
     */
    normalizeDbError(e: unknown): unknown;
    /**
     * Wrap PostgREST query execution with connection-specific context.
     * For Postgres: wraps in a transaction with SET LOCAL role/claims.
     * Default: pass-through.
     */
    withContext<T>(_vars: VarsContext | undefined, fn: (db: Kysely<any>) => Promise<T>, opts?: ConnectionContextOptions): Promise<T>;
    /**
     * Whether this connection serves RPC (stored functions). SQLite-backed
     * connections have none; the data route uses this to gate `/rpc/*`.
     */
    get supportsRpc(): boolean;
    /**
     * OPTIONS write-capability for a view, resolved from the catalog. Returns
     * `null` when the dialect cannot introspect view updatability via SQL (e.g.
     * SQLite, where the caller derives it from `INSTEAD OF` triggers instead).
     * Overridden on the Postgres path.
     */
    viewOptionsMetadata(_viewName: string, _viewSchema: string): Promise<ViewOptionsMetadata | null>;
}
/** Catalog metadata for a view used to build an OPTIONS `Allow` header. */
interface ViewOptionsMetadata {
    canInsert: boolean;
    canUpdate: boolean;
    canDelete: boolean;
    /** Base relations the view reads from, for scoping the PK check. */
    baseTables: Array<{
        schema: string;
        name: string;
    }>;
}

export { type QbDelete as $, type AnyAST as A, type BaseAST as B, Connection as C, type Dialect as D, type EmbedDef as E, type FiltersResult as F, type IndexDiff as G, type HeadersResult as H, type IConnectionConfig as I, type IndexInfo as J, type InsertAST as K, type IntrospectOptions as L, type MigrateScope as M, type JoinDef as N, type JoinMap as O, type PlanStep as P, type Meta as Q, MigrationError as R, type SchemaDiffResult as S, type TransactionOptions as T, type OrderEntry as U, type VarsContext as V, type Where as W, PlanStepType as X, type PreferToken as Y, type PrimaryKeyInfo as Z, type Qb as _, type CacheDriver as a, type QbInsert as a0, type QbSelect as a1, type QbUpdate as a2, type QueryAST as a3, type QueryParamsResult as a4, RelationNotFoundError as a5, type RouteResult as a6, type RpcAST as a7, type RpcResult as a8, type SelectEntry as a9, type SelectResult as aa, type TableDiff as ab, type TableInfo as ac, type TextSearchValue as ad, type TransformsResult as ae, type TranslatorConfig as af, type TriggerInfo as ag, type UniqueConstraintInfo as ah, type UpdateAST as ai, type UpsertAST as aj, type UpsertResult as ak, type ViewInfo as al, type ViewOptionsMetadata as am, type WhereValue as an, isRef as ao, type CacheSetOptions as b, type IntrospectResult as c, type ConnectionMigrator as d, type PlanResult as e, type AST as f, type ASTType as g, type AggregateFunction as h, type BodyResult as i, type CheckConstraintInfo as j, type ColumnDef as k, type ColumnDiff as l, type ColumnInfo as m, type ColumnRef as n, type CommentInfo as o, type ConnectionContextOptions as p, type CustomTypesInfo as q, DataLossError as r, type DataLossWarning as s, type DeleteAST as t, type DiffResult as u, type EmbedTransform as v, type ExplainOptions as w, type ForeignKeyDiff as x, type ForeignKeyInfo as y, type FunctionInfo as z };
