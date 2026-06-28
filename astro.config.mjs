// @ts-check
import { defineConfig, envField } from "astro/config";
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";
import { isAllowedInSitemap } from "./src/lib/routes";

// Keep SITE in one place. Eric will set PUBLIC_SITE_URL in Vercel env after domain purchase.
const SITE = process.env.PUBLIC_SITE_URL || "https://northvaleroofing.com";

export default defineConfig({
  site: SITE,
  output: "static",
  adapter: vercel({
    webAnalytics: { enabled: false }, // we use GA4 + server-side GTM, not Vercel Analytics
    imageService: true,
    isr: {
      // content pages (blog, neighborhood, services) regenerate hourly when traffic hits
      expiration: 60 * 60,
    },
  }),
  integrations: [
    mdx(),
    sitemap({
      // Quality gate: pages failing the gate (noindex) are auto-excluded.
      filter: (page) => isAllowedInSitemap(page),
      changefreq: "weekly",
      priority: 0.7,
      lastmod: new Date(),
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
      CALLRAIL_API_KEY: envField.string({ context: "server", access: "secret", optional: true }),
      CALLRAIL_ACCOUNT_ID: envField.string({ context: "server", access: "secret", optional: true }),
      GOOGLE_MAPS_API_KEY: envField.string({ context: "server", access: "secret", optional: true }),
      GOOGLE_PLACES_API_KEY: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
      GOOGLE_PLACE_ID: envField.string({ context: "server", access: "secret", optional: true }),
      META_CAPI_TOKEN: envField.string({ context: "server", access: "secret", optional: true }),
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
      META_PIXEL_ID: envField.string({ context: "server", access: "public", optional: true }),
      GOOGLE_ADS_CONVERSION_ID: envField.string({
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
    },
  },
});
