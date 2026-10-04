"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

const noopSub = () => () => {};

/** True only after hydration — lets us render time-dependent UI without mismatches. */
export function useMounted(): boolean {
  return useSyncExternalStore(noopSub, () => true, () => false);
}

/** Current time, ticking each minute; `0` on the server so server and first client render agree. */
export function useNow(): number {
  const [now, setNow] = useState(0);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}

/** Age in minutes: live (from the epoch timestamp) once mounted, the server-computed value before that. */
export function ageOf(item: { ageMin: number; createdAt: number }, now: number): number {
  return now ? Math.max(0, (now - item.createdAt) / 60000) : item.ageMin;
}
