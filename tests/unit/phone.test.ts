import { describe, expect, it } from "vitest";
import { formatPhoneDisplay, telHref, smsHref } from "~/lib/phone";

describe("phone helpers", () => {
  it("formats a 10-digit E.164 to US pretty format", () => {
    expect(formatPhoneDisplay("+12810000000")).toBe("(281) 000-0000");
  });

  it("returns a tel: href", () => {
    expect(telHref("+12815551234")).toBe("tel:+12815551234");
  });

  it("returns an sms: href with encoded body", () => {
    expect(smsHref("+12815551234", "Hi & thanks")).toBe("sms:+12815551234?body=Hi%20%26%20thanks");
  });

  it("falls back to the raw string when format fails", () => {
    expect(formatPhoneDisplay("not-a-number")).toBe("not-a-number");
  });
});
