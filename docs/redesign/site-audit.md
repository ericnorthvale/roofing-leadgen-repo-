# Visual Reskin — Current-Site Audit

Date: 2026-07-29 · Audited at `main` @ `4b1b225` (production commit)

## Architecture summary

- **Framework:** Astro 5 + Tailwind 4 (`@theme` tokens in `src/styles/globals.css`), TypeScript, pnpm, Vercel (hybrid: static + ISR, SSR for `/api/*` and `/keystatic`).
- **Design tokens already centralized** in `globals.css` `@theme`: navy/gold/ink scales, serif+sans font stacks (self-hosted variable fonts, `font-display: optional` — zero-CLS strategy), `--radius-card`, `--radius-pill`, `--shadow-card(-hover)`, `--spacing-section`, `--container-prose`. This is the reskin's main lever.
- **Page generation is layout-driven:** individual pages are thin wrappers.
  - Layouts: `BaseLayout` (SEO/JSON-LD/fonts/GTM), `ServiceLayout`, `CityServiceLayout`, `NeighborhoodLayout`, `NeighborhoodPageLayout`, `BlogLayout`, `LegalLayout`.
  - Dynamic templates: `[area].astro`, `[area]/[child].astro`, `projects/[slug].astro`, `blog/[...slug].astro`, `for-[persona].astro`.
  - Data: `service-areas.ts`, `services.ts`, `neighborhoods.ts`, `city-services.ts`, quality gate → `noindex`.
- **Shared components (global reach):** `SiteHeader`, `SiteFooter`, `Hero`, `TrustBar`, `TrustBadges`, `ServiceCard`, `Reviews`, `BeforeAfter`, `Faq`, `LeadForm`, `PhoneCTAButton`, `CTAButton`, `Breadcrumbs`, `RelatedLinks`, `TableOfContents`, `ImagePlaceholder`/`RoofImage` (image system), `MobileClickToCall` (sticky bar), `PhotoGallery`, `Resources`, `ComplianceNotice`, design-center islands (React).
- **Interactive/JS:** design-center React islands, no-JS `<details>` mobile menu + FAQ accordions, inline UTM/event scripts, GTM/GA4 via BaseLayout. **None of these are touched by the reskin.**
- **Forms:** `LeadForm` (+ configurator form) → POST `/api/lead`; hidden utm/eventId fields; honeypot; consent line (`LEGAL.consentDisclaimer`). Locked.
- **Integrations that must remain untouched:** `/api/lead`, `/api/callrail-webhook`, HighLevel, Meta CAPI, lead-store, notify, GTM snippets, phone tokens from `brand.ts`/`business-info.json`.

## Styling patterns observed

- Consistent: tokens via `var(--color-*)`, `.btn/.btn-primary/.btn-ghost`, `.prose-northvale`, card pattern (`rounded-[var(--radius-card)] border navy-100 bg-white shadow-card`).
- Duplicated/inconsistent (reskin targets): section paddings hardcoded per page (`py-12/16`); one inline style on the homepage dark-band ghost button; card/pill radii mixed on chips vs cards.
- Global vs local: header/footer/hero/trustbar/cards/buttons are global — restyling them + tokens covers the vast majority of every generated page.

## Must-not-touch inventory (verified untouched by phase 1)

- URLs/slugs/redirects/sitemap/robots (`routes.ts`), `buildSeo`/canonicals/JSON-LD (`seo.ts`, `BaseLayout` head), quality gate, content collections, GTM/GA4/CallRail/HighLevel code paths, form fields/labels/actions, all written copy, image alt text, `brand.ts` NAP tokens.

## Existing accessibility/perf baseline (to preserve)

- Global `:focus-visible` gold ring; `prefers-reduced-motion` kill-switch; WCAG tap-target 48px buttons; self-hosted fonts, preloaded; aspect-ratio-reserving image slots (zero CLS); Astro zero-JS default.
