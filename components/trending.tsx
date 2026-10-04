import Link from "next/link";
import type { Post } from "@/lib/types";

export function TrendingList({ posts }: { posts: Post[] }) {
  return (
    <ol className="space-y-1">
      {posts.map((p, i) => (
        <li key={p.id}>
          <Link href={`/post/${p.id}`} className="press group flex items-start gap-3 rounded-2xl p-2.5 hover:bg-paper-2">
            <span className="w-7 shrink-0 text-center text-2xl font-semibold text-gold" style={{ fontFamily: "var(--font-display-latin), serif" }}>{i + 1}</span>
            <span className="min-w-0">
              <span className="line-clamp-2 text-[0.95rem] font-medium leading-snug group-hover:text-gold">{p.title}</span>
              <span className="mt-0.5 block text-xs text-muted">{p.stats.comments} ความเห็น · {p.stats.reactions} ถูกใจ</span>
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
