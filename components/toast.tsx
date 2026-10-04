"use client";

import { useEffect, useState } from "react";

type Listener = (msg: string) => void;
const listeners = new Set<Listener>();

export function toast(message: string) {
  listeners.forEach((l) => l(message));
}

export function ToastHost() {
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => {
    let timer: number | undefined;
    const onMsg: Listener = (m) => {
      setMsg(m);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setMsg(null), 2400);
    };
    listeners.add(onMsg);
    return () => {
      listeners.delete(onMsg);
      window.clearTimeout(timer);
    };
  }, []);
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-24 z-[70] flex justify-center px-4 lg:bottom-6">
      {msg && (
        <div className="rise pointer-events-auto rounded-full bg-night px-5 py-2.5 text-sm font-medium text-on-night shadow-[var(--shadow-pop)]">
          {msg}
        </div>
      )}
    </div>
  );
}
