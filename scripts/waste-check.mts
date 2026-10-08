import {
  wasteAllowance,
  type Complexity,
} from "/home/user/roofing-leadgen-repo-/src/lib/roof-report.ts";

const deg = (rise: number) => (Math.atan(rise / 12) * 180) / Math.PI;

// Ground truth from the owner's EagleView / GAF reports (docs Sheet 8 add. 3).
const roofs = [
  {
    name: "7223 Kennedale Ln, Spring",
    sq: 31.6,
    rise: 6,
    facets: 8,
    valleys: 35,
    suggested: 15,
    src: "EagleView",
    likely: "moderate",
  },
  {
    name: "103 Grove Clover Ln, Montgomery",
    sq: 56.6,
    rise: 6,
    facets: 41,
    valleys: 266,
    suggested: 17,
    src: "GAF",
    likely: "complex",
  },
  {
    name: "5806 Sugar Bush Dr, Magnolia",
    sq: 47.9,
    rise: 9,
    facets: 17,
    valleys: null,
    suggested: 17,
    src: "EagleView",
    likely: "complex",
  },
  {
    name: "2305 Acadiana Ln, Seabrook",
    sq: 42.5,
    rise: 12,
    facets: 27,
    valleys: 153,
    suggested: 20,
    src: "EagleView",
    likely: "complex",
  },
  {
    name: "5523 Cheena Dr, Houston",
    sq: 37.1,
    rise: 5,
    facets: 13,
    valleys: 69,
    suggested: 7,
    src: "GAF",
    likely: "moderate",
  },
  {
    name: "3019 Rushing Brook Dr, Kingwood",
    sq: 43.4,
    rise: 7,
    facets: 23,
    valleys: 105,
    suggested: 15,
    src: "EagleView*",
    likely: "complex",
  },
] as const;

const rows: string[] = [];
let matchOrOver = 0;
for (const r of roofs) {
  const all = (["simple", "moderate", "complex"] as Complexity[]).map(
    (c) => `${c[0]}${wasteAllowance(0, deg(r.rise), c).percent}`,
  );
  const w = wasteAllowance(0, deg(r.rise), r.likely as Complexity);
  const theirs = r.sq * (1 + r.suggested / 100);
  const ours = r.sq * (1 + w.percent / 100);
  const delta = w.percent - r.suggested;
  if (delta >= 0) matchOrOver++;
  rows.push(
    [
      r.name.padEnd(33),
      `${r.rise}/12`.padStart(5),
      String(r.facets).padStart(3),
      (r.valleys == null ? "—" : `${r.valleys}ft`).padStart(6),
      `${r.suggested}%`.padStart(4),
      `${w.percent}%`.padStart(4),
      (delta >= 0 ? `+${delta}` : `${delta}`).padStart(3),
      theirs.toFixed(1).padStart(5),
      ours.toFixed(1).padStart(5),
      (ours - theirs >= 0 ? `+${(ours - theirs).toFixed(1)}` : (ours - theirs).toFixed(1)).padStart(
        5,
      ),
      `  [${all.join(" ")}]`,
    ].join(" "),
  );
}
console.log(
  [
    "ROOF".padEnd(33),
    "PITCH",
    "FAC",
    "VALLY",
    "THRS",
    "OURS",
    " Δ",
    "T.ORD",
    "O.ORD",
    " Δsq",
    "  [by shape]",
  ].join(" "),
);
console.log("-".repeat(130));
rows.forEach((r) => console.log(r));
console.log(
  `\nModel meets or exceeds the report's waste on ${matchOrOver} of ${roofs.length} roofs.`,
);
