# Speed-to-lead — HighLevel automation runbook

> **Why this is the #1 operational priority.** Northvale is run by two part-time owners.
> A lead that waits on a busy person is a lead lost to a competitor — response-time studies
> put the drop-off in the _first five minutes_. The fix is automation, not discipline: the
> website + call pipeline already deliver the lead into HighLevel; these workflows make
> HighLevel respond instantly, every time, without anyone touching a phone. **These must be
> live before the first ad dollar is spent** (a paid lead that gets no fast response is
> money burned).

This is **HighLevel configuration, not code.** The site's job is done once a lead lands in
HighLevel as a contact + opportunity (built and dormant — see `docs/setup-highlevel.md`).
Everything below is set up inside the HighLevel account.

## Prerequisites

- HighLevel sub-account provisioned; keys in Vercel (`docs/setup-highlevel.md`).
- A dedicated business phone / LC Phone number in HighLevel for SMS.
- TCPA note: the website already captures consent + evidence on every form lead
  (`CONSENT_TEXT_VERSION`, timestamp, IP → HighLevel custom fields). Automated SMS to a
  lead who submitted the form with consent is compliant; keep an opt-out ("Reply STOP") in
  every message.

## Workflow 1 — Instant auto-responder SMS (< 60s, every form + call lead)

- **Trigger:** new contact created / inbound webhook (form lead via `/api/lead`, tracked
  call via `/api/callrail-webhook`).
- **Action:** immediate SMS from the business number, e.g.
  _"Hi {{contact.first_name}}, this is Northvale Roofing — thanks for reaching out. We got
  your request and a real person will call you shortly. Roof leaking right now? Call us at
  {{business phone}}. Reply STOP to opt out."_
- **Also:** internal notification to both owners (the site already fires SMS/email alerts
  via `notify.ts`; this is the belt-and-suspenders customer-facing side).
- **Goal:** the homeowner hears from "Northvale" within a minute, buying time before an
  owner can call back.

## Workflow 2 — Missed-call text-back

- **Trigger:** inbound call to the tracked/business number that is **not answered**.
- **Action:** auto-SMS within seconds:
  _"Sorry we missed your call — this is Northvale Roofing. What's going on with your roof?
  Text us here and we'll get right back to you. Reply STOP to opt out."_
- **Why:** an unanswered call otherwise bounces straight to the next contractor. This
  converts the miss into a text thread. Highest-ROI single automation for part-time owners.

## Workflow 3 — Lead-qualification fields → nurture tracks

Add these custom fields (capture on the form where possible, else on first contact) so
different lead types get different follow-up:

- **Job type:** retail vs. insurance claim (drives entirely different sales motions).
- **Roof age** and **timeline** (emergency / weeks / just researching).

Branch the nurture: insurance-claim leads get the claims-process track; retail gets the
estimate track; "just researching" gets the slow educational track.

## Workflow 4 — Follow-up + recycle cadences (don't let leads die)

- **No-answer cadence:** attempt contact, then automated SMS/email nudges; after **3 no-
  answers**, drop into a **90-day nurture** (monthly value touch) rather than marking dead.
- **Quote-follow-up sequence:** after an estimate is sent, a timed sequence (day 1, 3, 7, 14) — **20–30% of signable jobs are lost to post-estimate silence**, so this directly
  recovers revenue.

## Acceptance test (before turning ads on)

- [ ] Submit a real test form lead → confirm the auto-responder SMS arrives in < 60s.
- [ ] Place a test call to the tracked number and let it ring out → confirm the missed-call
      text-back fires.
- [ ] Confirm `lead_source` + qualification fields populate on the HighLevel contact.
- [ ] Confirm every automated message contains a working opt-out.

Once these pass, speed-to-lead is live and the first ad dollar can be spent. Automating
these workflows further (lead scoring, an AI SMS responder) is a later scale-phase layer —
the manual-branch versions above are enough to launch.
