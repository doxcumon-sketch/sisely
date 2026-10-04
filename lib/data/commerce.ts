import type { Business, Deal, Listing, ListingCategory } from "@/lib/types";

export const deals: Deal[] = [
  { id: "d-latte", title: "ลาเต้แก้วที่สอง ลด 50% ตลอดวัน", businessName: "ลำดวนคอฟฟี่", placeSlug: "lamduan-coffee", businessSlug: "lamduan-coffee", tone: "gold", description: "สั่งลาเต้ร้อนหรือเย็นแก้วแรกเต็มราคา แก้วที่สองลดครึ่งราคา ชวนเพื่อนมานั่งทำงานด้วยกัน", discount: "ลด 50%", endsInHours: 9, terms: "ใช้ได้วันนี้เท่านั้น ไม่รวมเมนูพิเศษ", claimed: 86, sponsored: true },
  { id: "d-grill", title: "หมูกระทะบุฟเฟ่ต์ 4 ท่านจ่าย 3", businessName: "หมูกระทะบ้านทุ่ง", placeSlug: "mu-kratha-baan-tung", tone: "laterite", description: "มาเป็นกลุ่ม 4 ท่านขึ้นไป จ่าย 3 ท่านเท่านั้น วันธรรมดาตลอดเดือนนี้", discount: "4 จ่าย 3", endsInHours: 72, terms: "วันจันทร์–พฤหัสบดี แสดงโพสต์นี้ที่ร้าน", claimed: 142 },
  { id: "d-silk", title: "ผ้าพันคอไหมมัดหมี่ ลด 20%", businessName: "บ้านผ้าไหมสีสะเกด", placeSlug: "baan-pha-mai-sise", tone: "plum", description: "เฉพาะผ้าพันคอไหมแท้ลายท้องถิ่น ซื้อเป็นของฝากหรือใส่เอง จำนวนจำกัด", discount: "ลด 20%", endsInHours: 120, terms: "เมื่อซื้อ 1 ผืนขึ้นไป จำกัดคนละ 3 ผืน", claimed: 34 },
  { id: "d-hotel", title: "พักริมน้ำ คืนที่สองลด 30%", businessName: "บ้านริมมูล รีสอร์ต", placeSlug: "baan-rim-mun-resort", tone: "sky", description: "พัก 2 คืนขึ้นไป คืนที่สองลด 30% พร้อมอาหารเช้าสำหรับ 2 ท่าน", discount: "คืนที่ 2 ลด 30%", endsInHours: 240, terms: "จองผ่าน LINE ระบุรหัส SISE", claimed: 19 },
  { id: "d-noodle", title: "ก๋วยจั๊บญวนป้าเล็ก เติมน้ำซุปฟรี", businessName: "ก๋วยจั๊บญวนป้าเล็ก", placeSlug: "kuay-jab-yuan-pa-lek", tone: "gold", description: "ชามแรกเติมน้ำซุปกระดูกหมูเคี่ยวฟรี ไม่จำกัด ตลอดสัปดาห์นี้", discount: "เติมซุปฟรี", endsInHours: 96, terms: "ทานที่ร้านเท่านั้น", claimed: 211 },
  { id: "d-print", title: "ป้ายร้าน + ออกแบบโลโก้ แพ็กเริ่มต้น", businessName: "สีสะเกษ พริ้นท์ สตูดิโอ", placeSlug: "sisaket-print-studio", businessSlug: "sisaket-print-studio", tone: "sky", description: "ร้านเปิดใหม่ในศรีสะเกษ รับแพ็กออกแบบโลโก้ ป้ายหน้าร้าน และนามบัตรในราคาพิเศษ", discount: "เริ่ม 1,990", endsInHours: 360, terms: "เฉพาะร้านเปิดใหม่ไม่เกิน 6 เดือน", claimed: 12 },
];

