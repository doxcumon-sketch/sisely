"use client";

import { Bookmark, CheckCircle2, Flame, Heart, MapPin, MessageCircle, Pin } from "lucide-react";
import Link from "next/link";
import { Avatar, Cover, cx } from "@/components/ui";
import { RoomIcon } from "@/components/icons";
import { ReportMenu } from "@/components/report-menu";
import { ShareButton } from "@/components/share";
import { PollBlock } from "@/components/poll";
import { toast } from "@/components/toast";
import { formatAge, formatCount } from "@/lib/format";
import { ageOf, useNow } from "@/lib/hooks";
import { postTypeMeta } from "@/lib/post-types";
import { actions, useSise } from "@/lib/store";
import { trendingScore, hotLabel } from "@/lib/ranking";
import { postPhotos } from "@/lib/covers";
import type { Post, PostType } from "@/lib/types";

const TYPE_STYLE: Record<PostType, string> = {
  discussion: "bg-jade-soft text-jade",
  question: "bg-gold-soft text-[#a8204f] dark:text-gold",
  recommendation: "bg-jade-soft text-jade",
  event: "bg-laterite-soft text-laterite",
  deal: "bg-laterite-soft text-laterite",
  marketplace: "bg-gold-soft text-[#a8204f] dark:text-gold",
  story: "bg-paper-2 text-ink-2",
  poll: "bg-jade-soft text-jade",
  announcement: "bg-night text-on-night",
};

export function TypeBadge({ type }: { type: PostType }) {
  const m = postTypeMeta(type);
  return (
    <span className={cx("inline-flex items-center gap-1 rounded-sm px-2.5 py-0.5 text-xs font-semibold", TYPE_STYLE[type])}>
      <RoomIcon name={m.icon} className="h-3 w-3" /> {m.long}
    </span>
  );
}

export function PostActions({ post, detail }: { post: Post; detail?: boolean }) {
  const reaction = useSise((s) => s.reactions[post.id]);
  const saved = useSise((s) => s.saves.posts.includes(post.id));
  const counts = useSise((s) => s.overrides[post.id]);
  const reactions = counts?.reactions ?? post.stats.reactions;
  const saves = counts?.saves ?? post.stats.saves;
  const comments = counts?.comments ?? post.stats.comments;

  return (
    <div className="-mx-2 mt-3 flex items-center justify-between border-t border-line-soft pt-2">
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => actions.react(post)}
          className={cx("press flex items-center gap-1.5 rounded-sm px-3 py-2 text-sm", reaction ? "text-laterite" : "text-muted hover:bg-paper-2 hover:text-ink")}
          aria-pressed={!!reaction}
          aria-label={reaction ? "เลิกถูกใจ" : "ถูกใจ"}
        >
          <Heart key={String(!!reaction)} className={cx("h-[18px] w-[18px]", reaction && "pop fill-current")} />
          <span className="tabular-nums">{formatCount(reactions)}</span>
        </button>
        {detail ? (
          <a href="#comments" className="press flex items-center gap-1.5 rounded-sm px-3 py-2 text-sm text-muted hover:bg-paper-2 hover:text-ink" aria-label="ไปที่ความคิดเห็น">
            <MessageCircle className="h-[18px] w-[18px]" />
            <span className="tabular-nums">{formatCount(comments)}</span>
          </a>
        ) : (
          <Link href={`/post/${post.id}#comments`} className="press flex items-center gap-1.5 rounded-sm px-3 py-2 text-sm text-muted hover:bg-paper-2 hover:text-ink" aria-label={`ความคิดเห็น ${comments}`}>
            <MessageCircle className="h-[18px] w-[18px]" />
            <span className="tabular-nums">{formatCount(comments)}</span>
          </Link>
        )}
        <ShareButton path={`/post/${post.id}`} title={post.title} />
      </div>
      <button
        type="button"
        onClick={async () => {
          const now = await actions.save("posts", post.id, post);
          if (now !== saved) toast(now ? "บันทึกไว้ในโปรไฟล์แล้ว" : "เลิกบันทึกแล้ว");
        }}
        className={cx("press flex items-center gap-1.5 rounded-sm px-3 py-2 text-sm", saved ? "text-gold" : "text-muted hover:bg-paper-2 hover:text-ink")}
        aria-pressed={saved}
        aria-label={saved ? "เลิกบันทึก" : "บันทึก"}
      >
        <Bookmark className={cx("h-[18px] w-[18px]", saved && "pop fill-current")} />
        <span className="tabular-nums">{formatCount(saves)}</span>
      </button>
    </div>
  );
}

