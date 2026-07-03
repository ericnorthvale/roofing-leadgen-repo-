/**
 * UTM capture + persistence. Full scheme lives in docs/utm-scheme.md.
 *
 * The server-side middleware in src/middleware.ts is responsible for reading
 * request-scoped UTMs and stashing them on Astro.locals. This module has pure
 * helpers used by middleware + the lead API route.
 */

export type UtmKey = "source" | "medium" | "campaign" | "content" | "term";

export interface UtmPayload {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
  gclid?: string;
  fbclid?: string;
  /** ISO timestamp of first touch. */
  firstTouchAt?: string;
  /** Path of first landing page. */
  landingPath?: string;
}

const KEYS: UtmKey[] = ["source", "medium", "campaign", "content", "term"];

export function parseUtmFromUrl(url: URL): UtmPayload {
  const out: UtmPayload = {};
  for (const k of KEYS) {
    const v = url.searchParams.get(`utm_${k}`);
    if (v) out[k] = v.slice(0, 128);
  }
  const gclid = url.searchParams.get("gclid");
  const fbclid = url.searchParams.get("fbclid");
  if (gclid) out.gclid = gclid.slice(0, 256);
  if (fbclid) out.fbclid = fbclid.slice(0, 256);
  return out;
}

export function hasAnyUtm(p: UtmPayload): boolean {
  return Boolean(p.source || p.medium || p.campaign || p.gclid || p.fbclid);
}

/**
 * Serialize UTM bag for a hidden form field. Round-tripped by the lead API.
 * We keep it as a single JSON string to minimize form-field sprawl.
 */
export function serializeUtm(p: UtmPayload): string {
  return JSON.stringify(p);
}

/** Max length per deserialized field — matches the caps parseUtmFromUrl applies. */
const FIELD_CAPS: Record<keyof UtmPayload, number> = {
  source: 128,
  medium: 128,
  campaign: 128,
  content: 128,
  term: 128,
  gclid: 256,
  fbclid: 256,
  firstTouchAt: 64,
  landingPath: 256,
};

/**
 * Parse the hidden-field blob from the browser. The client is untrusted, so
 * only known keys survive, values must be strings, and each is length-capped
 * (the raw blob itself is capped upstream in lead validation).
 */
export function deserializeUtm(raw: string | undefined | null): UtmPayload {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object" || !parsed) return {};
    const out: UtmPayload = {};
    for (const key of Object.keys(FIELD_CAPS) as (keyof UtmPayload)[]) {
      const v = (parsed as Record<string, unknown>)[key];
      if (typeof v === "string" && v.length > 0) out[key] = v.slice(0, FIELD_CAPS[key]);
    }
    return out;
  } catch {
    return {};
  }
}
