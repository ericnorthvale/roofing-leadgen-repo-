import { defineMiddleware } from "astro:middleware";
import { parseUtmFromUrl, hasAnyUtm } from "~/lib/utm";

/**
 * Captures UTMs from the request URL into Astro.locals so pages and form
 * handlers can surface them without re-parsing. Runs on every request.
 *
 * Geo headers (x-vercel-ip-*) are read inside SSR endpoints (e.g. /api/lead)
 * rather than here — accessing request.headers during prerender emits a
 * build-time warning, and geo is only meaningful at request time anyway.
 */
export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);
  const utm = parseUtmFromUrl(url);

  if (hasAnyUtm(utm)) {
    context.locals.utm = utm;
  }

  return next();
});
