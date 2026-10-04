/**
 * Photo covers for rooms, places and posts.
 *
 * A photo only exists here once its file is committed to /public/covers and listed in COVER_PHOTOS
 * (with author + licence so /credits stays honest). Everything else falls back to the generated art
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
export const COVER_PHOTOS: CoverPhoto[] = [];

const bySceneMap = () => new Map(COVER_PHOTOS.map((p) => [p.scene, p]));

/** Which scenes suit which room, best first. A room uses the first scene that has a photo. */
export const ROOM_SCENES: Record<string, SceneId[]> = {
  sisaket: ["city", "lamduan", "river-mun"],
  talk: ["city", "countryside"],
  food: ["street-food", "market"],
  cafe: ["cafe", "city"],
  events: ["festival", "night"],
  business: ["city", "market"],
  home: ["countryside", "city"],
  cars: ["countryside", "city"],
  tech: ["city", "night"],
  education: ["city", "temple"],
  jobs: ["city", "market"],
  market: ["market", "street-food"],
  relationship: ["lamduan", "river-mun"],
  pets: ["countryside", "rice-field"],
  photography: ["pha-mo-i-daeng", "river-mun", "rice-field"],
  travel: ["pha-mo-i-daeng", "sa-kamphaeng-yai", "river-mun"],
  agriculture: ["durian", "shallot", "rice-field"],
  games: ["night", "city"],
  culture: ["silk", "sa-kamphaeng-yai", "temple"],
  news: ["city"],
  qa: ["city", "lamduan"],
  community: ["temple", "city", "countryside"],
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

export const roomPhoto = (slug: string): CoverPhoto | undefined => pick(ROOM_SCENES[slug]);
export const placePhoto = (slug: string): CoverPhoto | undefined => pick(PLACE_SCENES[slug]);

/** Photos for a post's media slots: the room's scenes, rotated so two posts in one room don't look identical. */
export function postPhotos(roomSlug: string, postId: string, count: number): CoverPhoto[] {
  const map = bySceneMap();
  const pool = (ROOM_SCENES[roomSlug] ?? []).map((s) => map.get(s)).filter((p): p is CoverPhoto => !!p);
  if (!pool.length) return [];
  let h = 0;
  for (const ch of postId) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return Array.from({ length: Math.min(count, Math.max(pool.length, 1)) }, (_, i) => pool[(h + i) % pool.length]);
}
