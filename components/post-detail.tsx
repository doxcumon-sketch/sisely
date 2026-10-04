"use client";

import { ArrowLeft, Award, CornerDownRight, Eye, Heart, MapPin, ShieldAlert, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { DealCard, EventCard, ListingCard, PlaceCard } from "@/components/cards";
import { Avatar, Cover, EmptyState, SectionHeader, cx } from "@/components/ui";
import { PollBlock } from "@/components/poll";
import { PostActions, PostCard, TypeBadge } from "@/components/post-card";
import { ReportMenu } from "@/components/report-menu";
import { RoomIcon } from "@/components/icons";
import { toast } from "@/components/toast";
import { formatAge, formatCount } from "@/lib/format";
import { ageOf, useNow } from "@/lib/hooks";
import { api, actions, requireLogin, syncPosts, useSise } from "@/lib/store";
import type { Comment, Deal, Listing, Place, Post, SiseEvent } from "@/lib/types";

function CommentBox({ postId, parentId, onPosted, onCancel, autoFocus, placeholder = "เขียนความเห็น…" }: { postId: string; parentId?: string; onPosted: (c: Comment) => void; onCancel?: () => void; autoFocus?: boolean; placeholder?: string }) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const me = useSise((s) => s.me);

  const send = async () => {
    const body = text.trim();
    if (!body || busy) return;
    if (!requireLogin()) return;
    setBusy(true);
    setError(null);
    const r = await api<Comment>(`/api/posts/${postId}/comments`, "POST", { body, parentId });
    setBusy(false);
    if (!r.ok) return setError(r.error);
    setText("");
    toast("ส่งความเห็นแล้ว");
    onPosted(r.data);
  };

  return (
    <div className="flex gap-3">
      <Avatar name={me?.name ?? "คุณ"} tone="gold" size={36} src={me?.pictureUrl} />
      <div className="min-w-0 flex-1">
        <label className="sr-only" htmlFor={`cb-${parentId ?? "root"}`}>ความเห็น</label>
        <textarea
          id={`cb-${parentId ?? "root"}`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => { if (!me) requireLogin(); }}
          autoFocus={autoFocus}
          rows={parentId ? 2 : 3}
          maxLength={1500}
          placeholder={me ? placeholder : "เข้าสู่ระบบเพื่อแสดงความเห็น…"}
          className="w-full resize-y rounded-2xl border border-line bg-paper px-4 py-3 text-[1rem] leading-relaxed outline-none placeholder:text-faint focus:border-gold"
        />
        {error && <p role="alert" className="mt-1 text-sm text-laterite">{error}</p>}
        <div className="mt-2 flex justify-end gap-2">
          {onCancel && <button type="button" onClick={onCancel} className="press rounded-sm px-4 py-2 text-sm text-muted hover:bg-paper-2">ยกเลิก</button>}
          <button type="button" onClick={send} disabled={!text.trim() || busy} className="press rounded-sm bg-night px-5 py-2 text-sm font-semibold text-on-night disabled:opacity-40">ส่ง</button>
        </div>
      </div>
    </div>
  );
}

