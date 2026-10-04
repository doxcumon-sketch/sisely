import type { Metadata } from "next";
import { ListingCard } from "@/components/cards";
import { Chip } from "@/components/ui";
import { LISTING_CATEGORIES } from "@/lib/data";
import { listListings } from "@/lib/server/repo";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "ซื้อขายในศรีสะเกษ — ของมือสอง รถ สินค้าท้องถิ่น เกษตร",
  description: "ตลาดซื้อขายของคนศรีสะเกษ มือถือ รถ มอเตอร์ไซค์ เฟอร์นิเจอร์ ผ้าไหม ทุเรียน หอมแดง และบริการ ติดต่อผู้ขายได้โดยตรง",
  alternates: { canonical: "/market" },
};

export const revalidate = 60;

export default async function MarketPage({ searchParams }: { searchParams: Promise<{ cat?: string }> }) {
  const { cat } = await searchParams;
  const active = LISTING_CATEGORIES.find((c) => c.key === cat)?.key;
  const list = await listListings(active);
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow mb-1">Local Marketplace</p>
          <h1 className="font-editorial text-3xl font-bold sm:text-4xl">ซื้อขายในเมืองเรา</h1>
          <p className="mt-2 max-w-xl text-muted">ของมือสอง สินค้าท้องถิ่น และบริการ จากคนในพื้นที่ นัดรับที่สาธารณะเสมอ</p>
        </div>
        <Link href="/create?type=marketplace&room=market" className="press rounded-sm bg-night px-6 py-3 font-semibold text-on-night">+ ลงขาย</Link>
      </header>
      <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        <Chip href="/market" active={!active}>ทั้งหมด</Chip>
        {LISTING_CATEGORIES.map((c) => <Chip key={c.key} href={`/market?cat=${c.key}`} active={active === c.key}>{c.label}</Chip>)}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
        {list.map((l) => <ListingCard key={l.id} listing={l} sellerName={l.sellerName} />)}
      </div>
      <p className="flex items-start gap-2 rounded-2xl bg-jade-soft p-4 text-sm text-jade"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" /> เพื่อความปลอดภัย: ตรวจของก่อนโอนเงิน นัดรับในที่สาธารณะ และกดรายงานเมื่อพบประกาศน่าสงสัย</p>
    </div>
  );
}
