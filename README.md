# SISE — พื้นที่ออนไลน์ของคนศรีสะเกษ

> ศรีสะเกษในแบบของเรา · *Discover Sisaket.* · Local stories. Local places. Local people.

ชุมชนท้องถิ่น + ค้นพบเมือง (ห้องพูดคุย, สถานที่, งาน, ดีล, ซื้อขาย, ธุรกิจ, ไกด์) สำหรับคนศรีสะเกษ
ออกแบบ mobile-first และติดตั้งเป็น PWA ได้

**สถานะ:** ต้นแบบที่ใช้งานได้จริง (ข้อมูลตัวอย่าง + บันทึกการกระทำของผู้ใช้ใน localStorage) — ยังไม่มี backend/ล็อกอินจริง
โครงสร้างข้อมูลและเลเยอร์โค้ดเตรียมไว้ให้ต่อฐานข้อมูลได้โดยไม่ต้องออกแบบหน้าใหม่

## รันในเครื่อง

```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck && npm run lint && npm run build
```

Next.js 16 (App Router, Turbopack) · React 19 · Tailwind CSS v4 · lucide-react · TypeScript — ไม่มี dependency เพิ่ม

## โครงสร้าง

| ส่วน | ที่อยู่ |
|---|---|
| ข้อมูลตัวอย่าง (ไทย, ศรีสะเกษ) | `lib/data/*` — ชนิดข้อมูลตรงกับตารางจริงใน `lib/types.ts` |
| Trending / For You ranking | `lib/ranking.ts` |
| การกระทำของผู้ใช้ (react/save/follow/post/comment/poll/block/report) | `lib/store.ts` (แทนด้วย API ภายหลัง) |
| Anti-spam / moderation (คำต้องห้าม, โพสต์ซ้ำ, rate limit, ลิงก์) | `lib/moderation.ts` |
| ค้นหาภาษาไทย + คำพ้อง | `lib/search.ts` |
| Design system (โทนสี, cover art, motion) | `app/globals.css`, `components/ui.tsx` |
| Share (Facebook / LINE / Messenger / copy / native) | `components/share.tsx` |
| PWA | `app/manifest.ts`, `public/sw.js`, `app/icon*` |
| SEO | `generateMetadata` ทุกหน้า, JSON-LD, `app/sitemap.ts`, `app/robots.ts` |

เอกสารเพิ่มเติม: [`docs/DATA_MODEL.md`](docs/DATA_MODEL.md) (โมเดลข้อมูล, ความสัมพันธ์, รายได้) ·
[`docs/ROADMAP.md`](docs/ROADMAP.md) (ขั้นต่อไปสู่ production)

## หน้าหลัก

`/` หน้าแรก · `/rooms` · `/rooms/[slug]` · `/post/[id]` · `/create` · `/discover` · `/places` · `/places/[slug]` ·
`/events` · `/events/[slug]` · `/deals` · `/market` · `/market/[id]` · `/business/[slug]` · `/guide` · `/guide/[slug]` ·
`/u/[handle]` · `/me` · `/search` · `/notifications` · `/admin`

> ข้อมูลทั้งหมดเป็นตัวอย่าง ไม่ใช่ธุรกิจหรือบุคคลจริง
