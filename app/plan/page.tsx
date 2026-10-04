import { ArrowRight, Car, Clock, MapPin, Shuffle, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ShareButton } from "@/components/share";
import { EmptyState } from "@/components/ui";
import { dayLabel } from "@/lib/format";
import { buildPlan, planQuery, VIBES, WHO, type PlanInput, type Vibe, type Who } from "@/lib/planner";
import { listEvents, listPlaces } from "@/lib/server/repo";

export const metadata: Metadata = {
  title: "พาเที่ยวศรีสะเกษ — จัดทริปให้ ครึ่งวันถึง 3 วัน",
  description: "บอกสไตล์ งบ และไปกับใคร เราจัดทริปศรีสะเกษให้เป็นลำดับเวลา พร้อมร้านเด็ดและงานที่ตรงช่วงที่ไป แชร์ให้เพื่อนใน LINE ได้เลย",
  alternates: { canonical: "/plan" },
};

export const dynamic = "force-dynamic";

type SP = { go?: string; days?: string; budget?: string; who?: string; from?: string; seed?: string; vibe?: string | string[] };

const BUDGETS = [
  { v: 1, label: "สบายกระเป๋า ฿" },
  { v: 2, label: "กำลังดี ฿฿" },
  { v: 3, label: "จัดเต็ม ฿฿฿" },
];

function weekendOffset() {
  const dow = new Date(Date.now() + 7 * 3600_000).getUTCDay(); // 0 = Sunday, Bangkok time
  return dow === 6 ? 0 : (6 - dow + 7) % 7;
}

function parse(sp: SP): PlanInput {
  const vibes = ([] as string[]).concat(sp.vibe ?? []).filter((v): v is Vibe => VIBES.some((x) => x.key === v));
  const days = Math.min(3, Math.max(1, Number(sp.days) || 1)) as 1 | 2 | 3;
  const budget = Math.min(3, Math.max(1, Number(sp.budget) || 2)) as 1 | 2 | 3;
  const who = (WHO.some((w) => w.key === sp.who) ? sp.who : "friends") as Who;
  const from = Math.min(30, Math.max(0, Number(sp.from) || 0));
  return { days, vibes: vibes.length ? vibes : ["food", "cafe"], budget, who, from, seed: Math.max(0, Number(sp.seed) || 0) };
}

const pill = "press inline-flex cursor-pointer items-center border border-line bg-card px-4 py-2 text-sm font-medium text-ink-2 peer-checked:border-night peer-checked:bg-night peer-checked:text-on-night peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2";

