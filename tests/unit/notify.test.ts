import { describe, it, expect, vi, afterEach } from "vitest";
import {
  notifyNewLead,
  buildSmsBody,
  buildEmailHtml,
  describeAlertRouting,
  DEFAULT_LEAD_ALERT_EMAIL_TO,
  DEFAULT_LEAD_ALERT_EMAIL_FROM,
  type LeadAlert,
} from "~/lib/notify";

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

/**
 * The email channel used to require THREE env values. It now needs only the
 * API key, because the key is the only one that is genuinely a secret. These
 * tests pin the two halves of that contract: the defaults are used when
 * nothing is set, and an env value still wins when one is — so deploying this
 * can never silently redirect alerts that were already routed somewhere.
 */
describe("email alert defaults", () => {
  afterEach(() => vi.unstubAllGlobals());

  /** Captures the Resend request body without any network access. */
  function stubResend() {
    const calls: Array<Record<string, unknown>> = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: string, init: { body: string }) => {
        calls.push(JSON.parse(init.body));
        return { ok: true, status: 200 } as Response;
      }),
    );
    return calls;
  }

  it("still sends with ONLY an API key, using the built-in owner address", async () => {
    const calls = stubResend();
    const result = await notifyNewLead(lead, { RESEND_API_KEY: "re_test" });
    expect(result.email).toBe("sent");
    expect(calls[0].to).toEqual([DEFAULT_LEAD_ALERT_EMAIL_TO]);
    expect(calls[0].from).toBe(DEFAULT_LEAD_ALERT_EMAIL_FROM);
  });

  it("lets an env recipient override the default, so existing routing survives", async () => {
    const calls = stubResend();
    await notifyNewLead(lead, {
      RESEND_API_KEY: "re_test",
      LEAD_ALERT_EMAIL_TO: "someone@else.com",
      LEAD_ALERT_EMAIL_FROM: "alerts@verified.com",
    });
    expect(calls[0].to).toEqual(["someone@else.com"]);
    expect(calls[0].from).toBe("alerts@verified.com");
  });

  it("supports several recipients", async () => {
    const calls = stubResend();
    await notifyNewLead(lead, {
      RESEND_API_KEY: "re_test",
      LEAD_ALERT_EMAIL_TO: "a@x.com, b@y.com",
    });
    expect(calls[0].to).toEqual(["a@x.com", "b@y.com"]);
  });

  it("still skips — never throws — when the API key is missing", async () => {
    const calls = stubResend();
    const result = await notifyNewLead(lead, { LEAD_ALERT_EMAIL_TO: "a@x.com" });
    expect(result.email).toBe("skipped");
    expect(calls).toHaveLength(0);
  });
});

describe("describeAlertRouting", () => {
  it("names the inbox and says the default is in use", () => {
    const s = describeAlertRouting({ RESEND_API_KEY: "re_test" });
    expect(s).toContain(DEFAULT_LEAD_ALERT_EMAIL_TO);
    expect(s).toContain("built-in default");
  });

  it("names the env inbox when one is set", () => {
    const s = describeAlertRouting({ RESEND_API_KEY: "re_test", LEAD_ALERT_EMAIL_TO: "a@x.com" });
    expect(s).toContain("a@x.com");
    expect(s).toContain("from env");
  });

  it("says plainly that nothing is being sent when the key is absent", () => {
    expect(describeAlertRouting({})).toContain("NOT SENDING");
  });

  it("never leaks the API key", () => {
    expect(describeAlertRouting({ RESEND_API_KEY: "re_supersecret" })).not.toContain("supersecret");
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
