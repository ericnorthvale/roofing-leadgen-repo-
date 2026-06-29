# STATUS — Northvale Roofing scaffold

## Phase 1: initial scaffold (this branch)

Scaffold mirrored from `ebleck55/bleck-deal-engine@claude/roofing-lead-engine-plan-wPc6X` (the `roofing-leadgen/` subtree) into this repo's root, then extended.

### What shipped

- Astro 5 + Tailwind 4 + TypeScript strict.
- Vercel hybrid adapter + ISR.
- Locked brand voice (see `docs/brand-voice.md`).
- Six neighborhood pages via dynamic route (`src/pages/[area].astro`).
- Five persona landing pages via dynamic route (`src/pages/for-[persona].astro`).
- Five service pages (replacement, repair, inspection, storm, insurance).
- Home, about, contact, thank-you, reviews, storm-response, 404.
- Blog index + detail with draft/published gate.
- Four legal pages (privacy, terms, TCPA, accessibility).
- Lead API (`/api/lead`) with HighLevel push + honeypot + UTM persistence.
- CallRail webhook endpoint with HMAC-SHA1 signature verification.
- Middleware capturing UTMs + Vercel edge geo.
- Lib modules: brand, service-areas, personas, phone, utm, seo, analytics, highlevel, callrail, legal.
- Content collections: blog (MDX), neighborhoods (MD), reviews (JSON) — all with draft gating.
- GitHub Actions: CI, content pipeline, nightly E2E, weekly compliance.
- Lighthouse CI config @ mobile throttle, 0.95 across all four categories.
- Prettier, Playwright, Vitest configs + starter tests.

### What's stubbed (intentional — real humans required)

- HighLevel Private Integration token not yet issued.
- CallRail webhook secret not yet rotated.
- GA4 + GTM IDs not yet provisioned.
- Google Places pull for `/reviews` not yet wired.
- Content pipeline scripts (`src/scripts/*`) are planned, not implemented.
- Lead magnet PDFs are planned, not produced.
- LLC + USPTO filings pending — see `docs/trademark-clearance.md`.

## Visual layer (PR #13, merged to `main`)

Pre-launch design pass that took the site from image-free to visually credible,
plus the conversion/UX fixes that didn't depend on photography.

### What shipped

- `ImagePlaceholder.astro` — reusable swap primitive: renders a branded,
  aspect-ratio-reserving placeholder by default; pass `src` for a real photo, or
  `demoKey` for a preview stock photo. Single place to swap each image, no CLS.
- Accessible **mobile nav** (no-JS `<details>` menu in `SiteHeader`) — fixes a
  launch blocker (nav was hidden on phones with no fallback).
- `TrustBadges.astro` (true-claim chips + GAF/BBB/financing logo placeholders),
  `BeforeAfter.astro` band, crew/truck strips, service-card thumbnails, the
  Woodlands "recent work" gallery, and a split hero with an image slot.
- `Resources.astro` + `src/lib/resources.ts` — curated, non-competitive external
  links (GAF, IBHS, NWS, TX Dept. of Insurance, This Old House); link-only.
- Copy/typo fixes: homepage Neighborhoods card (removed wrong Cypress/DFW names),
  `data-cta-phone`.

### Demo images (must be removed before launch)

- `src/lib/demo-images.ts` (`USE_DEMO_IMAGES = true`) fills every slot with
  royalty-free Pexels stock (`public/placeholders/`, provenance in `CREDITS.md`)
  so the design can be evaluated pre-photography. **Set `false` + swap real
  photos before public launch** — stock as before/after or "recent work" is an
  FTC/Hard-Rule-#2 problem. Tracked in `TASKS_FOR_ERIC.md`.
- One-time exception: PR #13 was merged directly to `main` by explicit owner
  authorization so the site could be viewed at the public production Vercel URL
  (previews are SSO-gated). Normal rule remains: branch → PR → review.

### Next phase

See `TASKS_FOR_ERIC.md` for the ordered list of open asks.
