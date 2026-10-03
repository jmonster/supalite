import * as s from 'jsonv-ts';

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
        enable_signup?: boolean | undefined;
        jwt_secret?: string | undefined;
        publishable_key?: string | undefined;
        secret_key?: string | undefined;
        site_url?: string | undefined;
        additional_redirect_urls?: string[] | undefined;
        jwt_expiry?: number | undefined;
        enable_refresh_token_rotation?: boolean | undefined;
        refresh_token_reuse_interval?: number | undefined;
        enable_manual_linking?: boolean | undefined;
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
                max_frequency?: string | undefined;
                otp_length?: number | undefined;
                enroll_enabled?: boolean | undefined;
                verify_enabled?: boolean | undefined;
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
            double_confirm_changes?: boolean | undefined;
            enable_confirmations?: boolean | undefined;
            secure_password_change?: boolean | undefined;
            max_frequency?: string | undefined;
            otp_length?: number | undefined;
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
            enable_confirmations?: boolean | undefined;
            max_frequency?: string | undefined;
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
        enable_signup?: boolean | undefined;
        jwt_secret?: string | undefined;
        publishable_key?: string | undefined;
        secret_key?: string | undefined;
        site_url?: string | undefined;
        additional_redirect_urls?: string[] | undefined;
        jwt_expiry?: number | undefined;
        enable_refresh_token_rotation?: boolean | undefined;
        refresh_token_reuse_interval?: number | undefined;
        enable_manual_linking?: boolean | undefined;
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
                max_frequency?: string | undefined;
                otp_length?: number | undefined;
                enroll_enabled?: boolean | undefined;
                verify_enabled?: boolean | undefined;
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
            double_confirm_changes?: boolean | undefined;
            enable_confirmations?: boolean | undefined;
            secure_password_change?: boolean | undefined;
            max_frequency?: string | undefined;
            otp_length?: number | undefined;
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
            enable_confirmations?: boolean | undefined;
            max_frequency?: string | undefined;
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

export type { DefaultSchema as D, Schema as S };
