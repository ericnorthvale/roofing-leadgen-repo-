import { describe, it, expect, vi } from "vitest";
import {
  appendLeadToSheet,
  describeSheetRouting,
  type SheetLead,
  type SheetsEnv,
} from "~/lib/sheets";

const lead: SheetLead = {
  receivedAt: "2026-11-23T21:00:00.000Z",
  channel: "form",
  firstName: "Jane",
  lastName: "Doe",
  phone: "+12815550123",
  email: "jane@example.com",
  address: "1 Main St",
  city: "Spring",
  zip: "77379",
  service: "storm",
  notes: "Hail last night",
  source: "area:spring",
  utmSource: "google",
  landingPath: "/spring/roof-replacement",
};

const ENV: SheetsEnv = { LEADS_SHEET_WEBHOOK_URL: "https://script.google.com/macros/s/AKf/exec" };

describe("appendLeadToSheet", () => {
  it("skips cleanly when no webhook URL is configured", async () => {
    const fetchImpl = vi.fn();
    const res = await appendLeadToSheet(lead, {}, { fetchImpl: fetchImpl as never });
    expect(res.status).toBe("skipped");
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("skips on a blank URL rather than posting to nowhere", async () => {
    const fetchImpl = vi.fn();
    const res = await appendLeadToSheet(
      lead,
      { LEADS_SHEET_WEBHOOK_URL: "   " },
      { fetchImpl: fetchImpl as never },
    );
    expect(res.status).toBe("skipped");
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  /** A success reply from the Apps Script. */
  const okReply = () =>
    ({ ok: true, status: 200, text: async () => JSON.stringify({ ok: true }) }) as Response;

  it("posts every field the sheet has a column for", async () => {
    let body: Record<string, unknown> = {};
    const fetchImpl = vi.fn(async (_u: string, init: { body: string }) => {
      body = JSON.parse(init.body);
      return okReply();
    });
    const res = await appendLeadToSheet(lead, ENV, { fetchImpl: fetchImpl as never });
    expect(res.status).toBe("sent");
    expect(body).toMatchObject({
      receivedAt: lead.receivedAt,
      channel: "form",
      firstName: "Jane",
      lastName: "Doe",
      phone: "+12815550123",
      email: "jane@example.com",
      address: "1 Main St",
      city: "Spring",
      zip: "77379",
      service: "storm",
      notes: "Hail last night",
      source: "area:spring",
      utmSource: "google",
      landingPath: "/spring/roof-replacement",
    });
  });

  it("sends empty strings rather than undefined, so columns never shift", async () => {
    let body: Record<string, unknown> = {};
    const fetchImpl = vi.fn(async (_u: string, init: { body: string }) => {
      body = JSON.parse(init.body);
      return okReply();
    });
    await appendLeadToSheet(
      { receivedAt: "t", channel: "form", firstName: "Jo", phone: "+1", source: "website" },
      ENV,
      { fetchImpl: fetchImpl as never },
    );
    for (const k of ["lastName", "email", "address", "city", "zip", "service", "notes"]) {
      expect(body[k]).toBe("");
    }
  });

  /**
   * The contract that matters. A spreadsheet row is the least important thing
   * that happens to a lead, and it must never be the reason one is lost — so
   * neither a bad response nor a thrown network error may escape.
   */
  it("records a non-ok response as an error and does not throw", async () => {
    const fetchImpl = vi.fn(
      async () => ({ ok: false, status: 500, text: async () => "" }) as Response,
    );
    const res = await appendLeadToSheet(lead, ENV, { fetchImpl: fetchImpl as never });
    expect(res.status).toBe("error");
    expect(res.error).toContain("500");
  });

  /**
   * The failure that cost an afternoon. A Web App deployed with anything other
   * than "Who has access: Anyone" answers a server POST with Google's sign-in
   * page: HTML, status 200. Checking only res.ok reports "sent" on every lead
   * while the sheet stays empty and the logs look perfect.
   */
  it("treats a 200 sign-in page as an error, not a success", async () => {
    const fetchImpl = vi.fn(
      async () =>
        ({
          ok: true,
          status: 200,
          text: async () => "<html><body>Sign in - accounts.google.com</body></html>",
        }) as Response,
    );
    const res = await appendLeadToSheet(lead, ENV, { fetchImpl: fetchImpl as never });
    expect(res.status).toBe("error");
    expect(res.error).toContain("Who has access");
  });

  it("treats the script's own failure reply as an error", async () => {
    const fetchImpl = vi.fn(
      async () =>
        ({
          ok: true,
          status: 200,
          text: async () => JSON.stringify({ ok: false, error: "no body" }),
        }) as Response,
    );
    const res = await appendLeadToSheet(lead, ENV, { fetchImpl: fetchImpl as never });
    expect(res.status).toBe("error");
    expect(res.error).toContain("no body");
  });

  it("swallows a thrown network error", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error("ECONNRESET");
    });
    const res = await appendLeadToSheet(lead, ENV, { fetchImpl: fetchImpl as never });
    expect(res.status).toBe("error");
    expect(res.error).toContain("ECONNRESET");
  });
});

describe("describeSheetRouting", () => {
  it("says when it is configured, without revealing the URL", () => {
    const s = describeSheetRouting(ENV);
    expect(s).toContain("configured");
    expect(s).not.toContain("script.google.com");
    expect(s).not.toContain("AKf");
  });

  it("says plainly when it is not configured", () => {
    expect(describeSheetRouting({})).toContain("not configured");
  });
});
