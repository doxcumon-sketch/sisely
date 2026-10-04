"use client";

import { ImagePlus, Loader2, Plus, X } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { RoomIcon } from "@/components/icons";
import { toast } from "@/components/toast";
import { cx } from "@/components/ui";
import { rooms, roomBySlug } from "@/lib/data";
import { checkContent, downscaleImage } from "@/lib/moderation";
import { POST_TYPES } from "@/lib/post-types";
import { actions, getSise } from "@/lib/store";
import type { PostType } from "@/lib/types";

const DEFAULT_ROOM: Partial<Record<PostType, string>> = {
  question: "qa",
  discussion: "talk",
  recommendation: "food",
  event: "events",
  deal: "business",
  marketplace: "market",
  poll: "talk",
  story: "culture",
  announcement: "community",
};

export function Composer() {
  const router = useRouter();
  const sp = useSearchParams();
  const initialType = (POST_TYPES.find((t) => t.key === sp.get("type"))?.key ?? "question") as PostType;
  const [type, setType] = useState<PostType>(initialType);
  const [room, setRoom] = useState<string>(roomBySlug(sp.get("room") ?? "") ? (sp.get("room") as string) : (DEFAULT_ROOM[initialType] ?? "talk"));
  const [roomTouched, setRoomTouched] = useState(!!sp.get("room"));
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const meta = POST_TYPES.find((t) => t.key === type)!;
  const pickType = (t: PostType) => {
    setType(t);
    if (!roomTouched) setRoom(DEFAULT_ROOM[t] ?? "talk");
  };

  const addPhotos = async (files: FileList | null) => {
    if (!files) return;
    setBusy(true);
    try {
      const next: string[] = [];
      for (const f of Array.from(files).slice(0, 4 - photos.length)) next.push(await downscaleImage(f));
      setPhotos((p) => [...p, ...next].slice(0, 4));
    } catch {
      setError("เปิดรูปนี้ไม่ได้ ลองรูปอื่น (JPG/PNG)");
    } finally {
      setBusy(false);
    }
  };

  const validPollOptions = options.map((o) => o.trim()).filter(Boolean);
  const canSubmit = title.trim().length >= 5 && (type !== "poll" || validPollOptions.length >= 2) && !busy;

  const submit = () => {
    setError(null);
    const state = getSise();
    const composed = type === "marketplace" && price.trim() ? `ราคา ฿${price.trim()}\n\n${body.trim()}` : body.trim();
    const verdict = checkContent({ title, body: composed }, state.userPosts, Date.now());
    if (!verdict.ok) {
      setError(verdict.reason);
      return;
    }
    const post = actions.addPost({
      type,
      roomSlug: room,
      title: title.trim(),
      body: composed,
      photos: photos.length ? photos : undefined,
      poll: type === "poll" ? validPollOptions : undefined,
      location: location.trim() || undefined,
    });
    toast("โพสต์แล้ว!");
    router.push(`/post/${post.id}`);
  };

  return (
    <div className="mx-auto max-w-2xl pb-28">
      <header className="mb-5 flex items-center justify-between">
        <h1 className="font-editorial text-2xl font-bold sm:text-3xl">กำลังคิดอะไรอยู่?</h1>
        <Link href="/" className="press rounded-full p-2 text-muted hover:bg-paper-2" aria-label="ยกเลิก"><X className="h-5 w-5" /></Link>
      </header>

      <fieldset className="mb-5 min-w-0">
        <legend className="mb-2 text-sm font-medium text-muted">ประเภทโพสต์</legend>
        <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          {POST_TYPES.filter((t) => t.key !== "announcement").map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => pickType(t.key)}
              aria-pressed={type === t.key}
              className={cx("press inline-flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-[0.95rem] font-semibold", type === t.key ? "border-night bg-night text-on-night" : "border-line bg-card text-ink-2")}
            >
              <RoomIcon name={t.icon} className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="surface space-y-4 p-4 sm:p-5">
        <div>
          <label htmlFor="title" className="mb-1 block text-sm font-medium">หัวข้อ</label>
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={140}
            placeholder={meta.prompt}
            enterKeyHint="next"
            className="font-editorial w-full rounded-xl border border-line bg-paper px-4 py-3.5 text-[1.1rem] font-semibold outline-none placeholder:font-normal placeholder:text-faint focus:border-gold"
          />
          <p className="mt-1 text-right text-xs text-faint">{title.length}/140</p>
        </div>

        {type === "marketplace" && (
          <div>
            <label htmlFor="price" className="mb-1 block text-sm font-medium">ราคา (บาท)</label>
            <input id="price" inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value.replace(/[^\d,]/g, ""))} placeholder="เช่น 2,500" className="w-full rounded-xl border border-line bg-paper px-4 py-3.5 text-[1.05rem] outline-none focus:border-gold" />
          </div>
        )}

        <div>
          <label htmlFor="body" className="mb-1 block text-sm font-medium">รายละเอียด <span className="font-normal text-faint">(ไม่บังคับ)</span></label>
          <textarea id="body" value={body} onChange={(e) => setBody(e.target.value)} rows={5} maxLength={4000} placeholder="เล่าเพิ่มเติม ยิ่งละเอียดยิ่งมีคนช่วยตอบได้ตรง" className="w-full resize-y rounded-xl border border-line bg-paper px-4 py-3.5 text-[1.02rem] leading-relaxed outline-none placeholder:text-faint focus:border-gold" />
        </div>

        {type === "poll" && (
          <div>
            <p className="mb-1 text-sm font-medium">ตัวเลือก (2–4 ข้อ)</p>
            <div className="space-y-2">
              {options.map((o, i) => (
                <div key={i} className="flex gap-2">
                  <input aria-label={`ตัวเลือกที่ ${i + 1}`} value={o} onChange={(e) => setOptions((arr) => arr.map((x, j) => (j === i ? e.target.value : x)))} maxLength={60} placeholder={`ตัวเลือกที่ ${i + 1}`} className="min-w-0 flex-1 rounded-xl border border-line bg-paper px-4 py-3 text-[1.02rem] outline-none focus:border-gold" />
                  {options.length > 2 && <button type="button" onClick={() => setOptions((arr) => arr.filter((_, j) => j !== i))} className="press rounded-xl border border-line px-3 text-muted" aria-label="ลบตัวเลือก"><X className="h-4 w-4" /></button>}
                </div>
              ))}
              {options.length < 4 && (
                <button type="button" onClick={() => setOptions((a) => [...a, ""])} className="press inline-flex items-center gap-1.5 text-sm font-medium text-gold"><Plus className="h-4 w-4" /> เพิ่มตัวเลือก</button>
              )}
            </div>
          </div>
        )}

        {photos.length > 0 && (
          <ul className="grid grid-cols-4 gap-2">
            {photos.map((src, i) => (
              <li key={i} className="relative aspect-square overflow-hidden rounded-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`รูปที่ ${i + 1}`} className="h-full w-full object-cover" />
                <button type="button" onClick={() => setPhotos((p) => p.filter((_, j) => j !== i))} className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white" aria-label="ลบรูป"><X className="h-3.5 w-3.5" /></button>
              </li>
            ))}
          </ul>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="room" className="mb-1 block text-sm font-medium">โพสต์ในห้อง</label>
            <select id="room" value={room} onChange={(e) => { setRoom(e.target.value); setRoomTouched(true); }} className="w-full rounded-xl border border-line bg-paper px-3 py-3 text-[1rem] outline-none focus:border-gold">
              {rooms.map((r) => <option key={r.id} value={r.slug}>{r.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="loc" className="mb-1 block text-sm font-medium">สถานที่ <span className="font-normal text-faint">(ไม่บังคับ)</span></label>
            <input id="loc" value={location} onChange={(e) => setLocation(e.target.value)} maxLength={60} placeholder="เช่น ตัวเมือง, กันทรลักษ์" className="w-full rounded-xl border border-line bg-paper px-4 py-3 text-[1rem] outline-none focus:border-gold" />
          </div>
        </div>

        <label className={cx("press inline-flex cursor-pointer items-center gap-2 rounded-full border border-dashed border-line px-4 py-2.5 text-sm font-medium text-ink-2 hover:border-gold", photos.length >= 4 && "pointer-events-none opacity-50")}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />} เพิ่มรูป ({photos.length}/4)
          <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => { void addPhotos(e.target.files); e.target.value = ""; }} />
        </label>

        {error && <p role="alert" className="rounded-xl bg-laterite-soft p-3 text-sm text-laterite">{error}</p>}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl lg:left-60">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <p className="hidden flex-1 text-sm text-muted sm:block">โพสต์ในห้อง <b className="text-ink">{roomBySlug(room)?.name}</b></p>
          <button type="button" onClick={submit} disabled={!canSubmit} className="press ml-auto w-full rounded-full bg-night px-8 py-3.5 text-[1.05rem] font-semibold text-on-night disabled:opacity-40 sm:w-auto">
            โพสต์เลย
          </button>
        </div>
      </div>
    </div>
  );
}
