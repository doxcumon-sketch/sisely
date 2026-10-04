import type { Post } from "@/lib/types";
import { rooms } from "@/lib/data/rooms";

/**
 * Trending is NOT "most liked". It rewards discussions that are alive right now:
 * weighted engagement (comments/shares/saves count more than passive likes), a
 * velocity term for the last hour, divided by an age decay, and nudged by how
 * active the room is. Swap for a server-side job later; the signature stays.
 */
export function engagement(p: Post): number {
  const s = p.stats;
  return s.comments * 4 + s.shares * 5 + s.saves * 3 + s.reactions * 1 + s.views * 0.05;
}

export function trendingScore(p: Post, ageMin: number): number {
  const hours = Math.max(ageMin, 1) / 60;
  const room = rooms.find((r) => r.slug === p.roomSlug);
  const roomBoost = room?.trending ? 1.1 : 1;
  const decay = Math.pow(hours + 2, 1.25);
  return ((engagement(p) + p.stats.velocity * 6) / decay) * roomBoost;
}

export interface ForYouContext {
  followedRooms: string[];
  followedUsers: string[];
  savedPlaceSlugs: string[];
  viewedTopics: string[]; // room slugs the user opened recently
  blocked: string[];
}

/** Version-1 personalization: simple, explainable, no ML. */
export function forYouScore(p: Post, ageMin: number, ctx: ForYouContext): number {
  if (ctx.blocked.includes(p.authorId)) return -1;
  let boost = 1;
  if (ctx.followedRooms.includes(p.roomSlug)) boost += 0.6;
  if (ctx.followedUsers.includes(p.authorId)) boost += 0.5;
  if (p.placeSlug && ctx.savedPlaceSlugs.includes(p.placeSlug)) boost += 0.4;
  if (ctx.viewedTopics.includes(p.roomSlug)) boost += 0.25;
  return trendingScore(p, ageMin) * boost;
}

export function hotLabel(score: number): "hot" | "warm" | null {
  if (score > 40) return "hot";
  if (score > 16) return "warm";
  return null;
}
