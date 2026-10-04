import type { Metadata } from "next";
import { LiffEntry } from "@/components/liff-entry";

export const metadata: Metadata = { title: "กำลังเข้าสู่ระบบ", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function LiffPage({ searchParams }: { searchParams: Promise<{ returnTo?: string }> }) {
  const sp = await searchParams;
  return <LiffEntry liffId={process.env.NEXT_PUBLIC_LIFF_ID?.trim() ?? ""} returnTo={sp.returnTo ?? "/"} />;
}
