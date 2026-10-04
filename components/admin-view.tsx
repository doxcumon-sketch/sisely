"use client";

import { AlertTriangle, ArrowUpRight, Check, EyeOff, Flame, ShieldAlert, Star, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Avatar, Chip, cx } from "@/components/ui";
import { BANNED_WORDS, businesses, events, rooms, seedComments, seedReports, userById } from "@/lib/data";
import { formatAge } from "@/lib/format";
import { useAllPosts, useNow } from "@/lib/hooks";
import { trendingScore } from "@/lib/ranking";
import { ageOf } from "@/lib/hooks";
import { useSise } from "@/lib/store";
import type { Report } from "@/lib/types";

const REASON: Record<Report["reason"], string> = { spam: "สแปม", abuse: "คำหยาบ/คุกคาม", scam: "หลอกลวง", misinfo: "ข้อมูลเท็จ", other: "อื่น ๆ" };

function Stat({ label, value, note, icon }: { label: string; value: string | number; note?: string; icon: React.ReactNode }) {
  return (
    <div className="surface p-4">
      <div className="flex items-center justify-between text-muted"><span className="text-sm">{label}</span>{icon}</div>
      <p className="font-editorial mt-1 text-3xl font-bold">{value}</p>
      {note && <p className="text-xs text-muted">{note}</p>}
    </div>
  );
}

