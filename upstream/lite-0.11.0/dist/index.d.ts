import * as _supabase_supabase_js from '@supabase/supabase-js';
import { SupabaseClientOptions } from '@supabase/supabase-js';
import { D as DefaultSchema, S as Schema } from './index-DKO3OQpz.js';
import { Connection as Connection$1 } from '@supabase/lite';
import * as hono_hono_base from 'hono/hono-base';
import * as hono_utils_http_status from 'hono/utils/http-status';
import * as hono_utils_types from 'hono/utils/types';
import * as hono_types from 'hono/types';
import * as hono from 'hono';
import { Context, MiddlewareHandler } from 'hono';
import { Kysely, KyselyPlugin } from 'kysely';
import { ReadableStream as ReadableStream$1 } from 'node:stream/web';
import { a as CacheDriver, b as CacheSetOptions, C as Connection, W as Where, c as IntrospectResult, d as ConnectionMigrator, M as MigrateScope, S as SchemaDiffResult, P as PlanStep, e as PlanResult, I as IConnectionConfig, D as Dialect$1, T as TransactionOptions, A as AnyAST, V as VarsContext } from './Connection-XOZvkhwS.js';
export { f as AST, g as ASTType, h as AggregateFunction, B as BaseAST, i as BodyResult, j as CheckConstraintInfo, k as ColumnDef, l as ColumnDiff, m as ColumnInfo, n as ColumnRef, o as CommentInfo, p as ConnectionContextOptions, q as CustomTypesInfo, r as DataLossError, s as DataLossWarning, t as DeleteAST, u as DiffResult, E as EmbedDef, v as EmbedTransform, w as ExplainOptions, F as FiltersResult, x as ForeignKeyDiff, y as ForeignKeyInfo, z as FunctionInfo, H as HeadersResult, G as IndexDiff, J as IndexInfo, K as InsertAST, L as IntrospectOptions, N as JoinDef, O as JoinMap, Q as Meta, R as MigrationError, U as OrderEntry, X as PlanStepType, Y as PreferToken, Z as PrimaryKeyInfo, _ as Qb, $ as QbDelete, a0 as QbInsert, a1 as QbSelect, a2 as QbUpdate, a3 as QueryAST, a4 as QueryParamsResult, a5 as RelationNotFoundError, a6 as RouteResult, a7 as RpcAST, a8 as RpcResult, a9 as SelectEntry, aa as SelectResult, ab as TableDiff, ac as TableInfo, ad as TextSearchValue, ae as TransformsResult, af as TranslatorConfig, ag as TriggerInfo, ah as UniqueConstraintInfo, ai as UpdateAST, aj as UpsertAST, ak as UpsertResult, al as ViewInfo, am as ViewOptionsMetadata, an as WhereValue, ao as isRef } from './Connection-XOZvkhwS.js';
import { ParseResult } from 'libpg-query';
import { DeparserOptions } from 'pgsql-deparser';
import 'jsonv-ts';

interface UsersTable {
    id: string;
    aud: string;
    role: string;
    email: string | null;
    encrypted_password: string | null;
    phone: string | null;
    email_confirmed_at: string | null;
    confirmed_at: string | null;
    invited_at: string | null;
    confirmation_token: string | null;
    confirmation_sent_at: string | null;
    recovery_token: string | null;
    recovery_sent_at: string | null;
    email_change: string | null;
    email_change_token_new: string | null;
    email_change_token_current: string | null;
    email_change_sent_at: string | null;
    email_change_confirm_status: number;
    phone_confirmed_at: string | null;
    phone_change: string | null;
    phone_change_token: string | null;
    phone_change_sent_at: string | null;
    reauthentication_token: string | null;
    reauthentication_sent_at: string | null;
    raw_app_meta_data: string | Record<string, unknown>;
    raw_user_meta_data: string | Record<string, unknown>;
    banned_until: string | null;
    deleted_at: string | null;
    is_sso_user: boolean;
    is_anonymous: boolean;
    last_sign_in_at: string | null;
    created_at: string;
    updated_at: string;
}
interface SessionsTable {
    id: string;
    user_id: string;
    not_after: string | null;
    refreshed_at: string | null;
    user_agent: string | null;
    ip: string | null;
    tag: string | null;
    refresh_token_hmac_key: string | null;
    refresh_token_counter: number | null;
    scopes: string | null;
    created_at: string;
    updated_at: string;
    aal: string | null;
    factor_id: string | null;
}
interface RefreshTokensTable {
    id: string;
    token: string;
    user_id: string;
    session_id: string | null;
    revoked: boolean;
    parent: string | null;
    created_at: string;
    updated_at: string;
}
interface IdentitiesTable {
    id: string;
    provider: string;
    provider_id: string;
    user_id: string;
    identity_data: string | Record<string, unknown>;
    email?: string;
    last_sign_in_at: string | null;
    created_at: string;
    updated_at: string;
}
interface FlowStateTable {
    id: string;
    user_id: string | null;
    auth_code: string | null;
    authentication_method: string;
    code_challenge_method: string | null;
    code_challenge: string | null;
    provider_type: string;
    provider_access_token: string | null;
    provider_refresh_token: string | null;
    auth_code_issued_at: string | null;
    invite_token: string | null;
    referrer: string | null;
    oauth_client_state_id: string | null;
    linking_target_id: string | null;
    email_optional: boolean;
    created_at: string;
    updated_at: string;
}
type NewFlowState = Pick<FlowStateTable, "id" | "authentication_method" | "provider_type"> & Partial<Pick<FlowStateTable, "user_id" | "auth_code" | "code_challenge_method" | "code_challenge" | "invite_token" | "referrer" | "oauth_client_state_id" | "linking_target_id" | "email_optional">>;
interface UserResponse {
    id: string;
    aud: string;
    role: string;
    email: string;
    phone: string;
    confirmed_at?: string | null;
    email_confirmed_at?: string | null;
    last_sign_in_at?: string | null;
    app_metadata: Record<string, unknown>;
    user_metadata: Record<string, unknown>;
    identities: IdentityResponse[];
    created_at: string;
    updated_at: string;
    is_anonymous: boolean;
    new_email?: string;
    confirmation_sent_at?: string | null;
    email_change_sent_at?: string | null;
    recovery_sent_at?: string | null;
}
interface SessionResponse {
    access_token: string;
    refresh_token: string;
    token_type: "bearer";
    expires_in: number;
    expires_at: number;
    user: UserResponse;
    weak_password?: null;
}
interface IdentityResponse {
    identity_id: string;
    id: string;
    user_id: string;
    identity_data: Record<string, unknown>;
    provider: string;
    last_sign_in_at: string | null;
    created_at: string;
    updated_at: string;
    email?: string;
}
interface AuthConfig {
    jwt_secret: string;
    jwt_expiry?: number;
    enable_refresh_token_rotation?: boolean;
    refresh_token_reuse_interval?: number;
    minimum_password_length?: number;
    password_required_characters?: string[];
    password_requirements?: string;
    enable_signup?: boolean;
    sessions?: {
        timebox?: string;
        inactivity_timeout?: string;
        single_per_user?: boolean;
    };
    email?: {
        enable_signup?: boolean;
        enable_confirmations?: boolean;
        double_confirm_changes?: boolean;
        otp_length?: number;
        otp_expiry?: number;
        max_frequency?: string;
        smtp?: {
            enabled?: boolean;
            host?: string;
            port?: number;
            user?: string;
            pass?: string;
            admin_email?: string;
            sender_name?: string;
        };
        template?: Partial<Record<EmailTemplateType, EmailTemplateConfig>>;
    };
    enable_confirmations?: boolean;
    site_url?: string;
    additional_redirect_urls?: string[];
    external?: Record<string, {
        enabled?: boolean;
        client_id?: string;
        secret?: string;
        url?: string;
        redirect_uri?: string;
        skip_nonce_check?: boolean;
        email_optional?: boolean;
    }>;
}
type EmailTemplateType = "invite" | "confirmation" | "recovery" | "magic_link" | "email_change";
interface EmailTemplateConfig {
    subject?: string;
    content_path?: string;
}

type Dialect = "postgres" | "sqlite";
/** Bound `Connection#runInTransaction` — see db/Connection.ts for why this
 * indirection exists (DO storage has no BEGIN/COMMIT over kysely). */
type TransactionRunner = <T>(fn: (trx: Kysely<any>) => Promise<T>) => Promise<T>;
declare class AuthRepository {
    private db;
    private dialect;
    private runInTransaction;
    private schema;
    constructor(db: Kysely<any>, dialect: Dialect, runInTransaction?: TransactionRunner);
    private bool;
    /**
     * Runs `fn` inside a database transaction, handing it a repository bound to
     * the transaction's executor. All reads/writes performed through that
     * repository (including this one's other methods) participate in the same
     * transaction, and are rolled back together if `fn` throws.
     *
     * Callers that need existing private helpers (which close over `this.repo`)
     * to run against the transaction should swap `this.repo` for the duration
     * of the callback — safe because AuthService/AuthRepository instances are
     * constructed fresh per request (see server/auth.ts createAuthService).
     */
    transaction<T>(fn: (repo: AuthRepository) => Promise<T>): Promise<T>;
    private table;
    private insertInto;
    private update;
    private deleteFrom;
    findUserByEmail(email: string): Promise<UsersTable | null>;
    findUserById(id: string): Promise<UsersTable | null>;
    findUserByToken(column: string, token: string): Promise<UsersTable | null>;
    /**
     * Atomically consumes a one-time token: the UPDATE only matches a row whose
     * `column` still holds `token`, so exactly one of two concurrent verifies
     * for the same OTP can win, and a token rotated/cleared by another request
     * (resend, a competing verify) no longer matches. Returns false when no row
     * was updated — callers must treat that as an invalid/consumed token and
     * mutate nothing further.
     *
     * This is the guard that survives on D1, whose `runInTransaction` cannot
     * group statements (see D1SqliteConnection L131-140): a single conditional
     * UPDATE with a rowcount check is atomic on every driver.
     */
    claimUserToken(userId: string, column: string, token: string): Promise<boolean>;
    createUser(user: Partial<UsersTable> & {
        id: string;
        email: string | null;
    }): Promise<UsersTable>;
    updateUser(id: string, updates: Partial<UsersTable>): Promise<UsersTable | null>;
    private userUpdateData;
    createSession(session: {
        id: string;
        user_id: string;
        aal?: string;
    }): Promise<SessionsTable>;
    findSessionById(id: string): Promise<SessionsTable | null>;
    updateSessionRefreshedAt(id: string, refreshedAt: string): Promise<SessionsTable | null>;
    deleteSession(id: string): Promise<void>;
    deleteUserSessions(userId: string, exceptSessionId?: string): Promise<void>;
    deleteRefreshTokensForSession(sessionId: string): Promise<void>;
    deleteRefreshTokensForUser(userId: string, exceptSessionId?: string): Promise<void>;
    createRefreshToken(rt: {
        token: string;
        user_id: string;
        session_id: string;
        parent?: string | null;
    }): Promise<RefreshTokensTable>;
    findRefreshToken(token: string): Promise<RefreshTokensTable | null>;
    findRefreshTokensBySession(sessionId: string): Promise<RefreshTokensTable[]>;
    revokeRefreshToken(id: string): Promise<void>;
    revokeSessionRefreshTokens(sessionId: string): Promise<void>;
    revokeRefreshTokensByIds(ids: string[]): Promise<void>;
    revokeUserRefreshTokens(userId: string): Promise<void>;
    createIdentity(identity: {
        id: string;
        provider: string;
        provider_id: string;
        user_id: string;
        identity_data: Record<string, unknown>;
        last_sign_in_at?: string | null;
    }): Promise<IdentitiesTable>;
    findIdentitiesByUserId(userId: string): Promise<IdentitiesTable[]>;
    updateIdentity(id: string, updates: Partial<IdentitiesTable>): Promise<void>;
    deleteIdentitiesExcept(userId: string, keepId: string): Promise<void>;
    findIdentityByProviderAndId(provider: string, providerId: string): Promise<IdentitiesTable | null>;
    findIdentitiesByEmails(emails: string[]): Promise<IdentitiesTable[]>;
    createFlowState(flow: NewFlowState): Promise<FlowStateTable>;
    findFlowStateById(id: string): Promise<FlowStateTable | null>;
    findFlowStateByAuthCode(authCode: string): Promise<FlowStateTable | null>;
    updateFlowState(id: string, updates: Partial<FlowStateTable>): Promise<void>;
    /**
     * Atomically claims a PKCE flow_state row for a callback: the UPDATE only
     * matches (and thus only succeeds for) a row whose user_id is still null,
     * so exactly one of two concurrent callbacks for the same state can win.
     * Returns false if the row was already claimed (or no longer exists) —
     * callers should treat that as a replay (flow_state_already_used).
     */
    claimFlowStateForPkce(id: string, updates: {
        user_id: string;
        provider_access_token: string;
        provider_refresh_token: string;
        auth_code_issued_at: string;
    }): Promise<boolean>;
    /**
     * Atomically deletes a flow_state row, returning whether a row was
     * actually removed. A single DELETE...WHERE id = ? is inherently atomic
     * (at most one caller can ever delete a given row), so this doubles as the
     * "claim" step for implicit-flow callbacks and PKCE auth-code redemption:
     * only the caller that observes `true` may proceed to issue a session.
     */
    /**
     * Deletes at most {@link FLOW_STATE_CLEANUP_BATCH} flow_state rows created
     * before `cutoffIso`. Ports the flow_state statement of GoTrue's periodic
     * cleanup (internal/models/cleanup.go L62):
     *
     *   delete from "flow_state" where id in (
     *     select id from "flow_state" where created_at < now() - interval '24 hours'
     *     limit 100 for update skip locked);
     *
     * The bound is the point of that statement: cleanup must never turn into an
     * unbounded delete that blocks the request it is piggybacking on (lite has
     * no background scheduler, so this runs opportunistically on the /authorize
     * insert path). A backlog is drained across subsequent /authorize calls.
     * `for update skip locked` has no sqlite equivalent and is omitted; the
     * id-in-subquery-with-LIMIT shape works on both dialects. Returns the number
     * of rows removed.
     */
    deleteFlowStatesCreatedBefore(cutoffIso: string): Promise<number>;
    deleteFlowState(id: string): Promise<boolean>;
    createAuditLogEntry(entry: {
        id: string;
        payload?: Record<string, unknown>;
        ip_address?: string;
    }): Promise<void>;
    parseUserJson(user: UsersTable): UsersTable;
}

