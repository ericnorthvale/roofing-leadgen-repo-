import { describe, it, expect } from "vitest";
import { notifyNewLead, buildSmsBody, buildEmailHtml, type LeadAlert } from "~/lib/notify";

const lead: LeadAlert = {
  firstName: "Jane",
  lastName: "Doe",
  phone: "+12815550123",
  email: "jane@example.com",
  city: "Spring",
  zip: "77379",
  service: "storm",
  source: "area:spring",
  utmSource: "google",
};

describe("notifyNewLead", () => {
  it("skips both channels cleanly when no keys are configured (safety net no-op)", async () => {
    const result = await notifyNewLead(lead, {});
    expect(result.sms).toBe("skipped");
    expect(result.email).toBe("skipped");
    expect(result.errors).toHaveLength(0);
  });

  it("skips SMS when only partial Twilio config is present", async () => {
    const result = await notifyNewLead(lead, { TWILIO_ACCOUNT_SID: "AC", TWILIO_AUTH_TOKEN: "x" });
    expect(result.sms).toBe("skipped");
  });
});

describe("message builders", () => {
  it("SMS body includes name, phone, and source", () => {
    const body = buildSmsBody(lead);
    expect(body).toContain("Jane Doe");
    expect(body).toContain("+12815550123");
    expect(body).toContain("area:spring/google");
  });

  it("email HTML escapes user input", () => {
    const html = buildEmailHtml({ ...lead, notes: "<script>alert(1)</script>" });
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("&lt;script&gt;");
  });
});