export const listings: Listing[] = [
  { id: "m-iphone", title: "iPhone 15 Pro 256GB สีไทเทเนียม", category: "electronics", price: 28900, negotiable: true, condition: "like-new", location: "อ.เมืองศรีสะเกษ", description: "ใช้งานประมาณ 8 เดือน สุขภาพแบต 96% ประกันศูนย์เหลือ 4 เดือน มีกล่อง สายชาร์จครบ นัดรับในเมือง ตรวจเครื่องได้ก่อน", sellerId: "u-krit", tone: "ink", ageMin: 140, saves: 38, views: 612, contact: "LINE @kritdev" },
  { id: "m-hilux", title: "Toyota Hilux Revo ปี 2019 ดีเซล 2.4", category: "cars", price: 489000, negotiable: true, condition: "used", location: "อ.ไพรบึง", description: "วิ่ง 82,000 กม. เช็กศูนย์ตลอด เจ้าของเดียว ไม่เคยชน ยางใหม่ครบชุด นัดดูรถและตรวจสภาพได้ทุกวัน", sellerId: "u-lung", tone: "laterite", ageMin: 1020, saves: 91, views: 2100, contact: "โทร 08x-xxx-xxxx", promoted: true },
  { id: "m-wave", title: "Honda Wave 125i ปี 2021 วิ่งน้อย", category: "motorcycles", price: 36500, negotiable: false, condition: "used", location: "อ.เมืองศรีสะเกษ", description: "วิ่ง 14,000 กม. สภาพดีมาก เล่มครบ ภาษีต่อถึงปีหน้า ไม่มีล้มหนัก", sellerId: "u-lung", tone: "gold", ageMin: 2400, saves: 27, views: 540, contact: "โทร 08x-xxx-xxxx" },
  { id: "m-onion", title: "หอมแดงศรีสะเกษ ตรงจากสวน 10 กก.", category: "agriculture", price: 650, negotiable: false, condition: "n/a", location: "อ.ขุนหาญ", description: "หอมแดงแห้งใหม่ เกรดคัด หัวใหญ่ กลิ่นหอม ส่งไปรษณีย์ได้ทั่วประเทศ รับตามออเดอร์ ส่งฟรีเมื่อสั่ง 3 ถุงขึ้นไป", sellerId: "u-mam", tone: "plum", ageMin: 380, saves: 54, views: 1190, contact: "LINE @mamonion", promoted: true },
  { id: "m-sofa", title: "โซฟาผ้า 3 ที่นั่ง สีเทาเข้ม", category: "furniture", price: 4200, negotiable: true, condition: "like-new", location: "อ.เมืองศรีสะเกษ", description: "ใช้งานน้อย เจ้าของย้ายบ้าน โครงไม้จริง เบาะแน่น ขนาด 190 ซม. ต้องมารับเอง มีรถกระบะรับจ้างแนะนำให้", sellerId: "u-nampueng", tone: "sky", ageMin: 720, saves: 17, views: 310, contact: "แชตในแอป" },
  { id: "m-silkscarf", title: "ผ้าไหมมัดหมี่ลายลำดวน ผืนละ 1,200", category: "local-products", price: 1200, negotiable: false, condition: "new", location: "อ.เมืองศรีสะเกษ", description: "ทอมือโดยกลุ่มแม่บ้าน ลายลำดวนสีเหลืองอ่อน ผ้าพันคอไหมแท้ ขนาด 40x180 ซม. มีกล่องของขวัญ", sellerId: "u-ploy", tone: "gold", ageMin: 4300, saves: 63, views: 880, contact: "LINE @baanphamai" },
  { id: "m-durian", title: "ทุเรียนภูเขาไฟ หมอนทอง ตัดตามสั่ง", category: "agriculture", price: 160, negotiable: false, condition: "n/a", location: "อ.กันทรลักษ์", description: "ราคาต่อกิโลกรัม ตัดสุกตามสั่งเพื่อความสด ส่งแช่เย็นทั่วประเทศ มีรูปแกะดูเนื้อให้ก่อนชำระ", sellerId: "u-boss", tone: "jade", ageMin: 260, saves: 128, views: 3340, contact: "LINE @bossdurian", promoted: true },
  { id: "m-laptop", title: "MacBook Air M1 8/256 สภาพนางฟ้า", category: "electronics", price: 17900, negotiable: true, condition: "like-new", location: "อ.เมืองศรีสะเกษ", description: "ใช้เรียนและเขียนโค้ดเบา ๆ แบต 91% มีกล่อง ไม่เคยซ่อม นัดตรวจเครื่องที่ร้านกาแฟในเมืองได้", sellerId: "u-krit", tone: "indigo", ageMin: 190, saves: 22, views: 410, contact: "LINE @kritdev" },
  { id: "m-gardener", title: "รับจัดสวนและตัดแต่งต้นไม้ในเมือง", category: "services", price: 800, negotiable: true, condition: "n/a", location: "ศรีสะเกษและรอบเมือง", description: "ราคาเริ่มต้นวันละ 800 บาทต่อช่างหนึ่งคน รับงานบ้านและร้านค้า ประเมินราคาฟรีไม่เสียค่าเดินทางในเมือง", sellerId: "u-eak", tone: "jade", ageMin: 1800, saves: 9, views: 205, contact: "โทร 08x-xxx-xxxx" },
  { id: "m-bike", title: "จักรยานเสือหมอบมือสอง ไซส์ 52", category: "second-hand", price: 5500, negotiable: true, condition: "used", location: "อ.เมืองศรีสะเกษ", description: "อลูมิเนียม 2x9 สปีด เปลี่ยนเบรกและยางใหม่ เหมาะกับขี่ในเมืองและวิ่งถนนชานเมือง", sellerId: "u-ning", tone: "sky", ageMin: 3100, saves: 14, views: 260, contact: "แชตในแอป" },
];

