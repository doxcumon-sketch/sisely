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
import { dayLabel } from "@/lib/format";
import { eventsFor, upcomingEvents } from "@/lib/queries";
import { HomeFeedTabs } from "@/components/home-feed";
import { InstallBanner } from "@/components/install-banner";
import { Onboarding } from "@/components/onboarding";
import { QuickCompose } from "@/components/quick-compose";
import { ShareButton } from "@/components/share";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "ชุมชนคนศรีสะเกษ — ห้องคุย ถามตอบ ชวนไปงาน",
  description: "วันนี้ศรีสะเกษมีอะไร? คนศรีสะเกษกำลังคุยอะไรกัน? ค้นพบร้านอาหาร คาเฟ่ งาน ดีล และเข้าห้องพูดคุยกับคนในพื้นที่",
  alternates: { canonical: "/community" },
};

export default async function CommunityPage() {
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
  const today = eventsFor(events, "today");
  const upcoming = today.length ? today : upcomingEvents(events, 3);
  const hotRooms = rooms.filter((r) => r.trending);
  const foodPlaces = places.filter((p) => p.category === "restaurant" || p.category === "cafe").slice(0, 4);

  return (
    <div className="space-y-10">
      <ActivityTicker items={pulse.latest} />

      <header>
        <p className="eyebrow mb-2">Community</p>
        <h1 className="font-editorial text-4xl font-semibold tracking-tight sm:text-5xl">คุยกับคนศรีสะเกษ</h1>
        <p className="mt-3 max-w-xl text-lg text-ink-2">ถาม แนะนำ ชวนไปงาน และเล่าเรื่องเมืองของเรา ในห้องที่คุณสนใจ</p>
      </header>

      <InstallBanner />

      {/* TODAY */}
      <section data-reveal aria-labelledby="today-h">
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
        <section data-reveal aria-labelledby="foryou-h" className="min-w-0" id="talking">
          <SectionHeader eyebrow="For You" title="ฟีดของคุณ" />
          <Onboarding rooms={rooms.slice(0, 12).map((r) => ({ slug: r.slug, name: r.name, icon: r.icon }))} />
          <QuickCompose />
          <HomeFeedTabs initial={forYou} />
        </section>

        <aside data-reveal className="space-y-8 xl:sticky xl:top-24 xl:self-start" aria-label="เมืองกำลังเป็นอย่างไร">
          <section data-reveal className="surface p-4">
            <SectionHeader eyebrow="Trending" title="ฮอตตอนนี้" live />
            <TrendingList posts={trending.posts} />
          </section>
          <section data-reveal className="surface p-5">
            <p className="eyebrow mb-1">Invite</p>
            <h2 className="font-editorial text-lg font-semibold">ชวนเพื่อนมาแจม</h2>
            <p className="mt-1 text-sm text-muted">เมืองจะสนุกขึ้นเมื่อเพื่อนๆ อยู่ด้วย ส่งลิงก์ให้เพื่อนใน LINE หรือ Facebook ได้เลย</p>
            <div className="mt-3"><ShareButton path="/community" title="SISE — พื้นที่ออนไลน์ของคนศรีสะเกษ มาคุยกันเถอะ" className="press inline-flex items-center gap-2 rounded-sm bg-cta px-5 py-2.5 font-bold text-on-cta hover:bg-cta-2" label="ชวนเพื่อน" /></div>
          </section>
          <section data-reveal>
            <SectionHeader title="ดีลวันนี้" href="/deals" />
            <div className="space-y-3">
              {deals.slice(0, 2).map((d) => <DealCard key={d.id} deal={d} />)}
            </div>
          </section>
        </aside>
      </div>

      {/* ROOMS */}
      <section data-reveal>
        <SectionHeader eyebrow="Rooms" title="ห้องที่คึกคักที่สุด" href="/rooms" />
        <div className="scrollbar-none -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 lg:mx-0 lg:grid lg:grid-cols-3 lg:overflow-visible lg:px-0 xl:grid-cols-4">
          {hotRooms.map((r) => (
            <div key={r.id} className="w-[72%] shrink-0 snap-start sm:w-64 lg:w-auto"><RoomCard room={r} compact /></div>
          ))}
        </div>
      </section>

      {/* FOOD + CAFE */}
      <section data-reveal>
        <SectionHeader eyebrow="Eat & Drink" title="กินอะไรดี · คาเฟ่ที่ต้องไป" href="/places?cat=restaurant" />
        <div className="scrollbar-none -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0">
          {foodPlaces.map((p) => (
            <div key={p.id} className="w-[78%] shrink-0 snap-start sm:w-72 lg:w-auto"><PlaceCard place={p} /></div>
          ))}
        </div>
      </section>

      {/* STORIES */}
      <section data-reveal>
        <SectionHeader eyebrow="Stories" title="เรื่องเล่าจากคนพื้นที่" href="/rooms/culture" />
        <Feed filter={{ mode: "top", ids: stories.map((s) => s.id) }} initial={{ posts: stories, hasMore: false }} pageSize={3} />
      </section>

      <section data-reveal className="surface flex flex-col items-start gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-editorial text-xl font-semibold">มีอะไรอยากเม้าท์ หรืออยากถามคนในเมือง?</p>
          <p className="text-sm text-muted">ไม่ถึงนาทีก็โพสต์ได้ เลือกห้อง พิมพ์ กดโพสต์ จบเลย</p>
        </div>
        <div className="flex gap-2">
          <Link href="/create" className="press inline-flex items-center gap-2 rounded-sm bg-night px-6 py-3 font-semibold text-on-night"><MessagesSquare className="h-4 w-4" /> โพสต์เลย</Link>
          <Link href="/discover" className="press inline-flex items-center gap-2 rounded-sm border border-line px-6 py-3 font-semibold"><Compass className="h-4 w-4" /> ค้นพบ</Link>
        </div>
      </section>
    </div>
  );
}
