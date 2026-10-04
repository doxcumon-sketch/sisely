import type { Notification, Report } from "@/lib/types";

export const seedNotifications: Notification[] = [
  { id: "n1", kind: "reply", text: "น้ำผึ้ง ใจดี ตอบคำถามของคุณ", detail: "ลำดวนคอฟฟี่ค่ะ ชั้นสองเงียบมาก มีปลั๊กทุกโต๊ะ…", href: "/post/p1", ageMin: 12, unread: true, actorId: "u-nampueng" },
  { id: "n2", kind: "room", text: "ห้องกินอะไรดี มีโพสต์ใหม่ที่กำลังเป็นกระแส", detail: "ก๋วยจั๊บญวนป้าเล็ก ซุปหอมมาก…", href: "/post/p2", ageMin: 45, unread: true },
  { id: "n3", kind: "event", text: "Live by the River เหลืออีก 2 วัน", detail: "คุณกดสนใจกิจกรรมนี้ไว้", href: "/events/live-by-the-river", ageMin: 120, unread: true },
  { id: "n4", kind: "mention", text: "ป้าหน่อย กล่าวถึงคุณในห้องพูดคุย", detail: "ขอเสียงจากน้องใหม่หน่อย…", href: "/post/p11", ageMin: 260, unread: false, actorId: "u-pa" },
  { id: "n5", kind: "place", text: "ลำดวนคอฟฟี่ มีดีลใหม่", detail: "ลาเต้แก้วที่สองลด 50% วันนี้", href: "/deals", ageMin: 330, unread: false },
  { id: "n6", kind: "market", text: "มีผู้สนใจสินค้าของคุณ", detail: "ผ้าไหมมัดหมี่ลายลำดวน มีคนบันทึก 3 คน", href: "/market/m-silkscarf", ageMin: 700, unread: false },
  { id: "n7", kind: "system", text: "ยินดีต้อนรับสู่ SISE", detail: "ลองเข้าห้องที่สนใจและกดติดตามเพื่อปรับหน้า 'สำหรับคุณ'", href: "/rooms", ageMin: 1400, unread: false },
];

export const seedReports: Report[] = [
  { id: "rp1", targetType: "post", targetId: "p8", reason: "scam", reporterId: "u-ning", ageMin: 55, status: "open", note: "ขอให้ตรวจสอบราคาสินค้าและช่องทางติดต่อ" },
  { id: "rp2", targetType: "comment", targetId: "c31", reason: "spam", reporterId: "u-pa", ageMin: 210, status: "open" },
  { id: "rp3", targetType: "post", targetId: "p20", reason: "other", reporterId: "u-boss", ageMin: 900, status: "resolved", note: "ตรวจสอบแล้ว โพสต์รับสมัครงานถูกต้อง" },
  { id: "rp4", targetType: "user", targetId: "u-lung", reason: "abuse", reporterId: "u-krit", ageMin: 2600, status: "dismissed" },
];

export const BANNED_WORDS = ["พนันออนไลน์", "เว็บตรง", "สล็อต", "ปล่อยกู้นอกระบบ", "ทัวร์ทิพย์"];
