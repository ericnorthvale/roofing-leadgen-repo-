import type { APIRoute } from "astro";
import { MAPILLARY_TOKEN } from "astro:env/server";
import { rateLimit, clientKey } from "~/lib/rate-limit";

export const prerender = false;

/**
 * Property photo for the roof measurement report.
 *
 * Order of preference (owner, 2026-10): a STREET-LEVEL shot of the house when
 * one exists, else a top-down AERIAL.
 *
 * Sources are chosen for print licensing, because this image is embedded in a
 * branded PDF the homeowner downloads, prints and keeps:
 *  - Street level: **Mapillary** — crowd-sourced, CC-BY-SA, usable commercially
 *    with attribution. Needs a free token; without one we simply skip to aerial.
 *  - Aerial: **USGS "The National Map"** — a US federal government work, public
 *    domain, no key, no attribution strictly required (we credit it anyway).
 *
 * Explicitly NOT used: Google Street View (its geo-guidelines bar print use
 * outright) and listing-site photos from Zillow/HAR/MLS (copyright belongs to
 * the photographer or broker — see docs/research-facts.md Sheet 8).
 *
 * Best-effort: every failure path returns 204 and the report prints without a
 * photo. `?debug=1` returns JSON describing what was attempted, so a failure
 * can be diagnosed from a browser without server logs.
 */

const USGS_SERVICES = [
  "https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/export",
  "https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryTopo/MapServer/export",
];

const DEFAULT_SPAN_M = 60;
const MIN_SPAN_M = 25;
const MAX_SPAN_M = 200;
const OUT_W = 900;
const OUT_H = 600;
/** How far from the house we'll accept a street-level photo. */
const STREET_RADIUS_M = 45;

interface Attempt {
  source: string;
  ok: boolean;
  detail: string;
}

/** EPSG:4326 → EPSG:3857. */
const toMercator = (lat: number, lng: number) => ({
  x: (lng * 20037508.34) / 180,
  y: (Math.log(Math.tan(((90 + lat) * Math.PI) / 360)) / (Math.PI / 180)) * (20037508.34 / 180),
});

async function timedFetch(url: string, ms: number, init?: RequestInit) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: c.signal });
  } finally {
    clearTimeout(t);
  }
}

/** Nearest Mapillary street-level photo, or null. */
async function tryStreet(lat: number, lng: number, attempts: Attempt[]) {
  if (!MAPILLARY_TOKEN) {
    attempts.push({ source: "mapillary", ok: false, detail: "no token" });
    return null;
  }
  try {
    const dLat = STREET_RADIUS_M / 111320;
    const dLng = STREET_RADIUS_M / (111320 * Math.cos((lat * Math.PI) / 180));
    const bbox = `${lng - dLng},${lat - dLat},${lng + dLng},${lat + dLat}`;
    const res = await timedFetch(
      `https://graph.mapillary.com/images?fields=id,thumb_1024_url,computed_geometry&bbox=${bbox}&limit=12&access_token=${encodeURIComponent(MAPILLARY_TOKEN)}`,
      7000,
    );
    if (!res.ok) {
      attempts.push({ source: "mapillary", ok: false, detail: `search ${res.status}` });
      return null;
    }
    const data = (await res.json()) as {
      data?: { thumb_1024_url?: string; computed_geometry?: { coordinates?: [number, number] } }[];
    };
    const items = data.data ?? [];
    if (!items.length) {
      attempts.push({ source: "mapillary", ok: false, detail: "no coverage" });
      return null;
    }
    // Closest to the house wins.
    let best: { url: string; d: number } | null = null;
    for (const it of items) {
      if (!it.thumb_1024_url) continue;
      const c = it.computed_geometry?.coordinates;
      const d = c
        ? Math.hypot((c[1] - lat) * 111320, (c[0] - lng) * 111320 * Math.cos((lat * Math.PI) / 180))
        : 9999;
      if (!best || d < best.d) best = { url: it.thumb_1024_url, d };
    }
    if (!best) {
      attempts.push({ source: "mapillary", ok: false, detail: "no thumbnail" });
      return null;
    }
    const img = await timedFetch(best.url, 9000);
    const type = img.headers.get("content-type") ?? "";
    if (!img.ok || !type.startsWith("image/")) {
      attempts.push({ source: "mapillary", ok: false, detail: `thumb ${img.status}` });
      return null;
    }
    const bytes = await img.arrayBuffer();
    if (bytes.byteLength < 2000) {
      attempts.push({ source: "mapillary", ok: false, detail: "thumb too small" });
      return null;
    }
    attempts.push({
      source: "mapillary",
      ok: true,
      detail: `${Math.round(best.d)}m away, ${bytes.byteLength}b`,
    });
    return { bytes, type, credit: "Street imagery © Mapillary contributors (CC BY-SA)" };
  } catch (e) {
    attempts.push({ source: "mapillary", ok: false, detail: `error ${(e as Error).name}` });
    return null;
  }
}

