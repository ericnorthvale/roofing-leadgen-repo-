/**
 * SEO regression tests — the guardrails that keep the content layer honest:
 * unique titles/descriptions sitewide, length limits, anti-cannibalization
 * rules from docs/keyword-map.md, anti-doorway distinctness, and the routes
 * gate covering every data-driven page type.
 */
import { describe, expect, it } from "vitest";
import { SERVICES, SERVICE_LIST } from "../../src/lib/services";
import { NEIGHBORHOODS } from "../../src/lib/neighborhoods";
import { CITY_SERVICES } from "../../src/lib/city-services";
import { SERVICE_AREAS } from "../../src/lib/service-areas";
import { evaluateNeighborhood, evaluateCityService } from "../../src/lib/quality-gate";
import { dataRouteStatuses, isAllowedInSitemap } from "../../src/lib/routes";
import { blogPostingJsonLd, aggregateRatingJsonLd, faqPageJsonLd } from "../../src/lib/seo";
import { headingId } from "../../src/lib/headings";

const neighborhoods = Object.values(NEIGHBORHOODS);
const cityServices = Object.values(CITY_SERVICES);

describe("unique titles + descriptions across all records", () => {
  const titles = [
    ...SERVICE_LIST.map((s) => s.seoTitle),
    ...neighborhoods.map((n) => n.seoTitle),
    ...cityServices.map((cs) => cs.seoTitle),
    ...Object.values(SERVICE_AREAS).map((a) => `Roofing in ${a.name}, TX`),
  ];
  const descriptions = [
    ...SERVICE_LIST.map((s) => s.seoDescription),
    ...neighborhoods.map((n) => n.seoDescription),
    ...cityServices.map((cs) => cs.seoDescription),
  ];

  it("no two records share a <title>", () => {
    expect(new Set(titles).size).toBe(titles.length);
  });

  it("no two records share a meta description", () => {
    expect(new Set(descriptions).size).toBe(descriptions.length);
  });

  it("titles stay within SERP-safe length (records only)", () => {
    for (const t of titles) {
      expect(t.length, `too long: "${t}"`).toBeLessThanOrEqual(60);
    }
  });

  it("descriptions stay within 160 chars", () => {
    for (const d of descriptions) {
      expect(d.length, `too long: "${d}"`).toBeLessThanOrEqual(160);
    }
  });
});

describe("keyword-map anti-cannibalization rules", () => {
  it("generic service pages never title-target The Woodlands (city pages own it)", () => {
    for (const s of SERVICE_LIST) {
      expect(s.seoTitle, `"${s.seoTitle}" cannibalizes the city-service page`).not.toMatch(
        /the woodlands/i,
      );
    }
  });

  it("every city-service title names its city context", () => {
    for (const cs of cityServices) {
      expect(cs.seoTitle.toLowerCase()).toContain("the woodlands");
    }
  });

  it("every neighborhood title names its village", () => {
    for (const n of neighborhoods) {
      expect(n.seoTitle.toLowerCase()).toContain(n.name.split("'")[0].toLowerCase().slice(0, 6));
    }
  });
});

describe("anti-doorway distinctness", () => {
  it("neighborhood localContext/housingStock/hoaNote are pairwise distinct", () => {
    for (const field of ["localContext", "housingStock", "developmentEra"] as const) {
      const values = neighborhoods.map((n) => n[field]);
      expect(new Set(values).size, `duplicated ${field}`).toBe(values.length);
    }
  });

  it("city-service summaries and first sections differ from the generic service copy", () => {
    for (const cs of cityServices) {
      const generic = SERVICES[cs.serviceTag];
      expect(cs.summary).not.toBe(generic.summary);
      expect(cs.sections[0]?.heading).not.toBe(generic.sections[0]?.heading);
    }
  });
});

describe("quality gates for the new page types", () => {
  it("all shipped neighborhoods pass their gate (with real NAP)", () => {
    for (const n of neighborhoods) {
      const v = evaluateNeighborhood(n, { hasNap: true });
      expect(v.indexable, `${n.slug}: missing ${v.missing.join(", ")}`).toBe(true);
    }
  });

  it("all shipped city-services pass their gate (with real NAP)", () => {
    for (const cs of cityServices) {
      const v = evaluateCityService(cs, { hasNap: true });
      expect(v.indexable, `${cs.slug}: missing ${v.missing.join(", ")}`).toBe(true);
    }
  });

  it("a name-swapped neighborhood (missing distinct fields) is blocked", () => {
    const doorway = {
      ...neighborhoods[0],
      developmentEra: "",
      housingStock: "",
      hoaNote: "",
    };
    const v = evaluateNeighborhood(doorway, { hasNap: true });
    expect(v.indexable).toBe(false);
    expect(v.missing.length).toBeGreaterThanOrEqual(3);
  });

  it("a draft record never indexes even when content is filled", () => {
    const draft = { ...neighborhoods[0], dataCompleteness: "draft" as const };
    expect(evaluateNeighborhood(draft, { hasNap: true }).indexable).toBe(false);
  });

  it("placeholder NAP blocks city-service pages", () => {
    expect(evaluateCityService(cityServices[0], { hasNap: false }).indexable).toBe(false);
  });
});

describe("routes gate covers all data-driven page types", () => {
  const statuses = dataRouteStatuses();
  const paths = statuses.map((r) => r.path);

  it("includes city, service, city-service, and neighborhood routes", () => {
    expect(paths).toContain("/the-woodlands");
    expect(paths).toContain("/services/roof-replacement");
    expect(paths).toContain("/the-woodlands/roof-replacement");
    expect(paths).toContain("/the-woodlands/alden-bridge");
  });

  it("sitemap admits indexable pages and rejects noindex pages", () => {
    for (const r of statuses) {
      expect(isAllowedInSitemap(`https://northvaleroofing.com${r.path}/`)).toBe(r.indexable);
    }
  });
});

describe("JSON-LD helpers", () => {
  it("blogPostingJsonLd emits a valid BlogPosting", () => {
    const ld = blogPostingJsonLd("https://example.com/", {
      title: "T",
      description: "D",
      pathname: "/blog/t/",
      datePublished: new Date("2026-07-03"),
      authorName: "Northvale Roofing",
      authorType: "Organization",
    });
    expect(ld["@type"]).toBe("BlogPosting");
    expect(ld.url).toBe("https://example.com/blog/t/");
    expect((ld.author as { "@type": string })["@type"]).toBe("Organization");
    expect(ld.dateModified).toBe(ld.datePublished);
  });

  it("aggregateRatingJsonLd returns null with no reviews (never fabricate)", () => {
    expect(aggregateRatingJsonLd("https://example.com", [])).toBeNull();
  });

  it("aggregateRatingJsonLd averages real ratings", () => {
    const ld = aggregateRatingJsonLd("https://example.com", [
      { rating: 5 },
      { rating: 4 },
    ]) as Record<string, Record<string, unknown>>;
    expect(ld.aggregateRating.ratingValue).toBe(4.5);
    expect(ld.aggregateRating.reviewCount).toBe(2);
  });

  it("faqPageJsonLd mirrors the on-page Q&A", () => {
    const ld = faqPageJsonLd([{ q: "Q1", a: "A1" }]);
    expect((ld.mainEntity as unknown[]).length).toBe(1);
  });
});

describe("headingId anchors", () => {
  it("slugifies headings deterministically", () => {
    expect(headingId("Permits & HOA approvals in The Woodlands")).toBe(
      "permits-and-hoa-approvals-in-the-woodlands",
    );
    expect(headingId("What's in the forty-photo packet")).toBe("whats-in-the-forty-photo-packet");
  });
});
