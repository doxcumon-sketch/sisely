import { prisma } from "@/lib/prisma";
import { ok, sameOrigin, fail } from "@/lib/server/http";

/** Anonymous-friendly view counter. The client sends it once per post per browser session. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(req)) return fail("คำขอไม่ถูกต้อง", 403);
  const { id } = await params;
  await prisma.post.updateMany({ where: { id, status: "PUBLISHED" }, data: { viewCount: { increment: 1 } } });
  return ok({});
}
