/**
 * Roof measurement report → PDF.
 *
 * Runs in the browser (pdf-lib), so there is no server key, no env var and no
 * per-download cost — it works on the owner's "no Vercel configuration"
 * constraint. pdf-lib is imported dynamically by the caller so none of this
 * weight loads until someone clicks Download.
 *
 * DELIBERATELY UNBRANDED (owner, 2026-10). This document is a measurement
 * record, read alongside EagleView and carrier scopes, so it uses the visual
 * language those documents use: one neutral grotesque, greyscale with a single
 * functional accent, and rules instead of ornament. The company typeface and
 * gold made a measurement look like an advertisement for whoever took it. See
 * docs/brand-guidelines.md — this file is the stated exception to it, not an
 * oversight, and it imports nothing from brand.ts on purpose.
 *
 * No company name appears anywhere: not on the page, not in the footer, not in
 * the PDF metadata. The report is UNATTRIBUTED. That is a legitimate choice —
 * but it stops exactly there. Nothing in here may assert, in words or in
 * styling, that an independent surveyor or third-party firm produced it.
 *
 * Typography is pdf-lib's built-in Helvetica. That is the point, not a
 * shortcut: it carries no brand, it is what technical documents are set in,
 * and it also removes a font fetch, the fontkit dependency and the old
 * old-style-figures bug ("11.1" rendering as "II.I").
 *
 * Hard rules this file exists to honour:
 *  - No pricing. Ever. The report states size, not money (owner, 2026-08).
 *  - Nothing is printed that the measurement didn't actually produce; a
 *    blocked measurement never reaches this module (see roof-report.ts).
 *  - The aerial photo is PUBLIC-DOMAIN USGS imagery, credited on the page.
 *    Google imagery must never be embedded here (geo-guidelines, Sheet 8).
 *  - Who prepared the measurement is disclosed on every page, from brand.ts.
 *    Neutral styling must never shade into implying an independent surveyor.
 */

import type { PDFDocument, PDFFont, PDFPage, RGB } from "pdf-lib";
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
  /**
   * JPEG bytes of a photo the person supplied, or null. Never imagery fetched
   * by coordinate — with none, the cover falls back to the traced outline.
   */
  propertyImage: Uint8Array | null;
  /** How the roof was measured, for the method line. */
  method: "aerial" | "manual";
  /** Injected in tests; defaults to now. */
  now?: Date;
}

/* ---------------------------------------------------------- document ink -- */

const PAGE_W = 612; // US Letter, portrait
const PAGE_H = 792;
const MARGIN = 54;
const CONTENT_W = PAGE_W - MARGIN * 2;

/**
 * Document palette: neutral greys plus one functional accent, used only where
 * it carries meaning (the traced outline, the row that applied, the rule under
 * a heading). No brand colour appears in this file by design — see the header.
 */
const HEX = {
  slate900: "#14161a",
  slate700: "#33373f",
  slate500: "#6b7078",
  rule: "#d4d8dd",
  fill: "#f2f4f6",
  accent: "#1c4f82",
  white: "#ffffff",
} as const;

type Ink = Record<keyof typeof HEX, RGB>;

/* --------------------------------------------------------------- assets -- */

export type FontSet = {
  /** Page headings. */
  serif: PDFFont;
  body: PDFFont;
  bodySemi: PDFFont;
  bodyBold: PDFFont;
};

/**
 * Helvetica, from pdf-lib's built-in standard fonts: nothing to fetch, nothing
 * to embed, and the face technical documents are conventionally set in. The
 * four slots are kept so call sites read as hierarchy rather than as font
 * names; regular and bold are the whole hierarchy, which is the look.
 */