interface InMemoryLruCacheDriverOptions {
    maxSizeBytes?: number;
    now?: () => number;
}
declare class InMemoryLruCacheDriver implements CacheDriver {
    private readonly maxSizeBytes;
    private readonly now;
    private readonly entries;
    private sizeBytes;
    constructor(options?: InMemoryLruCacheDriverOptions);
    get(key: string): Promise<string | undefined>;
    set(key: string, value: string, options?: CacheSetOptions): Promise<void>;
    delete(key: string): Promise<void>;
    private isExpired;
    private evictToSize;
    private deleteEntry;
}

interface CloudflareKvNamespace {
    get(key: string): Promise<string | null>;
    put(key: string, value: string, options?: {
        expirationTtl?: number;
    }): Promise<void>;
    delete(key: string): Promise<void>;
}
interface CloudflareKvCacheDriverOptions {
    namespace: CloudflareKvNamespace;
}
declare class CloudflareKvCacheDriver implements CacheDriver {
    private readonly options;
    constructor(options: CloudflareKvCacheDriverOptions);
    get(key: string): Promise<string | undefined>;
    set(key: string, value: string, options?: CacheSetOptions): Promise<void>;
    delete(key: string): Promise<void>;
}

interface RedisCacheClient {
    get(key: string): Promise<string | null | undefined> | string | null | undefined;
    set(key: string, value: string, ...args: unknown[]): Promise<unknown> | unknown;
    del?(key: string): Promise<unknown> | unknown;
    delete?(key: string): Promise<unknown> | unknown;
}
interface RedisCacheDriverOptions {
    client: RedisCacheClient;
}
declare class RedisCacheDriver implements CacheDriver {
    private readonly options;
    constructor(options: RedisCacheDriverOptions);
    get(key: string): Promise<string | undefined>;
    set(key: string, value: string, options?: CacheSetOptions): Promise<void>;
    delete(key: string): Promise<void>;
}

type ResendFetch = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;
interface ResendEmailDriverOptions {
    apiKey: string;
    from: string;
    endpoint?: string;
    fetch?: ResendFetch;
}
declare class ResendEmailDriver implements EmailDriver {
    private readonly options;
    private readonly endpoint;
    private readonly fetchFn;
    constructor(options: ResendEmailDriverOptions);
    send(message: EmailMessage): Promise<void>;
}

interface AwsSesFetchClient {
    fetch(input: string | URL, init?: RequestInit): Promise<Response>;
}
interface AwsSesEmailDriverOptions {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    from: string;
    client?: AwsSesFetchClient;
}
declare class AwsSesEmailDriver implements EmailDriver {
    private readonly options;
    private readonly endpoint;
    private client?;
    constructor(options: AwsSesEmailDriverOptions);
    send(message: EmailMessage): Promise<void>;
    private getClient;
}

interface SendmailEmailDriverOptions {
    from: string;
    sendmailPath?: string;
}
declare class SendmailEmailDriver implements EmailDriver {
    private readonly options;
    private readonly sendmailPath;
    constructor(options: SendmailEmailDriverOptions);
    send(message: EmailMessage): Promise<void>;
}
declare function formatSendmailMessage(from: string, message: EmailMessage): string;

interface SmtpTransporter {
    sendMail(mail: Record<string, unknown>): Promise<unknown>;
}
type SmtpCreateTransport = (options: Record<string, unknown>) => SmtpTransporter;
type SmtpAddress = string | {
    name?: string;
    address: string;
};
interface SmtpEmailDriverOptions {
    host: string;
    port?: number;
    user?: string;
    pass?: string;
    from: SmtpAddress;
    secure?: boolean;
    /** Default: true when user+pass are set and secure (implicit TLS) is false. Set false to opt out. */
    requireTls?: boolean;
    /** Node-only escape hatch for self-signed TLS certs; default true (validate). */
    rejectUnauthorized?: boolean;
    timeoutMs?: number;
    /** Injectable for tests; defaults to nodemailer's createTransport. */
    createTransport?: SmtpCreateTransport;
}
/** Pure mapper to nodemailer transport options, exported for tests. */
declare function buildSmtpTransportOptions(options: SmtpEmailDriverOptions): Record<string, unknown>;
/** Pure mapper to a nodemailer mail payload, exported for tests. */
declare function buildSmtpMail(from: SmtpAddress, message: EmailMessage): Record<string, unknown>;
/** Testable seam for the runtime guard below; real callers always pass isNode() || isBun(). */
declare function assertSmtpSupportedRuntime(isSupported: boolean): void;
declare class SmtpEmailDriver implements EmailDriver {
    private readonly options;
    private transporter?;
    constructor(options: SmtpEmailDriverOptions);
    send(message: EmailMessage): Promise<void>;
    private getTransporter;
}

interface EmailMessage {
    to: string;
    subject: string;
    text?: string;
    html?: string;
}
interface EmailDriver {
    send(message: EmailMessage): Promise<void>;
}
interface StoredEmailMessage extends EmailMessage {
    sentAt: string;
}
interface InMemoryEmailDriverOptions {
    maxKeepCount?: number;
}
declare class InMemoryEmailDriver implements EmailDriver {
    readonly messages: Map<string, StoredEmailMessage[]>;
    private readonly maxKeepCount;
    private readonly order;
    constructor(options?: InMemoryEmailDriverOptions);
    send(message: EmailMessage): Promise<void>;
    clear(): void;
    private trim;
}
interface ConsoleEmailDriverOptions {
    silent?: boolean;
    logger?: Pick<Console, "info">;
}
declare class ConsoleEmailDriver extends InMemoryEmailDriver {
    private readonly silent;
    private readonly logger;
    constructor(options?: ConsoleEmailDriverOptions);
    send(message: EmailMessage): Promise<void>;
}

interface SmsMessage {
    to: string;
    body: string;
}
interface SmsDriver {
    send(message: SmsMessage): Promise<void>;
}
interface NoopSmsDriverOptions {
    silent?: boolean;
    logger?: Pick<Console, "info">;
}
declare class NoopSmsDriver implements SmsDriver {
    private readonly silent;
    private readonly logger;
    constructor(options?: NoopSmsDriverOptions);
    send(message: SmsMessage): Promise<void>;
}

/** Gateway credentials only, not user/session authorization. Both are null for OPTIONS or verify_jwt: false. */
interface FunctionInvocationContext {
    readonly name: string;
    readonly jwt: Readonly<Record<string, unknown>> | null;
    readonly apiKeyType: ApiKeyType | null;
}
/** Executes trusted host code. No isolation, module loading, or lifecycle management. */
interface FunctionsExecutor {
    /** Preserve streaming and cancellation by consuming the original Request and returning a Response. */
    fetch(request: Request, context: FunctionInvocationContext): Response | Promise<Response>;
}
export type { FunctionInvocationContext, FunctionsExecutor };

interface AppDrivers {
    email: EmailDriver;
    sms: SmsDriver;
    cache: CacheDriver;
    functions?: FunctionsExecutor;
}
type PartialAppDrivers = Partial<AppDrivers>;
interface AppDriversConfig {
    auth?: {
        email?: {
            smtp?: {
                enabled?: boolean;
                host?: string;
                port?: number;
                user?: string;
                pass?: string;
                admin_email?: string;
                sender_name?: string;
            };
        };
    };
}
declare function createAppDrivers(drivers?: PartialAppDrivers, config?: AppDriversConfig): AppDrivers;

interface Mailer {
    sendConfirmation(email: string, token: string, otp: string, meta?: MailMeta): Promise<void>;
    sendRecovery(email: string, token: string, otp: string, meta?: MailMeta): Promise<void>;
    sendMagicLink(email: string, token: string, otp: string, meta?: MailMeta): Promise<void>;
    sendEmailChange(email: string, token: string, otp: string, meta?: MailMeta): Promise<void>;
    sendReauthentication(email: string, otp: string, meta?: MailMeta): Promise<void>;
}
interface MailMeta {
    userId?: string;
    emailActionType?: string;
    tokenHash?: string;
    tokenNew?: string;
    tokenHashNew?: string;
    redirectTo?: string;
    /** Current (old) email — used as the `Email` template var for email change. */
    currentEmail?: string;
    /** Pending (new) email — used as the `NewEmail` template var for email change. */
    newEmail?: string;
    data?: string;
}

