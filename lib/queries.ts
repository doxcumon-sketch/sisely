import { events, eventCoversDay } from "@/lib/data/events";
import { places } from "@/lib/data/places";
import { weekendOffsets } from "@/lib/format";
import type { SiseEvent } from "@/lib/types";

export type When = "today" | "tomorrow" | "weekend" | "all";

export function eventsFor(when: When): SiseEvent[] {
  const list = [...events].sort((a, b) => a.dayOffset - b.dayOffset);
  if (when === "today") return list.filter((e) => eventCoversDay(e, 0));
  if (when === "tomorrow") return list.filter((e) => eventCoversDay(e, 1));
  if (when === "weekend") {
    const w = weekendOffsets();
    return list.filter((e) => w.some((o) => eventCoversDay(e, o)));
  }
  return list;
}

export const upcomingEvents = (limit = 6) => eventsFor("all").filter((e) => e.dayOffset + e.durationDays > 0).slice(0, limit);

export const placesByCategory = (cat: string) => places.filter((p) => p.category === cat);

/** Case-insensitive, Thai-safe substring match over several fields. */
export function matches(q: string, ...fields: Array<string | undefined>): boolean {
  const needle = q.trim().toLowerCase();
  if (!needle) return false;
  return fields.some((f) => f?.toLowerCase().includes(needle));
}
