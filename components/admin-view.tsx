"use client";

import { ArrowUpRight, Check, EyeOff, Flame, ShieldAlert, Star, UserX, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "@/components/toast";
import { Chip, cx } from "@/components/ui";
import { formatAge } from "@/lib/format";
import { api } from "@/lib/store";
import type { Post } from "@/lib/types";

const REASON: Record<string, string> = { spam: "สแปม", abuse: "คำหยาบ/คุกคาม", scam: "หลอกลวง", misinfo: "ข้อมูลเท็จ", other: "อื่น ๆ" };

interface Overview {
  stats: { usersToday: number; postsToday: number; commentsToday: number; activeRooms: number; roomCount: number; reportsOpen: number; businessesNew: number; eventsNew: number; pending: number };
  trending: Post[];
  queue: { id: string; targetType: string; targetId: string; reason: string; note?: string; status: "OPEN" | "RESOLVED" | "DISMISSED"; label: string; href?: string; hidden: boolean; ageMin: number; reporter: { name: string; handle: string } }[];
}

function Stat({ label, value, note, icon }: { label: string; value: string | number; note?: string; icon: React.ReactNode }) {
  return (
    <div className="surface p-4">
      <div className="flex items-center justify-between text-muted"><span className="text-sm">{label}</span>{icon}</div>
      <p className="font-editorial mt-1 text-3xl font-bold">{value}</p>
      {note && <p className="text-xs text-muted">{note}</p>}
    </div>
  );
}

export function AdminView({ overview, role, bannedWords }: { overview: Overview; role: "MEMBER" | "MODERATOR" | "ADMIN"; bannedWords: string[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<"open" | "done">("open");
  const [busy, setBusy] = useState<string | null>(null);
  const { stats, trending, queue } = overview;
  const shown = queue.filter((r) => (tab === "open" ? r.status === "OPEN" : r.status !== "OPEN"));

  const act = async (id: string, action: "HIDE" | "WARN" | "DISMISS" | "SUSPEND") => {
    if (action === "SUSPEND" && !window.confirm("ระงับบัญชีผู้ใช้นี้?")) return;
    setBusy(id);
    const r = await api(`/api/admin/reports/${id}`, "POST", { action });
    setBusy(null);
    if (!r.ok) return toast(r.error);
    toast("ดำเนินการแล้ว");
    router.refresh();
  };
  const feature = async (p: Post) => {
    const r = await api(`/api/admin/posts/${p.id}`, "POST", { featured: !p.featured });
    if (!r.ok) return toast(r.error);
    toast(p.featured ? "เลิกปักเด่นแล้ว" : "ปักเด่นแล้ว");
    router.refresh();
  };

  return (
    <div className="space-y-8">
      <header>
        <p className="eyebrow mb-1">Admin · {role}</p>
        <h1 className="font-editorial text-3xl font-bold">หลังบ้านผู้ดูแล</h1>
      </header>

      <section aria-label="ภาพรวม 24 ชั่วโมงล่าสุด" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="ผู้ใช้ใหม่ (24 ชม.)" value={stats.usersToday} icon={<ArrowUpRight className="h-4 w-4 text-jade" />} />
        <Stat label="โพสต์ (24 ชม.)" value={stats.postsToday} icon={<Flame className="h-4 w-4 text-laterite" />} />
        <Stat label="ความเห็น (24 ชม.)" value={stats.commentsToday} icon={<Flame className="h-4 w-4 text-gold" />} />
        <Stat label="ห้องที่มีความเคลื่อนไหว" value={`${stats.activeRooms}/${stats.roomCount}`} icon={<Star className="h-4 w-4 text-gold" />} />
        <Stat label="รายงานรอตรวจ" value={stats.reportsOpen} icon={<ShieldAlert className="h-4 w-4 text-laterite" />} />
        <Stat label="ธุรกิจใหม่ (30 วัน)" value={stats.businessesNew} icon={<Star className="h-4 w-4 text-gold" />} />
        <Stat label="งานที่กำลังจะมี" value={stats.eventsNew} icon={<Star className="h-4 w-4 text-gold" />} />
        <Stat label="โพสต์รอตรวจ" value={stats.pending} note="ถูกกันไว้โดยระบบอัตโนมัติ" icon={<EyeOff className="h-4 w-4 text-muted" />} />
      </section>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <section aria-label="คิวตรวจสอบ" className="min-w-0">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-editorial text-xl font-semibold">คิวตรวจสอบเนื้อหา</h2>
            <div className="flex gap-2"><Chip active={tab === "open"} onClick={() => setTab("open")}>รอตรวจ</Chip><Chip active={tab === "done"} onClick={() => setTab("done")}>ปิดแล้ว</Chip></div>
          </div>
          {shown.length === 0 ? (
            <p className="surface-flat p-8 text-center text-muted">ไม่มีรายการ ชุมชนสงบสุขดี</p>
          ) : (
            <ul className="space-y-3">
              {shown.map((r) => (
                <li key={r.id} className="surface p-4">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-full bg-laterite-soft px-2.5 py-0.5 font-semibold text-laterite">{REASON[r.reason] ?? r.reason}</span>
                    <span className="rounded-full bg-paper-2 px-2.5 py-0.5 text-muted">{r.targetType}</span>
                    <span className="text-muted">{formatAge(r.ageMin)}</span>
                    {r.hidden && <span className="font-semibold text-jade">ซ่อนแล้ว</span>}
                    {r.status !== "OPEN" && <span className="font-semibold text-jade">{r.status === "RESOLVED" ? "ดำเนินการแล้ว" : "ไม่พบการละเมิด"}</span>}
                  </div>
                  <p className="mt-2 line-clamp-2 break-words font-medium">{r.href ? <Link href={r.href} className="hover:text-gold">{r.label}</Link> : r.label}</p>
                  {r.note && <p className="mt-1 text-sm text-muted">หมายเหตุ: {r.note}</p>}
                  <p className="mt-2 text-xs text-muted">รายงานโดย {r.reporter.name} (@{r.reporter.handle})</p>
                  {r.status === "OPEN" && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button type="button" disabled={busy === r.id} onClick={() => act(r.id, "HIDE")} className="press inline-flex items-center gap-1.5 rounded-full bg-night px-4 py-2 text-sm font-semibold text-on-night disabled:opacity-50"><EyeOff className="h-4 w-4" /> ซ่อนเนื้อหา</button>
                      <button type="button" disabled={busy === r.id} onClick={() => act(r.id, "WARN")} className="press inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm font-semibold disabled:opacity-50"><Check className="h-4 w-4" /> เตือนผู้ใช้</button>
                      {role === "ADMIN" && <button type="button" disabled={busy === r.id} onClick={() => act(r.id, "SUSPEND")} className="press inline-flex items-center gap-1.5 rounded-full border border-laterite/40 px-4 py-2 text-sm font-semibold text-laterite disabled:opacity-50"><UserX className="h-4 w-4" /> ระงับบัญชี</button>}
                      <button type="button" disabled={busy === r.id} onClick={() => act(r.id, "DISMISS")} className="press inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm text-muted disabled:opacity-50"><X className="h-4 w-4" /> ไม่พบการละเมิด</button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className="space-y-6">
          <section className="surface p-4">
            <h2 className="font-editorial mb-2 text-lg font-semibold">กำลังเป็นกระแส</h2>
            <ol className="space-y-2 text-sm">
              {trending.map((p, i) => (
                <li key={p.id} className="flex items-start gap-2"><span className="w-5 shrink-0 font-bold text-gold">{i + 1}</span><span className="min-w-0 flex-1"><Link href={`/post/${p.id}`} className="line-clamp-1 hover:text-gold">{p.title}</Link></span>
                  <button type="button" onClick={() => feature(p)} className={cx("press shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold", p.featured ? "bg-gold text-night" : "border border-line text-muted")}>{p.featured ? "เด่นแล้ว" : "ปักเด่น"}</button>
                </li>
              ))}
            </ol>
          </section>
          <section className="surface p-4">
            <h2 className="font-editorial mb-2 text-lg font-semibold">ระบบป้องกันสแปม</h2>
            <ul className="space-y-1.5 text-sm text-ink-2">
              <li>• จำกัด 5 โพสต์ / 10 นาที, 6 ความเห็น / นาที (ต่อบัญชี)</li>
              <li>• ตรวจโพสต์ซ้ำ (ตัวเอง = ปฏิเสธ, ซ้ำกับผู้อื่น = รอตรวจ)</li>
              <li>• บัญชีใหม่ (&lt; 24 ชม.) ที่ใส่ลิงก์ = รอตรวจ</li>
              <li>• ถูกรายงาน 3 ราย = ระบบกันโพสต์ไว้รอตรวจอัตโนมัติ</li>
              <li>• จำกัดลิงก์ 2 ต่อโพสต์ / ห้ามพิมพ์ใหญ่ล้วน</li>
            </ul>
            <p className="mb-1 mt-3 text-xs font-semibold text-muted">คำต้องห้าม ({bannedWords.length})</p>
            <div className="flex flex-wrap gap-1.5">{bannedWords.map((w) => <span key={w} className="rounded-full bg-laterite-soft px-2.5 py-0.5 text-xs text-laterite">{w}</span>)}</div>
          </section>
          <section className="surface p-4 text-sm">
            <h2 className="font-editorial mb-2 text-lg font-semibold">โมเดลรายได้ (เตรียมโครงสร้าง)</h2>
            <p className="text-muted">เปิดทีละอย่างเมื่อชุมชนพร้อม: Featured business/event · Sponsored post · Pro subscription · Event/Marketplace promotion · Booking commission</p>
          </section>
        </aside>
      </div>
    </div>
  );
}
