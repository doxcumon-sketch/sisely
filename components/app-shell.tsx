"use client";

import { Bell, Compass, Home, Moon, PenLine, Plus, Search, Sun, User, LayoutGrid, Ticket, MapPin, Tag, ShoppingBag, BookOpen, Shield } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { cx } from "@/components/ui";
import { ToastHost } from "@/components/toast";
import { Avatar } from "@/components/ui";
import { LoginPrompt } from "@/components/login-prompt";
import { actions, loadViewer, useSise } from "@/lib/store";

const TOP_NAV = [
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
  const unread = useSise((s) => s.unread);
  return (
    <Link href="/notifications" className="press relative rounded-sm p-2.5 text-ink-2 hover:bg-paper-2" aria-label={unread ? `การแจ้งเตือน ${unread} รายการใหม่` : "การแจ้งเตือน"}>
      <Bell className="h-5 w-5" />
      {unread > 0 && (
        <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-sm bg-laterite px-1 text-[10px] font-bold leading-none text-white">
          {unread}
        </span>
      )}
    </Link>
  );
}

function ViewerSync() {
  useEffect(() => {
    void loadViewer();
  }, []);
  return null;
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
  const me = useSise((s) => s.me);
  const ready = useSise((s) => s.ready);
  const composing = pathname === "/create";
  const admin = pathname.startsWith("/admin");

  return (
    <div className="min-h-dvh">
      <ThemeSync />
      <ViewerSync />
      <KeyboardWatcher />
      <PwaRegister />

      <header className="sticky top-0 z-40 bg-paper/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[1360px] items-center gap-3 px-4 lg:h-[4.25rem] lg:gap-8 lg:px-8">
          <Link href="/" className="shrink-0" aria-label="SISE หน้าแรก">
            <Wordmark className="lg:text-[1.9rem]" />
          </Link>

          <nav className="hidden flex-1 items-center gap-0.5 lg:flex" aria-label="เมนูหลัก">
            {TOP_NAV.map(({ href, label }) => {
              const active = isActive(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cx(
                    "press relative px-3.5 py-2 text-[0.95rem] font-medium tracking-wide transition-colors",
                    active ? "text-ink" : "text-muted hover:text-ink",
                  )}
                >
                  {label}
                  <span className={cx("absolute inset-x-3.5 -bottom-[7px] h-[2px] bg-gold transition-transform", active ? "scale-x-100" : "scale-x-0")} />
                </Link>
              );
            })}
          </nav>

          <Link
            href="/search"
            className="press flex h-10 min-w-0 flex-1 items-center gap-2 rounded-sm border border-line bg-card px-3.5 text-sm text-faint hover:border-gold lg:max-w-[15rem] lg:flex-none xl:max-w-[18rem]"
          >
            <Search className="h-4 w-4 shrink-0 text-gold" />
            <span className="truncate">วันนี้กำลังหาอะไร?</span>
          </Link>

          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => actions.setTheme(theme === "dark" ? "light" : "dark")}
              className="press hidden rounded-sm p-2.5 text-ink-2 hover:bg-paper-2 sm:block"
              aria-label={theme === "dark" ? "สลับเป็นโหมดสว่าง" : "สลับเป็นโหมดมืด"}
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            {me && <BellButton />}
            {ready && !me && (
              <Link href={`/login?returnTo=${encodeURIComponent(pathname)}`} className="press rounded-sm border border-line bg-card px-4 py-2 text-sm font-semibold hover:border-gold">เข้าสู่ระบบ</Link>
            )}
            {me && me.role !== "MEMBER" && (
              <Link href="/admin" className={cx("press hidden rounded-sm p-2.5 hover:bg-paper-2 lg:block", admin ? "text-gold" : "text-ink-2")} aria-label="หลังบ้านผู้ดูแล"><Shield className="h-5 w-5" /></Link>
            )}
            {me && (
              <Link href="/me" className="ml-1 hidden rounded-full lg:block" aria-label="โปรไฟล์ของฉัน"><Avatar name={me.name} tone="gold" size={36} src={me.pictureUrl} /></Link>
            )}
            <Link href="/create" className="press ml-2 hidden items-center gap-2 rounded-sm bg-night px-5 py-2.5 text-sm font-semibold text-on-night hover:bg-night-2 lg:flex">
              <PenLine className="h-4 w-4" /> โพสต์
            </Link>
          </div>
        </div>
        <div className="hairline-gold" />
      </header>

      <main id="main" className="mx-auto max-w-[1360px] px-4 pb-28 pt-5 lg:px-8 lg:pb-16 lg:pt-8">
        {children}
      </main>

      <footer className="hidden border-t border-line bg-card lg:block">
        <div className="mx-auto flex max-w-[1360px] items-center justify-between gap-6 px-8 py-8 text-sm text-muted">
          <div className="flex items-center gap-4"><Wordmark /><span>ศรีสะเกษในแบบของเรา · Local stories. Local places. Local people.</span></div>
          <p>ข้อมูลร้านและงานบางส่วนเป็นตัวอย่างระหว่างช่วงทดลอง · <Link href="/credits" className="underline hover:text-ink">เครดิตภาพ</Link></p>
        </div>
      </footer>

      {!composing && (
        <nav className="kb-hide pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 backdrop-blur-xl lg:hidden" aria-label="เมนูหลัก">
          <ul className="mx-auto grid max-w-md grid-cols-5 items-end">
            {TABS.map(({ href, label, icon: Icon, primary }) => {
              const active = isActive(pathname, href);
              return (
                <li key={href} className="flex justify-center">
                  {primary ? (
                    <Link href={href} className="press -mt-5 flex h-14 w-14 items-center justify-center rounded-md bg-gradient-to-br from-[#efd28a] via-[#c9a043] to-[#9a7220] text-night shadow-[0_10px_24px_-8px_rgba(169,124,31,0.8)]" aria-label="โพสต์ใหม่">
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
      <LoginPrompt />
      <ToastHost />
    </div>
  );
}
