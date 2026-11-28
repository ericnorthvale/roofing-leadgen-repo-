/**
 * How the crew behaves, and how the work actually goes.
 *
 * WHY THESE TWO PAGES EXIST. A diagram proves Northvale understands roofs. It
 * does not answer the questions a homeowner is actually nervous about, which
 * are: what will these people be like in my driveway for two days, and what is
 * going to happen to my house while they are here. Competitors leave both
 * unanswered, which means answering them in writing is cheap and almost
 * unmatched.
 *
 * EVERY LINE HERE IS A PROMISE THE COMPANY MUST KEEP. That is the whole point
 * — a promise nobody else makes is worth something precisely because it can be
 * held against you. So nothing goes in this file that the owner has not
 * agreed to, and anything he strikes out comes straight back out. Hard Rule #2
 * applies to commitments as much as to statistics: printing "we never ask to
 * use your bathroom" on a document a customer keeps, and then asking, is worse
 * than never having said it.
 *
 * STATUS: AGREED. The owner supplied the first few (clean jobsite, magnet
 * sweep, no cursing, no smoking, updates through the build) and asked for the
 * list to be thought through properly; the rest were proposed here and signed
 * off as written on 2026-11-28 ("the standards are good rn"). All twelve are
 * now live commitments printed on every proposal.
 *
 * SO ADDING ONE IS NO LONGER A DRAFTING DECISION. Anything new in this list
 * goes to the owner first, because the crew has to keep it on every job
 * before a customer ever reads it. Removing one is his call alone.
 */

export interface Standard {
  title: string;
  detail: string;
}

/**
 * Ordered so the strongest and most unusual land first. A homeowner reads four
 * of these and skims the rest, so the four that win the job go at the top.
 */
export const JOBSITE_STANDARDS: Standard[] = [
  {
    title: "We protect the house before anything comes off it",
    detail:
      "Tarps over landscaping, the A/C unit and the driveway, and board against the siding and windows, before the first shingle is lifted. Tear-off throws debris further than people expect.",
  },
  {
    title: "The magnet comes out every evening, not just at the end",
    detail:
      "A roof tear-off drops hundreds of nails. We sweep the perimeter, the driveway and the lawn at the end of every working day, so nothing waits overnight for a tyre or a bare foot.",
  },
  {
    title: "We photograph the parts you will never see again",
    detail:
      "Your deck before it is covered, the leak barrier in the valleys, the flashing at the walls. Once shingles are on, nobody can check that work — which is exactly why we document it and send it to you.",
  },
  {
    title: "You hear from us every morning and every evening",
    detail:
      "A message before we start with what is happening today, and one at the end with what got done and what is next. You should never have to ring us to find out where your roof is.",
  },
  {
    title: "No smoking, no vaping, no alcohol, no profanity",
    detail:
      "Anywhere on your property, at any time, by anyone on our crew. Your family is home and your neighbours are watching.",
  },
  {
    title: "We never ask to use your bathroom",
    detail: "The crew arranges that for itself. You should not have to think about it.",
  },
  {
    title: "A named crew lead, on site, with a phone number",
    detail:
      "Not a dispatcher and not a voicemail. The person running your roof is named on this proposal and answers his phone while your job is open.",
  },
  {
    title: "The driveway is clear before you get home",
    detail:
      "Debris goes straight into the trailer, never onto the lawn, and the trailer leaves with it. You should be able to park where you always park.",
  },
  {
    title: "We tell you before we open a gate",
    detail: "Pets stay where they are supposed to be. We ask first, every time.",
  },
  {
    title: "Your gutters leave cleaner than they arrived",
    detail:
      "Tear-off debris ends up in the gutters whatever anyone does about it. We clear them out before we go, as part of the job, not as an extra.",
  },
  {
    title: "We walk it with you before the crew leaves",
    detail:
      "Roof and yard, together, while the crew is still here to fix anything you are not happy with — not after they have driven away.",
  },
  {
    title: "If we damage something, we fix it",
    detail:
      "Written here so you never have to have that conversation. It is rare, and it is ours to put right when it happens.",
  },
];

/* ── How the work actually goes ───────────────────────────────────── */