export function PostCard({ post, showRoom = true, index = 0 }: { post: Post; showRoom?: boolean; index?: number }) {
  const now = useNow();
  const blocked = useSise((s) => s.blocked);
  const muted = useSise((s) => s.muted);
  const author = post.author;
  const room = post.room;
  const age = ageOf(post, now);
  const name = author.name;
  const place = post.placeRef;
  const event = post.eventRef;
  const hot = hotLabel(trendingScore(post, age));

  if (blocked.includes(post.authorId) || muted.includes(post.authorId)) return null;

  return (
    <article className="surface rise p-4 sm:p-5" style={{ animationDelay: `${Math.min(index, 6) * 45}ms` }}>
      <header className="flex items-start gap-3">
        <Link href={`/u/${author.handle}`} aria-label={`โปรไฟล์ ${name}`}>
          <Avatar name={name} tone={author.tone} size={40} src={author.pictureUrl} />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm">
            <Link href={`/u/${author.handle}`} className="font-semibold hover:underline">{name}</Link>
            {author.badge === "moderator" && <span className="rounded bg-night px-1.5 py-px text-[10px] font-bold text-on-night">MOD</span>}
            {author.badge === "local-guide" && <span className="rounded bg-gold-soft px-1.5 py-px text-[10px] font-bold text-[#a8204f] dark:text-gold">Local Guide</span>}
            {author.badge === "business" && <span className="rounded bg-jade-soft px-1.5 py-px text-[10px] font-bold text-jade">ธุรกิจ</span>}
            {author.badge === "founder" && <span className="rounded bg-night px-1.5 py-px text-[10px] font-bold text-gold">SISE</span>}
          </div>
          <p className="flex flex-wrap items-center gap-x-1.5 text-xs text-muted">
            {showRoom && (
              <>
                <Link href={`/rooms/${room.slug}`} className="inline-flex items-center gap-1 font-medium text-ink-2 hover:text-gold">
                  <RoomIcon name={room.icon} className="h-3 w-3" /> {room.name}
                </Link>
                <span aria-hidden="true">·</span>
              </>
            )}
            <time suppressHydrationWarning>{formatAge(age)}</time>
          </p>
        </div>
        <div className="flex items-center gap-1">
          {hot && (
            <span className={cx("hidden items-center gap-1 rounded-sm px-2 py-0.5 text-xs font-semibold sm:inline-flex", hot === "hot" ? "bg-laterite-soft text-laterite" : "bg-gold-soft text-[#a8204f] dark:text-gold")}>
              <Flame className="h-3 w-3" /> {hot === "hot" ? "กำลังร้อน" : "คนคุยกัน"}
            </span>
          )}
          {post.pinned && <Pin className="h-4 w-4 text-gold" aria-label="ปักหมุด" />}
          <ReportMenu targetType="post" targetId={post.id} authorId={post.authorId} authorName={name} />
        </div>
      </header>

      <div className="mt-3">
        <div className="mb-1.5 flex flex-wrap items-center gap-2">
          <TypeBadge type={post.type} />
          {post.solved && (
            <span className="inline-flex items-center gap-1 rounded-sm bg-jade-soft px-2.5 py-0.5 text-xs font-semibold text-jade">
              <CheckCircle2 className="h-3 w-3" /> ได้คำตอบแล้ว
            </span>
          )}
        </div>
        <Link href={`/post/${post.id}`} className="group block">
          <h3 className="font-editorial text-[1.15rem] font-semibold leading-snug text-ink group-hover:text-gold sm:text-xl">{post.title}</h3>
          <p className="mt-1.5 line-clamp-3 text-[0.95rem] leading-relaxed text-ink-2">{post.body}</p>
        </Link>

        {post.photos && post.photos.length > 0 && (
          <Link href={`/post/${post.id}`} className={cx("mt-3 grid gap-1.5 overflow-hidden rounded-2xl", post.photos.length > 1 ? "grid-cols-2" : "grid-cols-1")} aria-label="ดูรูปภาพ">
            {post.photos.slice(0, 2).map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={src} alt={`รูปจากโพสต์ ${post.title}`} loading="lazy" className={cx("w-full object-cover", post.photos!.length > 1 ? "aspect-[4/3]" : "aspect-[16/9]")} />
            ))}
          </Link>
        )}

        {!post.photos?.length && post.images && post.images.length > 0 && (
          <Link href={`/post/${post.id}`} className={cx("mt-3 grid gap-1.5 overflow-hidden rounded-2xl", post.images.length > 1 ? "grid-cols-2" : "grid-cols-1")} aria-label="ดูรูปภาพ">
            {post.images.slice(0, 2).map((tone, i) => (
              <Cover key={i} tone={tone} icon={room.icon} photo={postPhotos(room.slug, post.id, post.images!.length)[i]} className={cx("w-full", post.images!.length > 1 ? "aspect-[4/3]" : "aspect-[16/7]")} />
            ))}
          </Link>
        )}

        {post.poll && <div className="mt-3"><PollBlock post={post} compact /></div>}

        {(place || event || post.location) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {place && (
              <Link href={`/places/${place.slug}`} className="press inline-flex items-center gap-1.5 rounded-sm border border-line bg-paper px-3 py-1.5 text-sm hover:border-gold">
                <MapPin className="h-3.5 w-3.5 text-laterite" /> {place.name}
              </Link>
            )}
            {event && (
              <Link href={`/events/${event.slug}`} className="press inline-flex items-center gap-1.5 rounded-sm border border-line bg-paper px-3 py-1.5 text-sm hover:border-gold">
                <RoomIcon name="ticket" className="h-3.5 w-3.5 text-gold" /> {event.title}
              </Link>
            )}
            {!place && post.location && (
              <span className="inline-flex items-center gap-1.5 rounded-sm border border-line px-3 py-1.5 text-sm text-muted"><MapPin className="h-3.5 w-3.5" /> {post.location}</span>
            )}
          </div>
        )}
      </div>

      <PostActions post={post} />
    </article>
  );
}
