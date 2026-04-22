# Compliance checklist — Northvale Roofing

**Purpose:** a single reference for the federal + Texas-specific legal constraints every page, every form, every outbound message must respect. Re-read before shipping anything marketing-facing.

> Code-level enforcement lives in `src/lib/legal.ts` (the phrasing homeowners see) and `.github/workflows/weekly-compliance.yml` (which greps the built site for banned phrases).

## 1. TCPA — Telephone Consumer Protection Act (47 U.S.C. § 227)

- **Prior express written consent** required for autodialed/pre-recorded calls or texts to a cell phone for marketing purposes. Our lead form checkbox is the source of that consent; disclaimer text lives in `src/lib/legal.ts::LEGAL.consentDisclaimer`.
- **Revocation** — honor STOP immediately. CallRail + HighLevel both respect STOP; verify quarterly.
- **Do-Not-Call registry** — our CRM (HighLevel) scrubs against the federal DNC on import; we do not purchase outbound call lists.
- **Documentation** — retain consent proof for 5 years. HighLevel stores the form submission record with IP + timestamp.

## 2. CAN-SPAM (15 U.S.C. § 7701)

- Clear sender identity in the From: line.
- Non-deceptive subject lines.
- Our physical address in every marketing email.
- One-click unsubscribe, honored within 10 business days (HighLevel default is immediate).
- No harvested email lists, no open-relay sending.

## 3. TDPSA — Texas Data Privacy and Security Act (Tex. Bus. & Com. Code ch. 541)

- Public-facing privacy policy (`/legal/privacy`) enumerating: categories of data collected, purposes, retention, sharing partners, and rights.
- Consumer rights: confirm, access, correct, delete, opt out of targeted advertising / sale / profiling.
- Response window: 45 days (extendable by 45 more with notice).
- No data sale, no data broker sharing — our privacy policy explicitly states this, do not change without counsel.

## 4. Tex. Bus. & Com. Code § 27.02 — residential roof repair contracts

- If a contract is signed at the consumer's home after an insurable weather event, consumer has a 3-day rescission right.
- We disclose this right on `/legal/tcpa` and in any storm-period sales materials.
- **We do not door-knock.** This eliminates the § 27.02 trigger scenario for our own reps.

## 5. Tex. Ins. Code § 4102 / § 701 — public adjusters

- Only a licensed public adjuster can negotiate a claim on a consumer's behalf.
- We are a contractor. We can: document loss, provide Xactimate-aligned scopes, attend adjuster inspections.
- We cannot: negotiate settlement amounts, sign claim documents on the homeowner's behalf, or imply we represent them in the claim dispute.

## 6. Tex. Occ. Code § 1102 — home inspectors

- TREC licenses home inspectors. We do not perform TREC-defined home inspections for real estate transactions — we do roof-specific inspections (not the same scope).
- No pay-to-refer arrangements with inspectors that could be construed as kickbacks.

## 7. Deductible waivers — insurance fraud

- **Never** offer to waive, absorb, pay, or discount a deductible. Tex. Ins. Code § 541.062 makes this a third-degree felony.
- Any employee or subcontractor overheard offering this is immediately terminated. Documented in onboarding + employment contract.

## 8. Advertising claims

- No "best roofer in [city]" without a specific cited award + year.
- No "hail-proof" claims — all shingles are rated impact-resistant (UL 2218 Class 4) at most; "proof" is actionable.
- No fake scarcity, fake countdown timers, fake "limited spots" language.
- No manipulated review screenshots. All review surfaces pull from verified sources (Google Places, BBB, direct-input with reviewer permission).

## Ship checklist (copy of docs/brand-voice.md §30-second test, plus:)

- [ ] Any claim about materials is accurate to the manufacturer spec.
- [ ] Any claim about price/timing is "typical" or "starting at" with a written-estimate caveat.
- [ ] All lead-capture forms include consent checkbox + our consent disclaimer text.
- [ ] Every marketing email includes physical address + unsubscribe.
- [ ] Every SMS campaign tags as transactional, promotional, or informational correctly in HighLevel.
