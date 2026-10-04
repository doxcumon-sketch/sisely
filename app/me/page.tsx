import type { Metadata } from "next";
import { ProfileView } from "@/components/profile-view";

export const metadata: Metadata = { title: "โปรไฟล์ของฉัน", robots: { index: false } };

export default function MePage() {
  return <ProfileView />;
}
