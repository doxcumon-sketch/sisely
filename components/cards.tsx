import { Clock, Flame, MapPin, Star, Users } from "lucide-react";
import Link from "next/link";
import { Cover, cx } from "@/components/ui";
import { RoomIcon } from "@/components/icons";
import { EVENT_CATEGORY_LABEL } from "@/lib/data/events";
import { placeCategoryLabel } from "@/lib/data/places";
import { formatBaht, formatCount, formatDateTh, weekdayShort } from "@/lib/format";
import { CONDITION_LABEL } from "@/lib/data/commerce";
import { eventPhoto, placePhoto, roomPhoto } from "@/lib/covers";
import type { Deal, Listing, Place, Room, SiseEvent } from "@/lib/types";


export function RoomCard({ room, compact }: { room: Room; compact?: boolean }) {
  return (
    <Link href={`/rooms/${room.slug}`} className="surface press group block overflow-hidden transition-shadow hover:shadow-[var(--shadow-pop)]">
      <Cover tone={room.tone} icon={room.icon} photo={roomPhoto(room.slug)} className={compact ? "h-20" : "h-32"}>
        <span className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur-sm">
          <RoomIcon name={room.icon} className="h-5 w-5" />
        </span>
        {room.trending && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-sm bg-black/35 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm">
            <Flame className="h-3 w-3" /> Trending
          </span>
        )}
      </Cover>
      <div className="p-4">
        <h3 className="font-editorial text-lg font-semibold leading-tight group-hover:text-gold">{room.name}</h3>
        {!compact && <p className="mt-1 line-clamp-2 text-sm text-muted">{room.description}</p>}
        <p className="mt-2 flex items-center gap-3 text-xs text-muted">
          <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {formatCount(room.members)} สมาชิก</span>
          <span>{formatCount(room.posts)} โพสต์</span>
        </p>
      </div>
    </Link>
  );
}

