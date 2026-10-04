import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, Clock, MapPin, Phone } from "lucide-react";
import { FollowButton } from "@/components/buttons";
import { DealCard } from "@/components/cards";
import { Feed } from "@/components/feed";
import { Cover, SectionHeader } from "@/components/ui";
import { PLAN_LABEL } from "@/lib/data";
import { getBusiness, listDeals, queryPosts } from "@/lib/server/repo";
import { formatCount } from "@/lib/format";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const b = await getBusiness(slug);
  if (!b) return {};
  return { title: `${b.name} — ${b.category} ศรีสะเกษ`, description: `${b.tagline} ${b.description.slice(0, 110)}`, alternates: { canonical: `/business/${b.slug}` } };
}

export default async function BusinessPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const b = await getBusiness(slug);
  if (!b) notFound();
  const [deals, initialPosts] = await Promise.all([listDeals(), b.placeSlug ? queryPosts({ mode: "new", placeSlug: b.placeSlug, limit: 3 }) : null]);
  const bDeals = deals.filter((d) => d.businessSlug === b.slug || (b.placeSlug && d.placeSlug === b.placeSlug));

  return (
    <div className="space-y-8">
      <header className="surface overflow-hidden">
        <Cover tone={b.tone} icon="business" className="h-36 sm:h-52" />
        <div className="px-5 pb-6 sm:px-8">
          <div className="-mt-10 flex items-end justify-between gap-3">
            <span className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-card bg-night font-editorial text-3xl font-bold text-gold">{b.name.slice(0, 1)}</span>
            <FollowButton kind="places" id={b.slug} />
          </div>
          <h1 className="font-editorial mt-3 flex flex-wrap items-center gap-2 text-2xl font-bold sm:text-3xl">{b.name} {b.verified && <BadgeCheck className="h-6 w-6 text-jade" aria-label="ยืนยันตัวตนแล้ว" />}</h1>
          <p className="text-muted">{b.tagline}</p>
          <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
            <span>{b.category}</span><span>{formatCount(b.followers)} ผู้ติดตาม</span><span>{b.mentions} ครั้งที่ถูกพูดถึง</span>
            <span className="rounded-full bg-gold-soft px-2.5 py-0.5 text-xs font-semibold text-[#7a5a14] dark:text-gold">แพ็กเกจ {PLAN_LABEL[b.plan]}</span>
          </p>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-8">
          <section><h2 className="font-editorial mb-2 text-xl font-semibold">เกี่ยวกับธุรกิจ</h2><p className="leading-[1.85] text-ink-2">{b.description}</p></section>
          <section>
            <SectionHeader title="สินค้าและบริการ" />
            <ul className="surface divide-y divide-line-soft overflow-hidden">
              {b.offerings.map((o) => <li key={o.name} className="flex items-center justify-between gap-4 p-4"><span><b className="block">{o.name}</b><span className="text-sm text-muted">{o.note}</span></span><span className="shrink-0 font-semibold">{o.price}</span></li>)}
            </ul>
          </section>
          {bDeals.length > 0 && <section><SectionHeader title="โปรโมชัน" href="/deals" /><div className="space-y-3">{bDeals.map((d) => <DealCard key={d.id} deal={d} />)}</div></section>}
          {b.placeSlug && <section><SectionHeader eyebrow="Community" title="คนพูดถึงธุรกิจนี้" /><Feed filter={{ mode: "new", placeSlug: b.placeSlug }} initial={initialPosts ?? undefined} pageSize={3} emptyTitle="ยังไม่มีใครพูดถึง" /></section>}
        </div>
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <section className="surface space-y-3 p-5 text-[0.95rem]">
            <p className="flex gap-3"><MapPin className="mt-0.5 h-5 w-5 shrink-0 text-laterite" /> {b.address}</p>
            <p className="flex gap-3"><Phone className="mt-0.5 h-5 w-5 shrink-0 text-gold" /> <a href={`tel:${b.phone.replace(/-/g, "")}`} className="font-medium hover:underline">{b.phone}</a></p>
            <p className="flex gap-3"><Clock className="mt-0.5 h-5 w-5 shrink-0 text-gold" /> {b.hours}</p>
            {b.line && <p className="text-sm text-muted">LINE: {b.line}</p>}
          </section>
          {b.placeSlug && <Link href={`/places/${b.placeSlug}`} className="surface press block p-5 font-semibold text-gold">ดูหน้าสถานที่ →</Link>}
          <p className="rounded-2xl border border-dashed border-line p-4 text-xs text-muted">เจ้าของธุรกิจ: แพ็กเกจฟรีมีโปรไฟล์ ดีล 2 รายการต่อเดือน อัปเกรดเป็น Pro เพื่อโปรโมต สถิติ และไม่จำกัดดีล</p>
        </aside>
      </div>
    </div>
  );
}
