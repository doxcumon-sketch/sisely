"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { actions, useSise } from "@/lib/store";

export interface MenuLink { href: string; label: string; hint?: string }

/** Full-screen menu for phones and tablets: large serif links, quiet secondary actions. */
export function MobileMenu({ primary, secondary }: { primary: MenuLink[]; secondary: MenuLink[] }) {
  const pathname = usePathname();
  // the menu belongs to the page it was opened on: navigating elsewhere closes it without an effect
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const setOpen = (v: boolean) => setOpenOn(v ? pathname : null);
  const me = useSise((s) => s.me);
  const ready = useSise((s) => s.ready);
  const theme = useSise((s) => s.theme);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [open]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="press -mr-2 p-2.5 lg:hidden" aria-label="เปิดเมนู" aria-expanded={open} aria-controls="mobile-menu">
        <Menu className="h-6 w-6" strokeWidth={1.5} />
      </button>
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="เมนู"
        hidden={!open}
        className="fixed inset-0 z-[80] flex flex-col overflow-y-auto bg-paper px-6 pb-10 pt-5 text-ink lg:hidden"
      >
        <div className="flex items-center justify-between">
          <span className="wordmark text-lg tracking-[0.34em]">SISAKET</span>
          <button type="button" onClick={() => setOpen(false)} className="press -mr-2 p-2.5" aria-label="ปิดเมนู"><X className="h-6 w-6" strokeWidth={1.5} /></button>
        </div>
        <nav className="mt-10 flex flex-1 flex-col" aria-label="เมนูหลัก">
          {primary.map((l, i) => (
            <Link key={l.href} href={l.href} className="menu-link group flex items-baseline gap-4 border-b border-line py-4 text-[2.4rem] leading-none" style={{ animation: open ? `rise 0.7s cubic-bezier(0.2,0.7,0.2,1) ${0.06 * i}s backwards` : undefined }}>
              <span className="kicker w-6 text-faint">{String(i + 1).padStart(2, "0")}</span>
              <span className="flex-1">{l.label}</span>
              {l.hint && <span className="kicker">{l.hint}</span>}
            </Link>
          ))}
        </nav>
        <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-3 text-sm text-ink-2">
          {secondary.map((l) => <Link key={l.href} href={l.href} className="py-1 hover:text-gold">{l.label}</Link>)}
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-line pt-6">
          {me ? (
            <Link href="/me" className="press border border-line px-5 py-2.5 text-sm font-medium">{me.name}</Link>
          ) : ready ? (
            <Link href={`/login?returnTo=${encodeURIComponent(pathname)}`} className="press bg-cta px-5 py-2.5 text-sm font-semibold text-on-cta">เข้าสู่ระบบ</Link>
          ) : null}
          <Link href="/create" className="press border border-gold px-5 py-2.5 text-sm font-medium text-gold">โพสต์</Link>
          <button type="button" onClick={() => actions.setTheme(theme === "dark" ? "light" : "dark")} className="press ml-auto text-sm text-muted">{theme === "dark" ? "โหมดสว่าง" : "โหมดมืด"}</button>
        </div>
      </div>
    </>
  );
}
