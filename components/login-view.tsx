"use client";

import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Wordmark } from "@/components/app-shell";

const ERRORS: Record<string, string> = {
  not_configured: "ยังไม่ได้ตั้งค่า LINE Login ของเว็บนี้",
  cancelled: "ยกเลิกการเข้าสู่ระบบแล้ว",
  expired: "ลิงก์เข้าสู่ระบบหมดอายุ ลองใหม่อีกครั้ง",
  state: "ตรวจสอบความปลอดภัยไม่ผ่าน ลองใหม่อีกครั้ง",
  failed: "เข้าสู่ระบบไม่สำเร็จ ลองใหม่อีกครั้ง",
  suspended: "บัญชีนี้ถูกระงับการใช้งาน",
};

export function LoginView({ returnTo, error, line, dev }: { returnTo: string; error?: string; line: boolean; dev: boolean }) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const devLogin = async () => {
    setBusy(true);
    const res = await fetch("/api/auth/dev", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name, returnTo }) });
    if (res.ok) window.location.assign(returnTo);
    else setBusy(false);
  };

  return (
    <div className="mx-auto max-w-md py-10">
      <div className="surface p-7 text-center sm:p-9">
        <Wordmark className="text-4xl" />
        <h1 className="font-editorial mt-5 text-2xl font-bold">เข้าร่วมพื้นที่ของคนศรีสะเกษ</h1>
        <p className="mt-2 text-muted">ล็อกอินเพื่อโพสต์ ตอบ บันทึก และติดตามห้องที่คุณสนใจ</p>

        {error && <p role="alert" className="mt-5 rounded-xl bg-laterite-soft p-3 text-sm text-laterite">{ERRORS[error] ?? ERRORS.failed}</p>}

        <a
          href={line ? `/api/auth/line?returnTo=${encodeURIComponent(returnTo)}` : undefined}
          aria-disabled={!line}
          className={`press mt-6 flex items-center justify-center gap-3 rounded-full bg-[#06c755] px-6 py-4 text-[1.05rem] font-semibold text-white ${line ? "" : "pointer-events-none opacity-50"}`}
        >
          <MessageCircle className="h-5 w-5" /> เข้าสู่ระบบด้วย LINE
        </a>
        {!line && <p className="mt-2 text-xs text-muted">LINE Login ยังไม่ได้ตั้งค่า (เจ้าของเว็บต้องใส่ LINE_CHANNEL_ID / LINE_CHANNEL_SECRET)</p>}

        {dev && (
          <div className="mt-6 border-t border-line pt-5 text-left">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gold">โหมดทดลอง (ปิดอยู่บนเว็บจริง)</p>
            <label htmlFor="devname" className="sr-only">ชื่อที่แสดง</label>
            <input id="devname" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} placeholder="ชื่อที่แสดง" className="w-full rounded-xl border border-line bg-paper px-4 py-3 text-[1rem] outline-none focus:border-gold" />
            <button type="button" onClick={devLogin} disabled={busy} className="press mt-2 w-full rounded-full border border-line py-3 font-semibold hover:border-gold disabled:opacity-50">เข้าแบบทดลอง</button>
          </div>
        )}

        <p className="mt-6 text-xs leading-relaxed text-muted">
          เราเก็บเฉพาะชื่อและรูปโปรไฟล์จาก LINE เพื่อแสดงในโพสต์ของคุณ ไม่เห็นรหัสผ่านหรือข้อความใน LINE ของคุณ
        </p>
      </div>
      <p className="mt-4 text-center text-sm"><Link href="/" className="text-muted hover:text-ink">← กลับไปเดินเล่นก่อน</Link></p>
    </div>
  );
}