declare class AuthService {
    repo: AuthRepository;
    private config;
    private mailer;
    private jwtExpiry;
    private minPasswordLength;
    private passwordRequiredCharacters;
    private sessionTimeboxSeconds?;
    private sessionInactivitySeconds?;
    constructor(repo: AuthRepository, config: AuthConfig, mailer: Mailer);
    private get otpLength();
    private get otpExpirySeconds();
    private get emailMaxFrequencySeconds();
    private assertEmailSendAllowed;
    private sendEmailWithCooldown;
    private resendSignupConfirmation;
    private sendEmailChange;
    private sanitizedRepeatedSignup;
    /**
     * GoTrue `utilities.GetReferrer`: allowed `redirectTo`, else allowed
     * `Referer` header, else `site_url`. "Allowed" = `IsRedirectURLValid`:
     * same scheme + host + port as `site_url` (any path; port ignored for
     * loopback hosts), or a glob match of `additional_redirect_urls` against
     * the full URL (`.`/`/` are separators, so `*` does not cross them, `**` does).
     */
    resolveEmailRedirect(redirectTo?: string | null, refererHeader?: string | null): string;
    signUp(email: string | undefined, password: string | undefined, data?: Record<string, unknown>, redirectTo?: string): Promise<{
        user: UserResponse;
        session?: SessionResponse;
    }>;
    signInWithPassword(email: string | undefined, password: string | undefined): Promise<SessionResponse>;
    refreshSession(refreshToken: string | undefined): Promise<SessionResponse>;
    private refreshWithRevokedToken;
    private createRefreshResponse;
    private assertSessionRefreshable;
    getUser(userId: string): Promise<UserResponse>;
    updateUser(userId: string, updates: {
        data?: Record<string, unknown>;
        password?: string;
        email?: string;
    }, redirectTo?: string): Promise<UserResponse>;
    signOut(sessionId: string | undefined, scope: string | undefined, userId: string): Promise<void>;
    signInWithOtp(email: string | undefined, options?: {
        shouldCreateUser?: boolean;
        redirectTo?: string;
    }): Promise<void>;
    requestMagicLink(email: string | undefined, _security?: Record<string, unknown>, redirectTo?: string): Promise<void>;
    verifyOtp(params: {
        email?: string;
        token?: string;
        token_hash?: string;
        type: string;
    }): Promise<SessionResponse>;
    /**
     * The mutating half of {@link verifyOtp}, always run inside a transaction
     * (`this.repo` is bound to it) — see the comment at the call site.
     */
    private completeVerifyOtp;
    recover(email: string | undefined, redirectTo?: string): Promise<void>;
    resend(type: string, email: string | undefined, redirectTo?: string): Promise<void>;
    reauthenticate(userId: string): Promise<void>;
    private createSessionForUser;
    private assertPasswordStrong;
    private mapUserToResponse;
    private mapIdentityToResponse;
    private findUserByTokenAndType;
    private static readonly SENT_AT_COLUMN;
    private isTokenExpired;
    private getTokenColumnsForType;
    private createAuditLog;
    /**
     * Same entry shape as {@link createAuditLog}, for the call sites whose
     * traits map is not `{provider: ...}` (GoTrue builds the map per call site;
     * see models.NewAuditLogEntry's `traits map[string]any` argument).
     */
    private createAuditLogWithTraits;
    getExternalProviderRedirectUrl(query: Record<string, string | undefined>, opts: {
        refererHeader?: string;
        defaultRedirectUri: string;
    }): Promise<string>;
    loadOAuthFlowState(state: string | undefined): Promise<FlowStateTable>;
    resolveOAuthRedirectTarget(flowState: FlowStateTable): string;
    handleExternalProviderCallback(flowState: FlowStateTable, params: Record<string, string | undefined>, opts: {
        defaultRedirectUri: string;
    }): Promise<{
        type: "pkce" | "implicit";
        redirectUrl: string;
    }>;
    /**
     * Tail of the external-provider callback, shared by the account-linking and
     * invite branches: claims the flow state and either hands back the PKCE
     * auth code or issues a session in the URL fragment (external.go
     * L221-286). Runs inside the callback's transaction — `this.repo` is
     * already bound to it by the caller.
     */
    private issueOAuthCallbackResult;
    /**
     * Ports internal/api/external.go's processInvite (L449-514): accepts an
     * invitation with an external identity. The invite token is the user's
     * `confirmation_token` (models.FindUserByConfirmationToken), the external
     * email must match the invited email, and the user is confirmed because
     * they were able to respond to the invite email.
     *
     * Runs inside the callback's transaction (`this.repo` is bound to it).
     */
    private processInvite;
    exchangePkceCode(authCode: string | undefined, codeVerifier: string | undefined): Promise<SessionResponse & {
        provider_token?: string;
        provider_refresh_token?: string;
    }>;
    private updateUserMetaDataAndProviders;
    private buildAppMetaDataProviders;
    private removeUnconfirmedIdentities;
    private determineAccountLinking;
}

type CrossReadableStream = ReadableStream | ReadableStream$1;
interface ObjectMetadata {
    cacheControl: string;
    contentLength: number;
    size: number;
    mimetype: string;
    lastModified?: Date;
    eTag: string;
    contentRange?: string;
    httpStatusCode?: number;
}
interface BrowserCacheHeaders {
    ifModifiedSince?: string;
    ifNoneMatch?: string;
    range?: string;
}
interface ObjectResponse {
    metadata: ObjectMetadata;
    httpStatusCode: number;
    body?: CrossReadableStream | Blob | Buffer;
}
type StorageAdapterOptions = {};
interface StorageAdapter<Options extends StorageAdapterOptions = StorageAdapterOptions, Driver = unknown> {
    driver: Driver;
    getObject(bucketName: string, key: string, version: string | undefined, headers?: BrowserCacheHeaders): Promise<ObjectResponse>;
    uploadObject(bucketName: string, key: string, version: string | undefined, body: CrossReadableStream | Buffer | Uint8Array, contentType: string, cacheControl: string): Promise<ObjectMetadata>;
    deleteObject(bucket: string, key: string, version: string | undefined): Promise<void>;
    deleteObjects(bucket: string, prefixes: string[]): Promise<void>;
    copyObject(sourceBucket: string, source: string, version: string | undefined, destinationBucket: string, destination: string, destinationVersion: string | undefined): Promise<Pick<ObjectMetadata, "httpStatusCode" | "eTag" | "lastModified">>;
    headObject(bucket: string, key: string, version: string | undefined): Promise<ObjectMetadata>;
    privateAssetUrl(bucket: string, key: string, version: string | undefined): Promise<string>;
}

interface TransformOptions {
    width?: number;
    height?: number;
    resize?: "cover" | "contain" | "fill";
    format?: "webp" | "png" | "jpeg" | "avif";
    quality?: number;
}
interface TransformResult {
    body: ReadableStream | Uint8Array;
    contentType: string;
    /** Only set when body is a Uint8Array */
    contentLength?: number;
}
interface TransformationAdapterOptions {
}
interface TransformationAdapter<Options extends TransformationAdapterOptions = TransformationAdapterOptions, Driver = unknown> {
    driver: Driver;
    /**
     * Whether this adapter requires the full image buffer upfront.
     * If false, the service will pass the stream/url through without buffering.
     * - sharp: true (needs buffer)
     * - cloudflare: false (transforms via URL subrequest)
     */
    requiresBuffer: boolean;
    /**
     * Transform from a buffer. Used when requiresBuffer is true.
     */
    transform(input: Uint8Array, options: TransformOptions): Promise<TransformResult>;
    /**
     * Transform from a URL or Response. Used when requiresBuffer is false.
     * Adapters that don't support this should set requiresBuffer=true.
     */
    transformFromUrl?(url: string, options: TransformOptions): Promise<TransformResult>;
}

interface Bucket {
    id: string;
    name: string;
    owner: string | null;
    owner_id: string | null;
    public: boolean;
    file_size_limit: number | null;
    allowed_mime_types: string[] | null;
    created_at: string;
    updated_at: string;
}
interface StorageObject {
    id: string;
    bucket_id: string;
    name: string;
    owner: string | null;
    owner_id: string | null;
    metadata: Record<string, unknown>;
    user_metadata: Record<string, unknown>;
    path_tokens: string[];
    version: string | null;
    created_at: string;
    updated_at: string;
    last_accessed_at: string;
}
interface ListObjectsOptions {
    limit?: number;
    offset?: number;
    sortBy?: {
        column: string;
        order: "asc" | "desc";
    };
    search?: string;
}
declare class StorageRepository {
    private schema;
    private db;
    private dialect;
    constructor(connection: Connection);
    private table;
    private insertInto;
    private update;
    private deleteFrom;
    createBucket(bucket: {
        id: string;
        name: string;
        owner?: string | null;
        owner_id?: string | null;
        public?: boolean;
        file_size_limit?: number | null;
        allowed_mime_types?: string[];
    }): Promise<Bucket>;
    findBucketById(id: string): Promise<Bucket | null>;
    findBucketByName(name: string): Promise<Bucket | null>;
    listBuckets(): Promise<Bucket[]>;
    updateBucket(id: string, updates: Partial<{
        public: boolean;
        file_size_limit: number | null;
        allowed_mime_types: string[];
    }>): Promise<Bucket | null>;
    deleteBucket(id: string): Promise<void>;
    isBucketEmpty(id: string): Promise<boolean>;
    createObject(obj: {
        id: string;
        bucket_id: string;
        name: string;
        owner?: string | null;
        owner_id?: string | null;
        metadata?: Record<string, unknown> | null;
        user_metadata?: Record<string, unknown> | null;
        version?: string | null;
    }): Promise<StorageObject>;
    findObjectById(id: string): Promise<StorageObject | null>;
    findObjectByPath(bucketId: string, name: string): Promise<StorageObject | null>;
    listObjects(bucketId: string, prefix?: string, options?: ListObjectsOptions): Promise<StorageObject[]>;
    updateObject(id: string, updates: Partial<{
        bucket_id: string;
        name: string;
        metadata: Record<string, unknown> | null;
        user_metadata: Record<string, unknown> | null;
        version: string | null;
        owner: string | null;
        owner_id: string | null;
        updated_at: string;
    }>): Promise<StorageObject | null>;
    deleteObject(id: string): Promise<void>;
    deleteObjectsByBucket(bucketId: string): Promise<string[]>;
    objectExists(bucketId: string, name: string): Promise<boolean>;
    touchObject(id: string): Promise<void>;
    private parseBucketRow;
    private parseObjectRow;
}

type StorageRole = string;
interface StorageRequestAuth {
    role: StorageRole;
    sub: string | null;
    jwt: Record<string, unknown> | null;
}

interface StorageServiceConfig {
    jwtSecret: string;
    fileSizeLimit?: number;
    buckets?: Record<string, {
        public?: boolean;
        file_size_limit?: string;
        allowed_mime_types?: string[];
    }>;
}
interface StorageServiceOptions {
    autoCreateBuckets?: boolean;
}
declare class StorageService {
    private repo;
    private adapter;
    private config;
    private options;
    private transformationAdapter?;
    private connection?;
    private initialized;
    private access;
    constructor(repo: StorageRepository, adapter: StorageAdapter, config: StorageServiceConfig, options?: StorageServiceOptions, transformationAdapter?: TransformationAdapter | undefined, connection?: Connection | undefined);
    setRequestAuth(auth: StorageRequestAuth, operation?: string): void;
    get requestAuth(): StorageRequestAuth;
    init(): Promise<void>;
    createBucket(params: {
        id: string;
        name: string;
        public?: boolean;
        file_size_limit?: number | null;
        allowed_mime_types?: string[];
        owner?: string | null;
    }): Promise<Bucket>;
    getBucket(id: string): Promise<Bucket>;
    getBucketBypass(id: string): Promise<Bucket>;
    listBuckets(): Promise<Bucket[]>;
    updateBucket(id: string, updates: {
        public?: boolean;
        file_size_limit?: number | null;
        allowed_mime_types?: string[];
    }): Promise<Bucket>;
    deleteBucket(id: string): Promise<void>;
    emptyBucket(id: string): Promise<void>;
    upload(bucketId: string, path: string, body: ReadableStream | Buffer | Uint8Array, options?: {
        contentType?: string;
        cacheControl?: string;
        contentLength?: number;
        upsert?: boolean;
        metadata?: Record<string, unknown>;
        userMetadata?: Record<string, unknown>;
    }): Promise<StorageObject>;
    private uploadInternal;
    download(bucketId: string, path: string, options?: {
        transform?: TransformOptions;
    }): Promise<{
        body: CrossReadableStream | Blob | Buffer | Uint8Array;
        metadata: ObjectMetadata;
    }>;
    private downloadBypass;
    private downloadObject;
    update(bucketId: string, path: string, body: ReadableStream | Buffer | Uint8Array, options?: {
        contentType?: string;
        cacheControl?: string;
        contentLength?: number;
        metadata?: Record<string, unknown>;
        userMetadata?: Record<string, unknown>;
        upsert?: boolean;
    }): Promise<StorageObject>;
    remove(bucketId: string, paths: string[]): Promise<StorageObject[]>;
    list(bucketId: string, prefix?: string, options?: ListObjectsOptions): Promise<StorageObject[]>;
    move(bucketId: string, fromPath: string, toPath: string, destinationBucketId?: string): Promise<void>;
    copy(bucketId: string, fromPath: string, toPath: string, destinationBucketId?: string, upsert?: boolean): Promise<{
        key: string;
    }>;
    info(bucketId: string, path: string): Promise<StorageObject & {
        httpMetadata: ObjectMetadata;
    }>;
    exists(bucketId: string, path: string): Promise<boolean>;
    private assertBucketRetrievable;
    createSignedUrl(bucketId: string, path: string, expiresIn: number): Promise<{
        signedUrl: string;
    }>;
    createSignedUrls(bucketId: string, paths: string[], expiresIn: number): Promise<{
        path: string;
        signedUrl: string;
        error: string | null;
    }[]>;
    createSignedUploadUrl(bucketId: string, path: string, upsert?: boolean, options?: {
        metadata?: Record<string, unknown>;
        userMetadata?: Record<string, unknown>;
    }): Promise<{
        signedUrl: string;
        token: string;
        path: string;
    }>;
    verifySignedUrl(token: string): Promise<{
        bucket: string;
        path: string;
        intent: "download" | "upload";
        owner: string | null;
        upsert: boolean;
    }>;
    downloadSigned(bucketId: string, path: string, options?: {
        transform?: TransformOptions;
    }): Promise<{
        body: CrossReadableStream | Blob | Buffer | Uint8Array;
        metadata: ObjectMetadata;
    }>;
    uploadSigned(bucketId: string, path: string, body: ReadableStream | Buffer | Uint8Array, options: {
        contentType?: string;
        cacheControl?: string;
        contentLength?: number;
        upsert?: boolean;
        metadata?: Record<string, unknown>;
        userMetadata?: Record<string, unknown>;
        owner: string | null;
    }): Promise<StorageObject>;
    private signStorageToken;
    private uploadPermissionValues;
    private databaseErrorCode;
}

