/**
 * Roof measurement report → branded PDF.
 *
 * Runs in the browser (pdf-lib + the brand TTFs from /fonts/pdf), so there is
 * no server key, no env var and no per-download cost — it works on the owner's
 * "no Vercel configuration" constraint. pdf-lib is imported dynamically by the
 * caller so none of this weight loads until someone clicks Download.
 *
 * Hard rules this file exists to honour:
 *  - No pricing. Ever. The report states size, not money (owner, 2026-08).
 *  - Nothing is printed that the measurement didn't actually produce; a
 *    blocked measurement never reaches this module (see roof-report.ts).
 *  - The aerial photo is PUBLIC-DOMAIN USGS imagery, credited on the page.
 *    Google imagery must never be embedded here (geo-guidelines, Sheet 8).
 *  - NAP comes from brand.ts, never hardcoded.
 */

import type { PDFDocument, PDFFont, PDFPage, RGB } from "pdf-lib";
import { BRAND } from "~/lib/brand";
import {
  azimuthToCompass,
  formatImageryDate,
  pitchLabel,
  pitchRangeLabel,
  COMPLEXITY_LABEL,
  type RoofSummary,
} from "~/lib/roof-report";

export interface ReportInput {
  summary: RoofSummary;
  /** Formatted property address as the homeowner selected it. */
  address: string;
  /** Property JPEG bytes (street-level or aerial), or null. */
  propertyImage: Uint8Array | null;
  /** Credit line for whichever imagery source answered. */
  propertyImageCredit?: string;
  /** How the roof was measured, for the method line. */
  method: "aerial" | "manual";
  /** Injected in tests; defaults to now. */
  now?: Date;
}

/* ------------------------------------------------------------ brand ink -- */

const PAGE_W = 612; // US Letter, portrait
const PAGE_H = 792;
const MARGIN = 54;
const CONTENT_W = PAGE_W - MARGIN * 2;

/** Brand tokens mirrored from globals.css (docs/brand-guidelines.md §3). */
const HEX = {
  navy950: "#060e21",
  navy900: "#0e182f",
  navy100: "#e8ebf3",
  gold400: "#c9a26c",
  gold600: "#956e37",
  ink800: "#2e2f33",
  ink500: "#6e727c",
  ivory: "#f8f5ef",
  white: "#ffffff",
} as const;

type Ink = Record<keyof typeof HEX, RGB>;

/* --------------------------------------------------------------- assets -- */

const FONT_FILES = {
  serif: "/fonts/pdf/cormorant-600.ttf",
  body: "/fonts/pdf/montserrat-400.ttf",
  bodySemi: "/fonts/pdf/montserrat-600.ttf",
  bodyBold: "/fonts/pdf/montserrat-700.ttf",
} as const;

export type FontSet = Record<keyof typeof FONT_FILES, PDFFont>;

async function loadFonts(doc: PDFDocument, fetchImpl: typeof fetch): Promise<FontSet> {
  const entries = Object.entries(FONT_FILES) as [keyof typeof FONT_FILES, string][];
  const loaded = await Promise.all(
    entries.map(async ([key, path]) => {
      const res = await fetchImpl(path);
      if (!res.ok) throw new Error(`font ${path} → ${res.status}`);
      return [key, await doc.embedFont(await res.arrayBuffer(), { subset: true })] as const;
    }),
  );
  return Object.fromEntries(loaded) as FontSet;
}

/* ------------------------------------------------------------- drawing  -- */

interface Ctx {
  doc: PDFDocument;
  fonts: FontSet;
  ink: Ink;
}

const money = (n: number) => n.toLocaleString("en-US");

/** Wrap text to a width, returning the lines. */
function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawParagraph(
  page: PDFPage,
  text: string,
  opts: {
    x: number;
    y: number;
    font: PDFFont;
    size: number;
    color: RGB;
    width: number;
    leading?: number;
  },
): number {
  const leading = opts.leading ?? opts.size * 1.5;
  const lines = wrap(text, opts.font, opts.size, opts.width);
  lines.forEach((line, i) => {
    page.drawText(line, {
      x: opts.x,
      y: opts.y - i * leading,
      size: opts.size,
      font: opts.font,
      color: opts.color,
    });
  });
  return opts.y - (lines.length - 1) * leading;
}

