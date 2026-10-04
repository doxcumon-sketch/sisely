"use client";

import { Check, X } from "lucide-react";
import { RoomIcon } from "@/components/icons";
import { cx } from "@/components/ui";
import { actions, useSise } from "@/lib/store";

type RoomLite = { slug: string; name: string; icon: string };

/** Shown once to signed-in members who follow fewer than 3 rooms: pick interests in one tap each. */
export function Onboarding({ rooms }: { rooms: RoomLite[] }) {
  const me = useSise((s) => s.me);
  const follows = useSise((s) => s.follows.rooms);
  const dismissed = useSise((s) => s.onboardingDismissed);
  if (!me || dismissed || follows.length >= 3) return null;
  return (
    <section className="surface relative mb-4 overflow-hidden p-5" aria-label="เลือกห้องที่สนใจ">
      <button type="button" onClick={() => actions.dismissOnboarding()} className="press absolute right-2 top-2 rounded-sm p-2 text-muted hover:bg-paper-2" aria-label="ปิด"><X className="h-4 w-4" /></button>
      <p className="eyebrow mb-1">ยินดีต้อนรับ {me.name.split(" ")[0]}</p>
      <h2 className="font-editorial text-xl font-semibold">เลือกห้องที่คุณสนใจ อย่างน้อย 3 ห้อง</h2>
      <p className="mt-1 text-sm text-muted">หน้า &ldquo;สำหรับคุณ&rdquo; จะเรียงเรื่องที่ตรงกับคุณขึ้นมาก่อน ({Math.min(follows.length, 3)}/3)</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {rooms.map((r) => {
          const on = follows.includes(r.slug);
          return (
            <button key={r.slug} type="button" aria-pressed={on} onClick={() => actions.follow("rooms", r.slug)} className={cx("press inline-flex items-center gap-2 border px-3.5 py-2 text-sm font-medium", on ? "border-night bg-night text-on-night" : "border-line bg-card text-ink-2 hover:border-gold")}>
              {on ? <Check className="h-4 w-4 text-rose" /> : <RoomIcon name={r.icon} className="h-4 w-4 text-gold" />} {r.name}
            </button>
          );
        })}
      </div>
    </section>
  );
}
