import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Composer } from "@/components/composer";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/server/session";

export const metadata: Metadata = { title: "โพสต์ใหม่", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function CreatePage() {
  const user = await getSession();
  if (!user) redirect("/login?returnTo=/create");
  const [rooms, places] = await Promise.all([
    prisma.room.findMany({ orderBy: { sortOrder: "asc" }, select: { slug: true, name: true } }),
    prisma.place.findMany({ select: { slug: true, name: true } }),
  ]);
  return (
    <Suspense fallback={<div className="skeleton h-96" />}>
      <Composer rooms={rooms} places={places} />
    </Suspense>
  );
}
