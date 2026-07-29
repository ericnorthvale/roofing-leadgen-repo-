import { useEffect, useMemo, useRef, useState } from "react";
import { STUDIO_LINES, type StudioColor, type StudioLineKey } from "~/lib/design-studio";
import { selectColor, scrollToSection } from "./store";

/**
 * Shingle Studio — the Design Center centerpiece. Pick a line, tap a color,
 * and the stage crossfades to that color's IKO photography (a real house
 * where we have it, the shingle up close otherwise). No homeowner photo
 * uploads — owner-approved imagery only.
 */

type ViewKind = "home" | "swatch";

/** The image a color shows for a preferred view, falling back to what exists. */
function assetFor(color: StudioColor, prefer: ViewKind): { src: string; kind: ViewKind } {
  if (prefer === "home" && color.home) return { src: color.home, kind: "home" };
  if (prefer === "swatch" && color.swatch) return { src: color.swatch, kind: "swatch" };
  return color.home ? { src: color.home, kind: "home" } : { src: color.swatch!, kind: "swatch" };
}

/** Crossfading stage: keeps the previous image underneath while the next fades in. */
function Stage({ src, alt }: { src: string; alt: string }) {
  const [layers, setLayers] = useState([{ src, alt, key: 0 }]);
  const counter = useRef(0);

  useEffect(() => {
    setLayers((prev) => {
      if (prev[prev.length - 1]?.src === src) return prev;
      counter.current += 1;
      // Keep at most one outgoing layer under the incoming one.
      return [...prev.slice(-1), { src, alt, key: counter.current }];
    });
  }, [src, alt]);

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[var(--radius-card)] bg-[color:var(--color-navy-100)]">
      {layers.map((layer, i) => (
        <img
          key={layer.key}
          src={layer.src}
          alt={i === layers.length - 1 ? layer.alt : ""}
          className="nv-stage-img absolute inset-0 h-full w-full object-cover"
          style={i === layers.length - 1 ? undefined : { animation: "none" }}
          decoding="async"
          onAnimationEnd={() => setLayers((prev) => prev.slice(-1))}
        />
      ))}
      <style>{`
        .nv-stage-img { animation: nv-stage-fade 480ms ease both; }
        @keyframes nv-stage-fade { from { opacity: 0 } to { opacity: 1 } }
        @media (prefers-reduced-motion: reduce) { .nv-stage-img { animation: none } }
      `}</style>
    </div>
  );
}

