import { describe, it, expect, vi, afterEach } from "vitest";
import { sendMetaLeadEvent, type MetaLeadInput } from "~/lib/meta-capi";

const lead: MetaLeadInput = {
  email: "Jane@Example.com",
  phone: "+1 (281) 555-0123",
  firstName: "Jane",
  city: "Spring",
  zip: "77379",
  fbclid: "abc123",
  leadSource: "facebook",
  eventTime: 1_700_000_000,
};

const keys = { META_PIXEL_ID: "pix", META_CAPI_TOKEN: "tok" };

afterEach(() => vi.unstubAllGlobals());

describe("sendMetaLeadEvent", () => {
  it("skips cleanly when pixel id / token are not configured", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const res = await sendMetaLeadEvent(lead, {});
    expect(res.status).toBe("skipped");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("hashes PII and POSTs a single Lead event when configured", async () => {
    const fetchSpy = vi.fn(
      async (_url: string, _init: RequestInit) =>
        ({ ok: true, status: 200 }) as unknown as Response,
    );
    vi.stubGlobal("fetch", fetchSpy);

    const res = await sendMetaLeadEvent(lead, keys);
    expect(res.status).toBe("sent");
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toContain("/pix/events");
    const payload = JSON.parse(init.body as string);
    const event = payload.data[0];
    expect(event.event_name).toBe("Lead");
    // Raw email must never be sent — only its SHA-256 hash (64 hex chars).
    const raw = init.body as string;
    expect(raw).not.toContain("jane@example.com");
    expect(raw).not.toContain("Jane@Example.com");
    expect(event.user_data.em[0]).toMatch(/^[a-f0-9]{64}$/);
    expect(event.user_data.ph[0]).toMatch(/^[a-f0-9]{64}$/);
    expect(event.user_data.fbc).toBe("fb.1.1700000000.abc123");
    expect(event.custom_data.lead_source).toBe("facebook");
  });

  it("returns error (never throws) when the API call fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: false, status: 400 }) as unknown as Response),
    );
    const res = await sendMetaLeadEvent(lead, keys);
    expect(res.status).toBe("error");
    expect(res.error).toMatch(/400/);
  });
});
