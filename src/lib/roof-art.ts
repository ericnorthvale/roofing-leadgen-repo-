/**
 * The exploded roof, drawn on a canvas so the materials look like materials.
 *
 * WHY NOT PDF VECTORS, WHICH IS WHAT THIS REPLACES. pdf-lib can draw a filled
 * polygon and nothing else — no clipping path, no pattern fill, no image
 * masked into a shape. So every layer came out as a flat colour, and a roof
 * drawn in flat colour looks like a chart of a roof. A canvas clips, so each
 * layer can be filled with what it actually is: strand board that looks like
 * strand board, a granulated shingle that looks granulated — using IKO's own
 * swatch photograph of the colour being quoted, where we have it.
 *
 * The art comes back as one image and the LABELS STAY IN THE PDF as live text
 * with the anchor points this returns. Text baked into a bitmap goes soft in
 * print and cannot be selected or searched.
 *
 * WHAT CHANGED ON 2026-11-28, and why, because the owner's verdict was blunt
 * ("the diagram is horrible honestly") and the reasons are worth keeping:
 *
 *   1. THE LAYERS HAD NO THICKNESS. Each one was a filled parallelogram with a
 *      hairline edge, so six materials stacked up read as six sheets of paper.
 *      Every layer is now EXTRUDED — the front rake and the right-hand side
 *      are drawn as real faces, in darker shades of the material, at a
 *      thickness that differs per layer. That single change is most of the
 *      difference between a diagram and a drawing: you can see that a deck is
 *      thick and a membrane is thin.
 *   2. THE PITCH WAS TOO SHALLOW AND THE DEPTH TOO SHORT (3.6/12, 26pt deep),
 *      so each plane read as a flat lozenge. It is now ~6/12 over a much
 *      longer run, which is both a normal Houston pitch and a shape the eye
 *      reads as a roof.
 *   3. NOTHING CAST A SHADOW, so nothing looked lifted. Each layer now drops a
 *      soft shadow onto the one beneath it.
 *   4. ONE LIGHT SOURCE, consistently: the right plane is lit, the left is in
 *      shade, and every cut face is darker than the plane it belongs to.
 *
 * LAYER ORDER IS INSTALLATION ORDER: deck, leak barrier, underlayment,
 * starter, shingles, ridge vent, ridge cap. The vent sits UNDER the cap
 * (owner, 2026-11-28) because the vent is fastened over the field shingles at
 * the peak and the caps are nailed over the vent.
 *
 * EVERYTHING HERE IS ILLUSTRATION, not specification: thicknesses are
 * exaggerated to be legible, and the drawing says so on the page.
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

/**
 * THESE NUMBERS ARE CONSTRAINED FROM TWO SIDES, so change them together.
 *
 * Sideways: the drawing has to sit BETWEEN the two label columns on the page.
 * The left column ends at x=130 and the right begins at x=366, so the art may
 * run from about 150 to about 358 — a total width of 2*W + D. Overrun it and
 * the house slides under the right-hand labels, which is what it used to do.
 *
 * Vertically: the whole thing has to fit on the page UNDER the heading and
 * intro, or the layout breaks it onto a page of its own and leaves the
 * heading stranded. That caps the total height at roughly 400pt, and the
 * total is PAD_TOP + layers*STEP + H + DY + WALL + PAD_BOTTOM.
 */
const GEO = {
  W: 76, // half-span of a roof plane
  H: 38, // ridge rise — 38/76 is a true 6/12, the common pitch here
  D: 46, // depth skew (x)
  DY: 23, // depth skew (y)
  STEP: 38, // vertical gap between exploded layers
  PAD_TOP: 24,
  PAD_BOTTOM: 12,
  WALL: 62, // the house body the layers are lifted off
};

/**
 * How thick each material is DRAWN, in points. Not to scale — a 7/16" deck and
 * a 20-mil underlayment cannot share a scale and stay visible — but the
 * ORDERING is true, and that ordering is what a homeowner reads: the deck is
 * the heavy thing, the membranes are films, the shingle is substantial again.
 */
