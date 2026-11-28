/**
 * Two gutters, end-on, at true relative scale — and their downspouts.
 *
 * WHY THIS PAGE EXISTS. A homeowner asked to pay more for six-inch gutters
 * has no way to picture the difference. "Six is bigger than five" sounds like
 * one inch, which sounds like nothing. Drawn end-on against each other, the
 * difference is obvious in a second, and the part that actually decides
 * whether a gutter overflows — the downspout — is twice the hole.
 *
 * THE ONE RULE THIS FILE MUST NOT BREAK: the two profiles are drawn at TRUE
 * relative scale to each other, and so are the two downspouts. The whole
 * persuasive force of the drawing is that it is honestly proportioned. Draw
 * the six-inch a little larger than life to make the point land better and
 * the page becomes a lie that happens to be shaped like a diagram — and the
 * owner would be the one holding it in a driveway.
 *
 * WHAT IS AND IS NOT CLAIMED. The nominal widths (5" and 6") and the
 * downspout sizes (2x3 and 3x4) are the industry's own names for these
 * products, and the downspout areas (6 and 12 square inches) are arithmetic
 * on those names. The K-style sub-dimensions — front height, bottom width,
 * the exact ogee curve — vary between manufacturers, so the profile here is
 * drawn to a correct overall width and a plausible shape, and NO sub-dimension
 * is labelled. The page says it is illustrative.
 */

export interface GutterArt {
  bytes: Uint8Array;
  widthPt: number;
  heightPt: number;
  /** Where to put each caption, in points from the left/top of the art box. */
  marks: Array<{ key: string; cx: number; top: number; bottom: number }>;
}

/** Points per inch of real gutter. Chosen so the pair fills the page width. */
const SCALE = 10.5;

const GEO = {
  padX: 18,
  padTop: 6,
  padBottom: 2,
  /** Gap between the 5" group and the 6" group. */
  gutterGap: 104,
  /** Gap between a profile and the downspout drawn under it. */
  stackGap: 20,
};

/**
 * A K-style profile, as a path, with its opening `w` inches wide.
 *
 * The shape: flat back (fastens to the fascia), a decorative ogee front that
 * mimics crown moulding — which is the entire reason K-style exists and why
 * it looks like trim from the ground — and a narrower flat bottom.
 */
function kStyle(ctx: CanvasRenderingContext2D, x: number, yTop: number, w: number): Path2D {
  const W = w * SCALE;
  // Proportions held constant between the two sizes, so the 5" and the 6"
  // are the same gutter at two scales — which is what they are.
  const H = W * 0.74;
  const p = new Path2D();
  const X = (f: number) => x + W * f;
  const Y = (f: number) => yTop + H * f;

  // Back leg: flat, because it screws to the fascia.
  p.moveTo(X(0), Y(0));
  p.lineTo(X(0), Y(1));
  // Narrow flat bottom.
  p.lineTo(X(0.42), Y(1));
  // THE OGEE FRONT, bottom to top. This double curve is the whole point of
  // K-style: from the ground it reads as crown moulding rather than as a
  // trough, which is why it replaced the half-round on almost every house
  // built since the 1960s. A straight or single-curved front would be a
  // different product.
  // Up off the bottom with a convex bulge...
  p.bezierCurveTo(X(0.5), Y(1), X(0.56), Y(0.88), X(0.58), Y(0.76));
  // ...then concave back in, which is the half of the S that makes it an
  // ogee rather than just a rounded corner...
  p.bezierCurveTo(X(0.6), Y(0.64), X(0.7), Y(0.62), X(0.76), Y(0.52));
  // ...then out again to the shoulder.
  p.bezierCurveTo(X(0.86), Y(0.38), X(0.96), Y(0.36), X(1), Y(0.18));
  // The front face, and the short returned lip that stiffens the top edge.
  // Drawn SHORT and blunt: a long diagonal here reads as a spout, which is
  // the one thing a gutter must not look like.
  p.lineTo(X(1), Y(0.07));
  p.lineTo(X(0.93), Y(0.02));
  p.lineTo(X(0.9), Y(0.08));
  p.lineTo(X(0.88), Y(0));
  p.closePath();
  return p;
}

