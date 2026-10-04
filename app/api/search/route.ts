import { ok } from "@/lib/server/http";
import { searchAll } from "@/lib/server/repo";
import { getSession } from "@/lib/server/session";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q") ?? "";
  const user = await getSession();
  return ok(await searchAll(q, user?.id), { headers: { "cache-control": "no-store" } });
}
