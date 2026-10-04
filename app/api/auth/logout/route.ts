import { NextResponse } from "next/server";
import { fail, sameOrigin } from "@/lib/server/http";
import { clearSessionCookie } from "@/lib/server/session";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail("คำขอไม่ถูกต้อง", 403);
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
