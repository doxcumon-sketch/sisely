import "server-only";
import { prisma } from "@/lib/prisma";

/** DB-backed sliding window: survives restarts and works across serverless instances. */
export const LIMITS = {
  post: { max: 5, windowMs: 10 * 60_000, msg: "โพสต์ถี่เกินไป กรุณารอสักครู่แล้วลองใหม่ (จำกัด 5 โพสต์ต่อ 10 นาที)" },
  comment: { max: 6, windowMs: 60_000, msg: "คอมเมนต์ถี่เกินไป รอสักครู่แล้วลองอีกครั้ง" },
  react: { max: 90, windowMs: 60_000, msg: "กดถี่เกินไป รอสักครู่" },
  report: { max: 10, windowMs: 3_600_000, msg: "ส่งรายงานถี่เกินไป ลองใหม่ภายหลัง" },
  upload: { max: 12, windowMs: 10 * 60_000, msg: "อัปโหลดรูปถี่เกินไป ลองใหม่ภายหลัง" },
  social: { max: 60, windowMs: 60_000, msg: "ทำรายการถี่เกินไป รอสักครู่" },
} as const;

export type LimitKey = keyof typeof LIMITS;

/** Records the action and returns an error message if the user is over the limit, else null. */
export async function checkLimit(userId: string, key: LimitKey): Promise<string | null> {
  const { max, windowMs, msg } = LIMITS[key];
  const since = new Date(Date.now() - windowMs);
  const used = await prisma.rateEvent.count({ where: { userId, action: key, createdAt: { gte: since } } });
  if (used >= max) return msg;
  await prisma.rateEvent.create({ data: { userId, action: key } });
  // opportunistic cleanup keeps the table small
  if (Math.random() < 0.02) await prisma.rateEvent.deleteMany({ where: { createdAt: { lt: new Date(Date.now() - 86_400_000) } } });
  return null;
}
