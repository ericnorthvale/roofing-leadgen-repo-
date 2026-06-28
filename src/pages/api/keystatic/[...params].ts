import type { APIRoute } from "astro";
import { makeHandler } from "@keystatic/astro/api";
import config from "../../../../keystatic.config";
import { publicOrigin } from "~/lib/site-url";

export const prerender = false;

/**
 * Custom Keystatic API route that shadows the one `@keystatic/astro` injects.
 *
 * Why: Keystatic builds its GitHub OAuth `redirect_uri` from
 * `new URL(request.url).origin` (see `githubLogin` in @keystatic/core), but on
 * Vercel's serverless runtime `request.url` is `https://localhost/…`. That makes
 * Keystatic send `redirect_uri=https://localhost/api/keystatic/github/oauth/callback`,
 * which no GitHub App callback can match. We rebuild the request with the REAL
 * public origin (from `x-forwarded-host`, same fix as our own auth) before handing
 * off to Keystatic's handler. File-based routes take precedence over injected ones,
 * so this replaces the default route at the same path.
 */
const handler = makeHandler({ config });

const withRealHost: APIRoute = (context) => {
  const original = new URL(context.request.url);
  const fixedUrl = `${publicOrigin(context.request)}${original.pathname}${original.search}`;
  const request = new Request(fixedUrl, context.request);
  return handler({ ...context, request } as typeof context);
};

export const ALL = withRealHost;
export const all = withRealHost;
