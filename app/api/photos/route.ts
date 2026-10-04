import { prisma } from "@/lib/prisma";
import { fail, ok, requireMember } from "@/lib/server/http";
import { checkLimit } from "@/lib/server/limits";

const MAX_BYTES = 700 * 1024;

function sniff(buf: Buffer): string | null {
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf.length > 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (buf.length > 12 && buf.subarray(0, 4).toString() === "RIFF" && buf.subarray(8, 12).toString() === "WEBP") return "image/webp";
  return null;
}

/** Upload one photo (already downscaled by the client). Attached to a post when the post is created. */
export async function POST(req: Request) {
  const g = await requireMember(req);
  if ("error" in g) return g.error;
  const limited = await checkLimit(g.user.id, "upload");
  if (limited) return fail(limited, 429, "rate");

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return fail("ไม่พบไฟล์รูป");
  if (file.size > MAX_BYTES) return fail("รูปใหญ่เกินไป (สูงสุด 700KB)");
  const buf = Buffer.from(await file.arrayBuffer());
  const mime = sniff(buf);
  if (!mime) return fail("รองรับเฉพาะ JPG, PNG, WebP");
  const photo = await prisma.postPhoto.create({ data: { ownerId: g.user.id, mime, data: buf }, select: { id: true } });
  return ok({ id: photo.id, url: `/api/photos/${photo.id}` });
}
