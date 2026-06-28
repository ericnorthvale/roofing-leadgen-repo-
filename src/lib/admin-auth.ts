/**
 * Admin panel access control (in-app Google sign-in, fail-closed).
 *
 * The `/keystatic` admin panel is gated by an in-app Google OAuth flow
 * (`/api/auth/*`): after a verified Google sign-in we set an HMAC-signed session
 * cookie (see `admin-session.ts`). Middleware verifies that cookie on every admin
 * request and then applies the email/domain allowlist below. We do NOT trust any
 * upstream identity header — without a proxy that strips it, such a header is
 * trivially spoofable, so the signed cookie is the only accepted identity.
 *
 * Fail-closed: in production, no valid session → redirected to sign in; an
 * authenticated-but-not-allowlisted account → blocked.
 */

const DEFAULT_ALLOWED_DOMAINS = ["northvaleroofing.com"];

export interface AdminAuthEnv {
  /** Comma-separated allowed email domains. Defaults to northvaleroofing.com. */
  ADMIN_ALLOWED_DOMAINS?: string;
  /** Comma-separated explicit allowed emails (optional, e.g. a contractor). */
  ADMIN_ALLOWED_EMAILS?: string;
}

export interface AdminAuthResult {
  allowed: boolean;
  reason: string;
  email?: string;
}

const splitList = (v?: string) =>
  (v ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

/**
 * Pure allowlist check for an already-verified email. Used after the Google
 * sign-in proves the identity and after the session cookie is verified.
 */
export function evaluateEmailAccess(email: string, env: AdminAuthEnv): AdminAuthResult {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return { allowed: false, reason: "no-identity" };

  const allowedEmails = splitList(env.ADMIN_ALLOWED_EMAILS).map((e) => e.toLowerCase());
  if (allowedEmails.includes(normalized))
    return { allowed: true, reason: "email-allowlist", email: normalized };

  const domains = splitList(env.ADMIN_ALLOWED_DOMAINS).map((d) =>
    d.toLowerCase().replace(/^@/, ""),
  );
  const effectiveDomains = domains.length > 0 ? domains : DEFAULT_ALLOWED_DOMAINS;
  const domain = normalized.split("@")[1] ?? "";
  if (effectiveDomains.includes(domain))
    return { allowed: true, reason: "domain-allowlist", email: normalized };

  return { allowed: false, reason: "not-allowlisted", email: normalized };
}

/** True for paths that require admin access. */
export function isAdminPath(pathname: string): boolean {
  return (
    pathname === "/keystatic" ||
    pathname.startsWith("/keystatic/") ||
    pathname.startsWith("/api/keystatic")
  );
}
