import type { APIRoute } from "astro";
import { rateLimit, clientKey } from "~/lib/rate-limit";

export const prerender = false;

/**
 * Aerial property image for the roof measurement report.
 *
 * Source: USGS "The National Map" imagery — a work of the U.S. government, in
 * the PUBLIC DOMAIN, so it is safe to embed in a downloadable, printable,
 * branded report. That is the whole reason we don't use Google imagery here:
 * Google's geo-guidelines bar Street View from print entirely and restrict
 * satellite imagery in promotional material (docs/research-facts.md Sheet 8).
 * Google imagery stays on screen in the live map only.
 *
 * No API key — hence nothing for the owner to configure, and nothing that can
 * leak. Same best-effort contract as every other integration here: any failure
 * returns a clean 204 and the report simply prints without a photo.
 *
 * We ask ArcGIS for a single exported image at an exact bounding box rather
 * than stitching map tiles, so the house lands dead-centre with no image
 * processing on our side.
 */

const SERVICE =
  "https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/export";

/** Ground width of the frame, metres. Wide enough for house + immediate lot. */
const DEFAULT_SPAN_M = 60;
const MIN_SPAN_M = 25;
const MAX_SPAN_M = 200;

const OUT_W = 900;
const OUT_H = 600;

const METRES_PER_DEG_LAT = 111_320;

/** Empty, cacheable "no image available" — the report handles this fine. */
const noImage = (reason: string) =>
  new Response(null, {
    status: 204,
    headers: { "X-No-Image": reason, "Cache-Control": "public, max-age=300" },
  });

export const GET: APIRoute = async ({ request, url }) => {
  if (
    !rateLimit(`propimg:${clientKey(request.headers)}`, { limit: 20, windowMs: 60_000 }).allowed
  ) {
    return noImage("rate_limited");
  }

  const lat = Number(url.searchParams.get("lat"));
  const lng = Number(url.searchParams.get("lng"));
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return noImage("bad_request");
  }

  const spanRaw = Number(url.searchParams.get("span"));
  const span = Number.isFinite(spanRaw)
    ? Math.min(MAX_SPAN_M, Math.max(MIN_SPAN_M, spanRaw))
    : DEFAULT_SPAN_M;

  // Frame the bbox to the output aspect ratio so nothing is stretched.
  const halfWidthM = span / 2;
  const halfHeightM = (span * (OUT_H / OUT_W)) / 2;
  const dLat = halfHeightM / METRES_PER_DEG_LAT;
  const metresPerDegLng = METRES_PER_DEG_LAT * Math.cos((lat * Math.PI) / 180);
  // Near the poles cos→0; bail rather than divide into nonsense.
  if (!Number.isFinite(metresPerDegLng) || Math.abs(metresPerDegLng) < 1) {
    return noImage("bad_latitude");
  }
  const dLng = halfWidthM / metresPerDegLng;

  const params = new URLSearchParams({
    bbox: `${lng - dLng},${lat - dLat},${lng + dLng},${lat + dLat}`,
    bboxSR: "4326",
    imageSR: "3857",
    size: `${OUT_W},${OUT_H}`,
    format: "jpg",
    transparent: "false",
    f: "image",
  });

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const upstream = await fetch(`${SERVICE}?${params}`, {
      signal: controller.signal,
      headers: { Accept: "image/jpeg,image/*" },
    });
    clearTimeout(timeout);

    if (!upstream.ok) return noImage(`upstream_${upstream.status}`);

    // ArcGIS answers errors with JSON and a 200, so trust the content type.
    const contentType = upstream.headers.get("content-type") ?? "";
    if (!contentType.startsWith("image/")) return noImage("upstream_not_image");

    const bytes = await upstream.arrayBuffer();
    // A uniform blank/black frame comes back tiny; treat it as no coverage.
    if (bytes.byteLength < 2000) return noImage("empty_coverage");

    return new Response(bytes, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        // Aerial imagery changes on a multi-year cadence — cache hard.
        "Cache-Control": "public, max-age=86400, s-maxage=604800",
        "X-Image-Credit": "USGS The National Map (public domain)",
      },
    });
  } catch {
    return noImage("error");
  }
};
