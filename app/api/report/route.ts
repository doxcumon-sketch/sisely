import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { fail, ok, requireMember } from "@/lib/server/http";
import { checkLimit } from "@/lib/server/limits";

const schema = z.object({
  targetType: z.enum(["POST", "COMMENT", "USER", "LISTING"]),
  targetId: z.string().min(1).max(60),
  reason: z.enum(["spam", "abuse", "scam", "misinfo", "other"]),
  note: z.string().trim().max(300).optional(),
});

const AUTO_HOLD_AT = 3; // distinct open reports before a post is held for review

export async function POST(req: Request) {
  const g = await requireMember(req);
  if ("error" in g) return g.error;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail("ข้อมูลไม่ถูกต้อง");
  const d = parsed.data;
  const limited = await checkLimit(g.user.id, "report");
  if (limited) return fail(limited, 429, "rate");

  const owner =
    d.targetType === "POST" ? (await prisma.post.findUnique({ where: { id: d.targetId }, select: { authorId: true } }))?.authorId
    : d.targetType === "COMMENT" ? (await prisma.comment.findUnique({ where: { id: d.targetId }, select: { authorId: true } }))?.authorId
    : d.targetType === "LISTING" ? (await prisma.listing.findUnique({ where: { id: d.targetId }, select: { sellerId: true } }))?.sellerId
    : (await prisma.user.findUnique({ where: { id: d.targetId }, select: { id: true } }))?.id;
  if (!owner) return fail("ไม่พบเนื้อหาที่รายงาน", 404);
  if (owner === g.user.id) return fail("รายงานเนื้อหาของตัวเองไม่ได้");

  await prisma.report.upsert({
    where: { reporterId_targetType_targetId: { reporterId: g.user.id, targetType: d.targetType, targetId: d.targetId } },
    update: { reason: d.reason, note: d.note, status: "OPEN" },
    create: { reporterId: g.user.id, targetType: d.targetType, targetId: d.targetId, reason: d.reason, note: d.note },
  });

  if (d.targetType === "POST") {
    const open = await prisma.report.count({ where: { targetType: "POST", targetId: d.targetId, status: "OPEN" } });
    if (open >= AUTO_HOLD_AT) {
      const p = await prisma.post.findUnique({ where: { id: d.targetId }, select: { status: true, roomId: true } });
      if (p?.status === "PUBLISHED") {
        await prisma.$transaction([
          prisma.post.update({ where: { id: d.targetId }, data: { status: "PENDING_REVIEW" } }),
          prisma.room.update({ where: { id: p.roomId }, data: { postCount: { decrement: 1 } } }),
        ]);
      }
    }
  }
  return ok({ reported: true });
}
