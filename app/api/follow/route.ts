import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { fail, ok, requireMember } from "@/lib/server/http";
import { checkLimit } from "@/lib/server/limits";
import { notify } from "@/lib/server/notify";

const schema = z.object({ type: z.enum(["USER", "ROOM", "PLACE", "EVENT"]), id: z.string().min(1).max(120) });

/** targetId is the user id, or the room/place/event slug. Following an event == "interested". */
export async function POST(req: Request) {
  const g = await requireMember(req);
  if ("error" in g) return g.error;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail("ข้อมูลไม่ถูกต้อง");
  const { type, id } = parsed.data;
  if (type === "USER" && id === g.user.id) return fail("ติดตามตัวเองไม่ได้");
  const limited = await checkLimit(g.user.id, "social");
  if (limited) return fail(limited, 429, "rate");

  const exists =
    type === "USER" ? await prisma.user.findFirst({ where: { id, status: "ACTIVE" }, select: { id: true } })
    : type === "ROOM" ? await prisma.room.findUnique({ where: { slug: id }, select: { id: true } })
    : type === "PLACE" ? await prisma.place.findUnique({ where: { slug: id }, select: { id: true } })
    : await prisma.event.findUnique({ where: { slug: id }, select: { id: true } });
  if (!exists) return fail("ไม่พบรายการ", 404);

  const key = { followerId_targetType_targetId: { followerId: g.user.id, targetType: type, targetId: id } };
  const had = await prisma.follow.findUnique({ where: key });
  const delta = had ? -1 : 1;
  await prisma.$transaction([
    had ? prisma.follow.delete({ where: key }) : prisma.follow.create({ data: { followerId: g.user.id, targetType: type, targetId: id } }),
    ...(type === "ROOM" ? [prisma.room.update({ where: { slug: id }, data: { memberCount: { increment: delta } } })] : []),
    ...(type === "PLACE" ? [prisma.place.update({ where: { slug: id }, data: { followerCount: { increment: delta } } })] : []),
    ...(type === "EVENT" ? [prisma.event.update({ where: { slug: id }, data: { interestedCount: { increment: delta } } })] : []),
  ]);
  if (!had && type === "USER") await notify({ recipientId: id, actorId: g.user.id, kind: "system", text: `${g.user.name} เริ่มติดตามคุณ`, href: `/u/${g.user.handle}` });
  return ok({ following: !had });
}
