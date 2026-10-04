# Anonymous guest-to-email onboarding

This candidate adds an opt-in guest lifecycle over the unmodified published Lite
0.11.0 baseline. It is intended for controlled local development and sandboxes.

Enable `auth.enable_anonymous_sign_ins: true`. It defaults to false;
`auth.enable_signup: false` also blocks guest creation. Email signup settings do
not disable the separate anonymous provider.

## Journey

Use the normal `@supabase/supabase-js` client:

```js
const { data: guest, error } = await supabase.auth.signInAnonymously({
  options: { data: { onboarding: "guest" } },
});
if (error) throw error;
const userId = guest.user.id;

// Keep application data tied to this ID throughout conversion.
await supabase.from("drafts").insert({ user_id: userId, body: "My draft" });
await supabase.auth.updateUser({ email: "reader@example.test" });

// With email confirmations enabled, use the delivered code or token-hash link.
await supabase.auth.verifyOtp({
  email: "reader@example.test", token: emailCode, type: "email_change",
});
await supabase.auth.updateUser({ password: chosenPassword });
await supabase.auth.signOut();
const { data: signedIn } = await supabase.auth.signInWithPassword({
  email: "reader@example.test", password: chosenPassword,
});
// signedIn.user.id === userId; the existing draft still belongs to that ID.
```

The complete runnable tests check every API result, persisted identity and draft,
refresh, database reopen, and a real loopback HTTP server with captured email.
Run `npm ci && npm test`; no external accounts or email delivery are used.

## Behavior

- A guest has an authenticated session, `is_anonymous: true`, supplied user
  metadata, empty app metadata, and no identities. JWT issuance and refresh carry
  the persisted anonymous flag. Signing out before conversion loses access unless
  another valid session is retained.
- With confirmations enabled, adding email leaves the user anonymous until a
  valid `email_change` OTP or link is consumed. Conversion, email identity,
  provider metadata, token consumption, and the returned session are committed
  together on transactional adapters. An already-registered email is rejected
  without merging accounts.
- With `auth.email.enable_confirmations: false`, adding email immediately
  confirms and converts the guest without sending mail. `updateUser` returns a
  user, not a new session; refresh to replace the old JWT's anonymous claim. As
  in Auth v2.186.0, this path preserves empty app metadata even though the email
  identity exists; OTP/link conversion populates the email provider metadata.
- A password-only update before conversion fails. As in Auth v2.186.0, email and
  password may be supplied together; with confirmations enabled the stored
  password cannot log in until email verification.
- To resend a guest's pending email, repeat authenticated `updateUser({email})`.
  Existing email cooldown and OTP expiry apply; a successful resend invalidates
  the previous token. As in v2.186.0, `resend({type:"email_change",email})` only
  finds current email addresses and does not deliver a guest's pending email.
- Phone/SMS, OAuth linking, existing-account merging, CAPTCHA verification, and
  anonymous-user cleanup are outside this slice.

Verification covers Node SQLite, libSQL, and PGlite. It does not qualify D1's
best-effort multi-statement transactions. Existing Lite limitations outside this
journey, including password-update revocation of other sessions and full
two-mailbox email-change parity, remain outside this change.

## Deployment boundary

Every anonymous sign-in creates a persistent database user. This implementation
does not verify CAPTCHA tokens or impose an anonymous IP rate limit. Keep it in
controlled/local environments unless the deployment supplies abuse protection
before requests reach the endpoint. Do not treat SDK `captchaToken` as verified.

Anonymous users have the `authenticated` role. Review application access rules
before enabling the feature; a guest is not equivalent to a request using only
the anonymous API key. This change does not modify policy resolution.

## Implementation and compatibility reference

`src/auth/anonymous-auth.mjs` contains the readable extension. A hash-guarded
integration script prepares `.generated/guest-onboarding/`, leaving all 77
vendored files byte-for-byte intact. Only the signup dispatch, AuthService
extension, response flag, two JWT issue paths, and internal config declaration
are integrated into the generated artifact. The original TypeScript is absent
from the published package.

References: [anonymous sign-in guide](https://supabase.com/docs/guides/auth/auth-anonymous),
[Auth v2.186.0 anonymous journey tests](https://github.com/supabase/auth/blob/v2.186.0/internal/api/anonymous_test.go),
[signup dispatch](https://github.com/supabase/auth/blob/v2.186.0/internal/api/api.go),
[user update](https://github.com/supabase/auth/blob/v2.186.0/internal/api/user.go),
[verification](https://github.com/supabase/auth/blob/v2.186.0/internal/api/verify.go),
[resend](https://github.com/supabase/auth/blob/v2.186.0/internal/api/resend.go).
The tag is commit `effd66245bd981ba5a07aa6b7441ad37578f9b73` and matches the
vendor image mentioned in the published `STATUS.md`.

As in v2.186.0, password-only signup creates a guest and discards that password; it does not
establish a password login. Password-only updates of existing guests are rejected.
Known field types in the decoded signup object are checked before dispatch, and
unsupported phone requests cannot become guests. Exact repeated JSON keys retain
the baseline `JSON.parse` behavior; this is not a full Go JSON decoder.
