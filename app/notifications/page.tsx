import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { NotificationsView } from "@/components/notifications-view";
import { listNotifications } from "@/lib/server/repo";
import { getSession } from "@/lib/server/session";

export const metadata: Metadata = { title: "การแจ้งเตือน", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const user = await getSession();
  if (!user) redirect("/login?returnTo=/notifications");
  return <NotificationsView items={await listNotifications(user.id)} />;
}
