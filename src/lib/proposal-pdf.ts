/**
 * The proposal a homeowner keeps.
 *
 * NOT A PRINT OF THE SCREEN. The estimator's job is to be fast in a driveway;
 * this document's job is to sit on a kitchen table beside two other bids and
 * be the one that looks like a real company wrote it. Different jobs, so a
 * real document rather than window.print().
 *
 * THE OPPOSITE OF roof-report-pdf.ts, ON PURPOSE. That one is deliberately
 * unbranded, set in Helvetica, because a measurement record read beside an
 * EagleView must not look like an advertisement for whoever took it. This one
 * is the company's own sales document, so it uses the company's typefaces,
 * the company's navy and gold, and the real logo. Both files are right; they
 * are answering different questions. Do not "harmonise" them.
 *
 * BUILT IN THE BROWSER, like the measurement report — no server key, no
 * per-download cost, nothing to configure in Vercel. pdf-lib and fontkit are
 * imported dynamically so none of this weight loads until someone taps
 * Download.
 *
 * THE LOGO IS THE REAL ONE. Brand guidelines §2.3: never redraw the logo. So
 * the wordmark is not set as type however close the font would look — it is
 * the designer's PNG from docs/brand-assets/original, staged at
 * public/brand/pdf/. The white mark sits on a solid navy band, which §2.5
 * requires: the navy wordmark may never go on a photo, and a light wordmark
 * needs a background darker than navy-800 to hold contrast.
 *
 * EVERY NUMBER HERE CAME FROM THE REP'S MOUTH. The totals are arithmetic on
 * the figures in the draft and nothing else. A line with no price prints as
 * "Included" — never as $0, which would understate the quote, and never with
 * a guess.
 */
import type { EstimateDraft } from "./estimate-draft";
import { ESTIMATE_ITEMS, BLOCK_LABEL, type EstimateBlock } from "./estimate-items";
import { BRAND } from "./brand";
import {
  ACCEPTANCE,
  SCOPE_INTRO,
  aboutSection,
  footerLine,
  openingParagraphs,
  warrantySection,
} from "./proposal-copy";

const ITEM_BY_ID = new Map(ESTIMATE_ITEMS.map((i) => [i.id, i]));

/** Brand colours, as rgb() triples in pdf-lib's 0–1 space. */
const NAVY = { r: 0x0e / 255, g: 0x18 / 255, b: 0x2f / 255 }; // navy-900 #0E182F
const GOLD = { r: 0xc9 / 255, g: 0xa2 / 255, b: 0x6c / 255 }; // brand gold — dark bg only
const GOLD_DEEP = { r: 0x85 / 255, g: 0x61 / 255, b: 0x2d / 255 }; // gold-600, the only gold on white
const INK = { r: 0.16, g: 0.18, b: 0.22 };
const MUTED = { r: 0.42, g: 0.45, b: 0.5 };
const RULE = { r: 0.89, g: 0.9, b: 0.91 };

const PAGE = { w: 612, h: 792 }; // US Letter, portrait
const M = { left: 54, right: 54, top: 54, bottom: 58 };
const CONTENT_W = PAGE.w - M.left - M.right;

export interface ProposalInput {
  customer: { name: string; address: string; phone: string; email: string };
  draft: EstimateDraft;
  /** Cover photo bytes (JPEG or PNG). Omitted = a typographic cover. */
  coverImage?: { bytes: Uint8Array; type: "jpg" | "png" } | null;
  /** Credit line for the cover photo, where its licence asks for one. */
  coverCredit?: string | null;
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

export async function buildProposalPdf(input: ProposalInput): Promise<Uint8Array> {
  const { PDFDocument, rgb } = await import("pdf-lib");
  const fontkit = (await import("@pdf-lib/fontkit")).default;

  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);

  pdf.setTitle(`Roofing proposal — ${input.customer.name || input.customer.address}`);
  pdf.setAuthor(BRAND.legalName);
  pdf.setProducer(BRAND.name);
  pdf.setCreationDate(input.date ?? new Date());

