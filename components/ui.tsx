import Link from "next/link";
import type { ReactNode } from "react";
import type { Tone } from "@/lib/types";
import { RoomIcon } from "@/components/icons";

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function Cover({
  tone,
  icon,
  className,
  children,
}: {
  tone: Tone;
  icon?: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={cx("cover", `tone-${tone}`, className)} aria-hidden={children ? undefined : "true"}>
      {icon && (
        <RoomIcon name={icon} className="pointer-events-none absolute -right-3 -bottom-4 h-24 w-24 text-white/20" />
      )}
      {children}
    </div>
  );
}

const AVATAR_TONES: Record<Tone, string> = {
  jade: "bg-[#1d4a40] text-[#e1ede7]",
  laterite: "bg-[#a4472b] text-[#f6e2da]",
  gold: "bg-[#b88c34] text-[#fffdf8]",
  indigo: "bg-[#1e2a4a] text-[#e8c98a]",
  plum: "bg-[#6d3a5f] text-[#f0c8b0]",
  sky: "bg-[#2c6f86] text-[#fbe7b8]",
  ink: "bg-[#16201c] text-[#d8ae56]",
};

export function Avatar({ name, tone, size = 36, src }: { name: string; tone: Tone; size?: number; src?: string | null }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" width={size} height={size} loading="lazy" referrerPolicy="no-referrer" className="shrink-0 rounded-full object-cover" style={{ width: size, height: size }} />;
  }
  const initial = Array.from(name.replace(/^(คุณ|ทีม|พี่|ป้า|ลุง|หมอ)\s*/, ""))[0] ?? "S";
  return (
    <span
      className={cx("inline-flex shrink-0 items-center justify-center rounded-full font-semibold", AVATAR_TONES[tone])}
      style={{ width: size, height: size, fontSize: size * 0.42 }}
      aria-hidden="true"
    >
      {initial}
    </span>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  href,
  hrefLabel = "ดูทั้งหมด",
  live,
}: {
  eyebrow?: string;
  title: string;
  href?: string;
  hrefLabel?: string;
  live?: boolean;
}) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div>
        {eyebrow && (
          <p className="eyebrow mb-0.5 flex items-center gap-1.5">
            {live && <span className="live-dot inline-block h-1.5 w-1.5 rounded-full bg-laterite" />}
            {eyebrow}
          </p>
        )}
        <h2 className="font-editorial text-xl font-semibold leading-tight text-ink">{title}</h2>
      </div>
      {href && (
        <Link href={href} className="shrink-0 text-sm font-medium text-gold hover:underline">
          {hrefLabel} →
        </Link>
      )}
    </div>
  );
}

export function Chip({ children, active, onClick, href, tone = "neutral" }: {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
  href?: string;
  tone?: "neutral" | "gold" | "jade" | "laterite";
}) {
  const cls = cx(
    "press inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium whitespace-nowrap",
    active
      ? "border-night bg-night text-on-night"
      : tone === "gold"
        ? "border-gold/40 bg-gold-soft text-ink"
        : tone === "jade"
          ? "border-jade/20 bg-jade-soft text-jade"
          : tone === "laterite"
            ? "border-laterite/20 bg-laterite-soft text-laterite"
            : "border-line bg-card text-ink-2 hover:border-gold/50",
  );
  if (href) return <Link href={href} className={cls}>{children}</Link>;
  return <button type="button" onClick={onClick} className={cls} aria-pressed={active}>{children}</button>;
}

export function EmptyState({ icon = "chat", title, hint, action }: { icon?: string; title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="surface-flat flex flex-col items-center px-6 py-12 text-center">
      <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gold-soft text-gold">
        <RoomIcon name={icon} className="h-6 w-6" />
      </span>
      <p className="font-editorial text-lg font-semibold">{title}</p>
      {hint && <p className="mt-1 max-w-sm text-sm text-muted">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cx("skeleton", className)} aria-hidden="true" />;
}

export function PostSkeleton() {
  return (
    <div className="surface p-4" role="status" aria-label="กำลังโหลด">
      <div className="mb-3 flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-full" />
        <Skeleton className="h-4 w-40" />
      </div>
      <Skeleton className="mb-2 h-5 w-4/5" />
      <Skeleton className="mb-1 h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

export function StatPill({ icon, children }: { icon?: ReactNode; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted">
      {icon}
      {children}
    </span>
  );
}
