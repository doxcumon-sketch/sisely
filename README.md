# SISE — พื้นที่ออนไลน์ของคนศรีสะเกษ

> ศรีสะเกษในแบบของเรา · *Discover Sisaket.* · Local stories. Local places. Local people.

ชุมชนท้องถิ่น + ค้นพบเมือง (ห้องพูดคุย, สถานที่, งาน, ดีล, ซื้อขาย, ธุรกิจ, ไกด์) สำหรับคนศรีสะเกษ
ออกแบบ mobile-first และติดตั้งเป็น PWA ได้

**สถานะ:** ใช้งานได้จริงบนฐานข้อมูล PostgreSQL — ล็อกอินด้วย LINE, โพสต์/ความเห็น/ไลก์/บันทึก/ติดตาม/โหวต/รายงาน/บล็อก
บันทึกลงฐานข้อมูล, ตรวจสแปมและ rate limit ฝั่งเซิร์ฟเวอร์, หลังบ้านสำหรับผู้ดูแล (เนื้อหาตั้งต้นเป็นข้อมูลตัวอย่าง `npm run db:seed`)

## รันในเครื่อง

```bash
npm install
cp .env.example .env      # ใส่ DATABASE_URL, SESSION_SECRET (และ ALLOW_DEV_LOGIN=1 ถ้ายังไม่มี LINE)
npm run db:migrate && npm run db:seed
npm run dev               # http://localhost:3000
npm run typecheck && npm run lint && npm run build
```

เอาขึ้นเว็บจริง: ดู [`docs/DEPLOY.md`](docs/DEPLOY.md)

Next.js 16 (App Router, Turbopack) · React 19 · Tailwind CSS v4 · TypeScript · Prisma 7 + PostgreSQL (Neon) · zod

## โครงสร้าง

| ส่วน | ที่อยู่ |
|---|---|
| ฐานข้อมูล | `prisma/schema.prisma`, `prisma/migrations`, seed ตัวอย่าง `prisma/seed.ts` (จาก `lib/data/*`) |
| การอ่านข้อมูล / จัดอันดับ | `lib/server/repo.ts`, `lib/server/mappers.ts`, `lib/ranking.ts` |
| ล็อกอิน / session / CSRF | `lib/server/line.ts`, `lib/server/session.ts`, `lib/server/http.ts`, `app/api/auth/*` |
| การเขียนข้อมูล (API) | `app/api/*` (posts, comments, react, save, follow, vote, report, block, photos, admin) |
| Trending / For You ranking | `lib/ranking.ts` |
| สถานะฝั่งผู้ใช้ (optimistic UI → API) | `lib/store.ts` |
| Anti-spam / rate limit (ฝั่งเซิร์ฟเวอร์) | `lib/server/limits.ts`, `lib/moderation.ts`, `app/api/posts/route.ts` |
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
