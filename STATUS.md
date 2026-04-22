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

### Next phase
See `TASKS_FOR_ERIC.md` for the ordered list of open asks.
