/**
 * The exploded roof, drawn on a canvas so the materials look like materials.
 *
 * WHY NOT PDF VECTORS, WHICH IS WHAT THIS REPLACES. pdf-lib can draw a filled
 * polygon and nothing else — no clipping path, no pattern fill, no image
 * masked into a shape. So every layer came out as a flat colour, and the
 * owner's note was fair: a roof drawn in flat colour looks like a chart of a
 * roof. A canvas clips, so each layer can be filled with what it actually is:
 * strand board that looks like strand board, a granulated shingle that looks
 * granulated — using IKO's own swatch photograph of the colour being quoted,
 * where we have it.
 *
 * The art comes back as one image and the LABELS STAY IN THE PDF as live text
 * with the anchor points this returns. Text baked into a bitmap goes soft in
 * print and cannot be selected or searched.
 *
 * LAYER ORDER IS INSTALLATION ORDER, and the ridge vent sits UNDER the ridge
 * cap (owner, 2026-11-28 — it was drawn above). Physically the vent is
 * fastened over the shingles at the peak and the cap shingles are nailed over
 * the vent, so in an exploded view the cap is the topmost thing on the roof.
 *
 * EVERYTHING HERE IS ILLUSTRATION, not specification: thicknesses are
 * exaggerated to be legible and the drawing says so on the page.
 */

export type LayerKind =
  | "deck"
  | "membrane"
  | "underlayment"
  | "starter"
  | "shingles"
  | "vent"
  | "cap";

export interface ArtLayer {
  key: string;
  kind: LayerKind;
  included: boolean;
}

export interface ArtAnchor {
  key: string;
  /** Points from the left edge of the art box. */
  leftX: number;
  rightX: number;
  /** Points from the TOP of the art box. */
  y: number;
}

export interface RoofArt {
  bytes: Uint8Array;
  widthPt: number;
  heightPt: number;
  anchors: ArtAnchor[];
}

const GEO = {
  W: 86, // half-span of a roof plane
  H: 26, // ridge rise
  D: 26, // depth skew (x)
  DY: 13, // depth skew (y)
  STEP: 34, // vertical gap between exploded layers
  PAD_TOP: 30,
  PAD_BOTTOM: 18,
};

