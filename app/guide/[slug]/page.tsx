import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PlaceCard } from "@/components/cards";
import { ShareButton } from "@/components/share";
import { Cover } from "@/components/ui";
import { guideBySlug } from "@/lib/data";
import { listPlaces } from "@/lib/server/repo";
import { SITE_URL } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const g = guideBySlug(slug);
  if (!g) return {};
  return { title: g.title, description: g.summary, keywords: g.seoKeywords, alternates: { canonical: `/guide/${g.slug}` }, openGraph: { type: "article", title: g.title, description: g.summary } };
}

export const revalidate = 300;

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const g = guideBySlug(slug);
  if (!g) notFound();
  const allPlaces = await listPlaces();
  const jsonLd = { "@context": "https://schema.org", "@type": "Article", headline: g.title, description: g.summary, inLanguage: "th", mainEntityOfPage: `${SITE_URL}/guide/${g.slug}`, publisher: { "@type": "Organization", name: "SISE" } };

  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <nav aria-label="breadcrumb" className="text-sm text-muted"><Link href="/guide" className="hover:text-ink">ไกด์</Link> / <span className="text-ink">{g.kicker}</span></nav>
      <header>
        <Cover tone={g.tone} icon="map" className="mb-6 h-44 rounded-3xl sm:h-64" />
        <p className="eyebrow mb-2">{g.kicker} · อ่าน {g.readMin} นาที</p>
        <h1 className="font-editorial text-3xl font-bold leading-tight sm:text-4xl">{g.title}</h1>
        <p className="mt-3 text-lg leading-relaxed text-muted">{g.summary}</p>
        <div className="mt-4"><ShareButton path={`/guide/${g.slug}`} title={g.title} className="press inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2.5 font-semibold hover:border-gold" label="แชร์ไกด์นี้" /></div>
      </header>
      {g.sections.map((s, i) => (
        <section key={i}>
          <h2 className="font-editorial mb-2 flex items-baseline gap-3 text-2xl font-semibold"><span className="text-gold-gradient text-3xl" style={{ fontFamily: "var(--font-display-latin), serif" }}>{String(i + 1).padStart(2, "0")}</span>{s.heading}</h2>
          <p className="text-[1.05rem] leading-[1.9] text-ink-2">{s.body}</p>
          {s.placeSlugs && <div className="mt-4 grid gap-4 sm:grid-cols-2">{s.placeSlugs.map((ps) => allPlaces.find((p) => p.slug === ps)).filter(Boolean).map((p) => <PlaceCard key={p!.id} place={p!} />)}</div>}
        </section>
      ))}
      <p className="rounded-2xl border border-dashed border-line p-4 text-sm text-muted">ไกด์นี้เป็นข้อมูลตัวอย่างสำหรับเวอร์ชันทดลอง ตรวจสอบเวลาเปิด-ปิดและราคาก่อนเดินทางทุกครั้ง</p>
    </article>
  );
}
