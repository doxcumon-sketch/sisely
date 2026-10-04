import "server-only";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "../../generated/prisma/client";
import { forYouScore, trendingScore, engagement } from "@/lib/ranking";
import type { Business, Comment, Deal, Listing, Place, Post, Room, SiseEvent, User, Viewer } from "@/lib/types";
import { commentInclude, postInclude, toBusiness, toComment, toDeal, toEvent, toListing, toPlace, toPost, toRoom, toUser } from "@/lib/server/mappers";

const placeInclude = { business: { select: { slug: true } } } satisfies Prisma.PlaceInclude;
const eventInclude = { place: { select: { slug: true } } } satisfies Prisma.EventInclude;
const dealInclude = { place: { select: { slug: true } }, business: { select: { slug: true } } } satisfies Prisma.DealInclude;

/* ------------------------------ rooms & directory ------------------------------ */

export async function listRooms(): Promise<Room[]> {
  return (await prisma.room.findMany({ orderBy: { sortOrder: "asc" } })).map(toRoom);
}
export async function getRoom(slug: string): Promise<Room | null> {
  const r = await prisma.room.findUnique({ where: { slug } });
  return r ? toRoom(r) : null;
}

export async function listPlaces(category?: string): Promise<Place[]> {
  const rows = await prisma.place.findMany({
    where: category ? { category: category as never } : undefined,
    include: placeInclude,
  });
  return rows.map(toPlace).sort((a, b) => b.rating * Math.log(b.reviews + 2) - a.rating * Math.log(a.reviews + 2));
}
export async function getPlace(slug: string): Promise<Place | null> {
  const p = await prisma.place.findUnique({ where: { slug }, include: placeInclude });
  return p ? toPlace(p) : null;
}

export async function listEvents(): Promise<SiseEvent[]> {
  const rows = await prisma.event.findMany({ include: eventInclude, orderBy: { startDate: "asc" } });
  return rows.map((e) => toEvent(e)).filter((e) => e.dayOffset + e.durationDays > 0); // hide events that already ended
}
export async function getEvent(slug: string): Promise<SiseEvent | null> {
  const e = await prisma.event.findUnique({ where: { slug }, include: eventInclude });
  return e ? toEvent(e) : null;
}

export async function listDeals(): Promise<Deal[]> {
  const rows = await prisma.deal.findMany({ where: { endsAt: { gt: new Date() } }, include: dealInclude, orderBy: { endsAt: "asc" } });
  return rows.map((d) => toDeal(d));
}
export async function getDeal(id: string): Promise<Deal | null> {
  const d = await prisma.deal.findUnique({ where: { id }, include: dealInclude });
  return d ? toDeal(d) : null;
}

export async function listListings(category?: string): Promise<(Listing & { sellerName: string })[]> {
  const rows = await prisma.listing.findMany({
    where: { status: "PUBLISHED", ...(category ? { category: category.replace("-", "_") as never } : {}) },
    include: { seller: { select: { name: true } } },
    orderBy: [{ promoted: "desc" }, { createdAt: "desc" }],
  });
  return rows.map((l) => ({ ...toListing(l), sellerName: l.seller.name }));
}
export async function getListing(id: string) {
  const l = await prisma.listing.findUnique({ where: { id }, include: { seller: true } });
  if (!l || l.status !== "PUBLISHED") return null;
  const [followers, following] = await Promise.all([countFollowers(l.sellerId), countFollowing(l.sellerId)]);
  return { listing: toListing(l), seller: toUser(l.seller, { followers, following }) };
}

export async function listBusinesses(): Promise<Business[]> {
  return (await prisma.business.findMany({ include: { places: { select: { slug: true } } }, orderBy: { followerCount: "desc" } })).map(toBusiness);
}
export async function getBusiness(slug: string): Promise<Business | null> {
  const b = await prisma.business.findUnique({ where: { slug }, include: { places: { select: { slug: true } } } });
  return b ? toBusiness(b) : null;
}

/* --------------------------------- users --------------------------------- */

