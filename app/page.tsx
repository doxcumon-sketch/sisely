import { ArrowRight, Compass, MessagesSquare, Search, Sparkles } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { DealCard, EventCard, PlaceCard, RoomCard } from "@/components/cards";
import { Feed } from "@/components/feed";
import { TrendingList } from "@/components/trending";
import { RoomIcon } from "@/components/icons";
import { Chip, SectionHeader } from "@/components/ui";
import { listDeals, listEvents, listPlaces, listRooms, queryPosts } from "@/lib/server/repo";
import { dayLabel } from "@/lib/format";
import { eventsFor, upcomingEvents } from "@/lib/queries";
import { HomeFeedTabs } from "@/components/home-feed";
import { InstallBanner } from "@/components/install-banner";

export const revalidate = 60;

export const metadata: Metadata = {
  title: { absolute: "SISE · ศรีสะเกษในแบบของเรา — ชุมชน ร้าน งาน ที่เที่ยว" },
  description: "วันนี้ศรีสะเกษมีอะไร? คนศรีสะเกษกำลังคุยอะไรกัน? ค้นพบร้านอาหาร คาเฟ่ งาน ดีล และเข้าห้องพูดคุยกับคนในพื้นที่",
  alternates: { canonical: "/" },
};

const QUICK = [
  { label: "ร้านกาแฟ", q: "กาแฟ" },
  { label: "มีงานอะไรวันนี้", href: "/events?when=today" },
  { label: "หาที่กิน", q: "อาหาร" },
  { label: "หาที่เที่ยว", href: "/places?cat=attraction" },
  { label: "ถามคนศรีสะเกษ", href: "/rooms/qa" },
];

