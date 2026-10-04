import { ok } from "@/lib/server/http";
import { getViewer } from "@/lib/server/repo";
import { getSession } from "@/lib/server/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSession();
  return ok(user ? await getViewer(user) : null, { headers: { "cache-control": "no-store" } });
}
