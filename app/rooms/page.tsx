import type { Metadata } from "next";
import { Flame } from "lucide-react";
import { RoomCard } from "@/components/cards";
import { SectionHeader } from "@/components/ui";
import { ROOM_GROUPS } from "@/lib/data";
import { listRooms } from "@/lib/server/repo";

export const metadata: Metadata = {
  title: "ห้องทั้งหมด — พูดคุยกับคนศรีสะเกษ",
  description: "เลือกห้องที่สนใจ กินอะไรดี คาเฟ่ งาน ธุรกิจ รถ เกษตร ท่องเที่ยว และอื่น ๆ พูดคุยกับคนศรีสะเกษในพื้นที่ของคุณ",
  alternates: { canonical: "/rooms" },
};

export const revalidate = 60;

export default async function RoomsPage() {
  const rooms = await listRooms();
  const trending = rooms.filter((r) => r.trending);
  return (
    <div className="space-y-10">
      <header>
        <p className="eyebrow mb-1">Explore Rooms</p>
        <h1 className="font-editorial text-3xl font-bold sm:text-4xl">ห้องของคนศรีสะเกษ</h1>
        <p className="mt-2 max-w-xl text-muted">เข้าห้องที่ตรงกับเรื่องที่สนใจ ตั้งกระทู้ ถาม ตอบ และติดตามเพื่อให้หน้า &ldquo;สำหรับคุณ&rdquo; รู้ใจขึ้น</p>
      </header>

      <section>
        <SectionHeader eyebrow="Trending" title="ห้องที่กำลังคึกคัก" live />
        <div className="scrollbar-none -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
          {trending.map((r) => (
            <div key={r.id} className="w-[78%] shrink-0 snap-start sm:w-auto"><RoomCard room={r} /></div>
          ))}
        </div>
      </section>

      {ROOM_GROUPS.map((g) => (
        <section key={g.key}>
          <SectionHeader title={g.label} />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {rooms.filter((r) => r.group === g.key).map((r) => <RoomCard key={r.id} room={r} compact />)}
          </div>
        </section>
      ))}

      <p className="flex items-center gap-2 rounded-2xl border border-dashed border-line p-4 text-sm text-muted">
        <Flame className="h-4 w-4 text-gold" /> ยังไม่มีห้องที่ใช่? เร็ว ๆ นี้สมาชิกที่มี SISE Reputation สูงจะเสนอเปิดห้องใหม่ได้
      </p>
    </div>
  );
}
