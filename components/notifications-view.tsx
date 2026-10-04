"use client";

import { AtSign, Bell, CalendarDays, CheckCheck, Heart, MapPin, MessageCircle, Megaphone, ShoppingBag, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Avatar, EmptyState, cx } from "@/components/ui";
import { formatAge } from "@/lib/format";
import { actions } from "@/lib/store";

type Item = {
  id: string; kind: string; text: string; detail?: string; href: string; unread: boolean; ageMin: number;
  actor?: { id: string; handle: string; name: string; tone: "jade" | "laterite" | "gold" | "indigo" | "plum" | "sky" | "ink"; pictureUrl: string | null };
};

const ICON: Record<string, LucideIcon> = { comment: MessageCircle, reply: MessageCircle, mention: AtSign, room: Heart, event: CalendarDays, place: MapPin, market: ShoppingBag, system: Megaphone };

export function NotificationsView({ items }: { items: Item[] }) {
  const [read, setRead] = useState<string[]>([]);
  const unread = items.filter((n) => n.unread && !read.includes(n.id));

  const markAll = async () => {
    setRead(items.map((n) => n.id));
    await actions.readNotifications("all");
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <header className="flex items-end justify-between gap-3">
        <div><p className="eyebrow mb-1">Notifications</p><h1 className="font-editorial text-3xl font-bold">การแจ้งเตือน</h1></div>
        {unread.length > 0 && (
          <button type="button" onClick={markAll} className="press inline-flex items-center gap-1.5 rounded-sm border border-line px-4 py-2 text-sm font-medium hover:border-gold"><CheckCheck className="h-4 w-4" /> อ่านทั้งหมด</button>
        )}
      </header>

      {items.length === 0 ? (
        <EmptyState icon="chat" title="ยังไม่มีการแจ้งเตือน" hint="เมื่อมีคนตอบ กดถูกใจ หรือกล่าวถึงคุณ จะแสดงที่นี่" />
      ) : (
        <ul className="surface divide-y divide-line-soft overflow-hidden">
          {items.map((n) => {
            const isUnread = n.unread && !read.includes(n.id);
            const Icon = ICON[n.kind] ?? Bell;
            return (
              <li key={n.id}>
                <Link href={n.href} onClick={() => { setRead((r) => [...r, n.id]); void actions.readNotifications([n.id]); }} className={cx("press flex gap-3 p-4 hover:bg-paper-2", isUnread && "bg-gold-soft/50")}>
                  {n.actor ? <Avatar name={n.actor.name} tone={n.actor.tone} size={42} src={n.actor.pictureUrl} /> : <span className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-sm bg-night text-gold"><Icon className="h-5 w-5" /></span>}
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium leading-snug">{n.text}</span>
                    {n.detail && <span className="mt-0.5 line-clamp-2 block text-sm text-muted">{n.detail}</span>}
                    <span className="mt-1 block text-xs text-faint">{formatAge(n.ageMin)}</span>
                  </span>
                  {isUnread && <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-laterite" aria-label="ยังไม่อ่าน" />}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