export async function renderGutterArt(opts: { widthPt: number }): Promise<GutterArt | null> {
  if (typeof document === "undefined") return null;

  const five = 5 * SCALE;
  const six = 6 * SCALE;
  const profileH = six * 0.74;
  // Downspouts, drawn in true cross-section: 2x3 and 3x4 inches.
  const dsH = 4 * SCALE;
  const heightPt = GEO.padTop + profileH + GEO.stackGap + dsH + GEO.padBottom;

  const S = 3;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(opts.widthPt * S);
  canvas.height = Math.round(heightPt * S);
  const maybe = canvas.getContext("2d");
  if (!maybe) return null;
  const ctx = maybe;
  ctx.scale(S, S);

  const groupW = Math.max(five, six);
  const totalW = groupW * 2 + GEO.gutterGap;
  const startX = (opts.widthPt - totalW) / 2;

  /** Painted aluminium: a vertical sheen, not a flat fill. */
  const metal = (x: number, yTop: number, h: number, warm: boolean) => {
    const g = ctx.createLinearGradient(x, yTop, x + groupW, yTop + h);
    if (warm) {
      g.addColorStop(0, "#f4f1ea");
      g.addColorStop(0.42, "#ded8cc");
      g.addColorStop(0.62, "#efeae0");
      g.addColorStop(1, "#c9c2b4");
    } else {
      g.addColorStop(0, "#eef0f2");
      g.addColorStop(0.42, "#d3d7dc");
      g.addColorStop(0.62, "#e7eaed");
      g.addColorStop(1, "#bdc3ca");
    }
    return g;
  };

  const marks: GutterArt["marks"] = [];

  const drawGroup = (key: string, x: number, inches: number, dsW: number, dsD: number) => {
    const W = inches * SCALE;
    const H = W * 0.74;
    // The profiles sit on a common BASELINE, so the height difference is
    // visible rather than cancelled out by centring them.
    const yTop = GEO.padTop + (profileH - H);

    const path = kStyle(ctx, x, yTop, inches);

    ctx.save();
    ctx.shadowColor = "rgba(20,26,36,0.22)";
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = metal(x, yTop, H, false);
    ctx.fill(path);
    ctx.restore();

    // The metal has thickness: a dark inner line just inside the section.
    ctx.strokeStyle = "rgba(40,48,58,0.75)";
    ctx.lineWidth = 1.3;
    ctx.stroke(path);

    // Water sitting in it, to the depth the section would hold. This is what
    // makes a cross-section read as a gutter rather than as a letter shape.
    ctx.save();
    ctx.clip(path);
    const waterTop = yTop + H * 0.34;
    const wg = ctx.createLinearGradient(x, waterTop, x, yTop + H);
    wg.addColorStop(0, "rgba(96,150,186,0.75)");
    wg.addColorStop(1, "rgba(44,92,126,0.9)");
    ctx.fillStyle = wg;
    ctx.fillRect(x - 2, waterTop, W + 4, H);
    ctx.strokeStyle = "rgba(226,240,248,0.85)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x - 2, waterTop);
    ctx.lineTo(x + W + 2, waterTop);
    ctx.stroke();
    ctx.restore();

    // The fascia board it hangs on, behind the back leg.
    ctx.fillStyle = "#efe9df";
    ctx.fillRect(x - 7, yTop - 4, 6, H + 8);
    ctx.strokeStyle = "rgba(40,48,58,0.25)";
    ctx.lineWidth = 0.6;
    ctx.strokeRect(x - 7, yTop - 4, 6, H + 8);

    // The downspout, in true cross-section, under its gutter.
    const dsTop = GEO.padTop + profileH + GEO.stackGap;
    const dw = dsW * SCALE;
    const dh = dsD * SCALE;
    const dx = x + (W - dw) / 2;
    ctx.save();
    ctx.shadowColor = "rgba(20,26,36,0.2)";
    ctx.shadowBlur = 5;
    ctx.shadowOffsetY = 3;
    ctx.fillStyle = metal(dx, dsTop, dh, true);
    ctx.fillRect(dx, dsTop, dw, dh);
    ctx.restore();
    ctx.strokeStyle = "rgba(40,48,58,0.75)";
    ctx.lineWidth = 1.3;
    ctx.strokeRect(dx, dsTop, dw, dh);
    // The opening itself, which is the number that matters.
    ctx.fillStyle = "rgba(44,92,126,0.82)";
    ctx.fillRect(dx + 2.4, dsTop + 2.4, dw - 4.8, dh - 4.8);

    marks.push({ key, cx: x + W / 2, top: yTop, bottom: dsTop + dh });
  };

  // 5-inch with a 2x3 downspout; 6-inch with a 3x4. Those are the pairings
  // the trade uses, and pairing a 6" gutter with a 2x3 is the usual way a
  // bigger gutter ends up performing no better than a small one.
  drawGroup("five", startX + (groupW - five) / 2, 5, 2, 3);
  drawGroup("six", startX + groupW + GEO.gutterGap + (groupW - six) / 2, 6, 3, 4);

  const blob: Blob | null = await new Promise((r) => canvas.toBlob(r, "image/png"));
  if (!blob) return null;
  return {
    bytes: new Uint8Array(await blob.arrayBuffer()),
    widthPt: opts.widthPt,
    heightPt,
    marks,
  };
}
