import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { fail, ok, requireMember } from "@/lib/server/http";

const schema = z.object({ userId: z.string().min(1), mute: z.boolean().default(false), undo: z.boolean().default(false) });

export async function POST(req: Request) {
  const g = await requireMember(req);
  if ("error" in g) return g.error;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail("ข้อมูลไม่ถูกต้อง");
  const { userId, mute, undo } = parsed.data;
  if (userId === g.user.id) return fail("ทำกับตัวเองไม่ได้");
  if (undo) {
    await prisma.block.deleteMany({ where: { blockerId: g.user.id, blockedId: userId } });
    return ok({ blocked: false });
  }
  if (!(await prisma.user.findUnique({ where: { id: userId }, select: { id: true } }))) return fail("ไม่พบผู้ใช้", 404);
  await prisma.block.upsert({
    where: { blockerId_blockedId: { blockerId: g.user.id, blockedId: userId } },
    update: { muteOnly: mute },
    create: { blockerId: g.user.id, blockedId: userId, muteOnly: mute },
  });
  // blocking also drops follows in both directions
  if (!mute) {
    await prisma.follow.deleteMany({ where: { OR: [{ followerId: g.user.id, targetType: "USER", targetId: userId }, { followerId: userId, targetType: "USER", targetId: g.user.id }] } });
  }
  return ok({ blocked: true, mute });
}