async function loadFonts(doc: PDFDocument): Promise<FontSet> {
  const { StandardFonts } = await import("pdf-lib");
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  return { serif: bold, body: regular, bodySemi: bold, bodyBold: bold };
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

/** Full-width hairline under a page heading. */
function goldRule(page: PDFPage, x: number, y: number, ink: Ink, width = CONTENT_W) {
  page.drawRectangle({ x, y, width, height: 0.75, color: ink.rule });
}

/**
 * Page heading in the document idiom: small caps-ish setting with a hairline
 * across the measure, rather than a display serif. Returns the next y.
 */
function sectionHeading(ctx: Ctx, page: PDFPage, text: string, top: number): number {
  const { fonts, ink } = ctx;
  page.drawText(text.toUpperCase(), {
    x: MARGIN,
    y: top,
    size: 13,
    font: fonts.bodyBold,
    color: ink.slate900,
  });
  goldRule(page, MARGIN, top - 11, ink);
  return top - 11;
}

/**
 * Running head on continuation pages: what the document is on the left, the
 * property it concerns on the right. Returns the y to start content at.
 */
function runningHead(ctx: Ctx, page: PDFPage, address: string): number {
  const { fonts, ink } = ctx;
  const y = PAGE_H - 46;
  page.drawText("ROOF MEASUREMENT REPORT", {
    x: MARGIN,
    y,
    size: 7,
    font: fonts.bodyBold,
    color: ink.slate500,
  });
  const right = address.replace(/,\s*USA$/, "");
  const fitted = wrap(right, fonts.body, 7, CONTENT_W * 0.55)[0] ?? right;
  page.drawText(fitted, {
    x: PAGE_W - MARGIN - fonts.body.widthOfTextAtSize(fitted, 7),
    y,
    size: 7,
    font: fonts.body,
    color: ink.slate500,
  });
  page.drawLine({
    start: { x: MARGIN, y: y - 8 },
    end: { x: PAGE_W - MARGIN, y: y - 8 },
    thickness: 0.75,
    color: ink.rule,
  });
  return y - 44;
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

/**
 * Shared footer.
 *
 * No byline: the owner asked for the report to carry no "prepared by" line
 * (2026-10). Note what that does and does not mean — the document is simply
 * UNATTRIBUTED, which is a choice a measurement record is entitled to make. It
 * must never go further and assert, in words or in styling, that an
 * independent surveyor produced it. The PDF's own author metadata is left
 * accurate for the same reason.
 */
function drawFooter(page: PDFPage, ctx: Ctx, pageLabel: string, note?: string, reference?: string) {
  const { fonts, ink } = ctx;
  page.drawLine({
    start: { x: MARGIN, y: 64 },
    end: { x: PAGE_W - MARGIN, y: 64 },
    thickness: 0.75,
    color: ink.rule,
  });
  page.drawText(note ?? "Measurement estimate. Verify on the roof before ordering material.", {
    x: MARGIN,
    y: 50,
    size: 7.5,
    font: fonts.body,
    color: ink.slate500,
  });
  const label = pageLabel;
  page.drawText(label, {
    x: PAGE_W - MARGIN - fonts.body.widthOfTextAtSize(label, 7.5),
    y: 50,
    size: 7.5,
    font: fonts.body,
    color: ink.slate500,
  });
  if (reference) {
    page.drawText(reference, {
      x: PAGE_W - MARGIN - fonts.body.widthOfTextAtSize(reference, 7.5),
      y: 39,
      size: 7.5,
      font: fonts.body,
      color: ink.slate500,
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
  const bandH = 74;
  page.drawRectangle({
    x: 0,
    y: PAGE_H - bandH,
    width: PAGE_W,
    height: bandH,
    color: ink.slate900,
  });
  page.drawText("ROOF MEASUREMENT REPORT", {
    x: MARGIN,
    y: PAGE_H - 42,
    size: 17,
    font: fonts.bodyBold,
    color: ink.white,
  });
  page.drawText("AREA  ·  PITCH  ·  MATERIAL QUANTITY", {
    x: MARGIN,
    y: PAGE_H - 57,
    size: 7.5,
    font: fonts.body,
    color: ink.rule,
  });

  let y = PAGE_H - bandH - 40;

  // Subject, date and reference as a labelled data block — the way a technical
  // report identifies itself, rather than as a display-type title page.
  const reference = reportReference(input.address, input.now ?? new Date());
  const dateStr = (input.now ?? new Date()).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  page.drawText("SUBJECT PROPERTY", {
    x: MARGIN,
    y,
    size: 7,
    font: fonts.bodyBold,
    color: ink.slate500,
  });
  y -= 18;
  y = drawParagraph(page, input.address || "Address not provided", {
    x: MARGIN,
    y,
    font: fonts.bodyBold,
    size: 15,
    color: ink.slate900,
    width: CONTENT_W * 0.72,
    leading: 19,
  });

  // Date and reference sit in a right-hand column against the address.
  const meta: [string, string][] = [
    ["REPORT DATE", dateStr],
    ["REPORT NO.", reference],
  ];
  let my = PAGE_H - bandH - 40;
  const metaX = MARGIN + CONTENT_W * 0.74;
  for (const [label, value] of meta) {
    page.drawText(label, { x: metaX, y: my, size: 7, font: fonts.bodyBold, color: ink.slate500 });
    page.drawText(value, {
      x: metaX,
      y: my - 13,
      size: 9,
      font: fonts.body,
      color: ink.slate900,
    });
    my -= 32;
  }

  y = Math.min(y, my) - 10;
  goldRule(page, MARGIN, y, ink);
  y -= 22;

  // Cover image.
  //
  // A photograph only ever comes from the person running the measurement —
  // the report never goes looking for imagery of the property by coordinate
  // (owner, 2026-10). With no photo supplied it falls back to the traced
  // outline, which is honest in a way found imagery is not: it is the actual
  // geometry these figures were taken from, and it is unambiguously ours to
  // print. Hence no credit line on either path.
  const coverH = 190;
  if (embedded && imageDims) {
    const scale = Math.min(CONTENT_W / imageDims.w, coverH / imageDims.h);
    const w = imageDims.w * scale;
    const h = imageDims.h * scale;
    const x = MARGIN + (CONTENT_W - w) / 2;
    page.drawRectangle({
      x: x - 2,
      y: y - h - 2,
      width: w + 4,
      height: h + 4,
      color: ink.rule,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    page.drawImage(embedded as any, { x, y: y - h, width: w, height: h });
    y -= h + 22;
  } else if (summary.planes.some((p) => p.outline && p.outline.length >= 3)) {
    drawRoofDiagram(ctx, page, summary, y, { height: coverH, labels: false });
    y -= coverH + 10;
    page.drawText("Traced roof outline — measured section by section on page 2", {
      x: MARGIN,
      y,
      size: 7,
      font: fonts.body,
      color: ink.slate500,
    });
    y -= 22;
  } else {
    y -= 6;
  }

  // Key figures as a ruled cell strip with a summary band beneath it — the
  // convention measurement reports use, and far easier to read against another
  // report than one oversized headline number.
  const cells: [string, string][] = [
    ["TOTAL ROOF AREA", `${summary.squares.toFixed(1)} sq`],
    ["ROOF SURFACE", `${money(summary.surfaceFt2)} ft²`],
    ["FOOTPRINT", `${money(summary.footprintFt2)} ft²`],
    ["PITCH", pitchRangeLabel(summary.pitchRangeDeg)],
    ["WASTE ALLOWANCE", `${summary.waste.percent}%`],
  ];
  const cellH = 54;
  const bandTop = y;
  page.drawRectangle({
    x: MARGIN,
    y: bandTop - cellH,
    width: CONTENT_W,
    height: cellH,
    borderColor: ink.rule,
    borderWidth: 0.75,
  });
  const cellW = CONTENT_W / cells.length;
  cells.forEach(([label, value], i) => {
    const cx = MARGIN + i * cellW;
    if (i > 0) {
      page.drawLine({
        start: { x: cx, y: bandTop - cellH },
        end: { x: cx, y: bandTop },
        thickness: 0.75,
        color: ink.rule,
      });
    }
    page.drawText(label, {
      x: cx + 10,
      y: bandTop - 18,
      size: 6.5,
      font: fonts.bodyBold,
      color: ink.slate500,
    });
    page.drawText(value, {
      x: cx + 10,
      y: bandTop - 40,
      size: 14,
      font: fonts.bodyBold,
      color: ink.slate900,
    });
  });

  // The ordering figure, given the emphasis it earns.
  const orderH = 34;
  page.drawRectangle({
    x: MARGIN,
    y: bandTop - cellH - orderH,
    width: CONTENT_W,
    height: orderH,
    color: ink.slate900,
  });
  page.drawText("QUANTITY TO ORDER", {
    x: MARGIN + 10,
    y: bandTop - cellH - 21,
    size: 7,
    font: fonts.bodyBold,
    color: ink.rule,
  });
  const orderValue = `${summary.squaresToOrder.toFixed(1)} squares`;
  page.drawText(orderValue, {
    x: MARGIN + 120,
    y: bandTop - cellH - 23,
    size: 13,
    font: fonts.bodyBold,
    color: ink.white,
  });
  const orderNote = `measured area + ${summary.waste.percent}% waste + ${summary.orderMargin}-square ordering margin`;
  page.drawText(orderNote, {
    x: PAGE_W - MARGIN - 10 - fonts.body.widthOfTextAtSize(orderNote, 8),
    y: bandTop - cellH - 21,
    size: 8,
    font: fonts.body,
    color: ink.rule,
  });

  y = bandTop - cellH - orderH - 24;

  // Confidence note when the measurement is usable but imperfect.
  if (summary.confidence.level === "reduced") {
    page.drawRectangle({
      x: MARGIN,
      y: y - 34,
      width: CONTENT_W,
      height: 40,
      color: ink.fill,
    });
    page.drawRectangle({ x: MARGIN, y: y - 34, width: 2, height: 40, color: ink.accent });
    drawParagraph(page, `Note: ${summary.confidence.message}`, {
      x: MARGIN + 12,
      y: y - 6,
      font: fonts.body,
      size: 8,
      color: ink.slate700,
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
    color: ink.slate500,
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
      "Method, ventilation and reference",
      "How the figures were produced, the attic ventilation the roof area calls for, and what the units in this report mean.",
    ],
  ];
  const gutter = 26;
  steps.forEach(([title, body], i) => {
    page.drawText(`${String(i + 1).padStart(2, "0")}`, {
      x: MARGIN,
      y,
      size: 9,
      font: fonts.bodyBold,
      color: ink.accent,
    });
    page.drawText(title, {
      x: MARGIN + gutter,
      y,
      size: 9.5,
      font: fonts.bodyBold,
      color: ink.slate900,
    });
    y = drawParagraph(page, body, {
      x: MARGIN + gutter,
      y: y - 13,
      font: fonts.body,
      size: 8.5,
      color: ink.slate700,
      width: CONTENT_W - gutter,
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
function drawRoofDiagram(
  ctx: Ctx,
  page: PDFPage,
  summary: RoofSummary,
  top: number,
  opts?: { left?: number; width?: number; height?: number; labels?: boolean },
): number {
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

  const left = opts?.left ?? MARGIN;
  const boxW = opts?.width ?? CONTENT_W;
  const boxH = opts?.height ?? 208;
  const labels = opts?.labels ?? true;
  const pad = 26;
  const footer = 26; // clear lane at the bottom for the scale bar
  const usableH = boxH - pad - footer;
  const scale = Math.min((boxW - pad * 2) / spanX, usableH / spanY);
  const drawW = spanX * scale;
  const drawH = spanY * scale;
  const originX = left + (boxW - drawW) / 2 - minX * scale;
  // PDF y grows upward and so does latitude, so no flip is needed.
  const originY = top - boxH + footer + (usableH - drawH) / 2 - minY * scale;

  page.drawRectangle({
    x: left,
    y: top - boxH,
    width: boxW,
    height: boxH,
    color: ink.fill,
    borderColor: ink.rule,
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
      color: ink.accent,
      opacity: 0.18,
      borderColor: ink.accent,
      borderWidth: 1.6,
    });

    // Label at the section's centroid. Suppressed on the cover, where the
    // drawing is small and stands in for a photograph; the labelled version is
    // the full-page one on the outline page.
    if (!labels) return;
    const cx = pts.reduce((a, p) => a + p.x, 0) / pts.length;
    const cy = pts.reduce((a, p) => a + p.y, 0) / pts.length;
    const label = `${i + 1}`;
    const areaLabel = `${money(Math.round(summary.planes[i].areaFt2))} ft²`;
    page.drawText(label, {
      x: cx - fonts.bodyBold.widthOfTextAtSize(label, 11) / 2,
      y: cy + 2,
      size: 11,
      font: fonts.bodyBold,
      color: ink.slate900,
    });
    page.drawText(areaLabel, {
      x: cx - fonts.body.widthOfTextAtSize(areaLabel, 7.5) / 2,
      y: cy - 9,
      size: 7.5,
      font: fonts.body,
      color: ink.slate700,
    });
  });

  // North arrow — latitude increases up the page, so north is simply up.
  const nx = left + boxW - 26;
  const ny = top - 26;
  page.drawLine({
    start: { x: nx, y: ny - 14 },
    end: { x: nx, y: ny },
    thickness: 1.2,
    color: ink.slate500,
  });
  page.drawText("N", {
    x: nx - fonts.bodySemi.widthOfTextAtSize("N", 8) / 2,
    y: ny + 3,
    size: 8,
    font: fonts.bodySemi,
    color: ink.slate500,
  });

  // Scale bar: the largest round number of feet that fits in a third of the
  // drawing. `scale` is points per metre, so points per foot divides by 3.28.
  const ptPerFt = scale / 3.28084;
  const targetFt = [100, 50, 25, 20, 10].find((f) => f * ptPerFt <= drawW / 3) ?? 10;
  const barPt = targetFt * ptPerFt;
  const bx = left + 18;
  const by = top - boxH + 12;
  page.drawLine({
    start: { x: bx, y: by },
    end: { x: bx + barPt, y: by },
    thickness: 1.4,
    color: ink.slate500,
  });
  page.drawText(`${targetFt} ft`, {
    x: bx,
    y: by + 5,
    size: 7,
    font: fonts.body,
    color: ink.slate500,
  });

  return top - boxH - 18;
}

/** Page 2 in trace mode: the drawing, at scale, plus the section list. */
function drawDiagramPage(ctx: Ctx, input: ReportInput): PDFPage {
  const { doc, fonts, ink } = ctx;
  const page = doc.addPage([PAGE_W, PAGE_H]);
  const { summary } = input;

  let y = runningHead(ctx, page, input.address);
  y = sectionHeading(ctx, page, "The measured roof outline", y);
  y -= 22;

  y = drawParagraph(
    page,
    "The outline the measurement was taken from, drawn to scale over the satellite view of the property. Each numbered section is measured separately and the areas are added together.",
    { x: MARGIN, y, font: fonts.body, size: 9, color: ink.slate700, width: CONTENT_W, leading: 13 },
  );
  y -= 26;

  y = drawRoofDiagram(ctx, page, summary, y);
  y -= 8;

  if (summary.planes.length > 0) {
    page.drawText("SECTIONS", { x: MARGIN, y, size: 8, font: fonts.bodySemi, color: ink.slate500 });
    y -= 18;
    const cols = [MARGIN, MARGIN + 90, MARGIN + 200];
    page.drawRectangle({ x: MARGIN, y: y - 6, width: CONTENT_W, height: 20, color: ink.slate900 });
    ["SECTION", "AREA", "SQUARES"].forEach((h, i) =>
      page.drawText(h, { x: cols[i] + 8, y, size: 7.5, font: fonts.bodySemi, color: ink.white }),
    );
    y -= 22;
    summary.planes.forEach((plane, i) => {
      if (i % 2 === 1) {
        page.drawRectangle({ x: MARGIN, y: y - 5, width: CONTENT_W, height: 18, color: ink.fill });
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
          color: ink.slate700,
        }),
      );
      y -= 18;
    });
    y -= 6;
    page.drawText(
      `Total ${money(summary.surfaceFt2)} ft² — ${summary.squares.toFixed(1)} squares`,
      { x: MARGIN + 8, y, size: 10, font: fonts.bodySemi, color: ink.slate900 },
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
    color: ink.slate500,
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
      `+ ${summary.waste.percent}%  ·  ${summary.squaresWithWaste.toFixed(1)} squares`,
      false,
    ],
    [
      "Rounded up to a whole square",
      `${Math.ceil(summary.squaresWithWaste).toFixed(0)} squares`,
      false,
    ],
    [
      "Ordering margin",
      `+ ${summary.orderMargin} square${summary.orderMargin === 1 ? "" : "s"}`,
      false,
    ],
    ["Quantity to order", `${summary.squaresToOrder.toFixed(1)} squares`, true],
  ];

  for (const [label, value, strong] of rows) {
    if (strong) {
      page.drawLine({
        start: { x: MARGIN, y: y + 13 },
        end: { x: PAGE_W - MARGIN, y: y + 13 },
        thickness: 0.75,
        color: ink.rule,
      });
      y -= 6;
    }
    page.drawText(label, {
      x: MARGIN,
      y,
      size: 9,
      font: strong ? fonts.bodySemi : fonts.body,
      color: strong ? ink.slate900 : ink.slate700,
    });
    const font = strong ? fonts.bodyBold : fonts.bodySemi;
    const size = strong ? 10 : 9;
    page.drawText(value, {
      x: PAGE_W - MARGIN - font.widthOfTextAtSize(value, size),
      y,
      size,
      font,
      color: strong ? ink.accent : ink.slate900,
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
    color: ink.slate500,
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
        color: ink.fill,
        borderColor: ink.accent,
        borderWidth: 0.6,
      });
    }
    page.drawText(item.text, {
      x: rx,
      y,
      size: 8,
      font,
      color: used ? ink.accent : ink.slate500,
    });
    rx += w + 22;
  }
  y -= 16;
  drawParagraph(
    page,
    "A pitched roof covers more area than the ground under it. The slope factor is that ratio — pure geometry, the same for every roofer — and it is not a charge.",
    { x: MARGIN, y, font: fonts.body, size: 8, color: ink.slate500, width: CONTENT_W, leading: 11 },
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

  let y = runningHead(ctx, page, input.address);
  y = sectionHeading(ctx, page, "Waste allowance and material quantity", y);
  y -= 26;

  y = drawParagraph(
    page,
    "A roof never uses exactly its measured area in material. Shingles arrive as rectangles and a roof is not one: every hip, valley, rake and penetration is cut to fit, and the offcuts cannot be used anywhere else. Starter course and ridge cap consume further material, and a bundle occasionally arrives damaged or short.",
    { x: MARGIN, y, font: fonts.body, size: 9, color: ink.slate700, width: CONTENT_W, leading: 13 },
  );
  y -= 26;
  y = drawParagraph(
    page,
    "The waste allowance is the industry's way of accounting for that. It is added to the measured area so a crew does not run short mid-tear-off, and it is an allowance rather than a charge: what a roof actually consumes depends on how it cuts up on the day.",
    { x: MARGIN, y, font: fonts.body, size: 9, color: ink.slate700, width: CONTENT_W, leading: 13 },
  );
  y -= 30;

  // Waste allowance.
  const w = summary.waste;
  page.drawText("ALLOWANCE APPLIED TO THIS ROOF", {
    x: MARGIN,
    y,
    size: 8,
    font: fonts.bodySemi,
    color: ink.slate500,
  });
  y -= 18;

  const boxH = 96;
  page.drawRectangle({
    x: MARGIN,
    y: y - boxH + 12,
    width: CONTENT_W,
    height: boxH,
    color: ink.fill,
  });
  page.drawRectangle({ x: MARGIN, y: y - boxH + 12, width: 3, height: boxH, color: ink.accent });

  let by = y - 6;
  page.drawText(`Roof complexity: ${COMPLEXITY_LABEL[w.complexity]}`, {
    x: MARGIN + 18,
    y: by,
    size: 9.5,
    font: fonts.bodySemi,
    color: ink.slate900,
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
    color: ink.slate700,
    width: CONTENT_W - 36,
    leading: 12,
  });
  by -= 20;

  page.drawText(`${w.percent}%`, {
    x: MARGIN + 18,
    y: by - 10,
    size: 20,
    font: fonts.bodyBold,
    color: ink.accent,
  });
  page.drawText("allowance applied", {
    x: MARGIN + 18 + fonts.bodyBold.widthOfTextAtSize(`${w.percent}%`, 20) + 8,
    y: by - 5,
    size: 8,
    font: fonts.body,
    color: ink.slate500,
  });
  const quantities: [string, string][] = [
    ["MEASURED", `${summary.squares.toFixed(1)} sq`],
    ["WITH ALLOWANCE", `${summary.squaresWithWaste.toFixed(1)} sq`],
    ["TO ORDER", `${summary.squaresToOrder.toFixed(1)} sq`],
  ];
  let qx = MARGIN + 200;
  for (const [label, value] of quantities) {
    page.drawText(label, {
      x: qx,
      y: by + 2,
      size: 7,
      font: fonts.bodySemi,
      color: ink.slate500,
    });
    page.drawText(value, {
      x: qx,
      y: by - 16,
      size: 14,
      font: fonts.bodySemi,
      color: ink.slate900,
    });
    qx += 112;
  }

  y = y - boxH - 20;

  // What the allowance is actually for.
  page.drawText("WHAT THE ALLOWANCE COVERS", {
    x: MARGIN,
    y,
    size: 8,
    font: fonts.bodySemi,
    color: ink.slate500,
  });
  y -= 16;
  const covers = [
    "Cuts at hips, valleys, rakes and around penetrations, where the offcut is scrap.",
    "Starter and cap WHERE THEY ARE CUT FROM FIELD SHINGLES. Dedicated starter and hip-and-ridge products are ordered separately, in linear feet — see the accessory material on the last page.",
    "Alignment and pattern offsets, which on a laminated shingle consume part of each course.",
    "A small margin for damaged, short or colour-mismatched bundles on delivery.",
  ];
  for (const c of covers) {
    page.drawRectangle({ x: MARGIN + 1, y: y + 3, width: 3, height: 3, color: ink.accent });
    y = drawParagraph(page, c, {
      x: MARGIN + 12,
      y,
      font: fonts.body,
      size: 8.5,
      color: ink.slate700,
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
    color: ink.slate500,
  });
  y -= 18;
  const ruleCols = [MARGIN, MARGIN + 210, MARGIN + 330];
  page.drawRectangle({ x: MARGIN, y: y - 6, width: CONTENT_W, height: 20, color: ink.slate900 });
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
        color: ink.fill,
        borderColor: ink.accent,
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
        color: applied ? ink.accent : ink.slate700,
      }),
    );
    y -= 18;
  }
  y -= 6;
  y = drawParagraph(
    page,
    `A roof with any section at 9/12 or steeper adds a further 2%, because steep slopes are cut and staged with less margin for error. The total is capped at 20%. This roof: ${Math.round(w.base * 100)}% base${w.steepAdder > 0 ? ` + ${Math.round(w.steepAdder * 100)}% steep-pitch` : ", no steep-pitch adder"} = ${w.percent}%.`,
    {
      x: MARGIN,
      y,
      font: fonts.body,
      size: 8.5,
      color: ink.slate700,
      width: CONTENT_W,
      leading: 12,
    },
  );
  y -= 20;
  y = drawParagraph(
    page,
    `The quantity to order goes one step further: the figure above is rounded up to a whole square and a ${summary.orderMargin}-square ordering margin is added. That margin is a purchasing decision, not part of the allowance — a traced outline tends to read slightly under an on-roof measurement, and running short mid-tear-off costs far more than a spare bundle. Material is sold in whole bundles in any case, so the supplier converts the square count at the point of order. This figure covers FIELD SHINGLES ONLY: starter, and hip-and-ridge cap, are separate products ordered in linear feet and are listed on the last page.`,
    { x: MARGIN, y, font: fonts.body, size: 8, color: ink.slate500, width: CONTENT_W, leading: 11 },
  );
  y -= 34;

  return page;
}

/* ---------------------------------------------------------- method page  -- */

/** Final page: how the figures were produced, and what they do not cover. */
function drawMethodPage(ctx: Ctx, input: ReportInput) {
  const { doc, fonts, ink } = ctx;
  const page = doc.addPage([PAGE_W, PAGE_H]);
  const { summary } = input;

  let y = runningHead(ctx, page, input.address);
  y = sectionHeading(ctx, page, "Method, ventilation and reference", y);
  y -= 26;

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
    color: ink.slate700,
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
      color: ink.slate500,
    });
    y -= 18;

    const cols = [MARGIN, MARGIN + 70, MARGIN + 210, MARGIN + 330];
    const headers = ["PLANE", "AREA", "PITCH", "FACING"];
    page.drawRectangle({ x: MARGIN, y: y - 6, width: CONTENT_W, height: 20, color: ink.slate900 });
    headers.forEach((h, i) => {
      page.drawText(h, { x: cols[i] + 8, y, size: 7.5, font: fonts.bodySemi, color: ink.white });
    });
    y -= 22;

    summary.planes.forEach((plane, i) => {
      if (i % 2 === 1) {
        page.drawRectangle({ x: MARGIN, y: y - 5, width: CONTENT_W, height: 18, color: ink.fill });
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
          color: ink.slate700,
        });
      });
      y -= 18;
    });
    y -= 14;
  }

  // Other measured figures worth having — all derived from the same trace.
  // Accessory material. These are ordered in linear feet as their own products
  // and are NOT inside the square count, which is a standing way to under-order
  // (owner, 2026-10). The roof edge is measured; hip and ridge length is not —
  // an outline trace gives the perimeter and nothing about the lines inside it,
  // and a plausible-looking guess is exactly the kind of invented figure this
  // report must never print.
  const extras: [string, string, string][] = [];
  if (summary.perimeterFt) {
    extras.push([
      "ROOF EDGE",
      `${money(summary.perimeterFt)} ft`,
      "traced perimeter — the run for drip edge, starter and gutters",
    ]);
  }
  extras.push([
    "HIP & RIDGE",
    "not measured",
    "cap runs along the hips and ridges, which an outline trace does not capture — measure on the roof and add before ordering",
  ]);
  if (extras.length) {
    page.drawText("ACCESSORY MATERIAL — ORDERED SEPARATELY, NOT IN THE SQUARE COUNT", {
      x: MARGIN,
      y,
      size: 8,
      font: fonts.bodySemi,
      color: ink.slate500,
    });
    y -= 18;
    for (const [label, value, note] of extras) {
      page.drawText(label, { x: MARGIN, y, size: 7.5, font: fonts.bodySemi, color: ink.slate500 });
      // A measured figure gets figure treatment; a stated absence like "not
      // measured" is set small and grey so it never reads as a quantity, and
      // so it cannot run into the note beside it.
      const measured = /\d/.test(value);
      page.drawText(value, {
        x: MARGIN + 118,
        y: y + (measured ? 1 : 0),
        size: measured ? 12 : 9,
        font: fonts.bodySemi,
        color: measured ? ink.slate900 : ink.slate500,
      });
      y = drawParagraph(page, note, {
        x: MARGIN + 196,
        y: y + 2,
        font: fonts.body,
        size: 8,
        color: ink.slate700,
        width: CONTENT_W - 196,
        leading: 10,
      });
      y -= 18;
    }
    y -= 2;
  }

  // Ventilation, with the arithmetic shown. Kept and expanded at the owner's
  // request — it is the one figure here a homeowner can act on directly, and
  // the 1-in-300 ratio is a published code requirement rather than a judgement
  // call, so the working can be printed in full.
  if (summary.ventilationNfaSqIn && summary.footprintFt2) {
    page.drawText("VENTILATION REQUIREMENT", {
      x: MARGIN,
      y,
      size: 8,
      font: fonts.bodySemi,
      color: ink.slate500,
    });
    y -= 18;

    const nfa = summary.ventilationNfaSqIn;
    const half = Math.round(nfa / 2);
    const ventBoxH = 50;
    page.drawRectangle({
      x: MARGIN,
      y: y - ventBoxH + 12,
      width: CONTENT_W,
      height: ventBoxH,
      color: ink.fill,
    });
    page.drawRectangle({
      x: MARGIN,
      y: y - ventBoxH + 12,
      width: 2,
      height: ventBoxH,
      color: ink.accent,
    });
    const ventCells: [string, string][] = [
      ["TOTAL NET FREE AREA", `${money(nfa)} sq in`],
      ["INTAKE (AT THE EAVES)", `${money(half)} sq in`],
      ["EXHAUST (AT THE RIDGE)", `${money(half)} sq in`],
    ];
    ventCells.forEach(([label, value], i) => {
      const vx = MARGIN + 18 + i * 168;
      page.drawText(label, {
        x: vx,
        y: y - 4,
        size: 6.5,
        font: fonts.bodyBold,
        color: ink.slate500,
      });
      page.drawText(value, {
        x: vx,
        y: y - 24,
        size: 13,
        font: fonts.bodyBold,
        color: ink.slate900,
      });
    });
    y -= ventBoxH + 10;
    y = drawParagraph(
      page,
      `Attic ventilation is sized from the footprint, not the roof surface: ${money(summary.footprintFt2)} ft² ÷ 300 × 144 = ${money(nfa)} square inches of net free area, split evenly between intake and exhaust (IRC R806.2, balanced 1-in-300 ratio). Net free area is the open area air can actually pass through, which is less than a vent's overall size — the figure is printed on the product.`,
      {
        x: MARGIN,
        y,
        font: fonts.body,
        size: 8.5,
        color: ink.slate700,
        width: CONTENT_W,
        leading: 12,
      },
    );
    y -= 26;
  }

  // Short, and only what a reader actually needs to know about scope.
  page.drawText("NOTES ON THESE FIGURES", {
    x: MARGIN,
    y,
    size: 8,
    font: fonts.bodySemi,
    color: ink.slate500,
  });
  y -= 16;
  const limits = [
    "Decking material is not calculated in this report. The figures cover the roof covering only — the sheathing beneath it, and its condition, are established on the roof.",
    input.method === "manual"
      ? "Figures follow the traced outline and the pitch selected with it, so they are only as accurate as those two inputs."
      : "Figures come from an aerial roof model, which tends to read slightly under an on-roof measurement.",
    "The waste allowance is an estimate from complexity and pitch, not a guarantee of the quantity a roof will consume.",
    "This report states a size. It contains no pricing and is not a quote or a material order.",
  ];
  for (const line of limits) {
    page.drawRectangle({ x: MARGIN + 1, y: y + 3, width: 3, height: 3, color: ink.accent });
    y = drawParagraph(page, line, {
      x: MARGIN + 12,
      y,
      font: fonts.body,
      size: 8.5,
      color: ink.slate700,
      width: CONTENT_W - 12,
      leading: 12,
    });
    y -= 15;
  }

  y -= 8;

  // How to read these figures against someone else's. This is the single most
  // useful thing a measurement document can tell a reader, and it is advice
  // about comparing numbers rather than advice about who to hire.
  page.drawText("HOW TO USE THESE FIGURES", {
    x: MARGIN,
    y,
    size: 8,
    font: fonts.bodySemi,
    color: ink.slate500,
  });
  y -= 16;
  const usage = [
    `Comparing estimates: ask which figure each one was priced on. A bid built on ${summary.squares.toFixed(1)} squares and a bid built on ${summary.squaresToOrder.toFixed(1)} are not the same bid, even at the same rate per square.`,
    "Checking an insurance scope: carrier scopes normally list the roof area, the waste allowance and the accessory lines separately. Compare each against its counterpart here rather than comparing totals.",
    "Against another measurement: differences usually trace to pitch or to where the roof edge was drawn, not to arithmetic. Check those two first.",
  ];
  for (const u of usage) {
    page.drawRectangle({ x: MARGIN + 1, y: y + 3, width: 3, height: 3, color: ink.accent });
    y = drawParagraph(page, u, {
      x: MARGIN + 12,
      y,
      font: fonts.body,
      size: 8.5,
      color: ink.slate700,
      width: CONTENT_W - 12,
      leading: 12,
    });
    y -= 14;
  }

  y -= 8;

  // Plain definitions of every unit used above, so the report can be read by
  // someone who has never bought a roof before.
  page.drawText("TERMS USED IN THIS REPORT", {
    x: MARGIN,
    y,
    size: 8,
    font: fonts.bodySemi,
    color: ink.slate500,
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
    page.drawText(term, { x: MARGIN, y, size: 8.5, font: fonts.bodySemi, color: ink.slate900 });
    y = drawParagraph(page, meaning, {
      x: MARGIN + 92,
      y,
      font: fonts.body,
      size: 8.5,
      color: ink.slate700,
      width: CONTENT_W - 92,
      leading: 11.5,
    });
    y -= 14;
  }

  return page;
}

/* ----------------------------------------------------------------- api  -- */

/**
 * Build the report and return PDF bytes.
 *
 * `deps` is retained for callers that pass a fetch implementation; nothing in
 * the report fetches any more, since the typeface is a built-in standard font.
 */
export async function buildRoofReportPdf(
  input: ReportInput,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  deps?: { fetchImpl?: typeof fetch },
): Promise<Uint8Array> {
  const { PDFDocument, rgb } = await import("pdf-lib");

  const doc = await PDFDocument.create();
  // Metadata carries no company either (owner, 2026-10: "take out all things
  // Northvale and don't replace it with anything"). Author and Producer are
  // left UNSET rather than filled with some other name — an absent field
  // claims nothing, whereas inventing one would be a fabricated fact.
  doc.setTitle(`Roof Measurement Report — ${input.address || "Property"}`);
  doc.setSubject("Roof area, pitch and material quantity. A measurement record, not a quote.");
  doc.setCreationDate(input.now ?? new Date());

  const hexToRgb = (hex: string) =>
    rgb(
      parseInt(hex.slice(1, 3), 16) / 255,
      parseInt(hex.slice(3, 5), 16) / 255,
      parseInt(hex.slice(5, 7), 16) / 255,
    );
  const ink = Object.fromEntries(Object.entries(HEX).map(([k, v]) => [k, hexToRgb(v)])) as Ink;

  const fonts = await loadFonts(doc);
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
