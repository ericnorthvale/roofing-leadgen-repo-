# SOP: Sales Process (Lead → Close)

**Why:** a repeatable close motion so any rep performs like the best rep.

## Steps

1. **Speed-to-lead.** Contact every new lead within [NEEDS INPUT: target, e.g. 5 min].
   Instant SMS/email alerts already fire (see `docs/setup-leads.md`); the rep calls.
2. **Qualify.** Storm/insurance vs. retail? Roof age, address, insurer if claim.
   Set `lead_source` + service type in HighLevel (see crm-hygiene SOP).
3. **Book the free inspection** (same-day where possible). Move card to _Inspection booked_.
4. **Inspect + document.** Forty-photo packet via CompanyCam. Identify damage; for
   storm, capture hail/wind indicators (see insurance-supplement SOP).
5. **Written estimate before leaving the driveway.** Use the approved estimate
   template. [NEEDS INPUT: per-square pricing by material — never quote outside the sheet.]
6. **Present + handle objections.** Lead with warranty, written estimate, financing
   ([NEEDS INPUT: GreenSky/SunLight terms once live]). No deductible-waiver talk — illegal.
7. **Close.** Signed contract (HB 2102-compliant, with 3-day rescission). Move to _Won_.
8. **Handoff to production** (JobNimbus once live) carrying `lead_source` + the packet.

## Standards

- Every stage change is logged in the pipeline in real time.
- No fabricated urgency, no fabricated claims (brand voice + hard rules).
- Lost deals get a reason code. [NEEDS INPUT: reason-code list.]