export const LISTING_CATEGORIES: { key: ListingCategory; label: string }[] = [
  { key: "electronics", label: "อิเล็กทรอนิกส์" },
  { key: "cars", label: "รถยนต์" },
  { key: "motorcycles", label: "มอเตอร์ไซค์" },
  { key: "furniture", label: "เฟอร์นิเจอร์" },
  { key: "local-products", label: "สินค้าท้องถิ่น" },
  { key: "agriculture", label: "เกษตร" },
  { key: "services", label: "บริการ" },
  { key: "second-hand", label: "มือสอง" },
];
export const CONDITION_LABEL = { new: "ของใหม่", "like-new": "เหมือนใหม่", used: "มือสอง", "n/a": "—" } as const;
export const listingById = (id: string) => listings.find((l) => l.id === id);

export const businesses: Business[] = [
  {
    id: "b-lamduan", slug: "lamduan-coffee", name: "ลำดวนคอฟฟี่", tagline: "กาแฟคั่วเอง นั่งทำงานได้ทั้งวัน", category: "คาเฟ่", tone: "gold", plan: "featured", verified: true,
    description: "ร้านกาแฟคั่วเองกลางเมือง ใช้เมล็ดจากเกษตรกรอีสาน มีเมล็ดคั่วขายและคอร์สดริปสำหรับมือใหม่",
    address: "ถนนไชยณรงค์ ตัวเมืองศรีสะเกษ", phone: "045-000-101", line: "@lamduancoffee", hours: "ทุกวัน 08:00 – 18:00 (ปิดวันจันทร์)",
    offerings: [{ name: "ดริปรายวัน", note: "เมล็ดหมุนเวียนทุกสัปดาห์", price: "90–140 บาท" }, { name: "เมล็ดกาแฟคั่ว", note: "ถุง 200 กรัม", price: "320 บาท" }, { name: "คอร์สดริปมือใหม่", note: "2 ชั่วโมง", price: "800 บาท" }],
    placeSlug: "lamduan-coffee", followers: 1240, mentions: 214,
  },
  {
    id: "b-print", slug: "sisaket-print-studio", name: "สีสะเกษ พริ้นท์ สตูดิโอ", tagline: "งานพิมพ์และออกแบบสำหรับธุรกิจท้องถิ่น", category: "บริการงานพิมพ์", tone: "sky", plan: "pro", verified: true,
    description: "ครบทั้งป้าย โลโก้ นามบัตร สติกเกอร์ และแพ็กเกจจิ้ง ทีมออกแบบในร้าน รับงานด่วนภายในวัน",
    address: "ตัวเมืองศรีสะเกษ", phone: "045-000-606", line: "@sisaketprint", hours: "จ.–ส. 08:30 – 18:00",
    offerings: [{ name: "ออกแบบโลโก้", note: "แก้ไขได้ 3 ครั้ง", price: "เริ่ม 1,200 บาท" }, { name: "ป้ายไวนิลหน้าร้าน", note: "ตามขนาด", price: "เริ่ม 350 บาท" }, { name: "สติกเกอร์ฉลากสินค้า", note: "ขั้นต่ำ 100 ชิ้น", price: "เริ่ม 2.5 บาท/ชิ้น" }],
    placeSlug: "sisaket-print-studio", followers: 150, mentions: 52,
  },
  {
    id: "b-silk", slug: "baan-pha-mai-sise", name: "บ้านผ้าไหมสีสะเกด", tagline: "ผ้าไหมฝีมือชุมชน ลายท้องถิ่น", category: "ผ้าและหัตถกรรม", tone: "plum", plan: "pro", verified: true,
    description: "กลุ่มทอผ้าไหมที่สืบทอดลายมัดหมี่ท้องถิ่น ผลิตผ้าผืน ผ้าซิ่น ผ้าพันคอ และสั่งตัดเสื้อผ้า",
    address: "ถนนอุบล–ศรีสะเกษ", phone: "045-000-303", line: "@baanphamai", hours: "จ.–ส. 09:00 – 17:00",
    offerings: [{ name: "ผ้าพันคอไหมมัดหมี่", note: "ทอมือ", price: "1,200 บาท" }, { name: "ผ้าซิ่นไหมยกดอก", note: "ผืนละ 1 ลาย", price: "เริ่ม 4,500 บาท" }, { name: "เวิร์กช็อปทอผ้า", note: "ครึ่งวัน", price: "650 บาท" }],
    placeSlug: "baan-pha-mai-sise", followers: 560, mentions: 98,
  },
  {
    id: "b-durian", slug: "suan-durian-phu-khao-fai", name: "สวนทุเรียนภูเขาไฟ", tagline: "เที่ยวสวน ชิม และซื้อตรงจากเจ้าของ", category: "เกษตรและท่องเที่ยว", tone: "jade", plan: "free", verified: false,
    description: "สวนผลไม้ครอบครัวบนพื้นที่ดินภูเขาไฟ เปิดให้เข้าชมช่วงฤดูกาล รับออเดอร์ทุเรียนตัดตามสั่ง",
    address: "อ.กันทรลักษ์", phone: "045-000-202", hours: "ฤดูกาล 08:30 – 17:00",
    offerings: [{ name: "ทุเรียนหมอนทอง", note: "ตัดตามสั่ง", price: "160 บาท/กก." }, { name: "ทัวร์สวน + ชิม", note: "กลุ่ม 5 ท่านขึ้นไป", price: "120 บาท/คน" }],
    placeSlug: "suan-durian-phu-khao-fai", followers: 740, mentions: 61,
  },
];

export const businessBySlug = (slug: string) => businesses.find((b) => b.slug === slug);
export const PLAN_LABEL = { free: "ฟรี", pro: "Pro", featured: "แนะนำ", sponsored: "สปอนเซอร์" } as const;
