import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ProfileView } from "@/components/profile-view";
import { prisma } from "@/lib/prisma";
import { getProfile, getViewer, listEvents, listPlaces, listRooms, queryPosts } from "@/lib/server/repo";
import { getSession } from "@/lib/server/session";

export const metadata: Metadata = { title: "โปรไฟล์ของฉัน", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function MePage() {
  const user = await getSession();
  if (!user) redirect("/login?returnTo=/me");
  const [profile, viewer, allRooms, allPlaces, allEvents] = await Promise.all([getProfile(user.handle), getViewer(user), listRooms(), listPlaces(), listEvents()]);
  if (!profile) redirect("/login");
  const [initialPosts, blockedUsers] = await Promise.all([
    queryPosts({ mode: "new", authorId: user.id, viewerId: user.id, limit: 8 }),
    prisma.user.findMany({ where: { id: { in: viewer.blocked } }, select: { id: true, name: true } }),
  ]);
  // Own pending/hidden posts are not in public feeds; the count shown is published posts only.
  return (
    <ProfileView
      data={{
        profile,
        isMe: true,
        initialPosts,
        savedPlaces: allPlaces.filter((p) => viewer.saves.places.includes(p.slug)),
        savedEvents: allEvents.filter((e) => viewer.saves.events.includes(e.slug)),
        rooms: allRooms.filter((r) => viewer.follows.rooms.includes(r.slug)),
        blockedUsers,
      }}
    />
  );
}
