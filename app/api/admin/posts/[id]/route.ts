import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { fail, ok, requireStaff } from "@/lib/server/http";

const schema = z.object({ pinned: z.boolean().optional(), featured: z.boolean().optional(), status: z.enum(["PUBLISHED", "HIDDEN"]).optional() });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await requireStaff(req);
  if ("error" in g) return g.error;
  const { id } = await params;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail("ข้อมูลไม่ถูกต้อง");
  const post = await prisma.post.findUnique({ where: { id }, select: { status: true, roomId: true } });
  if (!post) return fail("ไม่พบโพสต์", 404);
  const { status, ...flags } = parsed.data;
  await prisma.$transaction(async (tx) => {
    if (status && status !== post.status) {
      const was = post.status === "PUBLISHED", will = status === "PUBLISHED";
      if (was !== will) await tx.room.update({ where: { id: post.roomId }, data: { postCount: { increment: will ? 1 : -1 } } });
      await tx.post.update({ where: { id }, data: { status } });
      await tx.moderationAction.create({ data: { moderatorId: g.user.id, targetType: "POST", targetId: id, action: will ? "RESTORE" : "HIDE" } });
    }
    if (Object.keys(flags).length) {
      await tx.post.update({ where: { id }, data: flags });
      await tx.moderationAction.create({ data: { moderatorId: g.user.id, targetType: "POST", targetId: id, action: "FEATURE", reason: JSON.stringify(flags) } });
    }
  });
  return ok({ id });
}
