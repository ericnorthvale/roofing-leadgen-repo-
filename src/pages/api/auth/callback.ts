import type { APIRoute } from "astro";
import { evaluateEmailAccess } from "~/lib/admin-auth";
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from "~/lib/admin-session";
import { publicOrigin } from "~/lib/site-url";

export const prerender = false;

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const STATE_COOKIE = "nv_oauth_state";
const RETURN_COOKIE = "nv_oauth_return";

function denied(reason: string, detail: string): Response {
  return new Response(
    `<!doctype html><meta charset="utf-8"><title>Sign-in failed</title>` +
      `<div style="font-family:system-ui;max-width:34rem;margin:4rem auto;padding:0 1rem">` +
      `<h1>Sign-in failed</h1><p>${detail}</p>` +
      `<p><a href="/api/auth/login">Try again</a></p>` +
      `<p style="color:#888;font-size:.85rem">(${reason})</p></div>`,
    { status: 403, headers: { "content-type": "text/html; charset=utf-8" } },
  );
}

/** Decode a JWT payload WITHOUT verifying — safe only for the id_token we just
 * received directly from Google's token endpoint over TLS (per Google docs). */
function decodeJwtPayload(jwt: string): Record<string, unknown> | null {
  const parts = jwt.split(".");
  if (parts.length < 2) return null;
  try {
    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));
    const bin = atob(b64 + pad);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return JSON.parse(new TextDecoder().decode(bytes)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export const GET: APIRoute = async ({ request, cookies, redirect }) => {
  const clientId = import.meta.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = import.meta.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const sessionSecret = import.meta.env.ADMIN_SESSION_SECRET;
  if (!clientId || !clientSecret || !sessionSecret) {
    return denied("not-configured", "Google sign-in isn't fully configured yet.");
  }

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const expectedState = cookies.get(STATE_COOKIE)?.value;
  const returnTo = cookies.get(RETURN_COOKIE)?.value ?? "/keystatic";

  // CSRF: the state echoed by Google must match the cookie we set at /login.
  if (!code || !state || !expectedState || state !== expectedState) {
    return denied("bad-state", "Your sign-in request expired or didn't match. Please try again.");
  }
  cookies.delete(STATE_COOKIE, { path: "/" });
  cookies.delete(RETURN_COOKIE, { path: "/" });

  // Exchange the code for tokens.
  const tokenRes = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: `${publicOrigin(request)}/api/auth/callback`,
      grant_type: "authorization_code",
    }),
  });
  if (!tokenRes.ok) {
    return denied("token-exchange-failed", "Google rejected the sign-in. Please try again.");
  }
  const tokens = (await tokenRes.json()) as { id_token?: string };
  const claims = tokens.id_token ? decodeJwtPayload(tokens.id_token) : null;
  if (!claims) {
    return denied("no-id-token", "Google didn't return a verifiable identity. Please try again.");
  }

  const email = typeof claims.email === "string" ? claims.email.toLowerCase() : "";
  const emailVerified = claims.email_verified === true || claims.email_verified === "true";
  if (!email || !emailVerified) {
    return denied("email-unverified", "Your Google email could not be verified.");
  }

  const access = evaluateEmailAccess(email, {
    ADMIN_ALLOWED_DOMAINS: import.meta.env.ADMIN_ALLOWED_DOMAINS,
    ADMIN_ALLOWED_EMAILS: import.meta.env.ADMIN_ALLOWED_EMAILS,
  });
  if (!access.allowed) {
    return denied(
      access.reason,
      `<strong>${email}</strong> is not authorized for the Northvale admin panel.`,
    );
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  const token = await createSessionToken(email, sessionSecret, nowSeconds);
  cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  return redirect(
    returnTo.startsWith("/") && !returnTo.startsWith("//") ? returnTo : "/keystatic",
    302,
  );
};
