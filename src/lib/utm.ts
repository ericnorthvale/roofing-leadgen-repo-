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

export function deserializeUtm(raw: string | undefined | null): UtmPayload {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed ? parsed : {};
  } catch {
    return {};
  }
}
