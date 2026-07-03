/**
 * Single source for the reviews shown anywhere on the site.
 *
 * Merges live Google reviews (env-gated, best-effort — see google-reviews.ts)
 * with admin-managed reviews from the content collection, and drops any entry
 * flagged `placeholder: true` (seed/example records must never render — a
 * published placeholder is a fabricated review, Hard Rule #2 / FTC).
 */
import { getCollection } from "astro:content";
import { fetchGoogleReviews } from "./google-reviews";

export interface SiteReview {
  source: string;
  rating: number;
  author: string;
  relativeTime: string;
  text: string;
}

export async function getSiteReviews(): Promise<SiteReview[]> {
  const managed = (await getCollection("reviews"))
    .filter((r) => !r.data.placeholder)
    .map((r) => ({
      source: r.data.source as string,
      rating: r.data.rating,
      author: r.data.author,
      relativeTime: r.data.relativeTime,
      text: r.data.text,
    }));

  const google = await fetchGoogleReviews({
    GOOGLE_PLACES_API_KEY: import.meta.env.GOOGLE_PLACES_API_KEY,
    GOOGLE_PLACE_ID: import.meta.env.GOOGLE_PLACE_ID,
  });

  return [...google, ...managed];
}
