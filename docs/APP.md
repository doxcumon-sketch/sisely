# ทำ SISE เป็นแอป (Android + iPhone)

แอปเป็น "เปลือก" (Capacitor) ที่โหลดเว็บ `https://sisely.vercel.app` อยู่ข้างใน อัปเดตเว็บเมื่อไร แอปได้ของใหม่ทันที ไม่ต้องส่งร้านใหม่ทุกครั้ง

## ก่อนเริ่ม: ต้องมี
- [x] หน้านโยบายความเป็นส่วนตัว `/privacy` และข้อกำหนด `/terms` (ร้านแอปบังคับ)
- [x] ปุ่มลบบัญชีในแอป (Apple บังคับ) — โปรไฟล์ > ความเป็นส่วนตัวและบัญชี
- [x] ปุ่มรายงาน/บล็อกเนื้อหา (ร้านแอปบังคับสำหรับแอปที่ผู้ใช้โพสต์ได้)
- [ ] ตั้งอีเมลติดต่อ: Vercel → Environment Variables → `NEXT_PUBLIC_CONTACT_EMAIL` แล้ว Redeploy (ขึ้นในหน้า privacy/terms)
- [ ] **ตัดสินใจ appId** (ในไฟล์ `capacitor.config.ts`) แบบ `com.ชื่อคุณ.sise` — **เปลี่ยนไม่ได้หลังขึ้นร้านแล้ว**

## ค่าใช้จ่าย
| ร้าน | ค่าสมัคร |
|---|---|
| Google Play | ประมาณ 25 ดอลลาร์ ครั้งเดียว |
| Apple App Store | ประมาณ 99 ดอลลาร์ต่อปี (สมัครที่ developer.apple.com) |

## ขั้นตอนบน Mac (ครั้งแรก)
ติดตั้ง **Xcode** (จาก App Store) และ **Android Studio** แล้วที่โฟลเดอร์โปรเจกต์:

```bash
git checkout main && git pull && npm install
npm run app:assets            # สร้างไอคอน/สแปลชทุกขนาดจากโฟลเดอร์ assets/
npx cap add ios               # สร้างโปรเจกต์ iPhone
npx cap add android           # สร้างโปรเจกต์ Android
npm run app:sync
npm run app:ios               # เปิด Xcode → เลือก Team (บัญชี Apple) → กดรันบนเครื่อง/จำลอง
npm run app:android           # เปิด Android Studio → Run
```

## ส่งขึ้นร้าน
- **Google Play:** Android Studio → Build → Generate Signed Bundle (AAB) → อัปโหลดที่ play.google.com/console
- **App Store:** Xcode → Product → Archive → Distribute App → App Store Connect
- ต้องใส่ใน Store listing: ลิงก์นโยบายความเป็นส่วนตัว `https://sisely.vercel.app/privacy`, ภาพหน้าจอ, คำอธิบาย, อายุ 13+ (มีเนื้อหาจากผู้ใช้), บัญชีทดสอบให้ผู้รีวิว

## ข้อควรรู้ (ตรงไปตรงมา)
1. **Apple อาจปฏิเสธแอปที่เป็นแค่เว็บเปล่าๆ** (กฎ 4.2) ควรเพิ่มความสามารถเฉพาะแอป เช่น การแจ้งเตือนผลักดัน (push), แชร์ native — มีปลั๊กอินติดตั้งไว้แล้ว (`@capacitor/push-notifications`, `share`) แต่ **ยังไม่ได้เชื่อมต่อ** ต้องตั้ง Firebase/APNs และเพิ่มโค้ดส่ง push จากเซิร์ฟเวอร์ (งานขั้นต่อไป)
2. **ล็อกอิน LINE ในแอป:** ในแอป การกดล็อกอินจะเปิดหน้า LINE ในตัวแอป ใช้อีเมล/รหัสผ่านหรือคิวอาร์ของ LINE ได้ ยังไม่เด้งเข้าแอป LINE อัตโนมัติ (ต้องใช้ LINE SDK แบบ native เป็นงานขั้นต่อไป)
3. ต้องมี Mac เพื่อทำแอป iPhone (Xcode ใช้ได้เฉพาะ Mac)
4. ใช้เวลารีวิว Google ประมาณ 1–7 วัน, Apple ประมาณ 1–3 วัน (รอบแรกอาจนานกว่า)