/** Trusted socket metadata supplied by an adapter that owns the listener. */
type AppRequestContext = {
    peerAddress: string | null;
};
type HonoContext = {
    Bindings: AppRequestContext;
    Variables: {
        app: App;
        authService: AuthService;
        storageService: StorageService;
        userId?: string;
        sessionId?: string;
        jwt?: Record<string, unknown>;
        apiKeyType?: "publishable" | "secret";
        ignoreAuthorization?: boolean;
        /**
         * Set by `adminAuth()` when local admin mode elevated this request to
         * `service_role`. Observability/tests only — the elevation itself is
         * carried by `apiKeyType`/`ignoreAuthorization`/`jwt`.
         */
        admin?: boolean;
    };
};
type MaybePromise<T> = T | Promise<T>;

type ApiKeyType = "publishable" | "secret";
declare const SELF_HOSTED_PROJECT_REF = "supabase-self-hosted";
type GeneratedApiKey = {
    key: string;
    hash: string;
    prefix: string;
    type: ApiKeyType;
};
/**
 * Generates an `sb_publishable_*` / `sb_secret_*` API key. Web-crypto only
 * (`crypto.getRandomValues` / `crypto.subtle.digest`) so this also runs on
 * Cloudflare Workers/DO — no `node:crypto`.
 *
 * Uses 17 random bytes truncated to a 22-char base64url body, so the full
 * 132 bits of entropy fill those 22 chars (matches upstream self-hosted's
 * `generateOpaqueKey`). If `randomBytes` is injected for testing, pass 17
 * bytes to match production entropy.
 */
declare function generateApiKey(type: ApiKeyType, ref?: string, randomBytes?: Uint8Array): Promise<GeneratedApiKey>;
declare function hashApiKey(key: string): Promise<string>;
/** Prefix sniff only — no checksum verification (that belongs to infra). */
declare function apiKeyType(key: string): ApiKeyType | null;

/** Claims are applied verbatim as `request.jwt.claims` — MUST include `role`. */
type ResolvedKey = {
    type: ApiKeyType;
    claims: Record<string, unknown>;
};
type ApiKeyResolver = (key: string, c: Context<HonoContext>) => Promise<ResolvedKey | null>;

