"use client";

import { useState } from "react";
import { Feed, type FeedMode } from "@/components/feed";
import { Chip } from "@/components/ui";
import type { Post } from "@/lib/types";

const TABS: { key: FeedMode; label: string }[] = [
  { key: "forYou", label: "สำหรับคุณ" },
  { key: "hot", label: "กำลังร้อน" },
  { key: "new", label: "ใหม่ล่าสุด" },
  { key: "unanswered", label: "ยังไม่มีคนตอบ" },
];

export function HomeFeedTabs({ initial }: { initial: { posts: Post[]; hasMore: boolean } }) {
  const [mode, setMode] = useState<FeedMode>("forYou");
  return (
    <>
      <div className="scrollbar-none -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0" role="tablist" aria-label="เรียงโพสต์">
        {TABS.map((t) => (
          <Chip key={t.key} active={mode === t.key} onClick={() => setMode(t.key)}>{t.label}</Chip>
        ))}
      </div>
      <Feed key={mode} filter={{ mode }} initial={mode === "forYou" ? initial : undefined} pageSize={6} emptyTitle="ตอนนี้ไม่มีโพสต์ในหมวดนี้" emptyHint="ลองดูแท็บอื่น หรือเริ่มโพสต์เองได้เลย" />
    </>
  );
}
