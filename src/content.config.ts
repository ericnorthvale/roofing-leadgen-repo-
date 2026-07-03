import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const PERSONAS = ["homeowner", "agent", "insurance", "storm", "hoa", "inspector"] as const;

const CLUSTERS = [
  "inspection",
  "replacement",
  "repair",
  "storm-damage",
  "insurance-claims",
  "materials",
  "maintenance",
  "buyer-seller",
  "local-weather",
  "hoa",
  "inspector-peers",
] as const;

const SERVICE_AREA_SLUGS = [
  "houston",
  "spring",
  "cypress",
  "the-woodlands",
  "kingwood",
  "tomball",
  "magnolia",
  "conroe",
] as const;

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string().max(160),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default("Northvale Roofing"),
    cluster: z.enum(CLUSTERS),
    persona: z.array(z.enum(PERSONAS)).min(1),
    relatedCity: z.enum(SERVICE_AREA_SLUGS).optional(),
    heroImage: z.string().optional(),
    tags: z.array(z.string()).default([]),
    /**
     * Quality gate: drafts never appear in /blog or sitemaps until a human
     * review flips this to "published". Enforced in both listing + detail pages.
     */
    status: z.enum(["draft", "published", "archived"]).default("draft"),
  }),
});

// NOTE: village/neighborhood pages are driven by src/lib/neighborhoods.ts (the
// data model behind the quality gate) — there is deliberately NO content
// collection for them, so there's a single source of truth.

const reviews = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/reviews" }),
  schema: z.object({
    source: z.enum(["google", "facebook", "bbb", "direct"]),
    rating: z.number().min(1).max(5),
    author: z.string(),
    relativeTime: z.string(),
    text: z.string(),
    serviceTag: z.string().optional(),
    // Free-text (not enum) so a value typed in the admin panel can't break the build.
    cityTag: z.string().optional(),
    /**
     * Seed/example entries (kept as admin-panel templates) are flagged here and
     * NEVER rendered on the site — publishing one would be a fabricated review
     * (Hard Rule #2 / FTC). Filtered out in src/lib/reviews.ts.
     */
    placeholder: z.boolean().default(false),
  }),
});

export const collections = { blog, reviews };
