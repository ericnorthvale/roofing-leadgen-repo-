# CLAUDE.md — Northvale Roofing

Lean operating guide for anyone (human or AI) working in this repo. Read this
before adding pages or content. Full plan: `PLAN.md`. Progress: `TASKS.md`.

## What this is

A local-roofing website + safe-to-scale SEO engine for the Houston metro.
Pages render **from data records**, never from name-swapped boilerplate.
Astro 5 (static) + Tailwind 4 on Vercel. pnpm + Node 20.

## Brand + NAP

- **Name:** Northvale Roofing · **Legal:** Northvale Roofing LLC
- **Domain:** northvaleroofing.com
- **NAP must be byte-for-byte identical everywhere.** Single source:
  `src/lib/brand.ts`. Never hardcode phone/address in a page or component.
- Current phone/address are placeholders (`(281) 000-0000`, blank address).
  Until the owner provides real ones, any page that depends on a real address
  for trust/schema stays `noindex` (the quality gate handles this).
- Voice: confident, premium, neighborly-expert. See `docs/brand-voice.md`.
  Positioning is "bold & premium" — sound established — but **only with true,
  defensible claims** (see Hard Rules).

## Hard rules (never break)

1. **No doorway pages.** Never create a page that differs from another only by a
   swapped city/neighborhood/service name. Every indexable page must contain
   substantial, real, page-specific content no other page already covers.
2. **Never fabricate a fact.** No invented addresses, phone numbers, project
   stories, statistics, counts ("500 roofs", "100+ times"), certifications, or
   reviews. Inventing reviews violates the FTC's 2024 rule and is illegal.
   Unknown data = a visible placeholder + a `NEEDS DATA` flag for a human.
3. **NAP identical** across every page (see above).
4. **Thin / data-incomplete pages render `noindex`** and are excluded from the
   sitemap until a human completes them. The quality gate enforces this.
5. **Never push to `main`.** All work on a branch → PR → human review on the
   Vercel preview.
6. **Never touch** DNS, domain settings, secrets, env vars, billing, or auth.
   If a task needs these, stop and tell the owner.
7. **Confirm before** any bulk delete / move / rename.

## Positioning: how to "look established" without lying

Allowed: confident premium voice; the operator's and crews' REAL experience
(once owner supplies numbers); strong warranties / written-estimate promise /
financing the company will honor; serving all 8 cities; true regional
climate/storm facts (sourced, e.g. NOAA); accurate certification _status_
(e.g. "GAF Master Elite applicant", not "GAF Master Elite" unless held).
Forbidden: fake reviews, invented specific numbers presented as fact, false
certs, fake address/GBP. When in doubt, flag it for the owner — don't invent.

## SEO standards

- Unique `<title>` + meta description per page (`buildSeo`, `src/lib/seo.ts`).
  Never reuse a templated title across pages.
- Explicit canonical on every page (handled by `buildSeo` / `BaseLayout`).
- JSON-LD: `RoofingContractor`/LocalBusiness sitewide (`BaseLayout`);
  `Service` + `areaServed` on service pages; `BreadcrumbList` via `Breadcrumbs`;
  `FAQPage` where there's real Q&A. Validate with Google's Rich Results Test.
- Images via the image wrapper with descriptive, specific `alt` text. Reusable
  image slots use `src/components/ImagePlaceholder.astro` — pass a real `src` to
  swap a slot's branded placeholder for a photo in one place (zero layout shift;
  the slot reserves its aspect ratio). `RoofImage` is the underlying `<img>`.
- **Demo images:** `src/lib/demo-images.ts` (`USE_DEMO_IMAGES`) fills every slot
  with royalty-free STOCK for preview only. Set it to `false` (or delete
  `public/placeholders/`) and replace with real Northvale photos before the real
  public launch — stock in before/after or "recent work" would violate Hard Rule
  #2 (FTC). See `TASKS_FOR_ERIC.md`.
- Internal links via `RelatedLinks` — relevant, not stuffed.
- Sitemap + robots auto-exclude `noindex` pages (`src/lib/routes.ts`). Don't
  add a page to the sitemap by hand.

## Data model + quality gate

- Locations: `src/lib/service-areas.ts`. Services: `src/lib/services.ts`.
  Each record has a `dataCompleteness` flag.
- `src/lib/quality-gate.ts` `isIndexable(record)` decides index vs. `noindex`.
  Pages pass their record's verdict into `buildSeo({ noindex })`.
- To publish a page: fill the record with real distinct content, set
  `dataCompleteness: "complete"`, and confirm NAP is real. Don't flip the flag
  on invented content.

## Review workflow

1. Branch (never `main`) → small, self-contained commits.
2. `pnpm build` (runs `astro check`) + `pnpm test` + `pnpm lint` must pass.
3. Open a **draft PR**; owners review the Vercel preview link.
4. Keep `PLAN.md` / `TASKS.md` current so progress survives a context reset.

## Commands

- `pnpm dev` — local server (http://localhost:4321)
- `pnpm build` — typecheck + build · `pnpm preview` — preview the build
- `pnpm test` — unit tests · `pnpm lint` — prettier + astro check
- `pnpm test:e2e` — Playwright · `pnpm lhci` — Lighthouse CI
