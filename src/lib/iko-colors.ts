/**
 * IKO Dynasty + Nordic color catalog for the Roof Design Center.
 *
 * Color NAMES and line availability are IKO facts (docs/research-facts.md Sheet
 * 1B). The `swatch` hex values are **representative approximations for on-screen
 * preview only** — granulated asphalt color varies by lot and lighting, so the
 * UI always tells homeowners to confirm against a physical sample. The `style`,
 * `bestExteriors`, and `popularity` fields are Northvale's editorial guidance
 * (opinion, allowed) — not manufacturer claims.
 *
 * `USE_DEMO_IMAGES`-style photography (roof + shingle swatch shots) drops in
 * later via the optional `photo` slot; until then the UI shows the swatch color.
 */

export type ShingleLine = "dynasty" | "nordic";
export type ColorMood = "Traditional" | "Modern" | "Versatile";

export interface IkoColor {
  name: string;
  /** Which IKO lines offer this color (both, or Dynasty-only). */
  lines: ShingleLine[];
  /** Representative on-screen hex — NOT an exact match; confirm with a sample. */
  swatch: string;
  mood: ColorMood;
  /** Editorial: home exteriors this color tends to flatter. */
  bestExteriors: string[];
  /** Editorial popularity in the Woodlands/NW-Houston market. */
  popularity: "Most popular" | "Popular" | "Distinctive";
  /** One-line editorial note. */
  note: string;
  /** Optional real swatch/roof photo (owner/IKO asset) — overrides the color chip. */
  photo?: string;
}

// Home-exterior tags used by the color recommender + per-color guidance.
export const EXTERIOR_OPTIONS = [
  "White brick",
  "Red brick",
  "Tan / brown brick",
  "Stone",
  "Stucco",
  "Farmhouse (light siding)",
  "Modern (dark accents)",
] as const;
export type ExteriorOption = (typeof EXTERIOR_OPTIONS)[number];

