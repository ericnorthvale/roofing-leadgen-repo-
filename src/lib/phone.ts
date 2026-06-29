import { BRAND } from "./brand";

/**
 * Single source of truth for how phone numbers render on the site.
 * CallRail swaps visible numbers via DNI (dynamic number insertion) at runtime;
 * these helpers produce the *default* fallback markup used before DNI fires.
 */
export function telHref(e164: string = BRAND.phoneE164): string {
  return `tel:${e164}`;
}

export function smsHref(e164: string = BRAND.phoneE164, body?: string): string {
  const query = body ? `?body=${encodeURIComponent(body)}` : "";
  return `sms:${e164}${query}`;
}

export function formatPhoneDisplay(e164: string = BRAND.phoneE164): string {
  const digits = e164.replace(/\D/g, "").replace(/^1/, "");
  if (digits.length !== 10) return e164;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

/**
 * Mask a phone number for logging. Keeps only the last 4 digits so a log line
 * stays correlatable for debugging without persisting the full number (PII) to
 * server/function logs. Empty input → ""; anything that isn't a 10-digit US
 * number is fully redacted rather than partially leaked.
 */
export function maskPhone(value: string | undefined | null): string {
  if (!value) return "";
  const digits = value.replace(/\D/g, "").replace(/^1/, "");
  if (digits.length !== 10) return "[redacted]";
  return `***-***-${digits.slice(6)}`;
}
