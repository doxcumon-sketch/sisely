import Link from "next/link";
import { WifiOff } from "lucide-react";

export const metadata = { title: "ออฟไลน์", robots: { index: false } };

export default function OfflinePage() {
  return (
    <div className="mx-auto max-w-md py-20 text-center">
      <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-sm bg-gold-soft text-gold"><WifiOff className="h-7 w-7" /></span>
      <h1 className="font-editorial text-2xl font-bold">ตอนนี้ไม่มีสัญญาณอินเทอร์เน็ต</h1>
      <p className="mt-2 text-muted">ลองตรวจสอบการเชื่อมต่อ แล้วกลับมาที่ SISE อีกครั้ง</p>
      <Link href="/" className="press mt-6 inline-block rounded-sm bg-night px-6 py-3 font-semibold text-on-night">ลองอีกครั้ง</Link>
    </div>
  );
}
