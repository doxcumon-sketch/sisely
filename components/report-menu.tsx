"use client";

import { Ban, Flag, MoreHorizontal, VolumeX } from "lucide-react";
import { useState } from "react";
import { Sheet } from "@/components/sheet";
import { toast } from "@/components/toast";
import { actions, requireLogin, useSise } from "@/lib/store";

type Reason = "spam" | "abuse" | "scam" | "misinfo" | "other";
type TargetType = "post" | "comment" | "user" | "listing";

const REASONS: { key: Reason; label: string; hint: string }[] = [
  { key: "spam", label: "สแปมหรือโฆษณาซ้ำ ๆ", hint: "โพสต์ซ้ำ ลิงก์แปลก ๆ" },
  { key: "scam", label: "หลอกลวง / มิจฉาชีพ", hint: "ขายของไม่ตรงปก ขอโอนเงินก่อน" },
  { key: "abuse", label: "คำหยาบ ล่วงละเมิด หรือคุกคาม", hint: "ด่าทอ ใช้ถ้อยคำรุนแรง" },
  { key: "misinfo", label: "ข้อมูลเท็จ", hint: "ข่าวที่ยังไม่ยืนยัน" },
  { key: "other", label: "เหตุผลอื่น", hint: "บอกเราในช่องหมายเหตุ" },
];

/** ⋯ menu for any post / comment / listing: report, mute, block. */
export function ReportMenu({
  targetType,
  targetId,
  authorId,
  authorName,
}: {
  targetType: TargetType;
  targetId: string;
  authorId?: string;
  authorName?: string;
}) {
  const [menu, setMenu] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [reason, setReason] = useState<Reason>("spam");
  const [note, setNote] = useState("");
  const myId = useSise((st) => st.me?.id);
  const own = !!authorId && authorId === myId;

  const submit = async () => {
    const ok = await actions.report({ targetType: targetType.toUpperCase() as "POST" | "COMMENT" | "USER" | "LISTING", targetId, reason, note: note.trim() || undefined });
    setReporting(false);
    setNote("");
    if (ok) toast("ส่งรายงานแล้ว ขอบคุณที่ช่วยดูแลชุมชน");
  };

  return (
    <>
      <button type="button" onClick={() => setMenu(true)} className="press rounded-full p-2 text-faint hover:bg-paper-2 hover:text-ink" aria-label="ตัวเลือกเพิ่มเติม">
        <MoreHorizontal className="h-5 w-5" />
      </button>

      <Sheet open={menu} onClose={() => setMenu(false)} title="ตัวเลือก">
        <div className="flex flex-col">
          {!own && (
            <button type="button" className="press flex items-center gap-3 rounded-xl px-2 py-3 text-left hover:bg-paper-2" onClick={() => { setMenu(false); if (requireLogin()) setReporting(true); }}>
              <Flag className="h-5 w-5 text-laterite" /> <span><b className="font-semibold">รายงาน</b><br /><span className="text-sm text-muted">ส่งให้ผู้ดูแลตรวจสอบ</span></span>
            </button>
          )}
          {authorId && !own && (
            <>
              <button type="button" className="press flex items-center gap-3 rounded-xl px-2 py-3 text-left hover:bg-paper-2" onClick={async () => { setMenu(false); if (await actions.block(authorId, true)) toast(`ปิดเสียง ${authorName ?? "ผู้ใช้"} แล้ว`); }}>
                <VolumeX className="h-5 w-5" /> <span><b className="font-semibold">ปิดเสียง {authorName}</b><br /><span className="text-sm text-muted">ซ่อนโพสต์ในฟีดของคุณ</span></span>
              </button>
              <button type="button" className="press flex items-center gap-3 rounded-xl px-2 py-3 text-left hover:bg-paper-2" onClick={async () => { setMenu(false); if (await actions.block(authorId)) toast(`บล็อก ${authorName ?? "ผู้ใช้"} แล้ว`); }}>
                <Ban className="h-5 w-5 text-laterite" /> <span><b className="font-semibold">บล็อก {authorName}</b><br /><span className="text-sm text-muted">จะไม่เห็นโพสต์และความเห็นอีก</span></span>
              </button>
            </>
          )}
          {own && <p className="px-2 py-3 text-sm text-muted">นี่คือเนื้อหาของคุณเอง</p>}
        </div>
      </Sheet>

      <Sheet open={reporting} onClose={() => setReporting(false)} title="รายงานเนื้อหา">
        <fieldset className="space-y-2">
          <legend className="sr-only">เหตุผล</legend>
          {REASONS.map((r) => (
            <label key={r.key} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 ${reason === r.key ? "border-gold bg-gold-soft" : "border-line"}`}>
              <input type="radio" name="reason" className="mt-1 accent-[var(--gold)]" checked={reason === r.key} onChange={() => setReason(r.key)} />
              <span><b className="font-semibold">{r.label}</b><br /><span className="text-sm text-muted">{r.hint}</span></span>
            </label>
          ))}
        </fieldset>
        <label className="mt-3 block text-sm font-medium" htmlFor="report-note">หมายเหตุ (ไม่บังคับ)</label>
        <textarea id="report-note" value={note} onChange={(e) => setNote(e.target.value)} rows={2} maxLength={300} className="mt-1 w-full rounded-xl border border-line bg-paper p-3 text-[1rem] outline-none focus:border-gold" />
        <button type="button" onClick={submit} className="press mt-4 w-full rounded-full bg-night py-3 font-semibold text-on-night">ส่งรายงาน</button>
      </Sheet>
    </>
  );
}
