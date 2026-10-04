import { weekendOffsets } from "@/lib/format";
import type { SiseEvent } from "@/lib/types";

export type When = "today" | "tomorrow" | "weekend" | "all";

export const eventCoversDay = (e: SiseEvent, offset: number) => offset >= e.dayOffset && offset < e.dayOffset + e.durationDays;

export function eventsFor(events: SiseEvent[], when: When): SiseEvent[] {
  const list = [...events].sort((a, b) => a.dayOffset - b.dayOffset);
  if (when === "today") return list.filter((e) => eventCoversDay(e, 0));
  if (when === "tomorrow") return list.filter((e) => eventCoversDay(e, 1));
  if (when === "weekend") {
    const w = weekendOffsets();
    return list.filter((e) => w.some((o) => eventCoversDay(e, o)));
  }
  return list;
}

export const upcomingEvents = (events: SiseEvent[], limit = 6) => eventsFor(events, "all").filter((e) => e.dayOffset + e.durationDays > 0).slice(0, limit);
