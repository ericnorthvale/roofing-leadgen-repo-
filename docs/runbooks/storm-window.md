# Storm window — operational runbook

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
