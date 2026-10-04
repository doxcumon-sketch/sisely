"use client";

import { Bell, Compass, Home, Moon, PenLine, Plus, Search, Sun, User, LayoutGrid, Ticket, MapPin, Tag, ShoppingBag, BookOpen, Shield } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { cx } from "@/components/ui";
import { ToastHost } from "@/components/toast";
import { seedNotifications } from "@/lib/data";
import { actions, useSise } from "@/lib/store";

const SIDE_NAV = [
  { href: "/", label: "หน้าแรก", icon: Home },
  { href: "/discover", label: "ค้นพบ", icon: Compass },
  { href: "/rooms", label: "ห้อง", icon: LayoutGrid },
  { href: "/events", label: "งาน", icon: Ticket },
  { href: "/places", label: "สถานที่", icon: MapPin },
  { href: "/deals", label: "ดีล", icon: Tag },
  { href: "/market", label: "ซื้อขาย", icon: ShoppingBag },
  { href: "/guide", label: "ไกด์เมือง", icon: BookOpen },
];

const TABS = [
  { href: "/", label: "หน้าแรก", icon: Home },
  { href: "/discover", label: "ค้นพบ", icon: Compass },
  { href: "/create", label: "โพสต์", icon: Plus, primary: true },
  { href: "/rooms", label: "ห้อง", icon: LayoutGrid },
  { href: "/me", label: "โปรไฟล์", icon: User },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Wordmark({ className, light }: { className?: string; light?: boolean }) {
  return (
    <span className={cx("wordmark text-[1.65rem] font-bold leading-none", light ? "text-on-night" : "text-ink", className)}>
      SIS<span className="text-gold">E</span>
    </span>
  );
}

function BellButton() {
  const read = useSise((s) => s.readNotifs);
  const unread = seedNotifications.filter((n) => n.unread && !read.includes(n.id)).length;
  return (
    <Link href="/notifications" className="press relative rounded-full p-2.5 text-ink-2 hover:bg-paper-2" aria-label={unread ? `การแจ้งเตือน ${unread} รายการใหม่` : "การแจ้งเตือน"}>
      <Bell className="h-5 w-5" />
      {unread > 0 && (
        <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-laterite px-1 text-[10px] font-bold leading-none text-white">
          {unread}
        </span>
      )}
    </Link>
  );
}

function ThemeSync() {
  const theme = useSise((s) => s.theme);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
  return null;
}

/** Hides bottom chrome while the on-screen keyboard is open (CSS class only; no React state, so IMEs stay stable). */
function KeyboardWatcher() {
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    let base = Math.max(window.innerHeight, vv.height);
    let timer: number | undefined;
    const check = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        base = Math.max(base, window.innerHeight, vv.height);
        document.documentElement.classList.toggle("kb-open", vv.height < base * 0.78);
      }, 150);
    };
    const reset = () => {
      base = Math.max(window.innerHeight, vv.height);
    };
    vv.addEventListener("resize", check);
    window.addEventListener("orientationchange", reset);
    return () => {
      vv.removeEventListener("resize", check);
      window.removeEventListener("orientationchange", reset);
      window.clearTimeout(timer);
      document.documentElement.classList.remove("kb-open");
    };
  }, []);
  return null;
}

