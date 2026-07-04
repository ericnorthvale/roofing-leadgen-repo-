# Storm window — operational runbook

> **The storm kit is an asymmetric bet: pre-build the assets NOW so that when hail hits
> Montgomery County you execute in hours, not days.** Storm response is a race — the
> contractors who reach homeowners first win the jobs. With two part-time owners, the only
> way to be fast is to have everything drafted and waiting. Build the "Pre-staged storm
> kit" below once; the timed checklist beneath it then becomes copy/paste, not compose.

## Pre-staged storm kit (build this now, before any storm)

- [ ] **Pre-drafted GBP post** — a ready-to-publish Google Business Profile update
      (same-day inspection, no door-knocking, no deductible games; leave a blank for the
      hail size + affected areas). Store it where both owners can grab it from a phone.
- [ ] **LSA / Google Search budget-bump procedure** — the exact steps + the temporary
      daily caps to raise to during a storm window, and the steady-state caps to revert to
      at T+72h. (Storm-period CPCs rise 3–5×; know the numbers in advance so you don't
      overspend the back half.)
- [ ] **Geo-targeted Meta creative** — one retargeting creative + copy, pre-approved,
      ready to point at the affected ZIPs (72h, ~$500/day).
- [ ] **Hail-map landing section** — a section/variant of `storm-response` that can show
      the affected ZIPs + a book-an-inspection CTA (the `Hero.astro` `storm` variant flag
      is the hook; pre-wire it so flipping it is a one-line change, not a build session).
- [ ] **Speed-to-lead confirmed live** — the auto-responder + missed-call text-back
      (`speed-to-lead.md`) must already be on; storm volume is exactly when a slow human
      response loses the job.

**Trigger:** any severe storm event in our service area (Harris + Montgomery counties, TX). Typical thresholds:

- **Hail:** ≥ 1" reported by NWS or Spotter Network in the service area.
- **Wind:** ≥ 60 mph sustained or gusts reported.
- **Tropical:** named storm within 300 miles of Houston.

## T-minus 6 hours (storm inbound)

- [ ] Pull NWS polygon into an ops-channel map. Identify likely hardest-hit ZIPs.
- [ ] Alert crew leads — set next-day field capacity to 100% inspection, 50% repair.
- [ ] Top-up tarp inventory. Crews pre-loaded with 4 tarps each.
- [ ] Turn on `storm-response` landing-page banner (`src/components/Hero.astro` has a `storm` variant — wire the flag).

## T+0 (storm over)

- [ ] Trigger a one-shot Meta retargeting campaign to prior site visitors in the affected ZIPs. Budget: $500/day for 72 hours.
- [ ] Resume-send a dormant email campaign to past homeowners in the affected ZIPs: "If you're seeing debris, book a free inspection."
- [ ] Post GBP update from the CEO account describing exactly what we're doing (same-day inspection, no door-knocking, no deductible games).

## T+24 hours

- [ ] Reconcile inbound leads against affected-ZIP list. Prioritize routing.
- [ ] Audit any inbound from numbers we've never heard from — suspicious-pattern analysis (scam callers, list-sellers).

## T+72 hours

- [ ] Cut daily ad spend back to steady-state. Storm-period CPCs rise 3-5x; don't overspend the back half.
- [ ] Write a 600-word blog post documenting what we saw (hail size, areas, repair trends). Publishes as `storm-damage` cluster; high evergreen value for future storm-season SEO.

## Things we **do not** do during a storm window

- Door-knocking. Ever.
- Outbound-cold to a purchased list of "storm-damaged addresses." Illegal under TCPA + skeevy.
- Discount/waive deductibles. Insurance fraud.
- Pressure-close a contract under time pressure. All contracts have the § 27.02 3-day rescission right by statute anyway; we honor it by default.
