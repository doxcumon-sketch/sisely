"use client";

import { Bell, BellOff, Bookmark, Check, Plus, Star } from "lucide-react";
import { cx } from "@/components/ui";
import { toast } from "@/components/toast";
import { useState } from "react";
import { actions, useSise, type SiseState } from "@/lib/store";

export function FollowButton({ kind, id, label = "ติดตาม", doneLabel = "กำลังติดตาม", size = "md", onChange }: {
  onChange?: (now: boolean) => void;
  kind: keyof SiseState["follows"];
  id: string;
  label?: string;
  doneLabel?: string;
  size?: "sm" | "md";
}) {
  const on = useSise((s) => s.follows[kind].includes(id));
  return (
    <button
      type="button"
      onClick={async () => {
        const now = await actions.follow(kind, id);
        if (now !== on) {
          onChange?.(now);
          toast(now ? "ติดตามแล้ว จะแสดงในหน้า 'สำหรับคุณ'" : "เลิกติดตามแล้ว");
        }
      }}
      aria-pressed={on}
      className={cx(
        "press inline-flex shrink-0 items-center gap-1.5 rounded-sm border font-semibold",
        size === "sm" ? "px-3.5 py-1.5 text-sm" : "px-5 py-2.5 text-[0.95rem]",
        on ? "border-line bg-card text-ink-2" : "border-night bg-night text-on-night hover:bg-night-2",
      )}
    >
      {on ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
      {on ? doneLabel : label}
    </button>
  );
}

export function SaveButton({ kind, id, className }: { kind: keyof SiseState["saves"]; id: string; className?: string }) {
  const on = useSise((s) => s.saves[kind].includes(id));
  return (
    <button
      type="button"
      onClick={async () => {
        const now = await actions.save(kind, id);
        if (now !== on) toast(now ? "บันทึกไว้ในโปรไฟล์แล้ว" : "เลิกบันทึกแล้ว");
      }}
      aria-pressed={on}
      aria-label={on ? "เลิกบันทึก" : "บันทึก"}
      className={cx("press inline-flex items-center gap-1.5 rounded-sm border px-4 py-2.5 text-[0.95rem] font-semibold", on ? "border-gold bg-gold-soft text-ink" : "border-line bg-card text-ink-2 hover:border-gold", className)}
    >
      <Bookmark className={cx("h-[18px] w-[18px]", on && "fill-current text-gold")} />
      {on ? "บันทึกแล้ว" : "บันทึก"}
    </button>
  );
}

export function InterestedButton({ slug, base }: { slug: string; base: number }) {
  const on = useSise((s) => s.follows.events.includes(slug));
  const [delta, setDelta] = useState(0); // base already includes this member if they were interested at render time
  return (
    <button
      type="button"
      onClick={async () => {
        const now = await actions.follow("events", slug);
        if (now !== on) {
          setDelta((d) => d + (now ? 1 : -1));
          toast(now ? "เราจะแจ้งเตือนก่อนงานเริ่ม" : "ยกเลิกความสนใจแล้ว");
        }
      }}
      aria-pressed={on}
      className={cx("press inline-flex items-center gap-2 rounded-sm px-5 py-3 font-semibold", on ? "bg-gold-soft text-ink ring-1 ring-gold" : "bg-night text-on-night hover:bg-night-2")}
    >
      <Star className={cx("h-[18px] w-[18px]", on && "fill-current text-gold")} />
      {on ? "สนใจแล้ว" : "สนใจงานนี้"}
      <span className="rounded-sm bg-black/10 px-2 py-0.5 text-xs tabular-nums dark:bg-white/10">{Math.max(0, base + delta)}</span>
    </button>
  );
}

export function NotifyButton({ kind, id }: { kind: keyof SiseState["follows"]; id: string }) {
  const on = useSise((s) => s.follows[kind].includes(id));
  return (
    <button type="button" onClick={() => actions.follow(kind, id)} aria-pressed={on} className="press rounded-sm border border-line p-2.5 text-ink-2 hover:border-gold" aria-label={on ? "ปิดแจ้งเตือน" : "เปิดแจ้งเตือน"}>
      {on ? <Bell className="h-[18px] w-[18px] text-gold" /> : <BellOff className="h-[18px] w-[18px]" />}
    </button>
  );
}