function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);
  return null;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const theme = useSise((s) => s.theme);
  const composing = pathname === "/create";
  const admin = pathname.startsWith("/admin");

  return (
    <div className="min-h-dvh">
      <ThemeSync />
      <KeyboardWatcher />
      <PwaRegister />

      <header className="sticky top-0 z-40 border-b border-line-soft bg-paper/85 backdrop-blur-xl lg:pl-60">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-4 lg:h-16 lg:px-8">
          <Link href="/" className="lg:hidden" aria-label="SISE หน้าแรก">
            <Wordmark />
          </Link>
          <Link
            href="/search"
            className="press mx-1 flex h-10 min-w-0 flex-1 items-center gap-2 rounded-full border border-line bg-card px-4 text-sm text-faint hover:border-gold/60 lg:mx-0 lg:max-w-xl"
          >
            <Search className="h-4 w-4 shrink-0" />
            <span className="truncate">วันนี้กำลังหาอะไร?</span>
          </Link>
          <div className="ml-auto flex items-center lg:gap-1">
            <button
              type="button"
              onClick={() => actions.setTheme(theme === "dark" ? "light" : "dark")}
              className="press hidden rounded-full p-2.5 text-ink-2 hover:bg-paper-2 sm:block"
              aria-label={theme === "dark" ? "สลับเป็นโหมดสว่าง" : "สลับเป็นโหมดมืด"}
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <BellButton />
            <Link href="/create" className="press ml-1 hidden items-center gap-2 rounded-full bg-night px-5 py-2.5 text-sm font-semibold text-on-night hover:bg-night-2 lg:flex">
              <PenLine className="h-4 w-4" /> โพสต์
            </Link>
          </div>
        </div>
      </header>

      <aside className="fixed inset-y-0 left-0 z-50 hidden w-60 flex-col border-r border-line-soft bg-paper px-5 py-6 lg:flex" aria-label="เมนูหลัก">
        <Link href="/" className="mb-8 block px-2">
          <Wordmark className="text-3xl" />
          <span className="mt-1 block text-xs text-muted">ศรีสะเกษในแบบของเรา</span>
        </Link>
        <nav className="flex flex-1 flex-col gap-0.5">
          {SIDE_NAV.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cx(
                  "press flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.95rem] font-medium",
                  active ? "bg-night text-on-night" : "text-ink-2 hover:bg-paper-2",
                )}
              >
                <Icon className="h-[18px] w-[18px]" />
                {label}
              </Link>
            );
          })}
          <div className="hairline-gold my-3" />
          <Link href="/me" className={cx("press flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.95rem] font-medium", isActive(pathname, "/me") ? "bg-night text-on-night" : "text-ink-2 hover:bg-paper-2")}>
            <User className="h-[18px] w-[18px]" /> โปรไฟล์
          </Link>
          <Link href="/notifications" className="press flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.95rem] font-medium text-ink-2 hover:bg-paper-2">
            <Bell className="h-[18px] w-[18px]" /> แจ้งเตือน
          </Link>
        </nav>
        <Link href="/admin" className={cx("press mt-3 flex items-center gap-3 rounded-xl px-3 py-2 text-sm", admin ? "bg-night text-on-night" : "text-faint hover:bg-paper-2")}>
          <Shield className="h-4 w-4" /> หลังบ้าน (ผู้ดูแล)
        </Link>
      </aside>

      <main id="main" className="mx-auto max-w-6xl px-4 pb-28 pt-5 lg:pl-[calc(15rem+2rem)] lg:pr-8 lg:pb-16 lg:pt-8">
        {children}
      </main>

      {!composing && (
        <nav className="kb-hide pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/92 backdrop-blur-xl lg:hidden" aria-label="เมนูหลัก">
          <ul className="mx-auto grid max-w-md grid-cols-5 items-end">
            {TABS.map(({ href, label, icon: Icon, primary }) => {
              const active = isActive(pathname, href);
              return (
                <li key={href} className="flex justify-center">
                  {primary ? (
                    <Link href={href} className="press -mt-5 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#e6c77a] via-[#c9a043] to-[#a67a22] text-night shadow-[0_10px_24px_-8px_rgba(184,140,52,0.8)]" aria-label="โพสต์ใหม่">
                      <Icon className="h-7 w-7" strokeWidth={2.4} />
                    </Link>
                  ) : (
                    <Link href={href} aria-current={active ? "page" : undefined} className={cx("press flex w-full flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium", active ? "text-ink" : "text-faint")}>
                      <Icon className={cx("h-[22px] w-[22px]", active && "text-gold")} strokeWidth={active ? 2.4 : 1.8} />
                      {label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      )}
      <ToastHost />
    </div>
  );
}
