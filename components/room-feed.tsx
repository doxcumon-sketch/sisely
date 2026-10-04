"use client";

import { useState } from "react";
import { Feed, type FeedMode } from "@/components/feed";
import { Chip } from "@/components/ui";
import type { Post } from "@/lib/types";

const TABS: { key: FeedMode; label: string }[] = [
  { key: "hot", label: "HOT" },
  { key: "new", label: "NEW" },
  { key: "unanswered", label: "ยังไม่มีคนตอบ" },
  { key: "top", label: "TOP" },
];

export function RoomFeed({ roomSlug, initial }: { roomSlug: string; initial: { posts: Post[]; hasMore: boolean } }) {
  const [mode, setMode] = useState<FeedMode>("hot");
  return (
    <section className="min-w-0" aria-label="โพสต์ในห้อง">
      <div className="scrollbar-none -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0" role="tablist">
        {TABS.map((t) => (
          <Chip key={t.key} active={mode === t.key} onClick={() => setMode(t.key)}>{t.label}</Chip>
        ))}
      </div>
      <Feed key={mode} filter={{ mode, roomSlug }} initial={mode === "hot" ? initial : undefined} showRoom={false} emptyTitle={mode === "unanswered" ? "ทุกคำถามมีคนตอบแล้ว" : "ยังไม่มีโพสต์ในห้องนี้"} emptyHint={mode === "unanswered" ? "ยอดเยี่ยม! ลองสลับไปแท็บ HOT" : "เป็นคนแรกที่เริ่มบทสนทนาได้เลย"} />
    </section>
  );
}
