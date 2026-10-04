"use client";

import { Clock, Search as SearchIcon, X } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { DealCard, EventCard, ListingCard, PlaceCard, RoomCard } from "@/components/cards";
import { PostCard } from "@/components/post-card";
import { Avatar, Chip, EmptyState, SectionHeader } from "@/components/ui";
import { guides, userById } from "@/lib/data";
import { useAllPosts } from "@/lib/hooks";
import { searchAll } from "@/lib/search";
import { actions, useSise } from "@/lib/store";

const POPULAR = ["ร้านกาแฟ", "หมูกระทะ", "ผามออีแดง", "ผ้าไหม", "ทุเรียน", "ดนตรีสด", "ห้องเช่า", "iPhone"];

export function SearchView() {
  const sp = useSearchParams();
  const [q, setQ] = useState(sp.get("q") ?? "");
  const recent = useSise((s) => s.recentSearches);
  const inputRef = useRef<HTMLInputElement>(null);
  const posts = useAllPosts();

  useEffect(() => {
    if (!sp.get("q")) inputRef.current?.focus();
  }, [sp]);

  // keep the URL shareable, debounced
  useEffect(() => {
    const t = window.setTimeout(() => {
      const url = q.trim() ? `/search?q=${encodeURIComponent(q.trim())}` : "/search";
      window.history.replaceState(null, "", url);
    }, 300);
    return () => window.clearTimeout(t);
  }, [q]);

  const results = useMemo(() => (q.trim() ? searchAll(q, posts) : null), [q, posts]);

  const remember = (term: string) => actions.addRecentSearch(term);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          remember(q);
          inputRef.current?.blur();
        }}
        className="sticky top-16 z-20 -mx-1 bg-paper/90 px-1 py-2 backdrop-blur-xl lg:top-[4.5rem]"
      >
        <div className="flex h-14 items-center gap-3 rounded-full border border-line bg-card px-5 shadow-[var(--shadow-card)] focus-within:border-gold">
          <SearchIcon className="h-5 w-5 shrink-0 text-gold" />
          <input
            ref={inputRef}
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="วันนี้กำลังหาอะไร?"
            aria-label="ค้นหาใน SISE"
            enterKeyHint="search"
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent text-[1.05rem] outline-none placeholder:text-faint"
          />
          {q && <button type="button" onClick={() => { setQ(""); inputRef.current?.focus(); }} className="press rounded-full p-1.5 text-muted hover:bg-paper-2" aria-label="ล้างคำค้น"><X className="h-4 w-4" /></button>}
        </div>
      </form>

      {!results && (
        <div className="space-y-8">
          {recent.length > 0 && (
            <section>
              <SectionHeader title="ค้นหาล่าสุด" />
              <div className="flex flex-wrap gap-2">{recent.map((r) => <Chip key={r} onClick={() => setQ(r)}><Clock className="h-3.5 w-3.5" /> {r}</Chip>)}</div>
            </section>
          )}
          <section>
            <SectionHeader eyebrow="Popular" title="คนศรีสะเกษกำลังค้นหา" />
            <div className="flex flex-wrap gap-2">{POPULAR.map((r) => <Chip key={r} onClick={() => { setQ(r); remember(r); }}>{r}</Chip>)}</div>
          </section>
          <section>
            <SectionHeader title="ไกด์ที่ควรอ่าน" />
            <div className="grid gap-3 sm:grid-cols-2">
              {guides.map((g) => <Link key={g.slug} href={`/guide/${g.slug}`} className="surface press p-4"><p className="eyebrow mb-1">{g.kicker}</p><p className="font-editorial font-semibold leading-snug">{g.title}</p></Link>)}
            </div>
          </section>
        </div>
      )}

      {results && results.total === 0 && (
        <EmptyState icon="pin" title={`ไม่พบผลลัพธ์สำหรับ “${q.trim()}”`} hint="ลองคำที่สั้นลง หรือถามคนศรีสะเกษในห้องถามตอบได้เลย" action={<Link href={`/create?type=question&room=qa`} className="press rounded-full bg-night px-5 py-2.5 font-semibold text-on-night">ตั้งคำถาม</Link>} />
      )}

      {results && results.total > 0 && (
        <div className="space-y-8">
          <p className="text-sm text-muted" aria-live="polite">พบ {results.total} รายการสำหรับ “{q.trim()}”</p>
          {results.rooms.length > 0 && <section><SectionHeader title="ห้อง" /><div className="grid gap-3 sm:grid-cols-2">{results.rooms.slice(0, 4).map((r) => <RoomCard key={r.id} room={r} compact />)}</div></section>}
          {results.places.length > 0 && <section><SectionHeader title="สถานที่" /><div className="grid gap-4 sm:grid-cols-2">{results.places.slice(0, 4).map((p) => <PlaceCard key={p.id} place={p} />)}</div></section>}
          {results.events.length > 0 && <section><SectionHeader title="งาน" /><div className="space-y-3">{results.events.slice(0, 3).map((e) => <EventCard key={e.id} event={e} />)}</div></section>}
          {results.deals.length > 0 && <section><SectionHeader title="ดีล" /><div className="space-y-3">{results.deals.slice(0, 3).map((d) => <DealCard key={d.id} deal={d} />)}</div></section>}
          {results.businesses.length > 0 && <section><SectionHeader title="ธุรกิจ" /><div className="grid gap-3 sm:grid-cols-2">{results.businesses.map((b) => <Link key={b.id} href={`/business/${b.slug}`} className="surface press p-4"><p className="font-editorial text-lg font-semibold">{b.name}</p><p className="text-sm text-muted">{b.tagline}</p></Link>)}</div></section>}
          {results.listings.length > 0 && <section><SectionHeader title="ซื้อขาย" href="/market" /><div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{results.listings.slice(0, 3).map((l) => <ListingCard key={l.id} listing={l} sellerName={userById(l.sellerId)?.name ?? ""} />)}</div></section>}
          {results.users.length > 0 && <section><SectionHeader title="ผู้คน" /><ul className="space-y-2">{results.users.map((u) => <li key={u.id}><Link href={`/u/${u.handle}`} className="surface press flex items-center gap-3 p-3"><Avatar name={u.name} tone={u.tone} size={42} /><span><b className="block">{u.name}</b><span className="text-sm text-muted">@{u.handle} · {u.area}</span></span></Link></li>)}</ul></section>}
          {results.guides.length > 0 && <section><SectionHeader title="ไกด์" /><div className="grid gap-3 sm:grid-cols-2">{results.guides.map((g) => <Link key={g.slug} href={`/guide/${g.slug}`} className="surface press p-4"><p className="eyebrow mb-1">{g.kicker}</p><p className="font-editorial font-semibold">{g.title}</p></Link>)}</div></section>}
          {results.posts.length > 0 && <section><SectionHeader title="โพสต์ในชุมชน" /><div className="space-y-4">{results.posts.slice(0, 5).map((p) => <PostCard key={p.id} post={p} />)}</div></section>}
        </div>
      )}
    </div>
  );
}
