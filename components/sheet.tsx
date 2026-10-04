"use client";

import { X } from "lucide-react";
import { useEffect, useId, type ReactNode } from "react";

/** Bottom sheet on phones, centered dialog on desktop. Escape / backdrop close it. */
export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const titleId = useId();
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center lg:items-center" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <button type="button" aria-label="ปิด" className="absolute inset-0 bg-night/55 backdrop-blur-[2px]" onClick={onClose} />
      <div className="rise relative max-h-[88dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-card p-5 pb-8 shadow-[var(--shadow-pop)] lg:rounded-3xl lg:pb-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 id={titleId} className="font-editorial text-lg font-semibold">{title}</h2>
          <button type="button" onClick={onClose} className="press rounded-full p-2 text-muted hover:bg-paper-2" aria-label="ปิด">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
