import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { fail, ok, requireMember } from "@/lib/server/http";
import { checkLimit } from "@/lib/server/limits";
import { notify, notifyMentions } from "@/lib/server/notify";
import { checkBannedWords } from "@/lib/moderation";
import { commentInclude, toComment } from "@/lib/server/mappers";

const schema = z.object({ body: z.string().trim().min(1).max(1500), parentId: z.string().optional() });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await requireMember(req);
  if ("error" in g) return g.error;
  const { id } = await params;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail("กรุณาพิมพ์ความเห็น");
  const { body, parentId } = parsed.data;

  const banned = checkBannedWords(body);
  if (banned) return fail(`ความเห็นมีคำที่ชุมชนไม่อนุญาต ("${banned}")`, 422, "banned");

  const post = await prisma.post.findUnique({ where: { id }, select: { id: true, authorId: true, title: true, status: true } });
  if (!post || post.status !== "PUBLISHED") return fail("ไม่พบโพสต์", 404);
  let parent: { id: string; authorId: string; parentId: string | null } | null = null;
  if (parentId) {
    parent = await prisma.comment.findFirst({ where: { id: parentId, postId: id, status: "PUBLISHED" }, select: { id: true, authorId: true, parentId: true } });
    if (!parent) return fail("ไม่พบความเห็นที่ต้องการตอบกลับ", 404);
  }

  const blocked = await prisma.block.findFirst({ where: { blockerId: post.authorId, blockedId: g.user.id, muteOnly: false }, select: { blockerId: true } });
  if (blocked) return fail("ไม่สามารถแสดงความเห็นในโพสต์นี้ได้", 403);

  const limited = await checkLimit(g.user.id, "comment");
  if (limited) return fail(limited, 429, "rate");

  const flatParent = parent ? (parent.parentId ?? parent.id) : null; // replies are one level deep
  const [row] = await prisma.$transaction([
    prisma.comment.create({ data: { postId: id, parentId: flatParent, authorId: g.user.id, body }, include: commentInclude }),
    prisma.post.update({ where: { id }, data: { commentCount: { increment: 1 }, velocity: { increment: 2 } } }),
  ]);

  const href = `/post/${id}#comments`;
  if (parent) await notify({ recipientId: parent.authorId, actorId: g.user.id, kind: "reply", text: `${g.user.name} ตอบกลับความเห็นของคุณ`, detail: body, href });
  if (!parent || parent.authorId !== post.authorId) await notify({ recipientId: post.authorId, actorId: g.user.id, kind: "comment", text: `${g.user.name} แสดงความเห็นในโพสต์ของคุณ`, detail: body, href });
  await notifyMentions(body, g.user, href, "ความเห็น");
  return ok(toComment(row), { status: 201 });
}
