import { NextResponse } from "next/server";
import { lineConfigured } from "@/lib/server/line";
import { beginLine } from "@/lib/server/line-start";
import { safeReturnTo } from "@/lib/server/http";

export const dynamic = "force-dynamic";

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

/**
 * Pre-creates the LINE authorize URL (and the state cookie) so the login button can be a plain link straight to
 * access.line.me. A direct tap on that link lets phones hand the login to the LINE app (universal link) instead of
 * bouncing through our server redirect into the browser.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const returnTo = safeReturnTo(url.searchParams.get("returnTo"));
  const canonical = canonicalOrigin();
  if (!lineConfigured() || (canonical && url.origin !== canonical)) {
    return NextResponse.json({ url: null }, { headers: { "cache-control": "no-store" } });
  }
  const { url: target, cookie } = beginLine(url.origin, returnTo);
  const res = NextResponse.json({ url: target }, { headers: { "cache-control": "no-store" } });
  res.cookies.set(cookie.name, cookie.value, cookie.options);
  return res;
}
