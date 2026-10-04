import type { ReactNode } from "react";

export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || "";
export const LEGAL_UPDATED = "4 ตุลาคม 2569";

export function Contact() {
  return CONTACT_EMAIL ? (
    <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-gold underline">{CONTACT_EMAIL}</a>
  ) : (
    <span>ผู้ดูแล SISE (ติดต่อผ่านปุ่ม &ldquo;รายงาน&rdquo; ในเว็บ หรือแอดมินในห้องคุย)</span>
  );
}

export function LegalPage({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <article className="mx-auto max-w-2xl space-y-6 leading-relaxed text-ink-2 [&_h2]:font-editorial [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-ink [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-1.5">
      <header>
        <p className="eyebrow mb-2">{eyebrow}</p>
        <h1 className="font-editorial text-4xl font-semibold tracking-tight text-ink">{title}</h1>
        <p className="mt-2 text-sm text-muted">อัปเดตล่าสุด {LEGAL_UPDATED}</p>
      </header>
      {children}
    </article>
  );
}
