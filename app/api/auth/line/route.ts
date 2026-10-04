import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { authorizeUrl, lineConfigured } from "@/lib/server/line";
import { safeReturnTo } from "@/lib/server/http";
import { sign } from "@/lib/server/session";

/**
 * LINE only accepts the callback URL registered in the console. If someone arrives via another host
 * (a per-deployment URL, a preview, www…), restart the flow on the canonical domain so the state cookie,
 * redirect_uri and callback all share one origin.
 */
function canonicalOrigin(): string | null {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  const raw = explicit || (vercel ? `https://${vercel}` : "");
  try {
    return raw ? new URL(raw).origin : null;
  } catch {
    return null;
  }
}

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const canonical = canonicalOrigin();
  if (canonical && url.origin !== canonical) {
    const target = new URL("/api/auth/line", canonical);
    const rt = url.searchParams.get("returnTo");
    if (rt) target.searchParams.set("returnTo", safeReturnTo(rt));
    return NextResponse.redirect(target);
  }
  if (!lineConfigured()) return NextResponse.redirect(new URL("/login?error=not_configured", url.origin));

  const state = randomBytes(16).toString("base64url");
  const nonce = randomBytes(16).toString("base64url");
  const returnTo = safeReturnTo(url.searchParams.get("returnTo"));
  const payload = Buffer.from(JSON.stringify({ state, nonce, returnTo, exp: Date.now() + 10 * 60_000 })).toString("base64url");

  const res = NextResponse.redirect(authorizeUrl(url.origin, state, nonce));
  res.cookies.set("sise_oauth", `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: "lax", // must survive the redirect back from access.line.me
    secure: process.env.NODE_ENV === "production",
    path: "/api/auth/line",
    maxAge: 600,
  });
  return res;
}
