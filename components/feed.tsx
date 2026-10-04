"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { EmptyState } from "@/components/ui";
import { PostCard } from "@/components/post-card";
import { ageOf, useAllPosts, useNow } from "@/lib/hooks";
import { engagement, forYouScore, trendingScore } from "@/lib/ranking";
import { useSise } from "@/lib/store";
import { seedComments } from "@/lib/data/posts";
import type { Post } from "@/lib/types";

export type FeedMode = "forYou" | "hot" | "new" | "top" | "unanswered";

export interface FeedFilter {
  mode: FeedMode;
  roomSlug?: string;
  authorId?: string;
  placeSlug?: string;
  eventSlug?: string;
  ids?: string[];
  types?: Post["type"][];
}

/** Ranked, filtered post list used by every surface (home, rooms, profiles, places). */
export function usePostList(filter: FeedFilter): Post[] {
  const all = useAllPosts();
  const now = useNow();
  const followedRooms = useSise((s) => s.follows.rooms);
  const followedUsers = useSise((s) => s.follows.users);
  const savedPlaces = useSise((s) => s.saves.places);
  const viewedTopics = useSise((s) => s.viewedTopics);
  const blocked = useSise((s) => s.blocked);
  const muted = useSise((s) => s.muted);
  const userComments = useSise((s) => s.userComments);

  const { mode, roomSlug, authorId, placeSlug, eventSlug, ids, types } = filter;
  return useMemo(() => {
    const hidden = new Set([...blocked, ...muted]);
    let list = all.filter((p) => !hidden.has(p.authorId));
    if (roomSlug) list = list.filter((p) => p.roomSlug === roomSlug);
    if (authorId) list = list.filter((p) => p.authorId === authorId);
    if (placeSlug) list = list.filter((p) => p.placeSlug === placeSlug);
    if (eventSlug) list = list.filter((p) => p.eventSlug === eventSlug);
    if (ids) list = list.filter((p) => ids.includes(p.id));
    if (types) list = list.filter((p) => types.includes(p.type));

    const age = (p: Post) => ageOf(p, now);
    const ctx = { followedRooms, followedUsers, savedPlaceSlugs: savedPlaces, viewedTopics, blocked };
    const byScore = (fn: (p: Post) => number) => [...list].sort((a, b) => fn(b) - fn(a));

    let sorted: Post[];
    switch (mode) {
      case "new":
        sorted = [...list].sort((a, b) => age(a) - age(b));
        break;
      case "top":
        sorted = byScore((p) => engagement(p));
        break;
      case "unanswered": {
        const answered = new Set([...seedComments, ...userComments].map((c) => c.postId));
        sorted = list.filter((p) => p.type === "question" && !p.solved && (!answered.has(p.id) || p.stats.comments <= 2)).sort((a, b) => age(a) - age(b));
        break;
      }
      case "forYou":
        sorted = byScore((p) => forYouScore(p, age(p), ctx));
        break;
      default:
        sorted = byScore((p) => trendingScore(p, age(p)));
    }
    return roomSlug && (mode === "hot" || mode === "new") ? [...sorted.filter((p) => p.pinned), ...sorted.filter((p) => !p.pinned)] : sorted;
  }, [all, now, mode, roomSlug, authorId, placeSlug, eventSlug, ids, types, followedRooms, followedUsers, savedPlaces, viewedTopics, blocked, muted, userComments]);
}

export function Feed({
  filter,
  pageSize = 8,
  showRoom = true,
  emptyTitle = "ยังไม่มีโพสต์ที่นี่",
  emptyHint = "เป็นคนแรกที่เริ่มบทสนทนาได้เลย",
  emptyAction,
}: {
  filter: FeedFilter;
  pageSize?: number;
  showRoom?: boolean;
  emptyTitle?: string;
  emptyHint?: string;
  emptyAction?: React.ReactNode;
}) {
  const list = usePostList(filter);
  const [count, setCount] = useState(pageSize);
  const sentinel = useRef<HTMLDivElement>(null);
  const hasMore = count < list.length;

  useEffect(() => {
    const el = sentinel.current;
    if (!el || !hasMore) return;
    const io = new IntersectionObserver((entries) => entries[0].isIntersecting && setCount((c) => c + pageSize), { rootMargin: "400px" });
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, pageSize]);

  if (list.length === 0) {
    return (
      <EmptyState
        icon="chat"
        title={emptyTitle}
        hint={emptyHint}
        action={emptyAction ?? <Link href="/create" className="press inline-block rounded-full bg-night px-5 py-2.5 font-semibold text-on-night">เริ่มโพสต์</Link>}
      />
    );
  }

  return (
    <div className="space-y-4">
      {list.slice(0, count).map((p, i) => (
        <PostCard key={p.id} post={p} showRoom={showRoom} index={i} />
      ))}
      {hasMore && (
        <div ref={sentinel} className="flex justify-center py-4">
          <button type="button" onClick={() => setCount((c) => c + pageSize)} className="press inline-flex items-center gap-1.5 rounded-full border border-line bg-card px-5 py-2.5 text-sm font-medium text-ink-2">
            <ChevronDown className="h-4 w-4" /> โหลดเพิ่ม ({list.length - count})
          </button>
        </div>
      )}
      {!hasMore && list.length > pageSize && <p className="py-6 text-center text-sm text-faint">ถึงท้ายแล้ว — ลองเข้าห้องอื่นดูนะ</p>}
    </div>
  );
}

export function TrendingList({ limit = 5 }: { limit?: number }) {
  const list = usePostList({ mode: "hot" }).slice(0, limit);
  return (
    <ol className="space-y-1">
      {list.map((p, i) => (
        <li key={p.id}>
          <Link href={`/post/${p.id}`} className="press group flex items-start gap-3 rounded-2xl p-2.5 hover:bg-paper-2">
            <span className="font-display w-7 shrink-0 text-center text-2xl font-semibold text-gold" style={{ fontFamily: "var(--font-display-latin), serif" }}>{i + 1}</span>
            <span className="min-w-0">
              <span className="line-clamp-2 text-[0.95rem] font-medium leading-snug group-hover:text-gold">{p.title}</span>
              <span className="mt-0.5 block text-xs text-muted">{p.stats.comments} ความเห็น · {p.stats.reactions} ถูกใจ</span>
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
