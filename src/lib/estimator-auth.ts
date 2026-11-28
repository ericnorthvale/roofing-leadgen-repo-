/**
 * Access control for the crew estimator (/estimator).
 *
 * A DIFFERENT PROBLEM FROM THE ADMIN PANEL. `/keystatic` is gated by Google
 * sign-in because it edits the public site and the people using it have
 * company accounts. The estimator is used by crew in a driveway, on their own
 * phones, often on bad signal — so the owner chose a single shared code typed
 * into the page. That is a deliberate trade of security for field usability,
 * and this file is written to make the weaker control as strong as it can be.
 *
 * WHY THIS DOES NOT TOUCH admin-session.ts. The admin gate works and protects
 * the ability to publish. Refactoring it to share code with a lower-assurance
 * door risks breaking it for no benefit, so the token helpers below are
 * deliberately duplicated rather than extracted. Keep it that way.
 *
 * THE CODE IS NEVER IN THIS REPOSITORY. It lives in ESTIMATOR_PIN, set in
 * Vercel. Anything committed here is readable by everyone with repository
 * access, for good, including through history. If ESTIMATOR_PIN is unset the
 * estimator is OFF and the route 404s — the feature fails closed rather than
 * opening to anyone who guesses the path.
 *
 * WHAT A LEAKED CODE WOULD COST. The estimator can put Northvale's name and
 * branding on a document and send it to a customer. The realistic harm is not
 * someone reading prices, it is someone issuing a fraudulent estimate in the
 * company's name. The comparison is constant-time and the session is short.
 *
 * THERE IS DELIBERATELY NO LOCKOUT (owner, 2026-11-25) — it locked out the
 * crew as readily as anyone else. That makes the LENGTH of ESTIMATOR_PIN the
 * only real defence: unlimited guesses against six digits is a million
 * combinations, which is hours of scripting, not years. Lengthening the code
 * is the fix and needs no code change.
 */

/** Cookie holding the signed estimator session. Distinct from the admin one. */
export const ESTIMATOR_COOKIE = "nv_estimator_session";

/**
 * Short by design. A rep signs in once at the start of a day; a phone left in
 * a truck overnight should not still be signed in.
 */
export const ESTIMATOR_MAX_AGE_SECONDS = 60 * 60 * 12; // 12 hours

/** Minimum length we will accept for a configured code. */
export const MIN_PIN_LENGTH = 4;

export interface EstimatorAuthEnv {
  /** The shared code. Unset = the estimator is disabled entirely. */
  ESTIMATOR_PIN?: string;
  /**
   * HMAC key for session cookies. Reuses the admin signing secret: a signing
   * key is not an access credential, and one fewer setting for the owner to
   * get wrong is worth more here than separate keys.
   */
  ADMIN_SESSION_SECRET?: string;
}

export interface EstimatorSessionPayload {
  /** Fixed marker so an admin cookie can never be replayed as an estimator one. */
  scope: "estimator";
  exp: number;
}

/** Is the estimator configured at all? */
export function isEstimatorEnabled(env: EstimatorAuthEnv): boolean {
  const pin = (env.ESTIMATOR_PIN ?? "").trim();
  return pin.length >= MIN_PIN_LENGTH && (env.ADMIN_SESSION_SECRET ?? "").length > 0;
}

/** Routes behind the code. */
export function isEstimatorPath(pathname: string): boolean {
  return pathname === "/estimator" || pathname.startsWith("/estimator/");
}

const encoder = new TextEncoder();

function base64urlEncode(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlDecodeToString(s: string): string {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/") + pad);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

async function hmac(payloadB64: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payloadB64));
  return base64urlEncode(new Uint8Array(sig));
}

/**
 * Constant-time compare. Used for BOTH the signature and the code itself: an
 * early-exit comparison on a 6-digit code leaks it digit by digit to anyone
 * who can measure response times.
 */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Does this submitted code match the configured one? */
export function checkPin(submitted: string, env: EstimatorAuthEnv): boolean {
  if (!isEstimatorEnabled(env)) return false;
  return timingSafeEqual((submitted ?? "").trim(), (env.ESTIMATOR_PIN ?? "").trim());
}

export async function createEstimatorToken(secret: string, nowSeconds: number): Promise<string> {
  const payload: EstimatorSessionPayload = {
    scope: "estimator",
    exp: nowSeconds + ESTIMATOR_MAX_AGE_SECONDS,
  };
  const payloadB64 = base64urlEncode(encoder.encode(JSON.stringify(payload)));
  return `${payloadB64}.${await hmac(payloadB64, secret)}`;
}

/** Valid, unexpired, estimator-scoped token → payload. Anything else → null. */
export async function verifyEstimatorToken(
  token: string | undefined | null,
  secret: string,
  nowSeconds: number,
): Promise<EstimatorSessionPayload | null> {
  if (!token || !secret) return null;
  const dot = token.indexOf(".");
  if (dot < 1) return null;
  const payloadB64 = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  if (!timingSafeEqual(sig, await hmac(payloadB64, secret))) return null;

  let payload: EstimatorSessionPayload;
  try {
    payload = JSON.parse(base64urlDecodeToString(payloadB64)) as EstimatorSessionPayload;
  } catch {
    return null;
  }
  // An admin cookie is signed with the same key, so the scope check is what
  // stops one being presented as the other.
  if (payload?.scope !== "estimator") return null;
  if (typeof payload.exp !== "number" || payload.exp <= nowSeconds) return null;
  return payload;
}
