import type { Metadata } from "next";
import { LoginView } from "@/components/login-view";
import { lineConfigured } from "@/lib/server/line";
import { safeReturnTo } from "@/lib/server/http";

export const metadata: Metadata = { title: "เข้าสู่ระบบ", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ returnTo?: string; error?: string; why?: string }> }) {
  const sp = await searchParams;
  return <LoginView returnTo={safeReturnTo(sp.returnTo)} error={sp.error} why={sp.why?.replace(/[^a-z0-9-]/gi, "").slice(0, 24)} line={lineConfigured()} dev={process.env.ALLOW_DEV_LOGIN === "1"} />;
}
