import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { fail, ok, requireMember } from "@/lib/server/http";

const schema = z.object({ ids: z.array(z.string()).max(100).optional(), all: z.boolean().optional() });

export async function POST(req: Request) {
  const g = await requireMember(req);
  if ("error" in g) return g.error;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail("ข้อมูลไม่ถูกต้อง");
  const { ids, all } = parsed.data;
  await prisma.notification.updateMany({
    where: { recipientId: g.user.id, readAt: null, ...(all ? {} : { id: { in: ids ?? [] } }) },
    data: { readAt: new Date() },
  });
  const unread = await prisma.notification.count({ where: { recipientId: g.user.id, readAt: null } });
  return ok({ unread });
}
