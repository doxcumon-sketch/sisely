"use client";

import Script from "next/script";
import { useCallback, useRef, useState } from "react";

type LiffSdk = {
  init(c: { liffId: string }): Promise<void>;
  isLoggedIn(): boolean;
  login(c?: { redirectUri?: string }): void;
  getIDToken(): string | null;
};

/** Runs inside the LINE app: init LIFF, take the ID token, trade it for a SISE session, then continue to the page you wanted. */
export function LiffEntry({ liffId, returnTo }: { liffId: string; returnTo: string }) {
  const [msg, setMsg] = useState(liffId ? "กำลังเข้าสู่ระบบด้วย LINE…" : "ยังไม่ได้ตั้งค่า LIFF");
  const started = useRef(false);

  const run = useCallback(async () => {
    if (started.current || !liffId) return;
    started.current = true;
    const liff = (window as unknown as { liff?: LiffSdk }).liff;
    try {
      if (!liff) throw new Error("sdk");
      await liff.init({ liffId });
      if (!liff.isLoggedIn()) { liff.login({ redirectUri: window.location.href }); return; }
      const idToken = liff.getIDToken();
      if (!idToken) throw new Error("token");
      const res = await fetch("/api/auth/liff", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ idToken, returnTo }) });
      const json = (await res.json().catch(() => null)) as { ok?: boolean; data?: { returnTo: string }; error?: string } | null;
      if (!res.ok || !json?.ok) throw new Error(json?.error ?? "server");
      window.location.replace(json.data?.returnTo ?? "/");
    } catch (e) {
      started.current = false;
      setMsg(`เข้าสู่ระบบไม่สำเร็จ (${e instanceof Error ? e.message : "error"}) ลองกดใหม่อีกครั้ง`);
    }
  }, [liffId, returnTo]);

  return (
    <div className="mx-auto max-w-md py-20 text-center">
      <Script src="https://static.line-scdn.net/liff/edge/2/sdk.js" strategy="afterInteractive" onLoad={() => void run()} onReady={() => void run()} />
      <p className="font-editorial text-xl font-semibold">{msg}</p>
      <button type="button" onClick={() => { started.current = false; void run(); }} className="press mt-6 border border-line bg-card px-5 py-2.5 text-sm font-semibold">ลองอีกครั้ง</button>
    </div>
  );
}
