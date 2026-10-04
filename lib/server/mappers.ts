import type { Prisma } from "../../generated/prisma/client";
import type { AuthorLite, Business, Comment, Deal, Listing, Place, Post, Room, SiseEvent, User } from "@/lib/types";

const MIN = 60_000;
const BADGE = { FOUNDER: "founder", LOCAL_GUIDE: "local-guide", BUSINESS: "business", MODERATOR: "moderator" } as const;
const COND = { new: "new", like_new: "like-new", used: "used", na: "n/a" } as const;

export const authorSelect = { id: true, handle: true, name: true, tone: true, pictureUrl: true, badge: true } satisfies Prisma.UserSelect;
type AuthorRow = Prisma.UserGetPayload<{ select: typeof authorSelect }>;

export const postInclude = {
  room: { select: { slug: true, name: true, icon: true } },
  author: { select: authorSelect },
  place: { select: { slug: true, name: true } },
  event: { select: { slug: true, title: true } },
  options: { orderBy: { position: "asc" } },
  photos: { select: { id: true }, orderBy: { position: "asc" } },
  deal: { select: { id: true } },
  listing: { select: { id: true } },
} satisfies Prisma.PostInclude;
type PostRow = Prisma.PostGetPayload<{ include: typeof postInclude }>;

export const commentInclude = { author: { select: authorSelect } } satisfies Prisma.CommentInclude;
type CommentRow = Prisma.CommentGetPayload<{ include: typeof commentInclude }>;

export const toAuthor = (u: AuthorRow): AuthorLite => ({
  id: u.id,
  handle: u.handle,
  name: u.name,
  tone: u.tone,
  pictureUrl: u.pictureUrl,
  badge: u.badge ? BADGE[u.badge] : undefined,
});

export function toPost(p: PostRow, now = Date.now()): Post {
  return {
    id: p.id,
    type: p.type,
    roomSlug: p.room.slug,
    room: p.room,
    authorId: p.authorId,
    author: toAuthor(p.author),
    title: p.title,
    body: p.body,
    ageMin: Math.max(0, Math.floor((now - p.createdAt.getTime()) / MIN)),
    createdAt: p.createdAt.getTime(),
    images: p.covers.length ? p.covers : undefined,
    photos: p.photos.length ? p.photos.map((x) => `/api/photos/${x.id}`) : undefined,
    poll: p.options.length
      ? { endsInHours: Math.max(0, Math.round(((p.pollEndsAt?.getTime() ?? now) - now) / 3_600_000)), options: p.options.map((o) => ({ id: o.id, label: o.label, votes: o.votes })) }
      : undefined,
    placeRef: p.place ?? undefined,
    eventRef: p.event ?? undefined,
    dealId: p.deal?.id,
    listingId: p.listing?.id,
    location: p.location ?? undefined,
    pinned: p.pinned,
    featured: p.featured,
    solved: p.solved,
    status: p.status,
    stats: { views: p.viewCount, comments: p.commentCount, reactions: p.reactionCount, saves: p.saveCount, shares: p.shareCount, velocity: p.velocity },
  };
}

export function toComment(c: CommentRow, now = Date.now()): Comment {
  return {
    id: c.id,
    postId: c.postId,
    parentId: c.parentId ?? undefined,
    authorId: c.authorId,
    author: toAuthor(c.author),
    body: c.body,
    ageMin: Math.max(0, Math.floor((now - c.createdAt.getTime()) / MIN)),
    createdAt: c.createdAt.getTime(),
    likes: c.likeCount,
    best: c.isBest || undefined,
  };
}

export const toRoom = (r: Prisma.RoomGetPayload<object>): Room => ({
  id: r.id, slug: r.slug, name: r.name, icon: r.icon, tone: r.tone, tagline: r.tagline, description: r.description,
  members: r.memberCount, posts: r.postCount, trending: r.trending || undefined, group: r.group,
});

