import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Cover } from "@/components/ui";
import { guides } from "@/lib/data";

export const metadata: Metadata = {
  title: "ไกด์เมืองศรีสะเกษ — เที่ยวศรีสะเกษ ร้านอาหาร คาเฟ่",
  description: "ไกด์ศรีสะเกษจากคนพื้นที่ เที่ยวศรีสะเกษ 1 วัน คาเฟ่นั่งทำงาน ผามออีแดง และอีกมากมาย",
  alternates: { canonical: "/guide" },
};

export default function GuideIndex() {
  return (
    <div className="space-y-6">
      <header><p className="eyebrow mb-1">City Guide</p><h1 className="font-editorial text-3xl font-bold sm:text-4xl">ไกด์เมืองศรีสะเกษ</h1><p className="mt-2 max-w-xl text-muted">เขียนจากประสบการณ์คนในพื้นที่ อัปเดตตามที่ชุมชนพูดถึงจริง</p></header>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {guides.map((g) => (
          <Link key={g.slug} href={`/guide/${g.slug}`} className="surface press group overflow-hidden">
            <Cover tone={g.tone} icon="map" className="h-36" />
            <div className="p-5"><p className="eyebrow mb-1">{g.kicker}</p><h2 className="font-editorial text-xl font-semibold leading-snug group-hover:text-gold">{g.title}</h2><p className="mt-2 text-sm text-muted">{g.summary}</p><p className="mt-3 inline-flex items-center gap-1 text-xs text-muted"><BookOpen className="h-3.5 w-3.5" /> อ่าน {g.readMin} นาที</p></div>
          </Link>
        ))}
      </div>
    </div>
  );
}
