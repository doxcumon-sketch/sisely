import { BANNED_WORDS } from "@/lib/data/misc";

const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, "");

/** Shared (client hints + server enforcement): returns the first banned word found, if any. */
export function checkBannedWords(text: string): string | null {
  const t = normalize(text);
  return BANNED_WORDS.find((w) => t.includes(normalize(w))) ?? null;
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
