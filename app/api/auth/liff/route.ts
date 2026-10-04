import { NextResponse } from "next/server";
import { fail, safeReturnTo, sameOrigin } from "@/lib/server/http";
import { upsertLineUser } from "@/lib/server/line";
import { setSessionCookie } from "@/lib/server/session";

export const dynamic = "force-dynamic";

/** Signs a member in from inside the LINE app: LINE itself verifies the ID token (signature, audience, expiry). */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail("คำขอไม่ถูกต้อง", 403);
  const body = (await req.json().catch(() => ({}))) as { idToken?: string; returnTo?: string };
  if (!body.idToken || typeof body.idToken !== "string" || body.idToken.length > 4000) return fail("ไม่พบข้อมูลเข้าสู่ระบบ", 400);

  const clientId = process.env.LINE_CHANNEL_ID?.trim();
  if (!clientId) return fail("ยังไม่ได้ตั้งค่า LINE Login", 500);

  const verify = await fetch("https://api.line.me/oauth2/v2.1/verify", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ id_token: body.idToken, client_id: clientId }),
    cache: "no-store",
  });
  if (!verify.ok) return fail("ตรวจสอบการเข้าสู่ระบบไม่ผ่าน", 401, `verify-${verify.status}`);
  const claims = (await verify.json()) as { sub?: string; name?: string; picture?: string };
  if (!claims.sub) return fail("ตรวจสอบการเข้าสู่ระบบไม่ผ่าน", 401, "nosub");

  const user = await upsertLineUser({ sub: claims.sub, name: claims.name?.trim() || "สมาชิก SISE", picture: claims.picture });
  if (user.status !== "ACTIVE") return fail("บัญชีนี้ถูกระงับการใช้งาน", 403);
  await setSessionCookie(user.id);
  return NextResponse.json({ ok: true, data: { returnTo: safeReturnTo(body.returnTo) } });
}
