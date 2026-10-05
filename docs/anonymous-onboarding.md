# Anonymous guest-to-email onboarding

Enable `auth.enable_anonymous_sign_ins: true` for controlled development or
sandboxes. It defaults to false; `auth.enable_signup: false` also blocks guests.
Email-provider signup settings are separate.

## Journey

With `@supabase/supabase-js`, keep application data tied to the guest's ID:

```js
const must = ({ data, error }) => { if (error) throw error; return data; };
const guest = must(await supabase.auth.signInAnonymously({
  options: { data: { onboarding: "guest" } },
}));
const userId = guest.user.id;
must(await supabase.from("drafts").insert({ user_id: userId, body: "My draft" }));
must(await supabase.auth.updateUser({ email: "reader@example.test" }));
// With confirmations enabled, consume the delivered code or token-hash link.
must(await supabase.auth.verifyOtp({
  email: "reader@example.test", token: emailCode, type: "email_change",
}));
must(await supabase.auth.updateUser({ password: chosenPassword }));
must(await supabase.auth.signOut());
const signedIn = must(await supabase.auth.signInWithPassword({
  email: "reader@example.test", password: chosenPassword,
}));
// signedIn.user.id === userId; the draft retains its owner.
```

## Behavior

- Guests have authenticated sessions, `is_anonymous: true`, supplied user metadata,
  empty app metadata and no identities. Issued/refreshed JWTs reflect the stored
  flag. Signing out before conversion loses access without another valid session.
- Confirmation requires a valid `email_change` OTP/link. Transactional adapters
  commit conversion, email identity, provider metadata, token consumption and
  returned session together. Existing-email conflicts reject without merging.
- `auth.email.enable_confirmations: false` converts immediately without mail.
  `updateUser` returns a user, not a session: refresh the stale anonymous JWT.
  Autoconfirm preserves empty app metadata; OTP/link conversion populates it.
- Password-only updates reject guests. Combined email/password updates work,
  but password login waits for required confirmation.
- Repeat authenticated `updateUser({email})` to resend pending email. Cooldown and
  OTP expiry apply; successful resend invalidates the previous token.
  `resend({type:"email_change",email})` only finds current addresses.

## Deployment boundary

Each sign-in creates a persistent user. CAPTCHA verification, anonymous IP
rate-limiting and cleanup are absent; SDK `captchaToken` is not verified.
Add external abuse protection before enabling uncontrolled access.

Guests have the `authenticated` role, unlike anonymous-key-only requests.
Review application access rules; policy resolution is unchanged.

## Implementation and compatibility reference

Implementation: `AuthService`, routes and JWT/user mappers in
[`dist/index.js`](../upstream/lite-0.11.0/dist/index.js), with declarations in
[`index.d.ts`](../upstream/lite-0.11.0/dist/index.d.ts).

Behavior follows [Auth v2.186.0](https://github.com/supabase/auth/tree/effd66245bd981ba5a07aa6b7441ad37578f9b73/internal/api)
([anonymous tests](https://github.com/supabase/auth/blob/v2.186.0/internal/api/anonymous_test.go));
see the [anonymous sign-in guide](https://supabase.com/docs/guides/auth/auth-anonymous).
Password-only signup creates a guest and discards the password. Known field
types are checked before dispatch; unsupported phone requests cannot become
guests. Repeated JSON keys retain `JSON.parse` semantics.

Run `bun install --frozen-lockfile && bun run test`. Tests cover Node SQLite, libSQL
and PGlite, identity/draft persistence, refresh, database reopen, transaction
rollback and loopback HTTP with captured email; no external accounts or delivery.
D1's best-effort transactions are unqualified. Phone/SMS, OAuth linking, account
merging, password-update revocation of other sessions and full two-mailbox
email-change parity remain outside scope.
