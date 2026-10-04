import { BANNED_WORDS } from "@/lib/data/misc";

const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, "");

/** Shared (client hints + server enforcement): returns the first banned word found, if any. */
export function checkBannedWords(text: string): string | null {
  const t = normalize(text);
  return BANNED_WORDS.find((w) => t.includes(normalize(w))) ?? null;
}

/** Resize an image file to a small JPEG data URL so prototype posts fit in localStorage. */
export function downscaleImage(file: File, max = 900, quality = 0.72, square = false): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("canvas"));
      if (square) {
        // centre-crop to a square so avatars never get distorted
        const side = Math.min(img.width, img.height);
        const out = Math.min(max, side);
        canvas.width = canvas.height = out;
        ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, out, out);
      } else {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      }
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
