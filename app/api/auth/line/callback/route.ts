import { NextResponse } from "next/server";
import { fetchLineProfile, upsertLineUser } from "@/lib/server/line";
import { safeReturnTo } from "@/lib/server/http";
import { createSessionToken, SESSION_COOKIE, verifySigned } from "@/lib/server/session";

export const dynamic = "force-dynamic";

const back = (origin: string, error: string, why?: string) => {
  const res = NextResponse.redirect(new URL(`/login?error=${error}${why ? `&why=${encodeURIComponent(why)}` : ""}`, origin));
  res.cookies.delete({ name: "sise_oauth", path: "/api/auth/line" });
  return res;
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const origin = url.origin;
  if (url.searchParams.get("error")) return back(origin, "cancelled");

  const cookie = req.headers.get("cookie")?.split(/;\s*/).find((c) => c.startsWith("sise_oauth="))?.slice("sise_oauth=".length);
  const payload = verifySigned(cookie);
  if (!payload) return back(origin, "expired");

  let saved: { state: string; nonce: string; returnTo: string; exp: number };
  try {
    saved = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return back(origin, "expired");
  }
  if (saved.exp < Date.now() || url.searchParams.get("state") !== saved.state) return back(origin, "state");
  const code = url.searchParams.get("code");
  if (!code) return back(origin, "failed");

  try {
    const profile = await fetchLineProfile(code, origin, saved.nonce);
    const user = await upsertLineUser(profile);
    if (user.status !== "ACTIVE") return back(origin, "suspended");
    const res = NextResponse.redirect(new URL(safeReturnTo(saved.returnTo), origin));
    res.cookies.set(SESSION_COOKIE, createSessionToken(user.id), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    res.cookies.delete({ name: "sise_oauth", path: "/api/auth/line" });
    return res;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("LINE login failed", msg);
    // a short, non-sensitive code so a failure can be diagnosed from a screenshot
    const why = /token exchange failed \((\d+)\)/.exec(msg) ? `token-${/\((\d+)\)/.exec(msg)![1]}` : /verification failed \((\d+)\)/.exec(msg) ? `verify-${/\((\d+)\)/.exec(msg)![1]}` : /id_token/.test(msg) ? "idtoken" : /handle/.test(msg) ? "handle" : /prisma|database|P\d{4}/i.test(msg) ? "db" : "server";
    return back(origin, "failed", why);
  }
}
