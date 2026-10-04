import type { Place, PlaceCategory, SiseEvent } from "@/lib/types";

export type Vibe = "food" | "cafe" | "nature" | "culture" | "photo" | "shopping" | "nightlife";
export type Who = "solo" | "couple" | "friends" | "family";

export const VIBES: { key: Vibe; label: string }[] = [
  { key: "food", label: "สายกิน" },
  { key: "cafe", label: "สายคาเฟ่" },
  { key: "nature", label: "ธรรมชาติ" },
  { key: "culture", label: "วัด/วัฒนธรรม" },
  { key: "photo", label: "ถ่ายรูปสวย" },
  { key: "shopping", label: "ช้อป/ของฝาก" },
  { key: "nightlife", label: "ค่ำๆ ชิลๆ" },
];
export const WHO: { key: Who; label: string }[] = [
  { key: "solo", label: "ไปคนเดียว" },
  { key: "couple", label: "ไปกับแฟน" },
  { key: "friends", label: "ไปกับเพื่อน" },
  { key: "family", label: "ไปกับครอบครัว" },
];

const KEYWORDS: Partial<Record<Vibe, string[]>> = {
  nature: ["ธรรมชาติ", "ภูเขา", "ผา", "ทะเลหมอก", "สวน", "ทุ่ง", "น้ำตก", "ป่า", "แม่น้ำ", "ทุเรียน", "หอมแดง"],
  culture: ["วัด", "ปราสาท", "ผ้าไหม", "ขอม", "ประวัติ", "พิพิธภัณฑ์", "ศิลป", "วัฒนธรรม", "มรดก", "ลายมัดหมี่"],
  photo: ["ถ่ายรูป", "วิว", "พระอาทิตย์", "ดอกไม้", "สวย", "ทะเลหมอก", "ลำดวน"],
};

export interface PlanInput { days: 1 | 2 | 3; vibes: Vibe[]; budget: 1 | 2 | 3; who: Who; from: number; seed: number }
export interface Stop {
  time: string;
  slot: string;
  place?: Place;
  event?: SiseEvent;
  why: string;
  /** estimated drive from the previous stop */
  km?: number;
  mins?: number;
}
export interface PlanDay { n: number; offset: number; stops: Stop[] }

const SLOTS: { time: string; slot: string; cats: PlaceCategory[]; only?: (i: PlanInput) => boolean }[] = [
  { time: "09:00", slot: "เช้า", cats: ["attraction", "activity"] },
  { time: "11:45", slot: "มื้อกลางวัน", cats: ["restaurant"] },
  { time: "13:30", slot: "พักชิล", cats: ["cafe"] },
  { time: "15:00", slot: "บ่าย", cats: ["attraction", "activity", "shopping"] },
  { time: "18:30", slot: "มื้อเย็น", cats: ["restaurant"] },
  { time: "20:00", slot: "ค่ำๆ", cats: ["nightlife", "cafe"], only: (i) => i.vibes.includes("nightlife") && i.who !== "family" },
];

/** Sisaket city centre (Sala Klang). Plans start here so a day does not zig-zag to the far edge of the province. */
const CITY = { lat: 15.1186, lng: 104.322 };

/** Rough drive time: ~30 km/h in town, ~55 km/h on provincial roads. */
export function driveMins(km: number) {
  const town = Math.min(km, 15), open = Math.max(0, km - 15);
  return Math.max(5, Math.round((town / 30 + open / 55) * 60));
}

const NOT_TOURISM = /ฟิตเนส|ยิม|อู่|ซ่อม|คลินิก|ธนาคาร/;

const rad = (d: number) => (d * Math.PI) / 180;
export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h)) * 1.3; // ×1.3: roads are not straight lines
}

function matches(p: Place, vibe: Vibe) {
  const text = `${p.name} ${p.tagline} ${p.description} ${p.highlights.join(" ")}`;
  return (KEYWORDS[vibe] ?? []).some((k) => text.includes(k));
}

/** Builds a day-by-day plan from real places and events. Deterministic for the same input, so a plan can be shared as a link. */
export function buildPlan(places: Place[], events: SiseEvent[], input: PlanInput): PlanDay[] {
  const used = new Set<string>();
  const days: PlanDay[] = [];
  for (let d = 0; d < input.days; d++) {
    const offset = input.from + d;
    const stops: Stop[] = [];
    let prev: Place | undefined;
    for (const [si, s] of SLOTS.entries()) {
      if (s.only && !s.only(input)) continue;
      if (s.slot === "พักชิล" && !input.vibes.includes("cafe") && input.vibes.length > 0 && d > 0) continue;
      let pool = places.filter((p) => s.cats.includes(p.category) && !used.has(p.id));
      pool = pool.filter((p) => !NOT_TOURISM.test(`${p.name} ${p.tagline}`));
      const farOk = input.days >= 2 && d === input.days - 1 && si === 0; // last day may open with a day-trip spot
      const from = prev ?? CITY;
      const close = pool.filter((p) => distanceKm(from, p) <= 40);
      // after a far day-trip stop there may be nothing nearby: then head back into town; otherwise skip the slot
      pool = farOk ? pool : close.length ? close : distanceKm(from, CITY) > 40 ? pool.filter((p) => distanceKm(CITY, p) <= 40) : [];
      const affordable = pool.filter((p) => p.priceLevel <= input.budget);
      if (affordable.length) pool = affordable;
      if (!pool.length) continue;
      const scored = pool
        .map((p) => {
          const hits = input.vibes.filter((v) => matches(p, v));
          const vibeBoost = hits.length * 2 + (s.cats.includes("restaurant") && input.vibes.includes("food") ? 1.5 : 0) + (p.category === "cafe" && input.vibes.includes("cafe") ? 1.5 : 0);
          const base = p.rating * Math.log(p.reviews + 2) * 0.4;
          const near = farOk ? 0 : distanceKm(prev ?? CITY, p) * 0.3;
          return { p, hits, score: base + vibeBoost - near };
        })
        .sort((a, b) => b.score - a.score);
      const top = scored.slice(0, Math.min(3, scored.length));
      const pick = top[(input.seed + si + d) % top.length];
      used.add(pick.p.id);
      const km = prev ? distanceKm(prev, pick.p) : undefined;
      const label = pick.hits.length ? `ตรงสไตล์ ${pick.hits.map((h) => VIBES.find((v) => v.key === h)!.label).join(" · ")}` : "";
      stops.push({
        time: s.time,
        slot: s.slot,
        place: pick.p,
        why: [label, pick.p.tagline].filter(Boolean).join(" — "),
        km: km !== undefined ? Math.round(km * 10) / 10 : undefined,
        mins: km !== undefined ? driveMins(km) : undefined,
      });
      prev = pick.p;
    }
    const ev = events.find((e) => e.dayOffset <= offset && offset < e.dayOffset + e.durationDays && e.startTime >= "16:00");
    if (ev) {
      stops.push({ time: ev.startTime, slot: "งานน่าไป", event: ev, why: ev.summary });
      stops.sort((a, b) => a.time.localeCompare(b.time));
    }
    days.push({ n: d + 1, offset, stops });
  }
  return days;
}

export function planQuery(i: PlanInput, over?: Partial<PlanInput>) {
  const v = { ...i, ...over };
  const q = new URLSearchParams({ go: "1", days: String(v.days), budget: String(v.budget), who: v.who, from: String(v.from), seed: String(v.seed) });
  for (const x of v.vibes) q.append("vibe", x);
  return q.toString();
}