export default async function HomePage() {
  const [events, rooms, places, deals, forYou, trending, stories] = await Promise.all([
    listEvents(),
    listRooms(),
    listPlaces(),
    listDeals(),
    queryPosts({ mode: "forYou", limit: 6 }),
    queryPosts({ mode: "hot", limit: 5 }),
    queryPosts({ mode: "top", limit: 40 }).then((r) => r.posts.filter((p) => p.type === "story" || p.type === "recommendation").slice(0, 3)),
  ]);
  const today = eventsFor(events, "today");
  const upcoming = today.length ? today : upcomingEvents(events, 3);
  const hotRooms = rooms.filter((r) => r.trending);
  const foodPlaces = places.filter((p) => p.category === "restaurant" || p.category === "cafe").slice(0, 4);

  return (
    <div className="space-y-10">
      {/* HERO */}
      <section className="night-surface relative overflow-hidden rounded-[2rem] px-5 py-8 sm:px-10 sm:py-12" aria-labelledby="hero-title">
        <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-gold/20 blur-3xl" />
        <p className="eyebrow mb-3 flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5" /> Discover Sisaket
        </p>
        <h1 id="hero-title" className="font-editorial max-w-2xl text-balance text-[2rem] font-bold leading-[1.2] sm:text-5xl sm:leading-[1.15]">
          ศรีสะเกษ <span className="text-gold-gradient whitespace-nowrap">ในแบบของเรา</span>
        </h1>
        <p className="mt-3 max-w-xl text-[0.98rem] leading-relaxed text-on-night-muted sm:text-lg">
          ที่ที่คนศรีสะเกษคุยกัน แนะนำร้าน บอกงาน และค้นพบเมืองนี้ไปด้วยกัน
        </p>
        <Link href="/search" className="press mt-6 flex h-14 max-w-xl items-center gap-3 rounded-full bg-card px-5 text-faint shadow-[var(--shadow-pop)]">
          <Search className="h-5 w-5 text-gold" />
          <span className="text-[1.02rem]">วันนี้กำลังหาอะไร?</span>
        </Link>
        <div className="scrollbar-none -mx-5 mt-4 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:px-0">
          {QUICK.map((c) => (
            <Link
              key={c.label}
              href={c.href ?? `/search?q=${encodeURIComponent(c.q!)}`}
              className="press shrink-0 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-on-night backdrop-blur-sm hover:bg-white/20"
            >
              {c.label}
            </Link>
          ))}
        </div>
      </section>

      <InstallBanner />

      {/* THREE QUESTIONS */}
      <section aria-label="สามคำถามของเมือง" className="grid gap-3 sm:grid-cols-3">
        {[
          { href: "/events?when=today", icon: "events", q: "วันนี้ศรีสะเกษมีอะไร?", a: `${upcoming.length} งานที่ควรรู้`, tone: "bg-laterite-soft" },
          { href: "#talking", icon: "talk", q: "คนศรีสะเกษกำลังคุยอะไรกัน?", a: "ดูกระทู้ที่กำลังร้อน", tone: "bg-jade-soft" },
          { href: "/discover", icon: "sparkle", q: "จะค้นพบอะไรใหม่ได้บ้าง?", a: "ที่เที่ยว ร้านเด็ด ดีล", tone: "bg-gold-soft" },
        ].map((t) => (
          <Link key={t.q} href={t.href} className={`press group flex items-center gap-3 rounded-2xl border border-line-soft p-4 ${t.tone}`}>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-card text-ink"><RoomIcon name={t.icon} className="h-5 w-5" /></span>
            <span className="min-w-0 flex-1">
              <span className="font-editorial block text-[1.02rem] font-semibold leading-snug">{t.q}</span>
              <span className="text-sm text-muted">{t.a}</span>
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-muted transition-transform group-hover:translate-x-1" />
          </Link>
        ))}
      </section>

      {/* TODAY */}
      <section aria-labelledby="today-h">
        <SectionHeader eyebrow={today.length ? "วันนี้" : "เร็ว ๆ นี้"} title={today.length ? "วันนี้มีอะไร" : "งานที่กำลังจะมา"} href="/events" hrefLabel="ปฏิทินงาน" live={today.length > 0} />
        <div className="mb-3 flex gap-2 overflow-x-auto scrollbar-none" id="today-h">
          <Chip href="/events?when=today" tone="laterite">วันนี้</Chip>
          <Chip href="/events?when=tomorrow">พรุ่งนี้</Chip>
          <Chip href="/events?when=weekend">สุดสัปดาห์นี้</Chip>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {upcoming.slice(0, 3).map((e) => (
            <EventCard key={e.id} event={e} featured />
          ))}
        </div>
        {!today.length && <p className="mt-2 text-xs text-muted">วันนี้ยังไม่มีงานที่ลงทะเบียน — เริ่มจาก {dayLabel(upcoming[0]?.dayOffset ?? 1)}</p>}
      </section>

      {/* FEED + RAIL */}
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_21rem]">
        <section aria-labelledby="foryou-h" className="min-w-0" id="talking">
          <SectionHeader eyebrow="For You" title="สำหรับคุณ" />
          <HomeFeedTabs initial={forYou} />
        </section>

        <aside className="space-y-8 xl:sticky xl:top-24 xl:self-start" aria-label="เมืองกำลังเป็นอย่างไร">
          <section className="surface p-4">
            <SectionHeader eyebrow="Trending" title="กำลังเป็นกระแส" live />
            <TrendingList posts={trending.posts} />
          </section>
          <section>
            <SectionHeader title="ดีลวันนี้" href="/deals" />
            <div className="space-y-3">
              {deals.slice(0, 2).map((d) => <DealCard key={d.id} deal={d} />)}
            </div>
          </section>
        </aside>
      </div>

      {/* ROOMS */}
      <section>
        <SectionHeader eyebrow="Rooms" title="ห้องที่คนกำลังคุยกัน" href="/rooms" />
        <div className="scrollbar-none -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 lg:mx-0 lg:grid lg:grid-cols-3 lg:overflow-visible lg:px-0 xl:grid-cols-4">
          {hotRooms.map((r) => (
            <div key={r.id} className="w-[72%] shrink-0 snap-start sm:w-64 lg:w-auto"><RoomCard room={r} compact /></div>
          ))}
        </div>
      </section>

      {/* FOOD + CAFE */}
      <section>
        <SectionHeader eyebrow="Eat & Drink" title="กินอะไรดี · คาเฟ่น่าไป" href="/places?cat=restaurant" />
        <div className="scrollbar-none -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0">
          {foodPlaces.map((p) => (
            <div key={p.id} className="w-[78%] shrink-0 snap-start sm:w-72 lg:w-auto"><PlaceCard place={p} /></div>
          ))}
        </div>
      </section>

      {/* STORIES */}
      <section>
        <SectionHeader eyebrow="Stories" title="เรื่องราวจากคนศรีสะเกษ" href="/rooms/culture" />
        <Feed filter={{ mode: "top", ids: stories.map((s) => s.id) }} initial={{ posts: stories, hasMore: false }} pageSize={3} />
      </section>

      <section className="surface flex flex-col items-start gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-editorial text-xl font-semibold">มีเรื่องอยากเล่า หรืออยากถามคนในเมือง?</p>
          <p className="text-sm text-muted">ใช้เวลาไม่ถึงนาที เลือกห้อง พิมพ์ แล้วโพสต์</p>
        </div>
        <div className="flex gap-2">
          <Link href="/create" className="press inline-flex items-center gap-2 rounded-full bg-night px-6 py-3 font-semibold text-on-night"><MessagesSquare className="h-4 w-4" /> เริ่มโพสต์</Link>
          <Link href="/discover" className="press inline-flex items-center gap-2 rounded-full border border-line px-6 py-3 font-semibold"><Compass className="h-4 w-4" /> ค้นพบ</Link>
        </div>
      </section>
    </div>
  );
}
