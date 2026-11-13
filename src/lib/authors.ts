/**
 * Named human authors for blog posts and project stories.
 *
 * WHY (Search Console, 2026-11): `greg labbe` is the highest-converting query
 * on the entire site — 5 clicks from 5 impressions, 100% CTR, position 1.8 —
 * and `/about` converts at 35% against a sitewide average near 2%. People are
 * searching the owner by name and clicking through to find out who he is.
 *
 * Meanwhile every blog post was bylined "Northvale Roofing" and emitted
 * `author: {"@type": "Organization"}`. The one thing demonstrably working was
 * the one thing not on the content. Google's helpful-content guidance leans on
 * "Who, How and Why" — who stands behind this — and a company name answers
 * none of it.
 *
 * HONESTY: a byline here means the named person is ACCOUNTABLE for what the
 * page says, not that they typed every word — the normal meaning of a byline on
 * company content. Every bio below contains only owner-attested facts from
 * docs/research-facts.md Sheet 6. Greg's own years in roofing are on that
 * sheet's UNVERIFIED list, so they do not appear here. Do not add a credential,
 * certification or year count to a bio without a sourced entry first.
 */
import { BRAND } from "./brand";

export interface Author {
  /** Matches the `author` field in blog frontmatter. */
  name: string;
  /** Short role line shown under the byline. */
  role: string;
  /** One or two sentences. Owner-attested facts only. */
  bio: string;
  /** Real photo, or undefined. */
  image?: string;
  /** Where a reader goes to verify the person exists. */
  url: string;
}

export const AUTHORS: Record<string, Author> = {
  "Greg Labbe": {
    name: "Greg Labbe",
    role: `Owner, ${BRAND.name}`,
    bio: "Greg owns Northvale Roofing and runs the day-to-day: customer experience, sales, project coordination, team development and quality control. Calls are answered or returned by a Northvale project manager — never a national call center.",
    image: "/about/greg-labbe.webp",
    url: "/about",
  },
};

/** The author record for a byline, or undefined when the byline is the company. */
export function findAuthor(name: string): Author | undefined {
  return AUTHORS[name];
}
