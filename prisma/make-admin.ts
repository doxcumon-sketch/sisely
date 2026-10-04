/** Usage: npm run db:make-admin -- <handle> [ADMIN|MODERATOR|MEMBER] */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });

async function main() {
  const [handle, role = "ADMIN"] = process.argv.slice(2);
  if (!handle || !["ADMIN", "MODERATOR", "MEMBER"].includes(role)) throw new Error("usage: db:make-admin <handle> [ADMIN|MODERATOR|MEMBER]");
  const user = await prisma.user.update({ where: { handle }, data: { role: role as "ADMIN" | "MODERATOR" | "MEMBER" } });
  console.log(`${user.handle} (${user.name}) is now ${user.role}`);
}
main().catch((e) => { console.error(e.message ?? e); process.exit(1); }).finally(() => prisma.$disconnect());
