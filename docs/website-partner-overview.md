# Northvale Roofing — Website & Tech Overview

*A quick walkthrough of where the website stands, how you can help keep it
current, and where we're taking it. Skim the headers — the detail is there if
you want it.*

---

The site is a fast, modern local-roofing website **plus** an SEO engine built to
expand across the Houston metro safely. It's built on Astro 5 + Tailwind and
hosted on Vercel, so it's static-fast, deploys automatically, and every change
gets a live preview link before it goes public. The whole thing is designed so
two non-technical owners can run it: routine edits happen in a web form, the
heavier SEO content is generated for us, and nothing we do can quietly break the
live site.

---

## 1. Where the website is today

**The foundation is built and solid.** Code-wise this is in good shape — it
builds clean, passes 115 automated tests, and meets Google's Lighthouse
performance/accessibility/SEO budgets. We're now in the "fill it with real
business data and turn on the plumbing" stage rather than the "build it" stage.

**What's live and visible to Google right now:**
- All **5 service pages** — roof replacement, repair, inspection, storm damage,
  insurance claims. Fully written, with FAQs and structured data.
- **The Woodlands** city page — our flagship, written with real local detail
  (climate/storm exposure, HOA & permit rules, village names, common roof types).
- Home, About, Contact, Reviews, Blog index, and the legal pages.

**What's intentionally hidden for now:** the other 7 cities (Houston, Spring,
Cypress, Kingwood, Tomball, Magnolia, Conroe) exist as draft pages but are set to
**"no-index"** — Google can't see them yet. This is deliberate. Google's recent
updates penalize sites that mass-produce near-identical "we do roofing in
[city]" pages. Our build has a **quality gate**: a city page only becomes visible
to Google once it has real, distinct local content. Until then it stays hidden
and out of the sitemap. It's a guardrail that lets us scale to all 8 cities
without ever tripping a spam penalty.

**What we worked on over the weekend:**
- **Visual layer & UX.** Added the image system (branded placeholders that swap
  to real photos with zero layout shift), trust badges, before/after sections,
  crew/truck strips, and an accessible mobile menu. The site now *looks* like a
  premium contractor, not a scaffold.
- **The admin panel.** Got the self-service editing panel working reliably in
  production, including Google sign-in. (More on this in section 2.)
- **The lead pipeline.** This was the big one. The website can now route every
  lead — from both the contact form and tracked phone calls — into our CRM
  (HighLevel) as a contact and a sales opportunity, fire an instant text + email
  alert to us, and send a conversion signal to Meta for ad tracking. It's fully
  built, tested, and merged. It's currently **dormant** — it switches on the
  moment we add the account keys (no more code needed).

**Honest caveats:** the photos you see today are licensed **stock** images for
design preview only — we must replace them with real Northvale job photos before
public launch (using stock in "our work" galleries would violate FTC rules). And
The Woodlands page would be stronger with a real completed project and a real
customer quote. None of that blocks the site technically; it's the kind of real
data only we can supply.

---

## 2. How to make updates (or send me feedback)

There are two paths, depending on what you're changing.

### Path A — Things you can edit yourself (no code, no waiting on me)

There's an admin panel at **`northvaleroofing.com/keystatic`**. You sign in with
your `@northvaleroofing.com` Google account and edit through a simple web form.
You can manage:
- **Business info** — phone, address, email, hours, certifications, experience,
  warranties, financing. This is the *single source of truth*: change it once and
  it updates everywhere on the site (header, footer, contact pages, and the data
  Google reads).
