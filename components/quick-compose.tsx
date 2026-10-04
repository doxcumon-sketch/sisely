"use client";

import { HelpCircle, Megaphone, MessagesSquare, ShoppingBag, Sparkles } from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/ui";
import { requireLogin, useSise } from "@/lib/store";

const SHORTCUTS = [
  { type: "question", label: "ถามคนพื้นที่", icon: HelpCircle },
  { type: "recommendation", label: "แนะนำของเด็ด", icon: Sparkles },
  { type: "marketplace", label: "ลงขายของ", icon: ShoppingBag },
  { type: "event", label: "ชวนไปงาน", icon: Megaphone },
] as const;

/** One-tap entry to posting at the top of the feed — the single biggest driver of a living community. */
export function QuickCompose() {
  const me = useSise((s) => s.me);
  const ready = useSise((s) => s.ready);
  const go = (e: React.MouseEvent) => {
    if (ready && !me) {
      e.preventDefault();
      requireLogin();
    }
  };
  return (
    <div className="surface mb-4 p-3 sm:p-4">
      <div className="flex items-center gap-3">
        <Avatar name={me?.name ?? "SISE"} tone="gold" size={42} src={me?.pictureUrl} />
        <Link href="/create" onClick={go} className="press flex h-11 min-w-0 flex-1 items-center rounded-sm border border-line bg-paper px-4 text-[0.98rem] text-faint hover:border-gold">
          <MessagesSquare className="mr-2 h-4 w-4 shrink-0 text-gold" />
          <span className="truncate">มีอะไรอยากเม้าท์? ถาม แนะนำ หรือชวนคุยได้เลย…</span>
        </Link>
      </div>
      <div className="scrollbar-none -mx-1 mt-3 flex gap-2 overflow-x-auto px-1">
        {SHORTCUTS.map(({ type, label, icon: Icon }) => (
          <Link key={type} href={`/create?type=${type}`} onClick={go} className="press inline-flex shrink-0 items-center gap-1.5 border border-line bg-card px-3.5 py-2 text-sm font-medium text-ink-2 hover:border-gold hover:text-ink">
            <Icon className="h-4 w-4 text-gold" /> {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
