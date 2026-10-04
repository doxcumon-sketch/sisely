import type { PostType } from "@/lib/types";

export interface PostTypeMeta {
  key: PostType;
  label: string; // short chip label used in composer
  long: string;
  icon: string;
  prompt: string;
}

export const POST_TYPES: PostTypeMeta[] = [
  { key: "question", label: "ถาม", long: "คำถาม", icon: "qa", prompt: "ถามคนศรีสะเกษ…" },
  { key: "discussion", label: "คุย", long: "พูดคุย", icon: "talk", prompt: "ชวนคุยเรื่องอะไรดี…" },
  { key: "recommendation", label: "แนะนำ", long: "แนะนำ", icon: "sparkle", prompt: "อยากแนะนำอะไร ร้านไหน ที่ไหน…" },
  { key: "event", label: "กิจกรรม", long: "กิจกรรม", icon: "events", prompt: "มีงานอะไร วันไหน ที่ไหน…" },
  { key: "deal", label: "ดีล", long: "ดีล", icon: "deal", prompt: "โปรโมชันอะไร ถึงเมื่อไหร่…" },
  { key: "marketplace", label: "ขาย", long: "ซื้อขาย", icon: "market", prompt: "ขายอะไร ราคาเท่าไหร่ สภาพเป็นอย่างไร…" },
  { key: "poll", label: "โพล", long: "โพล", icon: "chat", prompt: "อยากรู้ความเห็นเรื่องอะไร…" },
  { key: "story", label: "เรื่องเล่า", long: "เรื่องเล่า", icon: "news", prompt: "เล่าเรื่องของคุณ…" },
  { key: "announcement", label: "ประกาศ", long: "ประกาศ", icon: "news", prompt: "ประกาศอะไรถึงชุมชน…" },
];

export const postTypeMeta = (t: PostType) => POST_TYPES.find((x) => x.key === t) ?? POST_TYPES[1];
