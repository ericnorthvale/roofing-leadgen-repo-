import { describe, it, expect, vi } from "vitest";

/**
 * Lead-persistence safety net: the env gate (skip without a token), the saved
 * path, and the never-throw error path. Same best-effort contract as notify.ts.
 *
 * The @vercel/blob module is mocked (not global fetch): the SDK's Node build
 * fetches via undici, so a fetch stub would not intercept it and unit tests
 * could hit the real network.
 *
 * No beforeEach mockClear/mockReset on the hoisted spy: with vitest 2.1 module
 * mocks that pattern makes a later mockRejectedValue escape as an unhandled
 * error despite the caller's try/catch. Clearing happens inside the one test
 * that counts calls instead.
 */

const putMock = vi.hoisted(() => vi.fn());
vi.mock("@vercel/blob", () => ({ put: putMock }));

import { persistLead, leadPathname, type LeadRecord } from "~/lib/lead-store";

const record: LeadRecord = {
  channel: "form",
  receivedAt: "2026-07-03T18:00:00.000Z",
  lead: { firstName: "Jane", phone: "+12815550123", lead_source: "organic" },
};

describe("leadPathname", () => {
  it("buckets by month and includes channel + timestamp + uuid", () => {
    const p = leadPathname(record, "abc-123");
    expect(p).toBe("leads/2026-07/form-2026-07-03T18-00-00-000Z-abc-123.json");
  });
});

describe("persistLead", () => {
  it("skips cleanly (no write) when the blob token is not configured", async () => {
    const res = await persistLead(record, {});
    expect(res.status).toBe("skipped");
    expect(putMock).not.toHaveBeenCalled();
  });

  it("returns 'error' (never throws) when the store write fails", async () => {
    putMock.mockRejectedValueOnce(new Error("Vercel Blob: This store does not exist."));
    const res = await persistLead(record, { BLOB_READ_WRITE_TOKEN: "vercel_blob_rw_test" });
    expect(res.status).toBe("error");
    expect(res.error).toContain("store does not exist");
  });

  it("writes one private JSON blob per lead when the token is set", async () => {
    putMock.mockClear();
    putMock.mockResolvedValue({ pathname: "leads/x.json" });
    const res = await persistLead(record, { BLOB_READ_WRITE_TOKEN: "vercel_blob_rw_test" });

    expect(res.status).toBe("saved");
    expect(res.pathname).toMatch(
      /^leads\/2026-07\/form-2026-07-03T18-00-00-000Z-[0-9a-f-]+\.json$/,
    );
    expect(putMock).toHaveBeenCalledTimes(1);
    const [pathname, body, opts] = putMock.mock.calls[0]!;
    expect(pathname).toBe(res.pathname);
    expect(JSON.parse(body as string)).toEqual(record);
    expect(opts).toMatchObject({
      access: "private",
      contentType: "application/json",
      addRandomSuffix: false,
      token: "vercel_blob_rw_test",
    });
  });
});
