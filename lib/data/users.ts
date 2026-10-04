import type { User } from "@/lib/types";

export const ME_ID = "u-me";

export const users: User[] = [
  { id: "u-me", handle: "guest", name: "คุณ (ผู้เยี่ยมชม)", bio: "เพิ่งมาถึงศรีสะเกษ กำลังสำรวจเมืองนี้อยู่", area: "อ.เมืองศรีสะเกษ", tone: "gold", joinedDays: 1, followers: 0, following: 4, reputation: 12 },
  { id: "u-nampueng", handle: "nampueng", name: "น้ำผึ้ง ใจดี", bio: "คนเมืองศรีฯ ชอบหาร้านกาแฟนั่งทำงาน เขียนรีวิวตามใจ", area: "อ.เมืองศรีสะเกษ", tone: "jade", joinedDays: 420, followers: 1840, following: 212, reputation: 92, badge: "local-guide" },
  { id: "u-boss", handle: "boss.kantharalak", name: "บอส กันทรลักษ์", bio: "ทำสวนทุเรียนภูเขาไฟ รับฟังทุกคำถามเรื่องเกษตร", area: "อ.กันทรลักษ์", tone: "laterite", joinedDays: 380, followers: 960, following: 88, reputation: 88 },
  { id: "u-ploy", handle: "ploy.sisaket", name: "พลอย ศรีสะเกษ", bio: "ช่างภาพสายถนน เก็บมุมเมืองเก่า ตลาดเช้า และพระอาทิตย์ตก", area: "อ.เมืองศรีสะเกษ", tone: "plum", joinedDays: 310, followers: 2410, following: 301, reputation: 90, badge: "local-guide" },
  { id: "u-krit", handle: "krit_dev", name: "กฤต ไอที", bio: "โปรแกรมเมอร์กลับบ้าน ทำงานรีโมตจากศรีสะเกษ", area: "อ.เมืองศรีสะเกษ", tone: "indigo", joinedDays: 260, followers: 540, following: 120, reputation: 81 },
  { id: "u-mam", handle: "mam.kunkhan", name: "แหม่ม ขุนหาญ", bio: "แม่ค้าหอมแดงและพืชผักปลอดสาร ส่งทั่วอีสานใต้", area: "อ.ขุนหาญ", tone: "sky", joinedDays: 200, followers: 420, following: 70, reputation: 76 },
  { id: "u-tum", handle: "tum_beat", name: "ตั้ม บีท", bio: "จัดงานดนตรีเล็ก ๆ ในเมือง ชอบเพลงสด", area: "อ.เมืองศรีสะเกษ", tone: "ink", joinedDays: 340, followers: 1320, following: 190, reputation: 84 },
  { id: "u-ning", handle: "ning_study", name: "นิ่ง นักเรียน", bio: "นักศึกษาปีสาม ชอบหาที่อ่านหนังสือเงียบ ๆ", area: "อ.เมืองศรีสะเกษ", tone: "sky", joinedDays: 150, followers: 210, following: 160, reputation: 58 },
  { id: "u-pa", handle: "pa.mod", name: "ป้าหน่อย ผู้ดูแลชุมชน", bio: "ดูแลห้องพูดคุย ใจดีแต่เข้มเรื่องสแปม", area: "อ.เมืองศรีสะเกษ", tone: "gold", joinedDays: 450, followers: 880, following: 40, reputation: 95, badge: "moderator" },
  { id: "u-lung", handle: "lungchai", name: "ลุงชัย รถมือสอง", bio: "ซื้อขายรถมือสองมา 20 ปี ไม่โกง ไม่ปิดงานเลื่อน", area: "อ.ไพรบึง", tone: "laterite", joinedDays: 230, followers: 380, following: 25, reputation: 70 },
  { id: "u-fah", handle: "fah.cafe", name: "ฟ้า ลำดวนคอฟฟี่", bio: "เจ้าของร้านลำดวนคอฟฟี่ ใจกลางเมือง", area: "อ.เมืองศรีสะเกษ", tone: "gold", joinedDays: 120, followers: 640, following: 55, reputation: 74, badge: "business" },
  { id: "u-eak", handle: "eak.travel", name: "เอก นักเดินทาง", bio: "เดินป่า ขึ้นเขา ชวนเที่ยวชายแดนอีสานใต้", area: "อ.กันทรลักษ์", tone: "jade", joinedDays: 290, followers: 1100, following: 143, reputation: 85 },
  { id: "u-jeab", handle: "jeab.vet", name: "หมอเจี๊ยบ สัตวแพทย์", bio: "ตอบเรื่องน้องหมาน้องแมวทุกคืนวันอังคาร", area: "อ.เมืองศรีสะเกษ", tone: "plum", joinedDays: 180, followers: 760, following: 33, reputation: 89, badge: "local-guide" },
  { id: "u-sise", handle: "sise", name: "ทีม SISE", bio: "ทีมงานผู้สร้างพื้นที่ออนไลน์ของคนศรีสะเกษ", area: "ศรีสะเกษ", tone: "ink", joinedDays: 500, followers: 5200, following: 12, reputation: 100, badge: "founder" },
];

export const userById = (id: string) => users.find((u) => u.id === id);
export const userByHandle = (handle: string) => users.find((u) => u.handle === handle);
