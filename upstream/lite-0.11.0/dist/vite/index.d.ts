import { Connect, Plugin } from 'vite';
import * as _supabase_supabase_js from '@supabase/supabase-js';
import { SupabaseClientOptions } from '@supabase/supabase-js';
import * as s from 'jsonv-ts';
import { Connection as Connection$1 } from '@supabase/lite';
import * as hono_hono_base from 'hono/hono-base';
import * as hono_utils_http_status from 'hono/utils/http-status';
import * as hono_utils_types from 'hono/utils/types';
import * as hono_types from 'hono/types';
import { Context, MiddlewareHandler } from 'hono';
import { Kysely, KyselyConfig } from 'kysely';
import { ReadableStream as ReadableStream$1 } from 'node:stream/web';

declare module "jsonv-ts" {
    interface ISchemaOptions {
        tags?: string[];
        links?: {
            name: string;
            link: string;
        }[];
    }
}
declare const schema: s.ObjectSchema<{
    readonly project_id: s.Schema<s.ISchemaOptions, string | undefined, string | undefined>;
    readonly analytics: s.Schema<s.ISchemaOptions, {
        enabled?: boolean | undefined;
        port?: number | undefined;
        vector_port?: number | undefined;
        backend?: "postgres" | "bigquery" | undefined;
    } | undefined, {
        enabled?: boolean | undefined;
        port?: number | undefined;
        vector_port?: number | undefined;
        backend?: "postgres" | "bigquery" | undefined;
    } | undefined>;
    readonly api: s.Schema<s.ISchemaOptions, {
        enabled?: boolean | undefined;
        port?: number | undefined;
        schemas?: string[] | undefined;
        extra_search_path?: string[] | undefined;
        max_rows?: number | undefined;
        pg_safe_update?: boolean | undefined;
        plan_enabled?: boolean | undefined;
        aggregates_enabled?: boolean | undefined;
        limited_mutations_enabled?: boolean | undefined;
        anonymous_enabled?: boolean | undefined;
        external_url?: string | undefined;
        tls?: {
            enabled?: boolean | undefined;
        } | undefined;
    } | undefined, {
        enabled?: boolean | undefined;
        port?: number | undefined;
        schemas?: string[] | undefined;
        extra_search_path?: string[] | undefined;
        max_rows?: number | undefined;
        pg_safe_update?: boolean | undefined;
        plan_enabled?: boolean | undefined;
        aggregates_enabled?: boolean | undefined;
        limited_mutations_enabled?: boolean | undefined;
        anonymous_enabled?: boolean | undefined;
        external_url?: string | undefined;
        tls?: {
            enabled?: boolean | undefined;
        } | undefined;
    } | undefined>;
    readonly auth: s.Schema<s.ISchemaOptions, {
        enabled?: boolean | undefined;
        jwt_secret?: string | undefined;
        publishable_key?: string | undefined;
        secret_key?: string | undefined;
        site_url?: string | undefined;
        additional_redirect_urls?: string[] | undefined;
        jwt_expiry?: number | undefined;
        enable_refresh_token_rotation?: boolean | undefined;
        refresh_token_reuse_interval?: number | undefined;
        enable_manual_linking?: boolean | undefined;
        enable_signup?: boolean | undefined;
        enable_anonymous_sign_ins?: boolean | undefined;
        minimum_password_length?: number | undefined;
        password_requirements?: string | undefined;
        hook?: {
            mfa_verification_attempt?: {
                enabled?: boolean | undefined;
                uri?: string | undefined;
                secrets?: string[] | undefined;
            } | undefined;
            password_verification_attempt?: {
                enabled?: boolean | undefined;
                uri?: string | undefined;
                secrets?: string[] | undefined;
            } | undefined;
            custom_access_token?: {
                enabled?: boolean | undefined;
                uri?: string | undefined;
                secrets?: string[] | undefined;
            } | undefined;
            send_sms?: {
                enabled?: boolean | undefined;
                uri?: string | undefined;
                secrets?: string[] | undefined;
            } | undefined;
            send_email?: {
                enabled?: boolean | undefined;
                uri?: string | undefined;
                secrets?: string[] | undefined;
            } | undefined;
        } | undefined;
        mfa?: {
            max_enrolled_factors?: number | undefined;
            totp?: {
                enroll_enabled?: boolean | undefined;
                verify_enabled?: boolean | undefined;
            } | undefined;
            phone?: {
                template?: string | undefined;
                enroll_enabled?: boolean | undefined;
                verify_enabled?: boolean | undefined;
                otp_length?: number | undefined;
                max_frequency?: string | undefined;
            } | undefined;
        } | undefined;
        sessions?: {
            timebox?: string | undefined;
            inactivity_timeout?: string | undefined;
            single_per_user?: boolean | undefined;
        } | undefined;
        email?: {
            template?: {
                invite?: {
                    subject?: string | undefined;
                    content_path?: string | undefined;
                } | undefined;
                confirmation?: {
                    subject?: string | undefined;
                    content_path?: string | undefined;
                } | undefined;
                recovery?: {
                    subject?: string | undefined;
                    content_path?: string | undefined;
                } | undefined;
                magic_link?: {
                    subject?: string | undefined;
                    content_path?: string | undefined;
                } | undefined;
                email_change?: {
                    subject?: string | undefined;
                    content_path?: string | undefined;
                } | undefined;
            } | undefined;
            enable_signup?: boolean | undefined;
            otp_length?: number | undefined;
            max_frequency?: string | undefined;
            double_confirm_changes?: boolean | undefined;
            enable_confirmations?: boolean | undefined;
            secure_password_change?: boolean | undefined;
            otp_expiry?: number | undefined;
            smtp?: {
                enabled?: boolean | undefined;
                port?: number | undefined;
                host?: string | undefined;
                user?: string | undefined;
                pass?: string | undefined;
                admin_email?: string | undefined;
                sender_name?: string | undefined;
            } | undefined;
        } | undefined;
        sms?: {
            template?: string | undefined;
            enable_signup?: boolean | undefined;
            max_frequency?: string | undefined;
            enable_confirmations?: boolean | undefined;
            test_otp?: {
                [x: string]: string;
            } | undefined;
            twilio?: {
                enabled?: boolean | undefined;
                account_sid?: string | undefined;
                message_service_sid?: string | undefined;
                auth_token?: string | undefined;
            } | undefined;
            twilio_verify?: {
                enabled?: boolean | undefined;
                account_sid?: string | undefined;
                message_service_sid?: string | undefined;
                auth_token?: string | undefined;
            } | undefined;
            messagebird?: {
                enabled?: boolean | undefined;
                originator?: string | undefined;
                api_key?: string | undefined;
            } | undefined;
            textlocal?: {
                enabled?: boolean | undefined;
                api_key?: string | undefined;
                sender?: string | undefined;
            } | undefined;
            vonage?: {
                enabled?: boolean | undefined;
                api_key?: string | undefined;
                from?: string | undefined;
                api_secret?: string | undefined;
            } | undefined;
        } | undefined;
        external?: {
            apple?: {
                enabled?: boolean | undefined;
                client_id?: string | undefined;
                secret?: string | undefined;
                url?: string | undefined;
                redirect_uri?: string | undefined;
                skip_nonce_check?: boolean | undefined;
                email_optional?: boolean | undefined;
            } | undefined;
            azure?: {
                enabled?: boolean | undefined;
                client_id?: string | undefined;
                secret?: string | undefined;
                url?: string | undefined;
                redirect_uri?: string | undefined;
                skip_nonce_check?: boolean | undefined;
                email_optional?: boolean | undefined;
            } | undefined;
            bitbucket?: {
                enabled?: boolean | undefined;
                client_id?: string | undefined;
                secret?: string | undefined;
                url?: string | undefined;
                redirect_uri?: string | undefined;
                skip_nonce_check?: boolean | undefined;
                email_optional?: boolean | undefined;
            } | undefined;
            discord?: {
                enabled?: boolean | undefined;
                client_id?: string | undefined;
                secret?: string | undefined;
                url?: string | undefined;
                redirect_uri?: string | undefined;
                skip_nonce_check?: boolean | undefined;
                email_optional?: boolean | undefined;
            } | undefined;
            facebook?: {
                enabled?: boolean | undefined;
                client_id?: string | undefined;
                secret?: string | undefined;
                url?: string | undefined;
                redirect_uri?: string | undefined;
                skip_nonce_check?: boolean | undefined;
                email_optional?: boolean | undefined;
            } | undefined;
            github?: {
                enabled?: boolean | undefined;
                client_id?: string | undefined;
                secret?: string | undefined;
                url?: string | undefined;
                redirect_uri?: string | undefined;
                skip_nonce_check?: boolean | undefined;
                email_optional?: boolean | undefined;
            } | undefined;
            gitlab?: {
                enabled?: boolean | undefined;
                client_id?: string | undefined;
                secret?: string | undefined;
                url?: string | undefined;
                redirect_uri?: string | undefined;
                skip_nonce_check?: boolean | undefined;
                email_optional?: boolean | undefined;
            } | undefined;
            google?: {
                enabled?: boolean | undefined;
                client_id?: string | undefined;
                secret?: string | undefined;
                url?: string | undefined;
                redirect_uri?: string | undefined;
                skip_nonce_check?: boolean | undefined;
                email_optional?: boolean | undefined;
            } | undefined;
            kakao?: {
                enabled?: boolean | undefined;
                client_id?: string | undefined;
                secret?: string | undefined;
                url?: string | undefined;
                redirect_uri?: string | undefined;
                skip_nonce_check?: boolean | undefined;
                email_optional?: boolean | undefined;
            } | undefined;
            keycloak?: {
                enabled?: boolean | undefined;
                client_id?: string | undefined;
                secret?: string | undefined;
                url?: string | undefined;
                redirect_uri?: string | undefined;
                skip_nonce_check?: boolean | undefined;
                email_optional?: boolean | undefined;
            } | undefined;
            linkedin?: {
                enabled?: boolean | undefined;
                client_id?: string | undefined;
                secret?: string | undefined;
                url?: string | undefined;
                redirect_uri?: string | undefined;
                skip_nonce_check?: boolean | undefined;
                email_optional?: boolean | undefined;
            } | undefined;
            notion?: {
                enabled?: boolean | undefined;
                client_id?: string | undefined;
                secret?: string | undefined;
                url?: string | undefined;
                redirect_uri?: string | undefined;
                skip_nonce_check?: boolean | undefined;
                email_optional?: boolean | undefined;
            } | undefined;
            twitch?: {
                enabled?: boolean | undefined;
                client_id?: string | undefined;
                secret?: string | undefined;
                url?: string | undefined;
                redirect_uri?: string | undefined;
                skip_nonce_check?: boolean | undefined;
                email_optional?: boolean | undefined;
            } | undefined;
            twitter?: {
                enabled?: boolean | undefined;
                client_id?: string | undefined;
                secret?: string | undefined;
                url?: string | undefined;
                redirect_uri?: string | undefined;
                skip_nonce_check?: boolean | undefined;
                email_optional?: boolean | undefined;
            } | undefined;
            slack?: {
                enabled?: boolean | undefined;
                client_id?: string | undefined;
                secret?: string | undefined;
                url?: string | undefined;
                redirect_uri?: string | undefined;
                skip_nonce_check?: boolean | undefined;
                email_optional?: boolean | undefined;
            } | undefined;
            spotify?: {
                enabled?: boolean | undefined;
                client_id?: string | undefined;
                secret?: string | undefined;
                url?: string | undefined;
                redirect_uri?: string | undefined;
                skip_nonce_check?: boolean | undefined;
                email_optional?: boolean | undefined;
            } | undefined;
            workos?: {
                enabled?: boolean | undefined;
                client_id?: string | undefined;
                secret?: string | undefined;
                url?: string | undefined;
                redirect_uri?: string | undefined;
                skip_nonce_check?: boolean | undefined;
                email_optional?: boolean | undefined;
            } | undefined;
            zoom?: {
                enabled?: boolean | undefined;
                client_id?: string | undefined;
                secret?: string | undefined;
                url?: string | undefined;
                redirect_uri?: string | undefined;
                skip_nonce_check?: boolean | undefined;
                email_optional?: boolean | undefined;
            } | undefined;
        } | undefined;
    } | undefined, {
        enabled?: boolean | undefined;
        jwt_secret?: string | undefined;
        publishable_key?: string | undefined;
        secret_key?: string | undefined;
        site_url?: string | undefined;
        additional_redirect_urls?: string[] | undefined;
        jwt_expiry?: number | undefined;
        enable_refresh_token_rotation?: boolean | undefined;
        refresh_token_reuse_interval?: number | undefined;
        enable_manual_linking?: boolean | undefined;
        enable_signup?: boolean | undefined;
        enable_anonymous_sign_ins?: boolean | undefined;
        minimum_password_length?: number | undefined;
        password_requirements?: string | undefined;
        hook?: {
            mfa_verification_attempt?: {
                enabled?: boolean | undefined;
                uri?: string | undefined;
                secrets?: string[] | undefined;
            } | undefined;
            password_verification_attempt?: {
                enabled?: boolean | undefined;
                uri?: string | undefined;
                secrets?: string[] | undefined;
            } | undefined;
            custom_access_token?: {
                enabled?: boolean | undefined;
                uri?: string | undefined;
                secrets?: string[] | undefined;
            } | undefined;
            send_sms?: {
                enabled?: boolean | undefined;
                uri?: string | undefined;
                secrets?: string[] | undefined;
            } | undefined;
            send_email?: {
                enabled?: boolean | undefined;
                uri?: string | undefined;
                secrets?: string[] | undefined;
            } | undefined;
        } | undefined;
        mfa?: {
            max_enrolled_factors?: number | undefined;
            totp?: {
                enroll_enabled?: boolean | undefined;
                verify_enabled?: boolean | undefined;
            } | undefined;
            phone?: {
                template?: string | undefined;
                enroll_enabled?: boolean | undefined;
                verify_enabled?: boolean | undefined;
                otp_length?: number | undefined;
                max_frequency?: string | undefined;
            } | undefined;
        } | undefined;
        sessions?: {
            timebox?: string | undefined;
            inactivity_timeout?: string | undefined;
            single_per_user?: boolean | undefined;
        } | undefined;
        email?: {
            template?: {
                invite?: {
                    subject?: string | undefined;
                    content_path?: string | undefined;
                } | undefined;
                confirmation?: {
                    subject?: string | undefined;
                    content_path?: string | undefined;
                } | undefined;
                recovery?: {
                    subject?: string | undefined;
                    content_path?: string | undefined;
                } | undefined;
                magic_link?: {
                    subject?: string | undefined;
                    content_path?: string | undefined;
                } | undefined;
                email_change?: {
                    subject?: string | undefined;
                    content_path?: string | undefined;
                } | undefined;
            } | undefined;
            enable_signup?: boolean | undefined;
            otp_length?: number | undefined;
            max_frequency?: string | undefined;
            double_confirm_changes?: boolean | undefined;
            enable_confirmations?: boolean | undefined;
            secure_password_change?: boolean | undefined;
            otp_expiry?: number | undefined;
            smtp?: {
                enabled?: boolean | undefined;
                port?: number | undefined;
                host?: string | undefined;
                user?: string | undefined;
                pass?: string | undefined;
                admin_email?: string | undefined;
                sender_name?: string | undefined;
            } | undefined;
        } | undefined;
        sms?: {
            template?: string | undefined;
            enable_signup?: boolean | undefined;
            max_frequency?: string | undefined;
            enable_confirmations?: boolean | undefined;
            test_otp?: {
                [x: string]: string;
            } | undefined;
            twilio?: {
                enabled?: boolean | undefined;
                account_sid?: string | undefined;
                message_service_sid?: string | undefined;
                auth_token?: string | undefined;
            } | undefined;
            twilio_verify?: {
                enabled?: boolean | undefined;
                account_sid?: string | undefined;
                message_service_sid?: string | undefined;
                auth_token?: string | undefined;
            } | undefined;
            messagebird?: {
                enabled?: boolean | undefined;
                originator?: string | undefined;
                api_key?: string | undefined;
            } | undefined;
            textlocal?: {
                enabled?: boolean | undefined;
                api_key?: string | undefined;
                sender?: string | undefined;
            } | undefined;
            vonage?: {
                enabled?: boolean | undefined;
                api_key?: string | undefined;
                from?: string | undefined;
                api_secret?: string | undefined;
            } | undefined;
        } | undefined;
        external?: {
            apple?: {
                enabled?: boolean | undefined;
                client_id?: string | undefined;
                secret?: string | undefined;
                url?: string | undefined;
                redirect_uri?: string | undefined;
                skip_nonce_check?: boolean | undefined;
                email_optional?: boolean | undefined;
            } | undefined;
            azure?: {
                enabled?: boolean | undefined;
                client_id?: string | undefined;
                secret?: string | undefined;
                url?: string | undefined;
                redirect_uri?: string | undefined;
                skip_nonce_check?: boolean | undefined;
                email_optional?: boolean | undefined;
            } | undefined;
            bitbucket?: {
                enabled?: boolean | undefined;
                client_id?: string | undefined;
                secret?: string | undefined;
                url?: string | undefined;
                redirect_uri?: string | undefined;
                skip_nonce_check?: boolean | undefined;
                email_optional?: boolean | undefined;
            } | undefined;
            discord?: {
                enabled?: boolean | undefined;
                client_id?: string | undefined;
                secret?: string | undefined;
                url?: string | undefined;
                redirect_uri?: string | undefined;
                skip_nonce_check?: boolean | undefined;
                email_optional?: boolean | undefined;
            } | undefined;
            facebook?: {
                enabled?: boolean | undefined;
                client_id?: string | undefined;
                secret?: string | undefined;
                url?: string | undefined;
                redirect_uri?: string | undefined;
                skip_nonce_check?: boolean | undefined;
                email_optional?: boolean | undefined;
            } | undefined;
            github?: {
                enabled?: boolean | undefined;
                client_id?: string | undefined;
                secret?: string | undefined;
                url?: string | undefined;
                redirect_uri?: string | undefined;
                skip_nonce_check?: boolean | undefined;
                email_optional?: boolean | undefined;
            } | undefined;
            gitlab?: {
                enabled?: boolean | undefined;
                client_id?: string | undefined;
                secret?: string | undefined;
                url?: string | undefined;
                redirect_uri?: string | undefined;
                skip_nonce_check?: boolean | undefined;
                email_optional?: boolean | undefined;
            } | undefined;
            google?: {
                enabled?: boolean | undefined;
                client_id?: string | undefined;
                secret?: string | undefined;
                url?: string | undefined;
                redirect_uri?: string | undefined;
                skip_nonce_check?: boolean | undefined;
                email_optional?: boolean | undefined;
            } | undefined;
            kakao?: {
                enabled?: boolean | undefined;
                client_id?: string | undefined;
                secret?: string | undefined;
                url?: string | undefined;
                redirect_uri?: string | undefined;
                skip_nonce_check?: boolean | undefined;
                email_optional?: boolean | undefined;
            } | undefined;
            keycloak?: {
                enabled?: boolean | undefined;
                client_id?: string | undefined;
                secret?: string | undefined;
                url?: string | undefined;
                redirect_uri?: string | undefined;
                skip_nonce_check?: boolean | undefined;
                email_optional?: boolean | undefined;
            } | undefined;
            linkedin?: {
                enabled?: boolean | undefined;
                client_id?: string | undefined;
                secret?: string | undefined;
                url?: string | undefined;
                redirect_uri?: string | undefined;
                skip_nonce_check?: boolean | undefined;
                email_optional?: boolean | undefined;
            } | undefined;
            notion?: {
                enabled?: boolean | undefined;
                client_id?: string | undefined;
                secret?: string | undefined;
                url?: string | undefined;
                redirect_uri?: string | undefined;
                skip_nonce_check?: boolean | undefined;
                email_optional?: boolean | undefined;
            } | undefined;
            twitch?: {
                enabled?: boolean | undefined;
                client_id?: string | undefined;
                secret?: string | undefined;
                url?: string | undefined;
                redirect_uri?: string | undefined;
                skip_nonce_check?: boolean | undefined;
                email_optional?: boolean | undefined;
            } | undefined;
            twitter?: {
                enabled?: boolean | undefined;
                client_id?: string | undefined;
                secret?: string | undefined;
                url?: string | undefined;
                redirect_uri?: string | undefined;
                skip_nonce_check?: boolean | undefined;
                email_optional?: boolean | undefined;
            } | undefined;
            slack?: {
                enabled?: boolean | undefined;
                client_id?: string | undefined;
                secret?: string | undefined;
                url?: string | undefined;
                redirect_uri?: string | undefined;
                skip_nonce_check?: boolean | undefined;
                email_optional?: boolean | undefined;
            } | undefined;
            spotify?: {
                enabled?: boolean | undefined;
                client_id?: string | undefined;
                secret?: string | undefined;
                url?: string | undefined;
                redirect_uri?: string | undefined;
                skip_nonce_check?: boolean | undefined;
                email_optional?: boolean | undefined;
            } | undefined;
            workos?: {
                enabled?: boolean | undefined;
                client_id?: string | undefined;
                secret?: string | undefined;
                url?: string | undefined;
                redirect_uri?: string | undefined;
                skip_nonce_check?: boolean | undefined;
                email_optional?: boolean | undefined;
            } | undefined;
            zoom?: {
                enabled?: boolean | undefined;
                client_id?: string | undefined;
                secret?: string | undefined;
                url?: string | undefined;
                redirect_uri?: string | undefined;
                skip_nonce_check?: boolean | undefined;
                email_optional?: boolean | undefined;
            } | undefined;
        } | undefined;
    } | undefined>;
    readonly db: s.Schema<s.ISchemaOptions, {
        [x: string]: unknown;
        port?: number | undefined;
        url?: string | undefined;
        driver?: "postgres" | "sqlite" | "sqlite-postgres" | "pglite" | undefined;
        shadow_port?: number | undefined;
        major_version?: number | undefined;
        pooler?: {
            [x: string]: unknown;
            enabled?: boolean | undefined;
            port?: number | undefined;
            pool_mode?: string | undefined;
            default_pool_size?: number | undefined;
            max_client_conn?: number | undefined;
        } | undefined;
        seed?: {
            enabled?: boolean | undefined;
            sql_paths?: string[] | undefined;
        } | undefined;
        migrations?: {
            enabled?: boolean | undefined;
            schema_paths?: string[] | undefined;
        } | undefined;
    } | undefined, {
        [x: string]: unknown;
        port?: number | undefined;
        url?: string | undefined;
        driver?: "postgres" | "sqlite" | "sqlite-postgres" | "pglite" | undefined;
        shadow_port?: number | undefined;
        major_version?: number | undefined;
        pooler?: {
            [x: string]: unknown;
            enabled?: boolean | undefined;
            port?: number | undefined;
            pool_mode?: string | undefined;
            default_pool_size?: number | undefined;
            max_client_conn?: number | undefined;
        } | undefined;
        seed?: {
            enabled?: boolean | undefined;
            sql_paths?: string[] | undefined;
        } | undefined;
        migrations?: {
            enabled?: boolean | undefined;
            schema_paths?: string[] | undefined;
        } | undefined;
    } | undefined>;
    readonly edge_runtime: s.Schema<s.ISchemaOptions, {
        enabled?: boolean | undefined;
        policy?: "oneshot" | "per_worker" | undefined;
        inspector_port?: number | undefined;
    } | undefined, {
        enabled?: boolean | undefined;
        policy?: "oneshot" | "per_worker" | undefined;
        inspector_port?: number | undefined;
    } | undefined>;
    readonly functions: s.Schema<s.ISchemaOptions, {
        [x: string]: {
            enabled?: boolean | undefined;
            verify_jwt?: boolean | undefined;
            import_map?: string | undefined;
            entrypoint?: string | undefined;
        };
    } | undefined, {
        [x: string]: {
            enabled?: boolean | undefined;
            verify_jwt?: boolean | undefined;
            import_map?: string | undefined;
            entrypoint?: string | undefined;
        };
    } | undefined>;
    readonly inbucket: s.Schema<s.ISchemaOptions, {
        enabled?: boolean | undefined;
        port?: number | undefined;
        smtp_port?: number | undefined;
        pop3_port?: number | undefined;
    } | undefined, {
        enabled?: boolean | undefined;
        port?: number | undefined;
        smtp_port?: number | undefined;
        pop3_port?: number | undefined;
    } | undefined>;
    readonly realtime: s.Schema<s.ISchemaOptions, {
        enabled?: boolean | undefined;
        ip_version?: string | undefined;
        max_header_length?: number | undefined;
    } | undefined, {
        enabled?: boolean | undefined;
        ip_version?: string | undefined;
        max_header_length?: number | undefined;
    } | undefined>;
    readonly storage: s.Schema<s.ISchemaOptions, {
        enabled?: boolean | undefined;
        file_size_limit?: string | undefined;
        buckets?: {
            [x: string]: {
                public?: boolean | undefined;
                file_size_limit?: string | undefined;
                allowed_mime_types?: string[] | undefined;
                objects_path?: string | undefined;
            };
        } | undefined;
        image_transformation?: {
            enabled?: boolean | undefined;
        } | undefined;
    } | undefined, {
        enabled?: boolean | undefined;
        file_size_limit?: string | undefined;
        buckets?: {
            [x: string]: {
                public?: boolean | undefined;
                file_size_limit?: string | undefined;
                allowed_mime_types?: string[] | undefined;
                objects_path?: string | undefined;
            };
        } | undefined;
        image_transformation?: {
            enabled?: boolean | undefined;
        } | undefined;
    } | undefined>;
    readonly studio: s.Schema<s.ISchemaOptions, {
        enabled?: boolean | undefined;
        port?: number | undefined;
        api_url?: string | undefined;
        openai_api_key?: string | undefined;
    } | undefined, {
        enabled?: boolean | undefined;
        port?: number | undefined;
        api_url?: string | undefined;
        openai_api_key?: string | undefined;
    } | undefined>;
    readonly experimental: s.Schema<s.ISchemaOptions, {
        orioledb_version?: string | undefined;
        s3_host?: string | undefined;
        s3_region?: string | undefined;
        s3_access_key?: string | undefined;
        s3_secret_key?: string | undefined;
    } | undefined, {
        orioledb_version?: string | undefined;
        s3_host?: string | undefined;
        s3_region?: string | undefined;
        s3_access_key?: string | undefined;
        s3_secret_key?: string | undefined;
    } | undefined>;
}, s.Merge<s.IObjectOptions & {
    additionalProperties: false;
}>>;
type Schema = s.Static<typeof schema>;
type DefaultSchema = s.StaticCoerced<typeof schema>;

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