function CommentItem({ c, replies, now, postId, depth = 0, onAdd, onRemove, likes, onLike }: {
  c: Comment; replies: Comment[]; now: number; postId: string; depth?: number;
  onAdd: (c: Comment) => void; onRemove: (id: string) => void; likes: Record<string, number>; onLike: (id: string) => void;
}) {
  const [replying, setReplying] = useState(false);
  const liked = useSise((s) => s.commentLikes.includes(c.id));
  const myId = useSise((s) => s.me?.id);
  const blocked = useSise((s) => s.blocked);
  const muted = useSise((s) => s.muted);
  if (blocked.includes(c.authorId) || muted.includes(c.authorId)) return null;
  const author = c.author;

  return (
    <li className={cx(depth > 0 && "ml-6 border-l border-line-soft pl-4 sm:ml-10")}>
      <div className={cx("flex gap-3 rounded-2xl p-3", c.best && "bg-jade-soft/70 ring-1 ring-jade/20")}>
        <Avatar name={author.name} tone={author.tone} size={depth ? 30 : 36} src={author.pictureUrl} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 text-sm">
            <Link href={`/u/${author.handle}`} className="font-semibold hover:underline">{author.name}</Link>
            {author.badge === "local-guide" && <span className="rounded bg-gold-soft px-1.5 py-px text-[10px] font-bold text-[#7a5a14] dark:text-gold">Local Guide</span>}
            {author.badge === "moderator" && <span className="rounded bg-night px-1.5 py-px text-[10px] font-bold text-on-night">MOD</span>}
            {c.best && <span className="inline-flex items-center gap-1 text-xs font-semibold text-jade"><Award className="h-3.5 w-3.5" /> คำตอบที่เป็นประโยชน์</span>}
            <time className="text-xs text-muted" suppressHydrationWarning>{formatAge(ageOf(c, now))}</time>
          </div>
          <p className="mt-1 whitespace-pre-line break-words text-[0.98rem] leading-relaxed text-ink-2">{c.body}</p>
          <div className="-ml-2 mt-1 flex items-center">
            <button type="button" onClick={() => onLike(c.id)} aria-pressed={liked} className={cx("press flex items-center gap-1.5 rounded-sm px-2.5 py-1.5 text-sm", liked ? "text-laterite" : "text-muted hover:bg-paper-2")}>
              <Heart className={cx("h-4 w-4", liked && "fill-current")} /> <span className="tabular-nums">{likes[c.id] ?? c.likes}</span>
            </button>
            {depth === 0 && (
              <button type="button" onClick={() => requireLogin() && setReplying((r) => !r)} className="press flex items-center gap-1.5 rounded-sm px-2.5 py-1.5 text-sm text-muted hover:bg-paper-2">
                <CornerDownRight className="h-4 w-4" /> ตอบกลับ
              </button>
            )}
            {c.authorId === myId ? (
              <button type="button" onClick={() => onRemove(c.id)} className="press rounded-sm p-2 text-faint hover:bg-paper-2 hover:text-laterite" aria-label="ลบความเห็น"><Trash2 className="h-4 w-4" /></button>
            ) : (
              <ReportMenu targetType="comment" targetId={c.id} authorId={c.authorId} authorName={author.name} />
            )}
          </div>
        </div>
      </div>
      {replying && <div className="ml-6 mt-1 sm:ml-12"><CommentBox postId={postId} parentId={c.id} autoFocus onPosted={(n) => { onAdd(n); setReplying(false); }} onCancel={() => setReplying(false)} placeholder={`ตอบกลับ ${author.name}…`} /></div>}
      {replies.length > 0 && (
        <ul className="mt-1 space-y-1">
          {replies.map((r) => <CommentItem key={r.id} c={r} replies={[]} now={now} postId={postId} depth={1} onAdd={onAdd} onRemove={onRemove} likes={likes} onLike={onLike} />)}
        </ul>
      )}
    </li>
  );
}

function Comments({ post, initial }: { post: Post; initial: Comment[] }) {
  const [comments, setComments] = useState(initial);
  const [likes, setLikes] = useState<Record<string, number>>({});
  const now = useNow();
  const [sort, setSort] = useState<"top" | "new">("top");

  const add = (c: Comment) => {
    setComments((list) => (list.some((x) => x.id === c.id) ? list : [...list, c]));
    actions.bumpComments(post, 1);
  };
  const remove = async (id: string) => {
    const r = await api<{ removed: number }>(`/api/comments/${id}`, "DELETE");
    if (!r.ok) return toast(r.error);
    setComments((list) => list.filter((c) => c.id !== id && c.parentId !== id));
    actions.bumpComments(post, -r.data.removed);
    toast("ลบความเห็นแล้ว");
  };
  const like = async (id: string) => {
    const r = await actions.likeComment(id);
    if (r) setLikes((m) => ({ ...m, [id]: r.count }));
  };

  const { roots, byParent } = useMemo(() => {
    const map = new Map<string, Comment[]>();
    for (const c of comments) if (c.parentId) map.set(c.parentId, [...(map.get(c.parentId) ?? []), c]);
    const rootsAll = comments.filter((c) => !c.parentId);
    const age = (c: Comment) => ageOf(c, now);
    rootsAll.sort(sort === "top" ? (a, b) => Number(!!b.best) - Number(!!a.best) || b.likes - a.likes || age(a) - age(b) : (a, b) => age(a) - age(b));
    return { roots: rootsAll, byParent: map };
  }, [comments, now, sort]);

  return (
    <section id="comments" className="scroll-mt-20" aria-label="ความคิดเห็น">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-editorial text-xl font-semibold">ความคิดเห็น <span className="text-muted">({comments.length})</span></h2>
        {roots.length > 1 && (
          <div className="flex rounded-sm border border-line p-0.5 text-sm" role="group" aria-label="เรียงความเห็น">
            {(["top", "new"] as const).map((k) => (
              <button key={k} type="button" aria-pressed={sort === k} onClick={() => setSort(k)} className={cx("rounded-sm px-3 py-1", sort === k ? "bg-night text-on-night" : "text-muted")}>{k === "top" ? "ยอดนิยม" : "ใหม่"}</button>
            ))}
          </div>
        )}
      </div>
      <div className="surface mb-3 p-4"><CommentBox postId={post.id} onPosted={add} /></div>
      {roots.length === 0 ? (
        <EmptyState icon="chat" title="ยังไม่มีความคิดเห็น" hint="เป็นคนแรกที่ตอบได้เลย" />
      ) : (
        <ul className="space-y-1">
          {roots.map((c) => <CommentItem key={c.id} c={c} replies={[...(byParent.get(c.id) ?? [])].sort((a, b) => b.createdAt - a.createdAt)} now={now} postId={post.id} onAdd={add} onRemove={remove} likes={likes} onLike={like} />)}
        </ul>
      )}
    </section>
  );
}

