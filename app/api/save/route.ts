import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { fail, ok, requireMember } from "@/lib/server/http";
import { checkLimit } from "@/lib/server/limits";

const schema = z.object({ type: z.enum(["POST", "PLACE", "EVENT", "LISTING"]), id: z.string().min(1).max(120) });

/** targetId is the post/listing id, or the place/event slug. */
export async function POST(req: Request) {
  const g = await requireMember(req);
  if ("error" in g) return g.error;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail("ข้อมูลไม่ถูกต้อง");
  const { type, id } = parsed.data;
  const limited = await checkLimit(g.user.id, "social");
  if (limited) return fail(limited, 429, "rate");

  const exists =
    type === "POST" ? await prisma.post.findFirst({ where: { id, status: "PUBLISHED" }, select: { id: true } })
    : type === "LISTING" ? await prisma.listing.findFirst({ where: { id, status: "PUBLISHED" }, select: { id: true } })
    : type === "PLACE" ? await prisma.place.findUnique({ where: { slug: id }, select: { id: true } })
    : await prisma.event.findUnique({ where: { slug: id }, select: { id: true } });
  if (!exists) return fail("ไม่พบรายการ", 404);

  const key = { userId_targetType_targetId: { userId: g.user.id, targetType: type, targetId: id } };
  const had = await prisma.save.findUnique({ where: key });
  const delta = had ? -1 : 1;
  await prisma.$transaction([
    had ? prisma.save.delete({ where: key }) : prisma.save.create({ data: { userId: g.user.id, targetType: type, targetId: id } }),
    ...(type === "POST" ? [prisma.post.update({ where: { id }, data: { saveCount: { increment: delta } } })] : []),
    ...(type === "LISTING" ? [prisma.listing.update({ where: { id }, data: { saveCount: { increment: delta } } })] : []),
  ]);
  return ok({ saved: !had });
}
