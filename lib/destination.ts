import type { SceneId } from "@/lib/covers";
import { AREAS } from "@/lib/data/areas";

/** Which artwork (and, later, which photograph) fills each slot on the destination home page. See docs/PHOTOS.md. */
export const SLOTS = {
  hero: "pha-mo-i-daeng",
  discover: ["river-mun", "silk", "lamduan"],
  eat: "street-food",
  culture: "sa-kamphaeng-yai",
  cta: "river-mun",
  people: ["silk", "market", "cafe", "shallot"],
  hidden: ["countryside", "shallot", "durian", "temple"],
} as const satisfies Record<string, SceneId | readonly SceneId[]>;

export const DISTRICTS = AREAS.map((a) => a.replace(/^อ\./, ""));

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

/** Calendar parts for "today + offset days" in Bangkok time. */
export function dateParts(dayOffset: number) {
  const d = new Date(Date.now() + 7 * 3600_000 + dayOffset * 86_400_000);
  return { day: String(d.getUTCDate()).padStart(2, "0"), month: MONTHS[d.getUTCMonth()], year: d.getUTCFullYear() };
}

export const pad2 = (n: number) => String(n).padStart(2, "0");
