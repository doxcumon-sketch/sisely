import { NextResponse } from "next/server";
import { lineConfigured } from "@/lib/server/line";
import { beginLine } from "@/lib/server/line-start";
import { safeReturnTo } from "@/lib/server/http";

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

  const { url: target, cookie } = beginLine(url.origin, safeReturnTo(url.searchParams.get("returnTo")));
  const res = NextResponse.redirect(target);
  res.cookies.set(cookie.name, cookie.value, cookie.options);
  return res;
}
