import { prisma } from "@/lib/prisma";
import { fail, ok, requireMember } from "@/lib/server/http";

/** Delete a post: the author, or a moderator/admin. Counters stay consistent. */
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await requireMember(req);
  if ("error" in g) return g.error;
  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id }, select: { authorId: true, roomId: true, status: true } });
  if (!post) return fail("ไม่พบโพสต์", 404);
  if (post.authorId !== g.user.id && g.user.role === "MEMBER") return fail("ไม่มีสิทธิ์ลบโพสต์นี้", 403);
  await prisma.$transaction([
    prisma.post.delete({ where: { id } }),
    ...(post.status === "PUBLISHED" ? [prisma.room.update({ where: { id: post.roomId }, data: { postCount: { decrement: 1 } } })] : []),
  ]);
  return ok({ id });
}
