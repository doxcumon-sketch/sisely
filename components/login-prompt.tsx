"use client";

import { MessageCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { Sheet } from "@/components/sheet";
import { actions, useSise } from "@/lib/store";

/** Opens whenever a signed-out visitor tries to act (like, comment, follow…). They keep their place on the page. */
export function LoginPrompt() {
  const open = useSise((s) => s.loginPrompt);
  const pathname = usePathname();
  return (
    <Sheet open={open} onClose={() => actions.closeLoginPrompt()} title="มาแจมกับคนศรีสะเกษ">
      <p className="mb-4 text-muted">ล็อกอินด้วย LINE แป๊บเดียว เพื่อโพสต์ ตอบ บันทึก และติดตามห้องที่คุณสนใจ</p>
      <a href={`/api/auth/line?returnTo=${encodeURIComponent(pathname || "/")}`} className="press flex items-center justify-center gap-3 rounded-sm bg-[#06c755] px-6 py-3.5 font-semibold text-white">
        <MessageCircle className="h-5 w-5" /> เข้าสู่ระบบด้วย LINE
      </a>
      <p className="mt-3 text-center text-xs text-muted">เราเก็บเฉพาะชื่อและรูปโปรไฟล์จาก LINE</p>
    </Sheet>
  );
}