const THICK: Record<LayerKind, number> = {
  deck: 7,
  membrane: 2.5,
  underlayment: 2,
  starter: 3.5,
  shingles: 6,
  vent: 5,
  cap: 7,
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

/** The body colour of each material, used for its cut faces. */
const EDGE_HEX: Record<LayerKind, string> = {
  deck: "#c09255",
  membrane: "#3a3634",
  underlayment: "#8e959c",
  starter: "#34312d",
  shingles: "#3a3f45",
  vent: "#3f4348",
  cap: "#2a2d31",
};

export async function renderRoofArt(
  layers: ArtLayer[],
  opts: { cx: number; widthPt: number; shingleHex: string; swatchUrl?: string | null },
): Promise<RoofArt | null> {
  if (typeof document === "undefined") return null;

  const S = 3; // supersample: ~216dpi once placed at 72pt/inch
  const heightPt =
    GEO.PAD_TOP + layers.length * GEO.STEP + GEO.H + GEO.DY + GEO.WALL + GEO.PAD_BOTTOM;
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

    return { left, right };
  };

  /**
   * The CUT FACES of a layer — what you would see if you sawed through the
   * roof. The front one follows the gable rake; the side one runs back along
   * the right eave. Drawing these is what gives a material its substance.
   */
  const cutFaces = (top: number, t: number) => {
    const front = new Path2D();
    front.moveTo(cx - W, top);
    front.lineTo(cx, top - H);
    front.lineTo(cx + W, top);
    front.lineTo(cx + W, top + t);
    front.lineTo(cx, top - H + t);
    front.lineTo(cx - W, top + t);
    front.closePath();

    const side = new Path2D();
    side.moveTo(cx + W, top);
    side.lineTo(cx + W + D, top - DY);
    side.lineTo(cx + W + D, top - DY + t);
    side.lineTo(cx + W, top + t);
    side.closePath();

    return { front, side };
  };

  /** Fill a path with a texture drawn by `paint`, clipped to the path. */
  const textured = (path: Path2D, paint: () => void) => {
    ctx.save();
    ctx.clip(path);
    paint();
    ctx.restore();
  };

  function drawLayer(layer: ArtLayer, top: number) {
    const muted = !layer.included;
    const rand = rng(layer.key.length * 9173 + 7);
    const t = THICK[layer.kind];

    const paintPlane = (path: Path2D, lit: number, box: DOMRect | null = null) => {
      const b = box ?? {
        x: cx - W - 2,
        y: top - H - DY - 2,
        width: W * 2 + D + 4,
        height: H + DY + t + 14,
      };
      textured(path, () => {
        if (muted) {
          // Not quoted: a flat, obviously-blank material. It must read as an
          // absence at a glance, so it carries no texture at all.
          ctx.fillStyle = "#dcdee0";
          ctx.fillRect(b.x, b.y, b.width, b.height);
          ctx.strokeStyle = "rgba(120,126,134,0.5)";
          ctx.lineWidth = 0.5;
          ctx.setLineDash([3, 3]);
          for (let x = b.x - b.height; x < b.x + b.width; x += 7) {
            ctx.beginPath();
            ctx.moveTo(x, b.y + b.height);
            ctx.lineTo(x + b.height, b.y);
            ctx.stroke();
          }
          ctx.setLineDash([]);
          return;
        }

        switch (layer.kind) {
          case "deck": {
            // Oriented strand board laid in SHEETS, with the seams visible —
            // a speckled field reads as sand, not as a deck.
            ctx.fillStyle = shade("#c9a978", lit);
            ctx.fillRect(b.x, b.y, b.width, b.height);
            for (let i = 0; i < 900; i++) {
              const x = b.x + rand() * b.width;
              const yy = b.y + rand() * b.height;
              const len = 4 + rand() * 11;
              const ang = (rand() - 0.5) * 1.1;
              ctx.strokeStyle = shade(rand() > 0.5 ? "#b2895c" : "#dcc097", lit);
              ctx.lineWidth = 0.6 + rand() * 1.1;
              ctx.beginPath();
              ctx.moveTo(x, yy);
              ctx.lineTo(x + Math.cos(ang) * len, yy + Math.sin(ang) * len);
              ctx.stroke();
            }
            // Sheet joints running up the slope, with fasteners along them.
            ctx.strokeStyle = "rgba(92,66,38,0.5)";
            ctx.lineWidth = 0.9;
            for (let k = 1; k < 6; k++) {
              const x = b.x + (b.width * k) / 6;
              ctx.beginPath();
              ctx.moveTo(x, b.y);
              ctx.lineTo(x - DY * 0.6, b.y + b.height);
              ctx.stroke();
            }
            break;
          }
          case "membrane": {
            // Self-adhered SBS-modified bitumen on a glass-fibre mat, SANDED on
            // top (IKO GoldShield / StormShield, per the Florida evaluation
            // report). Sanded means matte and finely speckled — not a glossy
            // black sheet. IKO publishes no colour for it, so this stays a
            // neutral dark rather than inventing one.
            ctx.fillStyle = shade("#403c39", lit);
            ctx.fillRect(b.x, b.y, b.width, b.height);
            for (let i = 0; i < 3200; i++) {
              const g = 0.04 + rand() * 0.13;
              ctx.fillStyle = `rgba(226,219,208,${g})`;
              ctx.fillRect(b.x + rand() * b.width, b.y + rand() * b.height, 0.9, 0.9);
            }
            // The selvedge lap line down the roll — how it actually goes on.
            ctx.strokeStyle = "rgba(0,0,0,0.3)";
            ctx.lineWidth = 1;
            for (let k = 1; k < 3; k++) {
              const yy = b.y + (b.height * k) / 3;
              ctx.beginPath();
              ctx.moveTo(b.x, yy);
              ctx.lineTo(b.x + b.width, yy - DY * 0.5);
              ctx.stroke();
            }
            break;
          }
          case "underlayment": {
            // Woven synthetic, PRINTED SIDE UP. IKO's data sheets describe lay
            // lines printed along the roll with bold dots at the recommended
            // fastener positions, and say to install printed side up — that
            // print is what makes a synthetic underlayment recognisable, so it
            // is drawn rather than left a plain grey field.
            ctx.fillStyle = shade("#9aa1a8", lit);
            ctx.fillRect(b.x, b.y, b.width, b.height);
            ctx.strokeStyle = "rgba(255,255,255,0.09)";
            ctx.lineWidth = 0.35;
            for (let x = b.x; x < b.x + b.width; x += 2.4) {
              ctx.beginPath();
              ctx.moveTo(x, b.y);
              ctx.lineTo(x + 6, b.y + b.height);
              ctx.stroke();
            }
            for (let k = 1; k < 5; k++) {
              const yy = b.y + (b.height * k) / 5;
              ctx.strokeStyle = "rgba(28,36,48,0.5)";
              ctx.lineWidth = 0.55;
              ctx.setLineDash([2.5, 2]);
              ctx.beginPath();
              ctx.moveTo(b.x, yy);
              ctx.lineTo(b.x + b.width, yy - DY * 0.6);
              ctx.stroke();
              ctx.setLineDash([]);
              if (k % 2 === 0) {
                for (let x = b.x + 9; x < b.x + b.width; x += 20) {
                  ctx.fillStyle = "rgba(28,36,48,0.55)";
                  ctx.beginPath();
                  ctx.arc(x, yy - ((x - b.x) / b.width) * DY * 0.6, 1, 0, Math.PI * 2);
                  ctx.fill();
                }
              }
            }
            break;
          }
          case "starter": {
            // A starter is a SHINGLE — fibreglass asphalt, granule side up,
            // with a sealant band along the edge that goes at the eave (IKO
            // Leading Edge Plus). IKO publishes no colour for it and its own
            // blog says starter granules are generally natural and darker, so
            // this is a dark granulated strip, and the sealant band is drawn
            // because it is the entire reason the course exists.
            ctx.fillStyle = shade("#3b3833", lit);
            ctx.fillRect(b.x, b.y, b.width, b.height);
            for (let i = 0; i < 2200; i++) {
              ctx.fillStyle = `rgba(255,250,240,${0.03 + rand() * 0.08})`;
              ctx.fillRect(b.x + rand() * b.width, b.y + rand() * b.height, 1, 1);
            }
            break;
          }
          case "shingles":
          case "cap": {
            if (swatch) {
              // IKO's own photograph of the colour, tiled across the plane.
              const tileW = layer.kind === "cap" ? 40 : 58;
              const tileH = (swatch.height / swatch.width) * tileW;
              for (let yy = b.y - tileH; yy < b.y + b.height + tileH; yy += tileH * 0.9) {
                for (let x = b.x - tileW; x < b.x + b.width + tileW; x += tileW) {
                  ctx.drawImage(swatch, x, yy, tileW, tileH);
                }
              }
              ctx.fillStyle = lit < 1 ? "rgba(0,0,0,0.26)" : "rgba(0,0,0,0.03)";
              ctx.fillRect(b.x, b.y, b.width, b.height);
            } else {
              ctx.fillStyle = shade(opts.shingleHex, lit);
              ctx.fillRect(b.x, b.y, b.width, b.height);
              for (let i = 0; i < 2400; i++) {
                ctx.fillStyle = `rgba(255,255,255,${0.02 + rand() * 0.07})`;
                ctx.fillRect(b.x + rand() * b.width, b.y + rand() * b.height, 1, 1);
              }
            }
            if (layer.kind === "shingles") {
              // Course shadows and STAGGERED BUTT JOINTS — the offset between
              // courses is what makes a laminated roof read as shingles rather
              // than as a textured sheet.
              const courses = 4;
              for (let k = 1; k <= courses; k++) {
                const yy = b.y + (b.height * k) / (courses + 1);
                ctx.strokeStyle = "rgba(0,0,0,0.42)";
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(b.x, yy);
                ctx.lineTo(b.x + b.width, yy - DY * 0.6);
                ctx.stroke();
                ctx.strokeStyle = "rgba(255,255,255,0.08)";
                ctx.lineWidth = 0.6;
                ctx.beginPath();
                ctx.moveTo(b.x, yy + 1);
                ctx.lineTo(b.x + b.width, yy - DY * 0.6 + 1);
                ctx.stroke();
                // Butt joints, offset half a tab each course.
                ctx.strokeStyle = "rgba(0,0,0,0.3)";
                ctx.lineWidth = 0.7;
                const off = k % 2 ? 0 : 11;
                for (let x = b.x + off; x < b.x + b.width; x += 22) {
                  const slope = ((x - b.x) / b.width) * DY * 0.6;
                  ctx.beginPath();
                  ctx.moveTo(x, yy - slope);
                  ctx.lineTo(x - 2, yy - slope + b.height / (courses + 1));
                  ctx.stroke();
                }
              }
            }
            break;
          }
          case "vent": {
            // Rolled ridge vent: a corrugated polymer core under a weather
            // filter, which reads as a close ribbed band at the peak.
            ctx.fillStyle = shade("#43474d", lit);
            ctx.fillRect(b.x, b.y, b.width, b.height);
            for (let x = b.x; x < b.x + b.width; x += 3) {
              ctx.strokeStyle = "rgba(0,0,0,0.32)";
              ctx.lineWidth = 0.8;
              ctx.beginPath();
              ctx.moveTo(x, b.y);
              ctx.lineTo(x + 4, b.y + b.height);
              ctx.stroke();
              ctx.strokeStyle = "rgba(255,255,255,0.1)";
              ctx.lineWidth = 0.5;
              ctx.beginPath();
              ctx.moveTo(x + 1.4, b.y);
              ctx.lineTo(x + 5.4, b.y + b.height);
              ctx.stroke();
            }
            break;
          }
        }
      });
    };

    /** The cut faces, in a darker version of whatever the material is. */
    const paintCuts = (top2: number) => {
      const { front, side } = cutFaces(top2, t);
      const hex = EDGE_HEX[layer.kind];

      // The shadow this layer throws onto the one below it. Drawn with the
      // front face so it tracks the real silhouette.
      ctx.save();
      ctx.shadowColor = "rgba(20,26,36,0.34)";
      ctx.shadowBlur = 7;
      ctx.shadowOffsetY = 5;
      ctx.fillStyle = muted ? "#c3c6ca" : shade(hex, 0.52);
      ctx.fill(front);
      ctx.restore();

      ctx.fillStyle = muted ? "#b9bcc1" : shade(hex, 0.4);
      ctx.fill(side);

      // A fine highlight along the very top arris of the cut, which is what
      // separates one material from the next at a glance.
      ctx.strokeStyle = muted ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.22)";
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.moveTo(cx - W, top2);
      ctx.lineTo(cx, top2 - H);
      ctx.lineTo(cx + W, top2);
      ctx.lineTo(cx + W + D, top2 - DY);
      ctx.stroke();
    };

    if (layer.kind === "vent" || layer.kind === "cap") {
      // Ridge-only elements: a narrow band riding the peak, not a full plane.
      // The vent is narrower than the cap that covers it — drawn any wider
      // they read as two more roof planes rather than as ridge details.
      const halfRun = layer.kind === "vent" ? 24 : 32;
      const drop = halfRun * (H / W);
      const band = new Path2D();
      band.moveTo(cx - halfRun, top - H + drop);
      band.lineTo(cx, top - H);
      band.lineTo(cx + halfRun, top - H + drop);
      band.lineTo(cx + halfRun + D, top - H + drop - DY);
      band.lineTo(cx + D, top - H - DY);
      band.lineTo(cx - halfRun + D, top - H + drop - DY);
      band.closePath();

      // Its own thickness, as a front face under the band.
      const face = new Path2D();
      face.moveTo(cx - halfRun, top - H + drop);
      face.lineTo(cx, top - H);
      face.lineTo(cx + halfRun, top - H + drop);
      face.lineTo(cx + halfRun, top - H + drop + t);
      face.lineTo(cx, top - H + t);
      face.lineTo(cx - halfRun, top - H + drop + t);
      face.closePath();

      ctx.save();
      ctx.shadowColor = "rgba(20,26,36,0.36)";
      ctx.shadowBlur = 7;
      ctx.shadowOffsetY = 5;
      ctx.fillStyle = muted ? "#c3c6ca" : shade(EDGE_HEX[layer.kind], 0.5);
      ctx.fill(face);
      ctx.restore();

      const bandBox = {
        x: cx - halfRun - 2,
        y: top - H - DY - 4,
        width: halfRun * 2 + D + 4,
        height: drop + DY + t + 8,
      } as DOMRect;
      paintPlane(band, 1, bandBox);

      if (layer.kind === "cap" && layer.included) {
        // IKO's Hip & Ridge 12 is perforated and TAPERED — one shingle makes
        // three caps — so a ridge is a run of overlapping tapered pieces, not
        // a smooth strip. The joints are what make it read as cap shingles.
        ctx.save();
        ctx.clip(band);
        for (let x = cx - halfRun; x < cx + halfRun + D; x += 10) {
          ctx.strokeStyle = "rgba(0,0,0,0.5)";
          ctx.lineWidth = 0.9;
          ctx.beginPath();
          ctx.moveTo(x, top - H - DY - 6);
          ctx.lineTo(x - 4, top - H + drop + t + 6);
          ctx.stroke();
          ctx.strokeStyle = "rgba(255,255,255,0.1)";
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(x + 1.2, top - H - DY - 6);
          ctx.lineTo(x - 2.8, top - H + drop + t + 6);
          ctx.stroke();
        }
        ctx.restore();
      }

      ctx.strokeStyle = "rgba(0,0,0,0.38)";
      ctx.lineWidth = 0.7;
      ctx.stroke(band);

      if (layer.kind === "vent" && layer.included) {
        // The air actually leaving, which is the only reason the part exists.
        ctx.strokeStyle = "rgba(201,162,108,0.95)";
        ctx.lineWidth = 1.2;
        for (let i = 0; i < 3; i++) {
          const ax = cx - 14 + i * 14 + D / 2;
          const ay = top - H - DY - 8;
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(ax, ay - 10);
          ctx.moveTo(ax - 2.8, ay - 6.6);
          ctx.lineTo(ax, ay - 10);
          ctx.moveTo(ax + 2.8, ay - 6.6);
          ctx.lineTo(ax, ay - 10);
          ctx.stroke();
        }
      }

      anchors.push({
        key: layer.key,
        leftX: cx - halfRun,
        rightX: cx + halfRun + D,
        y: top - H + drop + t / 2,
      });
      return;
    }

    paintCuts(top);
    const { left, right } = planes(top);
    paintPlane(left, 0.74); // the slope in shade
    paintPlane(right, 1); // the slope in light

    // The ridge line, drawn last so it sits above both planes.
    ctx.strokeStyle = "rgba(0,0,0,0.33)";
    ctx.lineWidth = 0.7;
    ctx.stroke(left);
    ctx.stroke(right);

    anchors.push({ key: layer.key, leftX: cx - W, rightX: cx + W + D, y: top + t / 2 });
  }

  /**
   * THE HOUSE THE LAYERS CAME OFF. Without it the drawing is seven shapes
   * floating in space; with it a homeowner sees their own house with its roof
   * taken apart above it, which is the whole idea.
   *
   * Drawn first, so every roof layer stacks over it.
   */
  function drawHouse(eaveTop: number) {
    const wallTop = eaveTop;
    const wallBottom = eaveTop + GEO.WALL;
    const r = rng(4242);

    // Ground shadow, so the house stands on something rather than floating.
    ctx.save();
    ctx.globalAlpha = 0.16;
    ctx.fillStyle = "#1d2430";
    ctx.beginPath();
    ctx.ellipse(cx + D / 2, wallBottom + 4, W + D * 0.6, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    const gableEnd = new Path2D();
    gableEnd.moveTo(cx - W, wallTop);
    gableEnd.lineTo(cx, wallTop - H);
    gableEnd.lineTo(cx + W, wallTop);
    gableEnd.closePath();

    const sideWall = new Path2D();
    sideWall.moveTo(cx + W, wallTop);
    sideWall.lineTo(cx + W + D, wallTop - DY);
    sideWall.lineTo(cx + W + D, wallBottom - DY);
    sideWall.lineTo(cx + W, wallBottom);
    sideWall.closePath();

    const frontWall = new Path2D();
    frontWall.moveTo(cx - W, wallTop);
    frontWall.lineTo(cx + W, wallTop);
    frontWall.lineTo(cx + W, wallBottom);
    frontWall.lineTo(cx - W, wallBottom);
    frontWall.closePath();

    // Brick, course by course, with the bricks varying in tone. A flat fill
    // with lines ruled over it reads as graph paper; individually shaded
    // bricks read as a wall.
    const brick = (path: Path2D, base: string, lit: number) => {
      ctx.save();
      ctx.clip(path);
      const x0 = cx - W - 6;
      const y0 = wallTop - H - 6;
      const w = W * 2 + D + 12;
      const h = GEO.WALL + H + 16;
      ctx.fillStyle = shade("#8d6f5e", lit);
      ctx.fillRect(x0, y0, w, h);
      const bh = 5.2;
      const bw = 12;
      for (let yy = y0, row = 0; yy < y0 + h; yy += bh, row++) {
        const off = row % 2 ? bw / 2 : 0;
        for (let xx = x0 - bw + off; xx < x0 + w; xx += bw) {
          const v = 0.86 + r() * 0.26;
          ctx.fillStyle = shade(base, lit * v);
          ctx.fillRect(xx + 0.5, yy + 0.5, bw - 1.1, bh - 1.1);
        }
      }
      ctx.restore();
    };

    brick(sideWall, "#a8836e", 0.76);
    brick(frontWall, "#c09a82", 1);
    brick(gableEnd, "#c09a82", 0.9);

    // Windows: frame, sill, mullion, and a sky reflection in the glass.
    const win = (x: number, yy: number, w: number, h: number, lit: number) => {
      ctx.fillStyle = shade("#f4efe8", lit);
      ctx.fillRect(x - 2.5, yy - 2.5, w + 5, h + 5);
      ctx.fillStyle = shade("#243040", lit);
      ctx.fillRect(x, yy, w, h);
      const g = ctx.createLinearGradient(x, yy, x + w, yy + h);
      g.addColorStop(0, `rgba(188,214,236,${0.5 * lit})`);
      g.addColorStop(0.5, `rgba(120,150,178,${0.18 * lit})`);
      g.addColorStop(1, `rgba(30,42,56,${0.1 * lit})`);
      ctx.fillStyle = g;
      ctx.fillRect(x, yy, w, h);
      ctx.strokeStyle = shade("#f4efe8", lit);
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(x + w / 2, yy);
      ctx.lineTo(x + w / 2, yy + h);
      ctx.moveTo(x, yy + h * 0.45);
      ctx.lineTo(x + w, yy + h * 0.45);
      ctx.stroke();
      // Sill.
      ctx.fillStyle = shade("#e8e1d6", lit);
      ctx.fillRect(x - 4, yy + h + 2.5, w + 8, 2.6);
    };
    win(cx - W + 18, wallTop + 22, 24, 28, 1);
    win(cx + W - 56, wallTop + 22, 24, 28, 1);
    win(cx + W + 12, wallTop + 14, 16, 26, 0.76);

    // Door, with trim and a glazed top panel.
    const dw = 24;
    const dh = 42;
    ctx.fillStyle = "#f4efe8";
    ctx.fillRect(cx - dw / 2 - 3, wallBottom - dh - 3, dw + 6, dh + 3);
    ctx.fillStyle = "#5b4330";
    ctx.fillRect(cx - dw / 2, wallBottom - dh, dw, dh);
    // Two recessed panels and a small glazed light — what makes a brown
    // rectangle read as a front door rather than a slab.
    ctx.strokeStyle = "rgba(0,0,0,0.3)";
    ctx.lineWidth = 0.8;
    ctx.strokeRect(cx - dw / 2 + 3.5, wallBottom - dh + 15, dw - 7, 10);
    ctx.strokeRect(cx - dw / 2 + 3.5, wallBottom - dh + 28, dw - 7, 10);
    const lite = ctx.createLinearGradient(
      cx - dw / 2,
      wallBottom - dh + 4,
      cx + dw / 2,
      wallBottom - dh + 12,
    );
    lite.addColorStop(0, "rgba(198,222,240,0.85)");
    lite.addColorStop(1, "rgba(130,162,190,0.6)");
    ctx.fillStyle = lite;
    ctx.fillRect(cx - dw / 2 + 3.5, wallBottom - dh + 4, dw - 7, 8);
    ctx.fillStyle = "#d9c59b";
    ctx.beginPath();
    ctx.arc(cx + dw / 2 - 4, wallBottom - dh / 2, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Fascia and soffit where the roof meets the wall — the band the drip
    // edge and gutters fasten to, and the thing that makes an eave look like
    // an eave rather than a cut-off wall.
    ctx.fillStyle = "#f6f2ea";
    ctx.beginPath();
    ctx.moveTo(cx - W - 5, wallTop);
    ctx.lineTo(cx + W + 5, wallTop);
    ctx.lineTo(cx + W + 5 + D, wallTop - DY);
    ctx.lineTo(cx - W - 5 + D, wallTop - DY);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(24,30,40,0.16)";
    ctx.fillRect(cx - W - 5, wallTop + 4, W * 2 + 10, 1.6);
    // Rake boards up the gable.
    ctx.strokeStyle = "#f6f2ea";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx - W - 4, wallTop);
    ctx.lineTo(cx, wallTop - H - 2);
    ctx.lineTo(cx + W + 4, wallTop);
    ctx.stroke();
  }

  const bottomEave = GEO.PAD_TOP + (layers.length - 1) * GEO.STEP + H;
  drawHouse(bottomEave + 18);

  // Bottom layer first, so each one overlaps the one below it.
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
