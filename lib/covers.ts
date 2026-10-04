/**
 * Photo covers for rooms, places and posts.
 *
 * A cover exists here once its file is committed to /public/covers and listed in COVER_PHOTOS
 * (with author + licence so /credits stays honest). The current set is SISE's own contemporary artwork
 * (scripts/gen-covers.py); real photographs can replace any entry with the same scene id. Everything else falls back to the generated art
 * covers, so the app never shows a broken image. See docs/COVERS.md for the shot list and licence rules.
 */
export type SceneId =
  | "city" | "market" | "street-food" | "cafe" | "pha-mo-i-daeng" | "sa-kamphaeng-yai" | "temple"
  | "durian" | "shallot" | "silk" | "rice-field" | "lamduan" | "river-mun" | "festival" | "night" | "countryside";

export interface CoverPhoto {
  scene: SceneId;
  /** public path, e.g. /covers/pha-mo-i-daeng.jpg (≈1600px wide, <350KB) */
  src: string;
  alt: string;
  author: string;
  license: string; // e.g. "CC BY-SA 4.0", "CC0", "ภาพของ SISE"
  sourceUrl?: string;
}

/** Add entries here when a photo file is added to /public/covers. */
export const COVER_PHOTOS: CoverPhoto[] = [
  { scene: "city", src: "/covers/city.jpg", alt: "ตัวเมืองศรีสะเกษยามค่ำ", author: "SISE", license: "ภาพประกอบต้นฉบับของ SISE" },
  { scene: "market", src: "/covers/market.jpg", alt: "ตลาดเช้าและโคมไฟ", author: "SISE", license: "ภาพประกอบต้นฉบับของ SISE" },
  { scene: "street-food", src: "/covers/street-food.jpg", alt: "เตาปิ้งย่างและควันหอม", author: "SISE", license: "ภาพประกอบต้นฉบับของ SISE" },
  { scene: "cafe", src: "/covers/cafe.jpg", alt: "กาแฟร้อนหนึ่งถ้วย", author: "SISE", license: "ภาพประกอบต้นฉบับของ SISE" },
  { scene: "pha-mo-i-daeng", src: "/covers/pha-mo-i-daeng.jpg", alt: "รุ่งอรุณเหนือทะเลหมอกที่ผามออีแดง", author: "SISE", license: "ภาพประกอบต้นฉบับของ SISE" },
  { scene: "sa-kamphaeng-yai", src: "/covers/sa-kamphaeng-yai.jpg", alt: "ปราสาทขอมสีทอง", author: "SISE", license: "ภาพประกอบต้นฉบับของ SISE" },
  { scene: "temple", src: "/covers/temple.jpg", alt: "เจดีย์ทองยามเย็น", author: "SISE", license: "ภาพประกอบต้นฉบับของ SISE" },
  { scene: "durian", src: "/covers/durian.jpg", alt: "ลวดลายหนามทุเรียน", author: "SISE", license: "ภาพประกอบต้นฉบับของ SISE" },
  { scene: "shallot", src: "/covers/shallot.jpg", alt: "แปลงหอมแดงยามเย็น", author: "SISE", license: "ภาพประกอบต้นฉบับของ SISE" },
  { scene: "silk", src: "/covers/silk.jpg", alt: "ลายมัดหมี่ผ้าไหม", author: "SISE", license: "ภาพประกอบต้นฉบับของ SISE" },
  { scene: "rice-field", src: "/covers/rice-field.jpg", alt: "ทุ่งนาเขียวยามเช้า", author: "SISE", license: "ภาพประกอบต้นฉบับของ SISE" },
  { scene: "lamduan", src: "/covers/lamduan.jpg", alt: "ดอกลำดวน ดอกไม้ประจำจังหวัด", author: "SISE", license: "ภาพประกอบต้นฉบับของ SISE" },
  { scene: "river-mun", src: "/covers/river-mun.jpg", alt: "แสงทองบนแม่น้ำมูล", author: "SISE", license: "ภาพประกอบต้นฉบับของ SISE" },
  { scene: "festival", src: "/covers/festival.jpg", alt: "พลุเฉลิมฉลองในงานเทศกาล", author: "SISE", license: "ภาพประกอบต้นฉบับของ SISE" },
  { scene: "night", src: "/covers/night.jpg", alt: "โคมไฟไนท์มาร์เก็ต", author: "SISE", license: "ภาพประกอบต้นฉบับของ SISE" },
  { scene: "countryside", src: "/covers/countryside.jpg", alt: "บ้านใต้ถุนยามพลบค่ำ", author: "SISE", license: "ภาพประกอบต้นฉบับของ SISE" },
];

