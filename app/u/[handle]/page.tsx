import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProfileView } from "@/components/profile-view";
import { getProfile, listUserComments, queryPosts } from "@/lib/server/repo";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const { handle } = await params;
  const u = await getProfile(decodeURIComponent(handle));
  if (!u) return { title: "ไม่พบผู้ใช้" };
  return { title: `${u.name} (@${u.handle})`, description: u.bio || `สมาชิก SISE จาก${u.area}`, alternates: { canonical: `/u/${u.handle}` } };
}

export default async function UserPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const profile = await getProfile(decodeURIComponent(handle));
  if (!profile) notFound();
  const [initialPosts, comments] = await Promise.all([queryPosts({ mode: "new", authorId: profile.id, limit: 8 }), listUserComments(profile.id)]);
  return <ProfileView data={{ profile, isMe: false, initialPosts, comments }} />;
}
