import { useState } from "react";
import {
  EXTERIOR_OPTIONS,
  colorsForExterior,
  type ExteriorOption,
  type IkoColor,
} from "~/lib/iko-colors";
import { selectColor, scrollToSection } from "./store";

export default function ColorRecommender() {
  const [exterior, setExterior] = useState<ExteriorOption | null>(null);
  const results: IkoColor[] = exterior ? colorsForExterior(exterior).slice(0, 6) : [];

  return (
    <div>
      <p className="text-sm font-semibold">What's your home's exterior?</p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {EXTERIOR_OPTIONS.map((opt) => (
          <li key={opt}>
            <button
              onClick={() => setExterior(opt)}
              aria-pressed={exterior === opt}
              className={`rounded-[var(--radius-pill)] border px-4 py-2 text-sm font-semibold transition ${
                exterior === opt
                  ? "border-[color:var(--color-navy-900)] bg-[color:var(--color-navy-900)] text-white"
                  : "border-[color:var(--color-navy-200)] bg-white hover:border-[color:var(--color-navy-900)]"
              }`}
            >
              {opt}
            </button>
          </li>
        ))}
      </ul>

      {exterior && (
        <div className="mt-6">
          <p className="text-sm text-[color:var(--color-ink-800)]">
            For <strong>{exterior.toLowerCase()}</strong>, these IKO colors tend to work best:
          </p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((c) => (
              <li
                key={c.name}
                className="flex items-center gap-3 rounded-[var(--radius-card)] border border-[color:var(--color-navy-100)] bg-white p-3"
              >
                <span
                  className="h-12 w-12 shrink-0 rounded-md"
                  style={{ backgroundColor: c.swatch }}
                  aria-hidden="true"
                />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{c.name}</span>
                  <span className="block text-xs text-[color:var(--color-ink-500)]">
                    {c.popularity}
                    {c.lines.includes("nordic") ? " · Dynasty & Nordic" : " · Dynasty"}
                  </span>
                  <button
                    onClick={() => {
                      selectColor(c.name);
                      scrollToSection("visualizer");
                    }}
                    className="mt-1 text-xs font-semibold text-[color:var(--color-navy-900)] underline"
                  >
                    Preview it
                  </button>
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-[color:var(--color-ink-500)]">
            A starting point, not a rule — the color recommender reflects Northvale's experience,
            and your village's design-review palette has the final say. We bring real samples to
            every estimate.
          </p>
        </div>
      )}
    </div>
  );
}