type ServerOptions = {
    middlewares?: MiddlewareHandler<HonoContext>[];
    disableStudio?: boolean;
    disableFallback?: boolean;
    /**
     * Test-only PostgREST mode: execute each request in a transaction and roll it back.
     */
    forceRollback?: boolean;
    /**
     * `false` disables apikey enforcement outright. Otherwise a custom
     * `resolver` can be supplied (the lite-platform seam); when omitted, keys
     * configured under `config.auth.publishable_key`/`secret_key` are used.
     */
    apiKeys?: false | {
        resolver?: ApiKeyResolver;
    };
    /**
     * Local admin mode (default `false`): run *keyless* `/rest/v1` and
     * `/storage/v1` requests as `service_role`, so a browser studio can do
     * privileged work without a secret key shipping to the browser. Only
     * same-origin requests addressed to loopback are elevated.
     *
     * Two caveats, both local-dev only:
     * 1. RLS is not enforced for keyless traffic while this is on. To exercise
     *    policies, send an `apikey`: the publishable key for `anon`, or the
     *    publishable key PLUS `Authorization: Bearer <user JWT>` for
     *    `authenticated`. Those requests are never elevated. A bearer token on
     *    its own is rejected before RLS is reached (401), since opaque keys are
     *    only sourced from `apikey`.
     * 2. Localhost trust is not per-request trust. Any page open in the
     *    developer's browser can reach the server; the same-origin and
     *    loopback guards are what keep that from being a data-exfiltration
     *    hole. Never enable outside local development.
     */
    admin?: boolean;
};
declare function createServer(app: App, options?: ServerOptions): hono_hono_base.HonoBase<HonoContext & {
    Variables: {
        userId: string;
        sessionId: string;
        jwt: Record<string, unknown>;
    };
}, hono_types.BlankSchema | hono_types.MergeSchemaPath<{
    "*": {
        $options: {
            input: {};
            output: null;
            outputFormat: "body";
            status: 204;
        };
    };
} & {
    "/signup": {
        $post: {
            input: {};
            output: {
                access_token: string;
                refresh_token: string;
                token_type: "bearer";
                expires_in: number;
                expires_at: number;
                user: {
                    id: string;
                    aud: string;
                    role: string;
                    email: string;
                    phone: string;
                    confirmed_at?: string | null | undefined;
                    email_confirmed_at?: string | null | undefined;
                    last_sign_in_at?: string | null | undefined;
                    app_metadata: {
                        [x: string]: hono_utils_types.JSONValue;
                    };
                    user_metadata: {
                        [x: string]: hono_utils_types.JSONValue;
                    };
                    identities: {
                        identity_id: string;
                        id: string;
                        user_id: string;
                        identity_data: {
                            [x: string]: hono_utils_types.JSONValue;
                        };
                        provider: string;
                        last_sign_in_at: string | null;
                        created_at: string;
                        updated_at: string;
                        email?: string | undefined;
                    }[];
                    created_at: string;
                    updated_at: string;
                    is_anonymous: boolean;
                    new_email?: string | undefined;
                    confirmation_sent_at?: string | null | undefined;
                    email_change_sent_at?: string | null | undefined;
                    recovery_sent_at?: string | null | undefined;
                };
                weak_password?: null | undefined;
            };
            outputFormat: "json";
            status: 200;
        } | {
            input: {};
            output: {
                id: string;
                aud: string;
                role: string;
                email: string;
                phone: string;
                confirmed_at?: string | null | undefined;
                email_confirmed_at?: string | null | undefined;
                last_sign_in_at?: string | null | undefined;
                app_metadata: {
                    [x: string]: hono_utils_types.JSONValue;
                };
                user_metadata: {
                    [x: string]: hono_utils_types.JSONValue;
                };
                identities: {
                    identity_id: string;
                    id: string;
                    user_id: string;
                    identity_data: {
                        [x: string]: hono_utils_types.JSONValue;
                    };
                    provider: string;
                    last_sign_in_at: string | null;
                    created_at: string;
                    updated_at: string;
                    email?: string | undefined;
                }[];
                created_at: string;
                updated_at: string;
                is_anonymous: boolean;
                new_email?: string | undefined;
                confirmation_sent_at?: string | null | undefined;
                email_change_sent_at?: string | null | undefined;
                recovery_sent_at?: string | null | undefined;
            };
            outputFormat: "json";
            status: 200;
        };
    };
} & {
    "/signup": {
        $all: {
            input: {};
            output: {};
            outputFormat: string;
            status: hono_utils_http_status.StatusCode;
        };
    };
} & {
    "/token": {
        $post: {
            input: {};
            output: {
                access_token: string;
                refresh_token: string;
                token_type: "bearer";
                expires_in: number;
                expires_at: number;
                user: {
                    id: string;
                    aud: string;
                    role: string;
                    email: string;
                    phone: string;
                    confirmed_at?: string | null | undefined;
                    email_confirmed_at?: string | null | undefined;
                    last_sign_in_at?: string | null | undefined;
                    app_metadata: {
                        [x: string]: hono_utils_types.JSONValue;
                    };
                    user_metadata: {
                        [x: string]: hono_utils_types.JSONValue;
                    };
                    identities: {
                        identity_id: string;
                        id: string;
                        user_id: string;
                        identity_data: {
                            [x: string]: hono_utils_types.JSONValue;
                        };
                        provider: string;
                        last_sign_in_at: string | null;
                        created_at: string;
                        updated_at: string;
                        email?: string | undefined;
                    }[];
                    created_at: string;
                    updated_at: string;
                    is_anonymous: boolean;
                    new_email?: string | undefined;
                    confirmation_sent_at?: string | null | undefined;
                    email_change_sent_at?: string | null | undefined;
                    recovery_sent_at?: string | null | undefined;
                };
                weak_password?: null | undefined;
            };
            outputFormat: "json";
            status: 200;
        };
    };
} & {
    "/token": {
        $all: {
            input: {};
            output: {};
            outputFormat: string;
            status: hono_utils_http_status.StatusCode;
        };
    };
} & {
    "/otp": {
        $post: {
            input: {};
            output: {};
            outputFormat: "json";
            status: 200;
        };
    };
} & {
    "/magiclink": {
        $post: {
            input: {};
            output: {};
            outputFormat: "json";
            status: 200;
        };
    };
} & {
    "/magiclink": {
        $all: {
            input: {};
            output: {};
            outputFormat: string;
            status: hono_utils_http_status.StatusCode;
        };
    };
} & {
    "/verify": {
        $post: {
            input: {};
            output: {
                access_token: string;
                refresh_token: string;
                token_type: "bearer";
                expires_in: number;
                expires_at: number;
                user: {
                    id: string;
                    aud: string;
                    role: string;
                    email: string;
                    phone: string;
                    confirmed_at?: string | null | undefined;
                    email_confirmed_at?: string | null | undefined;
                    last_sign_in_at?: string | null | undefined;
                    app_metadata: {
                        [x: string]: hono_utils_types.JSONValue;
                    };
                    user_metadata: {
                        [x: string]: hono_utils_types.JSONValue;
                    };
                    identities: {
                        identity_id: string;
                        id: string;
                        user_id: string;
                        identity_data: {
                            [x: string]: hono_utils_types.JSONValue;
                        };
                        provider: string;
                        last_sign_in_at: string | null;
                        created_at: string;
                        updated_at: string;
                        email?: string | undefined;
                    }[];
                    created_at: string;
                    updated_at: string;
                    is_anonymous: boolean;
                    new_email?: string | undefined;
                    confirmation_sent_at?: string | null | undefined;
                    email_change_sent_at?: string | null | undefined;
                    recovery_sent_at?: string | null | undefined;
                };
                weak_password?: null | undefined;
            };
            outputFormat: "json";
            status: 200;
        };
    };
} & {
    "/verify": {
        $get: {
            input: {};
            output: undefined;
            outputFormat: "redirect";
            status: 303;
        };
    };
} & {
    "/recover": {
        $post: {
            input: {};
            output: {};
            outputFormat: "json";
            status: 200;
        };
    };
} & {
    "/resend": {
        $post: {
            input: {};
            output: {};
            outputFormat: "json";
            status: 200;
        };
    };
} & {
    "/health": {
        $get: {
            input: {};
            output: {
                version: string;
                name: string;
                description: string;
            };
            outputFormat: "json";
            status: 200;
        };
    };
} & {
    "/health": {
        $all: {
            input: {};
            output: {};
            outputFormat: string;
            status: hono_utils_http_status.StatusCode;
        };
    };
} & {
    "/settings": {
        $get: {
            input: {};
            output: {
                external: {
                    email: boolean;
                    phone: boolean;
                    anonymous_users: boolean;
                };
                disable_signup: boolean;
                mailer_autoconfirm: boolean;
                phone_autoconfirm: boolean;
                sms_provider: string;
                saml_enabled: boolean;
            };
            outputFormat: "json";
            status: 200;
        };
    };
} & {
    "/settings": {
        $all: {
            input: {};
            output: {};
            outputFormat: string;
            status: hono_utils_http_status.StatusCode;
        };
    };
} & {
    "/.well-known/jwks.json": {
        $get: {
            input: {};
            output: never;
            outputFormat: "json";
            status: 200;
        };
    };
} & {
    "/.well-known/openid-configuration": {
        $get: {
            input: {};
            output: {
                issuer: string;
                jwks_uri: string;
            };
            outputFormat: "json";
            status: 200;
        };
    };
} & {
    "/authorize": {
        $get: {
            input: {};
            output: string;
            outputFormat: "body";
            status: 302;
        };
    };
} & {
    "/callback": {
        $get: {
            input: {};
            output: {};
            outputFormat: string;
            status: hono_utils_http_status.StatusCode;
        };
    };
} & {
    "/callback": {
        $post: {
            input: {};
            output: {};
            outputFormat: string;
            status: hono_utils_http_status.StatusCode;
        };
    };
} & {
    "/nonexistent": {
        $all: {
            input: {};
            output: {};
            outputFormat: string;
            status: hono_utils_http_status.StatusCode;
        };
    };
} & {
    "/logout": {
        $post: {
            input: {};
            output: null;
            outputFormat: "body";
            status: 204;
        };
    };
} & {
    "/user": {
        $get: {
            input: {};
            output: {
                id: string;
                aud: string;
                role: string;
                email: string;
                phone: string;
                confirmed_at?: string | null | undefined;
                email_confirmed_at?: string | null | undefined;
                last_sign_in_at?: string | null | undefined;
                app_metadata: {
                    [x: string]: hono_utils_types.JSONValue;
                };
                user_metadata: {
                    [x: string]: hono_utils_types.JSONValue;
                };
                identities: {
                    identity_id: string;
                    id: string;
                    user_id: string;
                    identity_data: {
                        [x: string]: hono_utils_types.JSONValue;
                    };
                    provider: string;
                    last_sign_in_at: string | null;
                    created_at: string;
                    updated_at: string;
                    email?: string | undefined;
                }[];
                created_at: string;
                updated_at: string;
                is_anonymous: boolean;
                new_email?: string | undefined;
                confirmation_sent_at?: string | null | undefined;
                email_change_sent_at?: string | null | undefined;
                recovery_sent_at?: string | null | undefined;
            };
            outputFormat: "json";
            status: 200;
        };
    };
} & {
    "/user": {
        $put: {
            input: {};
            output: {
                id: string;
                aud: string;
                role: string;
                email: string;
                phone: string;
                confirmed_at?: string | null | undefined;
                email_confirmed_at?: string | null | undefined;
                last_sign_in_at?: string | null | undefined;
                app_metadata: {
                    [x: string]: hono_utils_types.JSONValue;
                };
                user_metadata: {
                    [x: string]: hono_utils_types.JSONValue;
                };
                identities: {
                    identity_id: string;
                    id: string;
                    user_id: string;
                    identity_data: {
                        [x: string]: hono_utils_types.JSONValue;
                    };
                    provider: string;
                    last_sign_in_at: string | null;
                    created_at: string;
                    updated_at: string;
                    email?: string | undefined;
                }[];
                created_at: string;
                updated_at: string;
                is_anonymous: boolean;
                new_email?: string | undefined;
                confirmation_sent_at?: string | null | undefined;
                email_change_sent_at?: string | null | undefined;
                recovery_sent_at?: string | null | undefined;
            };
            outputFormat: "json";
            status: 200;
        };
    };
} & {
    "/user": {
        $all: {
            input: {};
            output: {};
            outputFormat: string;
            status: hono_utils_http_status.StatusCode;
        };
    };
} & {
    "/reauthenticate": {
        $get: {
            input: {};
            output: {};
            outputFormat: "json";
            status: 200;
        };
    };
} & {
    "/reauthenticate": {
        $all: {
            input: {};
            output: {};
            outputFormat: string;
            status: hono_utils_http_status.StatusCode;
        };
    };
}, "/auth/v1"> | hono_types.MergeSchemaPath<{
    "/rpc/:function": {
        $all: {
            input: {
                param: {
                    function: string;
                };
            };
            output: {};
            outputFormat: string;
            status: hono_utils_http_status.StatusCode;
        };
    };
} & {
    "/:relation": {
        $all: {
            input: {
                param: {
                    relation: string;
                };
            };
            output: {};
            outputFormat: string;
            status: hono_utils_http_status.StatusCode;
        };
    };
} & {
    "*": {
        $all: {
            input: {};
            output: {};
            outputFormat: string;
            status: hono_utils_http_status.StatusCode;
        };
    };
}, "/rest/v1"> | hono_types.MergeSchemaPath<(hono_types.BlankSchema | hono_types.MergeSchemaPath<{
    "/status": {
        $get: {
            input: {};
            output: {
                status: string;
            };
            outputFormat: "json";
            status: 200;
        };
    };
} & {
    "/object/public/:bucketId/*": {
        $get: {
            input: {
                param: {
                    bucketId: string;
                };
            };
            output: {};
            outputFormat: string;
            status: hono_utils_http_status.StatusCode;
        };
    };
} & {
    "/object/sign/:bucketId/*": {
        $get: {
            input: {
                param: {
                    bucketId: string;
                };
            };
            output: {};
            outputFormat: string;
            status: hono_utils_http_status.StatusCode;
        };
    };
} & {
    "/object/upload/sign/:bucketId/*": {
        $put: {
            input: {
                param: {
                    bucketId: string;
                };
            };
            output: {
                error: string;
            };
            outputFormat: "json";
            status: 400;
        } | {
            input: {
                param: {
                    bucketId: string;
                };
            };
            output: {
                error: string;
            };
            outputFormat: "json";
            status: 403;
        } | {
            input: {
                param: {
                    bucketId: string;
                };
            };
            output: {
                Key: string;
            };
            outputFormat: "json";
            status: 200;
        };
    };
}, "/"> | hono_types.MergeSchemaPath<{
    "/bucket": {
        $post: {
            input: {
                json: {
                    [x: string]: unknown;
                    public?: boolean | undefined;
                    file_size_limit?: number | undefined;
                    allowed_mime_types?: string[] | undefined;
                    id: string;
                    name: string;
                };
            };
            output: {
                name: string;
            };
            outputFormat: "json";
            status: 200;
        };
    };
} & {
    "/bucket": {
        $get: {
            input: {};
            output: {
                id: string;
                name: string;
                owner: string | null;
                owner_id: string | null;
                public: boolean;
                file_size_limit: number | null;
                allowed_mime_types: string[] | null;
                created_at: string;
                updated_at: string;
            }[];
            outputFormat: "json";
            status: 200;
        };
    };
} & {
    "/bucket/:id": {
        $get: {
            input: {
                param: {
                    id: string;
                };
            };
            output: {
                id: string;
                name: string;
                owner: string | null;
                owner_id: string | null;
                public: boolean;
                file_size_limit: number | null;
                allowed_mime_types: string[] | null;
                created_at: string;
                updated_at: string;
            };
            outputFormat: "json";
            status: 200;
        };
    };
} & {
    "/bucket/:id": {
        $put: {
            input: {
                json: {
                    [x: string]: unknown;
                    public?: boolean | undefined;
                    file_size_limit?: number | undefined;
                    allowed_mime_types?: string[] | undefined;
                };
            } & {
                param: {
                    id: string;
                };
            };
            output: {
                message: string;
            };
            outputFormat: "json";
            status: 200;
        };
    };
} & {
    "/bucket/:id": {
        $delete: {
            input: {
                param: {
                    id: string;
                };
            };
            output: {
                message: string;
            };
            outputFormat: "json";
            status: 200;
        };
    };
} & {
    "/bucket/:id/empty": {
        $post: {
            input: {
                param: {
                    id: string;
                };
            };
            output: {
                message: string;
            };
            outputFormat: "json";
            status: 200;
        };
    };
} & {
    "/object/list/:bucketId": {
        $post: {
            input: {
                json: {
                    [x: string]: unknown;
                    search?: string | undefined;
                    sortBy?: {
                        [x: string]: unknown;
                        column: string;
                        order: string;
                    } | undefined;
                    limit?: number | undefined;
                    offset?: number | undefined;
                    prefix?: string | undefined;
                };
            } & {
                param: {
                    bucketId: string;
                };
            };
            output: {
                id: string;
                bucket_id: string;
                name: string;
                owner: string | null;
                owner_id: string | null;
                metadata: {
                    [x: string]: hono_utils_types.JSONValue;
                };
                user_metadata: {
                    [x: string]: hono_utils_types.JSONValue;
                };
                path_tokens: string[];
                version: string | null;
                created_at: string;
                updated_at: string;
                last_accessed_at: string;
            }[];
            outputFormat: "json";
            status: 200;
        };
    };
} & {
    "/object/move": {
        $post: {
            input: {
                json: {
                    [x: string]: unknown;
                    destinationBucket?: string | undefined;
                    bucketId: string;
                    sourceKey: string;
                    destinationKey: string;
                };
            };
            output: {
                message: string;
            };
            outputFormat: "json";
            status: 200;
        };
    };
} & {
    "/object/copy": {
        $post: {
            input: {
                json: {
                    [x: string]: unknown;
                    destinationBucket?: string | undefined;
                    bucketId: string;
                    sourceKey: string;
                    destinationKey: string;
                };
            };
            output: {
                key: string;
            };
            outputFormat: "json";
            status: 200;
        };
    };
} & {
    "/object/info/:bucketId/*": {
        $get: {
            input: {
                param: {
                    bucketId: string;
                };
            };
            output: {
                id: string;
                bucket_id: string;
                name: string;
                owner: string | null;
                owner_id: string | null;
                metadata: {
                    [x: string]: hono_utils_types.JSONValue;
                };
                user_metadata: {
                    [x: string]: hono_utils_types.JSONValue;
                };
                path_tokens: string[];
                version: string | null;
                created_at: string;
                updated_at: string;
                last_accessed_at: string;
                httpMetadata: {
                    cacheControl: string;
                    contentLength: number;
                    size: number;
                    mimetype: string;
                    lastModified?: string | undefined;
                    eTag: string;
                    contentRange?: string | undefined;
                    httpStatusCode?: number | undefined;
                };
            };
            outputFormat: "json";
            status: 200;
        };
    };
} & {
    "/object/sign/:bucketId/*": {
        $post: {
            input: {
                json: {
                    [x: string]: unknown;
                    expiresIn: number;
                };
            } & {
                param: {
                    bucketId: string;
                };
            };
            output: {
                signedUrl: string;
            };
            outputFormat: "json";
            status: 200;
        };
    };
} & {
    "/object/sign/:bucketId": {
        $post: {
            input: {
                json: {
                    [x: string]: unknown;
                    expiresIn: number;
                    paths: string[];
                };
            } & {
                param: {
                    bucketId: string;
                };
            };
            output: {
                path: string;
                signedUrl: string;
                error: string | null;
            }[];
            outputFormat: "json";
            status: 200;
        };
    };
} & {
    "/object/upload/sign/:bucketId/*": {
        $post: {
            input: {
                param: {
                    bucketId: string;
                };
            };
            output: {
                signedUrl: string;
                token: string;
                path: string;
            };
            outputFormat: "json";
            status: 200;
        };
    };
} & {
    "/object/:bucketId": {
        $delete: {
            input: {
                json: {
                    [x: string]: unknown;
                    prefixes: string[];
                };
            } & {
                param: {
                    bucketId: string;
                };
            };
            output: {
                id: string;
                bucket_id: string;
                name: string;
                owner: string | null;
                owner_id: string | null;
                metadata: {
                    [x: string]: hono_utils_types.JSONValue;
                };
                user_metadata: {
                    [x: string]: hono_utils_types.JSONValue;
                };
                path_tokens: string[];
                version: string | null;
                created_at: string;
                updated_at: string;
                last_accessed_at: string;
            }[];
            outputFormat: "json";
            status: 200;
        };
    };
} & {
    "/object/:bucketId/*": {
        $post: {
            input: {
                param: {
                    bucketId: string;
                };
            };
            output: {
                Key: string;
                Id: string;
            };
            outputFormat: "json";
            status: 200;
        };
    };
} & {
    "/object/:bucketId/*": {
        $put: {
            input: {
                param: {
                    bucketId: string;
                };
            };
            output: {
                Key: string;
                Id: string;
            };
            outputFormat: "json";
            status: 200;
        };
    };
} & {
    "/object/:bucketId/*": {
        $get: {
            input: {
                param: {
                    bucketId: string;
                };
            };
            output: {};
            outputFormat: string;
            status: hono_utils_http_status.StatusCode;
        };
    };
} & {
    "/object/:bucketId/*": {
        $head: {
            input: {
                param: {
                    bucketId: string;
                };
            };
            output: null;
            outputFormat: "body";
            status: 200;
        } | {
            input: {
                param: {
                    bucketId: string;
                };
            };
            output: null;
            outputFormat: "body";
            status: 404;
        };
    };
}, "/">) & {
    "*": {
        $all: {
            input: {};
            output: {
                message: string;
                error: string;
                statusCode: number;
            };
            outputFormat: "json";
            status: 404;
        };
    };
}, "/storage/v1"> | hono_types.MergeSchemaPath<{
    "/ping": {
        $get: {
            input: {};
            output: {
                message: string;
            };
            outputFormat: "json";
            status: hono_utils_http_status.ContentfulStatusCode;
        };
    };
} & {
    "/config": {
        $get: {
            input: {};
            output: {};
            outputFormat: "json";
            status: hono_utils_http_status.ContentfulStatusCode;
        };
    };
} & {
    "/info": {
        $get: {
            input: {};
            output: {
                connection: any;
                config: any;
                admin: boolean;
            };
            outputFormat: "json";
            status: hono_utils_http_status.ContentfulStatusCode;
        };
    };
} & {
    "/introspect": {
        $get: {
            input: {};
            output: {
                tables: {
                    name: string;
                    sql: string;
                    schema: string;
                    type: "table" | "view";
                    rows: number;
                    engine: string;
                    collation: string;
                }[];
                columns: {
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
                    pg_type?: string | undefined;
                    udt_schema?: string | undefined;
                    is_generated?: boolean | undefined;
                }[];
                indexes: {
                    table: string;
                    name: string;
                    unique: boolean;
                    columns: string[];
                    schema: string;
                    sql?: string | undefined;
                }[];
                foreign_keys: {
                    table: string;
                    column: string;
                    ref_table: string;
                    ref_column: string;
                    on_update: string;
                    on_delete: string;
                    schema: string;
                    ref_schema?: string | undefined;
                    foreign_key_name: string;
                    foreign_key_group?: string | undefined;
                    fk_def: string;
                    is_visible?: boolean | undefined;
                }[];
                primary_keys: {
                    table: string;
                    columns: string[];
                    schema: string;
                    field_count: number;
                }[];
                views: {
                    name: string;
                    sql: string;
                    schema: string;
                }[];
                check_constraints: {
                    schema: string;
                    table: string;
                    expression: string;
                    name?: string | undefined;
                    column?: string | undefined;
                }[];
                unique_constraints: {
                    schema: string;
                    table: string;
                    name: string;
                    columns: string[];
                }[];
                comments: {
                    schema: string;
                    table: string;
                    column?: string | undefined;
                    text: string;
                }[];
                custom_types: {
                    schema: string;
                    type: string;
                    kind: "enum" | "composite";
                    values?: string[] | undefined;
                    fields?: {
                        name: string;
                        type: string;
                    }[] | undefined;
                }[];
                triggers: {
                    table: string;
                    name: string;
                    sql: string;
                    schema: string;
                }[];
                functions?: {
                    schema: string;
                    name: string;
                    arg_names: string[];
                    arg_types: string[];
                    arg_defaults: number;
                    has_variadic: boolean;
                    volatility: string;
                    return_type: string;
                    return_is_setof: boolean;
                    return_rows?: number | undefined;
                    return_typtype: string;
                    return_base_type?: string | undefined;
                    has_out_args: boolean;
                }[] | undefined;
                partitions?: {
                    name: string;
                    schema: string;
                    parent: string;
                }[] | undefined;
                database_name: string;
                version: string;
                ddl_dialect?: "postgres" | "sqlite" | undefined;
                default_schema?: string | undefined;
                timezones?: readonly string[] | undefined;
            };
            outputFormat: "json";
            status: hono_utils_http_status.ContentfulStatusCode;
        };
    };
}, "/_system">, "/", "*">;

