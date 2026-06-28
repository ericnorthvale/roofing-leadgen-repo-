# TASKS.md — progress tracker

Source of truth for build progress. Update after every batch/PR.

## Phase 0 — Audit

- [x] Stack / routing / SEO / risks audit
- [x] PLAN.md + TASKS.md + owner decisions

## Phase 1 — Foundation / SEO harness

- [x] PLAN.md, TASKS.md, root CLAUDE.md
- [x] Data model: 8-city `service-areas.ts` with rich fields + `dataCompleteness`
- [x] Data model: `services.ts` (5 services as records, content migrated)
- [x] Quality gate: `src/lib/quality-gate.ts` (`evaluateArea` / `evaluateService`)
- [x] SEO helpers: `serviceJsonLd` (Service + areaServed) + `faqPageJsonLd`
- [x] Components: `Faq`, `RelatedLinks`, `RoofImage` (image/alt wrapper)
- [x] `[area].astro` + service pages render from data model + gate (noindex when incomplete)
- [x] Programmatic sitemap excludes noindex/gate-failing pages (`routes.ts`)
- [x] HTML sitemap page (`/sitemap`)
- [x] GA4 confirmed + Search Console manual step documented (`docs/analytics-search-console.md`)
- [x] Scrub invented facts → confident-but-true / flagged placeholders
- [x] Validate: build + 15 unit tests + lint pass; open draft PR

## Phase 2 — Flagship city: The Woodlands (needs owner real data)

- [ ] City hub page (real local data, photos, trust signals)
- [ ] Core service-in-city pages
- [ ] Full schema + breadcrumbs + internal links + fast mobile CWV
- [ ] Validate → PR → pause for preview review

## Phase 3 — Gated expansion (batches of 5–20)

- [ ] (per batch) build real-data pages; noindex drafts for the rest
- [ ] (per batch) build + gate + schema + link check + fresh reviewer subagent
- [ ] (per batch) update this file

## Owner to-dos (unblocks indexable pages)

- [ ] Real NAP: business phone + physical address (replaces `(281) 000-0000`, blank address)
- [ ] Real cert status (RCAT / GAF Master Elite — held vs. applicant)
- [ ] Operator/crew real experience (years, rough project scale) for "established" copy
- [ ] Real photos (owner's prior work OK if rights confirmed + labeled)
- [ ] GA4 measurement ID + (optional) GTM container ID in Vercel env
- [ ] Search Console verification (manual — see CLAUDE.md)
