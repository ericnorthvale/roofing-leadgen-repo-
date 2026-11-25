// @ts-check
import { defineConfig, envField } from "astro/config";
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import keystatic from "@keystatic/astro";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";
import { isAllowedInSitemap, canonicalPath } from "./src/lib/routes";
import { contentLastmod } from "./scripts/sitemap-lastmod.mjs";

// Keep SITE in one place. Eric will set PUBLIC_SITE_URL in Vercel env after domain purchase.
const SITE = process.env.PUBLIC_SITE_URL || "https://northvaleroofing.com";

/** Real content dates for the sitemap; built once at config load. */
const LASTMOD = contentLastmod();

/**
 * Keystatic, but WITHOUT its injected `/api/keystatic/[...params]` route — we
 * provide our own at `src/pages/api/keystatic/[...params].ts` that rebuilds the
 * request with the real public host. Keystatic derives its GitHub OAuth
 * `redirect_uri` from `request.url`, which Vercel reports as `https://localhost`,
 * so the default route sends an unusable `redirect_uri=https://localhost/...`.
 * Letting Keystatic inject its API route too would collide with ours (a hard
 * error in newer Astro), so we filter just that one injection and keep the rest
 * (the UI route, the virtual:keystatic-config vite plugin, etc.).
 */
function keystaticWithHostFix() {
  const inner = keystatic();
  const hooks = inner.hooks ?? {};
  const setup = hooks["astro:config:setup"];
  return {
    name: "keystatic-hostfix",
    hooks: {
      ...hooks,
      "astro:config:setup": async (/** @type {any} */ args) => {
        if (typeof setup !== "function") return;
        await setup({
          ...args,
          injectRoute: (/** @type {any} */ route) => {
            if (route.pattern === "/api/keystatic/[...params]") return;
            args.injectRoute(route);
          },
        });
      },
    },
  };
}

