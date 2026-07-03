/**
 * Server-side lead validation — format checks + length caps.
 *
 * The browser enforces the same rules first (LeadForm's required/pattern
 * attributes), but the API must never trust the client: garbage or oversized
 * values would otherwise flow straight into HighLevel, SMS alerts, and Meta.
 * Pure module (no Astro imports) so it unit-tests cleanly.
 */

export const LEAD_LIMITS = {
  name: 100,
  email: 200,
  phone: 30,
  address: 200,
  city: 100,
  zip: 10,
  service: 40,
  source: 60,
  notes: 2000,
  /** Raw serialized UTM blob from the hidden field. */
  utm: 4096,
} as const;

export interface LeadBody {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  zip?: string;
  service?: string;
  notes?: string;
  source?: string;
  consent?: string;
  utm?: string;
  eventId?: string;
}

/** A LeadBody whose required fields are proven present. */
export interface ValidLead extends LeadBody {
  firstName: string;
  phone: string;
  address: string;
  city: string;
  zip: string;
  consent: string;
}

export type LeadValidation = { ok: true; lead: ValidLead } | { ok: false; errors: string[] };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ZIP_RE = /^\d{5}(-\d{4})?$/;

/** US phone: 10 digits, or 11 starting with 1 (country code). */
export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 10 || (digits.length === 11 && digits.startsWith("1"));
}

/** Browser-generated UUID (or similar opaque id) for pixel/CAPI dedup. */
export function isValidEventId(id: string): boolean {
  return /^[A-Za-z0-9-]{8,64}$/.test(id);
}

export function validateLead(body: LeadBody): LeadValidation {
  const errors: string[] = [];

  const requireField = (name: string, value: string | undefined) => {
    if (!value || value.trim().length === 0) errors.push(`${name}: required`);
  };
  requireField("firstName", body.firstName);
  requireField("phone", body.phone);
  requireField("address", body.address);
  requireField("city", body.city);
  requireField("zip", body.zip);
  requireField("consent", body.consent);

  const cap = (name: keyof typeof LEAD_LIMITS, value: string | undefined) => {
    if (value && value.length > LEAD_LIMITS[name]) errors.push(`${String(name)}: too long`);
  };
  cap("name", body.firstName);
  cap("name", body.lastName);
  cap("email", body.email);
  cap("phone", body.phone);
  cap("address", body.address);
  cap("city", body.city);
  cap("zip", body.zip);
  cap("service", body.service);
  cap("source", body.source);
  cap("notes", body.notes);
  cap("utm", body.utm);

  if (body.phone && body.phone.length <= LEAD_LIMITS.phone && !isValidPhone(body.phone)) {
    errors.push("phone: invalid");
  }
  if (body.zip && body.zip.length <= LEAD_LIMITS.zip && !ZIP_RE.test(body.zip.trim())) {
    errors.push("zip: invalid");
  }
  // Email is optional — validate format only when provided.
  if (body.email && body.email.trim() && !EMAIL_RE.test(body.email.trim())) {
    errors.push("email: invalid");
  }

  return errors.length === 0 ? { ok: true, lead: body as ValidLead } : { ok: false, errors };
}