export function AdminView() {
  const posts = useAllPosts();
  const now = useNow();
  const myReports = useSise((s) => s.reports);
  const [status, setStatus] = useState<Record<string, Report["status"]>>({});
  const [featured, setFeatured] = useState<string[]>(["p13", "p4"]);
  const [tab, setTab] = useState<"open" | "done">("open");

  const reports = useMemo(() => [...myReports, ...seedReports].map((r) => ({ ...r, status: status[r.id] ?? r.status })), [myReports, status]);
  const shown = reports.filter((r) => (tab === "open" ? r.status === "open" : r.status !== "open"));
  const trending = useMemo(() => [...posts].sort((a, b) => trendingScore(b, ageOf(b, now)) - trendingScore(a, ageOf(a, now))).slice(0, 5), [posts, now]);

  const today = {
    posts: posts.filter((p) => ageOf(p, now) < 1440).length,
    comments: seedComments.filter((c) => c.ageMin < 1440).length,
    activeRooms: new Set(posts.filter((p) => ageOf(p, now) < 1440).map((p) => p.roomSlug)).size,
  };
  const targetLabel = (r: Report) => {
    if (r.targetType === "post") return posts.find((p) => p.id === r.targetId)?.title ?? `โพสต์ ${r.targetId}`;
    if (r.targetType === "comment") return seedComments.find((c) => c.id === r.targetId)?.body.slice(0, 80) ?? `ความเห็น ${r.targetId}`;
    if (r.targetType === "user") return userById(r.targetId)?.name ?? r.targetId;
    return `ประกาศ ${r.targetId}`;
  };
  const targetHref = (r: Report) => (r.targetType === "post" ? `/post/${r.targetId}` : r.targetType === "listing" ? `/market/${r.targetId}` : r.targetType === "user" ? `/u/${userById(r.targetId)?.handle ?? ""}` : undefined);

  return (
    <div className="space-y-8">
      <header>
        <p className="eyebrow mb-1">Admin</p>
        <h1 className="font-editorial text-3xl font-bold">หลังบ้านผู้ดูแล</h1>
        <p className="mt-1 flex items-start gap-2 rounded-xl bg-gold-soft p-3 text-sm text-ink"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-gold" /> ต้นแบบโครงสร้างเท่านั้น: ยังไม่มีระบบล็อกอินผู้ดูแล ก่อนเปิดใช้งานจริงต้องจำกัดสิทธิ์หน้านี้ด้วยบทบาท ADMIN / MODERATOR</p>
      </header>

      <section aria-label="ภาพรวมวันนี้" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="ผู้ใช้ใหม่วันนี้" value={38} note="+12% จากเมื่อวาน" icon={<ArrowUpRight className="h-4 w-4 text-jade" />} />
        <Stat label="โพสต์วันนี้" value={today.posts} icon={<Flame className="h-4 w-4 text-laterite" />} />
        <Stat label="ความเห็นวันนี้" value={today.comments} icon={<Flame className="h-4 w-4 text-gold" />} />
        <Stat label="ห้องที่มีความเคลื่อนไหว" value={`${today.activeRooms}/${rooms.length}`} icon={<Star className="h-4 w-4 text-gold" />} />
        <Stat label="รายงานรอตรวจ" value={reports.filter((r) => r.status === "open").length} icon={<ShieldAlert className="h-4 w-4 text-laterite" />} />
        <Stat label="ธุรกิจใหม่" value={businesses.length} note="รอยืนยัน 1" icon={<Star className="h-4 w-4 text-gold" />} />
        <Stat label="งานใหม่" value={events.length} icon={<Star className="h-4 w-4 text-gold" />} />
        <Stat label="โพสต์รอตรวจ (สแปมอัตโนมัติ)" value={2} note="คำต้องห้าม / ลิงก์ซ้ำ" icon={<EyeOff className="h-4 w-4 text-muted" />} />
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
              {shown.map((r) => {
                const reporter = userById(r.reporterId);
                const href = targetHref(r);
                return (
                  <li key={r.id} className="surface p-4">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="rounded-full bg-laterite-soft px-2.5 py-0.5 font-semibold text-laterite">{REASON[r.reason]}</span>
                      <span className="rounded-full bg-paper-2 px-2.5 py-0.5 text-muted">{r.targetType}</span>
                      <span className="text-muted">{formatAge(r.ageMin)}</span>
                      {r.status !== "open" && <span className="font-semibold text-jade">{r.status === "resolved" ? "ดำเนินการแล้ว" : "ยกเลิกรายงาน"}</span>}
                    </div>
                    <p className="mt-2 line-clamp-2 font-medium">{href ? <Link href={href} className="hover:text-gold">{targetLabel(r)}</Link> : targetLabel(r)}</p>
                    {r.note && <p className="mt-1 text-sm text-muted">หมายเหตุ: {r.note}</p>}
                    <p className="mt-2 flex items-center gap-2 text-xs text-muted">{reporter && <Avatar name={reporter.name} tone={reporter.tone} size={20} />} รายงานโดย {reporter?.name ?? "ผู้ใช้"}</p>
                    {r.status === "open" && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button type="button" onClick={() => setStatus((s) => ({ ...s, [r.id]: "resolved" }))} className="press inline-flex items-center gap-1.5 rounded-full bg-night px-4 py-2 text-sm font-semibold text-on-night"><EyeOff className="h-4 w-4" /> ซ่อนเนื้อหา</button>
                        <button type="button" onClick={() => setStatus((s) => ({ ...s, [r.id]: "resolved" }))} className="press inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm font-semibold"><Check className="h-4 w-4" /> เตือนผู้ใช้</button>
                        <button type="button" onClick={() => setStatus((s) => ({ ...s, [r.id]: "dismissed" }))} className="press inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm text-muted"><X className="h-4 w-4" /> ไม่พบการละเมิด</button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <aside className="space-y-6">
          <section className="surface p-4">
            <h2 className="font-editorial mb-2 text-lg font-semibold">กำลังเป็นกระแส</h2>
            <ol className="space-y-2 text-sm">
              {trending.map((p, i) => (
                <li key={p.id} className="flex items-start gap-2"><span className="w-5 shrink-0 font-bold text-gold">{i + 1}</span><span className="min-w-0 flex-1"><Link href={`/post/${p.id}`} className="line-clamp-1 hover:text-gold">{p.title}</Link></span>
                  <button type="button" onClick={() => setFeatured((f) => (f.includes(p.id) ? f.filter((x) => x !== p.id) : [...f, p.id]))} className={cx("press shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold", featured.includes(p.id) ? "bg-gold text-night" : "border border-line text-muted")}>{featured.includes(p.id) ? "เด่นแล้ว" : "ปักเด่น"}</button>
                </li>
              ))}
            </ol>
          </section>
          <section className="surface p-4">
            <h2 className="font-editorial mb-2 text-lg font-semibold">ระบบป้องกันสแปม</h2>
            <ul className="space-y-1.5 text-sm text-ink-2">
              <li>• จำกัด 5 โพสต์ / 10 นาที, 6 ความเห็น / นาที</li>
              <li>• ตรวจโพสต์ซ้ำ (fingerprint ของหัวข้อ+เนื้อหา)</li>
              <li>• จำกัดลิงก์ไม่เกิน 2 ต่อโพสต์ / ห้ามตัวพิมพ์ใหญ่ล้วน</li>
              <li>• ผู้ใช้ใหม่เกิน 3 รายงานภายใน 24 ชม. → เข้าคิวตรวจอัตโนมัติ</li>
            </ul>
            <p className="mb-1 mt-3 text-xs font-semibold text-muted">คำต้องห้าม ({BANNED_WORDS.length})</p>
            <div className="flex flex-wrap gap-1.5">{BANNED_WORDS.map((w) => <span key={w} className="rounded-full bg-laterite-soft px-2.5 py-0.5 text-xs text-laterite">{w}</span>)}</div>
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
