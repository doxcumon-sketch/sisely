/**
 * Posts conversation starters from the SISE team account so every room has a question worth answering.
 *
 *   npm run db:seed-starter -- --as <handle>        # your own admin handle
 *
 * Idempotent (skips titles already posted). Also marks the account with the SISE founder badge.
 * These are clearly labelled team posts — no fake members, replies, likes or reviews are created.
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { STARTERS } from "../lib/data/starter";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });

async function main() {
  const i = process.argv.indexOf("--as");
  const handle = i >= 0 ? process.argv[i + 1] : undefined;
  if (!handle) throw new Error("usage: db:seed-starter -- --as <handle>");
  const author = await prisma.user.findUnique({ where: { handle } });
  if (!author) throw new Error(`no member with handle "${handle}"`);
  if (!author.lineUserId) throw new Error("the starter account must be a real signed-in member");
  if (!author.badge) await prisma.user.update({ where: { id: author.id }, data: { badge: "FOUNDER" } });

  const rooms = new Map((await prisma.room.findMany({ select: { id: true, slug: true } })).map((r) => [r.slug, r.id]));
  let created = 0;
  // oldest first so the feed order reads naturally; spread over the last day
  for (const [n, s] of STARTERS.entries()) {
    const roomId = rooms.get(s.room);
    if (!roomId) { console.warn(`skip: unknown room ${s.room}`); continue; }
    const exists = await prisma.post.findFirst({ where: { authorId: author.id, title: s.title }, select: { id: true } });
    if (exists) continue;
    const fingerprint = (s.title + s.body).toLowerCase().replace(/\s+/g, "");
    await prisma.$transaction([
      prisma.post.create({
        data: {
          type: s.type, roomId, authorId: author.id, title: s.title, body: s.body, fingerprint,
          createdAt: new Date(Date.now() - (STARTERS.length - n) * 18 * 60_000),
          pollEndsAt: s.poll ? new Date(Date.now() + 7 * 86_400_000) : null,
          options: s.poll ? { create: s.poll.map((label, position) => ({ label, position })) } : undefined,
        },
      }),
      prisma.room.update({ where: { id: roomId }, data: { postCount: { increment: 1 } } }),
    ]);
    created++;
  }
  console.log(`Posted ${created} conversation starters as @${author.handle} (${STARTERS.length - created} already existed).`);
}

main().catch((e) => { console.error(e.message ?? e); process.exit(1); }).finally(() => prisma.$disconnect());
