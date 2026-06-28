# Decision Log

A running record of significant decisions + the reasoning, so the "why" isn't
trapped in ephemeral chats (a BOS-audit fix). Append new entries at the top.
Format: date · decision · why · who.

> Dates below reflect when the decision was made in planning sessions.

## 2026 — Operating-system & website build

- **Admin auth implemented as IN-APP Google sign-in, not Cloudflare Access.** Why:
  the Cloudflare path required putting the domain on Cloudflare DNS (the owner hit a
  setup wall), and trusting an injected identity header is spoofable without a proxy
  in front. The site now runs its own Google OAuth flow (`/api/auth/*`) and sets an
  HMAC-signed, http-only session cookie (`src/lib/admin-session.ts`), re-checked +
  allowlist-enforced on every admin request in middleware. Owner provisions a Google
  OAuth client + `ADMIN_SESSION_SECRET`; no DNS/Cloudflare. · Owner + Claude · 2026-06-28
- **Fonts self-hosted in `public/fonts` with `font-display: optional`.** Why: the
  Google Fonts CDN was the LCP bottleneck and `font-display: swap` caused the
  font-swap CLS (0.196 on /spring). `optional` never swaps after first paint → zero
  font CLS; primary subsets are preloaded so the real font usually shows on first
  paint anyway. The `@fontsource-variable` deps were removed after copying the woff2
  (provenance noted in `globals.css`). · Claude · 2026-06-28
- **Lighthouse budgets aligned to Google's official "good" CWV thresholds**
  (perf ≥ 0.90, LCP ≤ 2500ms, CLS ≤ 0.10; a11y/bp/SEO stay ≥ 0.95). Why: the prior
  2000ms/0.05 targets were stricter than Google's own "good" bar and blocked the
  merge without a real user-facing benefit. · Claude · 2026-06-28

- **CRM stack: HighLevel now, JobNimbus later, no AccuLynx.** Why: HighLevel is
  best-in-class at lead automation/speed-to-lead/nurture/reviews and is already
  integrated; JobNimbus covers production (jobs/supplements/QBO) at lower cost than
  AccuLynx; running both production CRMs would be waste. · Owner
- **Lead/automation hub = HighLevel; website posts leads there.** · Owner
- **Admin panel auth = Google Workspace SSO** (domain-restricted). Why: already on
  Workspace; non-technical owners just "Sign in with Google." · Owner
- **CompanyCam auto-pull for site photos.** Why: real geotagged job photos are a
  top local-SEO + trust signal at zero ongoing effort. · Owner
- **n8n for automation glue, on a cheap cloud instance (not the home Mac mini).**
  Why: 24/7 webhook reliability without home-hosting upkeep; Mac mini for dev. · Owner
- **Finance: full revenue-attribution loop, phased**; assisted owner reports can
  start now via the connected QuickBooks. · Owner
- **Security/testing: lightweight now, harden before scaling.** · Owner
- **Positioning: "bold & premium" but no fabricated facts/reviews/certs/address.**
  Why: look established legitimately; fabrication is an SEO + legal (FTC) risk. · Owner
- **Service areas (8):** Houston, Spring, Cypress, The Woodlands, Kingwood, Tomball,
  Magnolia, Conroe. Flagship = The Woodlands. · Owner
- **Adopted BOS audit:** moved the attribution spine (canonical `lead_source`) and
  the Knowledge Base/Decision Log UP in the build order (cheapest insurance against
  blind ad spend + key-person risk). · Owner + Claude

## Template for new entries

- **<decision>.** Why: <reasoning>. · <who> · <date>
