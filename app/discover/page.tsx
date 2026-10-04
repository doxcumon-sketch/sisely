import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { DealCard, EventCard, ListingCard, PlaceCard } from "@/components/cards";
import { RoomIcon } from "@/components/icons";
import { Cover, SectionHeader } from "@/components/ui";
import { PLACE_CATEGORIES, businesses, deals, guides, listings, places, userById } from "@/lib/data";
import { eventsFor, upcomingEvents } from "@/lib/queries";

export const revalidate = 900;

export const metadata: Metadata = {
  title: "ค้นพบศรีสะเกษ — ที่เที่ยว ร้านเด็ด งาน ดีล ธุรกิจ",
  description: "ค้นพบศรีสะเกษในที่เดียว ร้านอาหาร คาเฟ่ ที่เที่ยว งาน ดีล ซื้อขาย ธุรกิจท้องถิ่น และไกด์เมือง",
  alternates: { canonical: "/discover" },
};

const CATS = [
  { href: "/places", label: "Places", th: "สถานที่", icon: "pin" },
  { href: "/events", label: "Events", th: "งาน", icon: "events" },
  { href: "/places?cat=restaurant", label: "Food", th: "ของกิน", icon: "food" },
  { href: "/market", label: "Local", th: "ท้องถิ่น", icon: "market" },
  { href: "/deals", label: "Deals", th: "ดีล", icon: "deal" },
  { href: "/rooms/culture", label: "Stories", th: "เรื่องราว", icon: "news" },
  { href: "/guide", label: "Guide", th: "ไกด์เมือง", icon: "map" },
  { href: "#business", label: "Business", th: "ธุรกิจ", icon: "business" },
];

export default function DiscoverPage() {
  const today = eventsFor("today");
  const events = today.length ? today : upcomingEvents(3);
  return (
    <div className="space-y-10">
      <header>
        <p className="eyebrow mb-1">Discover</p>
        <h1 className="font-editorial text-3xl font-bold sm:text-4xl">ค้นพบศรีสะเกษ</h1>
        <p className="mt-2 max-w-xl text-muted">ทุกหมวดเชื่อมกับชุมชน — ทุกร้าน ทุกงาน มีคนพูดถึงและตอบคำถามอยู่</p>
      </header>

      <section aria-label="หมวด" className="grid grid-cols-4 gap-2 sm:gap-3 lg:grid-cols-8">
        {CATS.map((c) => (
          <Link key={c.label} href={c.href} className="surface press flex flex-col items-center gap-2 px-1 py-4 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-night text-gold"><RoomIcon name={c.icon} className="h-5 w-5" /></span>
            <span className="text-[13px] font-semibold leading-tight">{c.th}</span>
          </Link>
        ))}
      </section>

      <section>
        <SectionHeader eyebrow={today.length ? "Today" : "Upcoming"} title={today.length ? "วันนี้" : "เร็ว ๆ นี้"} href="/events" live={today.length > 0} />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{events.slice(0, 3).map((e) => <EventCard key={e.id} event={e} featured />)}</div>
      </section>

      <section>
        <SectionHeader eyebrow="Places" title="ที่ที่คนพูดถึง" href="/places" />
        <div className="scrollbar-none -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0">
          {places.slice(0, 4).map((p) => <div key={p.id} className="w-[78%] shrink-0 snap-start sm:w-72 lg:w-auto"><PlaceCard place={p} /></div>)}
        </div>
        <div className="scrollbar-none mt-3 flex gap-2 overflow-x-auto">
          {PLACE_CATEGORIES.map((c) => <Link key={c.key} href={`/places?cat=${c.key}`} className="press shrink-0 rounded-full border border-line bg-card px-4 py-2 text-sm font-medium hover:border-gold">{c.label}</Link>)}
        </div>
      </section>

      <section>
        <SectionHeader eyebrow="Deals" title="ดีลวันนี้" href="/deals" />
        <div className="grid gap-4 md:grid-cols-2">{deals.slice(0, 4).map((d) => <DealCard key={d.id} deal={d} />)}</div>
      </section>

      <section>
        <SectionHeader eyebrow="Local" title="ของดีจากคนในพื้นที่" href="/market" />
        <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">{listings.filter((l) => l.promoted || l.category === "local-products").slice(0, 4).map((l) => <ListingCard key={l.id} listing={l} sellerName={userById(l.sellerId)?.name ?? ""} />)}</div>
      </section>

      <section id="business" className="scroll-mt-24">
        <SectionHeader eyebrow="Business" title="ธุรกิจท้องถิ่น" />
        <div className="grid gap-4 md:grid-cols-2">
          {businesses.map((b) => (
            <Link key={b.id} href={`/business/${b.slug}`} className="surface press flex items-center gap-4 p-4">
              <Cover tone={b.tone} icon="business" className="h-16 w-16 shrink-0 rounded-2xl" />
              <div className="min-w-0"><p className="font-editorial text-lg font-semibold leading-tight">{b.name} {b.verified && <span className="ml-1 text-xs font-semibold text-jade">✓ ยืนยันแล้ว</span>}</p><p className="truncate text-sm text-muted">{b.tagline}</p></div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader eyebrow="Guide" title="ไกด์เมือง" href="/guide" />
        <div className="grid gap-4 md:grid-cols-3">
          {guides.map((g) => (
            <Link key={g.slug} href={`/guide/${g.slug}`} className="surface press group overflow-hidden">
              <Cover tone={g.tone} icon="map" className="h-28" />
              <div className="p-4"><p className="eyebrow mb-1">{g.kicker}</p><h3 className="font-editorial font-semibold leading-snug group-hover:text-gold">{g.title}</h3><p className="mt-2 inline-flex items-center gap-1 text-xs text-muted"><BookOpen className="h-3.5 w-3.5" /> อ่าน {g.readMin} นาที</p></div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