  // Brand typefaces. If a font cannot be fetched we fall back to a standard
  // face rather than fail the download — a plain proposal beats no proposal.
  const [cormorantBytes, mont400, mont600, mont700] = await Promise.all([
    fetchBytes("/fonts/pdf/cormorant-600.ttf"),
    fetchBytes("/fonts/pdf/montserrat-400.ttf"),
    fetchBytes("/fonts/pdf/montserrat-600.ttf"),
    fetchBytes("/fonts/pdf/montserrat-700.ttf"),
  ]);

  const { StandardFonts } = await import("pdf-lib");
  const display = cormorantBytes
    ? await pdf.embedFont(cormorantBytes, { subset: true })
    : await pdf.embedFont(StandardFonts.TimesRoman);
  const body = mont400
    ? await pdf.embedFont(mont400, { subset: true })
    : await pdf.embedFont(StandardFonts.Helvetica);
  const bodyMid = mont600
    ? await pdf.embedFont(mont600, { subset: true })
    : await pdf.embedFont(StandardFonts.HelveticaBold);
  const bodyBold = mont700
    ? await pdf.embedFont(mont700, { subset: true })
    : await pdf.embedFont(StandardFonts.HelveticaBold);

  const logoWhiteBytes = await fetchBytes("/brand/pdf/logo-white.png");
  const logoWhite = logoWhiteBytes ? await pdf.embedPng(logoWhiteBytes) : null;

  const col = (c: { r: number; g: number; b: number }) => rgb(c.r, c.g, c.b);

  /* ── text helpers ─────────────────────────────────────────────── */

  type Font = typeof body;

  /** Greedy wrap. pdf-lib has no layout engine; this is the whole of it. */
  function wrap(text: string, font: Font, size: number, maxW: number): string[] {
    const out: string[] = [];
    for (const para of text.split("\n")) {
      let line = "";
      for (const word of para.split(/\s+/).filter(Boolean)) {
        const next = line ? `${line} ${word}` : word;
        if (font.widthOfTextAtSize(next, size) > maxW && line) {
          out.push(line);
          line = word;
        } else {
          line = next;
        }
      }
      out.push(line);
    }
    return out;
  }

  /**
   * Letterspaced text, drawn a character at a time.
   *
   * pdf-lib has no tracking option — there is no `characterSpacing` in
   * PDFPageDrawTextOptions, however much one would like there to be. The
   * brand's tracked-out gold kicker is not decoration worth dropping, so the
   * glyphs are placed individually. Short strings only; never body copy.
   */
  function drawTracked(
    s: string,
    o: {
      x: number;
      y: number;
      size: number;
      font: Font;
      color: { r: number; g: number; b: number };
      tracking: number;
    },
  ): number {
    let x = o.x;
    for (const ch of s) {
      page.drawText(ch, { x, y: o.y, size: o.size, font: o.font, color: col(o.color) });
      x += o.font.widthOfTextAtSize(ch, o.size) + o.tracking;
    }
    return x - o.x;
  }

  /* ── page machinery ───────────────────────────────────────────── */

  const pages: Array<ReturnType<typeof pdf.addPage>> = [];
  let page = pdf.addPage([PAGE.w, PAGE.h]);
  let y = 0;

  function newPage() {
    page = pdf.addPage([PAGE.w, PAGE.h]);
    pages.push(page);
    y = PAGE.h - M.top;
    return page;
  }

  /** Reserve vertical space, breaking the page when it will not fit. */
  function need(h: number) {
    if (y - h < M.bottom + 24) newPage();
  }

  function text(
    s: string,
    opts: {
      font?: Font;
      size?: number;
      color?: { r: number; g: number; b: number };
      x?: number;
      lead?: number;
      maxW?: number;
    } = {},
  ) {
    const font = opts.font ?? body;
    const size = opts.size ?? 10;
    const lead = opts.lead ?? size * 1.55;
    const maxW = opts.maxW ?? CONTENT_W;
    for (const line of wrap(s, font, size, maxW)) {
      need(lead);
      page.drawText(line, {
        x: opts.x ?? M.left,
        y: y - size,
        size,
        font,
        color: col(opts.color ?? INK),
      });
      y -= lead;
    }
  }

