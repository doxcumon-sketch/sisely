# ขั้นต่อไปสู่ production

1. **Backend + Auth** — PostgreSQL (Neon) + Prisma ตาม `docs/DATA_MODEL.md`; ล็อกอินด้วย LINE Login / เบอร์โทร OTP (คนศรีสะเกษใช้ LINE มากที่สุด); แทน `lib/store.ts` ด้วย Server Actions / Route Handlers
2. **รูปภาพ** — อัปโหลดขึ้น object storage (Vercel Blob / R2), ย่อรูปฝั่งเซิร์ฟเวอร์, `next/image`
3. **Moderation จริง** — ย้าย `lib/moderation.ts` ไปรันฝั่งเซิร์ฟเวอร์, rate limit ด้วย Redis, คิวตรวจสอบ, สิทธิ์ ADMIN/MODERATOR ให้ `/admin`
4. **Share card** — `opengraph-image` ต่อโพสต์ (ต้องฝังฟอนต์ไทยลง ImageResponse) เพื่อให้ลิงก์บน Facebook/LINE สวย
5. **แจ้งเตือน** — Web Push + LINE Notify/Messaging API เมื่อมีคนตอบหรืองานที่ติดตามใกล้เริ่ม
6. **เนื้อหาจริง** — ร่วมมือกับร้าน/ผู้จัดงาน/ช่างภาพท้องถิ่น (seed community) ก่อนเปิดกว้าง; ขออนุญาตใช้รูปและชื่อ
7. **กฎหมาย** — นโยบายความเป็นส่วนตัว (PDPA), ข้อกำหนดการใช้งาน, ช่องทางแจ้งลบเนื้อหา
8. **Native app** — ใช้ API เดียวกันกับเว็บ; UI พอร์ตจาก design tokens ใน `app/globals.css`
