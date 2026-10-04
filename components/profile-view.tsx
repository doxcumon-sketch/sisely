"use client";

import { Calendar, MapPin } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { FollowButton } from "@/components/buttons";
import { Feed } from "@/components/feed";
import { RoomIcon } from "@/components/icons";
import { Avatar, Chip, Cover, EmptyState } from "@/components/ui";
import { PlaceCard, EventCard } from "@/components/cards";
import { eventBySlug, placeBySlug, roomBySlug, userById, users } from "@/lib/data";
import { formatCount } from "@/lib/format";
import { actions, useSise } from "@/lib/store";
import { useAllPosts } from "@/lib/hooks";
import { seedComments } from "@/lib/data/posts";
import type { User } from "@/lib/types";

const BADGE = { founder: "ผู้ก่อตั้ง", "local-guide": "Local Guide", business: "ธุรกิจ", moderator: "ผู้ดูแลชุมชน" } as const;

function Reputation({ value }: { value: number }) {
  return (
    <div className="mt-4" aria-label={`SISE Reputation ${value} จาก 100`}>
      <div className="mb-1 flex justify-between text-xs text-muted"><span>SISE Reputation</span><span className="font-semibold text-ink">{value}</span></div>
      <div className="h-1.5 overflow-hidden rounded-full bg-paper-2"><div className="h-full rounded-full bg-gradient-to-r from-[#b88c34] to-[#e6c77a]" style={{ width: `${value}%` }} /></div>
      <p className="mt-1 text-[11px] text-faint">มาจากความเห็นที่เป็นประโยชน์ คำตอบที่ได้รับเลือก และการไม่ถูกรายงาน</p>
    </div>
  );
}

type Tab = "posts" | "comments" | "saved" | "rooms";

