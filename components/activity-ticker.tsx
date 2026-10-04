import Link from "next/link";
import { formatAge } from "@/lib/format";

type Item = { id: string; title: string; author: string; room: string; ageMin: number };

/** Thin "live" strip of the latest posts. Content is duplicated so the CSS marquee loops seamlessly. */
export function ActivityTicker({ items }: { items: Item[] }) {
  if (items.length === 0) return null;
  const row = (suffix: string) =>
    items.map((i) => (
      <Link key={`${i.id}${suffix}`} href={`/post/${i.id}`} className="group flex shrink-0 items-center gap-2 pr-10 text-[0.85rem] text-ink-2 hover:text-ink" tabIndex={suffix ? -1 : undefined} aria-hidden={suffix ? true : undefined}>
        <span className="font-semibold text-ink">{i.author.split(" ")[0]}</span>
        <span className="text-muted">ใน{i.room}</span>
        <span className="max-w-[26rem] truncate group-hover:underline">{i.title}</span>
        <span className="text-faint">{formatAge(i.ageMin)}</span>
        <span aria-hidden="true" className="ml-8 h-1 w-1 rotate-45 bg-gold" />
      </Link>
    ));
  return (
    <div className="flex items-center overflow-hidden border border-line bg-card" aria-label="ความเคลื่อนไหวล่าสุด">
      <span className="flex shrink-0 items-center gap-2 self-stretch bg-night px-4 text-[0.72rem] font-bold uppercase tracking-[0.2em] text-on-night">
        <span className="live-dot h-1.5 w-1.5 rounded-full bg-[#ff6a4d]" /> Live
      </span>
      <div className="relative min-w-0 flex-1 overflow-hidden py-2.5">
        <div className="marquee">
          <div className="flex shrink-0">{row("")}</div>
          <div className="flex shrink-0" aria-hidden="true">{row("-dup")}</div>
        </div>
      </div>
    </div>
  );
}
