/**
 * HighLevel (GoHighLevel) contact + opportunity push.
 *
 * Scaffold only — Eric will verify the exact HighLevel endpoint shape once the
 * Private Integration token is issued. Expected shape based on current
 * HighLevel v2 API docs.
 */

export interface LeadPayload {
  firstName: string;
  lastName?: string;
  email?: string;
  phone: string;
  address?: string;
  city?: string;
  zip?: string;
  source: string;
  tags?: string[];
  customFields?: Record<string, string>;
}

export interface HighLevelResult {
  ok: boolean;
  contactId?: string;
  error?: string;
}

export async function pushLeadToHighLevel(
  lead: LeadPayload,
  env: { HIGHLEVEL_API_KEY?: string; HIGHLEVEL_LOCATION_ID?: string },
): Promise<HighLevelResult> {
  if (!env.HIGHLEVEL_API_KEY || !env.HIGHLEVEL_LOCATION_ID) {
    return { ok: false, error: "HighLevel not configured" };
  }

  try {
    const res = await fetch("https://services.leadconnectorhq.com/contacts/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.HIGHLEVEL_API_KEY}`,
        "Content-Type": "application/json",
        Version: "2021-07-28",
      },
      body: JSON.stringify({
        firstName: lead.firstName,
        lastName: lead.lastName,
        email: lead.email,
        phone: lead.phone,
        address1: lead.address,
        city: lead.city,
        postalCode: lead.zip,
        locationId: env.HIGHLEVEL_LOCATION_ID,
        source: lead.source,
        tags: lead.tags ?? [],
        customFields: Object.entries(lead.customFields ?? {}).map(([key, value]) => ({ key, field_value: value })),
      }),
    });
    if (!res.ok) return { ok: false, error: `HighLevel ${res.status}` };
    const data = (await res.json()) as { contact?: { id?: string } };
    return { ok: true, contactId: data.contact?.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Unknown" };
  }
}