/** Calendar offset (Bangkok) of a stored date relative to today. */
export function dayOffsetOf(date: Date, now = Date.now()): number {
  const bkk = new Date(now + 7 * 3_600_000);
  const today = Date.UTC(bkk.getUTCFullYear(), bkk.getUTCMonth(), bkk.getUTCDate());
  return Math.round((date.getTime() - today) / 86_400_000);
}

export function toEvent(e: Prisma.EventGetPayload<{ include: { place: { select: { slug: true } } } }>, now = Date.now()): SiseEvent {
  const start = dayOffsetOf(e.startDate, now);
  const end = dayOffsetOf(e.endDate, now);
  return {
    id: e.id, slug: e.slug, title: e.title, category: e.category, tone: e.tone, summary: e.summary, description: e.description,
    dayOffset: start, durationDays: Math.max(1, end - start + 1), startTime: e.startTime, endTime: e.endTime ?? undefined,
    venue: e.venue, placeSlug: e.place?.slug, address: e.address, price: e.price, organizer: e.organizer, contact: e.contact,
    ticketInfo: e.ticketInfo, interested: e.interestedCount, going: e.goingCount,
  };
}

export function toPlace(p: Prisma.PlaceGetPayload<{ include: { business: { select: { slug: true } } } }>): Place {
  return {
    id: p.id, slug: p.slug, name: p.name, category: p.category, tone: p.tone, tagline: p.tagline, description: p.description,
    address: p.address, district: p.district, lat: p.lat, lng: p.lng, hours: p.hours as Place["hours"], phone: p.phone ?? undefined,
    facebook: p.facebook ?? undefined, line: p.line ?? undefined, priceLevel: p.priceLevel as Place["priceLevel"], rating: p.ratingAvg,
    reviews: p.ratingCount, mentions: p.mentions, highlights: p.highlights, followers: p.followerCount, businessSlug: p.business?.slug,
  };
}

export function toDeal(d: Prisma.DealGetPayload<{ include: { place: { select: { slug: true } }; business: { select: { slug: true } } } }>, now = Date.now()): Deal {
  return {
    id: d.id, title: d.title, businessName: d.businessName, placeSlug: d.place?.slug, businessSlug: d.business?.slug, tone: d.tone,
    description: d.description, discount: d.discount, endsInHours: Math.max(0, Math.round((d.endsAt.getTime() - now) / 3_600_000)),
    terms: d.terms, claimed: d.claimedCount, sponsored: d.sponsored || undefined,
  };
}

export function toListing(l: Prisma.ListingGetPayload<object>, now = Date.now()): Listing {
  return {
    id: l.id, title: l.title, category: l.category.replace("_", "-") as Listing["category"], price: l.price, negotiable: l.negotiable,
    condition: COND[l.condition], location: l.location, description: l.description, sellerId: l.sellerId, tone: l.tone,
    ageMin: Math.max(0, Math.floor((now - l.createdAt.getTime()) / MIN)), saves: l.saveCount, views: l.viewCount, contact: l.contact,
    promoted: l.promoted || undefined,
  };
}

export function toBusiness(b: Prisma.BusinessGetPayload<{ include: { places: { select: { slug: true } } } }>): Business {
  return {
    id: b.id, slug: b.slug, name: b.name, tagline: b.tagline, description: b.description, category: b.category, tone: b.tone,
    plan: b.plan.toLowerCase() as Business["plan"], verified: b.verified, address: b.address, phone: b.phone, line: b.line ?? undefined,
    hours: b.hours, offerings: b.offerings as Business["offerings"], placeSlug: b.places[0]?.slug, followers: b.followerCount, mentions: b.mentionCount,
  };
}

export function toUser(
  u: Prisma.UserGetPayload<object>,
  counts: { followers: number; following: number },
  now = Date.now(),
): User {
  return {
    id: u.id, pictureUrl: u.pictureUrl, handle: u.handle, name: u.name, bio: u.bio, area: u.area, tone: u.tone,
    joinedDays: Math.max(0, Math.floor((now - u.createdAt.getTime()) / 86_400_000)), followers: counts.followers, following: counts.following,
    reputation: u.reputation, badge: u.badge ? BADGE[u.badge] : undefined,
  };
}
