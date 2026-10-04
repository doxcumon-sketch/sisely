"use client";

import { Check, Copy, Link2, MessageCircle, Send, Share2 } from "lucide-react";
import { useState } from "react";
import { Sheet } from "@/components/sheet";
import { toast } from "@/components/toast";

function FacebookMark({ className }: { className?: string }) {
  return <span className={`${className ?? ""} text-center text-xl font-black leading-none`} aria-hidden="true">f</span>;
}

/** Share sheet: Facebook, LINE, Messenger, copy link, native share. The URL carries the OG card. */
export function ShareButton({ path, title, className, label }: { path: string; title: string; className?: string; label?: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const url = () => `${window.location.origin}${path}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url());
      setCopied(true);
      toast("คัดลอกลิงก์แล้ว");
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      toast("คัดลอกไม่สำเร็จ ลองกดค้างที่ลิงก์");
    }
  };

  const open_ = (href: string) => window.open(href, "_blank", "noopener,noreferrer,width=640,height=560");

  const onClick = async () => {
    if (typeof navigator.share === "function" && window.matchMedia("(max-width: 1023px)").matches) {
      try {
        await navigator.share({ title, url: url() });
        return;
      } catch {
        /* user cancelled or unsupported: fall through to sheet */
      }
    }
    setOpen(true);
  };

  const opts = [
    { label: "Facebook", icon: FacebookMark, color: "bg-[#1877f2]", run: () => open_(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url())}`) },
    { label: "LINE", icon: MessageCircle, color: "bg-[#06c755]", run: () => open_(`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url())}`) },
    { label: "Messenger", icon: Send, color: "bg-[#0a7cff]", run: () => open_(`https://www.facebook.com/dialog/send?link=${encodeURIComponent(url())}&app_id=0&redirect_uri=${encodeURIComponent(url())}`) },
    { label: copied ? "คัดลอกแล้ว" : "คัดลอกลิงก์", icon: copied ? Check : Copy, color: "bg-night", run: copy },
  ];

  return (
    <>
      <button type="button" onClick={onClick} className={className ?? "press flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-muted hover:bg-paper-2 hover:text-ink"} aria-label={`แชร์ ${title}`}>
        <Share2 className="h-[18px] w-[18px]" />
        {label !== undefined ? label : <span className="hidden sm:inline">แชร์</span>}
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title="แชร์ไปที่">
        <p className="mb-4 line-clamp-2 text-sm text-muted">{title}</p>
        <div className="grid grid-cols-4 gap-3">
          {opts.map(({ label: l, icon: Icon, color, run }) => (
            <button key={l} type="button" onClick={run} className="press flex flex-col items-center gap-2 rounded-2xl p-2 text-xs font-medium hover:bg-paper-2">
              <span className={`flex h-12 w-12 items-center justify-center rounded-full text-white ${color}`}>
                <Icon className="h-5 w-5" />
              </span>
              {l}
            </button>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-line bg-paper px-3 py-2 text-xs text-muted">
          <Link2 className="h-4 w-4 shrink-0" />
          <span className="truncate">{path}</span>
        </div>
      </Sheet>
    </>
  );
}
