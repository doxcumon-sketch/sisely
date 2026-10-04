import { ok, fail } from "@/lib/server/http";
import { queryPosts, type FeedMode } from "@/lib/server/repo";
import { getSession } from "@/lib/server/session";

export const dynamic = "force-dynamic";
const MODES: FeedMode[] = ["forYou", "hot", "new", "top", "unanswered"];

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const mode = sp.get("mode") as FeedMode;
  if (!MODES.includes(mode)) return fail("mode ไม่ถูกต้อง");
  const user = await getSession();
  const ids = sp.get("ids")?.split(",").filter(Boolean).slice(0, 50);
  const result = await queryPosts({
    mode,
    roomSlug: sp.get("room") ?? undefined,
    authorId: sp.get("author") ?? undefined,
    placeSlug: sp.get("place") ?? undefined,
    eventSlug: sp.get("event") ?? undefined,
    ids,
    viewerId: user?.id,
    offset: Math.max(0, Number(sp.get("offset")) || 0),
    limit: Number(sp.get("limit")) || 8,
  });
  return ok(result, { headers: { "cache-control": "no-store" } });
}
