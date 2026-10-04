import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { fail, ok, requireMember } from "@/lib/server/http";
import { getSession } from "@/lib/server/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSession();
  return NextResponse.json({ ok: true, data: user }, { headers: { "cache-control": "no-store" } });
}

const patch = z.object({ name: z.string().trim().min(1).max(40).optional(), bio: z.string().trim().max(160).optional(), area: z.string().trim().max(40).optional() });

export async function PATCH(req: Request) {
  const g = await requireMember(req);
  if ("error" in g) return g.error;
  const parsed = patch.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail("ข้อมูลไม่ถูกต้อง");
  const u = await prisma.user.update({ where: { id: g.user.id }, data: parsed.data, select: { name: true, bio: true, area: true } });
  return ok(u);
}
