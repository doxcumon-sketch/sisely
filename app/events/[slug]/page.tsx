import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, Clock, MapPin, Ticket, User, Phone } from "lucide-react";
import { InterestedButton, SaveButton } from "@/components/buttons";
import { Feed } from "@/components/feed";
import { ShareButton } from "@/components/share";
import { Cover, SectionHeader } from "@/components/ui";
import { EVENT_CATEGORY_LABEL } from "@/lib/data";
import { getEvent, getPlace, listEvents, queryPosts } from "@/lib/server/repo";
import { bangkokDate, dayLabel, formatCount } from "@/lib/format";
import { EventCard } from "@/components/cards";
import { SITE_URL } from "@/lib/site";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const e = await getEvent(slug);
  if (!e) return {};
  return {
    title: `${e.title} — ${EVENT_CATEGORY_LABEL[e.category]}ศรีสะเกษ`,
    description: `${e.summary} ${e.venue} เวลา ${e.startTime} ค่าเข้า ${e.price}`,
    alternates: { canonical: `/events/${e.slug}` },
    openGraph: { title: e.title, description: e.summary },
  };
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const e = await getEvent(slug);
  if (!e) notFound();
  const [place, events, initialPosts] = await Promise.all([e.placeSlug ? getPlace(e.placeSlug) : null, listEvents(), queryPosts({ mode: "new", eventSlug: e.slug, limit: 4 })]);
  const more = events.filter((x) => x.id !== e.id).slice(0, 2);
  const start = bangkokDate(e.dayOffset).toISOString().slice(0, 10);
  const end = bangkokDate(e.dayOffset + e.durationDays - 1).toISOString().slice(0, 10);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: e.title,
    description: e.summary,
    startDate: `${start}T${e.startTime}:00+07:00`,
    endDate: `${end}T${e.endTime ?? "23:00"}:00+07:00`,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: { "@type": "Place", name: e.venue, address: { "@type": "PostalAddress", streetAddress: e.address, addressRegion: "ศรีสะเกษ", addressCountry: "TH" } },
    organizer: { "@type": "Organization", name: e.organizer },
    url: `${SITE_URL}/events/${e.slug}`,
  };

  const rows = [
    { icon: Calendar, label: "วันที่", value: `${dayLabel(e.dayOffset)}${e.durationDays > 1 ? ` – ${dayLabel(e.dayOffset + e.durationDays - 1)}` : ""}` },
    { icon: Clock, label: "เวลา", value: `${e.startTime}${e.endTime ? ` – ${e.endTime} น.` : " น."}` },
    { icon: MapPin, label: "สถานที่", value: `${e.venue} · ${e.address}` },
    { icon: Ticket, label: "ราคา", value: e.price },
    { icon: User, label: "ผู้จัด", value: e.organizer },
    { icon: Phone, label: "ติดต่อ", value: e.contact },
  ];

  return (
    <div className="space-y-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <nav aria-label="breadcrumb" className="text-sm text-muted"><Link href="/events" className="hover:text-ink">งาน</Link> / <span className="text-ink">{e.title}</span></nav>

      <header className="surface overflow-hidden">
        <Cover tone={e.tone} icon="events" className="h-52 sm:h-80">
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent p-5 pt-20 text-white sm:p-8">
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-white/80">{EVENT_CATEGORY_LABEL[e.category]} · {dayLabel(e.dayOffset)}</p>
            <h1 className="font-editorial text-2xl font-bold leading-tight sm:text-4xl">{e.title}</h1>
          </div>
        </Cover>
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:px-8">
          <p className="text-sm text-muted"><b className="text-ink">{formatCount(e.interested)}</b> สนใจ · <b className="text-ink">{formatCount(e.going)}</b> ไปแน่นอน</p>
          <div className="flex flex-wrap gap-2">
            <InterestedButton slug={e.slug} base={e.interested} />
            <SaveButton kind="events" id={e.slug} />
            <ShareButton path={`/events/${e.slug}`} title={e.title} className="press inline-flex items-center gap-1.5 rounded-sm border border-line px-4 py-2.5 text-[0.95rem] font-semibold hover:border-gold" label="แชร์" />
          </div>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 space-y-8">
          <section><h2 className="font-editorial mb-2 text-xl font-semibold">รายละเอียดงาน</h2><p className="leading-[1.85] text-ink-2">{e.description}</p></section>
          <section className="surface-flat p-5"><h2 className="font-editorial mb-1 text-lg font-semibold">ข้อมูลบัตร</h2><p className="text-ink-2">{e.ticketInfo}</p></section>
          <section>
            <SectionHeader eyebrow="Discussion" title="คนคุยเรื่องงานนี้" href={`/create?type=question`} hrefLabel="+ ถาม" />
            <Feed filter={{ mode: "new", eventSlug: e.slug }} initial={initialPosts} pageSize={4} emptyTitle="ยังไม่มีใครพูดถึงงานนี้" emptyHint="ถามเรื่องที่จอดรถ ราคา หรือชวนเพื่อนไปด้วยกัน" />
          </section>
        </div>
        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <section className="surface p-5">
            <dl className="space-y-4">
              {rows.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex gap-3"><Icon className="mt-0.5 h-5 w-5 shrink-0 text-gold" aria-hidden="true" /><div><dt className="text-xs text-muted">{label}</dt><dd className="font-medium">{value}</dd></div></div>
              ))}
            </dl>
          </section>
          {place && (
            <Link href={`/places/${place.slug}`} className="surface press block p-5"><p className="eyebrow mb-1">Venue</p><p className="font-editorial text-lg font-semibold">{place.name}</p><p className="text-sm text-muted">{place.tagline}</p></Link>
          )}
          <section className="surface overflow-hidden"><iframe title={`แผนที่ ${e.venue}`} loading="lazy" className="h-52 w-full border-0" src="https://www.openstreetmap.org/export/embed.html?bbox=104.30,15.10,104.35,15.14&layer=mapnik" /></section>
        </aside>
      </div>

      <section><SectionHeader title="งานอื่นที่น่าสนใจ" href="/events" /><div className="grid gap-4 md:grid-cols-2">{more.map((x) => <EventCard key={x.id} event={x} />)}</div></section>
    </div>
  );
}
