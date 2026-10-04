import type { MetadataRoute } from "next";
import { guides } from "@/lib/data";
import { listBusinesses, listEvents, listListings, listPlaces, listPostIdsForSitemap, listRooms } from "@/lib/server/repo";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entry = (path: string, priority: number, changeFrequency: "daily" | "weekly" | "hourly" = "weekly") => ({ url: `${SITE_URL}${path}`, lastModified: now, changeFrequency, priority });
  const [rooms, places, events, businesses, listings, postIds] = await Promise.all([listRooms(), listPlaces(), listEvents(), listBusinesses(), listListings(), listPostIdsForSitemap()]);
  return [
    entry("/", 1, "hourly"),
    entry("/rooms", 0.9, "daily"),
    entry("/discover", 0.8, "daily"),
    entry("/places", 0.8),
    entry("/plan", 0.7),
    entry("/events", 0.9, "daily"),
    entry("/deals", 0.7, "daily"),
    entry("/market", 0.6, "daily"),
    entry("/guide", 0.7),
    ...rooms.map((r) => entry(`/rooms/${r.slug}`, 0.8, "daily")),
    ...places.map((p) => entry(`/places/${p.slug}`, 0.7)),
    ...events.map((e) => entry(`/events/${e.slug}`, 0.7, "daily")),
    ...businesses.map((b) => entry(`/business/${b.slug}`, 0.6)),
    ...guides.map((g) => entry(`/guide/${g.slug}`, 0.7)),
    ...listings.map((l) => entry(`/market/${l.id}`, 0.4)),
    ...postIds.map((id) => entry(`/post/${id}`, 0.5)),
  ];
}
