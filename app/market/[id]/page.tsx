import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Eye, MapPin, MessageCircle } from "lucide-react";
import { SaveButton } from "@/components/buttons";
import { ListingCard } from "@/components/cards";
import { ReportMenu } from "@/components/report-menu";
import { ShareButton } from "@/components/share";
import { Avatar, Cover, SectionHeader } from "@/components/ui";
import { CONDITION_LABEL, LISTING_CATEGORIES } from "@/lib/data";
import { getListing, listListings } from "@/lib/server/repo";
import { formatAge, formatBaht } from "@/lib/format";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const found = await getListing(id);
  if (!found) return {};
  const l = found.listing;
  return { title: `${l.title} — ${formatBaht(l.price)} ศรีสะเกษ`, description: l.description.slice(0, 150), alternates: { canonical: `/market/${l.id}` } };
}

export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const found = await getListing(id);
  if (!found) notFound();
  const l = found.listing;
  const seller = found.seller;
  const more = (await listListings(l.category)).filter((x) => x.id !== l.id).slice(0, 4);
  const cat = LISTING_CATEGORIES.find((c) => c.key === l.category)?.label;

  return (
    <div className="space-y-8">
      <nav aria-label="breadcrumb" className="text-sm text-muted"><Link href="/market" className="hover:text-ink">ซื้อขาย</Link> / <Link href={`/market?cat=${l.category}`} className="hover:text-ink">{cat}</Link></nav>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <Cover tone={l.tone} icon="market" className="aspect-square w-full rounded-3xl lg:sticky lg:top-24 lg:self-start" />
        <div className="space-y-5">
          <div>
            {l.promoted && <span className="mb-2 inline-block rounded-sm bg-gold px-3 py-0.5 text-xs font-bold text-night">โปรโมต</span>}
            <h1 className="font-editorial text-2xl font-bold leading-snug sm:text-3xl">{l.title}</h1>
            <p className="font-editorial mt-2 text-3xl font-bold text-ink">{formatBaht(l.price)}{l.negotiable && <span className="ml-2 text-sm font-normal text-muted">ต่อรองได้</span>}</p>
            <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
              <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" /> {l.location}</span>
              <span>{formatAge(l.ageMin)}</span>
              <span className="inline-flex items-center gap-1"><Eye className="h-4 w-4" /> {l.views.toLocaleString("en-US")}</span>
            </p>
          </div>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div className="surface-flat p-3"><dt className="text-muted">หมวด</dt><dd className="font-semibold">{cat}</dd></div>
            <div className="surface-flat p-3"><dt className="text-muted">สภาพ</dt><dd className="font-semibold">{CONDITION_LABEL[l.condition]}</dd></div>
          </dl>
          <section><h2 className="font-editorial mb-1 text-lg font-semibold">รายละเอียด</h2><p className="leading-[1.8] text-ink-2">{l.description}</p></section>
          {seller && (
            <section className="surface flex items-center gap-3 p-4">
              <Avatar name={seller.name} tone={seller.tone} size={48} />
              <div className="min-w-0 flex-1"><Link href={`/u/${seller.handle}`} className="font-semibold hover:underline">{seller.name}</Link><p className="text-sm text-muted">{seller.area} · เป็นสมาชิก {seller.joinedDays} วัน</p></div>
              <span className="rounded-sm bg-jade-soft px-2.5 py-1 text-xs font-semibold text-jade">คะแนน {seller.reputation}</span>
            </section>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <a href="#contact" className="press inline-flex flex-1 items-center justify-center gap-2 rounded-sm bg-night px-6 py-3.5 font-semibold text-on-night"><MessageCircle className="h-5 w-5" /> ติดต่อผู้ขาย</a>
            <SaveButton kind="listings" id={l.id} />
            <ShareButton path={`/market/${l.id}`} title={l.title} className="press rounded-sm border border-line p-3 hover:border-gold" label="" />
            <ReportMenu targetType="listing" targetId={l.id} authorId={l.sellerId} authorName={seller?.name} />
          </div>
          <p id="contact" className="scroll-mt-24 rounded-2xl bg-gold-soft p-4 text-sm"><b>ช่องทางติดต่อ:</b> {l.contact}<br /><span className="text-muted">อย่าโอนเงินก่อนเห็นสินค้า และนัดรับในที่สาธารณะ</span></p>
        </div>
      </div>
      {more.length > 0 && <section><SectionHeader title="สินค้าที่คล้ายกัน" /><div className="grid grid-cols-2 gap-4 md:grid-cols-4">{more.map((x) => <ListingCard key={x.id} listing={x} sellerName={x.sellerName} />)}</div></section>}
    </div>
  );
}
