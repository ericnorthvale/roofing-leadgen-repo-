/**
 * Banned-phrase rules for the weekly compliance scan (docs/compliance.md §7–8).
 *
 * The scan runs over the BUILT site (every .html file under dist/) in
 * .github/workflows/weekly-compliance.yml via src/scripts/compliance-scan.ts.
 * The pure matching logic lives here so it is unit-testable.
 *
 * Design constraint: the site's copy legitimately EDUCATES about these scams
 * ("offering to cover your deductible is illegal", "no shingle is hail-proof"),
 * so a naive grep would flag the compliance content itself. Two defenses:
 *
 * 1. Violation patterns target the OFFER shape (first-person "we'll waive your
 *    deductible"), not third-party descriptions ("contractors offering to
 *    absorb it are committing fraud").
 * 2. A match whose surrounding sentence contains educational/negation markers
 *    (never / illegal / fraud / felony / scam / red flag / "no shingle" …) is
 *    reported as exempt, not as a violation.
 *
 * This is a guardrail against drafted copy crossing legal lines, not a court:
 * a human still reviews every flagged excerpt (and adversarially-phrased text
 * can evade it). Rules err toward zero false positives on current legit copy —
 * verified by tests using real sentences from the site.
 */

export interface ComplianceRule {
  id: string;
  /** What the rule catches and why it's banned. */
  description: string;
  pattern: RegExp;
}

export interface ComplianceFinding {
  ruleId: string;
  description: string;
  /** File or identifier the text came from. */
  source: string;
  /** The exact matched text. */
  match: string;
  /** The sentence around the match, for human review. */
  excerpt: string;
  /** True when educational/negation context downgraded it from a violation. */
  exempt: boolean;
}

export const COMPLIANCE_RULES: ComplianceRule[] = [
  {
    id: "deductible-offer",
    description:
      "First-person offer to waive/absorb/cover a deductible — insurance fraud (Tex. Ins. Code §707.002; Bus. & Com. Code §27.02)",
    pattern:
      /\b(?:we(?:['’]ll|['’]d|['’]re| will| can| could| do| always| gladly| happily)?|northvale(?:\s+roofing)?)\b[^.!?]{0,60}?\b(?:waiv\w*|absorb\w*|cover\w*|pay\w*|eat\w*|rebat\w*|discount\w*|offset\w*|forgiv\w*)\s+(?:(?:your|the|their|that|a|any|my|own|of)\s+){0,2}deductibles?\b/gi,
  },
  {
    id: "deductible-offer-passive",
    description:
      "Passive/slogan deductible-waiver language ('deductible waived', 'no deductible') — insurance fraud",
    // "no deductible GAMES/gimmicks" is the site's anti-scam pledge, not an offer.
    pattern:
      /\b(?:deductibles?\s+(?:waived|covered|absorbed|forgiven|on\s+us)|(?:no|zero)[-\s]deductibles?\b(?!\s*(?:games?|gimmicks?|tricks?|shenanigans)))/gi,
  },
  {
    id: "hail-proof",
    description:
      '"Hail-proof" claim — shingles are at most impact-RESISTANT (UL 2218 Class 4); "proof" is actionable',
    pattern: /\bhail[-\s]?proof\b/gi,
  },
  {
    id: "uncited-best",
    description:
      '"Best roofer/roofing company in …" superlative — banned without a specific cited award + year',
    pattern: /\bbest\s+(?:roofers?|roofing\s+(?:company|companies|contractors?))\s+in\b/gi,
  },
  {
    id: "fake-scarcity",
    description: "Fake-scarcity/urgency language — banned by docs/compliance.md §8",
    pattern:
      /\b(?:only\s+\d+\s+(?:spots?|slots?)\s+(?:left|remaining)|limited\s+(?:spots?|slots?|time)\s+(?:left|remaining|available|only|offer)|offer\s+(?:ends|expires)\s+(?:today|tonight|soon|at\s+midnight)|act\s+now\s+before)\b/gi,
  },
  {
    id: "free-roof",
    description:
      '"Free roof" (storm-scam bait). A free roof INSPECTION/estimate is a legitimate offer and is not flagged.',
    pattern:
      /\bfree\s+(?:new\s+)?roof(?:s|ing)?\b(?!\s+(?:inspections?|estimates?|quotes?|check(?:up)?s?|assessments?|evaluations?|consult(?:ation)?s?))/gi,
  },
];

/**
 * Educational/negation context markers. A banned-phrase match whose sentence
 * also matches this is the site WARNING about the scam, not committing it.
 */
export const EXEMPT_CONTEXT =
  /\b(?:never|not|illegal|unlawful|fraud\w*|felon\w*|offen[cs]e|crime|criminal|jail|scam\w*|red\s+flags?|avoid|beware|warn\w*|prohibit\w*|banned|myth|no\s+(?:shingle|roof|product|material)|nothing\s+is|isn['’]t|aren['’]t|can['’]t|cannot|don['’]t|doesn['’]t|won['’]t|wouldn['’]t|shouldn['’]t)\b/i;

/** The sentence (bounded by . ! ? or hard limits) containing [start, end). */
export function sentenceAround(text: string, start: number, end: number): string {
  const MAX = 300;
  let s = start;
  while (s > 0 && start - s < MAX && !/[.!?]/.test(text[s - 1]!)) s--;
  let e = end;
  while (e < text.length && e - end < MAX && !/[.!?]/.test(text[e]!)) e++;
  if (e < text.length) e++; // include the terminator
  return text.slice(s, e).replace(/\s+/g, " ").trim();
}

/** Run every rule over plain text; sentence-level exemption for educational context. */
export function findViolations(text: string, source: string): ComplianceFinding[] {
  const findings: ComplianceFinding[] = [];
  for (const rule of COMPLIANCE_RULES) {
    // Fresh regex per call — /g regexes are stateful.
    const re = new RegExp(rule.pattern.source, rule.pattern.flags);
    for (const m of text.matchAll(re)) {
      const excerpt = sentenceAround(text, m.index!, m.index! + m[0].length);
      findings.push({
        ruleId: rule.id,
        description: rule.description,
        source,
        match: m[0],
        excerpt,
        exempt: EXEMPT_CONTEXT.test(excerpt),
      });
    }
  }
  return findings;
}

/** Crude HTML → text: drop script/style/head, strip tags, decode common entities. */
export function htmlToText(html: string): string {
  return html
    .replace(/<(script|style|noscript|head)\b[\s\S]*?<\/\1>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;|&#8217;|’/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ");
}
