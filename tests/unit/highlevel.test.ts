import { describe, it, expect, vi, afterEach } from "vitest";
import { pushLeadToHighLevel, type LeadPayload } from "~/lib/highlevel";

const lead: LeadPayload = {
  firstName: "Jane",
  lastName: "Doe",
  phone: "+12815550123",
  email: "jane@example.com",
  source: "website",
  tags: ["lead_source:google"],
  customFields: { lead_source: "google" },
};

const keys = { HIGHLEVEL_API_KEY: "tok", HIGHLEVEL_LOCATION_ID: "loc" };

function mockFetch(handler: (url: string) => { ok: boolean; status: number; body: unknown }) {
  return vi.fn(async (url: string) => {
    const { ok, status, body } = handler(url);
    return { ok, status, json: async () => body } as unknown as Response;
  });
}

afterEach(() => vi.unstubAllGlobals());

describe("pushLeadToHighLevel", () => {
  it("cleanly skips (no fetch) when HighLevel is not configured", async () => {
    const fetchSpy = mockFetch(() => ({ ok: true, status: 200, body: {} }));
    vi.stubGlobal("fetch", fetchSpy);
    const res = await pushLeadToHighLevel(lead, {});
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/not configured/i);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("upserts the contact and skips the opportunity when no pipeline is configured", async () => {
    const fetchSpy = mockFetch((url) => {
      if (url.endsWith("/contacts/upsert"))
        return { ok: true, status: 200, body: { contact: { id: "c1" } } };
      return { ok: false, status: 500, body: {} };
    });
    vi.stubGlobal("fetch", fetchSpy);
    const res = await pushLeadToHighLevel(lead, keys);
    expect(res.ok).toBe(true);
    expect(res.contactId).toBe("c1");
    expect(res.opportunityId).toBeUndefined();
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy.mock.calls[0][0]).toContain("/contacts/upsert");
  });

  it("creates an opportunity when pipeline env vars are present", async () => {
    const fetchSpy = mockFetch((url) => {
      if (url.endsWith("/contacts/upsert"))
        return { ok: true, status: 200, body: { contact: { id: "c1" } } };
      if (url.endsWith("/opportunities/"))
        return { ok: true, status: 200, body: { opportunity: { id: "o1" } } };
      return { ok: false, status: 500, body: {} };
    });
    vi.stubGlobal("fetch", fetchSpy);
    const res = await pushLeadToHighLevel(lead, {
      ...keys,
      HIGHLEVEL_PIPELINE_ID: "pipe",
      HIGHLEVEL_PIPELINE_STAGE_ID: "stage",
    });
    expect(res.ok).toBe(true);
    expect(res.contactId).toBe("c1");
    expect(res.opportunityId).toBe("o1");
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it("still succeeds (contact only) when opportunity creation fails", async () => {
    const fetchSpy = mockFetch((url) => {
      if (url.endsWith("/contacts/upsert"))
        return { ok: true, status: 200, body: { contact: { id: "c1" } } };
      return { ok: false, status: 422, body: {} };
    });
    vi.stubGlobal("fetch", fetchSpy);
    const res = await pushLeadToHighLevel(lead, {
      ...keys,
      HIGHLEVEL_PIPELINE_ID: "pipe",
      HIGHLEVEL_PIPELINE_STAGE_ID: "stage",
    });
    expect(res.ok).toBe(true);
    expect(res.contactId).toBe("c1");
    expect(res.opportunityId).toBeUndefined();
    expect(res.error).toMatch(/opportunities 422/);
  });

  it("never throws when fetch rejects", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("network down");
      }),
    );
    const res = await pushLeadToHighLevel(lead, keys);
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/network down/);
  });
});
