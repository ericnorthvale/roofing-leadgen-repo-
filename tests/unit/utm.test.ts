import { describe, expect, it } from "vitest";
import { parseUtmFromUrl, hasAnyUtm, serializeUtm, deserializeUtm } from "~/lib/utm";

describe("utm helpers", () => {
  it("parses standard utm keys + gclid + fbclid", () => {
    const url = new URL(
      "https://example.com/?utm_source=google&utm_medium=cpc&utm_campaign=brand&gclid=abc",
    );
    const out = parseUtmFromUrl(url);
    expect(out.source).toBe("google");
    expect(out.medium).toBe("cpc");
    expect(out.campaign).toBe("brand");
    expect(out.gclid).toBe("abc");
  });

  it("reports empty payload as having nothing", () => {
    expect(hasAnyUtm({})).toBe(false);
  });

  it("round-trips via serialize/deserialize", () => {
    const raw = serializeUtm({ source: "meta", campaign: "launch" });
    expect(deserializeUtm(raw)).toEqual({ source: "meta", campaign: "launch" });
  });

  it("returns {} for bad JSON", () => {
    expect(deserializeUtm("not json")).toEqual({});
  });
});
