import { ArrowRight, Compass, MessagesSquare, Search } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { DealCard, EventCard, PlaceCard, RoomCard } from "@/components/cards";
import { Feed } from "@/components/feed";
import { TrendingList } from "@/components/trending";
import { RoomIcon } from "@/components/icons";
import { Chip, SectionHeader } from "@/components/ui";
import { getPulse, listDeals, listEvents, listPlaces, listRooms, queryPosts } from "@/lib/server/repo";
import { ActivityTicker } from "@/components/activity-ticker";
import { Cover } from "@/components/ui";
import { formatCount } from "@/lib/format";
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
  const [events, rooms, places, deals, forYou, trending, stories, pulse] = await Promise.all([
    listEvents(),
    listRooms(),
    listPlaces(),
    listDeals(),
    queryPosts({ mode: "forYou", limit: 6 }),
    queryPosts({ mode: "hot", limit: 5 }),
    queryPosts({ mode: "top", limit: 40 }).then((r) => r.posts.filter((p) => p.type === "story" || p.type === "recommendation").slice(0, 3)),
    getPulse(),
  ]);
  const topPost = trending.posts[0];
  const heroDeal = deals[0];
  const today = eventsFor(events, "today");
  const upcoming = today.length ? today : upcomingEvents(events, 3);
  const heroEvent = upcoming[0];
  const hotRooms = rooms.filter((r) => r.trending);
  const foodPlaces = places.filter((p) => p.category === "restaurant" || p.category === "cafe").slice(0, 4);

  return (
    <div className="space-y-10">
      <ActivityTicker items={pulse.latest} />

      {/* HERO */}
      <section className="hero-bright px-5 py-9 sm:px-10 sm:py-14 lg:px-14" aria-labelledby="hero-title">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <div className="min-w-0">
            <p className="eyebrow mb-4 flex items-center gap-3"><span className="gold-rule" /> Discover Sisaket</p>
            <h1 id="hero-title" className="font-editorial text-balance text-[2.35rem] font-bold leading-[1.15] text-ink sm:text-5xl lg:text-[3.6rem]">
              ศรีสะเกษ<br className="hidden sm:block" /> <span className="text-emerald-gradient whitespace-nowrap">ในแบบของเรา</span>
            </h1>
            <p className="mt-5 max-w-xl text-[1.02rem] leading-relaxed text-ink-2 sm:text-lg">
              ที่ที่คนศรีสะเกษคุยกัน แนะนำร้าน บอกงาน และค้นพบเมืองนี้ไปด้วยกัน
            </p>
            <Link href="/search" className="press mt-7 flex h-14 max-w-xl items-center gap-3 border border-line bg-card px-5 text-faint shadow-[var(--shadow-card)] hover:border-gold">
              <Search className="h-5 w-5 text-gold" />
              <span className="flex-1 text-[1.02rem]">วันนี้กำลังหาอะไร?</span>
              <span className="hidden bg-night px-4 py-2 text-sm font-semibold text-on-night sm:block">ค้นหา</span>
            </Link>
            <div className="scrollbar-none -mx-5 mt-4 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:px-0">
              {QUICK.map((c) => (
                <Link key={c.label} href={c.href ?? `/search?q=${encodeURIComponent(c.q!)}`} className="press shrink-0 border border-line bg-card/80 px-4 py-2 text-sm font-medium text-ink-2 hover:border-gold hover:text-ink">
                  {c.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden gap-3 lg:grid lg:grid-cols-2" aria-label="ไฮไลต์วันนี้">
            {topPost && (
              <Link href={`/post/${topPost.id}`} className="press group relative col-span-2 flex min-h-[13rem] flex-col justify-end overflow-hidden border border-line shadow-[var(--shadow-card)]">
                <div className="absolute inset-0"><Cover tone={topPost.images?.[0] ?? "jade"} icon={topPost.room.icon} className="h-full w-full" /></div>
                <div className="relative bg-gradient-to-t from-black/75 via-black/30 to-transparent p-5 pt-14 text-white">
                  <p className="mb-1 flex items-center gap-2 text-[0.72rem] font-bold uppercase tracking-[0.2em] text-[#f3d68a]"><span className="live-dot h-1.5 w-1.5 rounded-full bg-[#ff6a4d]" /> กำลังเป็นกระแส · {topPost.room.name}</p>
                  <p className="font-editorial text-xl font-semibold leading-snug group-hover:underline">{topPost.title}</p>
                  <p className="mt-1 text-sm text-white/80">{topPost.stats.comments} ความเห็น · {formatCount(topPost.stats.reactions)} ถูกใจ</p>
                </div>
              </Link>
            )}
            {heroEvent && (
              <Link href={`/events/${heroEvent.slug}`} className="press group relative flex min-h-[9.5rem] flex-col justify-end overflow-hidden border border-line shadow-[var(--shadow-card)]">
                <div className="absolute inset-0"><Cover tone={heroEvent.tone} icon="events" className="h-full w-full" /></div>
                <div className="relative bg-gradient-to-t from-black/75 to-transparent p-4 pt-10 text-white">
                  <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-[#f3d68a]">{dayLabel(heroEvent.dayOffset)} · {heroEvent.startTime}</p>
                  <p className="font-editorial line-clamp-2 font-semibold leading-snug group-hover:underline">{heroEvent.title}</p>
                </div>
              </Link>
            )}
            {heroDeal && (
              <Link href="/deals" className="press group relative flex min-h-[9.5rem] flex-col justify-end overflow-hidden border border-line shadow-[var(--shadow-card)]">
                <div className="absolute inset-0"><Cover tone={heroDeal.tone} icon="deal" className="h-full w-full" /></div>
                <div className="relative bg-gradient-to-t from-black/75 to-transparent p-4 pt-10 text-white">
                  <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-[#f3d68a]">ดีลวันนี้ · {heroDeal.discount}</p>
                  <p className="font-editorial line-clamp-2 font-semibold leading-snug group-hover:underline">{heroDeal.title}</p>
                </div>
              </Link>
            )}
          </div>
        </div>

        <dl className="mt-8 grid grid-cols-4 gap-px border border-line bg-line sm:mt-10" aria-label="ชุมชนตอนนี้">
          {[
            ["โพสต์ใน 24 ชม.", pulse.postsToday],
            ["โพสต์ทั้งหมด", pulse.posts],
            ["ความเห็น", pulse.comments],
            ["ห้องพูดคุย", pulse.rooms],
          ].map(([label, value]) => (
            <div key={label as string} className="bg-card/90 px-2.5 py-3 sm:px-5 sm:py-4">
              <dd className="font-editorial text-xl font-bold text-ink sm:text-3xl">{formatCount(value as number)}</dd>
              <dt className="text-[0.7rem] leading-tight text-muted sm:text-sm">{label}</dt>
            </div>
          ))}
        </dl>
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
          {upcomingEvents(events, 3).map((e) => (
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
          <Link href="/create" className="press inline-flex items-center gap-2 rounded-sm bg-night px-6 py-3 font-semibold text-on-night"><MessagesSquare className="h-4 w-4" /> เริ่มโพสต์</Link>
          <Link href="/discover" className="press inline-flex items-center gap-2 rounded-sm border border-line px-6 py-3 font-semibold"><Compass className="h-4 w-4" /> ค้นพบ</Link>
        </div>
      </section>
    </div>
  );
}
