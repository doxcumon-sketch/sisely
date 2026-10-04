import type { Metadata } from "next";
import { NotificationsView } from "@/components/notifications-view";

export const metadata: Metadata = { title: "การแจ้งเตือน", robots: { index: false } };

export default function NotificationsPage() {
  return <NotificationsView />;
}
