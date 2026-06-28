import { defineMiddleware } from "astro:middleware";
import { parseUtmFromUrl, hasAnyUtm } from "~/lib/utm";
import { checkAdminAccess, isAdminPath } from "~/lib/admin-auth";

/**
 * Runs on every request. Two jobs:
 *  1. Gate the /keystatic admin panel behind Google Workspace SSO (fail-closed).
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
    const access = checkAdminAccess({
      headers: context.request.headers,
      env: {
        ADMIN_ALLOWED_DOMAINS: import.meta.env.ADMIN_ALLOWED_DOMAINS,
        ADMIN_ALLOWED_EMAILS: import.meta.env.ADMIN_ALLOWED_EMAILS,
      },
      isDev: import.meta.env.DEV,
    });
    if (!access.allowed) {
      return new Response(
        `<!doctype html><meta charset="utf-8"><title>Admin — sign-in required</title>` +
          `<div style="font-family:system-ui;max-width:32rem;margin:4rem auto;padding:0 1rem">` +
          `<h1>Sign-in required</h1><p>The Northvale admin panel is restricted to ` +
          `authorized Northvale Roofing accounts. Reach it through your Google Workspace ` +
          `sign-in. If you're seeing this after signing in, your account isn't on the allow list.</p>` +
          `<p style="color:#888;font-size:.85rem">(${access.reason})</p></div>`,
        { status: 403, headers: { "content-type": "text/html; charset=utf-8" } },
      );
    }
  }

  // 2. UTM capture.
  const utm = parseUtmFromUrl(url);
  if (hasAnyUtm(utm)) {
    context.locals.utm = utm;
  }

  return next();
});
