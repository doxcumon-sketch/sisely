import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await prisma.postPhoto.findUnique({ where: { id }, select: { mime: true, data: true, post: { select: { status: true } } } });
  if (!p || (p.post && p.post.status === "HIDDEN")) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(p.data), {
    headers: { "content-type": p.mime, "cache-control": "public, max-age=31536000, immutable", "x-content-type-options": "nosniff" },
  });
}
