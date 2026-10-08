import type { APIRoute } from "astro";
import { GOOGLE_GEOCODING_API_KEY } from "astro:env/server";
import { rateLimit, clientKey } from "~/lib/rate-limit";

export const prerender = false;

/**
 * Rooftop-precision geocoding for the roof measurement tool.
 *
 * WHY THIS EXISTS (measured, 2026-10 — docs/research-facts.md Sheet 8):
 * the dominant source of error in the roof tool is not measurement, it's
 * picking the wrong building. Google's `buildingInsights:findClosest` returns
 * the nearest building CENTRE, so a detached garage 2 m from the address pin
 * beats the real house whose centre is 21 m away. Across six EagleView-checked
 * roofs that mis-pick produced ratios of 0.55 and 0.68; every other roof landed
 * 0.90–1.02.
 *
 * The Geocoding API reports a `location_type` of ROOFTOP when the point is
 * verified to sit on the building itself — a far better anchor than the Places
 * result, which is tuned for finding places rather than rooftops.
 *
 * WHY IT NEEDS ITS OWN KEY: Google refuses HTTP-referrer-restricted keys on
 * this API outright ("API keys with referer restrictions cannot be used with
 * this API"). So the site's public browser key CANNOT call it, and this must be
 * a server-side key held in an env var — never committed, never shipped to the
 * browser.
 *
 * Env-gated and best-effort like every integration here: with no key set it
 * returns { available: false } and the page simply keeps using the Places
 * location it already has. Never throws.
 */

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

export const GET: APIRoute = async ({ request, url }) => {
  if (!GOOGLE_GEOCODING_API_KEY) return json({ available: false, reason: "unconfigured" });

  if (!rateLimit(`geo:${clientKey(request.headers)}`, { limit: 15, windowMs: 60_000 }).allowed) {
    return json({ available: false, reason: "rate_limited" }, 429);
  }

  // Soft same-site guard. Real protection is the key restriction in Google's
  // console plus a quota cap — this just deters casual reuse.
  const referer = request.headers.get("referer") ?? "";
  if (referer && !referer.includes(url.host)) {
    return json({ available: false, reason: "forbidden" }, 403);
  }

  const address = (url.searchParams.get("address") ?? "").trim();
  if (address.length < 6 || address.length > 200) {
    return json({ available: false, reason: "bad_request" }, 400);
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);
    const res = await fetch(
      "https://maps.googleapis.com/maps/api/geocode/json" +
        `?address=${encodeURIComponent(address)}` +
        `&components=country:US&key=${GOOGLE_GEOCODING_API_KEY}`,
      { signal: controller.signal },
    );
    clearTimeout(timeout);
    if (!res.ok) return json({ available: false, reason: `upstream_${res.status}` });

    const data = (await res.json()) as {
      status?: string;
      results?: {
        formatted_address?: string;
        geometry?: { location?: { lat: number; lng: number }; location_type?: string };
      }[];
    };
    if (data.status !== "OK" || !data.results?.length) {
      return json({ available: false, reason: data.status ?? "no_result" });
    }

    const top = data.results[0];
    const loc = top.geometry?.location;
    if (!loc || !Number.isFinite(loc.lat) || !Number.isFinite(loc.lng)) {
      return json({ available: false, reason: "no_location" });
    }

    const precision = top.geometry?.location_type ?? "UNKNOWN";
    return json({
      available: true,
      lat: loc.lat,
      lng: loc.lng,
      // ROOFTOP = on the building. RANGE_INTERPOLATED/GEOMETRIC_CENTER/
      // APPROXIMATE are progressively vaguer; the caller decides whether a
      // vague pin is any better than the Places one it already has.
      precision,
      rooftop: precision === "ROOFTOP",
      formattedAddress: top.formatted_address ?? address,
    });
  } catch {
    return json({ available: false, reason: "error" });
  }
};
