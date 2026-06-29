/**
 * Meta Conversions API (server-side pixel).
 *
 * Sends a `Lead` event to Meta server-to-server so Facebook/Instagram ad
 * optimization gets a conversion signal even when the browser pixel is blocked.
 * Meta requires PII to be SHA-256 hashed (see user_data below).
 *
 * Built to spec against the Conversions API. Best-effort and env-gated, exactly
 * like src/lib/notify.ts: missing keys = clean skip, never throws, returns a
 * status the caller can log.
 */

const GRAPH_VERSION = "v21.0";

export interface MetaLeadInput {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  zip?: string;
  /** Meta click id from the landing URL — becomes the `fbc` parameter. */
  fbclid?: string;
  /** Request IP + UA improve match quality when available. */
  clientIp?: string;
  userAgent?: string;
  /** Page the lead converted on. */
  eventSourceUrl?: string;
  /** Canonical lead source, sent as custom_data for reporting. */
  leadSource?: string;
  /**
   * Deterministic event id used to de-dupe against a future client-side pixel
   * fire. If omitted, one is derived from the lead's hashed identity.
   */
  eventId?: string;
  /** Event timestamp (unix seconds). Defaults to now. Injectable for tests. */
  eventTime?: number;
}

export interface MetaCapiEnv {
  META_PIXEL_ID?: string;
  META_CAPI_TOKEN?: string;
}

export type MetaStatus = "sent" | "skipped" | "error";

export interface MetaResult {
  status: MetaStatus;
  error?: string;
}

const has = (v?: string) => !!v && v.trim().length > 0;

/** SHA-256 hex digest — Meta's required hashing for PII match keys. */
async function sha256Hex(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Normalize then hash, per Meta's guidance (trim + lowercase; phone = digits only). */
async function hashEmail(email: string): Promise<string> {
  return sha256Hex(email.trim().toLowerCase());
}
async function hashPhone(phone: string): Promise<string> {
  const digits = phone.replace(/[^\d]/g, "");
  return digits ? sha256Hex(digits) : "";
}
async function hashField(value: string): Promise<string> {
  return sha256Hex(value.trim().toLowerCase());
}

/**
 * Fire a server-side `Lead` conversion. Never throws. Returns "skipped" when the
 * pixel id / access token are not configured.
 */
export async function sendMetaLeadEvent(
  lead: MetaLeadInput,
  env: MetaCapiEnv,
): Promise<MetaResult> {
  if (!has(env.META_PIXEL_ID) || !has(env.META_CAPI_TOKEN)) {
    return { status: "skipped" };
  }
  try {
    const eventTime = lead.eventTime ?? Math.floor(Date.now() / 1000);

    const userData: Record<string, unknown> = {};
    if (has(lead.email)) userData.em = [await hashEmail(lead.email!)];
    if (has(lead.phone)) {
      const ph = await hashPhone(lead.phone!);
      if (ph) userData.ph = [ph];
    }
    if (has(lead.firstName)) userData.fn = [await hashField(lead.firstName!)];
    if (has(lead.lastName)) userData.ln = [await hashField(lead.lastName!)];
    if (has(lead.city)) userData.ct = [await hashField(lead.city!)];
    if (has(lead.zip)) userData.zp = [await hashField(lead.zip!)];
    if (has(lead.fbclid)) userData.fbc = `fb.1.${eventTime}.${lead.fbclid}`;
    if (has(lead.clientIp)) userData.client_ip_address = lead.clientIp;
    if (has(lead.userAgent)) userData.client_user_agent = lead.userAgent;

    // Deterministic event id so a future browser pixel with the same id de-dupes.
    const eventId =
      lead.eventId ?? (await sha256Hex(`${lead.phone ?? ""}:${lead.email ?? ""}:${eventTime}`));

    const url = `https://graph.facebook.com/${GRAPH_VERSION}/${env.META_PIXEL_ID}/events?access_token=${encodeURIComponent(
      env.META_CAPI_TOKEN!,
    )}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: [
          {
            event_name: "Lead",
            event_time: eventTime,
            event_id: eventId,
            action_source: "website",
            event_source_url: lead.eventSourceUrl,
            user_data: userData,
            custom_data: { lead_source: lead.leadSource ?? "website" },
          },
        ],
      }),
    });
    if (!res.ok) return { status: "error", error: `Meta CAPI ${res.status}` };
    return { status: "sent" };
  } catch (err) {
    return { status: "error", error: err instanceof Error ? err.message : "Unknown" };
  }
}
