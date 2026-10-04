"use client";

import { MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { LIFF_ID, liffUrl } from "@/lib/liff";

/**
 * "Sign in with LINE". The fallback href goes through our server (works everywhere); once the pre-built authorize URL
 * arrives the button becomes a direct link to access.line.me so mobile can open the LINE app instead of the browser.
 */
export function LineLoginButton({ returnTo, enabled = true, className }: { returnTo: string; enabled?: boolean; className?: string }) {
  const fallback = `/api/auth/line?returnTo=${encodeURIComponent(returnTo)}`;
  const [direct, setDirect] = useState<string | null>(null);
  const useLiff = !!LIFF_ID;

  useEffect(() => {
    if (!enabled || useLiff) return;
    let alive = true;
    const load = () =>
      fetch(`/api/auth/line/start?returnTo=${encodeURIComponent(returnTo)}`, { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : null))
        .then((j: { url?: string | null } | null) => { if (alive) setDirect(j?.url ?? null); })
        .catch(() => {});
    void load();
    // the state cookie lives 10 minutes: refresh it when the tab comes back to the foreground
    const onVisible = () => { if (document.visibilityState === "visible") void load(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => { alive = false; document.removeEventListener("visibilitychange", onVisible); };
  }, [returnTo, enabled, useLiff]);

  return (
    <a
      href={enabled ? (useLiff ? liffUrl(returnTo) : direct ?? fallback) : undefined}
      aria-disabled={!enabled}
      className={className ?? `press btn-shine flex items-center justify-center gap-3 bg-[#06c755] px-6 py-4 text-[1.05rem] font-semibold text-white ${enabled ? "" : "pointer-events-none opacity-50"}`}
    >
      <MessageCircle className="h-5 w-5" /> เข้าสู่ระบบด้วย LINE
    </a>
  );
}
