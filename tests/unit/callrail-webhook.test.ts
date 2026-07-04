import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";

/**
 * Webhook tests: the rate limit, signature gate, the unconfigured 503, the
 * pre-call de-dupe skip, and a real Post-Call event reaching HighLevel, the
 * blob safety net, and Meta CAPI (mocked network).
 *
 * @vercel/blob is module-mocked (its Node build fetches via undici, which a
 * fetch stub would not intercept).
 */

const putMock = vi.hoisted(() => vi.fn());
vi.mock("@vercel/blob", () => ({ put: putMock }));

import { POST } from "~/pages/api/callrail-webhook";
import { _resetRateLimit } from "~/lib/rate-limit";

const SECRET = "test-secret";

/** Same HMAC-SHA1 hex the lib verifies against, so we can sign test bodies. */
async function sign(body: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function ctx(rawBody: string, signature?: string) {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (signature) headers.signature = signature;
  const request = new Request("https://northvaleroofing.com/api/callrail-webhook", {
    method: "POST",
    headers,
    body: rawBody,
  });
  return { request } as unknown as Parameters<typeof POST>[0];
}

const postCall = JSON.stringify({
  id: "CAL123",
  direction: "inbound",
  answered: true,
  duration: 95,
  customer_phone_number: "+12815550123",
  tracking_phone_number: "+17134497661",
  source_name: "Google Organic",
  utm_source: "google",
});

beforeEach(() => _resetRateLimit());
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("POST /api/callrail-webhook", () => {
  it("returns 503 when the webhook secret is not configured", async () => {
    const res = await POST(ctx(postCall, "whatever"));
    expect(res.status).toBe(503);
  });

  it("returns 401 on an invalid signature", async () => {
    vi.stubEnv("CALLRAIL_WEBHOOK_SECRET", SECRET);
    const res = await POST(ctx(postCall, "deadbeef"));
    expect(res.status).toBe(401);
  });

  it("ignores a pre-call event (no duration) without pushing", async () => {
    vi.stubEnv("CALLRAIL_WEBHOOK_SECRET", SECRET);
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const preCall = JSON.stringify({
      id: "CAL124",
      direction: "inbound",
      customer_phone_number: "+12815550123",
      tracking_phone_number: "+17134497661",
    });
    const res = await POST(ctx(preCall, await sign(preCall, SECRET)));
    expect(res.status).toBe(200);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("pushes a completed inbound call to HighLevel", async () => {
    vi.stubEnv("CALLRAIL_WEBHOOK_SECRET", SECRET);
    vi.stubEnv("HIGHLEVEL_API_KEY", "tok");
    vi.stubEnv("HIGHLEVEL_LOCATION_ID", "loc");
    const fetchSpy = vi.fn(
      async (_url: string) =>
        ({
          ok: true,
          status: 200,
          json: async () => ({ contact: { id: "c1" } }),
        }) as unknown as Response,
    );
    vi.stubGlobal("fetch", fetchSpy);

    const res = await POST(ctx(postCall, await sign(postCall, SECRET)));
    expect(res.status).toBe(200);
    expect(fetchSpy).toHaveBeenCalled();
    expect(fetchSpy.mock.calls[0][0]).toContain("/contacts/upsert");
  });

  it("rate-limits a flood (429) — same policy as /api/lead", async () => {
    vi.stubEnv("CALLRAIL_WEBHOOK_SECRET", SECRET);
    const signature = await sign(postCall, SECRET);
    let last: Response | undefined;
    for (let i = 0; i < 12; i++) last = await POST(ctx(postCall, signature));
    expect(last!.status).toBe(429);
  });

  it("persists an actionable call to the blob store when the token is set", async () => {
    vi.stubEnv("CALLRAIL_WEBHOOK_SECRET", SECRET);
    vi.stubEnv("BLOB_READ_WRITE_TOKEN", "vercel_blob_rw_test");
    putMock.mockClear();
    putMock.mockResolvedValue({ pathname: "leads/x.json" });

    const res = await POST(ctx(postCall, await sign(postCall, SECRET)));
    expect(res.status).toBe(200);
    expect(putMock).toHaveBeenCalledTimes(1);

    const [pathname, body] = putMock.mock.calls[0]!;
    expect(pathname).toMatch(/^leads\/\d{4}-\d{2}\/phone-.+\.json$/);
    const record = JSON.parse(body as string);
    expect(record.channel).toBe("phone");
    expect(record.lead.callrail_call_id).toBe("CAL123");
    expect(record.lead.phone).toBe("+12815550123");
  });

  it("does not persist ignored pre-call events", async () => {
    vi.stubEnv("CALLRAIL_WEBHOOK_SECRET", SECRET);
    vi.stubEnv("BLOB_READ_WRITE_TOKEN", "vercel_blob_rw_test");
    putMock.mockClear();
    const preCall = JSON.stringify({
      id: "CAL125",
      direction: "inbound",
      customer_phone_number: "+12815550123",
      tracking_phone_number: "+17134497661",
    });
    const res = await POST(ctx(preCall, await sign(preCall, SECRET)));
    expect(res.status).toBe(200);
    expect(putMock).not.toHaveBeenCalled();
  });

  it("fires a Meta CAPI phone_call Lead with the call id as event id", async () => {
    vi.stubEnv("CALLRAIL_WEBHOOK_SECRET", SECRET);
    vi.stubEnv("META_PIXEL_ID", "px-1");
    vi.stubEnv("META_CAPI_TOKEN", "capi-token");
    const fetchSpy = vi.fn(
      async (_url: string, _init?: RequestInit) => new Response("{}", { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchSpy);

    const res = await POST(ctx(postCall, await sign(postCall, SECRET)));
    expect(res.status).toBe(200);

    const metaCall = fetchSpy.mock.calls.find(([url]) =>
      String(url).includes("graph.facebook.com"),
    );
    expect(metaCall).toBeTruthy();
    const payload = JSON.parse((metaCall![1] as RequestInit).body as string);
    expect(payload.data[0].event_name).toBe("Lead");
    expect(payload.data[0].action_source).toBe("phone_call");
    expect(payload.data[0].event_id).toBe("CAL123");
    // Caller phone is hashed, never sent raw.
    expect(payload.data[0].user_data.ph[0]).toMatch(/^[0-9a-f]{64}$/);
  });
});
