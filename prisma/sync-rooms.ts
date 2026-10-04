/**
 * Adds rooms that exist in lib/data/rooms.ts but not yet in the database (e.g. a newly launched room), and refreshes
 * the wording/icon of existing ones. Member/post counters are never touched.
 *
 *   npm run db:sync-rooms
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { rooms } from "../lib/data/rooms";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });

async function main() {
  let created = 0;
  for (const [i, r] of rooms.entries()) {
    const fields = { name: r.name, icon: r.icon, tone: r.tone, tagline: r.tagline, description: r.description, group: r.group, trending: !!r.trending, sortOrder: i };
    const found = await prisma.room.findUnique({ where: { slug: r.slug } });
    if (found) await prisma.room.update({ where: { id: found.id }, data: fields });
    else {
      await prisma.room.create({ data: { id: r.id, slug: r.slug, ...fields, memberCount: 0, postCount: 0 } });
      created++;
      console.log("added room", r.slug);
    }
  }
  console.log(`rooms in sync (${created} added)`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