type PolicyCommand = "SELECT" | "INSERT" | "UPDATE" | "DELETE" | "ALL";
type PolicyRole = "anon" | "authenticated" | string;
interface PolicyData {
    name: string;
    table: string;
    schema?: string;
    command: PolicyCommand;
    permissive: boolean;
    roles: PolicyRole[];
    using?: Where;
    withCheck?: Where;
}
declare class Policy {
    readonly data: PolicyData;
    constructor(data: PolicyData);
    appliesTo(cmd: "SELECT" | "INSERT" | "UPDATE" | "DELETE"): boolean;
    appliesToRole(role: string): boolean;
    toJSON(): PolicyData;
    static fromJSON(data: PolicyData): Policy;
}

interface IAppConfig extends DefaultSchema {
    connection: Connection$1 | Promise<Connection$1>;
    rls?: {
        tables: string[];
        policies: Policy[];
    };
    options?: {
        /**
         * Disable default config values from being applied.
         */
        defaults?: boolean;
        server?: ServerOptions;
        drivers?: PartialAppDrivers;
        system?: SystemOptions;
    };
}
interface SystemOptions {
    /**
     * How `ensureSystemSchema()` reconciles system schemas against config:
     * `"additive"` (default) only creates missing tables/columns; `"full"` also
     * drops system tables removed from an enabled module's schema (data-loss
     * steps require `force`).
     */
    schemaReconciliation?: "additive" | "full";
}
interface DefaultAppConfig extends IAppConfig {
    connection: Connection$1;
    options?: {
        defaults?: true;
        server?: ServerOptions;
        drivers?: PartialAppDrivers;
        system?: SystemOptions;
    };
}
declare class App<Config extends IAppConfig = DefaultAppConfig, Conn = Config extends IAppConfig ? Config["connection"] extends Connection$1 ? Config["connection"] : Config["connection"] extends Promise<Connection$1> ? Awaited<Config["connection"]> : Connection$1 : never> {
    #private;
    private readonly _connection;
    private readonly _rls;
    readonly config: DefaultSchema & Omit<Config, "connection">;
    readonly server: ReturnType<typeof createServer>;
    /**
     * Resolved local admin mode, after CLI-flag / config-file precedence. Read
     * this (never the raw CLI flag) when reporting what the server is doing.
     */
    readonly adminMode: boolean;
    readonly drivers: AppDrivers;
    _mailer?: Mailer;
    _storageAdapter?: StorageAdapter;
    _transformationAdapter?: TransformationAdapter;
    constructor({ connection, options, rls, ...config }: Config);
    get connection(): Conn;
    /**
     * Initialize the app. This is called automatically on first request.
     */
    init(): Promise<this>;
    /**
     * Provision the enabled system schemas (auth / storage / migration-history)
     * on the connected database with NO filesystem access — the runtime entry
     * point for non-CLI consumers (e.g. a lite-platform Durable Object) and the
     * shared provisioning path for the CLI (LITE-291). Reconciles ONLY the system
     * schemas, so user-land tables are never touched. The reconciliation mode
     * comes from `options.system.schemaReconciliation` (default `"additive"`).
     *
     * @param opts.force allow data-loss drops in `"full"` mode (else throws
     *   `DataLossError`).
     */
    ensureSystemSchema(opts?: {
        force?: boolean;
    }): Promise<void>;
    hasEnabledSystemBaseSchema(): boolean;
    isValidConfig(config: Schema | DefaultSchema | IAppConfig): boolean;
    getClient<SchemaName extends string = "public">(options?: SupabaseClientOptions<SchemaName> & {
        apikey?: string;
    }): _supabase_supabase_js.SupabaseClient<any, "public", SchemaName, Omit<any, "__InternalSupabase">[SchemaName] extends {
        Tables: Record<string, {
            Row: Record<string, unknown>;
            Insert: Record<string, unknown>;
            Update: Record<string, unknown>;
            Relationships: {
                foreignKeyName: string;
                columns: string[];
                isOneToOne?: boolean;
                referencedRelation: string;
                referencedColumns: string[];
            }[];
        }>;
        Views: Record<string, {
            Row: Record<string, unknown>;
            Insert: Record<string, unknown>;
            Update: Record<string, unknown>;
            Relationships: {
                foreignKeyName: string;
                columns: string[];
                isOneToOne?: boolean;
                referencedRelation: string;
                referencedColumns: string[];
            }[];
        } | {
            Row: Record<string, unknown>;
            Relationships: {
                foreignKeyName: string;
                columns: string[];
                isOneToOne?: boolean;
                referencedRelation: string;
                referencedColumns: string[];
            }[];
        }>;
        Functions: Record<string, {
            Args: Record<string, unknown> | never;
            Returns: unknown;
            SetofOptions?: {
                isSetofReturn?: boolean | undefined;
                isOneToOne?: boolean | undefined;
                isNotNullable?: boolean | undefined;
                to: string;
                from: string;
            };
        }>;
    } ? Omit<any, "__InternalSupabase">[SchemaName] : never, any>;
    isLocalRequest(request: Request): boolean;
    fetch: (request: Request, context?: AppRequestContext) => Promise<Response>;
    getInfoJson(): {
        connection: object;
        config: Config;
    };
}

declare class UnableToCreateRuntimeConnection extends Error {
    name: string;
    constructor(message: string);
}
declare class InvalidPostgresToSQLiteTranslation extends Error {
    readonly pgSql: string;
    readonly sqliteDdl: string;
    readonly cause: Error | unknown;
    name: string;
    constructor(pgSql: string, sqliteDdl: string, cause: Error | unknown);
}

type TUnwrappedConst = string | number | boolean | null | undefined;

declare class CheckConstraintError extends Error {
    readonly table: string;
    readonly column: string;
    readonly constraint: string;
    readonly value: unknown;
    constructor(table: string, column: string, constraint: string, value: unknown);
}

interface FieldFactoryExtra {
    lengthConstraint?: number;
    numericPrecision?: {
        precision: number;
        scale: number;
    };
    enumValues?: string[];
    isArray?: boolean;
}

type SqliteType = "INTEGER" | "REAL" | "TEXT" | "BLOB" | "ANY";
type DefaultFn = () => unknown;
interface ValidationResult {
    status: "pass" | "warn" | "fail";
    message: string | null;
    action?: string;
}
interface FieldContext {
    schema: string;
    table: string;
    column: string;
    pgTypeName: string;
    nullable: boolean;
    defaultValue: string | null;
    defaultFn?: DefaultFn | null;
    isPrimaryKey: boolean;
    isUnique: boolean;
    isSerial: boolean;
    isGenerated?: boolean;
    fkRef?: {
        refSchema?: string;
        refTable: string;
        refColumn: string;
        constraintName?: string;
    };
    hasCheck?: boolean;
    checkConstraintName?: string;
    uniqueConstraintName?: string;
}
interface ColumnDDLOptions {
    includeNullable?: boolean;
}
declare abstract class Field {
    readonly context: FieldContext;
    /**
     * The `FieldFactoryExtra` this field was resolved with (minus `enumValues`,
     * which is re-derived from the persisted enum map at parse time to avoid
     * duplicating it per-column). Set by {@link resolveField} purely so
     * `SqliteConnection.serializeDeparseInfo` can round-trip typmod details
     * (array/length/numeric precision) that only live in the AST at collect
     * time — not consumed by the field itself.
     */
    factoryExtra?: Omit<FieldFactoryExtra, "enumValues">;
    constructor(context: FieldContext);
    abstract get sqliteType(): SqliteType;
    get isShimBacked(): boolean;
    checkConstraint(): string | null;
    serialize(value: unknown): unknown;
    deserialize(value: unknown): unknown;
    validateStorage(_rawSqliteValue: unknown): ValidationResult;
    protected validationFail(message: string, action?: string): ValidationResult;
    protected validationPass(): ValidationResult;
    protected isNullish(value: unknown): value is null | undefined;
    toColumnDDL(options?: ColumnDDLOptions): string;
    protected checkError(constraint: string, value: unknown): CheckConstraintError;
    protected quoteIfNeeded(name: string): string;
}

type FunctionResolutionMode = "synthetic" | "translate" | "auto";

declare class TableSchema {
    readonly table: string;
    readonly schema: string;
    private fields;
    constructor(table: string, schema?: string, fields?: Map<string, Field>);
    get(col: string): Field | undefined;
    has(col: string): boolean;
    set(col: string, field: Field): void;
    columns(): string[];
    all(): Field[];
    serializeRow(row: Record<string, unknown>): Record<string, unknown>;
    deserializeRow(row: Record<string, unknown>): Record<string, unknown>;
    applyDefaults(row: Record<string, unknown>): Record<string, unknown>;
}

type CollectedEnums = Map<string, string[]>;
type CollectedVariable = {
    local?: boolean;
    value: TUnwrappedConst;
};
type CollectedVariables = Map<string, CollectedVariable>;
type CollectedRlsTables = Set<string>;
type CollectedSchema = Map<string, TableSchema>;
type CollectedTableConstraint = {
    schema: string;
    table: string;
    kind: "unique" | "check" | "foreign_key";
    name?: string;
    columns: string[];
    refSchema?: string;
    refTable?: string;
    refColumns?: string[];
};
type CollectedComment = {
    schema: string;
    table: string;
    column?: string;
    text: string;
};

interface DeparseOptions extends DeparserOptions {
    enums?: CollectedEnums;
    /** Current DB introspection. Required for ALTER TABLE ops that need 12-step rebuild. */
    introspection?: IntrospectResult;
    functionResolution?: FunctionResolutionMode;
    /**
     * ColumnDef nodes whose `nextval(...)` default was stripped by `normalize.ts`
     * (pg-delta serial/identity columns). Flagged here because the underlying
     * type is plain `integer`/`bigint` — nothing else marks them serial.
     */
    serialColumns?: WeakSet<object>;
}