const countFollowers = (id: string) => prisma.follow.count({ where: { targetType: "USER", targetId: id } });
const countFollowing = (id: string) => prisma.follow.count({ where: { followerId: id, targetType: "USER" } });

export async function getProfile(handle: string): Promise<(User & { posts: number; comments: number }) | null> {
  const u = await prisma.user.findUnique({ where: { handle } });
  if (!u || u.status === "BANNED") return null;
  const [followers, following, posts, comments] = await Promise.all([
    countFollowers(u.id),
    countFollowing(u.id),
    prisma.post.count({ where: { authorId: u.id, status: "PUBLISHED" } }),
    prisma.comment.count({ where: { authorId: u.id, status: "PUBLISHED" } }),
  ]);
  return { ...toUser(u, { followers, following }), posts, comments };
}

export async function listUserComments(userId: string, limit = 20): Promise<{ id: string; body: string; postId: string; postTitle: string }[]> {
  const rows = await prisma.comment.findMany({
    where: { authorId: userId, status: "PUBLISHED", post: { status: "PUBLISHED" } },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: { id: true, body: true, postId: true, post: { select: { title: true } } },
  });
  return rows.map((c) => ({ id: c.id, body: c.body, postId: c.postId, postTitle: c.post.title }));
}

/* ----------------------------------- posts ----------------------------------- */

export type FeedMode = "forYou" | "hot" | "new" | "top" | "unanswered";

export interface FeedQuery {
  mode: FeedMode;
  roomSlug?: string;
  authorId?: string;
  placeSlug?: string;
  eventSlug?: string;
  ids?: string[];
  viewerId?: string;
  offset?: number;
  limit?: number;
}

const CANDIDATES = 300;

export async function viewerHidden(viewerId?: string): Promise<string[]> {
  if (!viewerId) return [];
  const rows = await prisma.block.findMany({ where: { blockerId: viewerId }, select: { blockedId: true } });
  return rows.map((r) => r.blockedId);
}

/** Ranked, filtered, paginated post list. Hidden/pending content never appears in feeds. */
export async function queryPosts(q: FeedQuery): Promise<{ posts: Post[]; hasMore: boolean }> {
  const limit = Math.min(q.limit ?? 8, 30);
  const offset = q.offset ?? 0;
  const hidden = await viewerHidden(q.viewerId);

  const where: Prisma.PostWhereInput = {
    status: "PUBLISHED",
    ...(hidden.length ? { authorId: { notIn: hidden } } : {}),
    ...(q.roomSlug ? { room: { slug: q.roomSlug } } : {}),
    ...(q.authorId ? { authorId: q.authorId } : {}),
    ...(q.placeSlug ? { place: { slug: q.placeSlug } } : {}),
    ...(q.eventSlug ? { event: { slug: q.eventSlug } } : {}),
    ...(q.ids ? { id: { in: q.ids } } : {}),
    ...(q.mode === "unanswered" ? { type: "question", solved: false, commentCount: { lte: 2 } } : {}),
  };
  const now = Date.now();

  if (q.mode === "new" || q.mode === "unanswered") {
    const rows = await prisma.post.findMany({
      where,
      include: postInclude,
      orderBy: [...(q.roomSlug && q.mode === "new" ? [{ pinned: "desc" as const }] : []), { createdAt: "desc" }],
      skip: offset,
      take: limit + 1,
    });
    return { posts: rows.slice(0, limit).map((r) => toPost(r, now)), hasMore: rows.length > limit };
  }

  const rows = await prisma.post.findMany({ where, include: postInclude, orderBy: { createdAt: "desc" }, take: CANDIDATES });
  const posts = rows.map((r) => toPost(r, now));

  let score: (p: Post) => number;
  if (q.mode === "top") score = engagement;
  else if (q.mode === "forYou" && q.viewerId) {
    const [follows, saves] = await Promise.all([
      prisma.follow.findMany({ where: { followerId: q.viewerId }, select: { targetType: true, targetId: true } }),
      prisma.save.findMany({ where: { userId: q.viewerId, targetType: "PLACE" }, select: { targetId: true } }),
    ]);
    const ctx = {
      followedRooms: follows.filter((f) => f.targetType === "ROOM").map((f) => f.targetId),
      followedUsers: follows.filter((f) => f.targetType === "USER").map((f) => f.targetId),
      savedPlaceSlugs: saves.map((s) => s.targetId),
      viewedTopics: [] as string[],
      blocked: hidden,
    };
    score = (p) => forYouScore(p, p.ageMin, ctx);
  } else score = (p) => trendingScore(p, p.ageMin);

  const ranked = posts.sort((a, b) => score(b) - score(a));
  const withPins = q.roomSlug && q.mode === "hot" ? [...ranked.filter((p) => p.pinned), ...ranked.filter((p) => !p.pinned)] : ranked;
  return { posts: withPins.slice(offset, offset + limit), hasMore: withPins.length > offset + limit };
}

