"use client";

import { Bell, ChevronDown, Compass, Home, MessagesSquare, Moon, PenLine, Plus, Search, Sun, User, LayoutGrid, Tag, ShoppingBag, BookOpen, Shield } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { cx } from "@/components/ui";
import { ToastHost } from "@/components/toast";
import { Avatar } from "@/components/ui";
import { LoginPrompt } from "@/components/login-prompt";
import { MobileMenu } from "@/components/mobile-menu";
import { actions, loadViewer, useSise } from "@/lib/store";

const TOP_NAV = [
  { href: "/discover", label: "Discover" },
  { href: "/places", label: "Places" },
  { href: "/places?cat=restaurant", label: "Eat" },
  { href: "/#culture", label: "Culture" },
  { href: "/events", label: "Events" },
];
const MORE_NAV = [
  { href: "/community", label: "Community", icon: MessagesSquare },
  { href: "/plan", label: "Plan a trip", icon: Compass },
  { href: "/deals", label: "Deals", icon: Tag },
  { href: "/market", label: "Market", icon: ShoppingBag },
  { href: "/guide", label: "City guides", icon: BookOpen },
];
const MENU_PRIMARY = [
  { href: "/discover", label: "Discover", hint: "ค้นพบ" },
  { href: "/places", label: "Places", hint: "ที่เที่ยว" },
  { href: "/places?cat=restaurant", label: "Eat", hint: "กิน" },
  { href: "/#culture", label: "Culture", hint: "วัฒนธรรม" },
  { href: "/events", label: "Events", hint: "อีเวนต์" },
  { href: "/plan", label: "Plan a trip", hint: "จัดทริป" },
];
const MENU_SECONDARY = [
  { href: "/community", label: "ห้องคุยชุมชน" },
  { href: "/rooms", label: "ทุกห้อง" },
  { href: "/deals", label: "ดีล" },
  { href: "/market", label: "ซื้อขาย" },
  { href: "/guide", label: "ไกด์เมือง" },
  { href: "/search", label: "ค้นหา" },
];

