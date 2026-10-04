import type { Place } from "@/lib/types";

const WEEK = (time: string, closed?: string): Place["hours"] =>
  ["จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์", "อาทิตย์"].map((day) => ({ day, time: day === closed ? "ปิด" : time }));

// All places here are illustrative demo content — not real businesses.
export const places: Place[] = [
  {
    id: "p-lamduan", slug: "lamduan-coffee", name: "ลำดวนคอฟฟี่", category: "cafe", tone: "gold",
    tagline: "กาแฟคั่วเองใจกลางเมือง เงียบพอให้ทำงาน",
    description: "คาเฟ่ตึกแถวเก่าปรับใหม่ ใช้เมล็ดจากดอยและสวนในอีสาน คั่วเองทุกสัปดาห์ ชั้นสองเงียบ มีปลั๊กทุกโต๊ะ เหมาะกับคนที่อยากนั่งทำงานหรืออ่านหนังสือ",
    address: "ถนนไชยณรงค์ ตัวเมืองศรีสะเกษ", district: "อ.เมืองศรีสะเกษ", lat: 15.1186, lng: 104.3222,
    hours: WEEK("08:00 – 18:00", "จันทร์"), phone: "045-000-101", line: "@lamduancoffee", priceLevel: 2, rating: 4.7, reviews: 214,
    mentions: ["ชั้นสองเงียบมาก นั่งทำงานได้ทั้งบ่าย", "ดริปเอธิโอเปียหอมดี คนชงใส่ใจ", "ปลั๊กเยอะ ไวไฟแรง", "เสาร์อาทิตย์คนเยอะ มาเช้าดีกว่า"],
    highlights: ["ปลั๊กทุกโต๊ะ", "ไวไฟเร็ว", "ชั้นสองเงียบ", "เมล็ดคั่วเอง"], followers: 1240, businessSlug: "lamduan-coffee",
  },
  {
    id: "p-morning", slug: "talad-chao-sri", name: "ตลาดเช้าศรีสะเกษ", category: "restaurant", tone: "laterite",
    tagline: "อาหารเช้าแบบคนท้องถิ่น ตั้งแต่ตีห้า",
    description: "ตลาดสดเช้าที่คนในเมืองแวะกินข้าวเหนียวหมูปิ้ง ขนมจีนน้ำยา ปลาย่าง และผักพื้นบ้านสด ๆ เปิดตั้งแต่ตีห้าเงียบลงช่วงสิบโมง",
    address: "ถนนเทพา ตัวเมืองศรีสะเกษ", district: "อ.เมืองศรีสะเกษ", lat: 15.1142, lng: 104.3294,
    hours: WEEK("05:00 – 11:00"), priceLevel: 1, rating: 4.5, reviews: 341,
    mentions: ["หมูปิ้งเจ้าป้าสมศรีของจริง", "มาก่อนเจ็ดโมงของยังครบ", "ขนมจีนน้ำยาปลาร้ากลมกล่อม", "ที่จอดรถหายาก มาเช้าดี"],
    highlights: ["ตั้งแต่ 05:00", "ราคาถูก", "ของท้องถิ่น"], followers: 980,
  },
  {
    id: "p-phamo", slug: "pha-mo-i-daeng", name: "ผามออีแดง", category: "attraction", tone: "laterite",
    tagline: "หน้าผาชมวิวทิวเขาและที่ราบเขมร",
    description: "จุดชมวิวบนหน้าผาในเขตอุทยานแห่งชาติเขาพระวิหาร อ.กันทรลักษ์ เห็นทิวทัศน์กว้างไกล ช่วงเช้ามีทะเลหมอกบางฤดู ควรเช็กสภาพเส้นทางและเวลาเปิด-ปิดก่อนเดินทาง",
    address: "อ.กันทรลักษ์ จ.ศรีสะเกษ", district: "อ.กันทรลักษ์", lat: 14.3894, lng: 104.6849,
    hours: WEEK("06:00 – 18:00"), priceLevel: 1, rating: 4.8, reviews: 802,
    mentions: ["ไปช่วงเช้าวิวสวยมาก", "ถนนขึ้นเขาควรขับระวัง", "เช็กเวลาเปิดปิดอุทยานก่อนไป", "ลมแรง เตรียมเสื้อกันลมไปด้วย"],
    highlights: ["วิวทิวเขา", "ทะเลหมอกตามฤดู", "ถ่ายรูปสวย"], followers: 3410,
  },
  {
    id: "p-durian", slug: "suan-durian-phu-khao-fai", name: "สวนทุเรียนภูเขาไฟ", category: "activity", tone: "jade",
    tagline: "เที่ยวสวน ชิมทุเรียนสุกคาต้น",
    description: "สวนผลไม้เปิดให้เข้าชมช่วงฤดูทุเรียน มีไกด์พาเดินสวน ชิมทุเรียนพันธุ์ที่ปลูกบนดินภูเขาไฟ และซื้อกลับบ้านในราคาหน้าสวน",
    address: "อ.กันทรลักษ์ จ.ศรีสะเกษ", district: "อ.กันทรลักษ์", lat: 14.6401, lng: 104.6313,
    hours: WEEK("08:30 – 17:00", "จันทร์"), phone: "045-000-202", priceLevel: 2, rating: 4.6, reviews: 167,
    mentions: ["ชิมก่อนซื้อได้ ไม่บังคับ", "ทุเรียนสุกกำลังดี เนื้อละเอียด", "ควรโทรจองก่อนมาเป็นกลุ่ม"],
    highlights: ["ชิมก่อนซื้อ", "มีไกด์", "ฤดูกาล พ.ค.–ก.ค."], followers: 740,
  },
  {
    id: "p-silk", slug: "baan-pha-mai-sise", name: "บ้านผ้าไหมสีสะเกด", category: "shopping", tone: "plum",
    tagline: "ผ้าไหมและผ้าทอมือฝีมือชุมชน",
    description: "กลุ่มทอผ้าไหมที่สืบทอดลายท้องถิ่น มีทั้งผ้าไหมมัดหมี่ ผ้าซิ่น และผ้าพันคอ ชมการทอสดและสั่งตัดได้ เหมาะซื้อเป็นของฝากที่มีเรื่องราว",
    address: "ถนนอุบล–ศรีสะเกษ", district: "อ.เมืองศรีสะเกษ", lat: 15.1011, lng: 104.3369,
    hours: WEEK("09:00 – 17:00", "อาทิตย์"), phone: "045-000-303", line: "@baanphamai", priceLevel: 3, rating: 4.9, reviews: 98,
    mentions: ["ลายสวยมาก ฝีมือละเอียด", "คุณป้าใจดี อธิบายลายให้ฟัง", "สั่งตัดชุดได้ ใช้เวลาประมาณสัปดาห์"],
    highlights: ["ทอสด", "สั่งตัดได้", "ของฝากมีเรื่องราว"], followers: 560,
  },
  {
    id: "p-grill", slug: "mu-kratha-baan-tung", name: "หมูกระทะบ้านทุ่ง", category: "restaurant", tone: "laterite",
    tagline: "หมูกระทะบุฟเฟ่ต์บรรยากาศสวน",
    description: "ร้านหมูกระทะกลางสวน โต๊ะกว้าง ที่จอดรถเยอะ น้ำจิ้มสูตรเฉพาะ เหมาะกับกลุ่มเพื่อนและครอบครัว เปิดช่วงเย็นถึงดึก",
    address: "ถนนเลี่ยงเมือง ตัวเมืองศรีสะเกษ", district: "อ.เมืองศรีสะเกษ", lat: 15.1253, lng: 104.3101,
    hours: WEEK("16:30 – 23:30"), phone: "045-000-404", priceLevel: 2, rating: 4.3, reviews: 276,
    mentions: ["น้ำจิ้มซีฟู้ดเด็ดมาก", "วันศุกร์เสาร์ต้องจองโต๊ะ", "ที่จอดรถกว้าง พาครอบครัวมาได้"],
    highlights: ["ที่จอดรถกว้าง", "เหมาะกับกลุ่ม", "เปิดดึก"], followers: 610,
  },
  {
    id: "p-hotel", slug: "baan-rim-mun-resort", name: "บ้านริมมูล รีสอร์ต", category: "hotel", tone: "sky",
    tagline: "ที่พักสงบริมแม่น้ำ ใกล้เมือง",
    description: "รีสอร์ตขนาดเล็กริมน้ำ 18 ห้อง บรรยากาศสงบ มีอาหารเช้าแบบท้องถิ่น เหมาะกับคนที่อยากพักผ่อนแต่ยังเข้าเมืองได้ภายใน 10 นาที",
    address: "ริมแม่น้ำมูล อ.เมืองศรีสะเกษ", district: "อ.เมืองศรีสะเกษ", lat: 15.0894, lng: 104.2951,
    hours: WEEK("เช็กอิน 14:00 • เช็กเอาต์ 12:00"), phone: "045-000-505", priceLevel: 3, rating: 4.4, reviews: 119,
    mentions: ["ห้องสะอาด เงียบมาก", "อาหารเช้าอร่อยแบบบ้าน ๆ", "เจ้าของใจดี แนะนำที่เที่ยวให้"],
    highlights: ["ริมน้ำ", "มีอาหารเช้า", "ใกล้เมือง"], followers: 340,
  },
  {
    id: "p-night", slug: "the-corner-live", name: "The Corner Live", category: "nightlife", tone: "ink",
    tagline: "ดนตรีสดทุกคืนวันศุกร์–เสาร์",
    description: "ร้านนั่งฟังเพลงสดในเมือง มีวงสลับทุกสัปดาห์ เมนูทานเล่นและเครื่องดื่ม ปิดตีหนึ่ง ดื่มแล้วไม่ขับ",
    address: "ถนนไชยณรงค์ ตัวเมืองศรีสะเกษ", district: "อ.เมืองศรีสะเกษ", lat: 15.1201, lng: 104.3238,
    hours: WEEK("18:00 – 01:00", "จันทร์"), priceLevel: 2, rating: 4.4, reviews: 188,
    mentions: ["เสียงดี วงแน่น", "ต้องจองโต๊ะวันเสาร์", "เมนูทานเล่นอร่อยเกินคาด"],
    highlights: ["ดนตรีสด", "ศุกร์–เสาร์", "ปิดตี 1"], followers: 1020,
  },
  {
    id: "p-temple", slug: "wat-pa-ban-nok", name: "วัดป่าบ้านนก", category: "attraction", tone: "gold",
    tagline: "วัดป่าร่มรื่น ได้พักใจกลางเมือง",
    description: "วัดป่าสงบร่มรื่น เหมาะกับการเดินเล่นเช้า ๆ ทำบุญ และนั่งสมาธิ โปรดแต่งกายสุภาพและเคารพสถานที่",
    address: "ใกล้ตัวเมืองศรีสะเกษ", district: "อ.เมืองศรีสะเกษ", lat: 15.1330, lng: 104.3180,
    hours: WEEK("05:00 – 19:00"), priceLevel: 1, rating: 4.7, reviews: 76,
    mentions: ["ร่มรื่นมาก เหมาะเดินเช้า", "ต้องแต่งกายสุภาพ", "บรรยากาศสงบจริง ๆ"],
    highlights: ["ร่มรื่น", "ฟรี", "เหมาะเดินเช้า"], followers: 280,
  },
  {
    id: "p-gym", slug: "fit-sisaket", name: "ฟิต ศรีสะเกษ ฟิตเนส", category: "activity", tone: "indigo",
    tagline: "ฟิตเนสทันสมัยใจกลางเมือง",
    description: "ฟิตเนสมีเทรนเนอร์ให้คำแนะนำ เปิดตั้งแต่เช้าตรู่ มีโซนคาร์ดิโอและเวทครบ ราคารายเดือนเป็นมิตร",
    address: "ตัวเมืองศรีสะเกษ", district: "อ.เมืองศรีสะเกษ", lat: 15.1167, lng: 104.3199,
    hours: WEEK("05:30 – 21:30"), priceLevel: 2, rating: 4.2, reviews: 64,
    mentions: ["เทรนเนอร์ใส่ใจ", "เครื่องเยอะ ไม่ต้องรอ", "ช่วงเย็นคนเยอะหน่อย"],
    highlights: ["เปิดเช้า", "มีเทรนเนอร์"], followers: 190,
  },
  {
    id: "p-print", slug: "sisaket-print-studio", name: "สีสะเกษ พริ้นท์ สตูดิโอ", category: "service", tone: "sky",
    tagline: "งานพิมพ์ ป้าย สติกเกอร์ ออกแบบให้ในวันเดียว",
    description: "ร้านงานพิมพ์และออกแบบสำหรับธุรกิจท้องถิ่น ป้ายร้าน นามบัตร สติกเกอร์ แพ็กเกจจิ้ง รับงานด่วนได้",
    address: "ตัวเมืองศรีสะเกษ", district: "อ.เมืองศรีสะเกษ", lat: 15.1155, lng: 104.3265,
    hours: WEEK("08:30 – 18:00", "อาทิตย์"), phone: "045-000-606", line: "@sisaketprint", priceLevel: 2, rating: 4.6, reviews: 52,
    mentions: ["ออกแบบสวย ส่งงานไว", "ราคายุติธรรม", "ทำแพ็กเกจให้ร้านเราได้เลย"],
    highlights: ["งานด่วน", "รับออกแบบ"], followers: 150, businessSlug: "sisaket-print-studio",
  },
  {
    id: "p-noodle", slug: "kuay-jab-yuan-pa-lek", name: "ก๋วยจั๊บญวนป้าเล็ก", category: "restaurant", tone: "gold",
    tagline: "น้ำซุปกระดูกหมูเคี่ยวเช้า ของหมดปิดร้านเลย",
    description: "ร้านเล็ก ๆ ที่คนในเมืองต่อคิวกินตอนสาย น้ำซุปหอมกลมกล่อม เส้นเหนียวนุ่ม ของหมดก่อนเที่ยงบ่อย ๆ",
    address: "ซอยข้างตลาด ตัวเมืองศรีสะเกษ", district: "อ.เมืองศรีสะเกษ", lat: 15.1138, lng: 104.3301,
    hours: WEEK("07:00 – 12:00", "จันทร์"), priceLevel: 1, rating: 4.8, reviews: 233,
    mentions: ["ต่อคิวแต่คุ้ม", "ซุปหอมมาก ไม่ใส่ผงชูรส", "ไปสายหมดทุกที"],
    highlights: ["ซุปเคี่ยวเอง", "ราคาถูก"], followers: 870,
  },
];

export const placeBySlug = (slug: string) => places.find((p) => p.slug === slug);

export const PLACE_CATEGORIES: { key: Place["category"]; label: string; icon: string }[] = [
  { key: "restaurant", label: "ร้านอาหาร", icon: "food" },
  { key: "cafe", label: "คาเฟ่", icon: "cafe" },
  { key: "attraction", label: "ที่เที่ยว", icon: "travel" },
  { key: "hotel", label: "ที่พัก", icon: "hotel" },
  { key: "shopping", label: "ช้อปปิ้ง", icon: "shopping" },
  { key: "activity", label: "กิจกรรม", icon: "activity" },
  { key: "nightlife", label: "กลางคืน", icon: "nightlife" },
  { key: "service", label: "บริการ", icon: "service" },
];

export const placeCategoryLabel = (k: Place["category"]) => PLACE_CATEGORIES.find((c) => c.key === k)?.label ?? k;
