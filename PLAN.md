# PLAN.md — Northvale Roofing SEO Engine

## Why this exists
We are building a fast, trustworthy local-roofing website for the Houston metro
plus an SEO engine that can **scale safely**. The thing we are deliberately
avoiding is the doorway-page / scaled-content-abuse pattern that Google's
2025–2026 spam and core updates penalize (mass near-identical city/service
pages). We build the SYSTEM to scale, but we **gate publishing on real,
page-specific value**: a page only gets indexed when it carries substantial,
distinct, true local content.

This repo was already a well-built Astro scaffold. This plan hardens its SEO
foundation, replaces name-swapped boilerplate + invented facts with a real,
gated data model, and proves quality on one flagship city before any scaled
expansion.

## Owner decisions (locked)
- **Service areas (8):** Houston, Spring, Cypress, The Woodlands, Kingwood,
  Tomball, Magnolia, Conroe.
- **Flagship city (Phase 2):** The Woodlands.
- **Positioning:** "Bold & premium" — read like an established premium
  contractor, but the Hard Rules below override "fake it." No fabricated
  reviews, stats, certifications, or address. Unknown specifics become a visible
  placeholder + a `NEEDS DATA` flag, never invented.
- **Service pages:** converted into a data model (records, not hardcoded copy).

## Phases

### Phase 0 — Audit (done)
Findings are in git history / the team plan. Stack: Astro 5 static + Tailwind 4
on Vercel, pnpm/Node 20, CI with Lighthouse budgets. Solid SEO base (canonical,
LocalBusiness + Breadcrumb JSON-LD, sitemap/robots). Gaps: no rich data model,
no quality gate, no Service/FAQ schema, sitemap doesn't exclude noindex pages,
doorway-shaped city boilerplate, and some invented facts already in copy.

### Phase 1 — Foundation / SEO harness (this PR; builds the system, not new pages)
1. Root `CLAUDE.md` — brand/NAP, hard rules, SEO standards, review workflow.
2. **Data model** — `src/lib/service-areas.ts` (8 cities, rich fields,
   `dataCompleteness`) + new `src/lib/services.ts` (the 5 services as records).
3. **Quality gate** — `src/lib/quality-gate.ts` `isIndexable(record)`: a page is
   indexable only when `dataCompleteness === "complete"`, NAP is real, and the
   required distinct fields are present; otherwise it renders `noindex`.
4. **SEO helpers + components** — `serviceJsonLd` (Service + areaServed) and
   `faqPageJsonLd` in `src/lib/seo.ts`; `Faq`, `RelatedLinks`, and an
   image/alt wrapper component.
5. **Programmatic sitemap + robots** — sitemap auto-excludes any `noindex` /
   gate-failing page (single source of truth in `src/lib/routes.ts`). Add an
   HTML sitemap page.
6. **GA4 + Search Console** — GA4 is already wired (needs the ID); document the
   manual Search Console verification step (no DNS changes by Claude).
7. **Scrub invented facts** — replace fabricated specifics with confident-but-
   true framing or a flagged placeholder.
8. Validate: build passes, JSON-LD validates, Lighthouse healthy, links OK. PR.

> Effect of the gate in Phase 1: city pages that still lack real, distinct local
> data render `noindex` and drop out of the sitemap until Phase 2/3 fills them
> with real content. This is intentional and safe — thin pages should not be
> indexed. Service pages stay indexable once their copy is scrubbed.

### Phase 2 — Flagship city: The Woodlands (needs owner's real data)
City hub + core service-in-city pages, each genuinely unique and locally
specific, with real photos, trust signals, full schema, breadcrumbs, internal
links, fast mobile CWV. This becomes the quality template. PR → pause for
preview review.

### Phase 3 — Gated expansion
City by city / neighborhood by neighborhood, in small batches (5–20 pages).
Only build pages with real, distinct data; data-less pages are `noindex`
"NEEDS REAL DATA" drafts. After each batch: build + quality gate + schema
validation + broken-link check, then a fresh reviewer subagent checks the batch
against this plan and the Phase-2 bar. Update TASKS.md every batch.

## Hard rules (also in CLAUDE.md — never break)
- No page that differs only by a swapped city/neighborhood/service name. Every
  indexable page carries substantial, real, page-specific content.
- Never fabricate any fact (addresses, phones, projects, stats, certs, reviews).
  Unknown = visible placeholder + flag for a human.
- NAP (name, address, phone) byte-for-byte identical on every page.
- Thin / data-incomplete pages render `noindex` and are excluded from the sitemap.
- Never push to `main`. All work via PR against a Vercel preview.
- Never modify DNS, domain settings, secrets, env vars, billing, or auth. Stop
  and ask if a task seems to need these.
- Confirm before any bulk delete/move/rename.
