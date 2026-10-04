import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "../../../generated/prisma/client";
import { COVER_PHOTOS } from "@/lib/covers";
import { prisma } from "@/lib/prisma";
import { fail, ok, requireMember } from "@/lib/server/http";
import { clearSessionCookie, getSession } from "@/lib/server/session";

export const dynamic = "force-dynamic";

const COVER_SCENES = COVER_PHOTOS.map((p) => p.scene as string);

export async function GET() {
  const user = await getSession();
  return NextResponse.json({ ok: true, data: user }, { headers: { "cache-control": "no-store" } });
}

const url = z.string().trim().max(160).refine((v) => v === "" || /^https?:\/\//i.test(v), "ลิงก์ต้องขึ้นต้นด้วย http:// หรือ https://");
const patch = z.object({
  name: z.string().trim().min(1).max(40).optional(),
  bio: z.string().trim().max(160).optional(),
  area: z.string().trim().max(40).optional(),
  coverScene: z.string().max(40).nullable().optional(),
  links: z.object({ line: z.string().trim().max(60).optional(), facebook: url.optional(), website: url.optional() }).optional(),
  avatarPhotoId: z.string().max(40).optional(), // an uploaded /api/photos id to use as the profile picture
  removeAvatar: z.boolean().optional(),
});

export async function PATCH(req: Request) {
  const g = await requireMember(req);
  if ("error" in g) return g.error;
  const parsed = patch.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง");
  const { avatarPhotoId, removeAvatar, coverScene, links, ...rest } = parsed.data;

  if (coverScene && !COVER_SCENES.includes(coverScene)) return fail("ไม่พบภาพปกนี้");
  const me = await prisma.user.findUniqueOrThrow({ where: { id: g.user.id }, select: { pictureUrl: true, avatarCustom: true } });
  const ownPhotoId = (u: string | null) => (u?.startsWith("/api/photos/") ? u.slice("/api/photos/".length) : null);

  const data: Record<string, unknown> = { ...rest };
  if (coverScene !== undefined) data.coverScene = coverScene;
  if (links) {
    const clean = Object.fromEntries(Object.entries(links).filter(([, v]) => v));
    data.links = Object.keys(clean).length ? clean : Prisma.DbNull;
  }

  let dropPhoto: string | null = null;
  if (avatarPhotoId) {
    const photo = await prisma.postPhoto.findFirst({ where: { id: avatarPhotoId, ownerId: g.user.id, postId: null }, select: { id: true } });
    if (!photo) return fail("ไม่พบรูปที่อัปโหลด ลองใหม่อีกครั้ง");
    data.pictureUrl = `/api/photos/${photo.id}`;
    data.avatarCustom = true;
    if (me.avatarCustom) dropPhoto = ownPhotoId(me.pictureUrl);
  } else if (removeAvatar) {
    data.pictureUrl = null;
    data.avatarCustom = false; // next LINE login brings their LINE picture back
    if (me.avatarCustom) dropPhoto = ownPhotoId(me.pictureUrl);
  }

  const u = await prisma.user.update({ where: { id: g.user.id }, data, select: { name: true, bio: true, area: true, pictureUrl: true, coverScene: true, links: true } });
  if (dropPhoto) await prisma.postPhoto.deleteMany({ where: { id: dropPhoto, ownerId: g.user.id, postId: null } });
  return ok(u);
}

/**
 * Delete my account (required by the App Store and Google Play for any app with sign-up).
 * Personal data goes: name, photo, bio, links, LINE link, follows, saves, blocks and notifications. Posts and comments
 * that other people have replied to stay, but are shown as written by "ผู้ใช้ที่ลบบัญชีแล้ว" (no way back to the person).
 */
export async function DELETE(req: Request) {
  const g = await requireMember(req);
  if ("error" in g) return g.error;
  const { user } = g;
  if (user.role !== "MEMBER") return fail("บัญชีผู้ดูแลลบเองไม่ได้ กรุณาให้แอดมินปรับเป็นสมาชิกทั่วไปก่อน", 403);
  const body = (await req.json().catch(() => ({}))) as { confirm?: string };
  if (body.confirm !== "DELETE") return fail("กรุณายืนยันการลบบัญชี", 400);

  const follows = await prisma.follow.findMany({ where: { followerId: user.id }, select: { targetType: true, targetId: true } });
  await prisma.$transaction([
    ...follows.filter((f) => f.targetType === "ROOM").map((f) => prisma.room.update({ where: { slug: f.targetId }, data: { memberCount: { decrement: 1 } } })),
    ...follows.filter((f) => f.targetType === "PLACE").map((f) => prisma.place.update({ where: { slug: f.targetId }, data: { followerCount: { decrement: 1 } } })),
    prisma.follow.deleteMany({ where: { followerId: user.id } }),
    prisma.save.deleteMany({ where: { userId: user.id } }),
    prisma.block.deleteMany({ where: { OR: [{ blockerId: user.id }, { blockedId: user.id }] } }),
    prisma.notification.deleteMany({ where: { OR: [{ recipientId: user.id }, { actorId: user.id }] } }),
    prisma.postPhoto.deleteMany({ where: { ownerId: user.id, postId: null } }),
    prisma.user.update({
      where: { id: user.id },
      data: {
        lineUserId: null,
        handle: `deleted-${Math.random().toString(36).slice(2, 10)}`,
        name: "ผู้ใช้ที่ลบบัญชีแล้ว",
        bio: "",
        pictureUrl: null,
        avatarCustom: false,
        coverScene: null,
        links: Prisma.DbNull,
        badge: null,
        status: "BANNED",
      },
    }),
  ]);
  await clearSessionCookie();
  return ok({ deleted: true });
}
