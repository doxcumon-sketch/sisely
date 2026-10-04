import type { Metadata } from "next";
import { DealCard } from "@/components/cards";
import { SectionHeader } from "@/components/ui";
import { deals } from "@/lib/data";

export const metadata: Metadata = {
  title: "ดีลวันนี้ในศรีสะเกษ — ส่วนลดจากร้านท้องถิ่น",
  description: "รวมดีลและโปรโมชันจากร้านอาหาร คาเฟ่ ที่พัก และร้านค้าในศรีสะเกษ ใช้ได้จริง ไม่รบกวน",
  alternates: { canonical: "/deals" },
};

export default function DealsPage() {
  const ending = [...deals].sort((a, b) => a.endsInHours - b.endsInHours);
  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow mb-1">Deals</p>
        <h1 className="font-editorial text-3xl font-bold sm:text-4xl">ดีลจากร้านในเมือง</h1>
        <p className="mt-2 max-w-xl text-muted">โปรโมชันจริงจากร้านท้องถิ่น แสดงเมื่อมีประโยชน์กับคุณ ไม่ยัดโฆษณาในฟีด</p>
      </header>
      <section>
        <SectionHeader eyebrow="Ending soon" title="ใกล้หมดเวลา" live />
        <div className="grid gap-4 md:grid-cols-2">{ending.slice(0, 2).map((d) => <DealCard key={d.id} deal={d} />)}</div>
      </section>
      <section>
        <SectionHeader title="ดีลทั้งหมด" />
        <div className="grid gap-4 md:grid-cols-2">{ending.map((d) => <DealCard key={d.id} deal={d} />)}</div>
      </section>
      <p className="rounded-2xl border border-dashed border-line p-4 text-sm text-muted">เป็นเจ้าของร้าน? สร้างดีลฟรีได้เดือนละ 2 รายการ แพ็กเกจ Pro เพิ่มดีลไม่จำกัดและสถิติการเข้าชม</p>
    </div>
  );
}