export default async function PlanPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const input = parse(sp);
  const show = sp.go === "1";
  const [places, events] = show ? await Promise.all([listPlaces(), listEvents()]) : [[], []];
  const plan = show ? buildPlan(places, events, input) : [];
  const empty = show && plan.every((d) => d.stops.length === 0);
  const wk = weekendOffset();

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header>
        <p className="eyebrow mb-2">Trip planner</p>
        <h1 className="font-editorial text-4xl font-semibold tracking-tight sm:text-5xl">พาเที่ยวศรีสะเกษ</h1>
        <p className="mt-3 max-w-xl text-lg text-ink-2">บอกสไตล์ งบ และไปกับใคร เราจัดตารางเที่ยวให้เป็นลำดับเวลา แล้วค่อยปรับตามใจได้</p>
      </header>

      <form method="get" className="surface space-y-6 p-5 sm:p-7">
        <input type="hidden" name="go" value="1" />
        <fieldset>
          <legend className="mb-2 text-sm font-semibold">เที่ยวกี่วัน</legend>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3].map((n) => (
              <label key={n}><input type="radio" name="days" value={n} defaultChecked={input.days === n} className="peer sr-only" /><span className={pill}>{n === 1 ? "วันเดียวจบ" : `${n} วัน`}</span></label>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="mb-2 text-sm font-semibold">เริ่มเที่ยววันไหน</legend>
          <div className="flex flex-wrap gap-2">
            {[{ v: 0, l: "วันนี้" }, { v: 1, l: "พรุ่งนี้" }, ...(wk > 1 ? [{ v: wk, l: `เสาร์นี้ (${dayLabel(wk)})` }] : [])].map((o) => (
              <label key={o.v}><input type="radio" name="from" value={o.v} defaultChecked={input.from === o.v} className="peer sr-only" /><span className={pill}>{o.l}</span></label>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="mb-2 text-sm font-semibold">สไตล์ที่ชอบ <span className="font-normal text-faint">(เลือกได้หลายอย่าง)</span></legend>
          <div className="flex flex-wrap gap-2">
            {VIBES.map((v) => (
              <label key={v.key}><input type="checkbox" name="vibe" value={v.key} defaultChecked={input.vibes.includes(v.key)} className="peer sr-only" /><span className={pill}>{v.label}</span></label>
            ))}
          </div>
        </fieldset>
        <div className="grid gap-6 sm:grid-cols-2">
          <fieldset>
            <legend className="mb-2 text-sm font-semibold">ไปกับใคร</legend>
            <div className="flex flex-wrap gap-2">
              {WHO.map((w) => (
                <label key={w.key}><input type="radio" name="who" value={w.key} defaultChecked={input.who === w.key} className="peer sr-only" /><span className={pill}>{w.label}</span></label>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="mb-2 text-sm font-semibold">งบต่อมื้อ</legend>
            <div className="flex flex-wrap gap-2">
              {BUDGETS.map((b) => (
                <label key={b.v}><input type="radio" name="budget" value={b.v} defaultChecked={input.budget === b.v} className="peer sr-only" /><span className={pill}>{b.label}</span></label>
              ))}
            </div>
          </fieldset>
        </div>
        <button type="submit" className="press inline-flex h-12 items-center gap-2 bg-cta px-7 font-bold text-on-cta hover:bg-cta-2"><Sparkles className="h-4 w-4" /> จัดทริปให้เลย</button>
      </form>

      {show && (
        <section aria-label="แผนเที่ยว" className="space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-editorial text-2xl font-semibold">แผนเที่ยวของคุณ</h2>
            <div className="flex flex-wrap gap-2">
              <Link href={`/plan?${planQuery(input, { seed: input.seed + 1 })}`} className="press inline-flex items-center gap-2 border border-line bg-card px-4 py-2 text-sm font-semibold hover:border-gold"><Shuffle className="h-4 w-4" /> สลับแผนใหม่</Link>
              <ShareButton path={`/plan?${planQuery(input)}`} title="แผนเที่ยวศรีสะเกษ จัดโดย SISE" label="ส่งให้เพื่อน" className="press inline-flex items-center gap-2 bg-night px-4 py-2 text-sm font-semibold text-on-night" />
            </div>
          </div>
          {empty ? (
            <EmptyState icon="pin" title="ยังจัดแผนให้ไม่ได้" hint="ตอนนี้ยังมีสถานที่ในระบบไม่พอ ลองเปลี่ยนสไตล์หรืองบดูนะ" />
          ) : (
            plan.map((day) => (
              <div key={day.n}>
                <h3 className="mb-4 flex items-baseline gap-3 border-b border-line pb-2"><span className="font-editorial text-xl font-semibold">วันที่ {day.n}</span><span className="text-sm text-muted">{dayLabel(day.offset)}</span></h3>
                <ol className="space-y-0">
                  {day.stops.map((s, i) => {
                    const href = s.place ? `/places/${s.place.slug}` : `/events/${s.event!.slug}`;
                    const title = s.place?.name ?? s.event!.title;
                    return (
                      <li key={`${day.n}-${i}`}>
                        {s.mins !== undefined && (
                          <p className="ml-[4.5rem] flex items-center gap-2 py-2 text-xs text-faint"><Car className="h-3.5 w-3.5" /> ขับประมาณ {s.mins >= 60 ? `${Math.floor(s.mins / 60)} ชม. ${s.mins % 60} นาที` : `${s.mins} นาที`} (ราว {s.km} กม.){s.mins >= 60 ? " · เดินทางไกล เผื่อเวลาด้วยนะ" : ""}</p>
                        )}
                        <div className="grid grid-cols-[4rem_1fr] gap-4 sm:gap-5">
                          <div className="pt-3 text-right"><p className="font-editorial text-lg font-semibold leading-none">{s.time}</p><p className="mt-1 text-xs text-muted">{s.slot}</p></div>
                          <Link href={href} className="surface press block border-l-2 border-l-[var(--jade)] p-4 hover:border-gold">
                            <p className="font-editorial text-lg font-semibold">{title}</p>
                            <p className="mt-1 text-sm text-ink-2">{s.why}</p>
                            <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                              {s.place && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {s.place.district}</span>}
                              {s.place && <span>{"฿".repeat(s.place.priceLevel)}</span>}
                              {s.event && <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {s.event.startTime} · {s.event.price}</span>}
                              <span className="inline-flex items-center gap-1 font-semibold text-gold">ดูรายละเอียด <ArrowRight className="h-3 w-3" /></span>
                            </p>
                          </Link>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>
            ))
          )}
          <p className="text-xs text-faint">เวลาและระยะทางเป็นการประมาณ ควรเช็กเวลาเปิด-ปิดของแต่ละที่ก่อนออกเดินทาง ข้อมูลร้านบางส่วนอาจเป็นตัวอย่างระหว่างช่วงทดลอง</p>
        </section>
      )}
    </div>
  );
}
