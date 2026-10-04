import * as _supabase_supabase_js from '@supabase/supabase-js';
import { SupportedStorage, SupabaseClient } from '@supabase/supabase-js';
import { S as Schema } from '../index-DKO3OQpz.js';
import { Connection, DefaultAppConfig, App } from '@supabase/lite';
import 'jsonv-ts';

declare class Filesystem {
    readonly root: string;
    constructor(_path?: string, _root?: string);
    private ensureRoot;
    static homeDir(): string;
    static projectDir(): string;
    deleteAll(silent?: boolean): void;
    delete(name: string, silent?: boolean): void;
    write(name: string, content: string, silent?: boolean): void;
    read(name: string, silent?: boolean): string | undefined;
    relativePath(name?: string): string;
    path(name?: string): string;
}

declare class AuthStorage implements SupportedStorage {
    private readonly root;
    constructor(root: string);
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
}

interface BaseApiConfig {
    host?: string;
    projectsHost?: string;
    token?: string;
    root?: string;
    client?: SupabaseClient;
    authStorage?: AuthStorage;
    withSupabaseClient?: boolean;
}
declare abstract class BaseApi<Config extends BaseApiConfig = BaseApiConfig> {
    readonly config: Config;
    protected readonly tempFs: Filesystem;
    protected readonly projectFs: Filesystem;
    protected readonly schemaFs: Filesystem;
    protected readonly _client: SupabaseClient | undefined;
    protected readonly authStorage: AuthStorage;
    constructor(config: Config);
    fetch(input: string | URL, init?: RequestInit): Promise<Response>;
}

type Project = {
    id: string;
    name: string;
    created_at: string;
};
interface ProjectApiConfig extends BaseApiConfig {
    host: string;
}
declare class ProjectApi extends BaseApi {
    readonly config: ProjectApiConfig;
    constructor(config: ProjectApiConfig);
    protected get client(): SupabaseClient;
    protected projectRef(): string | undefined;
    protected projectUrl(projectRef: string): string;
}

declare class ProjectLocalApi extends ProjectApi {
    ref(): string | undefined;
    setRef(projectRef: string): this;
    link(project: Project): Project;
    unlink(): this;
    url(): string;
    getConfigPath(file_path?: string): Promise<string | undefined>;
    protected readConfig(file_path?: string): Promise<Schema>;
    createConnection(): Promise<Connection>;
    getConfig(file_path?: string): Promise<DefaultAppConfig>;
    /**
     * Build the `App` for a local project: read the config, resolve the
     * connection, apply caller overrides, and initialize it.
     *
     * @param opts.admin An explicit local-admin-mode decision (see
     * `ServerOptions.admin`) — `--no-admin`, or the Vite preview server's forced
     * opt-out. Wins over `config.toml`: otherwise a config saying `admin = true`
     * would silently re-enable what the operator just turned off.
     * @param opts.adminDefault The launcher's default, applied only when neither
     * the caller nor the config expressed a preference — so a project can set
     * `admin = false` in config and have `lite start` honor it.
     *
     * Resolution order is therefore `admin` > `config.toml` > `adminDefault`.
     */
    createApp(config_path?: string, opts?: {
        admin?: boolean;
        adminDefault?: boolean;
    }): Promise<App>;
}

type HostedProjectConfig = ReturnType<App["getInfoJson"]>;
interface RemoteMigration {
    version: string;
    name: string | null;
}
interface ApplyRemoteMigrationInput {
    version: string;
    name: string | null;
    query: string;
}
declare class ProjectRemoteApi extends ProjectApi {
    url(projectRef: string): string;
    ping(): Promise<boolean>;
    list(): Promise<Project[]>;
    get(projectRef?: string): Promise<Project>;
    create(project: Partial<Omit<Project, "id" | "created_at">>): Promise<Project>;
    getConfig(projectRef: string): Promise<HostedProjectConfig>;
    setConfig(projectRef: string, config: HostedProjectConfig): Promise<void>;
    listMigrations(projectRef: string): Promise<RemoteMigration[]>;
    applyMigration(projectRef: string, migration: ApplyRemoteMigrationInput): Promise<void>;
    createApp(projectRef: string): Promise<App>;
}

interface ApiConfig extends BaseApiConfig {
    host: string;
    root: string;
}
declare class Api extends BaseApi<ApiConfig> {
    project: {
        local: ProjectLocalApi;
        remote: ProjectRemoteApi;
    };
    get client(): SupabaseClient;
    getSession(): Promise<{
        data: {
            session: _supabase_supabase_js.AuthSession;
        };
        error: null;
    } | {
        data: {
            session: null;
        };
        error: _supabase_supabase_js.AuthError;
    } | {
        data: {
            session: null;
        };
        error: null;
    }>;
    getAccessToken(): Promise<string | undefined>;
    requireSession(): Promise<string>;
    init(): Promise<this>;
}

declare function createApi(options?: Partial<ApiConfig>): Promise<Api>;

type GeneratedProjectKeys = {
    publishable?: string;
    secret?: string;
};
/** @param created True only on the run that wrote the config, so `lite dev` can announce the scaffold it caused. */
declare function ensureInitialStructure(opts?: Partial<{
    configFormat: "toml" | "json";
    driver: NonNullable<Schema["db"]>["driver"];
    recreate: boolean;
    template: boolean;
}>): Promise<{
    generatedKeys?: GeneratedProjectKeys;
    created: boolean;
}>;

declare function ensureSchema(app: App, opts?: {
    force?: boolean;
}): Promise<void>;
/** Returns a stop function so callers can tear the watcher down on shutdown. */
declare function watchSchema(app: App, opts?: {
    force?: boolean;
    translate?: boolean;
}): () => Promise<void>;

interface MigrationFile {
    version: string;
    name: string | null;
    filename: string;
    path: string;
    sql: string;
}
declare function migrationsDir(app: App): string;
declare function listMigrationFiles(app: App): Promise<MigrationFile[]>;

interface ApplyResult {
    applied: MigrationFile[];
    skipped: MigrationFile[];
}
/**
 * Apply pending migrations to the connected database, one implicit transaction
 * per file. The history INSERT is appended to the file's batch so a failure in
 * any statement rolls back the record too — same semantics as Supabase CLI
 * (`~/supabase/cli/pkg/migration/file.go:72-103` `ExecBatch`).
 */
declare function applyPendingMigrations(app: App): Promise<ApplyResult>;

/**
 * Resolve the project's configured `auth.publishable_key`, fully substituted
 * (an `env(VAR)` ref resolves to the real value, or "" if unset) — without
 * opening a database connection. Used where only the key is needed (e.g. the
 * Vite plugin's `config()` hook, which runs before the app/connection exists).
 * Returns `undefined` when no project/config is found, the config can't be
 * read (missing/malformed — never crash `vite dev` over this), or no key is
 * configured.
 *
 * `env` defaults to `process.env` but can be overridden with an isolated
 * object — tests share one process (`bun test` interleaves files async), so
 * mutating the real `process.env` here (via `loadDotenvForConfig`'s
 * first-write-wins) would otherwise race with any other test's `.env` load.
 */
declare function resolveConfiguredPublishableKey(configPath?: string, env?: NodeJS.ProcessEnv): Promise<string | undefined>;

export { applyPendingMigrations, createApi, ensureInitialStructure, ensureSchema, listMigrationFiles, migrationsDir, resolveConfiguredPublishableKey, watchSchema };