export async function getPost(id: string, viewerId?: string): Promise<Post | null> {
  const row = await prisma.post.findUnique({ where: { id }, include: postInclude });
  if (!row) return null;
  if (row.status !== "PUBLISHED" && row.authorId !== viewerId) return null;
  return toPost(row);
}

export async function listComments(postId: string): Promise<Comment[]> {
  const rows = await prisma.comment.findMany({
    where: { postId, status: "PUBLISHED" },
    include: commentInclude,
    orderBy: { createdAt: "asc" },
  });
  return rows.map((c) => toComment(c));
}

export async function listPostIdsForSitemap(): Promise<string[]> {
  return (await prisma.post.findMany({ where: { status: "PUBLISHED" }, select: { id: true }, orderBy: { createdAt: "desc" }, take: 1000 })).map((p) => p.id);
}

/* --------------------------------- viewer --------------------------------- */

export async function getViewer(user: { id: string; handle: string; name: string; pictureUrl: string | null; role: "MEMBER" | "MODERATOR" | "ADMIN" }): Promise<Viewer> {
  const [reactions, saves, follows, votes, likes, blocks, unread] = await Promise.all([
    prisma.reaction.findMany({ where: { userId: user.id }, select: { postId: true, kind: true } }),
    prisma.save.findMany({ where: { userId: user.id }, select: { targetType: true, targetId: true } }),
    prisma.follow.findMany({ where: { followerId: user.id }, select: { targetType: true, targetId: true } }),
    prisma.pollVote.findMany({ where: { userId: user.id }, select: { postId: true, optionId: true } }),
    prisma.commentLike.findMany({ where: { userId: user.id }, select: { commentId: true } }),
    prisma.block.findMany({ where: { blockerId: user.id }, select: { blockedId: true, muteOnly: true } }),
    prisma.notification.count({ where: { recipientId: user.id, readAt: null } }),
  ]);
  const ids = (list: { targetType: string; targetId: string }[], t: string) => list.filter((x) => x.targetType === t).map((x) => x.targetId);
  return {
    user,
    reactions: Object.fromEntries(reactions.map((r) => [r.postId, r.kind])),
    saves: { posts: ids(saves, "POST"), places: ids(saves, "PLACE"), events: ids(saves, "EVENT"), listings: ids(saves, "LISTING") },
    follows: { rooms: ids(follows, "ROOM"), users: ids(follows, "USER"), places: ids(follows, "PLACE"), events: ids(follows, "EVENT") },
    votes: Object.fromEntries(votes.map((v) => [v.postId, v.optionId])),
    commentLikes: likes.map((l) => l.commentId),
    blocked: blocks.filter((b) => !b.muteOnly).map((b) => b.blockedId),
    muted: blocks.filter((b) => b.muteOnly).map((b) => b.blockedId),
    unread,
  };
}

export async function listNotifications(userId: string) {
  const rows = await prisma.notification.findMany({
    where: { recipientId: userId },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { actor: { select: { id: true, handle: true, name: true, tone: true, pictureUrl: true, badge: true } } },
  });
  const now = Date.now();
  return rows.map((n) => ({
    id: n.id, kind: n.kind, text: n.text, detail: n.detail ?? undefined, href: n.href, unread: !n.readAt,
    ageMin: Math.max(0, Math.floor((now - n.createdAt.getTime()) / 60_000)),
    actor: n.actor ? { id: n.actor.id, handle: n.actor.handle, name: n.actor.name, tone: n.actor.tone, pictureUrl: n.actor.pictureUrl } : undefined,
  }));
}

