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

const SERVICE_AREA_SLUGS = ["the-woodlands", "spring", "tomball", "magnolia", "conroe", "cypress"] as const;

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

const neighborhoods = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/neighborhoods" }),
  schema: z.object({
    title: z.string(),
    description: z.string().max(160),
    city: z.enum(SERVICE_AREA_SLUGS),
    neighborhood: z.string(),
    hoaName: z.string().optional(),
    approvedShingleList: z.array(z.string()).default([]),
    status: z.enum(["draft", "published", "archived"]).default("draft"),
  }),
});

const reviews = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/reviews" }),
  schema: z.object({
    source: z.enum(["google", "facebook", "bbb", "direct"]),
    rating: z.number().min(1).max(5),
    author: z.string(),
    relativeTime: z.string(),
    text: z.string(),
    serviceTag: z.string().optional(),
    cityTag: z.enum(SERVICE_AREA_SLUGS).optional(),
  }),
});

export const collections = { blog, neighborhoods, reviews };
