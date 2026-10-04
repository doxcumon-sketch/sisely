import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { fail, ok, requireStaff } from "@/lib/server/http";
import { notify } from "@/lib/server/notify";

const schema = z.object({ action: z.enum(["HIDE", "WARN", "DISMISS", "SUSPEND"]), reason: z.string().max(300).optional() });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await requireStaff(req);
  if ("error" in g) return g.error;
  const { id } = await params;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail("ข้อมูลไม่ถูกต้อง");
  const { action, reason } = parsed.data;
  if (action === "SUSPEND" && g.user.role !== "ADMIN") return fail("เฉพาะ ADMIN ที่ระงับบัญชีได้", 403);

  const report = await prisma.report.findUnique({ where: { id } });
  if (!report) return fail("ไม่พบรายงาน", 404);

  // resolve the author of the reported thing (for warn/suspend and notifications)
  let authorId: string | null = null;
  if (report.targetType === "POST") authorId = (await prisma.post.findUnique({ where: { id: report.targetId }, select: { authorId: true } }))?.authorId ?? null;
  if (report.targetType === "COMMENT") authorId = (await prisma.comment.findUnique({ where: { id: report.targetId }, select: { authorId: true } }))?.authorId ?? null;
  if (report.targetType === "LISTING") authorId = (await prisma.listing.findUnique({ where: { id: report.targetId }, select: { sellerId: true } }))?.sellerId ?? null;
  if (report.targetType === "USER") authorId = report.targetId;

  await prisma.$transaction(async (tx) => {
    if (action === "HIDE") {
      if (report.targetType === "POST") {
        const p = await tx.post.findUnique({ where: { id: report.targetId }, select: { status: true, roomId: true } });
        if (p && p.status === "PUBLISHED") await tx.room.update({ where: { id: p.roomId }, data: { postCount: { decrement: 1 } } });
        await tx.post.updateMany({ where: { id: report.targetId }, data: { status: "HIDDEN" } });
      } else if (report.targetType === "COMMENT") {
        await tx.comment.updateMany({ where: { id: report.targetId }, data: { status: "HIDDEN" } });
      } else if (report.targetType === "LISTING") {
        await tx.listing.updateMany({ where: { id: report.targetId }, data: { status: "HIDDEN" } });
      }
    }
    if (action === "SUSPEND" && authorId) await tx.user.update({ where: { id: authorId }, data: { status: "SUSPENDED" } });
    await tx.report.updateMany({
      where: { targetType: report.targetType, targetId: report.targetId, status: "OPEN" },
      data: { status: action === "DISMISS" ? "DISMISSED" : "RESOLVED" },
    });
    await tx.moderationAction.create({
      data: { moderatorId: g.user.id, reportId: id, targetType: report.targetType, targetId: report.targetId, action: action === "DISMISS" ? "DISMISS" : action, reason },
    });
  });

  if (action === "WARN" && authorId) {
    await notify({ recipientId: authorId, kind: "system", text: "ผู้ดูแลชุมชนขอเตือนเรื่องเนื้อหาของคุณ", detail: reason ?? "โปรดปฏิบัติตามกติกาชุมชน สุภาพ ไม่โพสต์ซ้ำ และไม่หลอกลวง", href: "/me" });
  }
  return ok({ id, action });
}
