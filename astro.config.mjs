// @ts-check
import { defineConfig, envField } from "astro/config";
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";

// Keep SITE in one place. Eric will set PUBLIC_SITE_URL in Vercel env after domain purchase.
const SITE = process.env.PUBLIC_SITE_URL || "https://northvaleroofing.com";

export default defineConfig({
  site: SITE,
  output: "hybrid",
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
      filter: (page) => !page.includes("/draft/") && !page.includes("/_"),
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
      HIGHLEVEL_LOCATION_ID: envField.string({ context: "server", access: "secret", optional: true }),
      CALLRAIL_API_KEY: envField.string({ context: "server", access: "secret", optional: true }),
      CALLRAIL_ACCOUNT_ID: envField.string({ context: "server", access: "secret", optional: true }),
      GOOGLE_MAPS_API_KEY: envField.string({ context: "server", access: "secret", optional: true }),
      GOOGLE_PLACES_API_KEY: envField.string({ context: "server", access: "secret", optional: true }),
      GOOGLE_PLACE_ID: envField.string({ context: "server", access: "secret", optional: true }),
      META_CAPI_TOKEN: envField.string({ context: "server", access: "secret", optional: true }),
      META_PIXEL_ID: envField.string({ context: "server", access: "public", optional: true }),
      GOOGLE_ADS_CONVERSION_ID: envField.string({ context: "server", access: "public", optional: true }),
      // Public config
      PUBLIC_SITE_URL: envField.string({ context: "client", access: "public", default: SITE }),
      PUBLIC_GA4_ID: envField.string({ context: "client", access: "public", optional: true }),
      PUBLIC_GTM_ID: envField.string({ context: "client", access: "public", optional: true }),
      PUBLIC_CALLRAIL_COMPANY_ID: envField.string({ context: "client", access: "public", optional: true }),
      PUBLIC_BRAND_NAME: envField.string({ context: "client", access: "public", default: "Northvale Roofing" }),
    },
  },
});
