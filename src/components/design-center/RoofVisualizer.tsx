import { useCallback, useEffect, useRef, useState } from "react";
import { IKO_COLORS } from "~/lib/iko-colors";
import { selectColor, scrollToSection, getSelection } from "./store";

const MAX_W = 960;

// --- color helpers: recolor while preserving the roof's own light/shade ---
function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0,
    s = 0;
  const l = (max + min) / 2;
  const d = max - min;
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return [h, s, l];
}
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  if (s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v];
  }
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [
    Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    Math.round(hue2rgb(p, q, h) * 255),
    Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  ];
}

export default function RoofVisualizer() {
  const displayRef = useRef<HTMLCanvasElement>(null);
  const baseData = useRef<ImageData | null>(null); // original pixels
  const maskCanvas = useRef<HTMLCanvasElement | null>(null); // painted alpha
  const painting = useRef(false);
  const rafPending = useRef(false);

  const [hasImage, setHasImage] = useState(false);
  const [color, setColor] = useState(IKO_COLORS[0]);
  const [brush, setBrush] = useState(34);
  const [erase, setErase] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Preselect color from a gallery/recommender handoff.
  useEffect(() => {
    const sel = getSelection();
    if (sel.color) {
      const found = IKO_COLORS.find((c) => c.name === sel.color);
      if (found) setColor(found);
    }
  }, []);

  const render = useCallback(() => {
    const canvas = displayRef.current;
    const base = baseData.current;
    const mask = maskCanvas.current;
    if (!canvas || !base || !mask) return;
    const ctx = canvas.getContext("2d");
    const mctx = mask.getContext("2d");
    if (!ctx || !mctx) return;
    const { width, height } = canvas;
    const maskData = mctx.getImageData(0, 0, width, height).data;
    const out = ctx.createImageData(width, height);
    const src = base.data;
    const [th, ts] = rgbToHsl(...hexToRgb(color.swatch));
    for (let i = 0; i < src.length; i += 4) {
      const a = maskData[i + 3];
      if (a > 10) {
        // keep the pixel's own lightness (texture/shade), swap hue+sat to target
        const [, , l] = rgbToHsl(src[i], src[i + 1], src[i + 2]);
        // nudge lightness slightly toward the target's tone for realism
        const [tr, tg, tb] = hslToRgb(th, ts, Math.min(0.92, Math.max(0.06, l)));
        const blend = a / 255;
        out.data[i] = src[i] * (1 - blend) + tr * blend;
        out.data[i + 1] = src[i + 1] * (1 - blend) + tg * blend;
        out.data[i + 2] = src[i + 2] * (1 - blend) + tb * blend;
        out.data[i + 3] = 255;
      } else {
        out.data[i] = src[i];
        out.data[i + 1] = src[i + 1];
        out.data[i + 2] = src[i + 2];
        out.data[i + 3] = 255;
      }
    }
    ctx.putImageData(out, 0, 0);
  }, [color]);

  useEffect(() => {
    if (hasImage) render();
  }, [color, hasImage, render]);

  const scheduleRender = useCallback(() => {
    if (rafPending.current) return;
    rafPending.current = true;
    requestAnimationFrame(() => {
      rafPending.current = false;
      render();
    });
  }, [render]);

  function loadFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = displayRef.current;
        if (!canvas) return;
        const scale = Math.min(1, MAX_W / img.width);
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, w, h);
        baseData.current = ctx.getImageData(0, 0, w, h);
        const mask = document.createElement("canvas");
        mask.width = w;
        mask.height = h;
        maskCanvas.current = mask;
        setHasImage(true);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  function paintAt(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = displayRef.current;
    const mask = maskCanvas.current;
    if (!canvas || !mask) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
    const mctx = mask.getContext("2d")!;
    mctx.globalCompositeOperation = erase ? "destination-out" : "source-over";
    mctx.fillStyle = "rgba(255,255,255,1)";
    mctx.beginPath();
    mctx.arc(x, y, (brush / rect.width) * canvas.width, 0, Math.PI * 2);
    mctx.fill();
    scheduleRender();
  }

  function clearMask() {
    const mask = maskCanvas.current;
    if (!mask) return;
    mask.getContext("2d")!.clearRect(0, 0, mask.width, mask.height);
    render();
  }

  function toggleFavorite() {
    setFavorites((f) =>
      f.includes(color.name) ? f.filter((n) => n !== color.name) : [...f, color.name],
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div>
        <div className="relative overflow-hidden rounded-[var(--radius-card)] border border-[color:var(--color-navy-100)] bg-[color:var(--color-navy-50)]">
          {!hasImage && (
            <label className="flex aspect-[16/10] w-full cursor-pointer flex-col items-center justify-center gap-2 p-6 text-center">
              <span className="text-lg font-semibold text-[color:var(--color-navy-900)]">
                Upload a photo of your house
              </span>
              <span className="max-w-sm text-sm text-[color:var(--color-ink-500)]">
                A straight-on photo works best. Your photo stays in your browser — it is never
                uploaded to us.
              </span>
              <span className="btn btn-primary mt-2">Choose a photo</span>
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => e.target.files?.[0] && loadFile(e.target.files[0])}
              />
            </label>
          )}
          <canvas
            ref={displayRef}
            className={hasImage ? "block w-full touch-none" : "hidden"}
            style={{ cursor: "crosshair" }}
            onPointerDown={(e) => {
              painting.current = true;
              e.currentTarget.setPointerCapture(e.pointerId);
              paintAt(e);
            }}
            onPointerMove={(e) => painting.current && paintAt(e)}
            onPointerUp={() => (painting.current = false)}
            onPointerLeave={() => (painting.current = false)}
          />
        </div>

        {hasImage && (
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
            <span className="font-semibold">1. Brush over the roof</span>
            <label className="flex items-center gap-2">
              Brush
              <input
                type="range"
                min={10}
                max={80}
                value={brush}
                onChange={(e) => setBrush(Number(e.target.value))}
              />
            </label>
            <button
              onClick={() => setErase((v) => !v)}
              className={`rounded-[var(--radius-pill)] border px-3 py-1 font-semibold ${
                erase
                  ? "border-[color:var(--color-navy-900)] bg-[color:var(--color-navy-900)] text-white"
                  : "border-[color:var(--color-navy-200)]"
              }`}
            >
              {erase ? "Erasing" : "Erase"}
            </button>
            <button onClick={clearMask} className="underline">
              Reset mask
            </button>
            <label className="ml-auto cursor-pointer underline">
              New photo
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => e.target.files?.[0] && loadFile(e.target.files[0])}
              />
            </label>
          </div>
        )}
      </div>

      {/* Palette + actions */}
      <aside>
        <p className="text-sm font-semibold">2. Tap a color</p>
        <ul className="mt-2 grid grid-cols-4 gap-2 lg:grid-cols-3">
          {IKO_COLORS.map((c) => (
            <li key={c.name}>
              <button
                title={c.name}
                aria-label={c.name}
                aria-pressed={color.name === c.name}
                onClick={() => {
                  setColor(c);
                  selectColor(c.name);
                }}
                className={`block h-10 w-full rounded-md border-2 ${
                  color.name === c.name
                    ? "border-[color:var(--color-gold-600)]"
                    : "border-transparent"
                }`}
                style={{ backgroundColor: c.swatch }}
              />
            </li>
          ))}
        </ul>
        <p className="mt-2 text-sm">
          <strong>{color.name}</strong>
          <button onClick={toggleFavorite} className="ml-2 text-xs underline">
            {favorites.includes(color.name) ? "★ Saved" : "☆ Save"}
          </button>
        </p>
        {favorites.length > 0 && (
          <p className="mt-1 text-xs text-[color:var(--color-ink-500)]">
            Saved: {favorites.join(", ")}
          </p>
        )}
        <button
          onClick={() => {
            selectColor(color.name);
            scrollToSection("build-your-roof");
          }}
          className="btn btn-primary mt-4 w-full"
        >
          Get an estimate in {color.name} →
        </button>
        <p className="mt-3 text-xs text-[color:var(--color-ink-500)]">
          Previews are representative and depend on your photo and lighting — not an exact color
          match. A Northvale rep can walk through this with you and bring real samples.
        </p>
      </aside>
    </div>
  );
}