declare function translatePostgresDdl(pgSql: string, options?: DeparseOptions): Promise<string>;
declare function deparsePostgresDdl(pgSql: string, options?: DeparseOptions & {
    strict?: boolean;
}): Promise<{
    ddl: string;
    enums: CollectedEnums;
    rls: {
        tables: CollectedRlsTables;
        policies: Policy[];
    };
    schema: CollectedSchema;
    vars: CollectedVariables;
    tableConstraints: CollectedTableConstraint[];
    comments: CollectedComment[];
    ast: ParseResult;
}>;

type SqliteMigratorOptions = {
    onTranslation?: (result: SqlitePostgresTranslationResult) => MaybePromise<void>;
};
declare class SqliteMigrator implements ConnectionMigrator {
    private readonly conn;
    private readonly desiredSchema;
    private readonly options;
    private readonly differ;
    private readonly planner;
    translationResult?: SqlitePostgresTranslationResult;
    constructor(conn: SqliteConnection, desiredSchema: string, options?: SqliteMigratorOptions);
    getDesiredSchema(): Promise<string>;
    diff(scope?: MigrateScope): Promise<SchemaDiffResult>;
    safeSortPlanSteps(steps: PlanStep[]): PlanStep[];
    migratePlan(planResult: PlanResult, opts?: {
        force?: boolean;
    }): Promise<void>;
    migrate(opts?: {
        force?: boolean;
    } & MigrateScope): Promise<SchemaDiffResult>;
}

interface ISqliteConnectionConfig extends IConnectionConfig {
    /**
     * The origin dialect for schema declarations. If "postgres",
     * the schema declarations will be translated to SQLite syntax.
     * If "sqlite", the schema declarations will be left as is.
     * @default "postgres"
     */
    ddlDialect?: "postgres" | "sqlite";
    /**
     * The origin dialect for query execution. If "sqlite", the queries will be executed as is.
     * Currently only "sqlite" is supported.
     * @default "sqlite"
     */
    queryDialect?: "sqlite";
    /**
     * Max bound parameters per statement. Enforced across all SQLite drivers
     * for portability: drivers and hosts vary in how many parameters they
     * accept (e.g. Cloudflare D1, sqlite-wasm), so we cap conservatively.
     * Statements exceeding this throw before execution.
     * @default 100
     */
    maxBoundParameters?: number;
    /**
     * Translation options for SQLite databases
     */
    translation?: {
        /**
         * Override PostgreSQL-to-SQLite DDL translation, for example with an
         * RPC-backed translator. Return live metadata or the JSON-safe
         * `{ ddl, ...PersistedDeparseInfo }` shape.
         */
        translateDdl?: SqlitePostgresDdlTranslator;
        /**
         * Deparse details the connection must be aware of. Accepts either the
         * live in-memory shape (`SqlitePostgresDeparseInfo`, with `Set`/`Map`/
         * `Policy` instances) or its JSON-serialized form (`PersistedDeparseInfo`,
         * e.g. a `deparse.json` produced by `lite db translate --deparse`). The
         * constructor normalizes both via `parseDeparseInfo`.
         */
        deparse?: SqlitePostgresDeparseInfo | PersistedDeparseInfo;
    };
}
type DeparsePostgresDdlResult = Awaited<ReturnType<typeof deparsePostgresDdl>>;
type SqlitePostgresDeparseInfo = Pick<DeparsePostgresDdlResult, "enums" | "rls" | "schema" | "vars"> & Partial<Pick<DeparsePostgresDdlResult, "tableConstraints" | "comments">>;
/**
 * The JSON-serializable form of the deparse info, rehydrated by
 * {@link SqliteConnection.parseDeparseInfo}. Covers the full runtime shape
 * except `ast`/`ddl` (build-time artifacts, intentionally omitted — never
 * cached). `schema` is `Map<string, TableSchema>` in memory; each `TableSchema`
 * holds `Field` instances that are fully determined by `resolveField(context,
 * extra)`, so it round-trips as `{context, extra}` per column (keyed
 * `${schema}.${table}`, matching `collectSchema`). `extra.enumValues` is
 * dropped and re-derived from the persisted `enums` map at parse time to
 * avoid duplicating enum members per column. `context.defaultFn` is always
 * `null` from the collectors today (collectors.ts, SqliteDeparser.ts) — it is
 * dropped here too; if a future collector ever sets it, it must be re-derived
 * at parse time instead of silently lost.
 * Produced by {@link SqliteConnection.serializeDeparseInfo}.
 */
interface PersistedDeparseInfo {
    rls: {
        tables: string[];
        policies: PolicyData[];
    };
    vars?: Record<string, CollectedVariable>;
    enums?: Record<string, string[]>;
    schema?: Record<string, Array<{
        context: Omit<FieldContext, "defaultFn">;
        extra?: Omit<FieldFactoryExtra, "enumValues">;
    }>>;
    tableConstraints?: CollectedTableConstraint[];
    comments?: CollectedComment[];
}
type SqlitePostgresTranslationResult = Pick<DeparsePostgresDdlResult, "ddl"> & Partial<DeparsePostgresDdlResult>;
type SqlitePostgresTranslationOptions = {
    strict: boolean | undefined;
    introspection: IntrospectResult | undefined;
};
type SqlitePostgresDdlTranslator = (ddl: string, options: SqlitePostgresTranslationOptions) => Promise<SqlitePostgresTranslationResult | (Pick<SqlitePostgresTranslationResult, "ddl"> & PersistedDeparseInfo)>;
declare abstract class SqliteConnection<Driver = unknown, DB = any, Config extends ISqliteConnectionConfig = ISqliteConnectionConfig> extends Connection<Driver, DB, Config> {
    #private;
    dialect: Dialect$1;
    deserializeRow(row: Record<string, unknown>): Record<string, unknown>;
    constructor(config?: Config);
    serializeConfig(): Config;
    /**
     * `opts.strict`: rethrow instead of swallowing a parse failure (default:
     * fail-soft, returning `{}`). The constructor path stays fail-soft — a
     * malformed `App({rls})` config shouldn't crash boot. The runtime metadata
     * cache restore path uses `strict: true`: a partially
     * corrupt blob (e.g. a valid outer `rls` shape but a broken nested
     * `schema` entry) must NOT silently degrade to "restored with whatever
     * parsed" — that's indistinguishable from "restored with full RLS
     * metadata" to the caller, which would then report `restored` and enforce
     * nothing. Rethrowing lets the caller treat any nested corruption as a
     * cache miss and fall through to recalculation.
     */
    static parseDeparseInfo(details: any, opts?: {
        strict?: boolean;
    }): Partial<SqlitePostgresDeparseInfo>;
    /**
     * Serialize deparse info to its JSON form — the inverse of
     * {@link SqliteConnection.parseDeparseInfo}. Coerces `Set` → array, `Map` →
     * object, and `Policy` → `PolicyData` (via `Policy.toJSON`), and flattens
     * `schema`'s `Field` instances to `{context, extra}` pairs (`extra` comes
     * from `Field#factoryExtra`, with `enumValues` dropped — re-derived from
     * `enums` at parse time). `ast`/`ddl` are dropped; everything else round-trips.
     * Feed the result to `JSON.stringify` for a `deparse.json` you can re-import
     * into `translation.deparse`. Accepts a `translateDdl` result or a stored
     * `SqlitePostgresDeparseInfo`.
     */
    static serializeDeparseInfo(info: Partial<SqlitePostgresDeparseInfo> | undefined | null): PersistedDeparseInfo;
    updateDeparseInfo(details: NonNullable<ISqliteConnectionConfig["translation"]>["deparse"]): void;
    protected withSqlitePlugins(add_plugins?: KyselyPlugin[]): KyselyPlugin[];
    translateDdl(ddl: string, opts?: {
        strict?: boolean;
    }): Promise<SqlitePostgresTranslationResult>;
    introspect(options?: {
        useCache?: boolean;
        postprocess?: boolean;
    }): Promise<IntrospectResult>;
    transaction(statements: string[], opts?: TransactionOptions): Promise<void>;
    close(): Promise<void>;
    /**
     * When ddlDialect === "postgres", enrich the PRAGMA-derived IntrospectResult
     * with metadata recovered from the parsed Postgres DDL: real FK constraint
     * names, table-level UNIQUE/CHECK constraints, column pg_type / is_generated,
     * and comments.
     */
    private mergeDeparseMetadata;
    /**
     * Create a migrator for the given schema.
     * @param desiredSchema The desired schema to migrate to. Input DDL is expected to be `config.ddlDialect`.
     * @returns A migrator instance.
     */
    createMigrator(desiredSchema: string): SqliteMigrator;
    get maxBoundParameters(): number;
    /**
     * Throws if the compiled statement has more bound parameters than
     * `maxBoundParameters`. Drivers call this from their query executor so
     * the same limit is enforced regardless of host capability.
     */
    assertParamLimit(parameters: readonly unknown[] | undefined): void;
    /**
     * Asserts the parameter limit and normalizes bind values. Drivers call
     * this once per statement; same limit and same value coercion everywhere.
     */
    prepareBindParams(parameters: readonly unknown[] | undefined): unknown[];
    /**
     * Coerces JS values to types every SQLite driver accepts. Drivers vary:
     * `bun:sqlite` silently coerces booleans, `node:sqlite` throws. Normalize
     * centrally so the executor boundary behaves identically everywhere.
     *
     * - `undefined` is dropped (matches prior DO behaviour and Kysely slots
     *   that never bound a value).
     * - `boolean` → `0` / `1`.
     * - pass-through: `null`, `number`, `bigint`, `string`, `Uint8Array`,
     *   `ArrayBuffer`, `Date` (drivers handle these, or upstream field
     *   serializers have already converted).
     * - unknown types throw with the offending index so divergence surfaces
     *   loudly instead of as a driver-specific bind error.
     */
    normalizeBindParams(parameters: readonly unknown[] | undefined): unknown[];
    normalizeDbError(e: unknown): unknown;
    onPostgrestAST(ast: AnyAST, vars?: VarsContext): Promise<AnyAST>;
    /**
     * Tables known to have RLS enabled in the APPLIED state of this database,
     * without any runtime metadata: the migration history replayed in applied
     * order (`rlsEnabledTables`). Empty when ddlDialect isn't postgres or the
     * history isn't readable.
     */
    private rlsEnabledFromHistory;
    private applyRls;
}

interface ICloudConnectionConfig extends ISqliteConnectionConfig {
    projectRef: string;
    token: string;
    host: string;
}
declare class CloudConnection<DB = any> extends SqliteConnection<never, DB> {
    readonly config: ICloudConnectionConfig;
    dialect: "sqlite";
    driver: never;
    kysely: never;
    constructor(config: ICloudConnectionConfig);
    /**
     * The Management API message carries the actionable database diagnostic.
     * Return it as the caller's only error rather than logging the raw envelope.
     */
    private failure;
    private fetch;
    introspect(options?: {
        useCache?: boolean;
        postprocess?: boolean;
    }): Promise<IntrospectResult>;
    transaction(statements: string[], opts?: TransactionOptions): Promise<void>;
    exec<T = {
        rows: unknown[];
    } | void>(statement: string, ...parameters: readonly unknown[]): Promise<T>;
    close(): Promise<void>;
}
declare function cloud<DB = any>(config: ICloudConnectionConfig): CloudConnection<DB>;

interface MigrationHistoryRow {
    version: string;
    name: string | null;
    statements: string[];
    /**
     * mgmt-API superset columns (LITE-291). Optional so the CLI path, which only
     * cares about version/name/statements, is unaffected. `idempotency_key` is
     * backed by a unique index — see `recordVersionSql`'s upsert.
     */
    created_by?: string | null;
    idempotency_key?: string | null;
    rollback?: string[] | null;
}
/**
 * Driver-split history table layout, matching the parity rule in `app/AGENTS.md`:
 *
 * - `pg`: real postgres / pglite — `supabase_migrations.schema_migrations`
 *   and `supabase_migrations.seed_files`, byte-compatible with the Supabase
 *   CLI (`~/supabase/cli/pkg/migration/history.go:14-28`).
 * - `pg-flat`: sqlite-postgres — the same Postgres-shaped DDL, but storage
 *   names are flattened (`"supabase_migrations.schema_migrations"`) because
 *   sqlite has no real schemas. From the user's perspective the SQL written
 *   in migration files is still pg DDL — translation handles the rest.
 * - `sqlite`: bare sqlite driver — flat `migrations` + `seed_files` tables.
 */
