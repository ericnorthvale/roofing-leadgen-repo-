import type { APIRoute } from "astro";
import { publicOrigin } from "~/lib/site-url";

export const prerender = false;

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const STATE_COOKIE = "nv_oauth_state";
const RETURN_COOKIE = "nv_oauth_return";

/** Only allow same-site return paths (defence against open-redirect). */
function safeReturnTo(raw: string | null): string {
  if (raw && raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return "/keystatic";
}

/**
 * Kick off the Google sign-in. We set a short-lived CSRF `state` cookie + a
 * return-path cookie, then redirect to Google's consent screen restricted to
 * the org's hosted domain (`hd`). The callback validates `state` before trusting
 * anything Google hands back.
 */
export const GET: APIRoute = ({ request, cookies, redirect }) => {
  const clientId = import.meta.env.GOOGLE_OAUTH_CLIENT_ID;
  if (!clientId) {
    return new Response("Google sign-in is not configured (missing GOOGLE_OAUTH_CLIENT_ID).", {
      status: 500,
    });
  }

  const url = new URL(request.url);
  // Build the callback from the PUBLIC host (Vercel forwards it), not request.url
  // which is https://localhost on the serverless runtime.
  const redirectUri = `${publicOrigin(request)}/api/auth/callback`;
  const state = crypto.randomUUID();
  const returnTo = safeReturnTo(url.searchParams.get("returnTo"));

  // hd hints the org domain in the chooser; the callback still enforces the
  // server-side allowlist, so hd is a UX nicety, not the security boundary.
  const primaryDomain = (import.meta.env.ADMIN_ALLOWED_DOMAINS ?? "northvaleroofing.com")
    .split(",")[0]
    .trim()
    .replace(/^@/, "");

  const cookieOpts = {
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 600, // 10 min to complete the round-trip
  };
  cookies.set(STATE_COOKIE, state, cookieOpts);
  cookies.set(RETURN_COOKIE, returnTo, cookieOpts);

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "online",
    prompt: "select_account",
    ...(primaryDomain ? { hd: primaryDomain } : {}),
  });

  return redirect(`${GOOGLE_AUTH_URL}?${params.toString()}`, 302);
};
