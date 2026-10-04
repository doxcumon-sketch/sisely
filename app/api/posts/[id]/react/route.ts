import { prisma } from "@/lib/prisma";
import { fail, ok, requireMember } from "@/lib/server/http";
import { checkLimit } from "@/lib/server/limits";
import { notify } from "@/lib/server/notify";

/** Toggle a like. Returns the authoritative counts so the client never drifts. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await requireMember(req);
  if ("error" in g) return g.error;
  const limited = await checkLimit(g.user.id, "react");
  if (limited) return fail(limited, 429, "rate");
  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id }, select: { id: true, authorId: true, title: true, status: true } });
  if (!post || post.status !== "PUBLISHED") return fail("ไม่พบโพสต์", 404);

  const existing = await prisma.reaction.findUnique({ where: { userId_postId: { userId: g.user.id, postId: id } } });
  let reacted: boolean;
  if (existing) {
    await prisma.$transaction([
      prisma.reaction.delete({ where: { userId_postId: { userId: g.user.id, postId: id } } }),
      prisma.post.update({ where: { id }, data: { reactionCount: { decrement: 1 } } }),
    ]);
    reacted = false;
  } else {
    await prisma.$transaction([
      prisma.reaction.create({ data: { userId: g.user.id, postId: id, kind: "like" } }),
      prisma.post.update({ where: { id }, data: { reactionCount: { increment: 1 }, velocity: { increment: 1 } } }),
    ]);
    reacted = true;
    await notify({ recipientId: post.authorId, actorId: g.user.id, kind: "comment", text: `${g.user.name} ถูกใจโพสต์ของคุณ`, detail: post.title, href: `/post/${id}` });
  }
  const { reactionCount } = await prisma.post.findUniqueOrThrow({ where: { id }, select: { reactionCount: true } });
  return ok({ reacted, count: reactionCount });
}
