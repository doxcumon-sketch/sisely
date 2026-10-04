import type { Metadata } from "next";
import { EventCard } from "@/components/cards";
import { Chip, EmptyState } from "@/components/ui";
import { EVENT_CATEGORY_LABEL } from "@/lib/data";
import { dayLabel } from "@/lib/format";
import { listEvents } from "@/lib/server/repo";
import { eventsFor, type When } from "@/lib/queries";
import type { SiseEvent } from "@/lib/types";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "งานศรีสะเกษ — วันนี้ พรุ่งนี้ สุดสัปดาห์นี้",
  description: "ปฏิทินงานศรีสะเกษ คอนเสิร์ต ตลาดนัด เทศกาล เวิร์กช็อป กีฬา และกิจกรรมชุมชน วันนี้มีอะไร พรุ่งนี้มีอะไร สุดสัปดาห์นี้ไปไหนดี",
  alternates: { canonical: "/events" },
};

const WHEN: { key: When; label: string }[] = [
  { key: "today", label: "วันนี้" },
  { key: "tomorrow", label: "พรุ่งนี้" },
  { key: "weekend", label: "สุดสัปดาห์นี้" },
  { key: "all", label: "ทั้งหมด" },
];

export default async function EventsPage({ searchParams }: { searchParams: Promise<{ when?: string; cat?: string }> }) {
  const sp = await searchParams;
  const when = (WHEN.find((w) => w.key === sp.when)?.key ?? "all") as When;
  const cat = Object.keys(EVENT_CATEGORY_LABEL).includes(sp.cat ?? "") ? (sp.cat as SiseEvent["category"]) : undefined;
  const all = await listEvents();
  const list = eventsFor(all, when).filter((e) => !cat || e.category === cat);
  const href = (w: When, c?: string) => `/events?${[w !== "all" ? `when=${w}` : "", c ? `cat=${c}` : ""].filter(Boolean).join("&")}`;

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow mb-1">Events</p>
        <h1 className="font-editorial text-3xl font-bold sm:text-4xl">วันนี้ศรีสะเกษมีอะไร</h1>
        <p className="mt-2 max-w-xl text-muted">ดนตรี ตลาดนัด เทศกาล เวิร์กช็อป และกิจกรรมของคนในเมือง บันทึกไว้เพื่อให้เราเตือนก่อนเริ่ม</p>
      </header>

      <div className="grid grid-cols-3 gap-2 sm:max-w-xl" role="tablist" aria-label="ช่วงเวลา">
        {WHEN.slice(0, 3).map((w) => (
          <a key={w.key} href={href(w.key, cat)} role="tab" aria-selected={when === w.key} className={`press rounded-2xl border px-3 py-4 text-center font-editorial text-lg font-semibold ${when === w.key ? "border-night bg-night text-on-night" : "border-line bg-card hover:border-gold"}`}>
            {w.label}
            <span className={`block text-xs font-normal ${when === w.key ? "text-on-night-muted" : "text-muted"}`}>{eventsFor(all, w.key).length} งาน</span>
          </a>
        ))}
      </div>

      <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        <Chip href={href(when)} active={!cat}>ทุกประเภท</Chip>
        {Object.entries(EVENT_CATEGORY_LABEL).map(([k, v]) => (
          <Chip key={k} href={href(when, k)} active={cat === k}>{v}</Chip>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState icon="events" title={when === "all" ? "ไม่พบงานตามตัวกรองนี้" : `${WHEN.find((w) => w.key === when)?.label}ยังไม่มีงาน`} hint="ลองดูช่วงเวลาอื่น หรือแนะนำงานให้คนในเมืองได้ที่ปุ่มโพสต์" action={<Chip href="/events">ดูงานทั้งหมด</Chip>} />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {list.map((e) => (
            <div key={e.id}>
              <p className="mb-1.5 text-xs font-semibold text-laterite">{dayLabel(e.dayOffset)}{e.durationDays > 1 ? ` – ${dayLabel(e.dayOffset + e.durationDays - 1)}` : ""}</p>
              <EventCard event={e} featured />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
