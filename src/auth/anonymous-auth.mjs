// This narrow extension reuses the published Auth repository, mailer and token
// primitives. Each request owns an AuthService; transaction scopes use a fresh
// service so no repository is shared across asynchronous transaction callbacks.
export function isAnonymous(user) {
  return user.is_anonymous === true || user.is_anonymous === 1;
}

export function withAnonymousAuth(Base, errors) {
  const { uuid, signupDisabled, anonymousDisabled, invalid, badJson, phoneDisabled, emailExists, failure } = errors;

  return class AnonymousAuthService extends Base {
    constructor(repo, config, mailer) {
      super(repo, config, mailer);
    }

    async signUpRequest(body, redirectTo) {
      // Typed Go JSON decoding treats null like an empty parameter struct.
      body ??= {};
      if (typeof body !== "object" || Array.isArray(body)) {
        throw badJson("Signup requires a JSON object");
      }
      const strings = ["email", "phone", "password", "channel", "code_challenge", "code_challenge_method"];
      // Go's decoder accepts case-insensitive field names and ignores unknown
      // ones. In particular, PHONE must not disappear into a guest request.
      const decoded = {};
      for (const [rawKey, value] of Object.entries(body)) {
        const key = rawKey.toLowerCase();
        if (strings.includes(key)) {
          // A null string is ignored, including after a case-variant key. Check
          // each entry before overwriting so a later value cannot hide bad JSON.
          if (value == null) continue;
          if (typeof value !== "string") throw badJson(`Signup ${key} must be a string`);
          decoded[key] = value;
        } else if (key === "data") {
          if (value != null && (typeof value !== "object" || Array.isArray(value))) {
            throw badJson("Signup data must be a JSON object");
          }
          decoded.data = value;
        }
      }
      body = decoded;
      // Dispatch first, matching GoTrue's provider gate before the anonymous
      // handler's global signup gate. Normal email signup keeps its own gate.
      if (!body.email && !body.phone) return this.signUp(body.email, body.password, body.data, redirectTo);
      if (this.config.enable_signup === false) throw signupDisabled();
      if (body.phone) {
        if (!body.password) throw invalid("Signup requires a valid password", 400);
        this.assertPasswordStrong(body.password);
        if (body.email) throw invalid("Only an email address or phone number should be provided on signup", 400);
        throw phoneDisabled();
      }
      return this.signUp(body.email, body.password, body.data, redirectTo);
    }

    async signUp(email, password, data, redirectTo) {
      if (email) return super.signUp(email, password, data, redirectTo);
      if (this.config.enable_anonymous_sign_ins !== true) throw anonymousDisabled();
      if (this.config.enable_signup === false) throw signupDisabled();

      // A password on anonymous signup is intentionally discarded by GoTrue;
      // it never becomes a login credential without a verified email identity.
      return this.repo.transaction(async (repo) => {
        const service = new AnonymousAuthService(repo, this.config, this.mailer);
        const user = await repo.createUser({
          id: uuid(),
          email: null,
          encrypted_password: null,
          is_anonymous: true,
          raw_app_meta_data: {},
          raw_user_meta_data: data ?? {},
        });
        const session = await service.createSessionForUser(
          repo.parseUserJson(user), [], "session", { provider: "anonymous" },
        );
        await service.createAuditLog(user.id, "", "user_signedup", "team", true, "anonymous");
        return { user: session.user, session };
      });
    }

    async assertEmailAvailable(email, userId) {
      const owner = await this.repo.findUserByEmail(email);
      if (owner && owner.id !== userId) throw emailExists();
    }

    async updateUser(userId, attributes, redirectTo) {
      const row = await this.repo.findUserById(userId);
      if (!row || !isAnonymous(row)) return super.updateUser(userId, attributes, redirectTo);
      // Match GoTrue's anonymous-user guard. A password may accompany the new
      // email, but cannot be set by itself before the email has been verified.
      if (attributes.password && !attributes.email) {
        throw invalid("Anonymous users cannot update their password", 422);
      }
      const autoconfirm = !(
        this.config.email?.enable_confirmations ?? this.config.enable_confirmations ?? false
      );
      if (!autoconfirm || !attributes.email) return super.updateUser(userId, attributes, redirectTo);

      const email = attributes.email.toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw invalid("Unable to validate email address: invalid format", 400);
      }
      return this.repo.transaction(async (repo) => {
        const service = new AnonymousAuthService(repo, this.config, this.mailer);
        const current = await repo.findUserById(userId);
        if (!current || !isAnonymous(current)) {
          throw invalid("Anonymous user was already converted; retry the email update", 409);
        }
        await service.assertEmailAvailable(email, userId);
        // Use the existing password-strength/hash and metadata-merge behavior.
        await Base.prototype.updateUser.call(service, userId, {
          data: attributes.data, password: attributes.password,
        }, redirectTo);
        const user = repo.parseUserJson(await repo.findUserById(userId));
        const identityData = { sub: userId, email, email_verified: true, phone_verified: false };
        const identities = await repo.findIdentitiesByUserId(userId);
        const identity = identities.find((item) => item.provider === "email");
        if (identity) {
          await repo.updateIdentity(identity.id, { identity_data: { ...identity.identity_data, ...identityData } });
        } else {
          await repo.createIdentity({
            id: uuid(), provider: "email", provider_id: userId, user_id: userId,
            identity_data: identityData,
          });
        }
        const updated = await repo.updateUser(userId, {
          email,
          confirmed_at: new Date().toISOString(),
          is_anonymous: false,
          email_change: null,
          email_change_token_current: null,
          email_change_token_new: null,
          raw_user_meta_data: { ...user.raw_user_meta_data, email_verified: true },
        });
        if (!updated) throw failure("Database error updating user");
        return service.mapUserToResponse(repo.parseUserJson(updated), await repo.findIdentitiesByUserId(userId), "user");
      });
    }

    async completeVerifyOtp(row, tokenColumn, type) {
      // The base verifier has already atomically claimed the token and owns the
      // transaction. A conflict must roll back the claim and every conversion
      // change. The base method links the identity and issues the new session.
      if (type === "email_change" && row.email_change && isAnonymous(row)) {
        await this.assertEmailAvailable(row.email_change, row.id);
        const user = this.repo.parseUserJson(row);
        row = await this.repo.updateUser(row.id, {
          is_anonymous: false,
          raw_user_meta_data: {
            ...user.raw_user_meta_data, email_verified: true,
          },
        });
        if (!row) throw failure("Database error updating user");
      }
      return super.completeVerifyOtp(row, tokenColumn, type);
    }
  };
}
