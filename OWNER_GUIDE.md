# Owner Guide — running Northvale Roofing's website

Plain-English manual for Eric & Greg. No code. If you can use a web form and
Google, you can run this site. Detailed setup steps live in `docs/` (linked below).

---

## 1. How we operate the site (the big picture)

Think of it as **edit → preview → publish**:

1. You change something (in the admin panel, or by asking Claude).
2. That creates a **preview link** — a private copy of the site with your change.
3. You look at the preview. If it's right, it goes **live**; if not, we fix it first.

You never touch code or servers. Two ways to make changes:

- **Admin panel** (you, self-serve) — a web form at **`/keystatic`** for the things
  you'll change often (business info, photos, reviews).
- **Ask Claude** — for new pages, SEO content, design, or anything bigger. You give
  the facts; Claude writes it and sends a preview.

Who does what: **Greg/Eric** = business facts, photos, reviews, approvals.
**Claude** = builds pages, SEO, automation, and keeps the lights on.

---

## 2. How I see leads

The moment someone submits the website form, you get an **instant text and email**
with their name, phone, address, service, and where they came from — so you can
call within seconds. (Speed wins roofing jobs.)

- Turn it on: `docs/setup-leads.md` (create Twilio + Resend, paste keys into Vercel).
- This works **even before** your CRM is connected — no lead is ever lost.
- Once **HighLevel** (your CRM) is connected, every lead also lands there with a
  pipeline, automatic follow-up texts, and review requests. See the CRM hygiene SOP
  (`docs/sops/crm-hygiene.md`) — the one rule that matters is setting **Lead Source**
  on every lead so you know which marketing is working.

---

## 3. How I see traffic & click-path (and feed it back to Claude)

- **Google Analytics (GA4)** shows visitors, where they came from, and the path they
  take through the site. Setup: `docs/analytics-search-console.md`.
- For a simple at-a-glance view, we'll set up a **one-page dashboard** (Looker Studio)
  and an **auto-export into your Google Drive**.
- **To get my help improving the site:** drop the dashboard/export (or a screenshot)
  into the shared Drive folder and tell me. I read the numbers and propose the next
  improvements — a continuous loop.

---

## 4. How I update content (pages, photos, reviews)

- **Reviews & photos & business info:** do it yourself in the admin panel (`/keystatic`).
  Add **real** reviews (never invent — it's illegal and hurts SEO); upload photos;
  edit your hours, etc.
- **New blog posts / city pages / service pages:** ask Claude. These are SEO craft —
  you give the local facts and photos, Claude writes pages that can actually rank, and
  the **quality gate** keeps thin/incomplete pages out of Google until they're real.
- Admin panel setup: `docs/setup-admin-panel.md`.

---

## 5. How I update copy (the words on the site)

- **Business facts** (phone, address, hours, experience, certifications, warranties,
  financing) → edit in the admin panel under **Business Info**. This is the single
  source of truth — change it once and it updates everywhere, identically.
- **Headlines, page wording, taglines** → ask Claude (these live in the page templates).
  Describe the change in plain English; you'll get a preview link.

---

## How to give me your real info (NAP, certs, experience, photos)

The fastest path: open the admin panel → **Business Info**, and fill in:

- **Phone & address** (your real NAP — replaces the current placeholders)
- **Experience** (a TRUE statement, e.g. "Crews with 20+ years across Houston")
- **Certification status** (only what's held or applied for — e.g. "GAF Master Elite applicant")
- **Warranties** and **financing** you actually offer

Photos: upload in the panel, or connect **CompanyCam** so real job photos flow in
automatically (`docs/setup-integrations.md`).

> Why the guardrails: we deliberately never fabricate facts, reviews, or certs.
> It's how we make you look established **without** getting penalized by Google or
> the FTC. See the hard rules in `CLAUDE.md`.

---

## What needs you (accounts to set up — I give click-by-click, never touch secrets)

See the full checklist in `TASKS.md`. The short list, in order:

1. **Real NAP** (phone + address) in the admin panel.
2. **Lead alerts** — Twilio + Resend (`docs/setup-leads.md`).
3. **HighLevel** — your CRM/automation hub.
4. **Admin panel sign-in** — Google + GitHub apps (`docs/setup-admin-panel.md`).
5. **Analytics** — GA4 + Search Console (`docs/analytics-search-console.md`).
6. **Photos/Reviews** — CompanyCam + Google Places (`docs/setup-integrations.md`).
7. Later: **JobNimbus** (jobs) and **n8n** (automation), when you're closing jobs.

---

## The rest of the operating system

- **How the business runs** (sales, supplements, onboarding, reviews): `docs/sops/`
- **Why we decided things** (so it's not stuck in chat): `docs/decision-log.md`
- **Approvals from Eric**: `docs/major-decision-request-template.md`
- **The full plan & roadmap**: `PLAN.md` · progress in `TASKS.md`