const bySceneMap = () => new Map(COVER_PHOTOS.map((p) => [p.scene, p]));

/** Which scenes suit which room, best first. A room uses the first scene that has a photo. */
export const ROOM_SCENES: Record<string, SceneId[]> = {
  sisaket: ["lamduan", "city"],
  talk: ["river-mun", "countryside"],
  food: ["street-food", "market"],
  cafe: ["cafe", "city"],
  events: ["festival", "night"],
  business: ["market", "city"],
  home: ["countryside", "rice-field"],
  cars: ["rice-field", "city"],
  tech: ["night", "city"],
  education: ["sa-kamphaeng-yai", "temple"],
  jobs: ["city", "market"],
  market: ["shallot", "market"],
  relationship: ["river-mun", "lamduan"],
  pets: ["rice-field", "countryside"],
  photography: ["pha-mo-i-daeng", "river-mun"],
  travel: ["pha-mo-i-daeng", "sa-kamphaeng-yai"],
  agriculture: ["durian", "shallot"],
  games: ["night", "festival"],
  culture: ["silk", "sa-kamphaeng-yai"],
  news: ["city", "temple"],
  qa: ["temple", "lamduan"],
  community: ["countryside", "temple"],
};

/** Scenes for specific real places (by slug). Only attach real landmarks here — never a stand-in for a business. */
export const PLACE_SCENES: Record<string, SceneId[]> = {
  "pha-mo-i-daeng": ["pha-mo-i-daeng"],
  "suan-durian-phu-khao-fai": ["durian"],
  "baan-pha-mai-sise": ["silk"],
  "talad-chao-sri": ["market"],
};

const pick = (scenes: SceneId[] | undefined, offset = 0): CoverPhoto | undefined => {
  const map = bySceneMap();
  const found = (scenes ?? []).map((s) => map.get(s)).filter((p): p is CoverPhoto => !!p);
  return found.length ? found[offset % found.length] : undefined;
};

/** Event artwork by category, so a concert and a market never share the same look. */
export const EVENT_SCENES: Record<string, SceneId[]> = {
  concert: ["night"], festival: ["festival"], market: ["market"], sports: ["pha-mo-i-daeng"], workshop: ["silk"],
  exhibition: ["city"], community: ["temple"], food: ["street-food"], culture: ["sa-kamphaeng-yai"],
};

export const roomPhoto = (slug: string): CoverPhoto | undefined => pick(ROOM_SCENES[slug]);
export const placePhoto = (slug: string): CoverPhoto | undefined => pick(PLACE_SCENES[slug]);
export const eventPhoto = (category: string): CoverPhoto | undefined => pick(EVENT_SCENES[category]);

/** Photos for a post's media slots: the room's scenes, rotated so two posts in one room don't look identical. */
export function postPhotos(roomSlug: string, postId: string, count: number): CoverPhoto[] {
  const map = bySceneMap();
  const pool = (ROOM_SCENES[roomSlug] ?? []).map((s) => map.get(s)).filter((p): p is CoverPhoto => !!p);
  if (!pool.length) return [];
  let h = 0;
  for (const ch of postId) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return Array.from({ length: Math.min(count, Math.max(pool.length, 1)) }, (_, i) => pool[(h + i) % pool.length]);
}
