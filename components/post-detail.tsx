"use client";

import { ArrowLeft, Award, CornerDownRight, Eye, Heart, MapPin, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { DealCard, EventCard, ListingCard, PlaceCard } from "@/components/cards";
import { EmptyState, Avatar, Cover, SectionHeader, cx } from "@/components/ui";
import { PollBlock } from "@/components/poll";
import { PostActions, PostCard, TypeBadge } from "@/components/post-card";
import { ReportMenu } from "@/components/report-menu";
import { RoomIcon } from "@/components/icons";
import { toast } from "@/components/toast";
import { deals, eventBySlug, listingById, placeBySlug, roomBySlug, userById } from "@/lib/data";
import { formatAge, formatCount } from "@/lib/format";
import { ageOf, useComments, useNow, usePost } from "@/lib/hooks";
import { checkComment } from "@/lib/moderation";
import { actions, getSise, useSise } from "@/lib/store";
import { usePostList } from "@/components/feed";
import type { Comment } from "@/lib/types";

function CommentBox({ postId, parentId, onDone, autoFocus, placeholder = "เขียนความเห็น…" }: { postId: string; parentId?: string; onDone?: () => void; autoFocus?: boolean; placeholder?: string }) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const myName = useSise((s) => s.profile.name);

  const send = () => {
    const body = text.trim();
    if (!body) return;
    const st = getSise();
    const verdict = checkComment(body, st.userComments.map((c) => c.createdAt ?? 0), Date.now());
    if (!verdict.ok) return setError(verdict.reason);
    actions.addComment({ postId, parentId, body });
    setText("");
    setError(null);
    toast("ส่งความเห็นแล้ว");
    onDone?.();
  };

  return (
    <div className="flex gap-3">
      <Avatar name={myName} tone="gold" size={36} />
      <div className="min-w-0 flex-1">
        <label className="sr-only" htmlFor={`cb-${parentId ?? "root"}`}>ความเห็น</label>
        <textarea
          id={`cb-${parentId ?? "root"}`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          autoFocus={autoFocus}
          rows={parentId ? 2 : 3}
          maxLength={1500}
          placeholder={placeholder}
          className="w-full resize-y rounded-2xl border border-line bg-paper px-4 py-3 text-[1rem] leading-relaxed outline-none placeholder:text-faint focus:border-gold"
        />
        {error && <p role="alert" className="mt-1 text-sm text-laterite">{error}</p>}
        <div className="mt-2 flex justify-end gap-2">
          {onDone && <button type="button" onClick={onDone} className="press rounded-full px-4 py-2 text-sm text-muted hover:bg-paper-2">ยกเลิก</button>}
          <button type="button" onClick={send} disabled={!text.trim()} className="press rounded-full bg-night px-5 py-2 text-sm font-semibold text-on-night disabled:opacity-40">ส่ง</button>
        </div>
      </div>
    </div>
  );
}

function CommentItem({ c, replies, now, postId, depth = 0 }: { c: Comment; replies: Comment[]; now: number; postId: string; depth?: number }) {
  const [replying, setReplying] = useState(false);
  const liked = useSise((s) => s.commentLikes.includes(c.id));
  const myName = useSise((s) => s.profile.name);
  const author = userById(c.authorId);
  const name = c.authorId === "u-me" ? myName : (author?.name ?? "สมาชิก SISE");
  const blocked = useSise((s) => s.blocked);
  if (blocked.includes(c.authorId)) return null;

  return (
    <li className={cx(depth > 0 && "ml-6 border-l border-line-soft pl-4 sm:ml-10")}>
      <div className={cx("flex gap-3 rounded-2xl p-3", c.best && "bg-jade-soft/70 ring-1 ring-jade/20")}>
        <Avatar name={name} tone={author?.tone ?? "gold"} size={depth ? 30 : 36} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 text-sm">
            <Link href={c.authorId === "u-me" ? "/me" : `/u/${author?.handle ?? ""}`} className="font-semibold hover:underline">{name}</Link>
            {author?.badge === "local-guide" && <span className="rounded bg-gold-soft px-1.5 py-px text-[10px] font-bold text-[#7a5a14] dark:text-gold">Local Guide</span>}
            {author?.badge === "moderator" && <span className="rounded bg-night px-1.5 py-px text-[10px] font-bold text-on-night">MOD</span>}
            {c.best && <span className="inline-flex items-center gap-1 text-xs font-semibold text-jade"><Award className="h-3.5 w-3.5" /> คำตอบที่เป็นประโยชน์</span>}
            <time className="text-xs text-muted" suppressHydrationWarning>{formatAge(ageOf(c, now))}</time>
          </div>
          <p className="mt-1 whitespace-pre-line text-[0.98rem] leading-relaxed text-ink-2">{c.body}</p>
          <div className="-ml-2 mt-1 flex items-center">
            <button type="button" onClick={() => actions.likeComment(c.id)} aria-pressed={liked} className={cx("press flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm", liked ? "text-laterite" : "text-muted hover:bg-paper-2")}>
              <Heart className={cx("h-4 w-4", liked && "fill-current")} /> <span className="tabular-nums">{c.likes + (liked ? 1 : 0)}</span>
            </button>
            {depth === 0 && (
              <button type="button" onClick={() => setReplying((r) => !r)} className="press flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm text-muted hover:bg-paper-2">
                <CornerDownRight className="h-4 w-4" /> ตอบกลับ
              </button>
            )}
            {c.authorId === "u-me" ? (
              <button type="button" onClick={() => { actions.deleteComment(c.id); toast("ลบความเห็นแล้ว"); }} className="press rounded-full p-2 text-faint hover:bg-paper-2 hover:text-laterite" aria-label="ลบความเห็น"><Trash2 className="h-4 w-4" /></button>
            ) : (
              <ReportMenu targetType="comment" targetId={c.id} authorId={c.authorId} authorName={name} />
            )}
          </div>
        </div>
      </div>
      {replying && <div className="ml-6 mt-1 sm:ml-12"><CommentBox postId={postId} parentId={c.id} autoFocus onDone={() => setReplying(false)} placeholder={`ตอบกลับ ${name}…`} /></div>}
      {replies.length > 0 && (
        <ul className="mt-1 space-y-1">
          {replies.map((r) => <CommentItem key={r.id} c={r} replies={[]} now={now} postId={postId} depth={1} />)}
        </ul>
      )}
    </li>
  );
}

function Comments({ postId }: { postId: string }) {
  const comments = useComments(postId);
  const now = useNow();
  const [sort, setSort] = useState<"top" | "new">("top");

  const { roots, byParent } = useMemo(() => {
    const map = new Map<string, Comment[]>();
    for (const c of comments) if (c.parentId) map.set(c.parentId, [...(map.get(c.parentId) ?? []), c]);
    const rootsAll = comments.filter((c) => !c.parentId);
    const age = (c: Comment) => ageOf(c, now);
    rootsAll.sort(sort === "top" ? (a, b) => Number(!!b.best) - Number(!!a.best) || b.likes - a.likes : (a, b) => age(a) - age(b));
    return { roots: rootsAll, byParent: map };
  }, [comments, now, sort]);

  return (
    <section id="comments" className="scroll-mt-20" aria-label="ความคิดเห็น">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-editorial text-xl font-semibold">ความคิดเห็น <span className="text-muted">({comments.length})</span></h2>
        {roots.length > 1 && (
          <div className="flex rounded-full border border-line p-0.5 text-sm" role="group" aria-label="เรียงความเห็น">
            {(["top", "new"] as const).map((k) => (
              <button key={k} type="button" aria-pressed={sort === k} onClick={() => setSort(k)} className={cx("rounded-full px-3 py-1", sort === k ? "bg-night text-on-night" : "text-muted")}>{k === "top" ? "ยอดนิยม" : "ใหม่"}</button>
            ))}
          </div>
        )}
      </div>
      <div className="surface mb-3 p-4"><CommentBox postId={postId} /></div>
      {roots.length === 0 ? (
        <EmptyState icon="chat" title="ยังไม่มีความคิดเห็น" hint="เป็นคนแรกที่ตอบได้เลย" />
      ) : (
        <ul className="space-y-1">
          {roots.map((c) => <CommentItem key={c.id} c={c} replies={(byParent.get(c.id) ?? []).sort((a, b) => ageOf(b, now) - ageOf(a, now))} now={now} postId={postId} />)}
        </ul>
      )}
    </section>
  );
}

function Related({ postId, roomSlug }: { postId: string; roomSlug: string }) {
  const list = usePostList({ mode: "hot", roomSlug }).filter((p) => p.id !== postId).slice(0, 3);
  if (!list.length) return null;
  return (
    <section>
      <SectionHeader title="โพสต์ที่เกี่ยวข้อง" href={`/rooms/${roomSlug}`} hrefLabel="ดูห้อง" />
      <div className="space-y-4">{list.map((p) => <PostCard key={p.id} post={p} showRoom={false} />)}</div>
    </section>
  );
}

export function PostDetail({ id }: { id: string }) {
  const router = useRouter();
  const post = usePost(id);
  const now = useNow();
  const myName = useSise((s) => s.profile.name);

  useEffect(() => {
    if (post) actions.viewTopic(post.roomSlug);
  }, [post]);

  if (!post) {
    return (
      <div className="mx-auto max-w-xl pt-10">
        <EmptyState icon="chat" title="ไม่พบโพสต์นี้" hint="โพสต์ของคุณเก็บไว้ในเบราว์เซอร์นี้เท่านั้นในเวอร์ชันทดลอง อาจถูกลบหรือเปิดจากอุปกรณ์อื่น" action={<Link href="/" className="press rounded-full bg-night px-5 py-2.5 font-semibold text-on-night">กลับหน้าแรก</Link>} />
      </div>
    );
  }

  const author = userById(post.authorId);
  const name = post.authorId === "u-me" ? myName : (author?.name ?? "สมาชิก SISE");
  const room = roomBySlug(post.roomSlug);
  const place = post.placeSlug ? placeBySlug(post.placeSlug) : undefined;
  const event = post.eventSlug ? eventBySlug(post.eventSlug) : undefined;
  const deal = post.dealId ? deals.find((d) => d.id === post.dealId) : undefined;
  const listing = post.listingId ? listingById(post.listingId) : undefined;
  const seller = listing ? userById(listing.sellerId) : undefined;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <button type="button" onClick={() => (window.history.length > 1 ? router.back() : router.push("/"))} className="press -ml-2 mb-3 inline-flex items-center gap-1.5 rounded-full px-2 py-1.5 text-sm text-muted hover:bg-paper-2">
          <ArrowLeft className="h-4 w-4" /> กลับ
        </button>

        <article className="surface p-5 sm:p-7">
          <header className="flex items-start gap-3">
            <Link href={post.authorId === "u-me" ? "/me" : `/u/${author?.handle}`}><Avatar name={name} tone={author?.tone ?? "gold"} size={44} /></Link>
            <div className="min-w-0 flex-1">
              <Link href={post.authorId === "u-me" ? "/me" : `/u/${author?.handle}`} className="font-semibold hover:underline">{name}</Link>
              <p className="flex flex-wrap items-center gap-x-1.5 text-xs text-muted">
                {room && <Link href={`/rooms/${room.slug}`} className="inline-flex items-center gap-1 font-medium text-ink-2 hover:text-gold"><RoomIcon name={room.icon} className="h-3 w-3" /> {room.name}</Link>}
                <span aria-hidden="true">·</span>
                <time suppressHydrationWarning>{formatAge(ageOf(post, now))}</time>
              </p>
            </div>
            {post.authorId === "u-me" ? (
              <button type="button" onClick={() => { actions.deletePost(post.id); toast("ลบโพสต์แล้ว"); router.push("/me"); }} className="press rounded-full p-2 text-faint hover:bg-paper-2 hover:text-laterite" aria-label="ลบโพสต์"><Trash2 className="h-5 w-5" /></button>
            ) : (
              <ReportMenu targetType="post" targetId={post.id} authorId={post.authorId} authorName={name} />
            )}
          </header>

          <div className="mt-4"><TypeBadge type={post.type} /></div>
          <h1 className="font-editorial mt-2 text-[1.6rem] font-bold leading-snug sm:text-3xl">{post.title}</h1>
          {post.body && <p className="mt-3 whitespace-pre-line text-[1.02rem] leading-[1.85] text-ink-2">{post.body}</p>}

          {post.photos && post.photos.length > 0 && (
            <div className={cx("mt-4 grid gap-2 overflow-hidden rounded-2xl", post.photos.length > 1 && "sm:grid-cols-2")}>
              {post.photos.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={src} alt={`รูปที่ ${i + 1} จากโพสต์`} className="w-full object-cover" />
              ))}
            </div>
          )}
          {!post.photos?.length && post.images && post.images.length > 0 && (
            <div className={cx("mt-4 grid gap-2 overflow-hidden rounded-2xl", post.images.length > 1 && "sm:grid-cols-2")}>
              {post.images.map((tone, i) => <Cover key={i} tone={tone} icon={room?.icon} className="aspect-[16/10] w-full" />)}
            </div>
          )}

          {post.poll && <div className="mt-4"><PollBlock post={post} /></div>}
          {post.location && !place && <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-muted"><MapPin className="h-4 w-4" /> {post.location}</p>}

          <p className="mt-4 flex items-center gap-4 text-xs text-muted">
            <span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {formatCount(post.stats.views)} อ่าน</span>
            <span>{formatCount(post.stats.shares)} แชร์</span>
          </p>
          <PostActions post={post} detail />
        </article>
      </div>

      {(place || event || deal || listing) && (
        <section aria-label="ที่เกี่ยวข้อง" className="grid gap-4 sm:grid-cols-2">
          {place && <PlaceCard place={place} />}
          {event && <EventCard event={event} />}
          {deal && <DealCard deal={deal} />}
          {listing && <ListingCard listing={listing} sellerName={seller?.name ?? "ผู้ขาย"} />}
        </section>
      )}

      <Comments postId={post.id} />
      <Related postId={post.id} roomSlug={post.roomSlug} />
    </div>
  );
}
