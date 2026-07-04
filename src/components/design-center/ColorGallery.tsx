import { useMemo, useState } from "react";
import { IKO_COLORS, colorsForLine, type IkoColor, type ShingleLine } from "~/lib/iko-colors";
import { selectColor, scrollToSection } from "./store";

type Filter = "all" | ShingleLine;

export default function ColorGallery() {
  const [filter, setFilter] = useState<Filter>("all");
  const [active, setActive] = useState<IkoColor>(IKO_COLORS[0]);

  const colors = useMemo(() => (filter === "all" ? IKO_COLORS : colorsForLine(filter)), [filter]);

  const tabs: { key: Filter; label: string }[] = [
    { key: "all", label: "All colors" },
    { key: "dynasty", label: "Dynasty" },
    { key: "nordic", label: "Nordic (Class 4)" },
  ];

  return (
    <div>
      <div
        className="flex flex-wrap gap-2"
        role="tablist"
        aria-label="Filter colors by shingle line"
      >
        {tabs.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={filter === t.key}
            onClick={() => setFilter(t.key)}
            className={`rounded-[var(--radius-pill)] border px-4 py-1.5 text-sm font-semibold transition ${
              filter === t.key
                ? "border-[color:var(--color-navy-900)] bg-[color:var(--color-navy-900)] text-white"
                : "border-[color:var(--color-navy-200)] bg-white text-[color:var(--color-navy-900)] hover:border-[color:var(--color-navy-900)]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Swatch grid */}
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {colors.map((c) => (
            <li key={c.name}>
              <button
                onClick={() => setActive(c)}
                aria-pressed={active.name === c.name}
                className={`w-full overflow-hidden rounded-[var(--radius-card)] border text-left transition ${
                  active.name === c.name
                    ? "border-[color:var(--color-gold-600)] ring-2 ring-[color:var(--color-gold-600)]"
                    : "border-[color:var(--color-navy-100)] hover:border-[color:var(--color-navy-300)]"
                }`}
              >
                <span
                  className="block h-20 w-full"
                  style={{ backgroundColor: c.swatch }}
                  aria-hidden="true"
                />
                <span className="block px-2 py-2 text-xs font-semibold text-[color:var(--color-navy-900)]">
                  {c.name}
                </span>
              </button>
            </li>
          ))}
        </ul>

        {/* Detail panel */}
        <aside className="self-start rounded-[var(--radius-card)] border border-[color:var(--color-navy-100)] bg-white p-5 lg:sticky lg:top-6">
          <span
            className="block h-28 w-full rounded-[var(--radius-card)]"
            style={{ backgroundColor: active.swatch }}
            aria-hidden="true"
          />
          <h3 className="mt-4 text-xl">{active.name}</h3>
          <p className="mt-1 text-sm text-[color:var(--color-ink-500)]">
            {active.lines.includes("dynasty") && active.lines.includes("nordic")
              ? "Available on Dynasty & Nordic"
              : "Available on Dynasty"}{" "}
            · {active.mood} · {active.popularity}
          </p>
          <p className="mt-3 text-sm text-[color:var(--color-ink-800)]">{active.note}</p>
          <p className="mt-3 text-xs font-semibold tracking-wide text-[color:var(--color-ink-500)] uppercase">
            Looks best on
          </p>
          <ul className="mt-1 flex flex-wrap gap-1.5">
            {active.bestExteriors.map((e) => (
              <li
                key={e}
                className="rounded-[var(--radius-pill)] border border-[color:var(--color-navy-100)] px-2 py-0.5 text-xs"
              >
                {e}
              </li>
            ))}
          </ul>
          <div className="mt-5 grid gap-2">
            <button
              onClick={() => {
                selectColor(active.name, active.lines.includes("nordic") ? undefined : "dynasty");
                scrollToSection("visualizer");
              }}
              className="btn btn-primary"
            >
              See it on a roof →
            </button>
            <button
              onClick={() => {
                selectColor(active.name);
                scrollToSection("build-your-roof");
              }}
              className="text-sm font-semibold text-[color:var(--color-navy-900)] underline"
            >
              Use this color in my estimate
            </button>
          </div>
          <p className="mt-4 text-xs text-[color:var(--color-ink-500)]">
            On-screen colors are representative. Granule color shifts with lot and lighting — always
            confirm with a physical sample before you decide.
          </p>
        </aside>
      </div>
    </div>
  );
}
