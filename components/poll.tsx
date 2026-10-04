"use client";

import { Check } from "lucide-react";
import { cx } from "@/components/ui";
import { actions, useSise } from "@/lib/store";
import type { Post } from "@/lib/types";

export function PollBlock({ post, compact }: { post: Post; compact?: boolean }) {
  const voted = useSise((s) => s.votes[post.id]);
  const fresh = useSise((s) => s.voteTotals[post.id]);
  if (!post.poll) return null;

  // Server totals already include this member's vote when the page was rendered after voting;
  // once they vote in-session we use the authoritative totals returned by the API.
  const options = fresh?.options ?? post.poll.options;
  const total = options.reduce((n, o) => n + o.votes, 0) || 1;
  const top = Math.max(...options.map((o) => o.votes));

  return (
    <div className="rounded-2xl border border-line-soft bg-paper p-3" role="group" aria-label="โพล">
      <ul className="space-y-2">
        {options.map((o) => {
          const pct = Math.round((o.votes / total) * 100);
          const mine = voted === o.id;
          return (
            <li key={o.id}>
              <button
                type="button"
                disabled={!!voted}
                onClick={() => actions.vote(post.id, o.id)}
                className={cx("relative w-full overflow-hidden rounded-xl border px-3.5 py-2.5 text-left text-[0.95rem]", voted ? "cursor-default" : "press hover:border-gold", mine ? "border-gold" : "border-line")}
                aria-label={voted ? `${o.label} ${pct}%` : `โหวต ${o.label}`}
              >
                {voted && <span className={cx("absolute inset-y-0 left-0", o.votes === top ? "bg-gold-soft" : "bg-paper-2")} style={{ width: `${pct}%`, transition: "width .6s cubic-bezier(.2,.7,.2,1)" }} />}
                <span className="relative flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2">{mine && <Check className="h-4 w-4 text-gold" />}{o.label}</span>
                  {voted && <span className="font-semibold tabular-nums">{pct}%</span>}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className={cx("mt-2 text-xs text-muted", compact && "mt-1.5")}>
        {total.toLocaleString("en-US")} โหวต · {post.poll.endsInHours > 0 ? `เหลือ ${post.poll.endsInHours} ชม.` : "ปิดโหวตแล้ว"}{!voted && post.poll.endsInHours > 0 && " · แตะเพื่อโหวต"}
      </p>
    </div>
  );
}
