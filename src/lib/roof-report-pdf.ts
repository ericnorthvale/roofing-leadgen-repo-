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
  pitchToRise12,
  slopeFactor,
  COMMON_SLOPE_FACTORS,
  COMPLEXITY_LABEL,
  type Complexity,
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

/**
 * A stable reference for this report: date plus a short hash of the address.
 * It is only an identifier — it encodes nothing about the roof — but it lets a
 * reader and a roofer talk about "report RM-261007-K4Q2" instead of "the PDF",
 * and it ties the pages of a printed copy together.
 */
export function reportReference(address: string, date: Date): string {
  const yy = String(date.getFullYear() % 100).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  // FNV-1a over the address: short, deterministic, and good enough to keep two
  // reports run on the same day apart.
  let h = 0x811c9dc5;
  for (const ch of address.toUpperCase()) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I/O/0/1
  let tail = "";
  for (let i = 0; i < 4; i++) {
    tail += alphabet[(h >>> (i * 5)) & 31];
  }
  return `RM-${yy}${mm}${dd}-${tail}`;
}

/** Shared footer: NAP from brand.ts + the standing honesty line. */
function drawFooter(page: PDFPage, ctx: Ctx, pageLabel: string, note?: string, reference?: string) {
  const { fonts, ink } = ctx;
  page.drawLine({
    start: { x: MARGIN, y: 64 },
    end: { x: PAGE_W - MARGIN, y: 64 },
    thickness: 0.75,
    color: ink.navy100,
  });
  page.drawText(`Measurement prepared by ${BRAND.legalName} · ${BRAND.phoneDisplay}`, {
    x: MARGIN,
    y: 50,
    size: 7.5,
    font: fonts.body,
    color: ink.ink500,
  });
  page.drawText(note ?? "Estimate — confirmed on site before any contract price.", {
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
  if (reference) {
    page.drawText(reference, {
      x: PAGE_W - MARGIN - fonts.body.widthOfTextAtSize(reference, 7.5),
      y: 39,
      size: 7.5,
      font: fonts.body,
      color: ink.ink500,
    });
  }
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

  // Masthead. The document leads with what it IS, not with who produced it:
  // this is a measurement record, and a homeowner comparing it against an
  // EagleView or a contractor's own figures should read it as information
  // rather than as a pitch (owner, 2026-10). Who measured it is disclosed
  // plainly in the footer of every page, never implied away.
  const bandH = 104;
  page.drawRectangle({ x: 0, y: PAGE_H - bandH, width: PAGE_W, height: bandH, color: ink.navy950 });
  page.drawText("ROOF MEASUREMENT REPORT", {
    x: MARGIN,
    y: PAGE_H - 56,
    size: 21,
    font: fonts.serif,
    color: ink.white,
  });
  page.drawText("A R E A   ·   P I T C H   ·   M A T E R I A L  Q U A N T I T Y", {
    x: MARGIN + 2,
    y: PAGE_H - 72,
    size: 7,
    font: fonts.bodySemi,
    color: ink.gold400,
  });

  let y = PAGE_H - bandH - 44;

  // Address + date.
  page.drawText("SUBJECT PROPERTY", {
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
  const reference = reportReference(input.address, input.now ?? new Date());
  page.drawText(`Report no. ${reference}`, {
    x: PAGE_W - MARGIN - fonts.body.widthOfTextAtSize(`Report no. ${reference}`, 9),
    y,
    size: 9,
    font: fonts.body,
    color: ink.ink500,
  });
  y -= 24;

  // Aerial image.
  if (embedded && imageDims) {
    const maxH = 190;
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

  y = bandTop - bandHeight - 22;

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

  // Contents, not a call to action. The cover is the page that gets printed
  // and forwarded, so it tells the reader what each figure in here means and
  // where to find the working — the job of a measurement document.
  page.drawText("WHAT THIS REPORT CONTAINS", {
    x: MARGIN,
    y,
    size: 8,
    font: fonts.bodySemi,
    color: ink.ink500,
  });
  y -= 20;
  const steps: [string, string][] = [
    [
      "The measured roof, section by section",
      "The outline the roof was measured from, drawn to scale, with the area of each section and the arithmetic that turns footprint into roof surface.",
    ],
    [
      "Waste allowance and the quantity to order",
      "Why a roof needs more material than its measured area, how the allowance here was set, and the resulting figure a supplier would be asked for.",
    ],
    [
      "Method, and what this measurement cannot show",
      "How the figures were produced, what they exclude, and the checks that still have to happen on the roof itself.",
    ],
  ];
  steps.forEach(([title, body], i) => {
    const n = `${i + 1}`;
    page.drawCircle({ x: MARGIN + 7, y: y + 3, size: 8, color: ink.navy950 });
    page.drawText(n, {
      x: MARGIN + 7 - fonts.bodySemi.widthOfTextAtSize(n, 7) / 2,
      y,
      size: 7,
      font: fonts.bodySemi,
      color: ink.white,
    });
    page.drawText(title, {
      x: MARGIN + 22,
      y,
      size: 9.5,
      font: fonts.bodySemi,
      color: ink.navy900,
    });
    y = drawParagraph(page, body, {
      x: MARGIN + 22,
      y: y - 13,
      font: fonts.body,
      size: 8.5,
      color: ink.ink800,
      width: CONTENT_W - 22,
      leading: 11.5,
    });
    y -= 18;
  });

  return page;
}

/* --------------------------------------------------------------- diagram -- */

/**
 * Scale drawing of the roof the person actually traced, with each section
 * labelled and sized.
 *
 * This is only drawn in trace mode, and that distinction matters: these are
 * outlines a human drew on a satellite view, not shapes inferred from a model.
 * Earlier builds could not show a diagram honestly because Google publishes
 * crude bounding boxes rather than real facet geometry.
 *
 * Returns the y position below the drawing, or the input y when there is
 * nothing to draw.
 */
function drawRoofDiagram(ctx: Ctx, page: PDFPage, summary: RoofSummary, top: number): number {
  const { fonts, ink } = ctx;
  const outlines = summary.planes
    .map((p) => p.outline)
    .filter((o): o is { lat: number; lng: number }[] => !!o && o.length >= 3);
  if (outlines.length === 0) return top;

  // Project lat/lng to local metres about the centroid. Over one property the
  // flat-earth approximation is far below drawing precision.
  const all = outlines.flat();
  const lat0 = all.reduce((a, p) => a + p.lat, 0) / all.length;
  const lng0 = all.reduce((a, p) => a + p.lng, 0) / all.length;
  const mPerLat = 111320;
  const mPerLng = 111320 * Math.cos((lat0 * Math.PI) / 180);
  const projected = outlines.map((o) =>
    o.map((p) => ({ x: (p.lng - lng0) * mPerLng, y: (p.lat - lat0) * mPerLat })),
  );

  const xs = projected.flat().map((p) => p.x);
  const ys = projected.flat().map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const spanX = Math.max(1, maxX - minX);
  const spanY = Math.max(1, maxY - minY);

  const boxW = CONTENT_W;
  const boxH = 260;
  const pad = 26;
  const footer = 26; // clear lane at the bottom for the scale bar
  const usableH = boxH - pad - footer;
  const scale = Math.min((boxW - pad * 2) / spanX, usableH / spanY);
  const drawW = spanX * scale;
  const drawH = spanY * scale;
  const originX = MARGIN + (boxW - drawW) / 2 - minX * scale;
  // PDF y grows upward and so does latitude, so no flip is needed.
  const originY = top - boxH + footer + (usableH - drawH) / 2 - minY * scale;

  page.drawRectangle({
    x: MARGIN,
    y: top - boxH,
    width: boxW,
    height: boxH,
    color: ink.ivory,
    borderColor: ink.navy100,
    borderWidth: 0.75,
  });

  projected.forEach((poly, i) => {
    const pts = poly.map((p) => ({ x: originX + p.x * scale, y: originY + p.y * scale }));
    // drawSvgPath's origin is top-left with y growing downward, so convert
    // out of PDF space (y growing up) rather than passing it through.
    const sy = (v: number) => (PAGE_H - v).toFixed(2);
    const path =
      `M ${pts[0].x.toFixed(2)} ${sy(pts[0].y)} ` +
      pts
        .slice(1)
        .map((p) => `L ${p.x.toFixed(2)} ${sy(p.y)}`)
        .join(" ") +
      " Z";
    // drawSvgPath measures y downward from the top of the page.
    page.drawSvgPath(path, {
      x: 0,
      y: PAGE_H,
      color: ink.gold400,
      opacity: 0.18,
      borderColor: ink.gold600,
      borderWidth: 1.6,
    });

    // Label at the section's centroid.
    const cx = pts.reduce((a, p) => a + p.x, 0) / pts.length;
    const cy = pts.reduce((a, p) => a + p.y, 0) / pts.length;
    const label = `${i + 1}`;
    const areaLabel = `${money(Math.round(summary.planes[i].areaFt2))} ft²`;
    page.drawText(label, {
      x: cx - fonts.bodyBold.widthOfTextAtSize(label, 11) / 2,
      y: cy + 2,
      size: 11,
      font: fonts.bodyBold,
      color: ink.navy900,
    });
    page.drawText(areaLabel, {
      x: cx - fonts.body.widthOfTextAtSize(areaLabel, 7.5) / 2,
      y: cy - 9,
      size: 7.5,
      font: fonts.body,
      color: ink.ink800,
    });
  });

  // North arrow — latitude increases up the page, so north is simply up.
  const nx = MARGIN + boxW - 26;
  const ny = top - 26;
  page.drawLine({
    start: { x: nx, y: ny - 14 },
    end: { x: nx, y: ny },
    thickness: 1.2,
    color: ink.ink500,
  });
  page.drawText("N", {
    x: nx - fonts.bodySemi.widthOfTextAtSize("N", 8) / 2,
    y: ny + 3,
    size: 8,
    font: fonts.bodySemi,
    color: ink.ink500,
  });

  // Scale bar: the largest round number of feet that fits in a third of the
  // drawing. `scale` is points per metre, so points per foot divides by 3.28.
  const ptPerFt = scale / 3.28084;
  const targetFt = [100, 50, 25, 20, 10].find((f) => f * ptPerFt <= drawW / 3) ?? 10;
  const barPt = targetFt * ptPerFt;
  const bx = MARGIN + 18;
  const by = top - boxH + 12;
  page.drawLine({
    start: { x: bx, y: by },
    end: { x: bx + barPt, y: by },
    thickness: 1.4,
    color: ink.ink500,
  });
  page.drawText(`${targetFt} ft`, {
    x: bx,
    y: by + 5,
    size: 7,
    font: fonts.body,
    color: ink.ink500,
  });

  return top - boxH - 18;
}

/** Page 2 in trace mode: the drawing, at scale, plus the section list. */
function drawDiagramPage(ctx: Ctx, input: ReportInput): PDFPage {
  const { doc, fonts, ink } = ctx;
  const page = doc.addPage([PAGE_W, PAGE_H]);
  const { summary } = input;

  let y = PAGE_H - 64;
  page.drawText("The measured roof outline", {
    x: MARGIN,
    y,
    size: 20,
    font: fonts.serif,
    color: ink.navy900,
  });
  y -= 14;
  goldRule(page, MARGIN, y, ink);
  y -= 26;

  y = drawParagraph(
    page,
    "The outline the measurement was taken from, drawn to scale over the satellite view of the property. Each numbered section is measured separately and the areas are added together.",
    { x: MARGIN, y, font: fonts.body, size: 9, color: ink.ink800, width: CONTENT_W, leading: 13 },
  );
  y -= 26;

  y = drawRoofDiagram(ctx, page, summary, y);
  y -= 16;

  if (summary.planes.length > 0) {
    page.drawText("SECTIONS", { x: MARGIN, y, size: 8, font: fonts.bodySemi, color: ink.ink500 });
    y -= 18;
    const cols = [MARGIN, MARGIN + 90, MARGIN + 200];
    page.drawRectangle({ x: MARGIN, y: y - 6, width: CONTENT_W, height: 20, color: ink.navy950 });
    ["SECTION", "AREA", "SQUARES"].forEach((h, i) =>
      page.drawText(h, { x: cols[i] + 8, y, size: 7.5, font: fonts.bodySemi, color: ink.white }),
    );
    y -= 22;
    summary.planes.forEach((plane, i) => {
      if (i % 2 === 1) {
        page.drawRectangle({ x: MARGIN, y: y - 5, width: CONTENT_W, height: 18, color: ink.ivory });
      }
      const row = [
        `${i + 1}`,
        `${money(Math.round(plane.areaFt2))} ft²`,
        `${(plane.areaFt2 / 100).toFixed(1)}`,
      ];
      row.forEach((cell, c) =>
        page.drawText(cell, {
          x: cols[c] + 8,
          y,
          size: 9,
          font: c === 0 ? fonts.bodySemi : fonts.body,
          color: ink.ink800,
        }),
      );
      y -= 18;
    });
    y -= 6;
    page.drawText(
      `Total ${money(summary.surfaceFt2)} ft² — ${summary.squares.toFixed(1)} squares`,
      { x: MARGIN + 8, y, size: 10, font: fonts.bodySemi, color: ink.navy900 },
    );
    y -= 30;
  }

  drawCalculation(ctx, page, summary, y);

  return page;
}

/**
 * The arithmetic, shown. Measurement reports earn trust by showing their work:
 * a homeowner who can follow footprint → slope factor → surface → waste can
 * check the number against anyone else's, which is the whole point of giving
 * it to them. Every line here is already printed elsewhere in the report; this
 * just puts them in order.
 */
function drawCalculation(ctx: Ctx, page: PDFPage, summary: RoofSummary, top: number): number {
  const { fonts, ink } = ctx;
  if (!summary.footprintFt2 || !summary.surfaceFt2) return top;

  let y = top;
  page.drawText("HOW THAT NUMBER IS REACHED", {
    x: MARGIN,
    y,
    size: 8,
    font: fonts.bodySemi,
    color: ink.ink500,
  });
  y -= 20;

  // The combined factor, measured rather than assumed: it is simply the sloped
  // area over the flat area, so it stays correct when sections differ in pitch.
  const combined = summary.surfaceFt2 / summary.footprintFt2;
  const range = summary.pitchRangeDeg;
  const uniform = range ? pitchToRise12(range.minDeg) === pitchToRise12(range.maxDeg) : false;
  const pitchText = uniform
    ? `Pitch ${pitchRangeLabel(range)} — slope factor`
    : `Pitch ${pitchRangeLabel(range)} — combined slope factor`;

  const rows: [string, string, boolean][] = [
    ["Footprint traced on the satellite view", `${money(summary.footprintFt2)} ft²`, false],
    [pitchText, `× ${combined.toFixed(3)}`, false],
    [
      "Roof surface to cover",
      `${money(summary.surfaceFt2)} ft²  ·  ${summary.squares.toFixed(1)} squares`,
      false,
    ],
    [
      `Waste allowance (${summary.waste.complexity} roof${summary.waste.steepAdder > 0 ? ", steep pitch" : ""})`,
      `+ ${summary.waste.percent}%`,
      false,
    ],
    ["Squares to order", `${summary.squaresWithWaste.toFixed(1)} squares`, true],
  ];

  for (const [label, value, strong] of rows) {
    if (strong) {
      page.drawLine({
        start: { x: MARGIN, y: y + 13 },
        end: { x: PAGE_W - MARGIN, y: y + 13 },
        thickness: 0.75,
        color: ink.navy100,
      });
      y -= 6;
    }
    page.drawText(label, {
      x: MARGIN,
      y,
      size: 9,
      font: strong ? fonts.bodySemi : fonts.body,
      color: strong ? ink.navy900 : ink.ink800,
    });
    const font = strong ? fonts.bodyBold : fonts.bodySemi;
    const size = strong ? 10 : 9;
    page.drawText(value, {
      x: PAGE_W - MARGIN - font.widthOfTextAtSize(value, size),
      y,
      size,
      font,
      color: strong ? ink.gold600 : ink.navy900,
    });
    y -= 18;
  }

  // Slope-factor reference: the geometry is public and checkable, and showing
  // it makes the multiplier above look like arithmetic rather than a markup.
  y -= 6;
  const usedRise = range && uniform ? pitchToRise12(range.minDeg) : null;
  const ref = COMMON_SLOPE_FACTORS.map((r) => ({
    rise: r,
    text: `${r}/12 ×${slopeFactor(r).toFixed(3)}`,
  }));
  page.drawText("SLOPE FACTOR BY PITCH", {
    x: MARGIN,
    y,
    size: 7,
    font: fonts.bodySemi,
    color: ink.ink500,
  });
  y -= 14;
  let rx = MARGIN;
  for (const item of ref) {
    const used = item.rise === usedRise;
    const font = used ? fonts.bodySemi : fonts.body;
    const w = font.widthOfTextAtSize(item.text, 8);
    if (used) {
      page.drawRectangle({
        x: rx - 4,
        y: y - 3,
        width: w + 8,
        height: 15,
        color: ink.ivory,
        borderColor: ink.gold400,
        borderWidth: 0.6,
      });
    }
    page.drawText(item.text, {
      x: rx,
      y,
      size: 8,
      font,
      color: used ? ink.gold600 : ink.ink500,
    });
    rx += w + 22;
  }
  y -= 16;
  drawParagraph(
    page,
    "A pitched roof covers more area than the ground under it. The slope factor is that ratio — pure geometry, the same for every roofer — and it is not a charge.",
    { x: MARGIN, y, font: fonts.body, size: 8, color: ink.ink500, width: CONTENT_W, leading: 11 },
  );

  return y - 24;
}

/* ---------------------------------------------------- waste + quantity  -- */

/**
 * The page that answers "why is the number I order bigger than the number you
 * measured?".
 *
 * The owner's brief for this document is explicitly informational rather than
 * promotional (2026-10): a homeowner should be able to read it, understand the
 * allowance, and check it against any other measurement they are given. So the
 * allowance is explained before it is applied, and the rule that produced it is
 * printed in full rather than asserted.
 */
function drawWastePage(ctx: Ctx, input: ReportInput) {
  const { doc, fonts, ink } = ctx;
  const page = doc.addPage([PAGE_W, PAGE_H]);
  const { summary } = input;

  let y = PAGE_H - 64;
  page.drawText("Waste allowance and material quantity", {
    x: MARGIN,
    y,
    size: 20,
    font: fonts.serif,
    color: ink.navy900,
  });
  y -= 14;
  goldRule(page, MARGIN, y, ink);
  y -= 30;

  y = drawParagraph(
    page,
    "A roof never uses exactly its measured area in material. Shingles arrive as rectangles and a roof is not one: every hip, valley, rake and penetration is cut to fit, and the offcuts cannot be used anywhere else. Starter course and ridge cap consume further material, and a bundle occasionally arrives damaged or short.",
    { x: MARGIN, y, font: fonts.body, size: 9, color: ink.ink800, width: CONTENT_W, leading: 13 },
  );
  y -= 26;
  y = drawParagraph(
    page,
    "The waste allowance is the industry's way of accounting for that. It is added to the measured area to give the quantity a supplier should be asked for — so the crew does not run short mid-tear-off — and it is an allowance, not a charge and not a prediction: the material actually consumed depends on how the roof cuts up on the day.",
    { x: MARGIN, y, font: fonts.body, size: 9, color: ink.ink800, width: CONTENT_W, leading: 13 },
  );
  y -= 30;

  // Waste allowance.
  const w = summary.waste;
  page.drawText("ALLOWANCE APPLIED TO THIS ROOF", {
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
  const unit =
    input.method === "manual"
      ? `${summary.planes.length} section${summary.planes.length === 1 ? "" : "s"} traced`
      : `${summary.planes.length} roof plane${summary.planes.length === 1 ? "" : "s"} resolved`;
  const breakdown =
    `${unit} · ` +
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
  const quantities: [string, string][] = [
    ["MEASURED ROOF AREA", `${summary.squares.toFixed(1)} squares`],
    ["QUANTITY TO ORDER", `${summary.squaresWithWaste.toFixed(1)} squares`],
  ];
  let qx = MARGIN + 230;
  for (const [label, value] of quantities) {
    page.drawText(label, {
      x: qx,
      y: by + 2,
      size: 7,
      font: fonts.bodySemi,
      color: ink.ink500,
    });
    page.drawText(value, {
      x: qx,
      y: by - 16,
      size: 14,
      font: fonts.bodySemi,
      color: ink.navy900,
    });
    qx += 130;
  }

  y = y - boxH - 20;

  // What the allowance is actually for.
  page.drawText("WHAT THE ALLOWANCE COVERS", {
    x: MARGIN,
    y,
    size: 8,
    font: fonts.bodySemi,
    color: ink.ink500,
  });
  y -= 16;
  const covers = [
    "Cuts at hips, valleys, rakes and around penetrations, where the offcut is scrap.",
    "Starter course along the eaves and rakes, and cap shingles along the hips and ridges.",
    "Alignment and pattern offsets, which on a laminated shingle consume part of each course.",
    "A small margin for damaged, short or colour-mismatched bundles on delivery.",
  ];
  for (const c of covers) {
    page.drawText("•", { x: MARGIN, y, size: 9, font: fonts.body, color: ink.gold600 });
    y = drawParagraph(page, c, {
      x: MARGIN + 12,
      y,
      font: fonts.body,
      size: 8.5,
      color: ink.ink800,
      width: CONTENT_W - 12,
      leading: 12,
    });
    y -= 14;
  }
  y -= 10;

  // The rule itself, printed in full. A reader who disagrees with the
  // allowance can see exactly which row produced it and substitute their own.
  page.drawText("HOW THE ALLOWANCE WAS SET", {
    x: MARGIN,
    y,
    size: 8,
    font: fonts.bodySemi,
    color: ink.ink500,
  });
  y -= 18;
  const ruleCols = [MARGIN, MARGIN + 210, MARGIN + 330];
  page.drawRectangle({ x: MARGIN, y: y - 6, width: CONTENT_W, height: 20, color: ink.navy950 });
  // The middle column has to say how complexity was actually decided, and that
  // differs by method: an aerial model counts planes, a traced roof takes the
  // shape the person selected. Printing "9 sections or more" beside a roof
  // traced as two sections would be describing a rule that wasn't used.
  const basisHeader = input.method === "manual" ? "ROOF SHAPE SELECTED" : "PLANES RESOLVED";
  [...["ROOF COMPLEXITY", basisHeader, "BASE ALLOWANCE"]].forEach((h, i) =>
    page.drawText(h, { x: ruleCols[i] + 8, y, size: 7.5, font: fonts.bodySemi, color: ink.white }),
  );
  y -= 22;
  const ruleRows: [Complexity, string, string][] =
    input.method === "manual"
      ? [
          ["simple", "Gable — few cuts", "10%"],
          ["moderate", "Hip, and/or dormers", "13%"],
          ["complex", "Cut-up hip and valley", "15%"],
        ]
      : [
          ["simple", "4 planes or fewer", "10%"],
          ["moderate", "5 to 8 planes", "13%"],
          ["complex", "9 planes or more", "15%"],
        ];
  for (const [key, basis, pct] of ruleRows) {
    const applied = key === w.complexity;
    if (applied) {
      page.drawRectangle({
        x: MARGIN,
        y: y - 5,
        width: CONTENT_W,
        height: 18,
        color: ink.ivory,
        borderColor: ink.gold400,
        borderWidth: 0.6,
      });
    }
    const cells = [COMPLEXITY_LABEL[key].split(" — ")[0], basis, pct];
    cells.forEach((cell, c) =>
      page.drawText(cell, {
        x: ruleCols[c] + 8,
        y,
        size: 8.5,
        font: applied ? fonts.bodySemi : fonts.body,
        color: applied ? ink.gold600 : ink.ink800,
      }),
    );
    y -= 18;
  }
  y -= 6;
  y = drawParagraph(
    page,
    `A roof with any section at 9/12 or steeper adds a further 2%, because steep slopes are cut and staged with less margin for error. The total is capped at 20%. This roof: ${Math.round(w.base * 100)}% base${w.steepAdder > 0 ? ` + ${Math.round(w.steepAdder * 100)}% steep-pitch` : ", no steep-pitch adder"} = ${w.percent}%.`,
    { x: MARGIN, y, font: fonts.body, size: 8.5, color: ink.ink800, width: CONTENT_W, leading: 12 },
  );
  y -= 20;
  y = drawParagraph(
    page,
    "Material is sold in whole bundles, so a supplier order rounds up from the figure above. Bundles per square vary by product — the supplier converts the square count at the point of order.",
    { x: MARGIN, y, font: fonts.body, size: 8, color: ink.ink500, width: CONTENT_W, leading: 11 },
  );
  y -= 28;

  // How to read the two figures against someone else's. This is the single
  // most useful thing a measurement document can tell a homeowner, and it is
  // advice about comparing numbers rather than advice about who to hire.
  page.drawText("HOW TO USE THESE FIGURES", {
    x: MARGIN,
    y,
    size: 8,
    font: fonts.bodySemi,
    color: ink.ink500,
  });
  y -= 16;
  const usage = [
    `Comparing estimates: ask which figure each one was priced on. A bid built on ${summary.squares.toFixed(1)} squares and a bid built on ${summary.squaresWithWaste.toFixed(1)} are not the same bid, even at the same rate per square.`,
    "Checking an insurance scope: carrier scopes normally list the roof area and the waste allowance as separate lines. Compare each against its counterpart here rather than comparing totals.",
    "Against another measurement: differences usually trace to pitch or to where the roof edge was drawn, not to arithmetic. Check those two first.",
  ];
  for (const u of usage) {
    page.drawText("•", { x: MARGIN, y, size: 9, font: fonts.body, color: ink.gold600 });
    y = drawParagraph(page, u, {
      x: MARGIN + 12,
      y,
      font: fonts.body,
      size: 8.5,
      color: ink.ink800,
      width: CONTENT_W - 12,
      leading: 12,
    });
    y -= 14;
  }

  return page;
}

/* ---------------------------------------------------------- method page  -- */

/** Final page: how the figures were produced, and what they do not cover. */
function drawMethodPage(ctx: Ctx, input: ReportInput) {
  const { doc, fonts, ink } = ctx;
  const page = doc.addPage([PAGE_W, PAGE_H]);
  const { summary } = input;

  let y = PAGE_H - 64;
  page.drawText("Method, and the limits of this measurement", {
    x: MARGIN,
    y,
    size: 20,
    font: fonts.serif,
    color: ink.navy900,
  });
  y -= 14;
  goldRule(page, MARGIN, y, ink);
  y -= 30;

  const imagery = formatImageryDate(summary.imageryDate);
  const methodBits =
    input.method === "aerial"
      ? [
          `Measured plane by plane from aerial imagery${imagery ? ` captured ${imagery}` : ""}.`,
          summary.imageryQuality ? `Imagery quality: ${summary.imageryQuality.toLowerCase()}.` : "",
          "Each plane's area and pitch come from the aerial model; the areas are summed and the waste allowance applied to the total.",
        ]
      : [
          "The roof outline was traced on current satellite imagery of the property and the enclosed area computed from the traced coordinates. That flat footprint was multiplied by the slope factor for the pitch selected, giving the sloped roof surface; the waste allowance was then applied to that surface.",
        ];
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

  // Other measured figures worth having — all derived from the same trace.
  const extras: [string, string, string][] = [];
  if (summary.perimeterFt) {
    extras.push([
      "ROOF EDGE",
      `${money(summary.perimeterFt)} ft`,
      "traced perimeter — the run for drip edge, starter and gutters",
    ]);
  }
  if (summary.ventilationNfaSqIn) {
    extras.push([
      "VENTILATION TARGET",
      `${money(summary.ventilationNfaSqIn)} sq in`,
      "net free area at the balanced 1-in-300 ratio (IRC R806.2), split evenly intake and exhaust",
    ]);
  }
  if (extras.length) {
    page.drawText("ALSO MEASURED", {
      x: MARGIN,
      y,
      size: 8,
      font: fonts.bodySemi,
      color: ink.ink500,
    });
    y -= 18;
    for (const [label, value, note] of extras) {
      page.drawText(label, { x: MARGIN, y, size: 7.5, font: fonts.bodySemi, color: ink.ink500 });
      page.drawText(value, {
        x: MARGIN + 118,
        y: y + 1,
        size: 12,
        font: fonts.bodySemi,
        color: ink.navy900,
      });
      y = drawParagraph(page, note, {
        x: MARGIN + 196,
        y: y + 2,
        font: fonts.body,
        size: 8,
        color: ink.ink800,
        width: CONTENT_W - 196,
        leading: 10,
      });
      y -= 18;
    }
    y -= 2;
  }

  // What the measurement does not establish. Deliberately framed as scope
  // rather than as price drivers: this document reports a size, and the things
  // below are simply outside what any overhead measurement can see.
  page.drawText("NOT ESTABLISHED BY THIS MEASUREMENT", {
    x: MARGIN,
    y,
    size: 8,
    font: fonts.bodySemi,
    color: ink.ink500,
  });
  y -= 16;
  const notCovered = [
    "How many layers of roofing are already in place, and the condition of the decking beneath them.",
    "The condition of flashing at walls, chimneys, skylights and pipe penetrations.",
    "Existing ventilation — what is installed, and whether intake and exhaust are balanced.",
    "Storm, hail or wind damage, and any leak history.",
    "Access and staging constraints around the property.",
  ];
  for (const f of notCovered) {
    page.drawText("•", { x: MARGIN, y, size: 9, font: fonts.body, color: ink.gold600 });
    y = drawParagraph(page, f, {
      x: MARGIN + 12,
      y,
      font: fonts.body,
      size: 8.5,
      color: ink.ink800,
      width: CONTENT_W - 12,
      leading: 12,
    });
    y -= 14;
  }
  y -= 10;

  // Accuracy limits.
  page.drawText("ACCURACY AND LIMITS", {
    x: MARGIN,
    y,
    size: 8,
    font: fonts.bodySemi,
    color: ink.ink500,
  });
  y -= 16;
  const shared = [
    "The waste allowance is an industry-standard estimate derived from complexity and pitch. It is not a guarantee of the quantity a given roof will consume.",
    "This report states a size. It contains no pricing, and is not a quote, a contract or a material order.",
    "Verify on the roof before ordering material or committing to a price.",
  ];
  const limits =
    input.method === "manual"
      ? [
          "Figures are derived from an outline traced on satellite imagery, so they are only as accurate as that outline. Overhangs, low additions and sections obscured by tree cover may be under- or over-captured.",
          "The pitch is the one selected when the roof was traced, not one measured on the roof. Pitch drives the slope factor directly, so an incorrect pitch moves every area figure in this report.",
          ...shared,
        ]
      : [
          "Figures are derived from an aerial roof model. Such models read slightly under a full photogrammetric or on-site measurement: they tend to clip eaves and overhangs and to smooth out the steepest slopes.",
          "Tree cover, recent construction and complex rooflines all reduce what the imagery resolves.",
          ...shared,
        ];
  for (const line of limits) {
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
    y -= 15;
  }

  y -= 8;

  // Plain definitions of every unit used above, so the report can be read by
  // someone who has never bought a roof before.
  page.drawText("TERMS USED IN THIS REPORT", {
    x: MARGIN,
    y,
    size: 8,
    font: fonts.bodySemi,
    color: ink.ink500,
  });
  y -= 16;
  const glossary: [string, string][] = [
    ["Square", "100 square feet of roof surface. The unit roofing material is quoted and sold in."],
    [
      "Footprint",
      "The flat area the building covers on the ground — what an outline drawn on a satellite view encloses.",
    ],
    [
      "Pitch",
      "Steepness, written as inches of rise per 12 inches of run. A 9/12 roof rises 9 inches over every 12 across.",
    ],
    [
      "Slope factor",
      "The ratio of sloped roof surface to flat footprint at a given pitch. Geometry, identical for everyone.",
    ],
    [
      "Net free area",
      "The open area of a vent that air can actually pass through, in square inches — less than the vent's overall size.",
    ],
  ];
  for (const [term, meaning] of glossary) {
    page.drawText(term, { x: MARGIN, y, size: 8.5, font: fonts.bodySemi, color: ink.navy900 });
    y = drawParagraph(page, meaning, {
      x: MARGIN + 92,
      y,
      font: fonts.body,
      size: 8.5,
      color: ink.ink800,
      width: CONTENT_W - 92,
      leading: 11.5,
    });
    y -= 14;
  }

  y -= 10;

  // Who produced it. Disclosure, not a pitch: the reader is entitled to know
  // where the measurement came from, and to be able to query it.
  const boxH2 = 56;
  page.drawRectangle({
    x: MARGIN,
    y: y - boxH2 + 10,
    width: CONTENT_W,
    height: boxH2,
    color: ink.ivory,
    borderColor: ink.navy100,
    borderWidth: 0.75,
  });
  page.drawText("MEASUREMENT PREPARED BY", {
    x: MARGIN + 18,
    y: y - 6,
    size: 7,
    font: fonts.bodySemi,
    color: ink.ink500,
  });
  page.drawText(BRAND.legalName, {
    x: MARGIN + 18,
    y: y - 22,
    size: 10,
    font: fonts.bodySemi,
    color: ink.navy900,
  });
  page.drawText(
    `Questions about any figure in this report: ${BRAND.phoneDisplay} · ${BRAND.email}`,
    { x: MARGIN + 18, y: y - 36, size: 8, font: fonts.body, color: ink.ink800 },
  );

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
  doc.setSubject("Roof area, pitch and material quantity. A measurement record, not a quote.");
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

  const pages: PDFPage[] = [];
  pages.push(await drawCover(ctx, input, dims, embedded));
  // The drawing only exists when a person traced it.
  if (input.method === "manual" && input.summary.planes.some((p) => p.outline?.length)) {
    pages.push(drawDiagramPage(ctx, input));
  }
  pages.push(drawWastePage(ctx, input));
  pages.push(drawMethodPage(ctx, input));

  const footerNote =
    input.method === "manual"
      ? "Derived from a traced roof outline. Verify on the roof before ordering material."
      : "Derived from an aerial roof model. Verify on the roof before ordering material.";
  const reference = reportReference(input.address, input.now ?? new Date());
  pages.forEach((p, i) =>
    drawFooter(p, ctx, `Page ${i + 1} of ${pages.length}`, footerNote, reference),
  );

  return doc.save();
}

/** Safe, descriptive download filename from the address. */
export function reportFilename(address: string): string {
  const slug = (address || "property")
    .replace(/,.*$/, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return `Roof-Measurement-Report-${slug || "property"}.pdf`;
}
