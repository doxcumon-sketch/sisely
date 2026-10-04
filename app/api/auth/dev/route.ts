import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fail, safeReturnTo, sameOrigin } from "@/lib/server/http";
import { setSessionCookie } from "@/lib/server/session";

/**
 * Preview-only sign-in so the product can be demoed before LINE keys exist.
 * Disabled unless ALLOW_DEV_LOGIN=1 — never enable on a production domain with real members.
 */
export async function POST(req: Request) {
  if (process.env.ALLOW_DEV_LOGIN !== "1") return fail("ไม่พร้อมใช้งาน", 404);
  if (!sameOrigin(req)) return fail("คำขอไม่ถูกต้อง", 403);
  const body = (await req.json().catch(() => ({}))) as { name?: string; returnTo?: string };
  const name = (body.name ?? "").trim().slice(0, 40) || "ผู้เยี่ยมชมทดลอง";
  const handle = `guest${Math.random().toString(36).slice(2, 8)}`;
  const user = await prisma.user.create({ data: { handle, name, bio: "บัญชีทดลอง" } });
  await setSessionCookie(user.id);
  return NextResponse.json({ ok: true, data: { returnTo: safeReturnTo(body.returnTo) } });
}
