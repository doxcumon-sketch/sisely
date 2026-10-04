import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { fail, ok, requireMember } from "@/lib/server/http";
import { checkLimit } from "@/lib/server/limits";
import { notifyMentions } from "@/lib/server/notify";
import { checkBannedWords } from "@/lib/moderation";
import { POST_TYPES } from "@/lib/post-types";
import { getPost } from "@/lib/server/repo";

const schema = z.object({
  type: z.enum(POST_TYPES.map((t) => t.key) as [string, ...string[]]),
  roomSlug: z.string().min(1).max(60),
  title: z.string().trim().min(5, "หัวข้อสั้นเกินไป").max(140),
  body: z.string().trim().max(4000).default(""),
  location: z.string().trim().max(60).optional(),
  placeSlug: z.string().max(80).optional(),
  poll: z.array(z.string().trim().min(1).max(60)).min(2).max(4).optional(),
  photoIds: z.array(z.string().max(40)).max(4).default([]),
});

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, "");

export async function POST(req: Request) {
  const g = await requireMember(req);
  if ("error" in g) return g.error;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง");
  const d = parsed.data;
  if (d.type === "poll" && !d.poll) return fail("โพลต้องมีอย่างน้อย 2 ตัวเลือก");
  if (d.type === "announcement" && g.user.role === "MEMBER") return fail("เฉพาะผู้ดูแลที่ประกาศได้", 403);

  const room = await prisma.room.findUnique({ where: { slug: d.roomSlug }, select: { id: true } });
  if (!room) return fail("ไม่พบห้องนี้");

  const text = `${d.title} ${d.body} ${d.poll?.join(" ") ?? ""}`;
  const banned = checkBannedWords(text);
  if (banned) return fail(`เนื้อหามีคำที่ชุมชนไม่อนุญาต ("${banned}") กรุณาแก้ไขก่อนโพสต์`, 422, "banned");
  const links = (text.match(/https?:\/\//g) ?? []).length;
  if (links > 2) return fail("ใส่ลิงก์ได้ไม่เกิน 2 ลิงก์ต่อโพสต์ เพื่อป้องกันสแปม", 422, "links");
  const letters = text.replace(/[^A-Za-z]/g, "");
  if (letters.length > 24 && letters.replace(/[^A-Z]/g, "").length / letters.length > 0.7) return fail("กรุณาไม่พิมพ์ตัวพิมพ์ใหญ่ทั้งหมด", 422, "caps");

  const fingerprint = norm(d.title + d.body);
  const dupSelf = await prisma.post.findFirst({ where: { authorId: g.user.id, fingerprint, createdAt: { gte: new Date(Date.now() - 7 * 86_400_000) } }, select: { id: true } });
  if (dupSelf) return fail("คุณเพิ่งโพสต์เนื้อหานี้ไปแล้ว ลองแก้ให้ต่างออกไป หรือดูโพสต์เดิมของคุณ", 409, "duplicate");

  const limited = await checkLimit(g.user.id, "post");
  if (limited) return fail(limited, 429, "rate");

  // Spam heuristics that don't reject but hold the post for a moderator.
  const me = await prisma.user.findUniqueOrThrow({ where: { id: g.user.id }, select: { createdAt: true } });
  const isNew = Date.now() - me.createdAt.getTime() < 86_400_000;
  const dupOthers = await prisma.post.count({ where: { fingerprint, authorId: { not: g.user.id }, createdAt: { gte: new Date(Date.now() - 86_400_000) } } });
  const status = (isNew && links > 0) || dupOthers > 0 ? "PENDING_REVIEW" : "PUBLISHED";

  const place = d.placeSlug ? await prisma.place.findUnique({ where: { slug: d.placeSlug }, select: { id: true } }) : null;
  const photos = d.photoIds.length ? await prisma.postPhoto.findMany({ where: { id: { in: d.photoIds }, ownerId: g.user.id, postId: null }, select: { id: true } }) : [];
  if (photos.length !== d.photoIds.length) return fail("รูปบางรูปไม่ถูกต้องหรือถูกใช้ไปแล้ว");

  const post = await prisma.$transaction(async (tx) => {
    const created = await tx.post.create({
      data: {
        type: d.type as never, roomId: room.id, authorId: g.user.id, title: d.title, body: d.body, location: d.location || null, placeId: place?.id ?? null,
        status, fingerprint, pollEndsAt: d.poll ? new Date(Date.now() + 24 * 3_600_000) : null,
        options: d.poll ? { create: d.poll.map((label, position) => ({ label, position })) } : undefined,
      },
      select: { id: true },
    });
    if (photos.length) {
      for (const [position, p] of photos.entries()) await tx.postPhoto.update({ where: { id: p.id }, data: { postId: created.id, position } });
    }
    if (status === "PUBLISHED") await tx.room.update({ where: { id: room.id }, data: { postCount: { increment: 1 } } });
    return created;
  });

  if (status === "PUBLISHED") await notifyMentions(`${d.title} ${d.body}`, g.user, `/post/${post.id}`, "โพสต์");
  if (status === "PUBLISHED") {
    revalidatePath("/");
    revalidatePath("/rooms");
    revalidatePath(`/rooms/${d.roomSlug}`);
  }
  const full = await getPost(post.id, g.user.id);
  return ok({ id: post.id, status, post: full }, { status: 201 });
}