export interface BuildStage {
  when: string;
  title: string;
  steps: string[];
}

/**
 * A roof replacement, in the order it happens.
 *
 * NO DURATIONS PROMISED beyond the shape of the job, because weather and roof
 * complexity decide it and a day count printed on a proposal becomes a
 * grievance the first time it rains. The stages are real; the calendar is not
 * claimed.
 */
export const ROOF_BUILD: BuildStage[] = [
  {
    when: "Before we start",
    title: "Materials and agreement",
    steps: [
      "Your shingle colour confirmed against the house, not off a screen.",
      "Materials delivered and placed where you tell us to put them.",
      "The crew lead introduces himself and walks the job with you.",
    ],
  },
  {
    when: "Day one, morning",
    title: "Protection and tear-off",
    steps: [
      "Tarps and boards go up before anything comes off.",
      "Every existing layer comes off, down to the bare deck. No roofing over the old roof.",
      "The deck is inspected with the old roof gone — the only moment anyone can see it.",
    ],
  },
  {
    when: "Day one",
    title: "Anything we find, you see first",
    steps: [
      "Rotten or delaminated decking is photographed and shown to you before it is touched.",
      "You approve the replacement, at the price already quoted, before we carry on.",
      "Nothing is replaced and billed after the fact.",
    ],
  },
  {
    when: "Day one, dried in",
    title: "The roof is watertight before dark",
    steps: [
      "Drip edge at the eaves.",
      "Leak barrier in the valleys and around every penetration.",
      "Synthetic underlayment across the whole deck.",
      "Whatever else is outstanding, your house is dried in before the crew goes home.",
    ],
  },
  {
    when: "Day two",
    title: "The roof itself",
    steps: [
      "Starter course bonded along the eaves and rakes.",
      "Field shingles nailed to the manufacturer's pattern — the thing the wind warranty depends on.",
      "New flashing at walls and chimney, and a new boot on every pipe.",
      "Ridge cut for ventilation, ridge vent fitted, hip and ridge caps over it.",
    ],
  },
  {
    when: "Day two, end",
    title: "How we leave it",
    steps: [
      "Magnet sweep of the whole perimeter.",
      "Gutters cleared of tear-off debris.",
      "Walkthrough with you, roof and yard, before the crew leaves.",
    ],
  },
  {
    when: "After",
    title: "What you get afterwards",
    steps: [
      "Your manufacturer warranty registered in your name, with the registration sent to you.",
      "The photographs of the work you cannot see.",
      "Your written workmanship warranty.",
    ],
  },
];

/** Gutters, which are a different job and deserve their own sequence. */
export const GUTTER_BUILD: BuildStage[] = [
  {
    when: "Before we start",
    title: "Colour and layout",
    steps: [
      "Colour matched against your trim in daylight, at the house.",
      "Downspout positions agreed with you — where the water goes matters more than where the pipe looks tidy.",
    ],
  },
  {
    when: "On the day",
    title: "Off with the old",
    steps: [
      "Existing gutters and downspouts removed and hauled away.",
      "Fascia inspected behind them, and anything soft shown to you before we hang new metal on it.",
    ],
  },
  {
    when: "On the day",
    title: "Fabricated at your house",
    steps: [
      "Seamless gutter rolled on site to the exact length of each run — joints are where gutters leak.",
      "Hung on hidden hangers, pitched so the run actually drains.",
      "Downspouts, elbows and outlets fitted to discharge where we agreed.",
    ],
  },
  {
    when: "Before we leave",
    title: "Tested, not assumed",
    steps: [
      "Water run through the system while we are still here to adjust the pitch.",
      "Magnet sweep and full cleanup.",
      "Walkthrough with you.",
    ],
  },
];

/** Which sequence belongs in this proposal. */
export function buildSequenceFor(blocks: Set<string>): {
  heading: string;
  stages: BuildStage[];
} | null {
  if (blocks.has("replacement")) {
    return { heading: "How Your Roof Gets Built", stages: ROOF_BUILD };
  }
  if (blocks.has("gutters")) {
    return { heading: "How Your Gutters Get Installed", stages: GUTTER_BUILD };
  }
  return null;
}
