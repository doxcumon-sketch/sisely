import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PenLine, Users } from "lucide-react";
import { FollowButton } from "@/components/buttons";
import { RoomIcon } from "@/components/icons";
import { RoomFeed } from "@/components/room-feed";
import { Cover, SectionHeader } from "@/components/ui";
import { RoomCard } from "@/components/cards";
import { getRoom, listRooms, queryPosts } from "@/lib/server/repo";
import { formatCount } from "@/lib/format";
import { roomPhoto } from "@/lib/covers";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const room = await getRoom(slug);
  if (!room) return {};
  return {
    title: `${room.name} — ${room.tagline}`,
    description: `${room.description} เข้าร่วม ${formatCount(room.members)} สมาชิกในห้อง${room.name} บน SISE ศรีสะเกษ`,
    alternates: { canonical: `/rooms/${room.slug}` },
    openGraph: { title: `${room.name} · SISE`, description: room.description },
  };
}

export default async function RoomPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const room = await getRoom(slug);
  if (!room) notFound();
  const [rooms, initial] = await Promise.all([listRooms(), queryPosts({ mode: "hot", roomSlug: room.slug, limit: 8 })]);
  const related = rooms.filter((r) => r.group === room.group && r.id !== room.id).slice(0, 3);

  return (
    <div className="space-y-6">
      <nav aria-label="breadcrumb" className="text-sm text-muted">
        <Link href="/rooms" className="hover:text-ink">ห้อง</Link> <span aria-hidden="true">/</span> <span className="text-ink">{room.name}</span>
      </nav>

      <header className="surface overflow-hidden">
        <Cover tone={room.tone} icon={room.icon} photo={roomPhoto(room.slug)} className="h-36 sm:h-56" />
        <div className="relative px-5 pb-5">
          <span className="-mt-9 mb-3 flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-2xl border-4 border-card bg-night text-gold shadow-lg">
            <RoomIcon name={room.icon} className="h-8 w-8" />
          </span>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="font-editorial text-2xl font-bold sm:text-3xl">{room.name}</h1>
              <p className="mt-1 max-w-2xl text-muted">{room.description}</p>
              <p className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-ink-2">
                <span className="inline-flex items-center gap-1.5"><Users className="h-4 w-4 text-gold" /> <b>{formatCount(room.members)}</b> สมาชิก</span>
                <span><b>{formatCount(room.posts)}</b> โพสต์</span>
                {room.trending && <span className="rounded-sm bg-laterite-soft px-2.5 py-0.5 text-xs font-semibold text-laterite">กำลังคึกคัก</span>}
              </p>
            </div>
            <div className="flex gap-2">
              <FollowButton kind="rooms" id={room.slug} label="ติดตามห้อง" />
              <Link href={`/create?room=${room.slug}`} className="press inline-flex items-center gap-2 rounded-sm border border-line bg-card px-5 py-2.5 font-semibold hover:border-gold">
                <PenLine className="h-4 w-4" /> โพสต์
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <RoomFeed roomSlug={room.slug} initial={initial} />
        <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
          <section className="surface p-5">
            <h2 className="font-editorial mb-2 text-lg font-semibold">กฎของห้อง</h2>
            <ol className="list-decimal space-y-1.5 pl-5 text-sm text-ink-2">
              <li>สุภาพ ให้เกียรติกัน ไม่ด่าทอ</li>
              <li>ไม่โพสต์ซ้ำ ไม่ยิงโฆษณาใส่ความเห็น</li>
              <li>ข่าวที่ยังไม่ยืนยัน โปรดระบุว่ายังไม่ยืนยัน</li>
              <li>ซื้อขายให้นัดรับในที่สาธารณะ ไม่โอนก่อนเห็นของ</li>
            </ol>
          </section>
          {related.length > 0 && (
            <section>
              <SectionHeader title="ห้องที่คล้ายกัน" />
              <div className="space-y-3">{related.map((r) => <RoomCard key={r.id} room={r} compact />)}</div>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
