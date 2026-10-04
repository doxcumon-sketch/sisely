import type { Metadata } from "next";
import { COVER_PHOTOS } from "@/lib/covers";

export const metadata: Metadata = { title: "เครดิตภาพ", description: "ที่มาและสัญญาอนุญาตของภาพปกบน SISE" };

export default function CreditsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <p className="eyebrow mb-1">Credits</p>
        <h1 className="font-editorial text-3xl font-bold">เครดิตภาพ</h1>
        <p className="mt-2 text-muted">ขอบคุณช่างภาพและผู้เผยแพร่ภาพที่ทำให้ SISE มีหน้าตาของศรีสะเกษจริง ๆ</p>
      </header>
      {COVER_PHOTOS.length === 0 ? (
        <p className="surface-flat p-6 text-muted">ขณะนี้ภาพปกเป็นภาพประกอบต้นฉบับของ SISE</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {COVER_PHOTOS.map((p) => (
            <li key={p.src} className="surface overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.src} alt={p.alt} loading="lazy" className="aspect-[16/9] w-full object-cover" />
              <div className="p-4 text-sm">
                <p className="font-semibold">{p.alt}</p>
                <p className="text-muted">ภาพโดย {p.author} · {p.license}</p>
                {p.sourceUrl && <a href={p.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">ที่มาของภาพ →</a>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
