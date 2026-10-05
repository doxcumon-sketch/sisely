import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Cover } from "@/components/ui";
import type { CoverPhoto } from "@/lib/covers";
import type { Tone } from "@/lib/types";

export interface Highlight {
  kind: string;
  title: string;
  meta: string;
  href: string;
  tone: Tone;
  photo?: CoverPhoto;
}

/** "Spotlight": tall poster cards for what is worth knowing today. Everything shown comes from real events, deals and places. */
export function Highlights({ items }: { items: Highlight[] }) {
  if (!items.length) return null;
  return (
    <section data-reveal aria-labelledby="spot-h">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="eyebrow mb-1">Spotlight</p>
          <h2 id="spot-h" className="font-editorial text-2xl font-semibold tracking-tight sm:text-3xl">วันนี้ห้ามพลาด</h2>
        </div>
      </div>
      <div className="scrollbar-none -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
        {items.map((h, i) => (
          <Link
            key={h.href + i}
            href={h.href}
            className="press group relative isolate flex aspect-[4/5] w-[72%] shrink-0 snap-start flex-col justify-between overflow-hidden border border-line p-4 text-white sm:w-auto"
          >
            <div className="absolute inset-0 -z-10"><Cover tone={h.tone} photo={h.photo} className="h-full w-full" /></div>
            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <span className="w-fit border border-white/30 bg-white/10 px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.16em] backdrop-blur-md">{h.kind}</span>
            <div>
              <p className="font-editorial text-xl font-semibold leading-snug tracking-tight sm:text-[1.35rem]">{h.title}</p>
              <p className="mt-1.5 flex items-center justify-between gap-3 text-sm text-white/80">
                <span className="line-clamp-1">{h.meta}</span>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-white text-night transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"><ArrowUpRight className="h-4 w-4" /></span>
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
