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
