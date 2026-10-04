import { prisma } from "@/lib/prisma";
import { fail, ok, requireMember } from "@/lib/server/http";
import { checkLimit } from "@/lib/server/limits";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await requireMember(req);
  if ("error" in g) return g.error;
  const limited = await checkLimit(g.user.id, "react");
  if (limited) return fail(limited, 429, "rate");
  const { id } = await params;
  const c = await prisma.comment.findUnique({ where: { id }, select: { id: true, status: true } });
  if (!c || c.status !== "PUBLISHED") return fail("ไม่พบความเห็น", 404);
  const key = { commentId_userId: { commentId: id, userId: g.user.id } };
  const had = await prisma.commentLike.findUnique({ where: key });
  if (had) await prisma.$transaction([prisma.commentLike.delete({ where: key }), prisma.comment.update({ where: { id }, data: { likeCount: { decrement: 1 } } })]);
  else await prisma.$transaction([prisma.commentLike.create({ data: { commentId: id, userId: g.user.id } }), prisma.comment.update({ where: { id }, data: { likeCount: { increment: 1 } } })]);
  const { likeCount } = await prisma.comment.findUniqueOrThrow({ where: { id }, select: { likeCount: true } });
  return ok({ liked: !had, count: likeCount });
}
