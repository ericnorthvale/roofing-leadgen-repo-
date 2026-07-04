/**
 * Minimal cross-island selection store for the Roof Design Center.
 *
 * The Design Center's interactive pieces are separate React islands (color
 * gallery, visualizer, recommender, configurator), so they can't share React
 * context. This is a tiny window-event + localStorage bus: any island can call
 * `selectShingle` / `selectColor`, and the configurator subscribes to preselect.
 * Guarded for SSR (no `window`).
 */
import type { ShingleLine } from "~/lib/iko-colors";

export interface RoofSelection {
  line?: ShingleLine;
  color?: string;
}

const KEY = "nv_roof_selection";
const EVENT = "nv:roof-selection";

export function getSelection(): RoofSelection {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}") as RoofSelection;
  } catch {
    return {};
  }
}

function write(next: RoofSelection) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent<RoofSelection>(EVENT, { detail: next }));
}

export function selectShingle(line: ShingleLine) {
  write({ ...getSelection(), line });
}

export function selectColor(color: string, line?: ShingleLine) {
  const cur = getSelection();
  write({ line: line ?? cur.line, color });
}

/** Subscribe to selection changes. Returns an unsubscribe fn. */
export function onSelection(cb: (sel: RoofSelection) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = (e: Event) => cb((e as CustomEvent<RoofSelection>).detail);
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}

/** Scroll to a Design Center section by id (used by "use this color" CTAs). */
export function scrollToSection(id: string) {
  if (typeof document === "undefined") return;
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}
