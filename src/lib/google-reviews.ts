/**
 * Google reviews (live pull) — env-gated, best-effort.
 *
 * When GOOGLE_PLACES_API_KEY + GOOGLE_PLACE_ID are set, the /reviews page pulls
 * real reviews from the Google Business Profile via the Places Details API at
 * build time. With no keys it returns [] (no network call), and the page falls
 * back to the reviews managed in the admin panel. Never throws.
 *
 * Only REAL Google reviews are surfaced — we never synthesize review content.
 */

export interface GoogleReview {
  author: string;
  rating: number;
  relativeTime: string;
  text: string;
  source: "google";
}

export interface GoogleReviewsEnv {
  GOOGLE_PLACES_API_KEY?: string;
  GOOGLE_PLACE_ID?: string;
}

interface PlacesReview {
  author_name?: string;
  rating?: number;
  relative_time_description?: string;
  text?: string;
}

export async function fetchGoogleReviews(env: GoogleReviewsEnv): Promise<GoogleReview[]> {
  const key = env.GOOGLE_PLACES_API_KEY?.trim();
  const placeId = env.GOOGLE_PLACE_ID?.trim();
  if (!key || !placeId) return [];

  try {
    const url =
      `https://maps.googleapis.com/maps/api/place/details/json` +
      `?place_id=${encodeURIComponent(placeId)}&fields=reviews&reviews_no_translations=true&key=${encodeURIComponent(key)}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = (await res.json()) as { result?: { reviews?: PlacesReview[] } };
    const reviews = data.result?.reviews ?? [];
    return reviews
      .filter((r) => r.text && r.author_name && typeof r.rating === "number")
      .map((r) => ({
        author: r.author_name!,
        rating: r.rating!,
        relativeTime: r.relative_time_description ?? "",
        text: r.text!,
        source: "google" as const,
      }));
  } catch {
    return [];
  }
}
