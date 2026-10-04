import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { AdminView } from "@/components/admin-view";
import { adminOverview } from "@/lib/server/repo";
import { getSession, isStaffRole } from "@/lib/server/session";
import { BANNED_WORDS } from "@/lib/data";

export const metadata: Metadata = { title: "หลังบ้านผู้ดูแล", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getSession();
  if (!user) redirect("/login?returnTo=/admin");
  if (!isStaffRole(user.role)) notFound(); // don't reveal the page to regular members
  const overview = await adminOverview();
  return <AdminView overview={overview} role={user.role} bannedWords={BANNED_WORDS} />;
}
