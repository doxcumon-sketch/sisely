import { BANNED_WORDS } from "@/lib/data/misc";
import type { Post } from "@/lib/types";

/**
 * Client-side first line of defence. The same functions should run again on the server
 * when a real backend exists (never trust the client). Everything here is deliberately
 * simple and explainable; swap in a service/ML score later behind the same interface.
 */
export type ModerationVerdict = { ok: true } | { ok: false; reason: string; code: "banned" | "duplicate" | "rate" | "links" | "caps" };

const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, "");

export function checkBannedWords(text: string): string | null {
  const t = normalize(text);
  return BANNED_WORDS.find((w) => t.includes(normalize(w))) ?? null;
}

export function checkContent(input: { title: string; body: string }, mine: Post[], now: number): ModerationVerdict {
  const text = `${input.title} ${input.body}`;
  const banned = checkBannedWords(text);
  if (banned) return { ok: false, code: "banned", reason: `เนื้อหามีคำที่ชุมชนไม่อนุญาต ("${banned}") กรุณาแก้ไขก่อนโพสต์` };

  const links = (text.match(/https?:\/\//g) ?? []).length;
  if (links > 2) return { ok: false, code: "links", reason: "ใส่ลิงก์ได้ไม่เกิน 2 ลิงก์ต่อโพสต์ เพื่อป้องกันสแปม" };

  const letters = text.replace(/[^A-Za-z]/g, "");
  if (letters.length > 24 && letters.replace(/[^A-Z]/g, "").length / letters.length > 0.7) {
    return { ok: false, code: "caps", reason: "กรุณาไม่พิมพ์ตัวพิมพ์ใหญ่ทั้งหมด" };
  }

  const sig = normalize(input.title + input.body);
  if (mine.some((p) => normalize(p.title + p.body) === sig)) {
    return { ok: false, code: "duplicate", reason: "คุณเพิ่งโพสต์เนื้อหานี้ไปแล้ว ลองแก้ให้ต่างออกไป หรือดูโพสต์เดิมของคุณ" };
  }

  const recent = mine.filter((p) => p.createdAt && now - p.createdAt < 10 * 60 * 1000).length;
  if (recent >= 5) return { ok: false, code: "rate", reason: "โพสต์ถี่เกินไป กรุณารอสักครู่แล้วลองใหม่ (จำกัด 5 โพสต์ต่อ 10 นาที)" };

  return { ok: true };
}

export function checkComment(body: string, recentCommentTimes: number[], now: number): ModerationVerdict {
  const banned = checkBannedWords(body);
  if (banned) return { ok: false, code: "banned", reason: `ความเห็นมีคำที่ชุมชนไม่อนุญาต ("${banned}")` };
  if (recentCommentTimes.filter((t) => now - t < 60_000).length >= 6) {
    return { ok: false, code: "rate", reason: "คอมเมนต์ถี่เกินไป รอสักครู่แล้วลองอีกครั้ง" };
  }
  return { ok: true };
}

/** Resize an image file to a small JPEG data URL so prototype posts fit in localStorage. */
export function downscaleImage(file: File, max = 900, quality = 0.72): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("canvas"));
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("image"));
    };
    img.src = url;
  });
}
