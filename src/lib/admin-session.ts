/**
 * Signed admin session — the trust anchor for the in-app Google sign-in.
 *
 * After a successful Google OAuth round-trip (`/api/auth/callback`) we mint a
 * compact, HMAC-signed token carrying the verified email + an expiry, and store
 * it in an httpOnly cookie. Every admin request re-verifies the signature (so a
 * tampered or forged cookie is rejected) and the allowlist (so revoking access
 * takes effect immediately). No third-party edge SSO required.
 *
 * Token shape: base64url(JSON payload) + "." + base64url(HMAC-SHA256(payload)).
 * Uses Web Crypto only — no dependencies, runs in the Vercel SSR runtime.
 */

export const SESSION_COOKIE = "nv_admin_session";
/** Session lifetime. Re-auth with Google is one click, so keep this short-ish. */
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 12; // 12 hours

export interface SessionPayload {
  /** Verified Google account email (lowercased). */
  email: string;
  /** Unix epoch seconds when this session expires. */
  exp: number;
}

const encoder = new TextEncoder();

function base64urlEncode(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlEncodeString(s: string): string {
  return base64urlEncode(encoder.encode(s));
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

/** Constant-time string compare to avoid signature-timing leaks. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Mint a signed session token for a verified email. */
export async function createSessionToken(
  email: string,
  secret: string,
  nowSeconds: number,
): Promise<string> {
  const payload: SessionPayload = {
    email: email.toLowerCase(),
    exp: nowSeconds + SESSION_MAX_AGE_SECONDS,
  };
  const payloadB64 = base64urlEncodeString(JSON.stringify(payload));
  const sig = await hmac(payloadB64, secret);
  return `${payloadB64}.${sig}`;
}

/**
 * Verify a session token. Returns the payload if the signature is valid and the
 * token has not expired; otherwise null. `nowSeconds` is injected for testability.
 */
export async function verifySessionToken(
  token: string | undefined | null,
  secret: string,
  nowSeconds: number,
): Promise<SessionPayload | null> {
  if (!token || !secret) return null;
  const dot = token.indexOf(".");
  if (dot < 1) return null;
  const payloadB64 = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  const expected = await hmac(payloadB64, secret);
  if (!timingSafeEqual(sig, expected)) return null;

  let payload: SessionPayload;
  try {
    payload = JSON.parse(base64urlDecodeToString(payloadB64)) as SessionPayload;
  } catch {
    return null;
  }
  if (typeof payload.email !== "string" || typeof payload.exp !== "number") return null;
  if (payload.exp <= nowSeconds) return null;
  return payload;
}
