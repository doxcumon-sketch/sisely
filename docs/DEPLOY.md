# เอาขึ้นใช้งานจริง (Vercel + Neon + LINE Login)

## 1) ฐานข้อมูล (Neon)
1. สร้างโปรเจกต์ Neon **ใหม่** สำหรับ SISE (แยกจากโปรเจกต์อื่น) ภูมิภาค Singapore
2. เก็บ 2 ลิงก์: **pooled** (มี `-pooler`) ไว้ใส่ใน Vercel และ **direct** (ไม่มี `-pooler`) ไว้รัน migration
   - ตัด `&channel_binding=require` ออกจากลิงก์ถ้ามี
3. รันบนเครื่องคุณ (ครั้งเดียว และทุกครั้งที่มี migration ใหม่):
   ```bash
   export DATABASE_URL="<direct URL>"
   npm run db:migrate        # สร้างตารางทั้งหมด
   npm run db:seed           # (ไม่บังคับ) ใส่ข้อมูลตัวอย่างภาษาไทย ห้ามรันบนฐานข้อมูลที่มีสมาชิกจริงแล้ว
   ```
   Vercel **ไม่** รัน migration ให้เอง

## 2) LINE Login
1. https://developers.line.biz/console/ → Create provider → **Create a LINE Login channel** (App type: Web app)
2. แท็บ **LINE Login** → Callback URL: `https://<โดเมนของคุณ>/api/auth/line/callback`
   (เพิ่ม `http://localhost:3000/api/auth/line/callback` สำหรับทดสอบในเครื่องได้)
3. เปลี่ยนสถานะ channel เป็น **Published** (ไม่เช่นนั้นเฉพาะผู้ดูแล channel ที่ล็อกอินได้)
4. คัดลอก **Channel ID** และ **Channel secret** (แท็บ Basic settings)
   - SISE ขอสิทธิ์ `profile openid` เท่านั้น (ชื่อ + รูป) ไม่ขออีเมล

## 3) Vercel
Import repo → Environment Variables:

| ชื่อ | ค่า |
|---|---|
| `DATABASE_URL` | pooled URL ของ Neon |
| `SESSION_SECRET` | สุ่ม: `openssl rand -hex 32` (ห้ามเปลี่ยนบ่อย เพราะทุกคนจะถูกล็อกเอาต์) |
| `LINE_CHANNEL_ID` / `LINE_CHANNEL_SECRET` | จากข้อ 2 |
| `NEXT_PUBLIC_SITE_URL` | `https://<โดเมนของคุณ>` (ใช้ใน sitemap / metadata) |

**ห้ามตั้ง `ALLOW_DEV_LOGIN` บนโดเมนจริง** (ใช้ตอนพรีวิวก่อนมี LINE เท่านั้น เปิดแล้วใครก็สร้างบัญชีทดลองได้)
ตั้ง Function Region เป็น Singapore (sin1) ให้ใกล้ฐานข้อมูล

## 4) ตั้งผู้ดูแล
ล็อกอินด้วย LINE หนึ่งครั้งก่อน แล้วดู handle ของคุณที่หน้า `/me` (เช่น `@somchai1a2b`) จากนั้นรัน:
```bash
export DATABASE_URL="<direct URL>"
npm run db:make-admin -- somchai1a2b ADMIN
npm run db:make-admin -- someone-else MODERATOR
```
เมนู "หลังบ้าน" จะโผล่ในแถบข้างเฉพาะ ADMIN / MODERATOR ส่วนสมาชิกทั่วไปเปิด `/admin` จะเจอหน้า 404

## ข้อควรรู้
- รูปที่สมาชิกอัปโหลดเก็บในฐานข้อมูล (ย่อแล้ว ≤ 700KB) พอสำหรับช่วงเริ่มต้น ถ้าคนใช้เยอะให้ย้ายไป object storage
- Rate limit, ตรวจสแปม, คิวรายงาน ทำงานฝั่งเซิร์ฟเวอร์ทั้งหมด (ตาราง `RateEvent`, `Report`, `ModerationAction`)
- Vercel Hobby ห้ามใช้เชิงพาณิชย์ — เมื่อมีโฆษณา/รายได้ให้ย้ายเป็น Pro
- ก่อนเปิดจริง: นโยบายความเป็นส่วนตัว (PDPA) และข้อกำหนดการใช้งาน