export function PostDetail({ post, comments, related, place, event, deal, listing }: {
  post: Post; comments: Comment[]; related: Post[]; place?: Place; event?: SiseEvent; deal?: Deal; listing?: Listing & { sellerName: string };
}) {
  const router = useRouter();
  const now = useNow();
  const myId = useSise((s) => s.me?.id);
  const author = post.author;

  useEffect(() => {
    syncPosts([post, ...related]);
    const key = `sise:viewed:${post.id}`;
    try {
      if (!window.sessionStorage.getItem(key)) {
        window.sessionStorage.setItem(key, "1");
        void api(`/api/posts/${post.id}/view`);
      }
    } catch {
      /* ignore */
    }
  }, [post, related]);

  const del = async () => {
    if (!window.confirm("ลบโพสต์นี้ถาวร?")) return;
    const r = await api(`/api/posts/${post.id}`, "DELETE");
    if (!r.ok) return toast(r.error);
    toast("ลบโพสต์แล้ว");
    router.push("/me");
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <button type="button" onClick={() => (window.history.length > 1 ? router.back() : router.push("/"))} className="press -ml-2 mb-3 inline-flex items-center gap-1.5 rounded-sm px-2 py-1.5 text-sm text-muted hover:bg-paper-2">
          <ArrowLeft className="h-4 w-4" /> กลับ
        </button>

        {post.status && post.status !== "PUBLISHED" && (
          <p className="mb-3 flex items-start gap-2 rounded-2xl bg-gold-soft p-4 text-sm"><ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-gold" /> โพสต์นี้รอผู้ดูแลตรวจสอบ ยังมองเห็นเฉพาะคุณ จะแสดงให้ทุกคนเมื่อผ่านการตรวจสอบ</p>
        )}

        <article className="surface p-5 sm:p-7">
          <header className="flex items-start gap-3">
            <Link href={`/u/${author.handle}`}><Avatar name={author.name} tone={author.tone} size={44} src={author.pictureUrl} /></Link>
            <div className="min-w-0 flex-1">
              <Link href={`/u/${author.handle}`} className="font-semibold hover:underline">{author.name}</Link>
              <p className="flex flex-wrap items-center gap-x-1.5 text-xs text-muted">
                <Link href={`/rooms/${post.room.slug}`} className="inline-flex items-center gap-1 font-medium text-ink-2 hover:text-gold"><RoomIcon name={post.room.icon} className="h-3 w-3" /> {post.room.name}</Link>
                <span aria-hidden="true">·</span>
                <time suppressHydrationWarning>{formatAge(ageOf(post, now))}</time>
              </p>
            </div>
            {post.authorId === myId ? (
              <button type="button" onClick={del} className="press rounded-sm p-2 text-faint hover:bg-paper-2 hover:text-laterite" aria-label="ลบโพสต์"><Trash2 className="h-5 w-5" /></button>
            ) : (
              <ReportMenu targetType="post" targetId={post.id} authorId={post.authorId} authorName={author.name} />
            )}
          </header>

          <div className="mt-4"><TypeBadge type={post.type} /></div>
          <h1 className="font-editorial mt-2 text-[1.6rem] font-bold leading-snug sm:text-3xl">{post.title}</h1>
          {post.body && <p className="mt-3 whitespace-pre-line break-words text-[1.02rem] leading-[1.85] text-ink-2">{post.body}</p>}

          {post.photos && post.photos.length > 0 && (
            <div className={cx("mt-4 grid gap-2 overflow-hidden rounded-2xl", post.photos.length > 1 && "sm:grid-cols-2")}>
              {post.photos.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={src} alt={`รูปที่ ${i + 1} จากโพสต์ ${post.title}`} className="w-full object-cover" />
              ))}
            </div>
          )}
          {!post.photos?.length && post.images && post.images.length > 0 && (
            <div className={cx("mt-4 grid gap-2 overflow-hidden rounded-2xl", post.images.length > 1 && "sm:grid-cols-2")}>
              {post.images.map((tone, i) => <Cover key={i} tone={tone} icon={post.room.icon} className="aspect-[16/10] w-full" />)}
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
          {listing && <ListingCard listing={listing} sellerName={listing.sellerName} />}
        </section>
      )}

      <Comments post={post} initial={comments} />

      {related.length > 0 && (
        <section>
          <SectionHeader title="โพสต์ที่เกี่ยวข้อง" href={`/rooms/${post.room.slug}`} hrefLabel="ดูห้อง" />
          <div className="space-y-4">{related.map((p) => <PostCard key={p.id} post={p} showRoom={false} />)}</div>
        </section>
      )}
    </div>
  );
}
