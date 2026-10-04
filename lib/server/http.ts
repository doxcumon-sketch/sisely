import { NextResponse } from "next/server";
import { getSession, type SessionUser } from "@/lib/server/session";

export const ok = <T,>(data: T, init?: ResponseInit) => NextResponse.json({ ok: true, data }, init);
export const fail = (message: string, status = 400, code?: string) => NextResponse.json({ ok: false, error: message, code }, { status });

/**
 * CSRF defence for cookie-authenticated mutations: the Origin (or Referer) host must match
 * the request host. Combined with SameSite=Lax cookies this blocks cross-site form posts.
 */
export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin") ?? (req.headers.get("referer") ? new URL(req.headers.get("referer")!).origin : null);
  if (!origin) return false;
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

/** Wrap a mutation handler: same-origin + signed-in member required. */
export async function requireMember(req: Request): Promise<{ user: SessionUser } | { error: NextResponse }> {
  if (!sameOrigin(req)) return { error: fail("คำขอไม่ถูกต้อง", 403, "origin") };
  const user = await getSession();
  if (!user) return { error: fail("กรุณาเข้าสู่ระบบก่อน", 401, "auth") };
  return { user };
}

export async function requireStaff(req: Request): Promise<{ user: SessionUser } | { error: NextResponse }> {
  const r = await requireMember(req);
  if ("error" in r) return r;
  if (r.user.role === "MEMBER") return { error: fail("ต้องเป็นผู้ดูแลเท่านั้น", 403, "role") };
  return r;
}

/** Only allow same-site relative paths as post-login destinations (no open redirect). */
export function safeReturnTo(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return "/";
  return value;
}