/** Deterministic noise — the same roof must not shimmer between renders. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function shade(hex: string, k: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, Math.round(((n >> 16) & 255) * k));
  const g = Math.min(255, Math.round(((n >> 8) & 255) * k));
  const b = Math.min(255, Math.round((n & 255) * k));
  return `rgb(${r},${g},${b})`;
}

export async function renderRoofArt(
  layers: ArtLayer[],
  opts: { cx: number; widthPt: number; shingleHex: string; swatchUrl?: string | null },
): Promise<RoofArt | null> {
  if (typeof document === "undefined") return null;

  const S = 3; // supersample: ~216dpi once placed at 72pt/inch
  const heightPt = GEO.PAD_TOP + layers.length * GEO.STEP + GEO.H + GEO.DY + GEO.PAD_BOTTOM;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(opts.widthPt * S);
  canvas.height = Math.round(heightPt * S);
  const maybeCtx = canvas.getContext("2d");
  if (!maybeCtx) return null;
  const ctx: CanvasRenderingContext2D = maybeCtx;
  ctx.scale(S, S);

  // The actual shingle photograph, where the colour has one.
  let swatch: ImageBitmap | null = null;
  if (opts.swatchUrl) {
    try {
      const res = await fetch(opts.swatchUrl);
      if (res.ok) swatch = await createImageBitmap(await res.blob());
    } catch {
      swatch = null;
    }
  }

  const { W, H, D, DY } = GEO;
  const cx = opts.cx;
  const anchors: ArtAnchor[] = [];

  /** The two roof planes at a given eave height, as canvas paths. */
  const planes = (top: number) => {
    const left = new Path2D();
    left.moveTo(cx - W, top);
    left.lineTo(cx, top - H);
    left.lineTo(cx + D, top - H - DY);
    left.lineTo(cx - W + D, top - DY);
    left.closePath();

    const right = new Path2D();
    right.moveTo(cx, top - H);
    right.lineTo(cx + W, top);
    right.lineTo(cx + W + D, top - DY);
    right.lineTo(cx + D, top - H - DY);
    right.closePath();

    const edge = new Path2D();
    edge.moveTo(cx - W, top);
    edge.lineTo(cx, top - H);
    edge.lineTo(cx + W, top);
    edge.lineTo(cx + W, top + 4);
    edge.lineTo(cx, top - H + 4);
    edge.lineTo(cx - W, top + 4);
    edge.closePath();

    return { left, right, edge };
  };

  /** Fill a path with a texture drawn by `paint`, clipped to the path. */
  const textured = (path: Path2D, paint: () => void) => {
    ctx.save();
    ctx.clip(path);
    paint();
    ctx.restore();
  };

  function drawLayer(layer: ArtLayer, top: number) {
    const { left, right, edge } = planes(top);
    const muted = !layer.included;
    const rand = rng(layer.key.length * 9173 + 7);

    // The front edge first: the planes sit on top of it and give thickness.
    ctx.fillStyle = muted ? "#b9bbbe" : "#2a2d31";
    ctx.fill(edge);

    const paintPlane = (path: Path2D, lit: number) => {
      textured(path, () => {
        const box = { x: cx - W, y: top - H - DY, w: W * 2 + D, h: H + DY + 8 };

        if (muted) {
          ctx.fillStyle = "#d6d7d9";
          ctx.fillRect(box.x, box.y, box.w, box.h + 10);
          return;
        }

        switch (layer.kind) {
          case "deck": {
            // Oriented strand board: tan ground, then scattered strands.
            ctx.fillStyle = shade("#c9a978", lit);
            ctx.fillRect(box.x, box.y, box.w, box.h + 10);
            for (let i = 0; i < 520; i++) {
              const x = box.x + rand() * box.w;
              const yy = box.y + rand() * (box.h + 10);
              const len = 3 + rand() * 9;
              const ang = (rand() - 0.5) * 1.1;
              ctx.strokeStyle = shade(rand() > 0.5 ? "#b2895c" : "#d9bd92", lit);
              ctx.lineWidth = 0.6 + rand() * 0.9;
              ctx.beginPath();
              ctx.moveTo(x, yy);
              ctx.lineTo(x + Math.cos(ang) * len, yy + Math.sin(ang) * len);
              ctx.stroke();
            }
            break;
          }
          case "membrane": {
            // Self-adhering leak barrier: near-black, faint granular sheen.
            ctx.fillStyle = shade("#3a2f29", lit);
            ctx.fillRect(box.x, box.y, box.w, box.h + 10);
            for (let i = 0; i < 900; i++) {
              ctx.fillStyle = `rgba(255,235,210,${0.03 + rand() * 0.05})`;
              ctx.fillRect(box.x + rand() * box.w, box.y + rand() * (box.h + 10), 1.1, 1.1);
            }
            break;
          }
          case "underlayment": {
            // Synthetic roll goods: grey-blue with woven grain and roll seams.
            ctx.fillStyle = shade("#5d6b7c", lit);
            ctx.fillRect(box.x, box.y, box.w, box.h + 10);
            ctx.strokeStyle = `rgba(255,255,255,0.10)`;
            ctx.lineWidth = 0.4;
            for (let x = box.x; x < box.x + box.w; x += 2.4) {
              ctx.beginPath();
              ctx.moveTo(x, box.y);
              ctx.lineTo(x + 6, box.y + box.h + 10);
              ctx.stroke();
            }
            ctx.strokeStyle = `rgba(0,0,0,0.22)`;
            ctx.lineWidth = 0.9;
            for (let k = 1; k < 3; k++) {
              const yy = box.y + ((box.h + 10) * k) / 3;
              ctx.beginPath();
              ctx.moveTo(box.x, yy);
              ctx.lineTo(box.x + box.w, yy - DY);
              ctx.stroke();
            }
            break;
          }
          case "starter": {
            ctx.fillStyle = shade("#34404f", lit);
            ctx.fillRect(box.x, box.y, box.w, box.h + 10);
            ctx.strokeStyle = "rgba(0,0,0,0.3)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(box.x, top - 2);
            ctx.lineTo(box.x + box.w, top - 2 - DY);
            ctx.stroke();
            break;
          }
          case "shingles":
          case "cap": {
            if (swatch) {
              // IKO's own photograph of the colour, tiled across the plane.
              const tileW = layer.kind === "cap" ? 44 : 62;
              const tileH = (swatch.height / swatch.width) * tileW;
              for (let yy = box.y - tileH; yy < box.y + box.h + 12; yy += tileH * 0.92) {
                for (let x = box.x - tileW; x < box.x + box.w + tileW; x += tileW) {
                  ctx.drawImage(swatch, x, yy, tileW, tileH);
                }
              }
              ctx.fillStyle = lit < 1 ? "rgba(0,0,0,0.22)" : "rgba(0,0,0,0.04)";
              ctx.fillRect(box.x, box.y, box.w, box.h + 12);
            } else {
              ctx.fillStyle = shade(opts.shingleHex, lit);
              ctx.fillRect(box.x, box.y, box.w, box.h + 12);
              for (let i = 0; i < 1600; i++) {
                ctx.fillStyle = `rgba(255,255,255,${0.02 + rand() * 0.06})`;
                ctx.fillRect(box.x + rand() * box.w, box.y + rand() * (box.h + 12), 1, 1);
              }
            }
            // Course shadows, which is what makes a laminated shingle read.
            ctx.strokeStyle = "rgba(0,0,0,0.38)";
            ctx.lineWidth = 0.8;
            const courses = layer.kind === "cap" ? 3 : 3;
            for (let k = 1; k <= courses; k++) {
              const yy = box.y + ((box.h + 12) * k) / (courses + 1);
              ctx.beginPath();
              ctx.moveTo(box.x, yy);
              ctx.lineTo(box.x + box.w, yy - DY);
              ctx.stroke();
            }
            break;
          }
          case "vent": {
            ctx.fillStyle = shade("#44474c", lit);
            ctx.fillRect(box.x, box.y, box.w, box.h + 10);
            ctx.strokeStyle = "rgba(0,0,0,0.3)";
            ctx.lineWidth = 0.7;
            for (let x = box.x; x < box.x + box.w; x += 3.5) {
              ctx.beginPath();
              ctx.moveTo(x, box.y);
              ctx.lineTo(x + 4, box.y + box.h + 10);
              ctx.stroke();
            }
            break;
          }
        }
      });
    };

    if (layer.kind === "vent" || layer.kind === "cap") {
      // Ridge-only elements: a narrow band riding the peak, not a full plane.
      // Narrow, and the vent narrower than the cap that covers it — drawn
      // any wider they read as two more full roof planes rather than as the
      // ridge details they are.
      const halfRun = layer.kind === "vent" ? 30 : 40;
      const band = new Path2D();
      band.moveTo(cx - halfRun, top - H + halfRun * (H / W));
      band.lineTo(cx, top - H);
      band.lineTo(cx + D, top - H - DY);
      band.lineTo(cx + halfRun + D, top - H + halfRun * (H / W) - DY);
      band.lineTo(cx + halfRun, top - H + halfRun * (H / W));
      band.lineTo(cx, top - H + 6);
      band.lineTo(cx - halfRun, top - H + halfRun * (H / W) + 6);
      band.closePath();
      paintPlane(band, 1);
      ctx.strokeStyle = "rgba(0,0,0,0.35)";
      ctx.lineWidth = 0.7;
      ctx.stroke(band);
      if (layer.kind === "vent" && layer.included) {
        ctx.strokeStyle = "rgba(201,162,108,0.95)";
        ctx.lineWidth = 1.1;
        for (let i = 0; i < 3; i++) {
          const ax = cx - 14 + i * 14 + D / 2;
          const ay = top - H - DY - 6;
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(ax, ay - 9);
          ctx.moveTo(ax - 2.6, ay - 6);
          ctx.lineTo(ax, ay - 9);
          ctx.moveTo(ax + 2.6, ay - 6);
          ctx.lineTo(ax, ay - 9);
          ctx.stroke();
        }
      }
      anchors.push({
        key: layer.key,
        leftX: cx - halfRun,
        rightX: cx + halfRun + D,
        y: top - H + halfRun * (H / W) + 3,
      });
      return;
    }

    paintPlane(left, 0.78); // the slope in shadow
    paintPlane(right, 1); // the slope in light
    ctx.strokeStyle = "rgba(0,0,0,0.3)";
    ctx.lineWidth = 0.6;
    ctx.stroke(left);
    ctx.stroke(right);

    anchors.push({ key: layer.key, leftX: cx - W, rightX: cx + W + D, y: top });
  }

  layers.forEach((layer, i) => drawLayer(layer, GEO.PAD_TOP + i * GEO.STEP + H));

  const blob: Blob | null = await new Promise((r) => canvas.toBlob(r, "image/png"));
  if (!blob) return null;
  return {
    bytes: new Uint8Array(await blob.arrayBuffer()),
    widthPt: opts.widthPt,
    heightPt,
    anchors,
  };
}
