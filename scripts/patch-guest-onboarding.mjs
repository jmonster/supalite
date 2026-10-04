import assert from "node:assert/strict";
import { createHash } from "node:crypto";

export const indexSha256 = "f5cf75c6bcb10cec0c175cd4a8237b831368f7dbfc77e12652b965dde6a5685d";

function replaceOnce(source, anchor, replacement) {
  assert.equal(source.split(anchor).length - 1, 1, `Expected one guest Auth anchor: ${anchor}`);
  return source.replace(anchor, replacement);
}

export function patchGuestOnboarding(source) {
  assert.equal(createHash("sha256").update(source).digest("hex"), indexSha256,
    "Refusing to patch an unrecognized Lite bundle");
  source = replaceOnce(source, "function _g(t){", [
    'Fs=withAnonymousAuth(Fs,{uuid:pe,signupDisabled:Lo,anonymousDisabled:qh,invalid:K,badJson:js,phoneDisabled:()=>new D(400,"phone_provider_disabled","Phone signups are disabled"),emailExists:Lh,failure:pt});',
    "function _g(t){",
  ].join(""));
  source = replaceOnce(source,
    "r=await n.signUp(e.email,e.password,e.data,On(t))",
    "r=await n.signUpRequest(e,On(t))");
  source = replaceOnce(source,
    "created_at:e.created_at,updated_at:e.updated_at,is_anonymous:false",
    "created_at:e.created_at,updated_at:e.updated_at,is_anonymous:isAnonymous(e)");
  for (const variable of ["n", "l"]) {
    source = replaceOnce(source,
      `email:e.email??void 0,session_id:${variable}},this.config.jwt_secret`,
      `email:e.email??void 0,is_anonymous:isAnonymous(e),session_id:${variable}},this.config.jwt_secret`);
  }
  return 'import { withAnonymousAuth, isAnonymous } from "./anonymous-auth.mjs";\n' + source;
}

export function patchAuthTypes(source) {
  return replaceOnce(source, "    enable_signup?: boolean;\n    sessions?: {",
    "    enable_signup?: boolean;\n    enable_anonymous_sign_ins?: boolean;\n    sessions?: {");
}