- **Reviews** — add real customer reviews. (Only genuine ones — inventing reviews
  is illegal under the FTC's 2024 rule, and the form reminds you.)

**How it stays safe:** when you save, it creates a tracked change and builds a
**preview link** in a minute or two. You check the preview; if it's good, it goes
live on the next deploy. If you don't like it, just edit again — or I can roll it
back cleanly. Nothing you do in the panel can break the live site, and bad data
gets caught before it ever publishes. (The walkthrough doc is
`docs/using-the-admin-panel.md`.)

> One-time setup note: the panel needs a quick Google sign-in setup completed
> first. Until that's done, I can show you the exact screens locally.

### Path B — Everything else: send it to me

The city and service SEO pages are written and maintained through Claude Code
(the AI dev tool I use) rather than the panel — that's so they stay genuinely
unique and tuned for search, and get a human review on a preview link before
going live. For these, **the best thing you can do is send me the raw facts**, and
I'll handle the rest.

When something needs changing, just send me:
1. **Which page** (a URL or "the Cypress page").
2. **What you want changed** in plain words ("this claim is wrong," "add that we
   do metal roofs," "the tone here feels off").
3. **Any real facts or photos** to back it up — neighborhoods we've worked in,
   a completed job, a real customer quote, certifications we actually hold.

I paste that straight into Claude Code, it makes the change on a branch, and you
get a preview link to approve before anything goes public. Text, email, a voice
memo — whatever's easiest for you. The more real, specific detail you give, the
better and the faster, because **the one rule we never break is: no made-up
facts.** No invented stats, certifications, addresses, or reviews. That
discipline is exactly what keeps us safe with Google and the FTC while still
sounding established — so when you're unsure, send me the real detail and let me
frame it.

---

## 3. Where we're headed (and why)

**Near term — turn on the engine and finish the flagship.**
- **Activate the lead pipeline.** Provision the HighLevel, CallRail, Meta, and
  GA4 accounts and drop their keys into Vercel. *Why:* the code is already built
  and waiting — this is the highest-leverage switch we can flip. It's the
  difference between leads landing in an inbox and leads flowing into a real CRM
  with instant alerts and full ad-tracking.
- **Finish The Woodlands.** Add a real project, photos, and a customer quote.
  *Why:* it becomes the quality template every other city is built against, and
  proves the model before we scale.
- **Swap in real photos.** Replace the stock preview images. *Why:* required
  before launch for FTC compliance, and real local photos are a genuine trust and
  local-SEO signal.

**Mid term — scale the cities, then automate the busywork.** Expand to the
remaining cities in small batches, each only published once it has real local
content (the quality gate enforces this). Then stand up automation (via n8n) for
the recurring work:
- **Revenue attribution** — tie every closed job back to the channel that
  produced the lead. *Why:* so ad spend isn't flying blind; we'll know cost-per-
  lead and revenue per channel.
- **Automatic monthly owner report** — pulls finances, leads, and traffic into
  one PDF. *Why:* a clear monthly picture without anyone assembling it by hand.
- **Review-request engine** — politely asks happy customers for a Google review
  after a job. *Why:* reviews are the single biggest local-SEO and trust lever.
- **Auto-pull job photos** (via CompanyCam) — fresh real photos onto the site
  with our approval. *Why:* keeps the site current without manual uploads.

**Later — connect the full business.** Bring in JobNimbus (job management) and
QuickBooks (accounting) so a lead can be traced all the way through to revenue,
and add the structure (lead routing, dashboards, security hardening) to support a
sales team as we grow. *Why:* this is what turns a website into an operating
system we can scale people onto.

**Rough cost:** the supporting tools run about **$330–500/month** at launch
(hosting, CRM, call tracking, email/SMS, etc.), scaling up later as we add job
management and more automation. Ad spend is separate.

---

## What I need from you

Short list to keep things moving:
1. **Real photos** of crew, trucks, and finished jobs — the single biggest unlock
   for going live.
2. **Any real Woodlands detail** — a completed job we can describe, and a genuine
   customer quote if we have one.
3. **A thumbs-up on provisioning the integration accounts** (HighLevel, etc.) so I
   can flip the lead pipeline on.

If you want to go deeper, the planning docs in the repo lay it all out:
`PLAN.md` (full strategy), `TASKS_FOR_ERIC.md` (the live to-do list),
`docs/using-the-admin-panel.md` (the editing walkthrough), and
`docs/automation-n8n-spec.md` (the automation roadmap).
