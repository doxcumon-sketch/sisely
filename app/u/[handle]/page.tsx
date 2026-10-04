import type { Metadata } from "next";
import { ProfileView } from "@/components/profile-view";
import { userByHandle, users } from "@/lib/data";

export function generateStaticParams() {
  return users.filter((u) => u.id !== "u-me").map((u) => ({ handle: u.handle }));
}

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const { handle } = await params;
  const u = userByHandle(decodeURIComponent(handle));
  if (!u) return { title: "ไม่พบผู้ใช้" };
  return { title: `${u.name} (@${u.handle})`, description: u.bio, alternates: { canonical: `/u/${u.handle}` } };
}

export default async function UserPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  return <ProfileView handle={decodeURIComponent(handle)} />;
}