  function gap(h: number) {
    y -= h;
  }

  /** The tracked-out gold kicker used above headings sitewide. */
  function kicker(s: string) {
    need(22);
    drawTracked(s.toUpperCase(), {
      x: M.left,
      y: y - 8,
      size: 7.5,
      font: bodyBold,
      color: GOLD_DEEP,
      tracking: 1.4,
    });
    y -= 20;
  }

  function heading(s: string) {
    need(34);
    page.drawText(s, { x: M.left, y: y - 19, size: 19, font: display, color: col(NAVY) });
    y -= 30;
  }

  function rule() {
    need(14);
    page.drawLine({
      start: { x: M.left, y: y - 6 },
      end: { x: PAGE.w - M.right, y: y - 6 },
      thickness: 0.75,
      color: col(RULE),
    });
    y -= 16;
  }

  /* ── 1. Cover ─────────────────────────────────────────────────── */

  pages.push(page);
  const BAND_H = 188;

  // Navy band. Brand §2.5: a light wordmark needs a background darker than
  // navy-800, and the navy wordmark may never sit on a photograph.
  page.drawRectangle({
    x: 0,
    y: PAGE.h - BAND_H,
    width: PAGE.w,
    height: BAND_H,
    color: col(NAVY),
  });

  if (logoWhite) {
    const LOGO_W = 232; // ≈ 3.2in — comfortably over the 1.5in print minimum
    const scale = LOGO_W / logoWhite.width;
    page.drawImage(logoWhite, {
      x: M.left,
      y: PAGE.h - BAND_H + 58,
      width: LOGO_W,
      height: logoWhite.height * scale,
    });
  } else {
    page.drawText(BRAND.name, {
      x: M.left,
      y: PAGE.h - BAND_H + 84,
      size: 30,
      font: display,
      color: rgb(1, 1, 1),
    });
  }

  drawTracked(BRAND.tagline, {
    x: M.left,
    y: PAGE.h - BAND_H + 30,
    size: 8.5,
    font: bodyMid,
    color: GOLD,
    tracking: 1.3,
  });

  // Cover photograph, below the band, full bleed to the margins.
  const PHOTO_TOP = PAGE.h - BAND_H - 26;
  const PHOTO_H = 250;
  if (input.coverImage) {
    try {
      const img =
        input.coverImage.type === "png"
          ? await pdf.embedPng(input.coverImage.bytes)
          : await pdf.embedJpg(input.coverImage.bytes);
      // Cover the box and centre-crop, rather than squash the house.
      const boxRatio = CONTENT_W / PHOTO_H;
      const imgRatio = img.width / img.height;
      let dw = CONTENT_W;
      let dh = PHOTO_H;
      if (imgRatio > boxRatio) dw = PHOTO_H * imgRatio;
      else dh = CONTENT_W / imgRatio;
      // pdf-lib cannot clip, so the overflow is centred and the band plus the
      // text block below sit over it.
      page.drawImage(img, {
        x: M.left - (dw - CONTENT_W) / 2,
        y: PHOTO_TOP - PHOTO_H - (dh - PHOTO_H) / 2,
        width: dw,
        height: dh,
      });
      page.drawRectangle({
        x: 0,
        y: PHOTO_TOP,
        width: PAGE.w,
        height: PAGE.h - PHOTO_TOP,
        color: rgb(1, 1, 1),
      });
      page.drawRectangle({
        x: 0,
        y: PAGE.h - BAND_H,
        width: PAGE.w,
        height: BAND_H,
        color: col(NAVY),
      });
      if (logoWhite) {
        const LOGO_W = 232;
        const scale = LOGO_W / logoWhite.width;
        page.drawImage(logoWhite, {
          x: M.left,
          y: PAGE.h - BAND_H + 58,
          width: LOGO_W,
          height: logoWhite.height * scale,
        });
      }
      drawTracked(BRAND.tagline, {
        x: M.left,
        y: PAGE.h - BAND_H + 30,
        size: 8.5,
        font: bodyMid,
        color: GOLD,
        tracking: 1.3,
      });
      page.drawRectangle({
        x: 0,
        y: 0,
        width: PAGE.w,
        height: PHOTO_TOP - PHOTO_H,
        color: rgb(1, 1, 1),
      });
    } catch {
      // A photo we cannot read is not worth failing a proposal over.
    }
  }

