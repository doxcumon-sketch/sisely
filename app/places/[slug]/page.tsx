import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, MapPin, Phone, Star } from "lucide-react";
import { FollowButton, SaveButton } from "@/components/buttons";
import { DealCard, EventCard, PlaceCard } from "@/components/cards";
import { Feed } from "@/components/feed";
import { ShareButton } from "@/components/share";
import { Cover, SectionHeader } from "@/components/ui";
import { placeCategoryLabel } from "@/lib/data";
import { getBusiness, getPlace, listDeals, listEvents, listPlaces, queryPosts } from "@/lib/server/repo";
import { formatCount } from "@/lib/format";
import { SITE_URL } from "@/lib/site";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getPlace(slug);
  if (!p) return {};
  return {
    title: `${p.name} ศรีสะเกษ — ${p.tagline}`,
    description: `${p.description.slice(0, 140)} รีวิวและความเห็นจากคนศรีสะเกษบน SISE`,
    alternates: { canonical: `/places/${p.slug}` },
    openGraph: { title: `${p.name} · ${placeCategoryLabel(p.category)}ศรีสะเกษ`, description: p.tagline },
  };
}

export default async function PlacePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getPlace(slug);
  if (!p) notFound();
  const [business, deals, events, places, initialPosts] = await Promise.all([
    p.businessSlug ? getBusiness(p.businessSlug) : null,
    listDeals(),
    listEvents(),
    listPlaces(p.category),
    queryPosts({ mode: "new", placeSlug: p.slug, limit: 4 }),
  ]);
  const placeDeals = deals.filter((d) => d.placeSlug === p.slug);
  const placeEvents = events.filter((e) => e.placeSlug === p.slug);
  const similar = places.filter((x) => x.id !== p.id).slice(0, 3);
  const bbox = `${p.lng - 0.01},${p.lat - 0.006},${p.lng + 0.01},${p.lat + 0.006}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": p.category === "restaurant" || p.category === "cafe" ? "Restaurant" : p.category === "hotel" ? "LodgingBusiness" : p.category === "attraction" ? "TouristAttraction" : "LocalBusiness",
    name: p.name,
    description: p.description,
    url: `${SITE_URL}/places/${p.slug}`,
    address: { "@type": "PostalAddress", streetAddress: p.address, addressRegion: "ศรีสะเกษ", addressCountry: "TH" },
    geo: { "@type": "GeoCoordinates", latitude: p.lat, longitude: p.lng },
    aggregateRating: { "@type": "AggregateRating", ratingValue: p.rating, reviewCount: p.reviews },
    telephone: p.phone,
  };

  return (
    <div className="space-y-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <nav aria-label="breadcrumb" className="text-sm text-muted">
        <Link href="/places" className="hover:text-ink">สถานที่</Link> / <Link href={`/places?cat=${p.category}`} className="hover:text-ink">{placeCategoryLabel(p.category)}</Link> / <span className="text-ink">{p.name}</span>
      </nav>

      <header className="surface overflow-hidden">
        <Cover tone={p.tone} icon={p.category === "cafe" ? "cafe" : p.category === "restaurant" ? "food" : p.category === "attraction" ? "travel" : "pin"} className="h-48 sm:h-72">
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-5 pt-16 text-white sm:p-8">
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-white/80">{placeCategoryLabel(p.category)} · {p.district}</p>
            <h1 className="font-editorial text-3xl font-bold sm:text-5xl">{p.name}</h1>
            <p className="mt-1 text-white/85">{p.tagline}</p>
          </div>
        </Cover>
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:px-8">
          <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            <span className="inline-flex items-center gap-1.5 text-base font-bold"><Star className="h-5 w-5 fill-gold text-gold" /> {p.rating.toFixed(1)}</span>
            <span className="text-muted">ความรู้สึกจากชุมชน · {p.reviews} ความเห็น</span>
            <span className="text-muted">{formatCount(p.followers)} ผู้ติดตาม</span>
            <span className="text-muted">{"฿".repeat(p.priceLevel)}</span>
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <FollowButton kind="places" id={p.slug} />
            <SaveButton kind="places" id={p.slug} />
            <ShareButton path={`/places/${p.slug}`} title={p.name} className="press inline-flex items-center gap-1.5 rounded-sm border border-line px-4 py-2.5 text-[0.95rem] font-semibold hover:border-gold" label="แชร์" />
          </div>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 space-y-8">
          <section>
            <h2 className="font-editorial mb-2 text-xl font-semibold">เกี่ยวกับที่นี่</h2>
            <p className="leading-[1.85] text-ink-2">{p.description}</p>
            <ul className="mt-3 flex flex-wrap gap-2">{p.highlights.map((h) => <li key={h} className="rounded-sm bg-gold-soft px-3 py-1 text-sm font-medium">{h}</li>)}</ul>
          </section>

          <section aria-labelledby="mentions">
            <SectionHeader eyebrow="Community" title="คนพูดถึงที่นี่ว่า…" />
            <div className="grid gap-3 sm:grid-cols-2">
              {p.mentions.map((m, i) => (
                <blockquote key={i} className="surface-flat relative p-4 pl-5 text-[0.98rem] leading-relaxed text-ink-2">
                  <span aria-hidden="true" className="font-editorial absolute left-2 top-0 text-4xl leading-none text-gold/50">“</span>
                  {m}
                </blockquote>
              ))}
            </div>
          </section>

          {placeDeals.length > 0 && (
            <section><SectionHeader title="ดีลจากที่นี่" href="/deals" /><div className="space-y-3">{placeDeals.map((d) => <DealCard key={d.id} deal={d} />)}</div></section>
          )}
          {placeEvents.length > 0 && (
            <section><SectionHeader title="งานที่นี่" /><div className="space-y-3">{placeEvents.map((e) => <EventCard key={e.id} event={e} />)}</div></section>
          )}

          <section aria-labelledby="discuss">
            <SectionHeader eyebrow="Discussion" title="โพสต์ในชุมชนที่พูดถึงที่นี่" href={`/create?place=${p.slug}`} hrefLabel="+ โพสต์" />
            <Feed filter={{ mode: "new", placeSlug: p.slug }} initial={initialPosts} pageSize={4} emptyTitle="ยังไม่มีใครพูดถึงที่นี่" emptyHint="ถามหรือรีวิวเป็นคนแรกได้เลย" />
          </section>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <section className="surface p-5">
            <h2 className="font-editorial mb-3 text-lg font-semibold">ข้อมูล</h2>
            <dl className="space-y-3 text-[0.95rem]">
              <div className="flex gap-3"><dt className="sr-only">ที่อยู่</dt><MapPin className="mt-0.5 h-5 w-5 shrink-0 text-laterite" /><dd>{p.address}</dd></div>
              {p.phone && <div className="flex gap-3"><dt className="sr-only">โทร</dt><Phone className="mt-0.5 h-5 w-5 shrink-0 text-gold" /><dd><a href={`tel:${p.phone.replace(/-/g, "")}`} className="font-medium hover:underline">{p.phone}</a></dd></div>}
              {p.line && <div className="flex gap-3 text-sm"><dt className="w-14 shrink-0 text-muted">LINE</dt><dd>{p.line}</dd></div>}
            </dl>
            <div className="hairline-gold my-4" />
            <h3 className="mb-2 text-sm font-semibold">เวลาเปิด-ปิด</h3>
            <ul className="space-y-1 text-sm">
              {p.hours.map((h) => (
                <li key={h.day} className="flex justify-between"><span className="text-muted">{h.day}</span><span className={h.time === "ปิด" ? "text-laterite" : ""}>{h.time}</span></li>
              ))}
            </ul>
          </section>

          <section className="surface overflow-hidden">
            <iframe title={`แผนที่ ${p.name}`} loading="lazy" className="h-56 w-full border-0" src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${p.lat},${p.lng}`} />
            <a href={`https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 text-sm font-semibold hover:text-gold">
              เปิดในแผนที่นำทาง <ExternalLink className="h-4 w-4" />
            </a>
          </section>

          {business && (
            <Link href={`/business/${business.slug}`} className="surface press block p-5">
              <p className="eyebrow mb-1">Business</p>
              <p className="font-editorial text-lg font-semibold">{business.name}</p>
              <p className="text-sm text-muted">{business.tagline}</p>
              <p className="mt-2 text-sm font-semibold text-gold">ดูโปรไฟล์ธุรกิจ →</p>
            </Link>
          )}
        </aside>
      </div>

      {similar.length > 0 && (
        <section><SectionHeader title={`${placeCategoryLabel(p.category)}อื่น ๆ ที่น่าสนใจ`} /><div className="grid gap-5 sm:grid-cols-3">{similar.map((x) => <PlaceCard key={x.id} place={x} />)}</div></section>
      )}
    </div>
  );
}
