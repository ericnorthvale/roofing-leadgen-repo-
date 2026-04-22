/**
 * Compliance shorthand referenced in docs/compliance.md. Kept as a code module
 * so the values that surface in footer/disclaimer copy come from one place.
 */

export const LEGAL = {
  consentDisclaimer:
    "By submitting this form you agree to receive calls, texts, and emails from Northvale Roofing at the number and address you provide, including automated messages. Consent is not a condition of purchase. Message and data rates may apply. Reply STOP to opt out. See our Privacy Policy and TCPA Notice.",
  smsDisclaimer:
    "Reply STOP to cancel SMS. Reply HELP for help. Message and data rates may apply. Message frequency varies.",
  emailFooterAddress: "",
  accessibilityContact:
    "Accessibility questions or requests: hello@northvaleroofing.com or call during business hours.",
  licenseLine:
    "Texas does not license residential roofing contractors. Northvale Roofing LLC is RCAT-certified and a GAF Master Elite applicant.",
  priorWrittenConsentCopy:
    "TCPA prior express written consent — Northvale Roofing uses automated systems to call and text the phone number you provide.",
} as const;

export const COMPLIANCE_STATUTE_REFS = [
  { code: "TCPA",    label: "Telephone Consumer Protection Act (47 U.S.C. § 227)" },
  { code: "CAN-SPAM", label: "CAN-SPAM Act (15 U.S.C. § 7701 et seq.)" },
  { code: "TDPSA",    label: "Texas Data Privacy and Security Act (Tex. Bus. & Com. Code ch. 541)" },
  { code: "§27.02",   label: "Tex. Bus. & Com. Code § 27.02 — door-to-door solicitation (insurance roof repair contracts)" },
  { code: "§701",     label: "Tex. Ins. Code § 701 — public adjuster prohibitions (we are a contractor, not a PA)" },
  { code: "§1102",    label: "Tex. Occ. Code § 1102 — home inspector licensing (referenced in inspector partnership docs)" },
] as const;