/** USGS public-domain aerial, or null. */
async function tryAerial(lat: number, lng: number, span: number, attempts: Attempt[]) {
  // Work in Web Mercator so the bbox and the output share a projection — mixing
  // 4326 in with a 3857 image is what makes ArcGIS letterbox or distort.
  const c = toMercator(lat, lng);
  // 3857 units are metres only at the equator; scale for latitude.
  const scale = 1 / Math.cos((lat * Math.PI) / 180);
  const halfW = (span / 2) * scale;
  const halfH = ((span * (OUT_H / OUT_W)) / 2) * scale;
  const bbox = `${c.x - halfW},${c.y - halfH},${c.x + halfW},${c.y + halfH}`;

  for (const service of USGS_SERVICES) {
    try {
      const params = new URLSearchParams({
        bbox,
        bboxSR: "3857",
        imageSR: "3857",
        size: `${OUT_W},${OUT_H}`,
        format: "jpg",
        transparent: "false",
        f: "image",
      });
      const res = await timedFetch(`${service}?${params}`, 12000, {
        headers: { Accept: "image/jpeg,image/*" },
      });
      const type = res.headers.get("content-type") ?? "";
      if (!res.ok || !type.startsWith("image/")) {
        attempts.push({
          source: service.includes("Topo") ? "usgs-topo" : "usgs-imagery",
          ok: false,
          detail: `${res.status} ${type.slice(0, 40)}`,
        });
        continue;
      }
      const bytes = await res.arrayBuffer();
      if (bytes.byteLength < 2000) {
        attempts.push({ source: service, ok: false, detail: `tiny ${bytes.byteLength}b` });
        continue;
      }
      attempts.push({
        source: service.includes("Topo") ? "usgs-topo" : "usgs-imagery",
        ok: true,
        detail: `${bytes.byteLength}b`,
      });
      return { bytes, type, credit: "Aerial imagery: USGS The National Map (public domain)" };
    } catch (e) {
      attempts.push({ source: service, ok: false, detail: `error ${(e as Error).name}` });
    }
  }
  return null;
}

export const GET: APIRoute = async ({ request, url }) => {
  const debug = url.searchParams.get("debug") === "1";
  const attempts: Attempt[] = [];

  const fail = (reason: string, status = 204) =>
    debug
      ? new Response(JSON.stringify({ ok: false, reason, attempts }, null, 1), {
          status: 200,
          headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
        })
      : new Response(null, {
          status,
          headers: { "X-No-Image": reason, "Cache-Control": "public, max-age=300" },
        });

  if (
    !rateLimit(`propimg:${clientKey(request.headers)}`, { limit: 20, windowMs: 60_000 }).allowed
  ) {
    return fail("rate_limited");
  }

  const lat = Number(url.searchParams.get("lat"));
  const lng = Number(url.searchParams.get("lng"));
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return fail("bad_request", 400);
  }
  const spanRaw = Number(url.searchParams.get("span"));
  const span = Number.isFinite(spanRaw)
    ? Math.min(MAX_SPAN_M, Math.max(MIN_SPAN_M, spanRaw))
    : DEFAULT_SPAN_M;

  // Street level first when available, aerial as the fallback.
  const picked =
    (await tryStreet(lat, lng, attempts)) ?? (await tryAerial(lat, lng, span, attempts));
  if (!picked) return fail("no_imagery");

  if (debug) {
    return new Response(
      JSON.stringify(
        { ok: true, credit: picked.credit, bytes: picked.bytes.byteLength, attempts },
        null,
        1,
      ),
      { status: 200, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } },
    );
  }

  return new Response(picked.bytes, {
    status: 200,
    headers: {
      "Content-Type": picked.type,
      "Cache-Control": "public, max-age=86400, s-maxage=604800",
      "X-Image-Credit": picked.credit,
    },
  });
};
