/**
 * Removes SISE's sample content so only real data remains.
 *
 *   npm run db:clear-demo                         # dry run: shows what would be removed
 *   npm run db:clear-demo -- --yes                # actually removes it
 *   npm run db:clear-demo -- --yes --welcome <handle>   # ...and posts a pinned welcome announcement as <handle>
 *
 * Removes: the demo members (u-*), their posts/comments/reports, demo places/events/deals/businesses/listings

 * (the real landmark "ผามออีแดง" is kept with its invented ratings/quotes reset), and real members' saves/follows that point at removed items.
 * Keeps: rooms, every real member (anyone who signed in with LINE) and everything they created.
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { users } from "../lib/data/users";
import { places } from "../lib/data/places";
import { events } from "../lib/data/events";
import { deals, listings, businesses } from "../lib/data/commerce";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });

const KEEP_PLACE_SLUGS = ["pha-mo-i-daeng"];
const demoUserIds = users.filter((u) => u.id !== "u-me").map((u) => u.id);
const demoPlaces = places.filter((p) => !KEEP_PLACE_SLUGS.includes(p.slug));

async function main() {
  const args = process.argv.slice(2);
  const yes = args.includes("--yes");
  const wi = args.indexOf("--welcome");
  const welcomeHandle = wi >= 0 ? args[wi + 1] : undefined;

  const realMembers = await prisma.user.count({ where: { lineUserId: { not: null } } });
  const [uCount, pCount, cCount] = await Promise.all([
    prisma.user.count({ where: { id: { in: demoUserIds } } }),
    prisma.post.count({ where: { authorId: { in: demoUserIds } } }),
    prisma.comment.count({ where: { authorId: { in: demoUserIds } } }),
  ]);
  console.log(`Real members kept: ${realMembers}`);
  console.log(`Would remove: ${uCount} demo members, ${pCount} posts, ${cCount} comments, ${demoPlaces.length} places, ${events.length} events, ${deals.length} deals, ${listings.length} listings, ${businesses.length} businesses`);
  if (!yes) {
    console.log("Dry run only. Re-run with --yes to apply.");
    return;
  }
  if (welcomeHandle && !(await prisma.user.findUnique({ where: { handle: welcomeHandle } }))) {
    throw new Error(`--welcome: no member with handle "${welcomeHandle}"`);
  }

  const placeIds = demoPlaces.map((p) => p.id);
  const placeSlugs = demoPlaces.map((p) => p.slug);
  const eventIds = events.map((e) => e.id);
  const eventSlugs = events.map((e) => e.slug);
  const dealIds = deals.map((d) => d.id);
  const listingIds = listings.map((l) => l.id);
  const businessIds = businesses.map((b) => b.id);

  await prisma.$transaction(async (tx) => {
    // reports / moderation rows that reference demo members or demo content
    await tx.report.deleteMany({ where: { OR: [{ reporterId: { in: demoUserIds } }, { targetType: "USER", targetId: { in: demoUserIds } }] } });
    await tx.moderationAction.deleteMany({ where: { moderatorId: { in: demoUserIds } } });
    await tx.notification.deleteMany({ where: { OR: [{ recipientId: { in: demoUserIds } }, { actorId: { in: demoUserIds } }] } });

    // demo members' comments (also on real members' posts), then their posts (cascades comments, votes, reactions, photos)
    await tx.comment.deleteMany({ where: { authorId: { in: demoUserIds } } });
    await tx.post.deleteMany({ where: { authorId: { in: demoUserIds } } });

    // detach any remaining posts from demo entities, then remove the entities
    await tx.post.updateMany({ where: { placeId: { in: placeIds } }, data: { placeId: null } });
    await tx.post.updateMany({ where: { eventId: { in: eventIds } }, data: { eventId: null } });
    await tx.post.updateMany({ where: { dealId: { in: dealIds } }, data: { dealId: null } });
    await tx.post.updateMany({ where: { listingId: { in: listingIds } }, data: { listingId: null } });
    await tx.deal.deleteMany({ where: { id: { in: dealIds } } });
    await tx.listing.deleteMany({ where: { id: { in: listingIds } } });
    await tx.event.deleteMany({ where: { id: { in: eventIds } } });
    await tx.place.updateMany({ where: { slug: { in: KEEP_PLACE_SLUGS } }, data: { businessId: null } });
    await tx.place.deleteMany({ where: { id: { in: placeIds } } });
    await tx.business.deleteMany({ where: { id: { in: businessIds } } });

    // saves/follows by real members that pointed at removed items (these have no foreign keys)
    await tx.save.deleteMany({ where: { OR: [{ targetType: "PLACE", targetId: { in: placeSlugs } }, { targetType: "EVENT", targetId: { in: eventSlugs } }, { targetType: "LISTING", targetId: { in: listingIds } }] } });
    await tx.follow.deleteMany({ where: { OR: [{ targetType: "PLACE", targetId: { in: placeSlugs } }, { targetType: "EVENT", targetId: { in: eventSlugs } }, { targetType: "USER", targetId: { in: demoUserIds } }] } });
    // saves of removed posts
    const livePostIds = new Set((await tx.post.findMany({ select: { id: true } })).map((p) => p.id));
    const savedPosts = await tx.save.findMany({ where: { targetType: "POST" }, select: { targetId: true } });
    const orphan = savedPosts.map((s) => s.targetId).filter((id) => !livePostIds.has(id));
    if (orphan.length) await tx.save.deleteMany({ where: { targetType: "POST", targetId: { in: orphan } } });

    await tx.user.deleteMany({ where: { id: { in: demoUserIds }, lineUserId: null } });

    // recompute room counters from what really exists
    for (const r of await tx.room.findMany({ select: { id: true, slug: true } })) {
      const [postCount, memberCount] = await Promise.all([
        tx.post.count({ where: { roomId: r.id, status: "PUBLISHED" } }),
        tx.follow.count({ where: { targetType: "ROOM", targetId: r.slug } }),
      ]);
      await tx.room.update({ where: { id: r.id }, data: { postCount, memberCount } });
    }
    // the kept landmark carried invented ratings/quotes: reset them so nothing fabricated stays public
    await tx.place.updateMany({ where: { slug: { in: KEEP_PLACE_SLUGS } }, data: { followerCount: 0, ratingAvg: 0, ratingCount: 0, mentions: [] } });
  });

  if (welcomeHandle) {
    const author = await prisma.user.findUniqueOrThrow({ where: { handle: welcomeHandle } });
    const room = await prisma.room.findUniqueOrThrow({ where: { slug: "news" } });
    const title = "ยินดีต้อนรับสู่ SISE — พื้นที่ออนไลน์ของคนศรีสะเกษ";
    const body = "SISE คือพื้นที่ของคนศรีสะเกษ ตั้งกระทู้ ถามตอบ แนะนำร้าน บอกงาน และซื้อขายกันได้ในห้องที่ตรงกับเรื่องที่สนใจ\n\nขอให้ช่วยกันดูแลบรรยากาศ: สุภาพ ไม่โพสต์ซ้ำ ไม่แชร์ข่าวที่ยังไม่ยืนยัน และกดปุ่มรายงานเมื่อเจอสแปมหรือเนื้อหาไม่เหมาะสม";
    await prisma.post.create({
      data: { type: "announcement", roomId: room.id, authorId: author.id, title, body, pinned: true, fingerprint: (title + body).toLowerCase().replace(/\s+/g, "") },
    });
    await prisma.room.update({ where: { id: room.id }, data: { postCount: { increment: 1 } } });
    console.log(`Welcome announcement posted as @${author.handle} in ห้องข่าวท้องถิ่น`);
  }

  console.log("Done. Sample content removed.");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
