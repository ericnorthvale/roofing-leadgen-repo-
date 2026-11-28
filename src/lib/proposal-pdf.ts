/**
 * The proposal a homeowner keeps.
 *
 * BUILT TO MATCH THE OWNER'S OWN STANDARD. He sent through the gutter proposal
 * he wrote for a customer in November 2026, and it set the bar: a running
 * header on every page, key figures as tiles before any prose, prepared-for
 * and prepared-by side by side, scope written out and numbered, a technical
 * diagram that explains the product rather than decorating the page, pricing
 * in a real table, a warranty seal, clarifications, and two signature blocks.
 * This file reproduces that structure for a roof.
 *
 * THE DIAGRAM IS THE PAGE THAT SELLS. In his gutter proposal it is a 5" vs 6"
 * cross-section with capacities; here it is the roof assembly, layer by layer,
 * with anything not in the quote drawn muted and labelled as not included.
 * A homeowner holding three bids cannot otherwise tell that the cheap one
 * leaves out the leak barrier. See proposal-diagram.ts.
 *
 * THE OPPOSITE OF roof-report-pdf.ts, ON PURPOSE. That file is unbranded, set
 * in Helvetica, because a measurement record read beside an EagleView must not
 * look like an advertisement for whoever took it. This is the company's own
 * sales document. Both are right. Do not harmonise them.
 *
 * THE LOGO IS THE DESIGNER'S. Brand guidelines §2.3 forbids redrawing it, so
 * the wordmark is never set as type however close Cormorant looks — it is the
 * supplied PNG, on a solid navy band, because §2.5 requires a light wordmark
 * to sit on something darker than navy-800.
 *
 * EVERY NUMBER CAME FROM THE REP'S MOUTH. Totals are arithmetic on the figures
 * in the draft and nothing else. A line with no price prints as "Included" —
 * never $0, which would understate the quote, and never a guess.
 */
import type { EstimateDraft } from "./estimate-draft";
import { ESTIMATE_ITEMS, BLOCK_LABEL, type EstimateBlock } from "./estimate-items";
import { STUDIO_LINES } from "./design-studio";
import { BRAND } from "./brand";
import { ROOF_LAYERS, RIDGE_VENT_ITEM, DIAGRAM_DISCLAIMER } from "./proposal-diagram";
import {
  ACCEPTANCE,
  aboutSection,
  footerLine,
  openingParagraphs,
  warrantySection,
} from "./proposal-copy";

const ITEM_BY_ID = new Map(ESTIMATE_ITEMS.map((i) => [i.id, i]));
/**
 * ESTIMATE_ITEMS is written in installation order, which is the order a scope
 * should read in: tear off, deck, underlayment, starter, shingles, ridge. The
 * draft arrives in whatever order the rep happened to say things, so "ridge
 * ventilation" could turn up as step 3, before the underlayment it sits on.
 */
const ITEM_ORDER = new Map(ESTIMATE_ITEMS.map((i, idx) => [i.id, idx]));
const inInstallOrder = <T extends { id: string }>(lines: T[]): T[] =>
  [...lines].sort((a, b) => (ITEM_ORDER.get(a.id) ?? 999) - (ITEM_ORDER.get(b.id) ?? 999));

const NAVY = { r: 0x0e / 255, g: 0x18 / 255, b: 0x2f / 255 };
const NAVY_SOFT = { r: 0x1b / 255, g: 0x24 / 255, b: 0x37 / 255 };
const GOLD = { r: 0xc9 / 255, g: 0xa2 / 255, b: 0x6c / 255 };
const GOLD_DEEP = { r: 0x85 / 255, g: 0x61 / 255, b: 0x2d / 255 };
const INK = { r: 0.16, g: 0.18, b: 0.22 };
const MUTED = { r: 0.42, g: 0.45, b: 0.5 };
const FAINT = { r: 0.62, g: 0.65, b: 0.69 };
const RULE = { r: 0.88, g: 0.89, b: 0.9 };
const TINT = { r: 0.969, g: 0.961, b: 0.945 };
const WHITE = { r: 1, g: 1, b: 1 };

const PAGE = { w: 612, h: 792 };
const M = { left: 54, right: 54, bottom: 58 };
const HEADER_H = 64;
const CONTENT_W = PAGE.w - M.left - M.right;
const TOP = PAGE.h - HEADER_H - 34;

export interface ProposalPhoto {
  bytes: Uint8Array;
  type: "jpg" | "png";
  caption?: string;
}

export interface ProposalInput {
  customer: { name: string; address: string; phone: string; email: string };
  draft: EstimateDraft;
  coverImage?: ProposalPhoto | null;
  coverCredit?: string | null;
  /** Extra job photos the rep attached. Rendered on their own page. */
  photos?: ProposalPhoto[];
  date?: Date;
}

const money = (cents: number) =>
  (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
const lineCents = (qty: number | null, price: number) => Math.round((qty ?? 1) * price * 100);

async function fetchBytes(url: string): Promise<Uint8Array | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return new Uint8Array(await res.arrayBuffer());
  } catch {
    return null;
  }
}

