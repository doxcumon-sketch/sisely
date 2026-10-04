"use client";

import { Calendar, Camera, Globe, Loader2, LogOut, MapPin, MessageCircle, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { FollowButton } from "@/components/buttons";
import { EventCard, PlaceCard } from "@/components/cards";
import { Feed } from "@/components/feed";
import { RoomIcon } from "@/components/icons";
import { Avatar, Chip, Cover, EmptyState } from "@/components/ui";
import { AREA_OPTIONS } from "@/lib/data/areas";
import { COVER_PHOTOS } from "@/lib/covers";
import { downscaleImage } from "@/lib/moderation";
import { toast } from "@/components/toast";
import { formatCount } from "@/lib/format";
import { actions, api, useSise } from "@/lib/store";
import type { Place, Post, Room, SiseEvent, User } from "@/lib/types";

const BADGE = { founder: "ผู้ก่อตั้ง", "local-guide": "Local Guide", business: "ธุรกิจ", moderator: "ผู้ดูแลชุมชน" } as const;

function Reputation({ value }: { value: number }) {
  return (
    <div className="mt-4" aria-label={`SISE Reputation ${value} จาก 100`}>
      <div className="mb-1 flex justify-between text-xs text-muted"><span>SISE Reputation</span><span className="font-semibold text-ink">{value}</span></div>
      <div className="h-1.5 overflow-hidden rounded-sm bg-paper-2"><div className="h-full rounded-sm bg-gradient-to-r from-[#b88c34] to-[#e6c77a]" style={{ width: `${Math.min(100, value)}%` }} /></div>
      <p className="mt-1 text-[11px] text-faint">มาจากความเห็นที่เป็นประโยชน์ คำตอบที่ได้รับเลือก และการไม่ถูกรายงาน</p>
    </div>
  );
}

type Tab = "posts" | "comments" | "saved" | "rooms";

export interface ProfileData {
  profile: User & { posts: number; comments: number };
  isMe: boolean;
  initialPosts: { posts: Post[]; hasMore: boolean };
  comments?: { id: string; body: string; postId: string; postTitle: string }[];
  savedPlaces?: Place[];
  savedEvents?: SiseEvent[];
  rooms?: Room[];
  blockedUsers?: { id: string; name: string }[];
}

export function ProfileView({ data }: { data: ProfileData }) {
  const { profile, isMe, initialPosts, comments = [], savedPlaces = [], savedEvents = [], rooms = [], blockedUsers = [] } = data;
  const router = useRouter();
  const savedPostIds = useSise((s) => s.saves.posts);
  const [tab, setTab] = useState<Tab>("posts");
  const [editing, setEditing] = useState(false);
  const links0 = profile.links ?? {};
  const [draft, setDraft] = useState({ name: profile.name, bio: profile.bio, area: profile.area, line: links0.line ?? "", facebook: links0.facebook ?? "", website: links0.website ?? "", coverScene: profile.coverScene ?? "" });
  const [avatarId, setAvatarId] = useState<{ id: string; url: string } | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const coverId = editing ? draft.coverScene : profile.coverScene;
  const cover = coverId ? COVER_PHOTOS.find((c) => c.scene === coverId) : undefined;
  const shownAvatar = removeAvatar ? null : (avatarId?.url ?? profile.pictureUrl);

  const resetDraft = () => {
    setDraft({ name: profile.name, bio: profile.bio, area: profile.area, line: links0.line ?? "", facebook: links0.facebook ?? "", website: links0.website ?? "", coverScene: profile.coverScene ?? "" });
    setAvatarId(null);
    setRemoveAvatar(false);
    setFormError(null);
  };

  const pickAvatar = async (files: FileList | null) => {
    const f = files?.[0];
    if (!f) return;
    setBusy(true);
    setFormError(null);
    try {
      const dataUrl = await downscaleImage(f, 480, 0.82, true);
      const blob = await (await fetch(dataUrl)).blob();
      const form = new FormData();
      form.append("file", new File([blob], "avatar.jpg", { type: "image/jpeg" }));
      const res = await fetch("/api/photos", { method: "POST", body: form });
      const json = (await res.json().catch(() => null)) as { ok?: boolean; data?: { id: string; url: string }; error?: string } | null;
      if (!res.ok || !json?.ok || !json.data) throw new Error(json?.error ?? "อัปโหลดไม่สำเร็จ");
      setAvatarId(json.data);
      setRemoveAvatar(false);
    } catch (e) {
      setFormError(e instanceof Error && e.message !== "image" ? e.message : "เปิดรูปนี้ไม่ได้ ลองรูปอื่น (JPG/PNG)");
    } finally {
      setBusy(false);
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setFormError(null);
    const r = await api<unknown>("/api/me", "PATCH", {
      name: draft.name.trim() || profile.name,
      bio: draft.bio.trim(),
      area: draft.area,
      coverScene: draft.coverScene || null,
      links: { line: draft.line.trim(), facebook: draft.facebook.trim(), website: draft.website.trim() },
      ...(avatarId ? { avatarPhotoId: avatarId.id } : removeAvatar ? { removeAvatar: true } : {}),
    });
    setBusy(false);
    if (!r.ok) return setFormError(r.error);
    await actions.setProfile({});
    toast("บันทึกโปรไฟล์แล้ว");
    setEditing(false);
    router.refresh();
  };
  const [followDelta, setFollowDelta] = useState(0);
  const [blocked, setBlocked] = useState(blockedUsers);

  const savedCount = savedPostIds.length + savedPlaces.length + savedEvents.length;
  const TABS: { key: Tab; label: string; show: boolean }[] = [
    { key: "posts", label: `โพสต์ ${profile.posts}`, show: true },
    { key: "comments", label: `ความเห็น ${profile.comments}`, show: !isMe },
    { key: "saved", label: `บันทึก ${savedCount}`, show: isMe },
    { key: "rooms", label: `ห้องที่ติดตาม ${rooms.length}`, show: isMe },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="surface overflow-hidden">
        <Cover tone={profile.tone} icon="community" photo={cover} className="h-32 sm:h-48" />
        <div className="relative px-5 pb-6">
          {/* relative z-10: the avatar must paint above the cover (a positioned sibling), otherwise its top half is clipped */}
          <div className="relative z-10 -mt-12 flex items-end justify-between sm:-mt-14">
            <span className="relative rounded-full border-4 border-card bg-card">
              <Avatar name={editing ? draft.name : profile.name} tone={profile.tone} size={96} src={editing ? shownAvatar : profile.pictureUrl} />
              {editing && (
                <button type="button" onClick={() => fileRef.current?.click()} disabled={busy} className="press absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full bg-night text-on-night shadow-lg disabled:opacity-60" aria-label="เปลี่ยนรูปโปรไฟล์">
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                </button>
              )}
            </span>
            {isMe ? (
              <button type="button" onClick={() => { resetDraft(); setEditing((v) => !v); }} className="press rounded-sm border border-line px-5 py-2.5 text-[0.95rem] font-semibold hover:border-gold">{editing ? "ยกเลิก" : "แก้ไขโปรไฟล์"}</button>
            ) : (
              <FollowButton kind="users" id={profile.id} onChange={(now) => setFollowDelta((d) => d + (now ? 1 : -1))} />
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={(e) => { void pickAvatar(e.target.files); e.target.value = ""; }} />

          {editing ? (
            <form className="mt-5 space-y-4" onSubmit={save}>
              {(shownAvatar || profile.pictureUrl) && (
                <button type="button" onClick={() => { setRemoveAvatar(true); setAvatarId(null); }} className="press inline-flex items-center gap-1.5 text-sm text-muted hover:text-laterite"><Trash2 className="h-4 w-4" /> ลบรูปโปรไฟล์</button>
              )}
              <label className="block text-sm font-medium">ชื่อที่แสดง<input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} maxLength={40} className="mt-1 w-full rounded-sm border border-line bg-paper px-4 py-3 text-[1rem] outline-none focus:border-gold" /></label>
              <label className="block text-sm font-medium">แนะนำตัว<textarea value={draft.bio} onChange={(e) => setDraft({ ...draft, bio: e.target.value })} maxLength={160} rows={3} placeholder="เช่น ชอบหาร้านกาแฟนั่งทำงาน กลับมาอยู่บ้านที่ขุนหาญ" className="mt-1 w-full rounded-sm border border-line bg-paper px-4 py-3 text-[1rem] outline-none focus:border-gold" /><span className="mt-1 block text-right text-xs text-faint">{draft.bio.length}/160</span></label>
              <label className="block text-sm font-medium">พื้นที่ที่อยู่
                <select value={draft.area} onChange={(e) => setDraft({ ...draft, area: e.target.value })} className="mt-1 w-full rounded-sm border border-line bg-paper px-3 py-3 text-[1rem] outline-none focus:border-gold">
                  {!AREA_OPTIONS.includes(draft.area) && <option value={draft.area}>{draft.area}</option>}
                  {AREA_OPTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </label>
              <fieldset className="space-y-3 rounded-sm border border-line-soft p-4">
                <legend className="px-1 text-sm font-medium">ช่องทางติดต่อ <span className="font-normal text-faint">(ไม่บังคับ แสดงสาธารณะ)</span></legend>
                <label className="block text-sm">LINE ID<input value={draft.line} onChange={(e) => setDraft({ ...draft, line: e.target.value })} maxLength={60} placeholder="@yourid" className="mt-1 w-full rounded-sm border border-line bg-paper px-4 py-2.5 text-[1rem] outline-none focus:border-gold" /></label>
                <label className="block text-sm">Facebook<input value={draft.facebook} onChange={(e) => setDraft({ ...draft, facebook: e.target.value })} maxLength={160} inputMode="url" placeholder="https://facebook.com/..." className="mt-1 w-full rounded-sm border border-line bg-paper px-4 py-2.5 text-[1rem] outline-none focus:border-gold" /></label>
                <label className="block text-sm">เว็บไซต์<input value={draft.website} onChange={(e) => setDraft({ ...draft, website: e.target.value })} maxLength={160} inputMode="url" placeholder="https://..." className="mt-1 w-full rounded-sm border border-line bg-paper px-4 py-2.5 text-[1rem] outline-none focus:border-gold" /></label>
              </fieldset>
              <fieldset>
                <legend className="mb-2 text-sm font-medium">ภาพปกโปรไฟล์</legend>
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                  <button type="button" onClick={() => setDraft({ ...draft, coverScene: "" })} aria-pressed={!draft.coverScene} className={`press aspect-[16/10] border text-xs font-medium ${!draft.coverScene ? "border-gold ring-2 ring-gold" : "border-line"} bg-paper-2`}>ค่าเริ่มต้น</button>
                  {COVER_PHOTOS.map((c) => (
                    <button key={c.scene} type="button" onClick={() => setDraft({ ...draft, coverScene: c.scene })} aria-pressed={draft.coverScene === c.scene} aria-label={c.alt} className={`press relative aspect-[16/10] overflow-hidden border ${draft.coverScene === c.scene ? "border-gold ring-2 ring-gold" : "border-line"}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={c.src} alt="" loading="lazy" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              </fieldset>
              {formError && <p role="alert" className="rounded-sm bg-laterite-soft p-3 text-sm text-laterite">{formError}</p>}
              <div className="flex gap-2">
                <button type="submit" disabled={busy} className="press rounded-sm bg-night px-6 py-2.5 font-semibold text-on-night disabled:opacity-50">{busy ? "กำลังบันทึก…" : "บันทึก"}</button>
                <button type="button" onClick={() => { resetDraft(); setEditing(false); }} className="press rounded-sm border border-line px-6 py-2.5 font-semibold">ยกเลิก</button>
              </div>
            </form>
          ) : (
            <>
              <h1 className="font-editorial mt-3 flex flex-wrap items-center gap-2 text-2xl font-bold">
                {profile.name}
                {profile.badge && <span className="rounded-sm bg-gold-soft px-2.5 py-0.5 text-xs font-semibold text-[#7a5a14] dark:text-gold">{BADGE[profile.badge]}</span>}
              </h1>
              <p className="text-sm text-muted">@{profile.handle}</p>
              {profile.bio ? <p className="mt-2 text-ink-2">{profile.bio}</p> : isMe && <button type="button" onClick={() => { resetDraft(); setEditing(true); }} className="mt-2 text-sm text-gold hover:underline">+ เพิ่มคำแนะนำตัว ให้คนรู้จักคุณมากขึ้น</button>}
              <p className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted">
                <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {profile.area}</span>
                <span className="inline-flex items-center gap-1.5"><Calendar className="h-4 w-4" /> เป็นสมาชิก {profile.joinedDays} วัน</span>
                {profile.links?.line && <span className="inline-flex items-center gap-1.5"><MessageCircle className="h-4 w-4" /> {profile.links.line}</span>}
                {profile.links?.facebook && <a href={profile.links.facebook} target="_blank" rel="noopener noreferrer nofollow ugc" className="inline-flex items-center gap-1.5 text-gold hover:underline"><span className="font-black leading-none">f</span> Facebook</a>}
                {profile.links?.website && <a href={profile.links.website} target="_blank" rel="noopener noreferrer nofollow ugc" className="inline-flex items-center gap-1.5 text-gold hover:underline"><Globe className="h-4 w-4" /> เว็บไซต์</a>}
              </p>
            </>
          )}
          {!editing && (
            <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
              {([["โพสต์", profile.posts], ["ผู้ติดตาม", Math.max(0, profile.followers + followDelta)], ["กำลังติดตาม", profile.following]] as const).map(([l, v]) => (
                <div key={l} className="surface-flat py-3"><dd className="font-editorial text-xl font-bold">{formatCount(v)}</dd><dt className="text-xs text-muted">{l}</dt></div>
              ))}
            </dl>
          )}
          {!editing && <Reputation value={profile.reputation} />}
        </div>
      </header>

      <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0" role="tablist">
        {TABS.filter((t) => t.show).map((t) => <Chip key={t.key} active={tab === t.key} onClick={() => setTab(t.key)}>{t.label}</Chip>)}
      </div>

      {tab === "posts" && <Feed filter={{ mode: "new", authorId: profile.id }} initial={initialPosts} showRoom emptyTitle={isMe ? "คุณยังไม่ได้โพสต์" : "ยังไม่มีโพสต์"} emptyHint={isMe ? "เริ่มจากถามหรือแนะนำร้านที่ชอบ ใช้เวลาแค่ไม่กี่วินาที" : ""} />}

      {tab === "comments" && (
        <ul className="space-y-3">
          {comments.map((c) => (
            <li key={c.id} className="surface-flat p-4"><p className="break-words text-ink-2">{c.body}</p><Link href={`/post/${c.postId}#comments`} className="mt-1 inline-block text-sm text-gold hover:underline">ใน “{c.postTitle}” →</Link></li>
          ))}
          {comments.length === 0 && <EmptyState icon="chat" title="ยังไม่มีความเห็น" />}
        </ul>
      )}

      {tab === "saved" && (
        <div className="space-y-8">
          {savedCount === 0 && <EmptyState icon="sparkle" title="ยังไม่ได้บันทึกอะไร" hint="กดไอคอนบุ๊กมาร์กที่โพสต์ สถานที่ หรืองาน เพื่อเก็บไว้ดูทีหลัง" />}
          {savedPostIds.length > 0 && <section><h2 className="font-editorial mb-3 text-lg font-semibold">โพสต์</h2><Feed key={savedPostIds.join(",")} filter={{ mode: "new", ids: savedPostIds }} pageSize={5} /></section>}
          {savedPlaces.length > 0 && <section><h2 className="font-editorial mb-3 text-lg font-semibold">สถานที่</h2><div className="grid gap-4 sm:grid-cols-2">{savedPlaces.map((p) => <PlaceCard key={p.id} place={p} />)}</div></section>}
          {savedEvents.length > 0 && <section><h2 className="font-editorial mb-3 text-lg font-semibold">งาน</h2><div className="space-y-3">{savedEvents.map((e) => <EventCard key={e.id} event={e} />)}</div></section>}
        </div>
      )}

      {tab === "rooms" && (
        <div className="space-y-6">
          <ul className="grid gap-2 sm:grid-cols-2">
            {rooms.map((r) => (
              <li key={r.id}><Link href={`/rooms/${r.slug}`} className="surface press flex items-center gap-3 p-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-night text-gold"><RoomIcon name={r.icon} className="h-5 w-5" /></span><span className="font-medium">{r.name}</span></Link></li>
            ))}
          </ul>
          {rooms.length === 0 && <EmptyState icon="community" title="ยังไม่ได้ติดตามห้องไหน" action={<Link href="/rooms" className="press rounded-sm bg-night px-5 py-2.5 font-semibold text-on-night">เลือกห้อง</Link>} />}
          <section className="surface-flat space-y-3 p-4 text-sm">
            <h2 className="font-editorial text-lg font-semibold">ความเป็นส่วนตัวและบัญชี</h2>
            <p className="text-muted">บล็อกอยู่ {blocked.length} คน</p>
            {blocked.map((b) => <div key={b.id} className="flex items-center justify-between"><span>{b.name}</span><button type="button" onClick={async () => { await actions.unblock(b.id); setBlocked((l) => l.filter((x) => x.id !== b.id)); }} className="press rounded-sm border border-line px-3 py-1">เลิกบล็อก</button></div>)}
            <button type="button" onClick={() => actions.logout()} className="press inline-flex items-center gap-2 rounded-sm border border-line px-4 py-2 font-medium hover:border-gold"><LogOut className="h-4 w-4" /> ออกจากระบบ</button>
          </section>
        </div>
      )}
    </div>
  );
}