/* ---------------------------------- search ---------------------------------- */

const SYNONYMS: Record<string, string[]> = {
  กาแฟ: ["คาเฟ่", "coffee", "ดริป", "ลาเต้"], คาเฟ่: ["กาแฟ", "cafe"], อาหาร: ["กิน", "ร้านอาหาร", "ก๋วยจั๊บ", "หมูกระทะ", "ตลาดเช้า"],
  กิน: ["อาหาร", "ร้านอาหาร", "อร่อย"], เที่ยว: ["ที่เที่ยว", "ผามออีแดง", "ท่องเที่ยว", "ทริป"], งาน: ["อีเวนต์", "คอนเสิร์ต", "ตลาดนัด", "เทศกาล", "กิจกรรม"],
  คอนเสิร์ต: ["ดนตรี", "live", "ดนตรีสด"], ที่พัก: ["โรงแรม", "รีสอร์ต", "ห้องเช่า"], ผ้าไหม: ["ผ้า", "มัดหมี่", "ทอผ้า"], ทุเรียน: ["ผลไม้", "ภูเขาไฟ"],
};
export function expandTerms(q: string): string[] {
  const base = q.trim().toLowerCase().slice(0, 60);
  if (!base) return [];
  const out = new Set([base]);
  for (const [k, v] of Object.entries(SYNONYMS)) if (base.includes(k)) v.forEach((s) => out.add(s));
  return [...out].slice(0, 8);
}

export async function searchAll(q: string, viewerId?: string) {
  const terms = expandTerms(q);
  if (!terms.length) return null;
  const any = (fields: string[]) => ({ OR: terms.flatMap((t) => fields.map((f) => ({ [f]: { contains: t, mode: "insensitive" as const } }))) });
  const hidden = await viewerHidden(viewerId);
  const now = Date.now();
  const [posts, rooms, users, places, businesses, events, deals, listings] = await Promise.all([
    prisma.post.findMany({ where: { status: "PUBLISHED", ...(hidden.length ? { authorId: { notIn: hidden } } : {}), ...any(["title", "body"]) } as Prisma.PostWhereInput, include: postInclude, orderBy: { commentCount: "desc" }, take: 8 }),
    prisma.room.findMany({ where: any(["name", "tagline", "description"]) as Prisma.RoomWhereInput, take: 6 }),
    prisma.user.findMany({ where: { status: "ACTIVE", ...any(["name", "handle", "bio"]) } as Prisma.UserWhereInput, take: 6 }),
    prisma.place.findMany({ where: any(["name", "tagline", "description", "district"]) as Prisma.PlaceWhereInput, include: placeInclude, take: 6 }),
    prisma.business.findMany({ where: any(["name", "tagline", "category", "description"]) as Prisma.BusinessWhereInput, include: { places: { select: { slug: true } } }, take: 6 }),
    prisma.event.findMany({ where: any(["title", "summary", "venue", "description"]) as Prisma.EventWhereInput, include: eventInclude, take: 6 }),
    prisma.deal.findMany({ where: { endsAt: { gt: new Date() }, ...any(["title", "businessName", "description"]) } as Prisma.DealWhereInput, include: dealInclude, take: 6 }),
    prisma.listing.findMany({ where: { status: "PUBLISHED", ...any(["title", "description"]) } as Prisma.ListingWhereInput, include: { seller: { select: { name: true } } }, take: 6 }),
  ]);
  const r = {
    posts: posts.map((p) => toPost(p, now)),
    rooms: rooms.map(toRoom),
    users: users.map((u) => ({ id: u.id, handle: u.handle, name: u.name, tone: u.tone, pictureUrl: u.pictureUrl, area: u.area })),
    places: places.map(toPlace),
    businesses: businesses.map(toBusiness),
    events: events.map((e) => toEvent(e, now)),
    deals: deals.map((d) => toDeal(d, now)),
    listings: listings.map((l) => ({ ...toListing(l, now), sellerName: l.seller.name })),
  };
  return { ...r, total: Object.values(r).reduce((n, a) => n + a.length, 0) };
}

