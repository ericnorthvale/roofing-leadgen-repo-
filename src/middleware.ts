import { defineMiddleware } from "astro:middleware";
import { parseUtmFromUrl, hasAnyUtm } from "~/lib/utm";

/**
 * Captures UTMs + edge geo into Astro.locals so pages and form handlers can
 * surface them without re-parsing. Runs on every request including SSR
 * endpoints (API routes).
 */
export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);
  const utm = parseUtmFromUrl(url);

  if (hasAnyUtm(utm)) {
    context.locals.utm = utm;
  }

  // Vercel forwards geo via these headers; values are undefined locally.
  const headers = context.request.headers;
  const city = headers.get("x-vercel-ip-city");
  const region = headers.get("x-vercel-ip-country-region");
  const country = headers.get("x-vercel-ip-country");
  const zip = headers.get("x-vercel-ip-postal-code");

  if (city || region || country || zip) {
    context.locals.geo = {
      city: city ? decodeURIComponent(city) : undefined,
      region: region ?? undefined,
      country: country ?? undefined,
      zip: zip ?? undefined,
    };
  }

  return next();
});
