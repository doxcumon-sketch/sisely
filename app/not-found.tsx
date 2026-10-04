import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md py-20 text-center">
      <p className="font-editorial text-gold-gradient text-6xl font-bold">404</p>
      <h1 className="font-editorial mt-2 text-2xl font-bold">ไม่พบหน้าที่ตามหา</h1>
      <p className="mt-2 text-muted">ลิงก์อาจเปลี่ยนไป หรือหน้านี้ถูกลบแล้ว ลองค้นหาหรือกลับไปเดินเล่นที่หน้าแรก</p>
      <div className="mt-6 flex justify-center gap-2">
        <Link href="/" className="press rounded-sm bg-night px-6 py-3 font-semibold text-on-night">หน้าแรก</Link>
        <Link href="/search" className="press rounded-sm border border-line px-6 py-3 font-semibold">ค้นหา</Link>
      </div>
    </div>
  );
}
