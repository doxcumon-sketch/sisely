/**
 * Demo content for SISE. Idempotent: upserts by stable id/slug, so it is safe to re-run
 * (re-running also refreshes relative dates for events, deals and post ages).
 * Never run against a production database with real members unless SEED_FORCE=1.
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Prisma } from "../generated/prisma/client";
import { users } from "../lib/data/users";
import { rooms } from "../lib/data/rooms";
import { places } from "../lib/data/places";
import { events } from "../lib/data/events";
import { deals, listings, businesses } from "../lib/data/commerce";
import { seedPosts, seedComments } from "../lib/data/posts";
import { seedReports } from "../lib/data/misc";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });

const MIN = 60_000;
const ago = (min: number) => new Date(Date.now() - min * MIN);
const bangkokDay = (offset: number) => {
  const bkk = new Date(Date.now() + 7 * 3600_000);
  return new Date(Date.UTC(bkk.getUTCFullYear(), bkk.getUTCMonth(), bkk.getUTCDate() + offset));
};
const BADGE = { founder: "FOUNDER", "local-guide": "LOCAL_GUIDE", business: "BUSINESS", moderator: "MODERATOR" } as const;
const COND = { new: "new", "like-new": "like_new", used: "used", "n/a": "na" } as const;
const CAT = (c: string) => c.replace("-", "_") as never;
const fingerprint = (t: string, b: string) => (t + b).toLowerCase().replace(/\s+/g, "");

async function main() {
  if (process.env.NODE_ENV === "production" && process.env.SEED_FORCE !== "1") {
    const n = await prisma.user.count({ where: { lineUserId: { not: null } } });
    if (n > 0) throw new Error("Refusing to seed: database already has real members. Set SEED_FORCE=1 to override.");
  }

  for (const [i, u] of users.filter((u) => u.id !== "u-me").entries()) {
    const data = { handle: u.handle, name: u.name, bio: u.bio, area: u.area, tone: u.tone, reputation: u.reputation, badge: u.badge ? BADGE[u.badge] : null, role: u.badge === "moderator" ? ("MODERATOR" as const) : ("MEMBER" as const), createdAt: ago(u.joinedDays * 1440) };
    await prisma.user.upsert({ where: { id: u.id }, update: data, create: { id: u.id, ...data } });
    void i;
  }

  for (const [i, r] of rooms.entries()) {
    const data = { slug: r.slug, name: r.name, icon: r.icon, tone: r.tone, tagline: r.tagline, description: r.description, group: r.group, trending: !!r.trending, sortOrder: i, memberCount: r.members, postCount: r.posts };
    await prisma.room.upsert({ where: { id: r.id }, update: data, create: { id: r.id, ...data } });
  }

  for (const b of businesses) {
    const data = { slug: b.slug, name: b.name, tagline: b.tagline, description: b.description, category: b.category, tone: b.tone, plan: b.plan.toUpperCase() as never, verified: b.verified, address: b.address, phone: b.phone, line: b.line, hours: b.hours, offerings: b.offerings as Prisma.InputJsonValue, followerCount: b.followers, mentionCount: b.mentions };
    await prisma.business.upsert({ where: { id: b.id }, update: data, create: { id: b.id, ...data } });
  }
  const bizBySlug = new Map(businesses.map((b) => [b.slug, b.id]));

  for (const p of places) {
    const data = { slug: p.slug, name: p.name, category: p.category, tone: p.tone, tagline: p.tagline, description: p.description, address: p.address, district: p.district, lat: p.lat, lng: p.lng, hours: p.hours as Prisma.InputJsonValue, phone: p.phone, line: p.line, priceLevel: p.priceLevel, ratingAvg: p.rating, ratingCount: p.reviews, mentions: p.mentions, highlights: p.highlights, followerCount: p.followers, businessId: p.businessSlug ? bizBySlug.get(p.businessSlug) ?? null : null };
    await prisma.place.upsert({ where: { id: p.id }, update: data, create: { id: p.id, ...data } });
  }
  const placeBySlug = new Map(places.map((p) => [p.slug, p.id]));

  for (const e of events) {
    const data = { slug: e.slug, title: e.title, category: e.category, tone: e.tone, summary: e.summary, description: e.description, startDate: bangkokDay(e.dayOffset), endDate: bangkokDay(e.dayOffset + e.durationDays - 1), startTime: e.startTime, endTime: e.endTime, venue: e.venue, placeId: e.placeSlug ? placeBySlug.get(e.placeSlug) ?? null : null, address: e.address, price: e.price, organizer: e.organizer, contact: e.contact, ticketInfo: e.ticketInfo, interestedCount: e.interested, goingCount: e.going };
    await prisma.event.upsert({ where: { id: e.id }, update: data, create: { id: e.id, ...data } });
  }
  const eventBySlug = new Map(events.map((e) => [e.slug, e.id]));

  for (const d of deals) {
    const data = { title: d.title, businessName: d.businessName, placeId: d.placeSlug ? placeBySlug.get(d.placeSlug) ?? null : null, businessId: d.businessSlug ? bizBySlug.get(d.businessSlug) ?? null : null, tone: d.tone, description: d.description, discount: d.discount, endsAt: new Date(Date.now() + d.endsInHours * 3600_000), terms: d.terms, claimedCount: d.claimed, sponsored: !!d.sponsored };
    await prisma.deal.upsert({ where: { id: d.id }, update: data, create: { id: d.id, ...data } });
  }

  for (const l of listings) {
    const data = { title: l.title, category: CAT(l.category), price: l.price, negotiable: l.negotiable, condition: COND[l.condition], location: l.location, description: l.description, sellerId: l.sellerId, tone: l.tone, contact: l.contact, promoted: !!l.promoted, saveCount: l.saves, viewCount: l.views, createdAt: ago(l.ageMin) };
    await prisma.listing.upsert({ where: { id: l.id }, update: data, create: { id: l.id, ...data } });
  }

  for (const p of seedPosts) {
    const room = rooms.find((r) => r.slug === p.roomSlug)!;
    const data = {
      type: p.type, roomId: room.id, authorId: p.authorId, title: p.title, body: p.body, covers: p.images ?? [], location: p.location,
      placeId: p.placeSlug ? placeBySlug.get(p.placeSlug) ?? null : null, eventId: p.eventSlug ? eventBySlug.get(p.eventSlug) ?? null : null,
      dealId: p.dealId ?? null, listingId: p.listingId ?? null, pinned: !!p.pinned, solved: !!p.solved,
      pollEndsAt: p.poll ? new Date(Date.now() + p.poll.endsInHours * 3600_000) : null, fingerprint: fingerprint(p.title, p.body),
      viewCount: p.stats.views, commentCount: p.stats.comments, reactionCount: p.stats.reactions, saveCount: p.stats.saves, shareCount: p.stats.shares, velocity: p.stats.velocity,
      createdAt: ago(p.ageMin),
    };
    await prisma.post.upsert({ where: { id: p.id }, update: data, create: { id: p.id, ...data } });
    if (p.poll) {
      for (const [i, o] of p.poll.options.entries()) {
        const id = `${p.id}-${o.id}`;
        await prisma.pollOption.upsert({ where: { id }, update: { label: o.label, votes: o.votes, position: i }, create: { id, postId: p.id, label: o.label, votes: o.votes, position: i } });
      }
    }
  }

  // Parents before replies.
  for (const c of [...seedComments].sort((a, b) => Number(!!a.parentId) - Number(!!b.parentId))) {
    const data = { postId: c.postId, parentId: c.parentId ?? null, authorId: c.authorId, body: c.body, likeCount: c.likes, isBest: !!c.best, createdAt: ago(c.ageMin) };
    await prisma.comment.upsert({ where: { id: c.id }, update: data, create: { id: c.id, ...data } });
  }

  const mod = await prisma.user.findFirstOrThrow({ where: { role: "MODERATOR" } });
  void mod;
  for (const r of seedReports.filter((r) => r.targetType !== "comment" || seedComments.some((c) => c.id === r.targetId))) {
    const targetType = r.targetType.toUpperCase() as "POST" | "COMMENT" | "USER" | "LISTING";
    const data = { reporterId: r.reporterId, targetType, targetId: r.targetId, reason: r.reason, note: r.note, status: r.status.toUpperCase() as never, createdAt: ago(r.ageMin) };
    await prisma.report.upsert({ where: { id: r.id }, update: data, create: { id: r.id, ...data } });
  }

  const counts = await Promise.all([prisma.user.count(), prisma.room.count(), prisma.post.count(), prisma.comment.count(), prisma.place.count(), prisma.event.count()]);
  console.log(`seeded: users=${counts[0]} rooms=${counts[1]} posts=${counts[2]} comments=${counts[3]} places=${counts[4]} events=${counts[5]}`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
