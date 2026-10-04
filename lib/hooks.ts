"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { seedComments, seedPosts } from "@/lib/data/posts";
import type { Comment, Post } from "@/lib/types";
import { useSise } from "@/lib/store";

const noopSub = () => () => {};

/** True only after hydration — lets us render time-dependent UI without mismatches. */
export function useMounted(): boolean {
  return useSyncExternalStore(noopSub, () => true, () => false);
}

/** Current time, ticking each minute; `0` on the server so user-created items never mismatch. */
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

export function ageOf(item: { ageMin: number; createdAt?: number }, now: number): number {
  if (item.createdAt) return now ? Math.max(0, (now - item.createdAt) / 60000) : 0;
  return item.ageMin;
}

/** Seed posts + the user's own posts, with comment counts that include new comments. */
export function useAllPosts(): Post[] {
  const userPosts = useSise((s) => s.userPosts);
  const userComments = useSise((s) => s.userComments);
  return useMemo(() => {
    const extra = new Map<string, number>();
    for (const c of userComments) extra.set(c.postId, (extra.get(c.postId) ?? 0) + 1);
    return [...userPosts, ...seedPosts].map((p) => {
      const add = extra.get(p.id) ?? 0;
      return add ? { ...p, stats: { ...p.stats, comments: p.stats.comments + add } } : p;
    });
  }, [userPosts, userComments]);
}

export function usePost(id: string): Post | undefined {
  const all = useAllPosts();
  return all.find((p) => p.id === id);
}

export function useComments(postId: string): Comment[] {
  const userComments = useSise((s) => s.userComments);
  return useMemo(() => [...seedComments.filter((c) => c.postId === postId), ...userComments.filter((c) => c.postId === postId)], [postId, userComments]);
}
