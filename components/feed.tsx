"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { EmptyState, PostSkeleton } from "@/components/ui";
import { PostCard } from "@/components/post-card";
import { api, syncPosts, useSise } from "@/lib/store";
import type { Post } from "@/lib/types";

export type FeedMode = "forYou" | "hot" | "new" | "top" | "unanswered";

export interface FeedFilter {
  mode: FeedMode;
  roomSlug?: string;
  authorId?: string;
  placeSlug?: string;
  eventSlug?: string;
  ids?: string[];
}

function toQuery(f: FeedFilter, offset: number, limit: number) {
  const q = new URLSearchParams({ mode: f.mode, offset: String(offset), limit: String(limit) });
  if (f.roomSlug) q.set("room", f.roomSlug);
  if (f.authorId) q.set("author", f.authorId);
  if (f.placeSlug) q.set("place", f.placeSlug);
  if (f.eventSlug) q.set("event", f.eventSlug);
  if (f.ids) q.set("ids", f.ids.join(","));
  return q.toString();
}

/**
 * Ranked post list. The first page is server-rendered (`initial`, good for SEO and instant paint);
 * further pages come from /api/feed. "For you" is re-fetched once we know who the viewer is.
 */
export function Feed({
  filter,
  initial,
  pageSize = 8,
  showRoom = true,
  emptyTitle = "ยังไม่มีโพสต์ที่นี่",
  emptyHint = "เป็นคนแรกที่เริ่มบทสนทนาได้เลย",
  emptyAction,
}: {
  filter: FeedFilter;
  initial?: { posts: Post[]; hasMore: boolean };
  pageSize?: number;
  showRoom?: boolean;
  emptyTitle?: string;
  emptyHint?: string;
  emptyAction?: React.ReactNode;
}) {
  const [posts, setPosts] = useState<Post[]>(initial?.posts ?? []);
  const [hasMore, setHasMore] = useState(initial?.hasMore ?? false);
  const [loading, setLoading] = useState(!initial);
  const [error, setError] = useState<string | null>(null);
  const sentinel = useRef<HTMLDivElement>(null);
  const meId = useSise((s) => s.me?.id);
  const ready = useSise((s) => s.ready);
  const filterKey = JSON.stringify(filter);

  const fetchPage = useCallback(
    (offset: number) => api<{ posts: Post[]; hasMore: boolean }>(`/api/feed?${toQuery(JSON.parse(filterKey) as FeedFilter, offset, pageSize)}`, "GET"),
    [filterKey, pageSize],
  );

  // Page 1: use the server-rendered posts when we have them, otherwise fetch.
  useEffect(() => {
    if (initial) {
      syncPosts(initial.posts);
      return;
    }
    let stale = false;
    void (async () => {
      const r = await fetchPage(0);
      if (stale) return;
      setLoading(false);
      if (!r.ok) return setError(r.error);
      syncPosts(r.data.posts);
      setPosts(r.data.posts);
      setHasMore(r.data.hasMore);
    })();
    return () => {
      stale = true;
    };
  }, [fetchPage, initial]);

  // "For you" is personalised: refresh once we know who the viewer is.
  useEffect(() => {
    if (!ready || !meId || filter.mode !== "forYou") return;
    let stale = false;
    void (async () => {
      const r = await fetchPage(0);
      if (stale || !r.ok) return;
      syncPosts(r.data.posts);
      setPosts(r.data.posts);
      setHasMore(r.data.hasMore);
    })();
    return () => {
      stale = true;
    };
  }, [ready, meId, filter.mode, fetchPage]);

  const loadMore = useCallback(async () => {
    setLoading(true);
    setError(null);
    const r = await fetchPage(posts.length);
    setLoading(false);
    if (!r.ok) return setError(r.error);
    syncPosts(r.data.posts);
    setPosts((prev) => [...prev, ...r.data.posts.filter((p) => !prev.some((x) => x.id === p.id))]);
    setHasMore(r.data.hasMore);
  }, [fetchPage, posts.length]);

  useEffect(() => {
    const el = sentinel.current;
    if (!el || !hasMore || loading) return;
    const io = new IntersectionObserver((entries) => entries[0].isIntersecting && void loadMore(), { rootMargin: "400px" });
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, loading, loadMore]);

  const blocked = useSise((s) => s.blocked);
  const muted = useSise((s) => s.muted);
  const visible = posts.filter((p) => !blocked.includes(p.authorId) && !muted.includes(p.authorId));

  if (!loading && !error && visible.length === 0) {
    return (
      <EmptyState
        icon="chat"
        title={emptyTitle}
        hint={emptyHint}
        action={emptyAction ?? <Link href="/create" className="press inline-block rounded-sm bg-night px-5 py-2.5 font-semibold text-on-night">เริ่มโพสต์</Link>}
      />
    );
  }

  return (
    <div className="space-y-4" aria-busy={loading}>
      {visible.map((p, i) => (
        <PostCard key={p.id} post={p} showRoom={showRoom} index={i} />
      ))}
      {loading && posts.length === 0 && (<><PostSkeleton /><PostSkeleton /></>)}
      {error && (
        <div role="alert" className="surface-flat p-5 text-center text-sm">
          <p className="text-laterite">{error}</p>
          <button type="button" onClick={() => void loadMore()} className="press mt-3 rounded-sm bg-night px-5 py-2 font-semibold text-on-night">ลองใหม่</button>
        </div>
      )}
      {hasMore && !error && (
        <div ref={sentinel} className="flex justify-center py-4">
          <button type="button" onClick={() => void loadMore()} disabled={loading} className="press inline-flex items-center gap-1.5 rounded-sm border border-line bg-card px-5 py-2.5 text-sm font-medium text-ink-2">
            <ChevronDown className="h-4 w-4" /> {loading ? "กำลังโหลด…" : "โหลดเพิ่ม"}
          </button>
        </div>
      )}
      {!hasMore && !loading && visible.length > pageSize && <p className="py-6 text-center text-sm text-faint">ถึงท้ายแล้ว — ลองเข้าห้องอื่นดูนะ</p>}
    </div>
  );
}