/**
 * Site imagery is WebP; pdf-lib embeds only JPEG and PNG. Rather than ship a
 * duplicate set of JPEGs, the browser decodes the WebP it already supports and
 * re-encodes it through a canvas.
 */
async function webpToJpeg(url: string, maxW = 1400): Promise<Uint8Array | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    const bitmap = await createImageBitmap(blob);
    const scale = Math.min(1, maxW / bitmap.width);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const out: Blob | null = await new Promise((r) => canvas.toBlob(r, "image/jpeg", 0.9));
    if (!out) return null;
    return new Uint8Array(await out.arrayBuffer());
  } catch {
    return null;
  }
}

export async function buildProposalPdf(input: ProposalInput): Promise<Uint8Array> {
  const { PDFDocument, rgb, StandardFonts } = await import("pdf-lib");
  const fontkit = (await import("@pdf-lib/fontkit")).default;

  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  pdf.setTitle(`Roofing proposal — ${input.customer.name || input.customer.address}`);
  pdf.setAuthor(BRAND.legalName);
  pdf.setProducer(BRAND.name);
  pdf.setCreationDate(input.date ?? new Date());

  const [corm, m400, m600, m700] = await Promise.all([
    fetchBytes("/fonts/pdf/cormorant-600.ttf"),
    fetchBytes("/fonts/pdf/montserrat-400.ttf"),
    fetchBytes("/fonts/pdf/montserrat-600.ttf"),
    fetchBytes("/fonts/pdf/montserrat-700.ttf"),
  ]);
  const display = corm
    ? await pdf.embedFont(corm, { subset: true })
    : await pdf.embedFont(StandardFonts.TimesRoman);
  const body = m400
    ? await pdf.embedFont(m400, { subset: true })
    : await pdf.embedFont(StandardFonts.Helvetica);
  const mid = m600
    ? await pdf.embedFont(m600, { subset: true })
    : await pdf.embedFont(StandardFonts.HelveticaBold);
  const bold = m700
    ? await pdf.embedFont(m700, { subset: true })
    : await pdf.embedFont(StandardFonts.HelveticaBold);

  const logoBytes = await fetchBytes("/brand/pdf/logo-white.png");
  const logo = logoBytes ? await pdf.embedPng(logoBytes) : null;

  type Font = typeof body;
  type Col = { r: number; g: number; b: number };
  const col = (c: Col) => rgb(c.r, c.g, c.b);

  function wrap(t: string, font: Font, size: number, maxW: number): string[] {
    const out: string[] = [];
    for (const para of t.split("\n")) {
      let line = "";
      for (const w of para.split(/\s+/).filter(Boolean)) {
        const next = line ? `${line} ${w}` : w;
        if (font.widthOfTextAtSize(next, size) > maxW && line) {
          out.push(line);
          line = w;
        } else line = next;
      }
      out.push(line);
    }
    return out;
  }

  const pages: Array<ReturnType<typeof pdf.addPage>> = [];
  let page = pdf.addPage([PAGE.w, PAGE.h]);
  pages.push(page);
  let y = TOP;

  function newPage() {
    page = pdf.addPage([PAGE.w, PAGE.h]);
    pages.push(page);
    y = TOP;
  }
  function need(h: number) {
    if (y - h < M.bottom + 26) newPage();
  }
  function gap(h: number) {
    y -= h;
  }

  /**
   * pdf-lib has no letter-spacing — there is no characterSpacing in
   * PDFPageDrawTextOptions — so tracked type is placed a glyph at a time.
   * Short strings only.
   */
  function tracked(
    s: string,
    o: { x: number; y: number; size: number; font: Font; color: Col; tracking: number },
    target = page,
  ): number {
    let x = o.x;
    for (const ch of s) {
      target.drawText(ch, { x, y: o.y, size: o.size, font: o.font, color: col(o.color) });
      x += o.font.widthOfTextAtSize(ch, o.size) + o.tracking;
    }
    return x - o.x;
  }
  const trackedWidth = (s: string, font: Font, size: number, tr: number) =>
    [...s].reduce((w, ch) => w + font.widthOfTextAtSize(ch, size) + tr, 0) - tr;

  function text(
    s: string,
    o: { font?: Font; size?: number; color?: Col; x?: number; lead?: number; maxW?: number } = {},
  ) {
    const font = o.font ?? body;
    const size = o.size ?? 9.5;
    const lead = o.lead ?? size * 1.55;
    for (const line of wrap(s, font, size, o.maxW ?? CONTENT_W)) {
      need(lead);
      page.drawText(line, {
        x: o.x ?? M.left,
        y: y - size,
        size,
        font,
        color: col(o.color ?? INK),
      });
      y -= lead;
    }
  }

  /** Section heading with the gold rule running off to the right. */
  function sectionHeading(s: string) {
    need(40);
    page.drawText(s, { x: M.left, y: y - 18, size: 17, font: display, color: col(NAVY) });
    const w = display.widthOfTextAtSize(s, 17);
    page.drawLine({
      start: { x: M.left + w + 14, y: y - 11 },
      end: { x: PAGE.w - M.right, y: y - 11 },
      thickness: 1,
      color: col(GOLD),
    });
    y -= 30;
  }

  function kicker(s: string) {
    need(20);
    tracked(s.toUpperCase(), {
      x: M.left,
      y: y - 8,
      size: 7.5,
      font: bold,
      color: GOLD_DEEP,
      tracking: 1.5,
    });
    y -= 19;
  }

  /* ── Page 1 ───────────────────────────────────────────────────── */

  const when = (input.date ?? new Date()).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const blocks = new Set(
    input.draft.lines.map((l) => ITEM_BY_ID.get(l.id)?.block).filter(Boolean) as EstimateBlock[],
  );
  const headline =
    blocks.has("replacement") && blocks.size === 1
      ? "Complete Roof Replacement"
      : blocks.has("replacement")
        ? "Roof Replacement & Exterior Work"
        : blocks.size === 1
          ? `${BLOCK_LABEL[[...blocks][0]]}`
          : "Residential Exterior Work";

  kicker(`Proposal · ${when}`);
  need(46);
  page.drawText(headline, { x: M.left, y: y - 28, size: 27, font: display, color: col(NAVY) });
  y -= 42;

  // One-line summary built only from figures the rep gave.
  const summaryBits: string[] = [];
  if (input.draft.squares) summaryBits.push(`${input.draft.squares} squares`);
  const shingleEntry = (() => {
    if (!input.draft.shingle) return null;
    const [lineKey, slug] = input.draft.shingle.split(":");
    const line = STUDIO_LINES.find((l) => l.key === lineKey);
    const colour = line?.colors.find((c) => c.slug === slug);
    return line && colour ? { line, colour } : null;
  })();
  if (shingleEntry) summaryBits.push(`${shingleEntry.line.name} in ${shingleEntry.colour.name}`);
  if (summaryBits.length) {
    text(summaryBits.join(" · ") + ".", { size: 10.5, color: MUTED, lead: 15 });
    gap(10);
  }

  /* Stat tiles — the figures a homeowner looks for first. */
  const tiles: Array<{ value: string; label: string }> = [];
  if (input.draft.squares) tiles.push({ value: `${input.draft.squares}`, label: "Squares" });
  if (shingleEntry) {
    tiles.push({ value: shingleEntry.line.short, label: "Shingle line" });
    if (shingleEntry.line.impactLabel) {
      tiles.push({ value: shingleEntry.line.impactLabel, label: "Impact rating" });
    }
  }
  if ((BRAND.warranties ?? "").trim()) {
    tiles.push({ value: "5-Year", label: "Workmanship warranty" });
  }

  if (tiles.length) {
    const n = Math.min(tiles.length, 4);
    const tw = (CONTENT_W - (n - 1) * 10) / n;
    const th = 54;
    need(th + 14);
    tiles.slice(0, n).forEach((t, i) => {
      const x = M.left + i * (tw + 10);
      page.drawRectangle({ x, y: y - th, width: tw, height: th, color: col(TINT) });
      page.drawRectangle({ x, y: y - th, width: tw, height: 2.5, color: col(GOLD) });
      let size = 15;
      while (display.widthOfTextAtSize(t.value, size) > tw - 20 && size > 8) size -= 0.5;
      page.drawText(t.value, {
        x: x + 10,
        y: y - 26,
        size,
        font: display,
        color: col(NAVY),
      });
      tracked(t.label.toUpperCase(), {
        x: x + 10,
        y: y - 42,
        size: 6.2,
        font: mid,
        color: MUTED,
        tracking: 0.7,
      });
    });
    y -= th + 16;
  }

  /* Prepared for / Prepared by */
  const colW = (CONTENT_W - 18) / 2;
  const boxH = 92;
  need(boxH + 12);
  page.drawRectangle({ x: M.left, y: y - boxH, width: CONTENT_W, height: boxH, color: col(TINT) });
  page.drawRectangle({ x: M.left, y: y - boxH, width: 2.5, height: boxH, color: col(GOLD) });
  page.drawRectangle({
    x: M.left + colW + 16,
    y: y - boxH,
    width: 2.5,
    height: boxH,
    color: col(GOLD),
  });

  const party = (x: number, heading: string, lines: string[]) => {
    tracked(heading.toUpperCase(), {
      x: x + 12,
      y: y - 18,
      size: 6.4,
      font: mid,
      color: GOLD_DEEP,
      tracking: 0.9,
    });
    page.drawText(lines[0] ?? "", {
      x: x + 12,
      y: y - 38,
      size: 13,
      font: display,
      color: col(NAVY),
    });
    lines.slice(1).forEach((l, i) => {
      page.drawText(l, {
        x: x + 12,
        y: y - 54 - i * 12,
        size: 8.5,
        font: body,
        color: col(INK),
      });
    });
  };

  party(
    M.left,
    "Prepared for",
    [
      input.customer.name.trim() || "—",
      ...input.customer.address
        .trim()
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 2),
      input.customer.phone.trim(),
    ].filter(Boolean),
  );
  party(
    M.left + colW + 16,
    "Prepared by",
    [
      BRAND.legalName,
      ...(BRAND.addressLine1 ? [BRAND.addressLine1] : []),
      ...(BRAND.city ? [`${BRAND.city}, ${BRAND.region} ${BRAND.postalCode}`.trim()] : []),
      BRAND.phoneDisplay,
    ].filter(Boolean),
  );
  y -= boxH + 18;

  /* Property photo */
  /**
   * Draw a photo filling a box, cropped from the centre.
   *
   * CROPPED BEFORE EMBEDDING, NOT MASKED AFTER. The first version scaled the
   * image to cover the box and then painted white rectangles over the
   * overflow — which works on a bare cover and is catastrophic anywhere else,
   * because those rectangles also paint over everything already drawn on the
   * page. It erased the title, the stat tiles and the prepared-for block. The
   * canvas does the crop now, so what gets embedded is exactly the box.
   */
  async function cropToBox(photo: ProposalPhoto, boxW: number, boxH: number) {
    try {
      const blob = new Blob([photo.bytes as BlobPart], {
        type: photo.type === "png" ? "image/png" : "image/jpeg",
      });
      const bitmap = await createImageBitmap(blob);
      // 3x the layout size, capped by the source: ~216dpi, which prints clean.
      const scale = Math.min(3, bitmap.width / boxW);
      const cw = Math.max(1, Math.round(boxW * scale));
      const ch = Math.max(1, Math.round(boxH * scale));
      const canvas = document.createElement("canvas");
      canvas.width = cw;
      canvas.height = ch;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;

      const boxRatio = boxW / boxH;
      const imgRatio = bitmap.width / bitmap.height;
      let sw = bitmap.width;
      let sh = bitmap.height;
      if (imgRatio > boxRatio) sw = bitmap.height * boxRatio;
      else sh = bitmap.width / boxRatio;
      ctx.drawImage(
        bitmap,
        (bitmap.width - sw) / 2,
        (bitmap.height - sh) / 2,
        sw,
        sh,
        0,
        0,
        cw,
        ch,
      );
      const out: Blob | null = await new Promise((r) => canvas.toBlob(r, "image/jpeg", 0.85));
      if (!out) return null;
      return new Uint8Array(await out.arrayBuffer());
    } catch {
      return null;
    }
  }

  async function placePhoto(photo: ProposalPhoto, h: number, credit?: string | null) {
    try {
      need(h + (credit ? 18 : 10));
      const cropped = await cropToBox(photo, CONTENT_W, h);
      const img = cropped
        ? await pdf.embedJpg(cropped)
        : photo.type === "png"
          ? await pdf.embedPng(photo.bytes)
          : await pdf.embedJpg(photo.bytes);
      page.drawImage(img, { x: M.left, y: y - h, width: CONTENT_W, height: h });
      y -= h;
      if (credit) {
        page.drawText(credit, { x: M.left, y: y - 9, size: 6.2, font: body, color: col(FAINT) });
        y -= 13;
      }
      if (photo.caption) {
        gap(4);
        text(photo.caption, { size: 8, color: MUTED, lead: 11 });
      }
      gap(14);
    } catch {
      /* a photo we cannot read is not worth failing a proposal over */
    }
  }

  if (input.coverImage) await placePhoto(input.coverImage, 196, input.coverCredit);

  /* Overview */
  sectionHeading("Project Overview");
  for (const para of openingParagraphs(input.customer.name, input.customer.address)) {
    text(para, { size: 9.5, lead: 15 });
    gap(7);
  }

  /* ── Detailed scope, numbered, prose only ─────────────────────── */

  gap(10);
  sectionHeading("Detailed Scope of Work");

  let step = 0;
  const order: EstimateBlock[] = ["replacement", "repair", "gutters", "ventilation", "maintenance"];
  for (const block of order) {
    const inBlock = inInstallOrder(
      input.draft.lines.filter((l) => ITEM_BY_ID.get(l.id)?.block === block),
    );
    if (!inBlock.length) continue;
    if (blocks.size > 1) {
      need(26);
      gap(4);
      kicker(BLOCK_LABEL[block]);
    }
    for (const l of inBlock) {
      const item = ITEM_BY_ID.get(l.id)!;
      step++;
      need(52);
      const num = String(step).padStart(2, "0");
      page.drawText(num, { x: M.left, y: y - 13, size: 15, font: display, color: col(GOLD) });
      const bodyX = M.left + 34;
      const bodyW = CONTENT_W - 34;
      tracked(item.label.toUpperCase(), {
        x: bodyX,
        y: y - 11,
        size: 7.6,
        font: bold,
        color: NAVY,
        tracking: 0.8,
      });
      y -= 22;
      text(item.detail, { x: bodyX, maxW: bodyW, size: 8.8, lead: 13 });
      gap(11);
    }
  }

  /* ── Roof anatomy diagram ─────────────────────────────────────── */

  const quoted = new Set(input.draft.lines.map((l) => l.id));
  const showDiagram = ROOF_LAYERS.some((l) => l.itemIds.some((id) => quoted.has(id)));

  if (showDiagram) {
    newPage();
    kicker("What goes on your deck");
    sectionHeading("The Anatomy of Your Roof");
    text(
      "A roof is six layers, installed in this order. Every one of them does a job, and the order cannot be changed afterwards — which is why what is included matters more than the headline price.",
      { size: 9.5, lead: 15 },
    );
    gap(16);

    // Panel sized from the stack it holds, rather than a guessed height that
    // left the drawing stranded at the bottom of a mostly empty box.
    const GAP_BETWEEN = 6;
    const stackH =
      ROOF_LAYERS.reduce((h, l) => h + l.thickness, 0) + (ROOF_LAYERS.length - 1) * GAP_BETWEEN;
    const ventH = quoted.has(RIDGE_VENT_ITEM) ? 34 : 0;
    const panelH = stackH + ventH + 52;

    need(panelH + 16);
    const panelTop = y;
    page.drawRectangle({
      x: M.left,
      y: panelTop - panelH,
      width: CONTENT_W,
      height: panelH,
      color: col(TINT),
    });

    const stackX = M.left + 30;
    const stackW = 250;
    const labelX = stackX + stackW + 20;
    let layerY = panelTop - panelH + 26;

    for (const layer of ROOF_LAYERS) {
      // The deck is the customer's own house. It is always drawn as present,
      // and never captioned "not included" — that caption is reserved for
      // things actually absent from the quote, and it loses all its force if
      // it also appears beside the structure they already own.
      const included = layer.existing || layer.itemIds.some((id) => quoted.has(id));
      const fill = included ? layer.fill : { r: 0.84, g: 0.84, b: 0.85 };

      if (layer.courses) {
        const tabs = 6;
        const tw = stackW / tabs;
        for (let i = 0; i < tabs; i++) {
          page.drawRectangle({
            x: stackX + i * tw,
            y: layerY,
            width: tw - 2,
            height: layer.thickness,
            color: col(fill),
          });
        }
      } else {
        page.drawRectangle({
          x: stackX,
          y: layerY,
          width: stackW,
          height: layer.thickness,
          color: col(fill),
        });
      }

      const midY = layerY + layer.thickness / 2;
      page.drawLine({
        start: { x: stackX + stackW + 4, y: midY },
        end: { x: labelX - 7, y: midY },
        thickness: 0.6,
        color: col(included ? MUTED : FAINT),
      });
      page.drawText(layer.label.replace("&amp;", "&"), {
        x: labelX,
        y: midY - 3,
        size: 8.6,
        font: mid,
        color: col(included ? NAVY : FAINT),
      });
      if (layer.existing) {
        page.drawText("your existing structure", {
          x: labelX + mid.widthOfTextAtSize(layer.label.replace("&amp;", "&"), 8.6) + 6,
          y: midY - 2.4,
          size: 6,
          font: body,
          color: col(MUTED),
        });
      } else if (!included) {
        page.drawText("not in this quote", {
          x: labelX + mid.widthOfTextAtSize(layer.label.replace("&amp;", "&"), 8.6) + 6,
          y: midY - 2.4,
          size: 6,
          font: body,
          color: col(FAINT),
        });
      }

      layerY += layer.thickness + GAP_BETWEEN;
    }

    if (quoted.has(RIDGE_VENT_ITEM)) {
      const vy = layerY + 4;
      page.drawRectangle({
        x: stackX + stackW / 2 - 40,
        y: vy,
        width: 80,
        height: 10,
        color: col(GOLD_DEEP),
      });
      // Airflow arrows leaving the ridge.
      for (let i = 0; i < 4; i++) {
        const ax = stackX + stackW / 2 - 24 + i * 16;
        page.drawLine({
          start: { x: ax, y: vy + 13 },
          end: { x: ax, y: vy + 23 },
          thickness: 1,
          color: col(GOLD_DEEP),
        });
        page.drawLine({
          start: { x: ax - 3, y: vy + 19 },
          end: { x: ax, y: vy + 23 },
          thickness: 1,
          color: col(GOLD_DEEP),
        });
        page.drawLine({
          start: { x: ax + 3, y: vy + 19 },
          end: { x: ax, y: vy + 23 },
          thickness: 1,
          color: col(GOLD_DEEP),
        });
      }
      page.drawLine({
        start: { x: stackX + stackW + 4, y: vy + 5 },
        end: { x: labelX - 7, y: vy + 5 },
        thickness: 0.6,
        color: col(MUTED),
      });
      page.drawText("Ridge ventilation", {
        x: labelX,
        y: vy + 7,
        size: 8.6,
        font: mid,
        color: col(NAVY),
      });
      page.drawText("hot attic air leaves here", {
        x: labelX,
        y: vy - 3,
        size: 6,
        font: body,
        color: col(MUTED),
      });
    }

    y = panelTop - panelH - 14;

    // Layer notes, two columns.
    const noteW = (CONTENT_W - 20) / 2;
    const included = ROOF_LAYERS.filter((l) => l.itemIds.some((id) => quoted.has(id)));
    for (let i = 0; i < included.length; i += 2) {
      const pair = included.slice(i, i + 2);
      const heights = pair.map((l) => 13 + wrap(l.note, body, 7.8, noteW - 14).length * 10.5 + 8);
      need(Math.max(...heights));
      const rowTop = y;
      pair.forEach((layer, j) => {
        const x = M.left + j * (noteW + 20);
        page.drawCircle({
          x: x + 5,
          y: rowTop - 6,
          size: 5,
          color: col(layer.fill),
        });
        page.drawText(layer.label.replace("&amp;", "&"), {
          x: x + 14,
          y: rowTop - 9,
          size: 8,
          font: mid,
          color: col(NAVY),
        });
        wrap(layer.note, body, 7.8, noteW - 14).forEach((ln, k) => {
          page.drawText(ln, {
            x: x + 14,
            y: rowTop - 21 - k * 10.5,
            size: 7.8,
            font: body,
            color: col(INK),
          });
        });
      });
      y = rowTop - Math.max(...heights);
    }

    gap(6);
    text(DIAGRAM_DISCLAIMER, { size: 6.6, color: FAINT, lead: 9 });
  }

  /* ── The colour you chose ─────────────────────────────────────── */

  if (shingleEntry) {
    const { line, colour } = shingleEntry;
    newPage();
    kicker("Your shingle");
    sectionHeading(`${line.name} — ${colour.name}`);
    text(line.story, { size: 9.5, lead: 15 });
    gap(14);

    const homeJpg = colour.home ? await webpToJpeg(colour.home) : null;
    if (homeJpg) {
      await placePhoto({ bytes: homeJpg, type: "jpg" }, 212);
      gap(-6);
      text(`${colour.name} on an IKO-photographed home. Product photography supplied by IKO.`, {
        size: 6.6,
        color: FAINT,
        lead: 9,
      });
      gap(12);
    }

    // Swatch on the left, colour note and manufacturer coverage on the right.
    // Stacked vertically these overflowed and pushed the coverage table onto a
    // page of its own, which is a worse document than a slightly busier one.
    const swatchJpg = colour.swatch ? await webpToJpeg(colour.swatch, 700) : null;
    const specs: Array<[string, string]> = [
      ["Product warranty", line.productWarranty],
      ["Wind", line.windShort],
    ];
    if (line.impactLabel) specs.push(["Impact", line.impactLabel]);
    if (line.algaeYears) specs.push(["Algae", `${line.algaeYears}-year coverage`]);
    if (line.ironCladYears) specs.push(["Iron Clad", `${line.ironCladYears} years`]);

    const swW = 132;
    const rightX = M.left + swW + 20;
    const rightW = CONTENT_W - swW - 20;
    const noteLines = wrap(colour.note, body, 8.2, rightW);
    const rightH = 18 + noteLines.length * 11 + 18 + specs.length * 14;

    let swH = 0;
    let swImg = null;
    if (swatchJpg) {
      try {
        swImg = await pdf.embedJpg(swatchJpg);
        swH = (swImg.height / swImg.width) * swW;
      } catch {
        swImg = null;
      }
    }

    need(Math.max(swH, rightH) + 12);
    const blockTop = y;

    if (swImg) {
      page.drawImage(swImg, { x: M.left, y: blockTop - swH, width: swW, height: swH });
    }

    page.drawText(colour.name, {
      x: rightX,
      y: blockTop - 14,
      size: 14,
      font: display,
      color: col(NAVY),
    });
    noteLines.forEach((ln, i) => {
      page.drawText(ln, {
        x: rightX,
        y: blockTop - 30 - i * 11,
        size: 8.2,
        font: body,
        color: col(INK),
      });
    });

    let specY = blockTop - 30 - noteLines.length * 11 - 14;
    tracked("Manufacturer coverage", {
      x: rightX,
      y: specY,
      size: 6.4,
      font: mid,
      color: GOLD_DEEP,
      tracking: 0.9,
    });
    specY -= 13;
    for (const [k, v] of specs) {
      page.drawText(k, { x: rightX, y: specY, size: 7.6, font: mid, color: col(NAVY) });
      page.drawText(v, { x: rightX + 96, y: specY, size: 7.6, font: body, color: col(INK) });
      page.drawLine({
        start: { x: rightX, y: specY - 4.5 },
        end: { x: PAGE.w - M.right, y: specY - 4.5 },
        thickness: 0.4,
        color: col(RULE),
      });
      specY -= 14;
    }

    y = blockTop - Math.max(swH, rightH) - 10;

    gap(6);
    text(
      "Manufacturer coverage is IKO's and is subject to its own terms and registration. We register it in your name where the product allows.",
      { size: 6.8, color: FAINT, lead: 9.5 },
    );
  }

  /* ── Job photos ───────────────────────────────────────────────── */

  if (input.photos?.length) {
    newPage();
    kicker("On site");
    sectionHeading("Photographs");
    for (const photo of input.photos.slice(0, 8)) {
      await placePhoto(photo, 200);
    }
  }

  /* ── Investment summary ───────────────────────────────────────── */

  newPage();
  kicker("Investment & project assurances");
  sectionHeading("Investment Summary");

  const rowH = 26;
  const headH = 24;
  need(headH + 10);
  page.drawRectangle({
    x: M.left,
    y: y - headH,
    width: CONTENT_W,
    height: headH,
    color: col(NAVY),
  });
  const qtyX = M.left + CONTENT_W - 190;
  const amtRight = PAGE.w - M.right - 10;
  tracked("Description", {
    x: M.left + 10,
    y: y - 15,
    size: 6.6,
    font: mid,
    color: WHITE,
    tracking: 0.9,
  });
  tracked("Quantity", { x: qtyX, y: y - 15, size: 6.6, font: mid, color: WHITE, tracking: 0.9 });
  const amtLabelW = trackedWidth("AMOUNT", mid, 6.6, 0.9);
  tracked("Amount", {
    x: amtRight - amtLabelW,
    y: y - 15,
    size: 6.6,
    font: mid,
    color: WHITE,
    tracking: 0.9,
  });
  y -= headH;

  let total = 0;
  inInstallOrder(input.draft.lines).forEach((l, i) => {
    const item = ITEM_BY_ID.get(l.id);
    if (!item) return;
    const cents = l.price === null ? null : lineCents(l.qty, l.price);
    if (cents !== null) total += cents;

    need(rowH);
    if (i % 2 === 0) {
      page.drawRectangle({
        x: M.left,
        y: y - rowH,
        width: CONTENT_W,
        height: rowH,
        color: col(TINT),
      });
    }
    let label = item.label;
    let size = 8.4;
    while (body.widthOfTextAtSize(label, size) > qtyX - M.left - 20 && size > 6.4) size -= 0.2;
    page.drawText(label, { x: M.left + 10, y: y - 17, size, font: body, color: col(INK) });

    const qty = l.qty !== null && l.qty !== 1 ? `${l.qty} ${item.unit}` : l.qty === 1 ? "1" : "—";
    page.drawText(qty, { x: qtyX, y: y - 17, size: 8.4, font: body, color: col(MUTED) });

    const amount = cents === null ? "Included" : money(cents);
    const aw = (cents === null ? body : bold).widthOfTextAtSize(amount, 8.6);
    page.drawText(amount, {
      x: amtRight - aw,
      y: y - 17,
      size: 8.6,
      font: cents === null ? body : bold,
      color: col(cents === null ? MUTED : NAVY),
    });
    y -= rowH;
  });

  // Total bar
  const barH = 42;
  need(barH + 10);
  gap(8);
  page.drawRectangle({ x: M.left, y: y - barH, width: CONTENT_W, height: barH, color: col(NAVY) });
  page.drawRectangle({
    x: M.left,
    y: y - barH - 3,
    width: CONTENT_W,
    height: 3,
    color: col(GOLD),
  });
  tracked("Total proposed investment", {
    x: M.left + 14,
    y: y - 26,
    size: 8,
    font: mid,
    color: GOLD,
    tracking: 1.1,
  });
  const tv = money(total);
  const tvw = display.widthOfTextAtSize(tv, 22);
  page.drawText(tv, {
    x: PAGE.w - M.right - 14 - tvw,
    y: y - 30,
    size: 22,
    font: display,
    color: col(WHITE),
  });
  y -= barH + 14;

  if (input.draft.squares && total > 0) {
    text(
      `${money(Math.round(total / input.draft.squares))} per square on ${input.draft.squares} squares.`,
      { size: 7.8, color: MUTED, lead: 11 },
    );
  }
  if (input.draft.deposit !== null) {
    text(
      `Deposit to schedule: ${money(Math.round(input.draft.deposit * 100))}. Balance due on completion.`,
      { size: 8.6, lead: 13 },
    );
  }
  const unpriced = input.draft.lines.filter((l) => l.price === null).length;
  if (unpriced > 0) {
    text(
      `${unpriced === 1 ? "One item is" : `${unpriced} items are`} marked Included — covered by the pricing above at no separate charge.`,
      { size: 7.8, color: MUTED, lead: 11 },
    );
  }
  gap(14);

  /* ── Warranty seal ────────────────────────────────────────────── */

  const warranty = warrantySection();
  if (warranty) {
    const sealH = 96;
    need(sealH + 12);
    const top = y;
    page.drawRectangle({
      x: M.left,
      y: top - sealH,
      width: CONTENT_W,
      height: sealH,
      color: col(TINT),
    });
    const cx = M.left + 48;
    const cy = top - sealH / 2;
    page.drawCircle({ x: cx, y: cy, size: 30, borderColor: col(GOLD_DEEP), borderWidth: 2 });
    page.drawCircle({ x: cx, y: cy, size: 25.5, borderColor: col(GOLD), borderWidth: 0.6 });
    const five = "5";
    const fw = display.widthOfTextAtSize(five, 24);
    page.drawText(five, {
      x: cx - fw / 2,
      y: cy - 2,
      size: 24,
      font: display,
      color: col(NAVY),
    });
    const yrW = trackedWidth("YEAR", mid, 5.4, 0.7);
    tracked("YEAR", {
      x: cx - yrW / 2,
      y: cy - 13,
      size: 5.4,
      font: mid,
      color: GOLD_DEEP,
      tracking: 0.7,
    });
    const wtW = trackedWidth("WARRANTY", mid, 5.4, 0.7);
    tracked("WARRANTY", {
      x: cx - wtW / 2,
      y: cy - 21,
      size: 5.4,
      font: mid,
      color: GOLD_DEEP,
      tracking: 0.7,
    });

    const tx = M.left + 92;
    const tw = CONTENT_W - 92 - 14;
    page.drawText(warranty.heading, {
      x: tx,
      y: top - 24,
      size: 13,
      font: display,
      color: col(NAVY),
    });
    wrap(warranty.body[0], body, 8, tw).forEach((ln, i) => {
      page.drawText(ln, { x: tx, y: top - 40 - i * 11, size: 8, font: body, color: col(INK) });
    });
    y = top - sealH - 16;
  }

  /* ── Clarifications + authorisation ───────────────────────────── */

  const about = aboutSection();
  // Reserve room for the clarifications AND the authorisation block together.
  // Letting them split put two orphaned lines at the top of a final page and
  // left two thirds of it white.
  need(300);
  sectionHeading("Project Notes & Clarifications");
  for (const para of about.body) {
    text(para, { size: 8.6, lead: 13 });
    gap(6);
  }
  if (warranty && warranty.body[1]) {
    text(warranty.body[1], { size: 8.6, lead: 13 });
    gap(6);
  }

  gap(10);
  need(150);
  sectionHeading("Client Authorization");
  text(ACCEPTANCE.body, { size: 8.6, lead: 13 });
  gap(28);

  const sigW = (CONTENT_W - 28) / 2;
  need(60);
  const names = [input.customer.name.trim() || "Client", BRAND.legalName];
  names.forEach((n, i) => {
    page.drawText(n, {
      x: M.left + i * (sigW + 28),
      y: y - 2,
      size: 11,
      font: display,
      color: col(NAVY),
    });
  });
  y -= 30;
  const sigLabels = [
    [ACCEPTANCE.customerLabel, ACCEPTANCE.dateLabel],
    [ACCEPTANCE.repLabel, ACCEPTANCE.dateLabel],
  ];
  sigLabels.forEach((pair, i) => {
    const baseX = M.left + i * (sigW + 28);
    const lineW = (sigW - 14) * 0.62;
    const dateW = sigW - 14 - lineW;
    [
      { x: baseX, w: lineW, label: pair[0] },
      { x: baseX + lineW + 14, w: dateW, label: pair[1] },
    ].forEach((f) => {
      page.drawLine({
        start: { x: f.x, y },
        end: { x: f.x + f.w, y },
        thickness: 0.7,
        color: col(MUTED),
      });
      tracked(f.label.toUpperCase(), {
        x: f.x,
        y: y - 11,
        size: 5.8,
        font: mid,
        color: MUTED,
        tracking: 0.6,
      });
    });
  });

  /* ── Header + footer on every page ────────────────────────────── */

  const foot = footerLine();
  const footW = body.widthOfTextAtSize(foot, 7.2);
  const docType = blocks.has("replacement")
    ? "Residential Roofing Proposal"
    : "Residential Exterior Proposal";

  pages.forEach((p, i) => {
    p.drawRectangle({
      x: 0,
      y: PAGE.h - HEADER_H,
      width: PAGE.w,
      height: HEADER_H,
      color: col(NAVY),
    });
    p.drawRectangle({
      x: 0,
      y: PAGE.h - HEADER_H - 2.5,
      width: PAGE.w,
      height: 2.5,
      color: col(GOLD),
    });

    if (logo) {
      const lw = 132;
      const scale = lw / logo.width;
      p.drawImage(logo, {
        x: M.left,
        y: PAGE.h - HEADER_H + (HEADER_H - logo.height * scale) / 2,
        width: lw,
        height: logo.height * scale,
      });
    } else {
      p.drawText(BRAND.name, {
        x: M.left,
        y: PAGE.h - HEADER_H + 24,
        size: 16,
        font: display,
        color: col(WHITE),
      });
    }

    const dw = trackedWidth(docType.toUpperCase(), mid, 7.2, 1.1);
    tracked(
      docType.toUpperCase(),
      {
        x: PAGE.w - M.right - dw,
        y: PAGE.h - HEADER_H + 34,
        size: 7.2,
        font: mid,
        color: WHITE,
        tracking: 1.1,
      },
      p,
    );
    const pg = `PAGE ${i + 1} OF ${pages.length}`;
    const pw = trackedWidth(pg, body, 6.2, 0.9);
    tracked(
      pg,
      {
        x: PAGE.w - M.right - pw,
        y: PAGE.h - HEADER_H + 20,
        size: 6.2,
        font: body,
        color: GOLD,
        tracking: 0.9,
      },
      p,
    );

    p.drawLine({
      start: { x: M.left, y: M.bottom - 2 },
      end: { x: PAGE.w - M.right, y: M.bottom - 2 },
      thickness: 0.5,
      color: col(RULE),
    });
    p.drawText(foot, {
      x: (PAGE.w - footW) / 2,
      y: M.bottom - 16,
      size: 7.2,
      font: body,
      color: col(MUTED),
    });
  });

  return pdf.save();
}
