# Launch checklist — Northvale Roofing

Run through before flipping northvaleroofing.com public. Each row either ships or explicitly explains why it's punted.

## Brand + legal

- [ ] `Northvale Roofing LLC` registered with TX SOS.
- [ ] USPTO TEAS 1(b) ITU application filed (IC 037).
- [x] Domain purchased at Squarespace Domains (2026-04-23); DNS managed there, records pointed to Vercel.
- [ ] SSL certificate issued (Vercel automatic).

## Site

- [ ] `PUBLIC_SITE_URL` set in Vercel to `https://northvaleroofing.com`.
- [ ] All eight service-area (city) pages render — complete ones indexable, drafts `noindex` + NEEDS-DATA per the quality gate.
- [ ] All five service pages render with unique content.
- [ ] `/blog` has at least 3 published posts (not drafts).
- [ ] `/reviews` pulls from live Google Business Profile.
- [ ] 404, thank-you, and storm-response pages render.
- [ ] Lighthouse CI passes on mobile throttle: a11y/best-practices/SEO ≥ 0.95, performance ≥ 0.90, and Google "good" CWV (LCP ≤ 2500ms, TBT ≤ 200ms, CLS ≤ 0.10).
- [ ] Broken-link check (linkinator) passes.
- [ ] Sitemap + robots.txt live; `/thank-you` disallowed.

## Analytics + tracking

- [ ] GA4 property live; `PUBLIC_GA4_ID` set.
- [ ] Server-side GTM container live; `PUBLIC_GTM_ID` set.
- [ ] Meta pixel + CAPI token wired and firing.
- [ ] CallRail tracking numbers + DNI swap tested.
- [ ] CallRail webhook signature secret rotated + set in Vercel env.
- [ ] Google Ads conversion tag linked; offline conversion import working.

## Forms + CRM

- [ ] `/api/lead` POSTs to HighLevel successfully (test with real contact).
- [ ] HighLevel location configured with nurture workflows (see HighLevel runbook).
- [ ] TCPA consent checkbox language matches `src/lib/legal.ts::LEGAL.consentDisclaimer`.
- [ ] Honeypot field blocks synthetic bot submissions (confirmed in log review).

## Compliance

- [ ] Privacy + Terms + TCPA + Accessibility pages reviewed by counsel.
- [ ] Consent disclaimer includes: caller ID, purpose, automated systems, opt-out path.
- [ ] Email templates include physical address + unsubscribe link.
- [ ] Internal training: no deductible waiver language, no door-knocking, no PA-impersonation.
- [ ] `weekly-compliance.yml` workflow green for 2 consecutive runs.

## Paid channels

- [ ] Google Ads brand campaign live (pause-ready).
- [ ] Meta conversion campaign on hold for 14 days post-launch (need event volume first).
- [ ] Nextdoor / Yelp profiles claimed and filled.

## Day-of-launch

- [ ] DNS cut live.
- [ ] Smoke test all 20+ pages on mobile + desktop.
- [ ] Submit root URL to Google Search Console + Bing Webmaster Tools.
- [ ] Post launch announcement on GBP.
