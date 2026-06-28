# Northvale website — master setup runbook

Do these in order. Each step says **what it unlocks**, **what you need**, and links
the detailed guide. Rule: **you create accounts and paste keys; Claude never touches
your secrets, DNS, or billing.** All keys go in **Vercel → Project → Settings →
Environment Variables**, then redeploy.

> You can launch the site and collect leads after Steps 1–3. The rest improves
> tracking, automation, and self-service over time.

---

## Step 1 — Real business details (NAP) · 5 min

- **Unlocks:** accurate phone/address everywhere; lets city pages become eligible to
  rank (they stay hidden from Google until your real phone + address are in).
- **You need:** your business **phone** and **physical address**, hours, founded year,
  and your true experience/cert lines.
- **How:** enter them in the admin panel → Business Info (`using-the-admin-panel.md`).
  Or, before the panel is set up, send them to Claude.

## Step 2 — Hosting basics (already live) · —

- **Unlocks:** the site itself (Vercel) — already deployed from GitHub.
- **You need:** nothing now. (Optional: set `PUBLIC_SITE_URL` once the domain is final.)

## Step 3 — Lead alerts (see every lead instantly) · 20 min

- **Unlocks:** instant **text + email** on every form submission — before any CRM.
- **You need:** a **Twilio** account (buy 1 local number; copy Account SID + Auth Token)
  and a **Resend** account (1 API key). Plus the cell number(s)/email(s) to alert.
- **How:** `setup-leads.md`. Env: `TWILIO_*`, `LEAD_ALERT_SMS_TO`, `RESEND_API_KEY`,
  `LEAD_ALERT_EMAIL_TO/FROM`.

## Step 4 — Analytics & Search Console · 20 min

- **Unlocks:** traffic, sources, click-path, and Google indexing visibility.
- **You need:** a **Google Analytics (GA4)** property (Measurement ID `G-…`) and a
  **Search Console** property (HTML-tag token). Both via your Google account — no DNS.
- **How:** `analytics-search-console.md`. Env: `PUBLIC_GA4_ID`, optional `PUBLIC_GTM_ID`,
  `PUBLIC_GSC_VERIFICATION`.

## Step 5 — HighLevel (your CRM + automation hub) · 30–60 min

- **Unlocks:** every lead in one place, instant auto-follow-up, nurture, review requests,
  lead routing as you add sales reps.
- **You need:** a **HighLevel** account; create a Private Integration → **API key** +
  **Location ID**. (Set up your pipeline stages per `sops/crm-hygiene.md`.)
- **How:** Env: `HIGHLEVEL_API_KEY`, `HIGHLEVEL_LOCATION_ID`. (Website already posts leads here.)

## Step 6 — Admin panel sign-in · 30–45 min

- **Unlocks:** you/Greg editing Business Info, reviews, photos yourselves.
- **You need:** (a) **Cloudflare Access** in front of the site with **Google** as the
  identity provider (Google Workspace SSO); (b) a **Keystatic GitHub app** (3 values).
- **How:** `setup-admin-panel.md` then `using-the-admin-panel.md`. Env:
  `KEYSTATIC_GITHUB_CLIENT_ID/SECRET`, `KEYSTATIC_SECRET`, optional `ADMIN_ALLOWED_DOMAINS/EMAILS`.

## Step 7 — Photos & live reviews · 30 min

- **Unlocks:** real job photos on the site + live Google reviews on /reviews.
- **You need:** a **CompanyCam** API token; a **Google Places API key** + your **Place ID**
  (claim your Google Business Profile first).
- **How:** `setup-integrations.md`. Env: `COMPANYCAM_API_KEY`, `GOOGLE_PLACES_API_KEY`,
  `GOOGLE_PLACE_ID`.

## Step 8 — Marketing channels (your launch plan) · ongoing

- **Unlocks:** paid lead flow (Local Services Ads, Google Ads, Facebook) + the local pack.
- **You need:** a verified **Google Business Profile**, **Local Services Ads** verification,
  ad accounts. Use the canonical UTM scheme so attribution works (`utm-scheme.md`).

## Step 9 — Later: production CRM + automation

- **JobNimbus** when you start closing jobs (job management, QuickBooks sync).
- **n8n** on a cheap cloud instance for the revenue-attribution loop + auto owner
  reports (`automation-n8n-spec.md`).

---

### Quick reference: every env var

See `.env.example` for the full annotated list. Everything is optional — each feature
turns on only when its keys are present, so you can do these steps in any order you like
(this order is just the fastest path to live leads).
