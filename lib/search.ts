import { businesses, deals, events, places, rooms, users, listings, guides } from "@/lib/data";
import type { Business, Deal, Guide, Listing, Place, Post, Room, SiseEvent, User } from "@/lib/types";

// Thai has no word spaces, so we do case-insensitive substring matching over normalized text,
// expanded with a small synonym table for the things locals actually type.
const SYNONYMS: Record<string, string[]> = {
  กาแฟ: ["คาเฟ่", "coffee", "ดริป", "ลาเต้"],
  คาเฟ่: ["กาแฟ", "cafe"],
  อาหาร: ["กิน", "ร้านอาหาร", "ก๋วยจั๊บ", "หมูกระทะ", "ตลาดเช้า"],
  กิน: ["อาหาร", "ร้านอาหาร", "อร่อย"],
  เที่ยว: ["ที่เที่ยว", "ผามออีแดง", "ท่องเที่ยว", "ทริป"],
  งาน: ["อีเวนต์", "คอนเสิร์ต", "ตลาดนัด", "เทศกาล", "กิจกรรม"],
  คอนเสิร์ต: ["ดนตรี", "live", "ดนตรีสด"],
  ที่พัก: ["โรงแรม", "รีสอร์ต", "ห้องเช่า"],
  ผ้าไหม: ["ผ้า", "มัดหมี่", "ทอผ้า"],
  ทุเรียน: ["ผลไม้", "ภูเขาไฟ"],
};

export function expand(q: string): string[] {
  const base = q.trim().toLowerCase();
  if (!base) return [];
  const out = new Set([base]);
  for (const [k, v] of Object.entries(SYNONYMS)) if (base.includes(k)) v.forEach((s) => out.add(s));
  return [...out];
}

const hit = (terms: string[], ...fields: Array<string | undefined>) => {
  const hay = fields.filter(Boolean).join(" ").toLowerCase();
  return terms.some((t) => hay.includes(t));
};

const score = (q: string, ...fields: Array<string | undefined>) => {
  const needle = q.trim().toLowerCase();
  return fields.reduce((n, f, i) => (f?.toLowerCase().includes(needle) ? n + (i === 0 ? 3 : 1) : n), 0);
};

export interface SearchResults {
  posts: Post[];
  rooms: Room[];
  users: User[];
  places: Place[];
  businesses: Business[];
  events: SiseEvent[];
  deals: Deal[];
  listings: Listing[];
  guides: Guide[];
  total: number;
}

export function searchAll(q: string, posts: Post[], limit = 8): SearchResults {
  const terms = expand(q);
  const sortBy = <T,>(arr: T[], f: (x: T) => number) => [...arr].sort((a, b) => f(b) - f(a)).slice(0, limit);
  const r = {
    posts: sortBy(posts.filter((p) => hit(terms, p.title, p.body)), (p) => score(q, p.title, p.body) * 100 + p.stats.comments),
    rooms: sortBy(rooms.filter((x) => hit(terms, x.name, x.tagline, x.description)), (x) => score(q, x.name, x.tagline)),
    users: sortBy(users.filter((u) => u.id !== "u-me" && hit(terms, u.name, u.handle, u.bio)), (u) => score(q, u.name, u.bio)),
    places: sortBy(places.filter((p) => hit(terms, p.name, p.tagline, p.description, p.district, p.highlights.join(" "))), (p) => score(q, p.name, p.tagline) * 10 + p.rating),
    businesses: sortBy(businesses.filter((b) => hit(terms, b.name, b.tagline, b.category, b.description)), (b) => score(q, b.name, b.tagline)),
    events: sortBy(events.filter((e) => hit(terms, e.title, e.summary, e.venue, e.description)), (e) => score(q, e.title, e.summary)),
    deals: sortBy(deals.filter((d) => hit(terms, d.title, d.businessName, d.description)), (d) => score(q, d.title, d.businessName)),
    listings: sortBy(listings.filter((l) => hit(terms, l.title, l.description)), (l) => score(q, l.title, l.description)),
    guides: sortBy(guides.filter((g) => hit(terms, g.title, g.summary, g.seoKeywords.join(" "))), (g) => score(q, g.title, g.summary)),
  };
  const total = Object.values(r).reduce((n, a) => n + a.length, 0);
  return { ...r, total };
}