/** The gold hairline the brand uses under headings. */
function goldRule(page: PDFPage, x: number, y: number, ink: Ink, width = 54) {
  page.drawRectangle({ x, y, width, height: 2, color: ink.gold400 });
}

/** Shared footer: NAP from brand.ts + the standing honesty line. */
function drawFooter(page: PDFPage, ctx: Ctx, pageLabel: string) {
  const { fonts, ink } = ctx;
  page.drawLine({
    start: { x: MARGIN, y: 64 },
    end: { x: PAGE_W - MARGIN, y: 64 },
    thickness: 0.75,
    color: ink.navy100,
  });
  page.drawText(`${BRAND.legalName} · ${BRAND.phoneDisplay} · ${BRAND.email}`, {
    x: MARGIN,
    y: 50,
    size: 7.5,
    font: fonts.body,
    color: ink.ink500,
  });
  page.drawText("Estimate from aerial imagery — confirmed on site before any contract price.", {
    x: MARGIN,
    y: 39,
    size: 7.5,
    font: fonts.body,
    color: ink.ink500,
  });
  const label = pageLabel;
  page.drawText(label, {
    x: PAGE_W - MARGIN - fonts.body.widthOfTextAtSize(label, 7.5),
    y: 50,
    size: 7.5,
    font: fonts.body,
    color: ink.ink500,
  });
}

/* ------------------------------------------------------------ page one  -- */