export default function ShingleStudio() {
  const [lineKey, setLineKey] = useState<StudioLineKey>("dynasty");
  const [colorSlug, setColorSlug] = useState<string>("granite-black");
  const [prefer, setPrefer] = useState<ViewKind>("home");

  const line = useMemo(() => STUDIO_LINES.find((l) => l.key === lineKey)!, [lineKey]);
  const color = line.colors.find((c) => c.slug === colorSlug) ?? line.colors[0];
  const shown = assetFor(color, prefer);
  const hasBoth = Boolean(color.home && color.swatch);

  const pickLine = (key: StudioLineKey) => {
    setLineKey(key);
    const next = STUDIO_LINES.find((l) => l.key === key)!;
    // Keep the same color across lines when it exists (e.g. Granite Black).
    if (!next.colors.some((c) => c.slug === colorSlug)) setColorSlug(next.colors[0].slug);
  };

  const useInEstimate = () => {
    selectColor(color.name, line.key);
    scrollToSection("build-your-roof");
  };

  return (
    <div>
      {/* Line selector */}
      <div
        className="grid grid-cols-2 gap-2 lg:grid-cols-4"
        role="tablist"
        aria-label="Choose your shingle line"
      >
        {STUDIO_LINES.map((l) => (
          <button
            key={l.key}
            role="tab"
            aria-selected={lineKey === l.key}
            onClick={() => pickLine(l.key)}
            className={`rounded-[var(--radius-card)] border p-4 text-left transition ${
              lineKey === l.key
                ? "border-[color:var(--color-navy-900)] bg-[color:var(--color-navy-900)] text-white shadow-[var(--shadow-card)]"
                : "border-[color:var(--color-navy-100)] bg-white text-[color:var(--color-navy-900)] hover:border-[color:var(--color-navy-300)]"
            }`}
          >
            <span
              className={`block text-[11px] font-semibold tracking-wide uppercase ${
                lineKey === l.key
                  ? "text-[color:var(--color-gold-200)]"
                  : "text-[color:var(--color-gold-600)]"
              }`}
            >
              {l.collection}
            </span>
            <span className="mt-1 block text-lg font-semibold">{l.short}</span>
            <span
              className={`mt-0.5 block text-xs ${
                lineKey === l.key ? "text-white/75" : "text-[color:var(--color-ink-500)]"
              }`}
            >
              {l.windShort} wind · {l.ironCladYears}-yr Iron Clad
              {l.impactLabel ? ` · ${l.impactLabel.replace("FM 4473 / ", "")}` : ""}
            </span>
          </button>
        ))}
      </div>

      {/* Stage + panel */}
      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[3fr_2fr]">
        <div className="relative self-start">
          <Stage
            src={shown.src}
            alt={`${line.name} shingles in ${color.name}, IKO product photography`}
          />
          {hasBoth && (
            <div className="absolute top-3 right-3 flex rounded-[var(--radius-pill)] bg-white/90 p-1 text-xs font-semibold shadow-[var(--shadow-card)] backdrop-blur">
              {(["home", "swatch"] as const).map((k) => (
                <button
                  key={k}
                  onClick={() => setPrefer(k)}
                  aria-pressed={shown.kind === k}
                  className={`rounded-[var(--radius-pill)] px-3 py-1.5 transition ${
                    shown.kind === k
                      ? "bg-[color:var(--color-navy-900)] text-white"
                      : "text-[color:var(--color-navy-900)]"
                  }`}
                >
                  {k === "home" ? "On a home" : "Up close"}
                </button>
              ))}
            </div>
          )}
          <p className="absolute bottom-3 left-3 rounded-[var(--radius-pill)] bg-white/90 px-3 py-1.5 text-xs font-semibold text-[color:var(--color-navy-900)] shadow-[var(--shadow-card)] backdrop-blur">
            {color.name} · {line.short}
            {shown.kind === "swatch" ? " · up close" : ""}
          </p>
        </div>

        <div className="flex flex-col rounded-[var(--radius-card)] border border-[color:var(--color-navy-100)] bg-white p-6">
          <p className="text-[11px] font-semibold tracking-wide text-[color:var(--color-gold-600)] uppercase">
            {line.collection}
          </p>
          <h3 className="mt-1 text-2xl">{line.name}</h3>
          <p className="mt-2 text-sm text-[color:var(--color-ink-800)]">{line.story}</p>

          {/* Color chips */}
          <p className="mt-5 text-xs font-semibold tracking-wide text-[color:var(--color-ink-500)] uppercase">
            Colors — tap to preview
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {line.colors.map((c) => (
              <li key={c.slug}>
                <button
                  onClick={() => setColorSlug(c.slug)}
                  aria-pressed={color.slug === c.slug}
                  title={c.name}
                  aria-label={`Preview ${c.name}`}
                  className={`block h-10 w-10 rounded-full border-2 transition ${
                    color.slug === c.slug
                      ? "scale-110 border-[color:var(--color-gold-600)] ring-2 ring-[color:var(--color-gold-600)] ring-offset-2"
                      : "border-white shadow-[var(--shadow-card)] hover:scale-105"
                  }`}
                  style={{ backgroundColor: c.chip }}
                />
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm font-semibold">{color.name}</p>
          <p className="mt-1 text-sm text-[color:var(--color-ink-800)]">{color.note}</p>
          {line.moreColors && (
            <p className="mt-2 text-xs text-[color:var(--color-ink-500)]">{line.moreColors}</p>
          )}

          {/* Specs */}
          <dl className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-card)] border border-[color:var(--color-navy-100)] bg-[color:var(--color-navy-100)] text-center">
            {[
              ["Warranty", line.productWarranty],
              ["Full coverage", `${line.ironCladYears}-yr Iron Clad`],
              ["Wind", line.windShort],
              ["Algae", `${line.algaeYears}-yr warranty`],
            ].map(([label, value]) => (
              <div key={label} className="bg-white px-2 py-3">
                <dt className="text-[10px] font-semibold tracking-wide text-[color:var(--color-ink-500)] uppercase">
                  {label}
                </dt>
                <dd className="mt-0.5 text-sm font-semibold text-[color:var(--color-navy-900)]">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
          {line.impactLabel && (
            <p className="mt-2 text-xs text-[color:var(--color-ink-500)]">
              Impact rating: <strong>{line.impactLabel}</strong> — a lab classification for
              insurance-discount purposes, not a hail guarantee.
            </p>
          )}

          <div className="mt-auto pt-5">
            <button onClick={useInEstimate} className="btn btn-primary w-full">
              Use {color.name} in my estimate →
            </button>
            <p className="mt-3 text-xs text-[color:var(--color-ink-500)]">
              On-screen colors are representative — granule color shifts with lot and lighting. We
              bring real {line.short} samples to your free estimate.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
