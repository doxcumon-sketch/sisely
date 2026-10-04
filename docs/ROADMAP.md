# ขั้นต่อไปสู่ production

1. ~~Backend + Auth~~ ✅ PostgreSQL + Prisma + LINE Login
2. **รูปภาพ** — ย้ายจากเก็บในฐานข้อมูลไป object storage (Vercel Blob / R2), ย่อรูปฝั่งเซิร์ฟเวอร์, `next/image`, ลบรูปที่ไม่ถูกใช้ (โพสต์ไม่สำเร็จ)
3. **Moderation ขั้นต่อไป** — คำต้องห้ามแก้ไขได้ในหลังบ้าน, ประวัติการเตือน/ระงับ, อุทธรณ์, คะแนน reputation คำนวณจริง
4. **Share card** — `opengraph-image` ต่อโพสต์ (ต้องฝังฟอนต์ไทยลง ImageResponse) เพื่อให้ลิงก์บน Facebook/LINE สวย
5. **แจ้งเตือน** — Web Push + LINE Notify/Messaging API เมื่อมีคนตอบหรืองานที่ติดตามใกล้เริ่ม
6. **เนื้อหาจริง** — ร่วมมือกับร้าน/ผู้จัดงาน/ช่างภาพท้องถิ่น (seed community) ก่อนเปิดกว้าง; ขออนุญาตใช้รูปและชื่อ
7. **กฎหมาย** — นโยบายความเป็นส่วนตัว (PDPA), ข้อกำหนดการใช้งาน, ช่องทางแจ้งลบเนื้อหา
8. **Native app** — ใช้ API เดียวกันกับเว็บ; UI พอร์ตจาก design tokens ใน `app/globals.css`
