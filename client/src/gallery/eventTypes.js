/**
 * Classifies real gallery photos into browsable event types.
 *
 * The CMS stores each photo's year as its section and a free-text event name
 * ("One day workshop Enteral nutrition", "Golz Launch"), so there is no
 * category column to filter on. Rather than inventing categories, each photo is
 * matched against the wording the clinic actually used in its own captions.
 *
 * Rules are ordered and every photo falls through to `Events`, so all real
 * images always remain reachable. Types with no matching photo are not shown.
 */

const RULES = [
  {
    key: "Workshops",
    pattern: /workshop/i,
    blurb: "Hands-on sessions we ran for parents, students and professionals.",
  },
  {
    key: "Conferences & Awards",
    pattern: /conference|award|recognition|certificate|launch/i,
    blurb: "Conference appearances, launches and professional recognition.",
  },
  {
    key: "Talks & Awareness",
    pattern: /talk|awareness|seminar|session|camp|college|school|breast ?feeding/i,
    blurb: "Talks, awareness drives and sessions at colleges and schools.",
  },
  {
    key: "Hospitals & Institutions",
    pattern: /hospital|clinic|apollo|aiish|fmkmc|poshan|anganwadi|women ?& ?child|department/i,
    blurb: "Programmes delivered with hospitals and public institutions.",
  },
];

/** The type of one item, always defined. */
export function eventTypeOf(item) {
  const haystack = `${item?.eventName ?? ""} ${item?.caption ?? ""}`;
  const match = RULES.find((rule) => rule.pattern.test(haystack));
  return match ? match.key : "Events";
}

/** Event types present in `items`, most common first, with their blurb. */
export function eventTypesIn(items) {
  const counts = new Map();
  for (const item of items) {
    const key = eventTypeOf(item);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([key, count]) => ({
      key,
      count,
      blurb: RULES.find((r) => r.key === key)?.blurb ?? "Everyday moments from the GOLZ nutrition clinic.",
    }));
}
