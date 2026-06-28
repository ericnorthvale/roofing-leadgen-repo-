# Northvale Operating Knowledge Base (SOPs)

This is the durable home for **how Northvale runs** — so operational knowledge
lives in a system, not in one person's head. It directly addresses the BOS-audit
finding that our biggest risk is key-person concentration + context trapped in
chat.

## How this works

- **Source of truth = these files (git).** Version-controlled, reviewable, and
  maintainable by Claude. Mirror/link them into Google Workspace (Drive or a
  Google Site) for easy owner/rep access — but edit the canonical copy here (or
  via the admin panel once D2 ships).
- **`[NEEDS INPUT: …]`** marks a real fact only the owner/operator can supply
  (pricing, sub names, exact terms). Never invent these — fill them in.
- Each SOP is a **checklist + standard**, not prose. If a step isn't followed
  the same way every time, it belongs here.

## Index

| SOP                                                                    | Purpose                                                              | Primary owner               |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------- | --------------------------- |
| [crm-hygiene.md](./crm-hygiene.md)                                     | Lead Source + pipeline + data-entry standard (the attribution spine) | GM / Sales                  |
| [sales-process.md](./sales-process.md)                                 | Lead → inspection → estimate → close                                 | Sales                       |
| [insurance-supplement-workflow.md](./insurance-supplement-workflow.md) | Claim → adjuster → supplement → approval                             | Production / GM             |
| [subcontractor-onboarding.md](./subcontractor-onboarding.md)           | Vetting + COIs + DWC-083 + agreement                                 | GM / Production Coordinator |
| [rep-onboarding.md](./rep-onboarding.md)                               | §3508 reps + canvassers onboarding                                   | Sales Manager               |
| [review-request.md](./review-request.md)                               | Post-job review generation (real reviews only)                       | Production Coordinator      |

Governance: [../decision-log.md](../decision-log.md) ·
[../major-decision-request-template.md](../major-decision-request-template.md)

## Maintenance

When a process changes, update its SOP in the same PR. New recurring process =
new SOP. Claude can draft any SOP from a short description — review before adopting.
