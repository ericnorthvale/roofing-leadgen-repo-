/**
 * Admin panel access control (Google Workspace SSO, fail-closed).
 *
 * The `/keystatic` admin panel must sit behind an edge SSO provider that
 * authenticates with Google Workspace and injects a VERIFIED identity header —
 * recommended: Cloudflare Access (`Cf-Access-Authenticated-User-Email`), or
 * Google IAP (`X-Goog-Authenticated-User-Email`). This module trusts that header
 * ONLY because the provider strips/sets it upstream; the panel must never be
 * exposed publicly without that provider in front. See docs/setup-admin-panel.md.
 *
 * Fail-closed: in production, no verified identity → blocked.
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

/** Read the verified identity email from known edge-SSO headers. */
export function ssoEmail(headers: Headers): string {
  const cf = headers.get("cf-access-authenticated-user-email");
  if (cf) return cf.trim().toLowerCase();
  // Google IAP prefixes the value with "accounts.google.com:".
  const iap = headers.get("x-goog-authenticated-user-email");
  if (iap) return iap.split(":").pop()!.trim().toLowerCase();
  return "";
}

export function checkAdminAccess(opts: {
  headers: Headers;
  env: AdminAuthEnv;
  isDev: boolean;
}): AdminAuthResult {
  // Local dev uses Keystatic local mode — no SSO needed on your own machine.
  if (opts.isDev) return { allowed: true, reason: "dev" };

  const email = ssoEmail(opts.headers);
  if (!email) return { allowed: false, reason: "no-sso-identity" };

  const allowedEmails = splitList(opts.env.ADMIN_ALLOWED_EMAILS).map((e) => e.toLowerCase());
  if (allowedEmails.includes(email)) return { allowed: true, reason: "email-allowlist", email };

  const domains = splitList(opts.env.ADMIN_ALLOWED_DOMAINS).map((d) =>
    d.toLowerCase().replace(/^@/, ""),
  );
  const effectiveDomains = domains.length > 0 ? domains : DEFAULT_ALLOWED_DOMAINS;
  const domain = email.split("@")[1] ?? "";
  if (effectiveDomains.includes(domain))
    return { allowed: true, reason: "domain-allowlist", email };

  return { allowed: false, reason: "not-allowlisted", email };
}

/** True for paths that require admin access. */
export function isAdminPath(pathname: string): boolean {
  return (
    pathname === "/keystatic" ||
    pathname.startsWith("/keystatic/") ||
    pathname.startsWith("/api/keystatic")
  );
}
