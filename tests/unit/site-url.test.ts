import { describe, it, expect } from "vitest";
import { publicOrigin } from "~/lib/site-url";

const req = (url: string, headers: Record<string, string> = {}) => new Request(url, { headers });

describe("publicOrigin", () => {
  it("uses x-forwarded-host/proto when present (Vercel)", () => {
    // request.url is localhost on the serverless runtime; the real host is forwarded.
    const r = req("https://localhost/api/auth/login", {
      "x-forwarded-host": "northvaleroofing.com",
      "x-forwarded-proto": "https",
    });
    expect(publicOrigin(r)).toBe("https://northvaleroofing.com");
  });

  it("takes the first value when forwarded headers are comma-lists", () => {
    const r = req("https://localhost/x", {
      "x-forwarded-host": "northvaleroofing.com, internal",
      "x-forwarded-proto": "https,http",
    });
    expect(publicOrigin(r)).toBe("https://northvaleroofing.com");
  });

  it("falls back to the host header, then the URL host", () => {
    expect(publicOrigin(req("https://example.com/x"))).toBe("https://example.com");
    expect(publicOrigin(req("https://localhost/x", { host: "preview.vercel.app" }))).toBe(
      "https://preview.vercel.app",
    );
  });
});