export default defineConfig({
  site: SITE,
  output: "static",
  /**
   * CSRF: Astro's built-in origin check is replaced by an equivalent one in
   * src/pages/api/lead.ts — it is NOT simply switched off.
   *
   * WHY (reported live, 2026-11-16: the contact form answered "cross-site
   * submissions not allowed" and every submission was rejected). Astro's
   * `security.checkOrigin` compares the browser's `Origin` header against the
   * origin of `request.url`. On Vercel's serverless runtime `request.url` is
   * the function's INTERNAL address — `https://localhost/…` — not the host the
   * visitor is on. src/lib/site-url.ts already documents this quirk, because
   * the Google OAuth redirect hit the same thing.
   *
   * So the comparison was Origin `https://northvaleroofing.com` against
   * `https://localhost`, which can never match: the check rejected every real
   * submission while stopping nothing. Leads were being lost at the door.
   *
   * The replacement compares `Origin` against `publicOrigin(request)`, which
   * derives the true public host from `x-forwarded-host`. That restores the
   * protection, correctly, and additionally tolerates the site being reached
   * on more than one valid host (apex, www, Vercel preview URLs) — each
   * request is checked against the host it actually arrived on.
   *
   * /api/lead is the ONLY endpoint that accepts form-encoded POSTs, which is
   * all `checkOrigin` ever applied to; the JSON webhooks were never in scope.
   */
  security: { checkOrigin: false },
  // Permanent redirects for renamed content (preserve link equity + avoid 404s).
  redirects: {
    // Renamed when the site standardized on IKO (was a TAMKO-vs-GAF comparison).
    "/blog/tamko-titan-xt-vs-gaf-timberline-hdz": {
      status: 301,
      destination: "/blog/iko-dynasty-vs-nordic",
    },
    // TEMPORARY (302, owner request 2026-08-01): the reviews page is parked
    // until the first real reviews exist. Restore src/pages/reviews.astro from
    // git history and delete this redirect when they land. The page was
    // noindex + sitemap-excluded, so this costs no SEO.
    "/reviews": { status: 302, destination: "/" },
    // TEMPORARY (302, owner request 2026-08-01): certifications page parked —
    // restore src/pages/certifications.astro + its header/footer links and
    // drop this redirect when ROOFPRO status is worth showing.
    "/certifications": { status: 302, destination: "/about" },
  },
  adapter: vercel({
    webAnalytics: { enabled: false }, // we use GA4 + server-side GTM, not Vercel Analytics
    imageService: true,
    isr: {
      // content pages (blog, neighborhood, services) regenerate hourly when traffic hits
      expiration: 60 * 60,
      // NEVER ISR-cache dynamic routes. The /api endpoints and the Keystatic admin
      // set per-request cookies and must run fresh every time — caching them shares
      // one user's CSRF `state`/session across everyone and outright breaks the
      // OAuth callback (it gets unique code/state query params each call). Only the
      // static content pages get ISR.
      exclude: [/^\/api\//, /^\/keystatic/],
    },
  }),
  integrations: [
    mdx(),
    react(),
    keystaticWithHostFix(),
    sitemap({
      // Quality gate: pages failing the gate (noindex) are auto-excluded.
      filter: (page) => isAllowedInSitemap(page),
      // Astro emits every URL in `directory` form (trailing slash). Most pages
      // canonicalize without one, so left alone the sitemap submits addresses
      // the pages disown — see canonicalPath() in src/lib/routes.ts.
      serialize: (item) => {
        const url = new URL(item.url);
        url.pathname = canonicalPath(url.pathname);
        // A real date where the content carries one, and NO date otherwise.
        // Stamping today on all 68 URLs every deploy (which is what this used
        // to do) teaches Google the field is noise — see scripts/sitemap-lastmod.mjs.
        const lastmod = LASTMOD.get(url.pathname);
        const { lastmod: _dropped, ...rest } = item;
        return lastmod ? { ...rest, url: url.href, lastmod } : { ...rest, url: url.href };
      },
      changefreq: "weekly",
      priority: 0.7,
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  experimental: {
    clientPrerender: true,
    contentIntellisense: true,
  },
  env: {
    schema: {
      // Server-only secrets — set in Vercel env, never in client bundle.
      ANTHROPIC_API_KEY: envField.string({ context: "server", access: "secret", optional: true }),
      OPENAI_API_KEY: envField.string({ context: "server", access: "secret", optional: true }),
      HIGHLEVEL_API_KEY: envField.string({ context: "server", access: "secret", optional: true }),
      HIGHLEVEL_LOCATION_ID: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
      // Optional — when both are set, each lead also creates a pipeline opportunity.
      HIGHLEVEL_PIPELINE_ID: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
      HIGHLEVEL_PIPELINE_STAGE_ID: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
      CALLRAIL_API_KEY: envField.string({ context: "server", access: "secret", optional: true }),
      CALLRAIL_ACCOUNT_ID: envField.string({ context: "server", access: "secret", optional: true }),
      GOOGLE_MAPS_API_KEY: envField.string({ context: "server", access: "secret", optional: true }),
      // Rooftop geocoding for the roof tool. MUST be a separate key with NO
      // referrer restriction — Google rejects referrer-restricted keys on the
      // Geocoding API. Server-only; never ship it to the browser.
      // Free Mapillary token — optional street-level property photo for the
      // roof report (CC-BY-SA, credited). Without it the report uses the
      // public-domain USGS aerial instead.
      MAPILLARY_TOKEN: envField.string({ context: "server", access: "secret", optional: true }),
      GOOGLE_GEOCODING_API_KEY: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
      GOOGLE_PLACES_API_KEY: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
      GOOGLE_PLACE_ID: envField.string({ context: "server", access: "secret", optional: true }),
      COMPANYCAM_API_KEY: envField.string({ context: "server", access: "secret", optional: true }),
      META_CAPI_TOKEN: envField.string({ context: "server", access: "secret", optional: true }),
      // Lead-persistence safety net — auto-injected by Vercel when a private
      // Blob store is connected to the project. See src/lib/lead-store.ts.
      BLOB_READ_WRITE_TOKEN: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
      // Shared code for the crew estimator (/estimator). NEVER commit a value —
      // set it in Vercel. Unset = the estimator route 404s. Session cookies for
      // it are signed with ADMIN_SESSION_SECRET; see src/lib/estimator-auth.ts.
      ESTIMATOR_PIN: envField.string({ context: "server", access: "secret", optional: true }),
      // Lead alerts (SMS via Twilio + email via Resend). Day-one safety net — see docs/setup-leads.md.
      TWILIO_ACCOUNT_SID: envField.string({ context: "server", access: "secret", optional: true }),
      TWILIO_AUTH_TOKEN: envField.string({ context: "server", access: "secret", optional: true }),
      TWILIO_FROM: envField.string({ context: "server", access: "secret", optional: true }),
      LEAD_ALERT_SMS_TO: envField.string({ context: "server", access: "secret", optional: true }),
      RESEND_API_KEY: envField.string({ context: "server", access: "secret", optional: true }),
      LEAD_ALERT_EMAIL_TO: envField.string({ context: "server", access: "secret", optional: true }),
      LEAD_ALERT_EMAIL_FROM: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
      // Google Apps Script Web App that appends each lead to the owner's
      // spreadsheet. Secret in the sense that matters: anyone holding the URL
      // can append rows. See docs/setup-leads.md.
      LEADS_SHEET_WEBHOOK_URL: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
      // Admin panel access (in-app Google sign-in) — see docs/setup-admin-panel.md.
      ADMIN_ALLOWED_DOMAINS: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
      ADMIN_ALLOWED_EMAILS: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
      GOOGLE_OAUTH_CLIENT_ID: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
      GOOGLE_OAUTH_CLIENT_SECRET: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
      ADMIN_SESSION_SECRET: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
      META_PIXEL_ID: envField.string({ context: "server", access: "public", optional: true }),
      GOOGLE_ADS_CONVERSION_ID: envField.string({
        context: "server",
        access: "public",
        optional: true,
      }),
      // Per-action conversion label (the part after the slash in AW-XXX/label).
      // Both must be set for /thank-you to fire the Ads conversion event.
      GOOGLE_ADS_CONVERSION_LABEL: envField.string({
        context: "server",
        access: "public",
        optional: true,
      }),
      // Public config
      PUBLIC_SITE_URL: envField.string({ context: "client", access: "public", default: SITE }),
      PUBLIC_GA4_ID: envField.string({ context: "client", access: "public", optional: true }),
      PUBLIC_GTM_ID: envField.string({ context: "client", access: "public", optional: true }),
      // Google Search Console HTML-tag verification token (no DNS needed).
      PUBLIC_GSC_VERIFICATION: envField.string({
        context: "client",
        access: "public",
        optional: true,
      }),
      PUBLIC_CALLRAIL_COMPANY_ID: envField.string({
        context: "client",
        access: "public",
        optional: true,
      }),
      PUBLIC_BRAND_NAME: envField.string({
        context: "client",
        access: "public",
        default: "Northvale Roofing",
      }),
      // Keystatic GitHub mode — the App slug is generated by the setup wizard and
      // must be readable client-side. The setup flag flips dev into GitHub mode so
      // that wizard appears (see keystatic.config.ts + docs/setup-admin-panel.md).
      PUBLIC_KEYSTATIC_GITHUB_APP_SLUG: envField.string({
        context: "client",
        access: "public",
        optional: true,
      }),
      PUBLIC_KEYSTATIC_GITHUB_SETUP: envField.string({
        context: "client",
        access: "public",
        optional: true,
      }),
    },
  },
});