export function ProfileView({ handle }: { handle?: string }) {
  const isMe = !handle;
  const profile = useSise((s) => s.profile);
  const followedRooms = useSise((s) => s.follows.rooms);
  const followedUsers = useSise((s) => s.follows.users);
  const saves = useSise((s) => s.saves);
  const blocked = useSise((s) => s.blocked);
  const all = useAllPosts();
  const [tab, setTab] = useState<Tab>("posts");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(profile);

  const base = (isMe ? userById("u-me") : users.find((u) => u.handle === handle)) as User | undefined;
  const userComments = useSise((s) => s.userComments);
  const uid = base?.id ?? "";
  const commentCount = (isMe ? userComments.length : seedComments.filter((c) => c.authorId === uid).length);
  const postCount = all.filter((p) => p.authorId === uid).length;

  if (!base) {
    return <EmptyState icon="community" title="ไม่พบผู้ใช้นี้" hint="ลิงก์อาจผิด หรือผู้ใช้ย้ายโปรไฟล์แล้ว" action={<Link href="/" className="press rounded-full bg-night px-5 py-2.5 font-semibold text-on-night">กลับหน้าแรก</Link>} />;
  }

  const name = isMe ? profile.name : base.name;
  const bio = isMe ? profile.bio : base.bio;
  const savedPosts = saves.posts;
  const TABS: { key: Tab; label: string; show: boolean }[] = [
    { key: "posts", label: `โพสต์ ${postCount}`, show: true },
    { key: "comments", label: `ความเห็น ${commentCount}`, show: !isMe },
    { key: "saved", label: `บันทึก ${savedPosts.length + saves.places.length + saves.events.length}`, show: isMe },
    { key: "rooms", label: `ห้องที่ติดตาม ${isMe ? followedRooms.length : ""}`.trim(), show: isMe },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="surface overflow-hidden">
        <Cover tone={base.tone} icon="community" className="h-28 sm:h-40" />
        <div className="px-5 pb-6">
          <div className="-mt-10 flex items-end justify-between">
            <span className="rounded-full border-4 border-card"><Avatar name={name} tone={base.tone} size={80} /></span>
            {isMe ? (
              <div className="flex gap-2">
                <button type="button" onClick={() => { setDraft(profile); setEditing((e) => !e); }} className="press rounded-full border border-line px-5 py-2.5 text-[0.95rem] font-semibold hover:border-gold">{editing ? "ปิด" : "แก้ไขโปรไฟล์"}</button>
              </div>
            ) : (
              <FollowButton kind="users" id={base.id} />
            )}
          </div>
          {editing ? (
            <form className="mt-4 space-y-3" onSubmit={(e) => { e.preventDefault(); actions.setProfile({ name: draft.name.trim() || profile.name, bio: draft.bio.trim() }); setEditing(false); }}>
              <label className="block text-sm font-medium">ชื่อที่แสดง<input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} maxLength={40} className="mt-1 w-full rounded-xl border border-line bg-paper px-4 py-3 text-[1rem] outline-none focus:border-gold" /></label>
              <label className="block text-sm font-medium">แนะนำตัว<textarea value={draft.bio} onChange={(e) => setDraft({ ...draft, bio: e.target.value })} maxLength={160} rows={2} className="mt-1 w-full rounded-xl border border-line bg-paper px-4 py-3 text-[1rem] outline-none focus:border-gold" /></label>
              <button type="submit" className="press rounded-full bg-night px-6 py-2.5 font-semibold text-on-night">บันทึก</button>
            </form>
          ) : (
            <>
              <h1 className="font-editorial mt-3 flex flex-wrap items-center gap-2 text-2xl font-bold">
                {name}
                {base.badge && <span className="rounded-full bg-gold-soft px-2.5 py-0.5 text-xs font-semibold text-[#7a5a14] dark:text-gold">{BADGE[base.badge]}</span>}
              </h1>
              <p className="text-sm text-muted">@{base.handle}</p>
              <p className="mt-2 text-ink-2">{bio}</p>
              <p className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted">
                <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {base.area}</span>
                <span className="inline-flex items-center gap-1.5"><Calendar className="h-4 w-4" /> เป็นสมาชิก {base.joinedDays} วัน</span>
              </p>
            </>
          )}
          <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
            {[["โพสต์", postCount], ["ผู้ติดตาม", base.followers + (!isMe && followedUsers.includes(base.id) ? 1 : 0)], ["กำลังติดตาม", isMe ? base.following + followedUsers.length : base.following]].map(([l, v]) => (
              <div key={l as string} className="surface-flat py-3"><dd className="font-editorial text-xl font-bold">{formatCount(v as number)}</dd><dt className="text-xs text-muted">{l}</dt></div>
            ))}
          </dl>
          <Reputation value={base.reputation} />
        </div>
      </header>

      <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0" role="tablist">
        {TABS.filter((t) => t.show).map((t) => <Chip key={t.key} active={tab === t.key} onClick={() => setTab(t.key)}>{t.label}</Chip>)}
      </div>

      {tab === "posts" && <Feed filter={{ mode: "new", authorId: uid }} showRoom emptyTitle={isMe ? "คุณยังไม่ได้โพสต์" : "ยังไม่มีโพสต์"} emptyHint={isMe ? "เริ่มจากถามหรือแนะนำร้านที่ชอบ ใช้เวลาแค่ไม่กี่วินาที" : ""} />}

      {tab === "comments" && (
        <ul className="space-y-3">
          {seedComments.filter((c) => c.authorId === uid).map((c) => (
            <li key={c.id} className="surface-flat p-4"><p className="text-ink-2">{c.body}</p><Link href={`/post/${c.postId}#comments`} className="mt-1 inline-block text-sm text-gold hover:underline">ดูในกระทู้ →</Link></li>
          ))}
          {commentCount === 0 && <EmptyState icon="chat" title="ยังไม่มีความเห็น" />}
        </ul>
      )}

      {tab === "saved" && (
        <div className="space-y-8">
          {savedPosts.length + saves.places.length + saves.events.length + saves.listings.length === 0 && <EmptyState icon="sparkle" title="ยังไม่ได้บันทึกอะไร" hint="กดไอคอนบุ๊กมาร์กที่โพสต์ สถานที่ หรืองาน เพื่อเก็บไว้ดูทีหลัง" />}
          {savedPosts.length > 0 && <section><h2 className="font-editorial mb-3 text-lg font-semibold">โพสต์</h2><Feed filter={{ mode: "new", ids: savedPosts }} pageSize={5} /></section>}
          {saves.places.length > 0 && <section><h2 className="font-editorial mb-3 text-lg font-semibold">สถานที่</h2><div className="grid gap-4 sm:grid-cols-2">{saves.places.map((s) => placeBySlug(s)).filter(Boolean).map((p) => <PlaceCard key={p!.id} place={p!} />)}</div></section>}
          {saves.events.length > 0 && <section><h2 className="font-editorial mb-3 text-lg font-semibold">งาน</h2><div className="space-y-3">{saves.events.map((s) => eventBySlug(s)).filter(Boolean).map((e) => <EventCard key={e!.id} event={e!} />)}</div></section>}
        </div>
      )}

      {tab === "rooms" && (
        <div className="space-y-6">
          <ul className="grid gap-2 sm:grid-cols-2">
            {followedRooms.map((slug) => roomBySlug(slug)).filter(Boolean).map((r) => (
              <li key={r!.id}><Link href={`/rooms/${r!.slug}`} className="surface press flex items-center gap-3 p-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-night text-gold"><RoomIcon name={r!.icon} className="h-5 w-5" /></span><span className="font-medium">{r!.name}</span></Link></li>
            ))}
          </ul>
          {followedRooms.length === 0 && <EmptyState icon="community" title="ยังไม่ได้ติดตามห้องไหน" action={<Link href="/rooms" className="press rounded-full bg-night px-5 py-2.5 font-semibold text-on-night">เลือกห้อง</Link>} />}
          {isMe && (
            <section className="surface-flat space-y-3 p-4 text-sm">
              <h2 className="font-editorial text-lg font-semibold">ความเป็นส่วนตัว</h2>
              <p className="text-muted">บล็อกอยู่ {blocked.length} คน</p>
              {blocked.map((id) => <div key={id} className="flex items-center justify-between"><span>{userById(id)?.name ?? id}</span><button type="button" onClick={() => actions.unblock(id)} className="press rounded-full border border-line px-3 py-1">เลิกบล็อก</button></div>)}
              <button type="button" onClick={() => { if (window.confirm("ล้างข้อมูลทดลองทั้งหมดในเบราว์เซอร์นี้?")) actions.resetDemo(); }} className="press rounded-full border border-laterite/40 px-4 py-2 text-laterite">รีเซ็ตข้อมูลทดลอง</button>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
