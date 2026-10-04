import { prisma } from "@/lib/prisma";
import { fail, ok, requireMember } from "@/lib/server/http";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await requireMember(req);
  if ("error" in g) return g.error;
  const { id } = await params;
  const c = await prisma.comment.findUnique({ where: { id }, select: { authorId: true, postId: true, _count: { select: { replies: true } } } });
  if (!c) return fail("ไม่พบความเห็น", 404);
  if (c.authorId !== g.user.id && g.user.role === "MEMBER") return fail("ไม่มีสิทธิ์ลบความเห็นนี้", 403);
  await prisma.$transaction([
    prisma.comment.delete({ where: { id } }), // replies cascade
    prisma.post.update({ where: { id: c.postId }, data: { commentCount: { decrement: 1 + c._count.replies } } }),
  ]);
  return ok({ id, removed: 1 + c._count.replies });
}
