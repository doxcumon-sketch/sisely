import "server-only";
import { prisma } from "@/lib/prisma";
import type { NotificationKind } from "../../generated/prisma/client";

export async function notify(input: { recipientId: string; actorId?: string; kind: NotificationKind; text: string; detail?: string; href: string }) {
  if (input.actorId && input.actorId === input.recipientId) return;
  await prisma.notification.create({
    data: { recipientId: input.recipientId, actorId: input.actorId, kind: input.kind, text: input.text, detail: input.detail?.slice(0, 140), href: input.href },
  });
}

/** @handle mentions (max 5 per item) → notifications for existing, active members. */
export async function notifyMentions(body: string, actor: { id: string; name: string }, href: string, where: string) {
  const handles = Array.from(new Set(Array.from(body.matchAll(/@([a-z0-9._]{3,24})/gi)).map((m) => m[1].toLowerCase()))).slice(0, 5);
  if (!handles.length) return;
  const users = await prisma.user.findMany({ where: { handle: { in: handles }, status: "ACTIVE" }, select: { id: true } });
  await Promise.all(users.map((u) => notify({ recipientId: u.id, actorId: actor.id, kind: "mention", text: `${actor.name} กล่าวถึงคุณใน${where}`, detail: body, href })));
}