async function drawCover(
  ctx: Ctx,
  input: ReportInput,
  imageDims: { w: number; h: number } | null,
  embedded: unknown,
) {
  const { doc, fonts, ink } = ctx;
  const page = doc.addPage([PAGE_W, PAGE_H]);
  const { summary } = input;

  // Navy masthead.
  const bandH = 104;
  page.drawRectangle({ x: 0, y: PAGE_H - bandH, width: PAGE_W, height: bandH, color: ink.navy950 });
  page.drawText("NORTHVALE", {
    x: MARGIN,
    y: PAGE_H - 54,
    size: 26,
    font: fonts.serif,
    color: ink.white,
  });
  page.drawText("R O O F I N G", {
    x: MARGIN + 2,
    y: PAGE_H - 70,
    size: 7,
    font: fonts.bodySemi,
    color: ink.gold400,
  });
  const kicker = "ROOF MEASUREMENT REPORT";
  page.drawText(kicker, {
    x: PAGE_W - MARGIN - fonts.bodySemi.widthOfTextAtSize(kicker, 9),
    y: PAGE_H - 58,
    size: 9,
    font: fonts.bodySemi,
    color: ink.gold400,
  });

  let y = PAGE_H - bandH - 44;

  // Address + date.
  page.drawText("PREPARED FOR THE PROPERTY AT", {
    x: MARGIN,
    y,
    size: 8,
    font: fonts.bodySemi,
    color: ink.ink500,
  });
  y -= 26;
  y = drawParagraph(page, input.address || "Address not provided", {
    x: MARGIN,
    y,
    font: fonts.serif,
    size: 21,
    color: ink.navy900,
    width: CONTENT_W,
    leading: 25,
  });
  y -= 16;
  goldRule(page, MARGIN, y, ink);
  y -= 24;

  const dateStr = (input.now ?? new Date()).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  page.drawText(`Report date: ${dateStr}`, {
    x: MARGIN,
    y,
    size: 9,
    font: fonts.body,
    color: ink.ink500,
  });
  y -= 24;

  // Aerial image.
  if (embedded && imageDims) {
    const maxH = 232;
    const scale = Math.min(CONTENT_W / imageDims.w, maxH / imageDims.h);
    const w = imageDims.w * scale;
    const h = imageDims.h * scale;
    const x = MARGIN + (CONTENT_W - w) / 2;
    page.drawRectangle({
      x: x - 2,
      y: y - h - 2,
      width: w + 4,
      height: h + 4,
      color: ink.navy100,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    page.drawImage(embedded as any, { x, y: y - h, width: w, height: h });
    y -= h + 12;
    page.drawText(
      input.propertyImageCredit || "Aerial imagery: USGS The National Map (public domain)",
      {
        x: MARGIN,
        y,
        size: 7,
        font: fonts.body,
        color: ink.ink500,
      },
    );
    y -= 22;
  } else {
    y -= 6;
  }

  // Headline figure band.
  const bandTop = y;
  const bandHeight = 92;
  page.drawRectangle({
    x: MARGIN,
    y: bandTop - bandHeight,
    width: CONTENT_W,
    height: bandHeight,
    color: ink.ivory,
  });
  page.drawRectangle({
    x: MARGIN,
    y: bandTop - bandHeight,
    width: 3,
    height: bandHeight,
    color: ink.gold400,
  });

  const squares = summary.squares.toFixed(1);
  page.drawText("TOTAL ROOF AREA", {
    x: MARGIN + 22,
    y: bandTop - 26,
    size: 8,
    font: fonts.bodySemi,
    color: ink.ink500,
  });
  // Figures use Montserrat, not Cormorant: Cormorant's old-style numerals
  // render "11.1" as "II.I", which reads as Roman numerals on a measurement.
  page.drawText(squares, {
    x: MARGIN + 22,
    y: bandTop - 64,
    size: 34,
    font: fonts.bodyBold,
    color: ink.gold600,
  });
  page.drawText("squares measured", {
    x: MARGIN + 28 + fonts.bodyBold.widthOfTextAtSize(squares, 34),
    y: bandTop - 58,
    size: 11,
    font: fonts.body,
    color: ink.ink500,
  });
  page.drawText(
    `${summary.squaresWithWaste.toFixed(1)} squares to order, including the ${summary.waste.percent}% waste allowance`,
    { x: MARGIN + 22, y: bandTop - 82, size: 9, font: fonts.bodySemi, color: ink.navy900 },
  );

  const stats: [string, string][] = [
    ["Roof surface", `${money(summary.surfaceFt2)} ft²`],
    ["Footprint", `${money(summary.footprintFt2)} ft²`],
    ["Roof pitch", pitchRangeLabel(summary.pitchRangeDeg)],
  ];
  let sx = MARGIN + 236;
  for (const [label, value] of stats) {
    page.drawText(label.toUpperCase(), {
      x: sx,
      y: bandTop - 26,
      size: 7,
      font: fonts.bodySemi,
      color: ink.ink500,
    });
    page.drawText(value, {
      x: sx,
      y: bandTop - 46,
      size: 13,
      font: fonts.bodySemi,
      color: ink.navy900,
    });
    sx += 92;
  }

  y = bandTop - bandHeight - 26;

  // Confidence note when the measurement is usable but imperfect.
  if (summary.confidence.level === "reduced") {
    page.drawRectangle({
      x: MARGIN,
      y: y - 34,
      width: CONTENT_W,
      height: 40,
      color: ink.navy100,
    });
    drawParagraph(page, `Note: ${summary.confidence.message}`, {
      x: MARGIN + 12,
      y: y - 6,
      font: fonts.body,
      size: 8,
      color: ink.ink800,
      width: CONTENT_W - 24,
      leading: 11,
    });
    y -= 54;
  }

  drawFooter(page, ctx, "Page 1 of 2");
  return page;
}

/* ------------------------------------------------------------ page two  -- */

function drawDetail(ctx: Ctx, input: ReportInput) {
  const { doc, fonts, ink } = ctx;
  const page = doc.addPage([PAGE_W, PAGE_H]);
  const { summary } = input;

  let y = PAGE_H - 64;
  page.drawText("Measurement detail", {
    x: MARGIN,
    y,
    size: 20,
    font: fonts.serif,
    color: ink.navy900,
  });
  y -= 14;
  goldRule(page, MARGIN, y, ink);
  y -= 30;

  // How it was measured.
  const imagery = formatImageryDate(summary.imageryDate);
  const methodBits =
    input.method === "aerial"
      ? [
          `Measured plane by plane from aerial imagery${imagery ? ` captured ${imagery}` : ""}.`,
          summary.imageryQuality ? `Imagery quality: ${summary.imageryQuality.toLowerCase()}.` : "",
        ]
      : ["Measured from an operator-traced roof outline with the pitch noted below."];
  y = drawParagraph(page, methodBits.filter(Boolean).join(" "), {
    x: MARGIN,
    y,
    font: fonts.body,
    size: 9,
    color: ink.ink800,
    width: CONTENT_W,
    leading: 13,
  });
  y -= 28;

  // Plane-by-plane table — aerial only. A hand-traced outline has no measured
  // per-plane pitch or bearing, and printing a column we didn't measure would
  // be inventing data.
  if (input.method === "aerial" && summary.planes.length > 0) {
    page.drawText("ROOF PLANES", {
      x: MARGIN,
      y,
      size: 8,
      font: fonts.bodySemi,
      color: ink.ink500,
    });
    y -= 18;

    const cols = [MARGIN, MARGIN + 70, MARGIN + 210, MARGIN + 330];
    const headers = ["PLANE", "AREA", "PITCH", "FACING"];
    page.drawRectangle({ x: MARGIN, y: y - 6, width: CONTENT_W, height: 20, color: ink.navy950 });
    headers.forEach((h, i) => {
      page.drawText(h, { x: cols[i] + 8, y, size: 7.5, font: fonts.bodySemi, color: ink.white });
    });
    y -= 22;

    summary.planes.forEach((plane, i) => {
      if (i % 2 === 1) {
        page.drawRectangle({ x: MARGIN, y: y - 5, width: CONTENT_W, height: 18, color: ink.ivory });
      }
      const row = [
        `${i + 1}`,
        `${money(Math.round(plane.areaFt2))} ft²`,
        pitchLabel(plane.pitchDeg),
        azimuthToCompass(plane.azimuthDeg),
      ];
      row.forEach((cell, c) => {
        page.drawText(cell, {
          x: cols[c] + 8,
          y,
          size: 9,
          font: c === 0 ? fonts.bodySemi : fonts.body,
          color: ink.ink800,
        });
      });
      y -= 18;
    });
    y -= 14;
  }

  // Waste allowance.
  const w = summary.waste;
  page.drawText("WASTE ALLOWANCE", {
    x: MARGIN,
    y,
    size: 8,
    font: fonts.bodySemi,
    color: ink.ink500,
  });
  y -= 18;

  const boxH = 96;
  page.drawRectangle({
    x: MARGIN,
    y: y - boxH + 12,
    width: CONTENT_W,
    height: boxH,
    color: ink.ivory,
  });
  page.drawRectangle({ x: MARGIN, y: y - boxH + 12, width: 3, height: boxH, color: ink.gold400 });

  let by = y - 6;
  page.drawText(`Roof complexity: ${COMPLEXITY_LABEL[w.complexity]}`, {
    x: MARGIN + 18,
    y: by,
    size: 9.5,
    font: fonts.bodySemi,
    color: ink.navy900,
  });
  by -= 16;
  const breakdown =
    `${summary.planes.length} roof plane${summary.planes.length === 1 ? "" : "s"} resolved · ` +
    `base allowance ${Math.round(w.base * 100)}%` +
    (w.steepAdder > 0 ? ` + ${Math.round(w.steepAdder * 100)}% steep-pitch (9/12 or greater)` : "");
  by = drawParagraph(page, breakdown, {
    x: MARGIN + 18,
    y: by,
    font: fonts.body,
    size: 8.5,
    color: ink.ink800,
    width: CONTENT_W - 36,
    leading: 12,
  });
  by -= 20;

  page.drawText(`${w.percent}%`, {
    x: MARGIN + 18,
    y: by - 10,
    size: 20,
    font: fonts.bodyBold,
    color: ink.gold600,
  });
  page.drawText("allowance applied", {
    x: MARGIN + 18 + fonts.bodyBold.widthOfTextAtSize(`${w.percent}%`, 20) + 8,
    y: by - 5,
    size: 8,
    font: fonts.body,
    color: ink.ink500,
  });
  page.drawText("ESTIMATED SQUARES TO ORDER", {
    x: MARGIN + 250,
    y: by + 2,
    size: 7,
    font: fonts.bodySemi,
    color: ink.ink500,
  });
  page.drawText(`${summary.squaresWithWaste.toFixed(1)} squares`, {
    x: MARGIN + 250,
    y: by - 16,
    size: 15,
    font: fonts.bodySemi,
    color: ink.navy900,
  });

  y = y - boxH - 18;

  // What this is and isn't.
  page.drawText("WHAT THIS REPORT IS", {
    x: MARGIN,
    y,
    size: 8,
    font: fonts.bodySemi,
    color: ink.ink500,
  });
  y -= 16;
  const disclaimers = [
    "A measurement estimate produced from aerial data — not a quote, and not a material order.",
    "Aerial roof models read slightly under a full photogrammetric or on-site measurement: they tend to clip eaves and overhangs and to smooth out the steepest slopes. Treat this as a close estimate, not an ordering figure.",
    "Waste allowance is an industry-standard estimate based on roof complexity and pitch; it is not a guarantee of the quantity your roof will require.",
    "Tree cover, recent construction, and complex rooflines all affect aerial accuracy. Every measurement is verified on site before any contract price is given.",
    "This report contains no pricing. Your written price comes from a free on-site inspection.",
  ];
  for (const line of disclaimers) {
    page.drawText("•", { x: MARGIN, y, size: 9, font: fonts.body, color: ink.gold600 });
    y = drawParagraph(page, line, {
      x: MARGIN + 12,
      y,
      font: fonts.body,
      size: 8.5,
      color: ink.ink800,
      width: CONTENT_W - 12,
      leading: 12,
    });
    y -= 16;
  }

  y -= 6;

  // CTA.
  const ctaH = 62;
  page.drawRectangle({
    x: MARGIN,
    y: y - ctaH + 10,
    width: CONTENT_W,
    height: ctaH,
    color: ink.navy950,
  });
  page.drawText("Want the exact number, in writing?", {
    x: MARGIN + 20,
    y: y - 12,
    size: 13,
    font: fonts.serif,
    color: ink.white,
  });
  page.drawText(
    `Free inspection and a written estimate — same day you call. ${BRAND.phoneDisplay}`,
    { x: MARGIN + 20, y: y - 30, size: 9, font: fonts.body, color: ink.navy100 },
  );

  drawFooter(page, ctx, "Page 2 of 2");
  return page;
}

/* ----------------------------------------------------------------- api  -- */

/**
 * Build the report and return PDF bytes. `deps` is injectable so tests can run
 * this in Node with local font bytes instead of a browser fetch.
 */
export async function buildRoofReportPdf(
  input: ReportInput,
  deps?: { fetchImpl?: typeof fetch },
): Promise<Uint8Array> {
  const { PDFDocument, rgb } = await import("pdf-lib");
  const fontkit = (await import("@pdf-lib/fontkit")).default;
  const fetchImpl = deps?.fetchImpl ?? fetch;

  const doc = await PDFDocument.create();
  // Required before embedding any non-standard (brand) font.
  doc.registerFontkit(fontkit);
  doc.setTitle(`Roof Measurement Report — ${input.address || "Property"}`);
  doc.setAuthor(BRAND.legalName);
  doc.setSubject("Roof measurement estimate from aerial imagery. Not a quote.");
  doc.setProducer(BRAND.legalName);
  doc.setCreationDate(input.now ?? new Date());

  const hexToRgb = (hex: string) =>
    rgb(
      parseInt(hex.slice(1, 3), 16) / 255,
      parseInt(hex.slice(3, 5), 16) / 255,
      parseInt(hex.slice(5, 7), 16) / 255,
    );
  const ink = Object.fromEntries(Object.entries(HEX).map(([k, v]) => [k, hexToRgb(v)])) as Ink;

  const fonts = await loadFonts(doc, fetchImpl);
  const ctx: Ctx = { doc, fonts, ink };

  // Aerial photo is optional by design — a failed fetch must not fail the PDF.
  let embedded: unknown = null;
  let dims: { w: number; h: number } | null = null;
  if (input.propertyImage && input.propertyImage.byteLength > 0) {
    try {
      const img = await doc.embedJpg(input.propertyImage);
      embedded = img;
      dims = { w: img.width, h: img.height };
    } catch {
      embedded = null;
      dims = null;
    }
  }

  await drawCover(ctx, input, dims, embedded);
  drawDetail(ctx, input);

  return doc.save();
}

/** Safe, descriptive download filename from the address. */
export function reportFilename(address: string): string {
  const slug = (address || "property")
    .replace(/,.*$/, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return `Northvale-Roof-Report-${slug || "property"}.pdf`;
}
