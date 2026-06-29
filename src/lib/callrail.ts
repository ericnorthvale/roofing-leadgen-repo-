/**
 * CallRail webhook signature verification.
 *
 * CallRail signs webhook bodies with HMAC-SHA1 using a shared secret we set
 * in CallRail → Webhooks. The signature arrives as the `signature` header.
 */

export async function verifyCallRailSignature(
  rawBody: string,
  headerSignature: string | null,
  secret: string,
): Promise<boolean> {
  if (!headerSignature) return false;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(rawBody));
  const expected = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return timingSafeEqual(expected, headerSignature.trim());
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}

export interface CallRailCallEvent {
  id: string;
  direction: "inbound" | "outbound";
  answered?: boolean;
  /** Present on Post-Call events; absent on Pre-Call ("call started") events. */
  duration?: number;
  customer_phone_number: string;
  tracking_phone_number: string;
  source_name?: string;
  recording?: string;
  gclid?: string;
  fbclid?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

/**
 * Only act on completed inbound calls. CallRail fires multiple webhooks per call
 * (Pre-Call when it starts, Post-Call when it ends); the Post-Call event carries
 * `duration`. Gating on inbound + duration present de-dupes to one push per call
 * and ignores outbound/pre-call noise. (Missed calls have duration 0 — still a
 * real lead, so we keep them.)
 */
export function isActionableCall(event: CallRailCallEvent): boolean {
  return event.direction === "inbound" && typeof event.duration === "number";
}

/** Placeholder contact name for a phone lead (callers have no name). */
export function phoneLeadName(customerPhone: string): string {
  const last4 = customerPhone.replace(/[^\d]/g, "").slice(-4);
  return last4 ? `Phone lead ${last4}` : "Phone lead";
}
