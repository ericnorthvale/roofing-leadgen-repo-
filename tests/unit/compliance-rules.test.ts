import { describe, it, expect } from "vitest";
import { findViolations, htmlToText, sentenceAround } from "~/lib/compliance-rules";

/**
 * Banned-phrase rules for the weekly compliance scan. Two invariants:
 *
 * 1. Violating (offer-shaped) copy IS flagged.
 * 2. The site's REAL educational copy is NOT flagged as a violation — the
 *    "legit" strings below are verbatim sentences from live pages, so a rule
 *    change that starts flagging the compliance content itself fails here
 *    before it ever pages anyone from CI.
 */

const violations = (text: string) => findViolations(text, "test").filter((f) => !f.exempt);

describe("violating copy is flagged", () => {
  it.each([
    ["we'll waive your deductible — call today!", "deductible-offer"],
    ["We cover your deductible on every insurance job.", "deductible-offer"],
    ["Northvale will absorb the deductible for you.", "deductible-offer"],
    ["Deductible waived when you sign this week.", "deductible-offer-passive"],
    ["Zero deductible out of pocket!", "deductible-offer-passive"],
    ["Our Class 4 shingles are hail-proof.", "hail-proof"],
    ["The best roofing company in The Woodlands.", "uncited-best"],
    ["Only 3 spots left this month!", "fake-scarcity"],
    ["Limited time offer on roof replacements.", "fake-scarcity"],
    ["You may qualify for a FREE ROOF through insurance.", "free-roof"],
  ])("%s → %s", (text, ruleId) => {
    const found = violations(text);
    expect(found.length).toBeGreaterThan(0);
    expect(found.map((f) => f.ruleId)).toContain(ruleId);
  });
});

describe("real educational copy from the live site is NOT flagged", () => {
  it.each([
    // src/pages/storm-response.astro
    "We will not waive or absorb your deductible. Texas law requires you to pay it.",
    // src/pages/about.astro
    "We don't waive deductibles. It's insurance fraud — not a gray area.",
    // src/pages/process.astro
    "the legal lines stay bright: we never touch your deductible and never negotiate your claim.",
    // src/content/blog/storm-damage-what-to-do.md
    "Never accept a \"we'll waive your deductible\" offer. That's insurance fraud in Texas.",
    // src/content/blog/do-insurance-companies-cover-hail-damage-texas.md (heading)
    '"We\'ll eat your deductible" is a crime in Texas.',
    // src/pages/index.astro FAQ — third-party description, not an offer
    "A roofer offered to cover my deductible. Is that legal? No. Texas Insurance Code §707.002 requires policyholders to pay their deductible.",
    // src/lib/city-services.ts — third-party description
    "Texas made it illegal for contractors to pay, waive, or absorb your deductible.",
    // src/lib/services.ts FAQ
    "Can you waive my deductible? No. Texas Insurance Code §707.002 requires policyholders to pay their deductible.",
    // src/pages/storm-response.astro + src/pages/team.astro — anti-scam pledge
    "No pressure, no door-knocking, no deductible games.",
    "No door-knocking, no pressure signings, no deductible games — ever.",
    // hypothetical future educational copy
    "No shingle is hail-proof — Class 4 means impact-resistant, not indestructible.",
  ])("%s", (text) => {
    expect(violations(text)).toEqual([]);
  });

  it("does not flag the legitimate free-inspection offer", () => {
    expect(violations("Book a free roof inspection today — no obligation.")).toEqual([]);
    expect(violations("Hi — I'd like to book a free roof inspection.")).toEqual([]);
  });

  it("does not flag ordinary deductible education", () => {
    expect(
      violations("Under Texas law you must actually pay that deductible before funds release."),
    ).toEqual([]);
    expect(violations("Check whether wind/hail carries its own separate deductible.")).toEqual([]);
  });

  it("marks educational matches as exempt rather than dropping them silently", () => {
    const all = findViolations("We will not waive or absorb your deductible.", "test");
    expect(all.length).toBeGreaterThan(0);
    expect(all.every((f) => f.exempt)).toBe(true);
  });
});

describe("helpers", () => {
  it("sentenceAround returns the containing sentence", () => {
    const text = "First sentence here. We waive your deductible today. Third sentence.";
    const idx = text.indexOf("waive");
    expect(sentenceAround(text, idx, idx + 5)).toBe("We waive your deductible today.");
  });

  it("htmlToText strips tags/scripts and decodes entities", () => {
    const html =
      "<head><title>x</title></head><body><script>var a='hail-proof';</script>" +
      "<p>We don&#39;t waive <b>deductibles</b> &amp; never will.</p></body>";
    const text = htmlToText(html);
    expect(text).not.toContain("hail-proof");
    expect(text).toContain("We don't waive deductibles & never will.");
  });

  it("finds violations inside rendered HTML", () => {
    const html = "<main><h2>Deductible waived for storm victims!</h2></main>";
    const found = findViolations(htmlToText(html), "page.html").filter((f) => !f.exempt);
    expect(found.map((f) => f.ruleId)).toContain("deductible-offer-passive");
  });
});
