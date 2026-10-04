"use client";

import { Download, X } from "lucide-react";
import { useEffect, useState } from "react";
import { actions, useSise } from "@/lib/store";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/** Shows only when the browser says SISE is installable (Android/Chrome); iOS users add via Share → Add to Home Screen. */
export function InstallBanner() {
  const dismissed = useSise((s) => s.installDismissed);
  const [evt, setEvt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (!evt || dismissed) return null;
  return (
    <div className="surface flex items-center gap-3 p-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-night text-gold"><Download className="h-5 w-5" /></span>
      <div className="min-w-0 flex-1">
        <p className="font-editorial font-semibold">เอา SISE ไว้บนหน้าจอมือถือ</p>
        <p className="text-sm text-muted">แตะเปิดได้เลยเหมือนแอป ไม่ต้องจำลิงก์</p>
      </div>
      <button type="button" onClick={async () => { await evt.prompt(); setEvt(null); }} className="press rounded-sm bg-night px-4 py-2 text-sm font-semibold text-on-night">ติดตั้ง</button>
      <button type="button" onClick={() => actions.dismissInstall()} className="press rounded-sm p-2 text-muted hover:bg-paper-2" aria-label="ปิด"><X className="h-4 w-4" /></button>
    </div>
  );
}