export const IKO_COLORS: IkoColor[] = [
  {
    name: "Granite Black",
    lines: ["dynasty", "nordic"],
    swatch: "#2f3133",
    mood: "Versatile",
    bestExteriors: ["White brick", "Red brick", "Stone", "Modern (dark accents)"],
    popularity: "Most popular",
    note: "The safe, sharp choice — near-black that frames white trim and reads clean on almost any exterior.",
  },
  {
    name: "Summit Grey",
    lines: ["dynasty", "nordic"],
    swatch: "#6f7377",
    mood: "Versatile",
    bestExteriors: ["White brick", "Stone", "Stucco", "Modern (dark accents)"],
    popularity: "Most popular",
    note: "A true mid-grey that suits contemporary and transitional homes without going stark.",
  },
  {
    name: "Shadow Brown",
    lines: ["dynasty", "nordic"],
    swatch: "#4b3b30",
    mood: "Traditional",
    bestExteriors: ["Tan / brown brick", "Stone", "Farmhouse (light siding)"],
    popularity: "Popular",
    note: "Warm dark brown that ties into tan brick and stone — a Woodlands staple under tree cover.",
  },
  {
    name: "Olde Style Weatherwood",
    lines: ["dynasty", "nordic"],
    swatch: "#7c7266",
    mood: "Traditional",
    bestExteriors: ["Tan / brown brick", "Red brick", "Farmhouse (light siding)"],
    popularity: "Popular",
    note: "A blended wood-tone — brown, grey, and amber — that hides debris shadows on shaded lots.",
  },
  {
    name: "Glacier",
    lines: ["dynasty", "nordic"],
    swatch: "#9ea3a6",
    mood: "Modern",
    bestExteriors: ["White brick", "Stucco", "Modern (dark accents)"],
    popularity: "Popular",
    note: "A light, cool grey for a bright, modern look — pairs well with dark windows and white brick.",
  },
  {
    name: "Driftshake",
    lines: ["dynasty", "nordic"],
    swatch: "#8d8b85",
    mood: "Modern",
    bestExteriors: ["White brick", "Stucco", "Farmhouse (light siding)"],
    popularity: "Popular",
    note: "Soft driftwood grey with subtle warmth — a farmhouse-friendly alternative to flat grey.",
  },
  {
    name: "Sentinel Slate",
    lines: ["dynasty"],
    swatch: "#565b60",
    mood: "Versatile",
    bestExteriors: ["White brick", "Stone", "Modern (dark accents)"],
    popularity: "Popular",
    note: "A deep slate grey — dressier than plain grey, still neutral enough for any trim.",
  },
  {
    name: "Blackstone",
    lines: ["dynasty"],
    swatch: "#33363a",
    mood: "Modern",
    bestExteriors: ["White brick", "Stucco", "Modern (dark accents)"],
    popularity: "Popular",
    note: "Charcoal-black with a cooler cast than Granite Black — crisp on white, modern homes.",
  },
  {
    name: "Cornerstone Weatherwood",
    lines: ["dynasty"],
    swatch: "#8a7d6d",
    mood: "Traditional",
    bestExteriors: ["Tan / brown brick", "Red brick", "Stone"],
    popularity: "Popular",
    note: "A lighter weatherwood blend — warmer and brighter than the classic, good on tan brick.",
  },
  {
    name: "Brownstone",
    lines: ["dynasty"],
    swatch: "#5c4a3c",
    mood: "Traditional",
    bestExteriors: ["Tan / brown brick", "Stone", "Farmhouse (light siding)"],
    popularity: "Distinctive",
    note: "Rich, even brown for homeowners who want warmth without a blended look.",
  },
  {
    name: "Frostone Grey",
    lines: ["dynasty"],
    swatch: "#8b9195",
    mood: "Modern",
    bestExteriors: ["White brick", "Stucco", "Modern (dark accents)"],
    popularity: "Distinctive",
    note: "Cool, frosty grey — a lighter modern option that keeps attics a touch cooler than black.",
  },
  {
    name: "Atlantic Blue",
    lines: ["dynasty"],
    swatch: "#3b4a5a",
    mood: "Modern",
    bestExteriors: ["White brick", "Stone", "Farmhouse (light siding)"],
    popularity: "Distinctive",
    note: "A muted slate-blue — a confident accent on white or light-siding homes (confirm covenant palette).",
  },
  {
    name: "Biscayne",
    lines: ["dynasty"],
    swatch: "#4a5560",
    mood: "Modern",
    bestExteriors: ["White brick", "Stone", "Modern (dark accents)"],
    popularity: "Distinctive",
    note: "A blue-grey blend — reads grey from the street with cool undertones up close.",
  },
  {
    name: "Emerald Green",
    lines: ["dynasty"],
    swatch: "#39463a",
    mood: "Traditional",
    bestExteriors: ["Tan / brown brick", "Stone", "Farmhouse (light siding)"],
    popularity: "Distinctive",
    note: "A deep, muted green for wooded lots and traditional homes — check your village palette first.",
  },
  {
    name: "Monaco Red",
    lines: ["dynasty"],
    swatch: "#6e3b34",
    mood: "Traditional",
    bestExteriors: ["Tan / brown brick", "Stucco"],
    popularity: "Distinctive",
    note: "A brick-red blend for Tuscan and Mediterranean exteriors — a bold, covenant-dependent pick.",
  },
];

/** Colors offered on a given line. */
export function colorsForLine(line: ShingleLine): IkoColor[] {
  return IKO_COLORS.filter((c) => c.lines.includes(line));
}

/** Recommender: colors that flatter a given exterior, most-popular first. */
export function colorsForExterior(exterior: ExteriorOption): IkoColor[] {
  const rank = { "Most popular": 0, Popular: 1, Distinctive: 2 } as const;
  return IKO_COLORS.filter((c) => c.bestExteriors.includes(exterior)).sort(
    (a, b) => rank[a.popularity] - rank[b.popularity],
  );
}
