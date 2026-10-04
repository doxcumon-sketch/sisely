import type { Metadata } from "next";
import { PlaceCard } from "@/components/cards";
import { RoomIcon } from "@/components/icons";
import { Chip, EmptyState } from "@/components/ui";
import { PLACE_CATEGORIES } from "@/lib/data";
import { listPlaces } from "@/lib/server/repo";

export const metadata: Metadata = {
  title: "สถานที่ในศรีสะเกษ — ร้านอาหาร คาเฟ่ ที่เที่ยว ที่พัก",
  description: "รวมร้านอาหารศรีสะเกษ คาเฟ่ศรีสะเกษ ที่เที่ยว ที่พัก และร้านค้า พร้อมสิ่งที่คนในพื้นที่พูดถึง",
  alternates: { canonical: "/places" },
};

export const revalidate = 60;

export default async function PlacesPage({ searchParams }: { searchParams: Promise<{ cat?: string }> }) {
  const { cat } = await searchParams;
  const active = PLACE_CATEGORIES.find((c) => c.key === cat)?.key;
  const list = await listPlaces(active);

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow mb-1">Places</p>
        <h1 className="font-editorial text-3xl font-bold sm:text-4xl">สถานที่ในศรีสะเกษ</h1>
        <p className="mt-2 max-w-xl text-muted">ไม่ใช่แค่ที่อยู่และเบอร์โทร แต่คือสิ่งที่คนในพื้นที่พูดถึง รูป ดีล งาน และคำถามที่เกี่ยวข้องกับที่นั่น</p>
      </header>
      <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        <Chip href="/places" active={!active}>ทั้งหมด</Chip>
        {PLACE_CATEGORIES.map((c) => (
          <Chip key={c.key} href={`/places?cat=${c.key}`} active={active === c.key}><RoomIcon name={c.icon} className="h-4 w-4" /> {c.label}</Chip>
        ))}
      </div>
      {list.length === 0 ? (
        <EmptyState icon="pin" title="ยังไม่มีสถานที่ในหมวดนี้" hint="เร็ว ๆ นี้จะเพิ่มมากขึ้น หรือแนะนำสถานที่ได้ในห้องที่เกี่ยวข้อง" />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((p) => <PlaceCard key={p.id} place={p} />)}
        </div>
      )}
    </div>
  );
}