  // With a photo the block sits under it; without one it drops towards the
  // optical centre, so a cover with no imagery reads as composed rather than
  // as a page something failed to load onto.
  y = input.coverImage ? PHOTO_TOP - PHOTO_H - 42 : PAGE.h - BAND_H - 190;

  // The photo credit belongs under the photo it credits, not down beside the
  // company footer where it collided with the NAP line.
  if (input.coverImage && input.coverCredit) {
    page.drawText(input.coverCredit, {
      x: M.left,
      y: PHOTO_TOP - PHOTO_H - 13,
      size: 6.5,
      font: body,
      color: col(MUTED),
    });
  }

  kicker("Roofing proposal");
  const when = (input.date ?? new Date()).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  if (input.customer.name.trim()) {
    page.drawText(input.customer.name.trim(), {
      x: M.left,
      y: y - 22,
      size: 23,
      font: display,
      color: col(NAVY),
    });
    y -= 32;
  }
  if (input.customer.address.trim()) {
    text(input.customer.address.trim(), { size: 10.5, color: MUTED, font: bodyMid });
  }
  gap(4);
  text(`Prepared ${when}`, { size: 9, color: MUTED });

  /* ── 2. The letter ────────────────────────────────────────────── */

  newPage();
  kicker("What we propose");
  heading("The work on your roof");
  for (const para of openingParagraphs(input.customer.name, input.customer.address)) {
    text(para, { size: 10, lead: 16 });
    gap(8);
  }

  /* ── 3. Scope, written out, grouped by trade ──────────────────── */

  gap(10);
  rule();
  gap(6);
  text(SCOPE_INTRO, { size: 9.5, color: MUTED, lead: 15 });
  gap(14);

  const order: EstimateBlock[] = ["replacement", "repair", "gutters", "ventilation", "maintenance"];
  const present = order.filter((b) =>
    input.draft.lines.some((l) => ITEM_BY_ID.get(l.id)?.block === b),
  );

  let total = 0;

  for (const block of present) {
    need(60);
    gap(6);
    kicker(BLOCK_LABEL[block]);

    for (const line of input.draft.lines) {
      const item = ITEM_BY_ID.get(line.id);
      if (!item || item.block !== block) continue;

      const cents = line.price === null ? null : lineCents(line.qty, line.price);
      if (cents !== null) total += cents;

      need(54);
      // Title left, amount right, on one baseline.
      const amount = cents === null ? "Included" : money(cents);
      const amountW = bodyBold.widthOfTextAtSize(amount, 10.5);
      const titleW = CONTENT_W - amountW - 16;

      const titleLines = wrap(item.label, bodyMid, 10.5, titleW);
      const firstBaseline = y - 10.5;
      titleLines.forEach((l, i) => {
        page.drawText(l, {
          x: M.left,
          y: firstBaseline - i * 15,
          size: 10.5,
          font: bodyMid,
          color: col(NAVY),
        });
      });
      page.drawText(amount, {
        x: PAGE.w - M.right - amountW,
        y: firstBaseline,
        size: 10.5,
        font: bodyBold,
        color: col(cents === null ? MUTED : NAVY),
      });
      y -= titleLines.length * 15 + 2;

      // The breakdown is only worth printing when there is a real quantity to
      // break down. A lump sum carries qty 1 by convention, and rendering that
      // as "1 foot × $1,250.00 each" states a PER-FOOT price the rep never
      // quoted — a pricing misstatement on a document the customer keeps.
      if (line.qty !== null && line.qty !== 1 && line.price !== null) {
        text(`${line.qty} ${item.unit}  ×  ${money(Math.round(line.price * 100))} each`, {
          size: 8.5,
          color: MUTED,
          lead: 13,
        });
      } else if (line.qty !== null && line.qty !== 1) {
        text(`${line.qty} ${item.unit}`, { size: 8.5, color: MUTED, lead: 13 });
      }

      // The vetted explanation from the catalogue.
      gap(2);
      text(item.detail, { size: 9, color: INK, lead: 14 });
      gap(12);
    }
  }