type HistoryVariant = "pg" | "pg-flat" | "sqlite";
declare function historyVariant(connection: Connection): HistoryVariant;
/**
 * Idempotent raw-pg DDL for the migration-history system schema, parallel to
 * `getAuthSchemaSql` / `getStorageSchemaSql`. Fed into the system-schema module
 * registry (see `db/system-schema.ts`); the pg-flat execution path runs it
 * through `connection.translateDdl` before exec'ing, so storage flattens.
 */
declare function getMigrationHistorySchemaSql(variant: HistoryVariant): string;
/**
 * Idempotently provision the history table. The migration-history tables are
 * excluded from introspection (so the declarative diff never drops them), which
 * means the schema-scoped migrator can't create them — this is the direct path
 * (`App.ensureSystemSchema` calls it, LITE-291). Translation-free (native DDL
 * per variant) so it runs in workerd. Order matters: create tables, upgrade
 * columns on any pre-existing table, THEN create the unique index (which
 * references `idempotency_key`).
 */
declare function ensureHistoryTable(connection: Connection): Promise<void>;
declare function appliedVersions(connection: Connection): Promise<string[]>;
declare function recordVersion(connection: Connection, row: MigrationHistoryRow): Promise<void>;
declare function removeVersion(connection: Connection, version: string): Promise<void>;
declare function listHistory(connection: Connection): Promise<MigrationHistoryRow[]>;
declare function getVersion(connection: Connection, version: string): Promise<MigrationHistoryRow | null>;
declare function removeVersionsGte(connection: Connection, version: string): Promise<void>;

type Primitive = string | number | boolean;
declare function isPrimitive(value: any): value is Primitive;
type BooleanLike = boolean | 0 | 1;
declare function isBooleanLike(value: any): value is boolean;
declare function isString(value: any): value is string;

declare function pipe<Arg = any>(...fns: ((a: Arg) => Arg)[]): (arg: Arg) => Arg;
declare function pipeEach<Arg = any>(...fns: ((a: Arg) => Arg)[]): (args: Arg[]) => Arg[];

declare function isPlainObject(value: unknown): value is Record<string, unknown>;
declare function isObject(value: unknown): value is Record<string, unknown>;
declare function objectDiff(obj1: Record<string, any>, obj2: Record<string, any>): Record<string, any>;
declare function getPath(object: object, _path: string | (string | number)[], defaultValue?: any): any;
declare function setPath(object: object, _path: string | (string | number)[], value: any): object;
declare function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K>;
declare function omit<T extends object, K extends keyof T>(obj: T, keys_: readonly K[] | K[] | string[]): Omit<T, Extract<K, keyof T>>;
/**
 * Lodash's merge implementation caused issues in Next.js environments
 * From: https://thescottyjam.github.io/snap.js/#!/nolodash/merge
 * NOTE: This mutates `object`. It also may mutate anything that gets attached to `object` during the merge.
 * @param object
 * @param sources
 */
declare function mergeObject(object: object, ...sources: object[]): object;
/**
 * Lodash's mergeWith implementation caused issues in Next.js environments
 * From: https://thescottyjam.github.io/snap.js/#!/nolodash/mergeWith
 * NOTE: This mutates `object`. It also may mutate anything that gets attached to `object` during the merge.
 * @param object
 * @param sources
 * @param customizer
 */
declare function mergeObjectWith(object: object, source: object, customizer: any): object;
declare function isEqual(value1: any, value2: any): boolean;
declare function jsonStringify(...args: Parameters<typeof JSON.stringify>): string;

declare function params(reqOrSearchParams: Request | URLSearchParams): Record<string, string>;
declare function filterSearchParams(reqOrSearchParams: Request | URLSearchParams, predicate: (key: string, value: string) => boolean): Record<string, string>;

declare function isNode(): boolean;
declare function isBun(): boolean;
declare function isWorkerd(): boolean;
declare function invariant(condition: boolean | any, message: string): void;
declare function threw(fn: () => any, instance?: new (...args: any[]) => Error): boolean;
declare function threwAsync(fn: Promise<any>, instance?: new (...args: any[]) => Error): Promise<boolean>;
declare function trySync<A = unknown, F = unknown>(fn: () => A, fallback?: F): A | F;
declare function measureTime(fn: () => MaybePromise<void>, callback: (time: number) => void): Promise<void>;
declare const ensureVar: {
    Map: (value: unknown) => Map<any, any>;
    Set: (value: unknown) => Set<any>;
    Array: (value: unknown) => any[];
};

declare function cleanSql(sql: string, opts?: {
    comments?: string;
}): string;
declare function getStatementsArray(sql: string, clean?: boolean): string[];
declare function splitSqlStatements(sql: string): string[];
declare function normalizeType(t: string): string;
declare function normalizeSql(sql: string): string;
declare function tableStructuralItems(sql: string): string[] | null;
declare function normalizeDefault(d: string | null): string | null;

declare function randomString(length?: number, opts?: {
    uppercase?: boolean;
    numbers?: boolean;
    special?: boolean;
}): string;
declare function isEmail(email: unknown, opts?: {
    domains?: string[];
    panic?: boolean;
}): boolean;
declare function checkPasswordStrength(password: unknown, { panic, length, numbers, special, }?: {
    panic?: boolean;
    length?: number;
    numbers?: number;
    special?: number;
}): boolean;
declare function ucFirst(str: string): string;
declare function ucFirstAll(str: string, split?: string): string;
/**
 * Convert an underscore-delimited string to PascalCase with spaces.
 * Example: `snake_to_pascal` -> `Snake To Pascal`
 *
 * @param str
 */
declare function snakeToPascalWithSpaces(str: string): string;
declare function normalizeString(str: string): string;
declare function slugify(str: string): string;
declare function truncate(str: string, length?: number, end?: string): string;
declare function quote(str: string, quoteChar?: string): string;
type MatchPattern = RegExp | string;
/**
 * Match a string against a pattern:
 *    - string: uses `String.includes`
 *    - SQL like string: replaces `%` with `.*` and `_` with `.` and uses `new RegExp(pattern)`
 *    - regex string: uses `new RegExp(pattern)`
 *    - regex object: uses `pattern.test`
 */
declare function patternMatch(target: string, pattern: MatchPattern): boolean;
declare function patternMatch(target: string, pattern: MatchPattern, stringHint: "regex" | "sql" | "wildcard"): boolean;
/**
 * Replace placeholders in a string. Mustache `{{var}}` by default
 *
 * @param str
 * @param vars
 * @param pattern
 */
declare function replacePlaceholders(str: string, vars: Record<string, any>, pattern?: RegExp): string;
/**
 * Fuzzy match using cosine similarity on character bigram vectors,
 * re-scored with normalized Levenshtein distance (matching PostgREST's fuzzyset method).
 * Returns the best match above `minScore`, or null.
 */
declare function fuzzyMatch(input: string, candidates: string[], minScore?: number): string | null;

declare function parseBigInt(value: BigInt | number): number;

declare function uuid(): string;

/** True only for IP addresses the OS routes over the local loopback interface. */
declare function isLoopbackAddress(address: string): boolean;
/** Hostnames that are unambiguously local without a DNS lookup. */
declare function isLoopbackHostname(hostname: string): boolean;

declare function getAuthSchemaSql(clean?: boolean): string;

declare const SUPABASE_AUTH_HELPERS_SQL = "\nCREATE SCHEMA IF NOT EXISTS auth;\n\nCREATE OR REPLACE FUNCTION auth.uid() RETURNS UUID AS $$\n  SELECT NULLIF(current_setting('request.jwt.claim.sub', true), '')::uuid;\n$$ LANGUAGE SQL STABLE;\n\nCREATE OR REPLACE FUNCTION auth.role() RETURNS TEXT AS $$\n  SELECT NULLIF(current_setting('request.jwt.claim.role', true), '');\n$$ LANGUAGE SQL STABLE;\n\nCREATE OR REPLACE FUNCTION auth.email() RETURNS TEXT AS $$\n  SELECT NULLIF(current_setting('request.jwt.claim.email', true), '');\n$$ LANGUAGE SQL STABLE;\n\nCREATE OR REPLACE FUNCTION auth.jwt() RETURNS JSONB AS $$\n  SELECT COALESCE(\n    NULLIF(current_setting('request.jwt.claims', true), ''),\n    '{}'\n  )::jsonb;\n$$ LANGUAGE SQL STABLE;\n";

type HonoContextWithAuth = HonoContext & {
    Variables: {
        userId: string;
        sessionId: string;
        jwt: Record<string, unknown>;
    };
};
declare const resolveAuth: ({ onError, }?: {
    onError?: (error: unknown, c: Context<HonoContextWithAuth>) => Response | Promise<Response>;
}) => hono.MiddlewareHandler<HonoContextWithAuth, string, {}, Response>;
declare const requireAuth: (options?: {
    acceptSecretApiKey?: boolean;
}) => hono.MiddlewareHandler<HonoContextWithAuth, string, {}, Response>;

declare function getStorageSchemaSql(clean?: boolean): string;

declare function studioRouteHandler(request: Request): Promise<Response>;

type ExperimentalFeature = "storage" | "cloud";
declare function isExperimentalEnabled(name: ExperimentalFeature): boolean;
declare function setExperimental(name: ExperimentalFeature, enabled: boolean): void;
declare function listEnabledExperimentals(): ExperimentalFeature[];

export { AnyAST, type ApiKeyResolver, type ApiKeyType, App, type AppDrivers, type AppDriversConfig, type AppRequestContext, AwsSesEmailDriver, type AwsSesEmailDriverOptions, type BooleanLike, CacheDriver, CacheSetOptions, CloudConnection, CloudflareKvCacheDriver, type CloudflareKvCacheDriverOptions, Connection, ConnectionMigrator, ConsoleEmailDriver, type ConsoleEmailDriverOptions, type DefaultAppConfig, Dialect$1 as Dialect, type EmailDriver, type EmailMessage, type ExperimentalFeature, type GeneratedApiKey, type HistoryVariant, type HonoContext, type IAppConfig, type ICloudConnectionConfig, IConnectionConfig, type ISqliteConnectionConfig, InMemoryEmailDriver, type InMemoryEmailDriverOptions, InMemoryLruCacheDriver, type InMemoryLruCacheDriverOptions, IntrospectResult, InvalidPostgresToSQLiteTranslation, type MatchPattern, type MaybePromise, MigrateScope, type MigrationHistoryRow, NoopSmsDriver, type NoopSmsDriverOptions, type PartialAppDrivers, type PersistedDeparseInfo, PlanResult, PlanStep, Policy, type PolicyCommand, type PolicyData, type PolicyRole, type Primitive, type RedisCacheClient, RedisCacheDriver, type RedisCacheDriverOptions, ResendEmailDriver, type ResendEmailDriverOptions, type ResolvedKey, SELF_HOSTED_PROJECT_REF, SUPABASE_AUTH_HELPERS_SQL, Schema, SchemaDiffResult, SendmailEmailDriver, type SendmailEmailDriverOptions, type ServerOptions, type SmsDriver, type SmsMessage, type SmtpAddress, type SmtpCreateTransport, SmtpEmailDriver, type SmtpEmailDriverOptions, type SmtpTransporter, SqliteConnection, type SqlitePostgresDdlTranslator, type SqlitePostgresDeparseInfo, type SqlitePostgresTranslationOptions, type SqlitePostgresTranslationResult, type StoredEmailMessage, TransactionOptions, UnableToCreateRuntimeConnection, VarsContext, Where, apiKeyType, appliedVersions, assertSmtpSupportedRuntime, buildSmtpMail, buildSmtpTransportOptions, checkPasswordStrength, cleanSql, cloud, createAppDrivers, ensureHistoryTable, ensureVar, filterSearchParams, formatSendmailMessage, fuzzyMatch, generateApiKey, getAuthSchemaSql, getMigrationHistorySchemaSql, getPath, getStatementsArray, getStorageSchemaSql, getVersion, hashApiKey, historyVariant, invariant, isBooleanLike, isBun, isEmail, isEqual, isExperimentalEnabled, isLoopbackAddress, isLoopbackHostname, isNode, isObject, isPlainObject, isPrimitive, isString, isWorkerd, jsonStringify, listEnabledExperimentals, listHistory, measureTime, mergeObject, mergeObjectWith, normalizeDefault, normalizeSql, normalizeString, normalizeType, objectDiff, omit, params, parseBigInt, patternMatch, pick, pipe, pipeEach, quote, randomString, recordVersion, removeVersion, removeVersionsGte, replacePlaceholders, requireAuth, resolveAuth, setExperimental, setPath, slugify, snakeToPascalWithSpaces, splitSqlStatements, studioRouteHandler, tableStructuralItems, threw, threwAsync, translatePostgresDdl, truncate, trySync, ucFirst, ucFirstAll, uuid };
