import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { fail, ok, requireMember } from "@/lib/server/http";

/** One vote per member per poll (enforced by the primary key), counts updated atomically. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await requireMember(req);
  if ("error" in g) return g.error;
  const { id } = await params;
  const body = z.object({ optionId: z.string().min(1) }).safeParse(await req.json().catch(() => null));
  if (!body.success) return fail("ข้อมูลไม่ถูกต้อง");

  const option = await prisma.pollOption.findFirst({ where: { id: body.data.optionId, postId: id, post: { status: "PUBLISHED" } } });
  if (!option) return fail("ไม่พบตัวเลือก", 404);
  const post = await prisma.post.findUniqueOrThrow({ where: { id }, select: { pollEndsAt: true } });
  if (post.pollEndsAt && post.pollEndsAt < new Date()) return fail("โพลนี้ปิดแล้ว", 409);

  try {
    await prisma.$transaction([
      prisma.pollVote.create({ data: { postId: id, userId: g.user.id, optionId: option.id } }),
      prisma.pollOption.update({ where: { id: option.id }, data: { votes: { increment: 1 } } }),
    ]);
  } catch (e) {
    if ((e as { code?: string }).code === "P2002") return fail("คุณโหวตไปแล้ว", 409);
    throw e;
  }
  const options = await prisma.pollOption.findMany({ where: { postId: id }, orderBy: { position: "asc" }, select: { id: true, label: true, votes: true } });
  return ok({ options, voted: option.id });
}
