/**
 * Every sentence the proposal can say that the rep did not say themselves.
 *
 * WHY A LIBRARY INSTEAD OF LETTING THE MODEL WRITE IT. The proposal goes out
 * on Northvale's letterhead to a homeowner who may later hold the company to
 * it. A model asked to "write a beautiful proposal" will, sooner or later,
 * produce a lifetime workmanship guarantee, a crew of twenty, or five hundred
 * roofs installed — none of it true, all of it in writing, over the owner's
 * name. That is Hard Rule #2, and for a review or a testimonial it is also an
 * FTC matter.
 *
 * So the prose is written once, here, and reviewed by a human. The assistant
 * chooses WHICH paragraphs apply; it never authors a claim. The result still
 * reads as a written document, because these are written sentences — they are
 * simply ones somebody stood behind before a customer ever saw them.
 *
 * THE SCOPE PROSE IS NOT HERE. Each line of work explains itself from the
 * `detail` field in estimate-items.ts, which already carries a real,
 * specific paragraph for all 38 items. Duplicating them here would create two
 * versions of the same sentence that drift apart.
 *
 * WHAT MAY GO IN THIS FILE: things true of every Northvale job, traceable to
 * src/data/business-info.json, docs/research-facts.md, or the site's own
 * published pages. WHAT MAY NOT: numbers, dates, counts, named certifications,
 * warranty terms or guarantees that are not in those sources. If a fact is
 * missing, the paragraph that needs it does not get written — it gets a
 * NEEDS DATA marker and the owner fills it in.
 */
import { BRAND } from "./brand";

/** A paragraph that only renders when the fact behind it exists. */
export interface ProposalSection {
  heading: string;
  body: string[];
}

/**
 * The opening. Deliberately short: a homeowner comparing three bids reads the
 * number first and the prose second, and a page of throat-clearing before the
 * scope is what makes a proposal feel like a brochure.
 */
export function openingParagraphs(customerName: string, propertyAddress: string): string[] {
  const who = customerName.trim() ? customerName.trim().split(/\s+/)[0] : "there";
  return [
    `${who}, thank you for having us out to ${propertyAddress.trim() || "your property"}.`,
    `What follows is exactly what we propose to do, what it costs, and what you are covered by afterwards. Everything in it was written down in front of you — ${BRAND.promise.toLowerCase().replace(/\.$/, "")}. If something here does not match what we discussed, say so before you sign anything.`,
  ];
}

/** Sits above the line items, explaining how to read them. */
export const SCOPE_INTRO =
  "Each item below is a part of the job, with what it covers and what it costs. Nothing is bundled into a single number you cannot inspect.";

/**
 * The warranty. The term comes from business-info.json and nowhere else.
 *
 * COVERAGE IS DELIBERATELY NOT SPELLED OUT. The owner gave a term, not a list
 * of what is and is not covered, and a warranty's exclusions are precisely the
 * part a customer will hold the company to. Writing a plausible list here
 * would be inventing the most consequential sentences in the document. When
 * the owner provides one, it goes in business-info.json and this paragraph
 * grows — not before.
 */
export function warrantySection(): ProposalSection | null {
  const term = (BRAND.warranties ?? "").trim();
  if (!term) return null;

  return {
    heading: "Your warranty",
    body: [
      `Northvale Roofing provides a ${term.toLowerCase()} on this installation. That covers our workmanship — the way the roof is put on — as distinct from the manufacturer's own cover on the materials themselves, which is registered in your name where the product allows it.`,
      "Two things are worth knowing about any roofing warranty, ours included: coverage generally assumes the roof was ventilated and installed to the manufacturer's specification, and some manufacturer coverage has to be registered after the work to take effect. We handle the registration and it is included.",
    ],
  };
}

/**
 * What the company is, in the only terms that are currently true.
 *
 * NOT A COMPANY HISTORY, because there are no verified numbers to tell one
 * with — no years in business, no job count, no named certification tier.
 *
 * BRAND.licenseNote IS DELIBERATELY NOT HERE (owner, 2026-11-28). It reads
 * "Texas does not license residential roofing contractors. Northvale Roofing
 * LLC is an IKO ROOFPRO applicant." True, and right for the website, where a
 * homeowner is researching. Wrong for a proposal: it opens by telling the
 * customer what the company is not, which reads as apology at the exact
 * moment they are deciding to sign. It stays on /warranty and /certifications.
 */
export function aboutSection(): ProposalSection {
  return {
    heading: "About this estimate",
    body: [
      "This proposal is an estimate of the work described above at the prices shown. If we open the roof and find something neither of us could see from the ground — rotten decking is the usual one — we will stop, show you, and agree the cost before carrying on. You will not find a change on the final invoice that you did not approve first.",
    ],
  };
}

/** Signature block labels. Not a contract — the owner's paperwork governs. */
export const ACCEPTANCE = {
  heading: "Accepting this proposal",
  // Carefully not "contract". This document prices work and records a scope;
  // what the owner has a customer sign is their own paperwork, and this must
  // not quietly become a substitute for it.
  body: "Signing below means you accept the scope and the pricing in this proposal and would like the work scheduled. It is not a payment authorisation.",
  customerLabel: "Customer signature",
  dateLabel: "Date",
  repLabel: "Northvale representative",
};

/** The standing footer. NAP comes from brand.ts — never retyped. */
export function footerLine(): string {
  const bits = [BRAND.legalName, BRAND.phoneDisplay, BRAND.email, BRAND.domain];
  return bits.filter(Boolean).join("  ·  ");
}

/**
 * Facts the document would be better for having, which nobody has supplied.
 *
 * Surfaced to the REP on screen, never printed on the customer's copy — a
 * homeowner should not read "NEEDS DATA", and a blank the rep can see is what
 * gets it filled in.
 */
export function missingFacts(): string[] {
  const missing: string[] = [];
  if (!(BRAND.warranties ?? "").trim()) {
    missing.push("workmanship warranty term — the proposal prints no warranty section without it");
  }
  if (!(BRAND.addressLine1 ?? "").trim()) {
    missing.push("street address — the footer shows phone and email only");
  }
  if (!(BRAND.financing ?? "").trim()) {
    missing.push("financing terms — no financing paragraph is printed");
  }
  return missing;
}