type Dialect$1 = "postgres" | "sqlite";
/** Bound `Connection#runInTransaction` — see db/Connection.ts for why this
 * indirection exists (DO storage has no BEGIN/COMMIT over kysely). */
type TransactionRunner = <T>(fn: (trx: Kysely<any>) => Promise<T>) => Promise<T>;
declare class AuthRepository {
    private db;
    private dialect;
    private runInTransaction;
    private schema;
    constructor(db: Kysely<any>, dialect: Dialect$1, runInTransaction?: TransactionRunner);
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

interface CacheSetOptions {
    ttl?: number;
}
interface CacheDriver {
    get(key: string): Promise<string | undefined>;
    set(key: string, value: string, options?: CacheSetOptions): Promise<void>;
    delete(key: string): Promise<void>;
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

interface SmsMessage {
    to: string;
    body: string;
}
interface SmsDriver {
    send(message: SmsMessage): Promise<void>;
}

interface AppDrivers {
    email: EmailDriver;
    sms: SmsDriver;
    cache: CacheDriver;
}
type PartialAppDrivers = Partial<AppDrivers>;

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
type Where = Record<string, unknown>;
type OrderEntry = {
    column: string;
    direction?: "asc" | "desc";
    nullsFirst?: boolean;
    /** For ordering by embedded resource column: embed alias */
    embed?: string;
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

type ApiKeyType = "publishable" | "secret";

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

declare const DEFAULT_PREFIXES: string[];
declare function honoMiddleware(app: App, prefixes?: string[]): Connect.NextHandleFunction;

type SupaliteOptions = {
    config?: string;
    migrateOnBoot?: boolean;
    watchSchema?: boolean;
    forceSchema?: boolean;
    initOnBoot?: boolean;
    prefixes?: string[];
    /**
     * Local admin mode: defaults on for loopback Vite dev hosts and off for
     * exposed hosts. Keyless, same-origin, loopback requests run as
     * `service_role`. In practice that means `/rest/v1` here — admin mode also
     * covers `/storage/v1`, but this plugin does not mount that prefix unless
     * you add it to `prefixes`.
     *
     * See `ServerOptions.admin` for the caveats. An explicit value here
     * outranks `options.server.admin`; explicit `true` is required to enable
     * admin on an exposed host. Never applied in `vite preview`.
     */
    admin?: boolean;
};
declare function supalite(options?: SupaliteOptions): Plugin;

export { DEFAULT_PREFIXES, type SupaliteOptions, supalite as default, honoMiddleware, supalite };