/* ---------------------------------- admin ---------------------------------- */

export async function adminOverview() {
  const since = new Date(Date.now() - 86_400_000);
  const [usersToday, postsToday, commentsToday, activeRoomGroups, reportsOpen, businessesNew, eventsNew, pending, trending, reports, roomCount] = await Promise.all([
    prisma.user.count({ where: { createdAt: { gte: since } } }),
    prisma.post.count({ where: { createdAt: { gte: since } } }),
    prisma.comment.count({ where: { createdAt: { gte: since } } }),
    prisma.post.groupBy({ by: ["roomId"], where: { createdAt: { gte: since } } }),
    prisma.report.count({ where: { status: "OPEN" } }),
    prisma.business.count({ where: { createdAt: { gte: new Date(Date.now() - 30 * 86_400_000) } } }),
    prisma.event.count({ where: { startDate: { gte: new Date() } } }),
    prisma.post.count({ where: { status: "PENDING_REVIEW" } }),
    queryPosts({ mode: "hot", limit: 5 }),
    prisma.report.findMany({ orderBy: { createdAt: "desc" }, take: 100, include: { reporter: { select: { name: true, handle: true, tone: true } } } }),
    prisma.room.count(),
  ]);

  const postIds = reports.filter((r) => r.targetType === "POST").map((r) => r.targetId);
  const commentIds = reports.filter((r) => r.targetType === "COMMENT").map((r) => r.targetId);
  const userIds = reports.filter((r) => r.targetType === "USER").map((r) => r.targetId);
  const listingIds = reports.filter((r) => r.targetType === "LISTING").map((r) => r.targetId);
  const [pPosts, pComments, pUsers, pListings] = await Promise.all([
    prisma.post.findMany({ where: { id: { in: postIds } }, select: { id: true, title: true, status: true } }),
    prisma.comment.findMany({ where: { id: { in: commentIds } }, select: { id: true, body: true, postId: true, status: true } }),
    prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, name: true, handle: true, status: true } }),
    prisma.listing.findMany({ where: { id: { in: listingIds } }, select: { id: true, title: true, status: true } }),
  ]);
  const now = Date.now();
  const queue = reports.map((r) => {
    let label = r.targetId, href: string | undefined, hidden = false;
    if (r.targetType === "POST") { const t = pPosts.find((x) => x.id === r.targetId); label = t?.title ?? label; href = `/post/${r.targetId}`; hidden = t?.status === "HIDDEN"; }
    if (r.targetType === "COMMENT") { const t = pComments.find((x) => x.id === r.targetId); label = t?.body.slice(0, 90) ?? label; href = t ? `/post/${t.postId}#comments` : undefined; hidden = t?.status === "HIDDEN"; }
    if (r.targetType === "USER") { const t = pUsers.find((x) => x.id === r.targetId); label = t?.name ?? label; href = t ? `/u/${t.handle}` : undefined; hidden = t?.status !== "ACTIVE"; }
    if (r.targetType === "LISTING") { const t = pListings.find((x) => x.id === r.targetId); label = t?.title ?? label; href = `/market/${r.targetId}`; hidden = t?.status === "HIDDEN"; }
    return {
      id: r.id, targetType: r.targetType, targetId: r.targetId, reason: r.reason, note: r.note ?? undefined, status: r.status, label, href, hidden,
      ageMin: Math.floor((now - r.createdAt.getTime()) / 60_000), reporter: r.reporter,
    };
  });

  return {
    stats: { usersToday, postsToday, commentsToday, activeRooms: activeRoomGroups.length, roomCount, reportsOpen, businessesNew, eventsNew, pending },
    trending: trending.posts,
    queue,
  };
}
