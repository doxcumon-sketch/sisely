"use client";

import { Calendar, LogOut, MapPin } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FollowButton } from "@/components/buttons";
import { EventCard, PlaceCard } from "@/components/cards";
import { Feed } from "@/components/feed";
import { RoomIcon } from "@/components/icons";
import { Avatar, Chip, Cover, EmptyState } from "@/components/ui";
import { formatCount } from "@/lib/format";
import { actions, useSise } from "@/lib/store";
import type { Place, Post, Room, SiseEvent, User } from "@/lib/types";

const BADGE = { founder: "ผู้ก่อตั้ง", "local-guide": "Local Guide", business: "ธุรกิจ", moderator: "ผู้ดูแลชุมชน" } as const;

function Reputation({ value }: { value: number }) {
  return (
    <div className="mt-4" aria-label={`SISE Reputation ${value} จาก 100`}>
      <div className="mb-1 flex justify-between text-xs text-muted"><span>SISE Reputation</span><span className="font-semibold text-ink">{value}</span></div>
      <div className="h-1.5 overflow-hidden rounded-full bg-paper-2"><div className="h-full rounded-full bg-gradient-to-r from-[#b88c34] to-[#e6c77a]" style={{ width: `${Math.min(100, value)}%` }} /></div>
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
  const [draft, setDraft] = useState({ name: profile.name, bio: profile.bio });
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
        <Cover tone={profile.tone} icon="community" className="h-28 sm:h-40" />
        <div className="px-5 pb-6">
          <div className="-mt-10 flex items-end justify-between">
            <span className="rounded-full border-4 border-card"><Avatar name={profile.name} tone={profile.tone} size={80} src={profile.pictureUrl} /></span>
            {isMe ? (
              <div className="flex gap-2">
                <button type="button" onClick={() => { setDraft({ name: profile.name, bio: profile.bio }); setEditing((e) => !e); }} className="press rounded-full border border-line px-5 py-2.5 text-[0.95rem] font-semibold hover:border-gold">{editing ? "ปิด" : "แก้ไขโปรไฟล์"}</button>
              </div>
            ) : (
              <FollowButton kind="users" id={profile.id} onChange={(now) => setFollowDelta((d) => d + (now ? 1 : -1))} />
            )}
          </div>
          {editing ? (
            <form className="mt-4 space-y-3" onSubmit={async (e) => { e.preventDefault(); if (await actions.setProfile({ name: draft.name.trim() || profile.name, bio: draft.bio.trim() })) { setEditing(false); router.refresh(); } }}>
              <label className="block text-sm font-medium">ชื่อที่แสดง<input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} maxLength={40} className="mt-1 w-full rounded-xl border border-line bg-paper px-4 py-3 text-[1rem] outline-none focus:border-gold" /></label>
              <label className="block text-sm font-medium">แนะนำตัว<textarea value={draft.bio} onChange={(e) => setDraft({ ...draft, bio: e.target.value })} maxLength={160} rows={2} className="mt-1 w-full rounded-xl border border-line bg-paper px-4 py-3 text-[1rem] outline-none focus:border-gold" /></label>
              <button type="submit" className="press rounded-full bg-night px-6 py-2.5 font-semibold text-on-night">บันทึก</button>
            </form>
          ) : (
            <>
              <h1 className="font-editorial mt-3 flex flex-wrap items-center gap-2 text-2xl font-bold">
                {profile.name}
                {profile.badge && <span className="rounded-full bg-gold-soft px-2.5 py-0.5 text-xs font-semibold text-[#7a5a14] dark:text-gold">{BADGE[profile.badge]}</span>}
              </h1>
              <p className="text-sm text-muted">@{profile.handle}</p>
              {profile.bio && <p className="mt-2 text-ink-2">{profile.bio}</p>}
              <p className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted">
                <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {profile.area}</span>
                <span className="inline-flex items-center gap-1.5"><Calendar className="h-4 w-4" /> เป็นสมาชิก {profile.joinedDays} วัน</span>
              </p>
            </>
          )}
          <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
            {([["โพสต์", profile.posts], ["ผู้ติดตาม", Math.max(0, profile.followers + followDelta)], ["กำลังติดตาม", profile.following]] as const).map(([l, v]) => (
              <div key={l} className="surface-flat py-3"><dd className="font-editorial text-xl font-bold">{formatCount(v)}</dd><dt className="text-xs text-muted">{l}</dt></div>
            ))}
          </dl>
          <Reputation value={profile.reputation} />
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
          {rooms.length === 0 && <EmptyState icon="community" title="ยังไม่ได้ติดตามห้องไหน" action={<Link href="/rooms" className="press rounded-full bg-night px-5 py-2.5 font-semibold text-on-night">เลือกห้อง</Link>} />}
          <section className="surface-flat space-y-3 p-4 text-sm">
            <h2 className="font-editorial text-lg font-semibold">ความเป็นส่วนตัวและบัญชี</h2>
            <p className="text-muted">บล็อกอยู่ {blocked.length} คน</p>
            {blocked.map((b) => <div key={b.id} className="flex items-center justify-between"><span>{b.name}</span><button type="button" onClick={async () => { await actions.unblock(b.id); setBlocked((l) => l.filter((x) => x.id !== b.id)); }} className="press rounded-full border border-line px-3 py-1">เลิกบล็อก</button></div>)}
            <button type="button" onClick={() => actions.logout()} className="press inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 font-medium hover:border-gold"><LogOut className="h-4 w-4" /> ออกจากระบบ</button>
          </section>
        </div>
      )}
    </div>
  );
}