export function PlaceCard({ place, className }: { place: Place; className?: string }) {
  return (
    <Link href={`/places/${place.slug}`} className={cx("surface press group block overflow-hidden transition-shadow hover:shadow-[var(--shadow-pop)]", className)}>
      <Cover tone={place.tone} photo={placePhoto(place.slug)} icon={place.category === "restaurant" ? "food" : place.category === "cafe" ? "cafe" : place.category === "attraction" ? "travel" : place.category === "hotel" ? "hotel" : place.category === "shopping" ? "shopping" : place.category === "nightlife" ? "nightlife" : place.category === "service" ? "service" : "activity"} className="aspect-[16/10]">
        <span className="absolute left-3 top-3 rounded-sm bg-black/35 px-2.5 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm">{placeCategoryLabel(place.category)}</span>
      </Cover>
      <div className="p-4">
        <h3 className="font-editorial text-lg font-semibold leading-tight group-hover:text-gold">{place.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted">{place.tagline}</p>
        <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
          {place.reviews > 0 && <span className="inline-flex items-center gap-1 font-semibold text-ink"><Star className="h-3.5 w-3.5 fill-gold text-gold" /> {place.rating.toFixed(1)} <span className="font-normal text-muted">({place.reviews})</span></span>}
          <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {place.district}</span>
          <span>{"฿".repeat(place.priceLevel)}</span>
        </p>
      </div>
    </Link>
  );
}

export function EventCard({ event, className, featured }: { event: SiseEvent; className?: string; featured?: boolean }) {
  const multi = event.durationDays > 1;
  return (
    <Link href={`/events/${event.slug}`} className={cx("surface press group flex overflow-hidden transition-shadow hover:shadow-[var(--shadow-pop)]", featured ? "flex-col" : "flex-row", className)}>
      <Cover tone={event.tone} icon="events" photo={eventPhoto(event.category)} className={featured ? "aspect-[16/9] w-full" : "w-28 shrink-0 sm:w-36"}>
        <div className="absolute left-3 top-3 flex flex-col items-center rounded-xl bg-card/95 px-2.5 py-1.5 text-center leading-none text-ink shadow">
          <span className="text-[10px] font-semibold text-laterite">{weekdayShort(event.dayOffset)}</span>
          <span className="font-editorial text-xl font-bold">{formatDateTh(event.dayOffset).split(" ")[0]}</span>
          <span className="text-[10px] text-muted">{formatDateTh(event.dayOffset).split(" ")[1]}</span>
        </div>
      </Cover>
      <div className="min-w-0 flex-1 p-4">
        <p className="eyebrow mb-1">{EVENT_CATEGORY_LABEL[event.category]}</p>
        <h3 className="font-editorial text-[1.05rem] font-semibold leading-snug group-hover:text-gold">{event.title}</h3>
        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted">
          <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {event.startTime}{event.endTime ? `–${event.endTime}` : ""}{multi ? ` · ${event.durationDays} วัน` : ""}</span>
          <span className="inline-flex items-center gap-1 truncate"><MapPin className="h-3.5 w-3.5" /> {event.venue}</span>
        </p>
        <p className="mt-2 flex items-center justify-between text-xs">
          <span className="font-semibold text-ink">{event.price}</span>
          <span className="text-muted">{formatCount(event.interested)} คนสนใจ</span>
        </p>
      </div>
    </Link>
  );
}

export function DealCard({ deal }: { deal: Deal }) {
  return (
    <Link href={deal.placeSlug ? `/places/${deal.placeSlug}` : "/deals"} className="surface press group relative flex overflow-hidden transition-shadow hover:shadow-[var(--shadow-pop)]">
      <Cover tone={deal.tone} icon="deal" className="flex w-28 shrink-0 items-center justify-center sm:w-32">
        <span className="font-editorial px-2 text-center text-lg font-bold leading-tight text-white drop-shadow">{deal.discount}</span>
      </Cover>
      <div className="min-w-0 flex-1 p-4">
        {deal.sponsored && <span className="mb-1 inline-block rounded bg-gold-soft px-1.5 py-px text-[10px] font-bold uppercase tracking-wide text-[#7a5a14] dark:text-gold">สปอนเซอร์</span>}
        <h3 className="font-editorial text-[1.05rem] font-semibold leading-snug group-hover:text-gold">{deal.title}</h3>
        <p className="mt-0.5 text-sm text-muted">{deal.businessName}</p>
        <p className="mt-2 flex items-center justify-between text-xs text-muted">
          <span className="inline-flex items-center gap-1 font-semibold text-laterite"><Clock className="h-3.5 w-3.5" /> {deal.endsInHours < 24 ? `เหลือ ${deal.endsInHours} ชม.` : `เหลือ ${Math.round(deal.endsInHours / 24)} วัน`}</span>
          <span>{deal.claimed} คนใช้แล้ว</span>
        </p>
      </div>
    </Link>
  );
}

export function ListingCard({ listing, sellerName }: { listing: Listing; sellerName: string }) {
  return (
    <Link href={`/market/${listing.id}`} className="surface press group block overflow-hidden transition-shadow hover:shadow-[var(--shadow-pop)]">
      <Cover tone={listing.tone} icon="market" className="aspect-square">
        {listing.promoted && <span className="absolute left-3 top-3 rounded-sm bg-gold px-2.5 py-0.5 text-[11px] font-bold text-night">โปรโมต</span>}
      </Cover>
      <div className="p-3.5">
        <p className="font-editorial text-lg font-bold text-ink">{formatBaht(listing.price)}{listing.category === "agriculture" || listing.category === "services" ? <span className="text-xs font-normal text-muted"> เริ่มต้น</span> : null}</p>
        <h3 className="mt-0.5 line-clamp-2 text-[0.95rem] font-medium leading-snug group-hover:text-gold">{listing.title}</h3>
        <p className="mt-1.5 flex items-center justify-between text-xs text-muted">
          <span className="inline-flex items-center gap-1 truncate"><MapPin className="h-3 w-3" /> {listing.location}</span>
          <span>{CONDITION_LABEL[listing.condition]}</span>
        </p>
        <p className="mt-0.5 truncate text-xs text-faint">โดย {sellerName}</p>
      </div>
    </Link>
  );
}