  /* ── 4. The number ────────────────────────────────────────────── */

  need(86);
  gap(6);
  rule();
  gap(10);

  const totalLabel = "Total";
  const totalValue = money(total);
  page.drawText(totalLabel, { x: M.left, y: y - 20, size: 13, font: display, color: col(NAVY) });
  const tvW = bodyBold.widthOfTextAtSize(totalValue, 20);
  page.drawText(totalValue, {
    x: PAGE.w - M.right - tvW,
    y: y - 22,
    size: 20,
    font: bodyBold,
    color: col(NAVY),
  });
  y -= 36;

  if (input.draft.squares && total > 0) {
    text(
      `${money(Math.round(total / input.draft.squares))} per square on ${input.draft.squares} squares`,
      {
        size: 8.5,
        color: MUTED,
      },
    );
  }

  if (input.draft.deposit !== null) {
    gap(6);
    text(
      `Deposit to schedule: ${money(Math.round(input.draft.deposit * 100))}. The balance is due on completion.`,
      { size: 9.5, color: INK, lead: 15 },
    );
  }

  const unpriced = input.draft.lines.filter((l) => l.price === null).length;
  if (unpriced > 0) {
    gap(6);
    text(
      `${unpriced === 1 ? "One item is" : `${unpriced} items are`} marked Included — covered by the pricing above at no separate charge.`,
      { size: 8.5, color: MUTED, lead: 13 },
    );
  }

  /* ── 5. What the rep found ────────────────────────────────────── */

  if (input.draft.notes.trim()) {
    // need(), not newPage(): forcing a break here is what produced a sheet
    // carrying nothing but the total.
    need(120);
    gap(18);
    kicker("What we found");
    heading("On your roof today");
    text(input.draft.notes.trim(), { size: 10, lead: 16 });
    gap(16);
  } else {
    gap(22);
  }

  /* ── 6. Warranty, about, acceptance ───────────────────────────── */

  const sections = [warrantySection(), aboutSection()].filter(Boolean) as Array<{
    heading: string;
    body: string[];
  }>;

  for (const section of sections) {
    need(100);
    gap(10);
    heading(section.heading);
    for (const para of section.body) {
      text(para, { size: 9.5, lead: 15 });
      gap(7);
    }
  }

  need(170);
  gap(14);
  heading(ACCEPTANCE.heading);
  text(ACCEPTANCE.body, { size: 9.5, lead: 15 });
  gap(30);

  const sigW = (CONTENT_W - 24) / 2;
  const sigY = y - 6;
  for (const [i, label] of [ACCEPTANCE.customerLabel, ACCEPTANCE.dateLabel].entries()) {
    const x = M.left + i * (sigW + 24);
    page.drawLine({
      start: { x, y: sigY },
      end: { x: x + sigW, y: sigY },
      thickness: 0.75,
      color: col(MUTED),
    });
    page.drawText(label, { x, y: sigY - 12, size: 8, font: body, color: col(MUTED) });
  }
  y = sigY - 34;

  /* ── 7. Footer on every page ──────────────────────────────────── */

  const foot = footerLine();
  const footW = body.widthOfTextAtSize(foot, 7.5);
  pages.forEach((p, i) => {
    p.drawLine({
      start: { x: M.left, y: M.bottom + 6 },
      end: { x: PAGE.w - M.right, y: M.bottom + 6 },
      thickness: 0.5,
      color: col(RULE),
    });
    p.drawText(foot, {
      x: (PAGE.w - footW) / 2,
      y: M.bottom - 8,
      size: 7.5,
      font: body,
      color: col(MUTED),
    });
    if (i > 0) {
      const n = `${i + 1} / ${pages.length}`;
      const nw = body.widthOfTextAtSize(n, 7.5);
      p.drawText(n, {
        x: PAGE.w - M.right - nw,
        y: M.bottom - 20,
        size: 7.5,
        font: body,
        color: col(MUTED),
      });
    }
  });

  return pdf.save();
}
