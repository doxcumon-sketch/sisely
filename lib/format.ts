const TH_MONTHS = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
const TH_DAYS = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];
const TH_DAYS_SHORT = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];

export function formatAge(min: number): string {
  if (min < 1) return "เมื่อสักครู่";
  if (min < 60) return `${Math.floor(min)} นาทีที่แล้ว`;
  const h = min / 60;
  if (h < 24) return `${Math.floor(h)} ชม.ที่แล้ว`;
  const d = h / 24;
  if (d < 30) return `${Math.floor(d)} วันที่แล้ว`;
  const m = d / 30;
  if (m < 12) return `${Math.floor(m)} เดือนที่แล้ว`;
  return `${Math.floor(m / 12)} ปีที่แล้ว`;
}

export function formatCount(n: number): string {
  if (n >= 10000) return `${(n / 1000).toFixed(n >= 100000 ? 0 : 1).replace(/\.0$/, "")}K`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(n);
}

export function formatBaht(n: number): string {
  return `฿${n.toLocaleString("en-US")}`;
}

/** Calendar day in Bangkok time, offset from today. Server and client agree. */
export function bangkokDate(dayOffset = 0, from: number = Date.now()): Date {
  const bkk = new Date(from + 7 * 3600 * 1000);
  return new Date(Date.UTC(bkk.getUTCFullYear(), bkk.getUTCMonth(), bkk.getUTCDate() + dayOffset));
}

export function formatDateTh(dayOffset: number, opts: { weekday?: boolean } = {}): string {
  const d = bangkokDate(dayOffset);
  const base = `${d.getUTCDate()} ${TH_MONTHS[d.getUTCMonth()]}`;
  return opts.weekday ? `${TH_DAYS[d.getUTCDay()]} ${base}` : base;
}

export function weekdayShort(dayOffset: number): string {
  return TH_DAYS_SHORT[bangkokDate(dayOffset).getUTCDay()];
}

export function dayLabel(dayOffset: number): string {
  if (dayOffset === 0) return "วันนี้";
  if (dayOffset === 1) return "พรุ่งนี้";
  return formatDateTh(dayOffset, { weekday: true });
}

/** Offsets (from today) that fall on the coming Saturday/Sunday, today included. */
export function weekendOffsets(): number[] {
  const dow = bangkokDate(0).getUTCDay();
  const toSat = (6 - dow + 7) % 7;
  const sat = dow === 0 ? -1 : toSat;
  const sun = dow === 0 ? 0 : toSat + 1;
  return [sat, sun].filter((o) => o >= 0);
}