const TABS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/create", label: "Post", icon: Plus, primary: true },
  { href: "/community", label: "Community", icon: LayoutGrid },
  { href: "/me", label: "Profile", icon: User },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Wordmark({ className, light }: { className?: string; light?: boolean }) {
  return (
    <span className={cx("wordmark text-[1.15rem] leading-none tracking-[0.34em]", light ? "text-on-night" : "text-ink", className)}>
      SISAKET
    </span>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <nav aria-label={title}>
      <p className="kicker mb-5">{title}</p>
      <ul className="space-y-3 text-sm">
        {links.map(([href, label]) => <li key={href}><Link href={href} className="text-ink-2 transition-colors hover:text-gold">{label}</Link></li>)}
      </ul>
    </nav>
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

/** Tiny visual layer: scroll progress, "header firms up when scrolled", and the card spotlight following the pointer. */
function FxProvider() {
  useEffect(() => {
    const root = document.documentElement;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = root.scrollHeight - window.innerHeight;
        root.style.setProperty("--sp", max > 0 ? String(Math.min(1, window.scrollY / max)) : "0");
        root.dataset.scrolled = window.scrollY > 8 ? "1" : "0";
      });
    };
    const onMove = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>(".surface");
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("pointermove", onMove, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); document.removeEventListener("pointermove", onMove); cancelAnimationFrame(raf); };
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
  const home = pathname === "/";

  return (
    <div className="min-h-dvh">
      <ThemeSync />
      <ViewerSync />
      <KeyboardWatcher />
      <PwaRegister />
      <FxProvider />
      <div className="scroll-progress" aria-hidden="true" />

      <header className={cx("site-header z-40 top-0", home ? "fixed inset-x-0" : "sticky")} data-over-hero={home ? "1" : undefined}>
        <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-6 px-5 sm:px-10 lg:h-20 lg:gap-10 lg:px-16">
          <Link href="/" className="shrink-0" aria-label="SISAKET หน้าแรก">
            <Wordmark className="lg:text-[1.35rem]" />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="เมนูหลัก">
            {TOP_NAV.map(({ href, label }) => {
              const active = isActive(pathname, href.split(/[#?]/)[0]) && !href.includes("#") && (!href.includes("?") || pathname === "/places");
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cx("nav-link press relative px-3.5 py-2 text-[0.72rem] font-medium uppercase tracking-[0.24em] transition-colors", active ? "text-gold" : "text-ink-2 hover:text-ink")}
                >
                  {label}
                </Link>
              );
            })}
            <details className="more relative">
              <summary className={cx("nav-link press flex items-center gap-1.5 px-3.5 py-2 text-[0.72rem] font-medium uppercase tracking-[0.24em]", MORE_NAV.some((m) => isActive(pathname, m.href)) ? "text-gold" : "text-ink-2 hover:text-ink")}>
                More <ChevronDown className="h-3.5 w-3.5" />
              </summary>
              <div className="surface absolute left-0 top-full z-50 mt-3 w-56 p-1.5 shadow-[var(--shadow-pop)]">
                {MORE_NAV.map(({ href, label, icon: Icon }) => (
                  <Link key={href} href={href} className="press flex items-center gap-3 px-3 py-2.5 text-sm text-ink-2 hover:bg-paper-2 hover:text-ink"><Icon className="h-4 w-4 text-gold" strokeWidth={1.5} /> {label}</Link>
                ))}
              </div>
            </details>
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
            <Link href="/search" aria-label="ค้นหา" className="press rounded-sm p-2.5 text-ink-2 hover:text-ink">
              <Search className="h-5 w-5" strokeWidth={1.5} />
            </Link>
            <button
              type="button"
              onClick={() => actions.setTheme(theme === "dark" ? "light" : "dark")}
              className="press hidden rounded-sm p-2.5 text-ink-2 hover:text-ink sm:block"
              aria-label={theme === "dark" ? "สลับเป็นโหมดสว่าง" : "สลับเป็นโหมดมืด"}
            >
              {theme === "dark" ? <Sun className="h-5 w-5" strokeWidth={1.5} /> : <Moon className="h-5 w-5" strokeWidth={1.5} />}
            </button>
            {me && <BellButton />}
            {me && me.role !== "MEMBER" && (
              <Link href="/admin" className={cx("press hidden rounded-sm p-2.5 hover:text-ink lg:block", admin ? "text-gold" : "text-ink-2")} aria-label="หลังบ้านผู้ดูแล"><Shield className="h-5 w-5" strokeWidth={1.5} /></Link>
            )}
            {me && (
              <Link href="/me" className="ml-1 hidden rounded-full lg:block" aria-label="โปรไฟล์ของฉัน"><Avatar name={me.name} tone="gold" size={34} src={me.pictureUrl} /></Link>
            )}
            {ready && !me && (
              <Link href={`/login?returnTo=${encodeURIComponent(pathname)}`} aria-label="เข้าสู่ระบบ" className="press px-2 py-2 text-[0.68rem] font-medium uppercase tracking-[0.2em] text-ink-2 hover:text-ink sm:px-3 sm:text-[0.72rem] sm:tracking-[0.24em]">Sign in</Link>
            )}
            <Link href="/create" className="press btn-shine ml-2 hidden items-center gap-2 border border-gold px-5 py-2.5 text-[0.72rem] font-medium uppercase tracking-[0.24em] text-gold hover:bg-gold hover:text-on-cta lg:flex">
              <PenLine className="h-3.5 w-3.5" strokeWidth={1.75} /> Post
            </Link>
            <MobileMenu primary={MENU_PRIMARY} secondary={MENU_SECONDARY} />
          </div>
        </div>
      </header>

      <main id="main" className={home ? "" : "mx-auto max-w-[1360px] px-4 pb-28 pt-8 lg:px-8 lg:pb-20 lg:pt-12"}>
        {children}
      </main>

      <footer className={cx("border-t border-line", !home && "bg-paper-2")}>
        <div className="mx-auto max-w-[1600px] px-5 pb-28 pt-16 sm:px-10 lg:px-16 lg:pb-14 lg:pt-24">
          <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div>
              <p className="display text-[clamp(2.4rem,6vw,4.5rem)] tracking-[0.04em]">SISAKET</p>
              <p className="display-i mt-3 text-xl text-gold">The soul of Isan</p>
              <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted">ศรีสะเกษ เมืองเล็ก ไม่ธรรมดา · Local stories. Local places. Local people.</p>
            </div>
            <FooterCol title="Explore" links={[["/discover", "Discover"], ["/places", "Places"], ["/places?cat=restaurant", "Eat & Drink"], ["/events", "Events"], ["/plan", "Plan a trip"]]} />
            <FooterCol title="Community" links={[["/community", "Community"], ["/rooms", "Rooms"], ["/deals", "Deals"], ["/market", "Market"], ["/guide", "City guides"]]} />
            <FooterCol title="About" links={[["/privacy", "Privacy"], ["/terms", "Terms"], ["/credits", "Image credits"]]} />
          </div>
          <div className="mt-16 flex flex-col gap-2 border-t border-line pt-6 text-xs text-faint sm:flex-row sm:justify-between">
            <p>© {new Date().getFullYear()} SISAKET</p>
            <p>ภาพประกอบเป็นงานต้นฉบับของ SISE · ข้อมูลร้านและงานบางส่วนเป็นตัวอย่างระหว่างช่วงทดลอง</p>
          </div>
        </div>
      </footer>

      {!composing && !home && (
        <nav className="kb-hide pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/90 backdrop-blur-xl lg:hidden" aria-label="เมนูหลัก">
          <ul className="mx-auto grid max-w-md grid-cols-5 items-end">
            {TABS.map(({ href, label, icon: Icon, primary }) => {
              const active = isActive(pathname, href);
              return (
                <li key={href} className="flex justify-center">
                  {primary ? (
                    <Link href={href} className="press -mt-5 flex h-14 w-14 items-center justify-center bg-cta text-on-cta" aria-label="โพสต์ใหม่">
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
