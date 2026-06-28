import { defineMiddleware } from "astro:middleware";
import { parseUtmFromUrl, hasAnyUtm } from "~/lib/utm";
import { evaluateEmailAccess, isAdminPath } from "~/lib/admin-auth";
import { verifySessionToken, SESSION_COOKIE } from "~/lib/admin-session";

/**
 * Runs on every request. Two jobs:
 *  1. Gate the /keystatic admin panel behind the in-app Google sign-in
 *     (fail-closed): verify the signed session cookie, then the allowlist.
 *  2. Capture UTMs into Astro.locals for pages + the lead handler.
 *
 * Geo headers (x-vercel-ip-*) are read inside SSR endpoints (e.g. /api/lead)
 * rather than here — accessing request.headers during prerender warns at build,
 * and geo is only meaningful at request time anyway.
 */
export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);

  // 1. Admin gate — only the SSR /keystatic routes hit this at request time.
  if (isAdminPath(url.pathname)) {
    // Local dev uses Keystatic local mode — no sign-in needed on your own machine.
    if (!import.meta.env.DEV) {
      const secret = import.meta.env.ADMIN_SESSION_SECRET ?? "";
      const nowSeconds = Math.floor(Date.now() / 1000);
      const session = await verifySessionToken(
        context.cookies.get(SESSION_COOKIE)?.value,
        secret,
        nowSeconds,
      );

      // No valid session → send them through Google sign-in, returning here after.
      if (!session) {
        const loginUrl = new URL("/api/auth/login", url.origin);
        loginUrl.searchParams.set("returnTo", url.pathname + url.search);
        return context.redirect(loginUrl.pathname + loginUrl.search, 302);
      }

      // Valid session but allowlist may have changed since sign-in — re-check.
      const access = evaluateEmailAccess(session.email, {
        ADMIN_ALLOWED_DOMAINS: import.meta.env.ADMIN_ALLOWED_DOMAINS,
        ADMIN_ALLOWED_EMAILS: import.meta.env.ADMIN_ALLOWED_EMAILS,
      });
      if (!access.allowed) {
        return new Response(
          `<!doctype html><meta charset="utf-8"><title>Admin — not authorized</title>` +
            `<div style="font-family:system-ui;max-width:32rem;margin:4rem auto;padding:0 1rem">` +
            `<h1>Not authorized</h1><p><strong>${session.email}</strong> is signed in but is not on ` +
            `the Northvale admin allow list. Ask an owner to add your account, or ` +
            `<a href="/api/auth/logout">sign in with a different account</a>.</p>` +
            `<p style="color:#888;font-size:.85rem">(${access.reason})</p></div>`,
          { status: 403, headers: { "content-type": "text/html; charset=utf-8" } },
        );
      }
    }
  }

  // 2. UTM capture.
  const utm = parseUtmFromUrl(url);
  if (hasAnyUtm(utm)) {
    context.locals.utm = utm;
  }

  return next();
});
