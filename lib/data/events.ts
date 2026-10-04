import type { SiseEvent } from "@/lib/types";

// dayOffset is relative to today so the demo never goes stale.
export const events: SiseEvent[] = [
  {
    id: "e-night-market", slug: "talad-nat-lamduan", title: "ตลาดนัดลำดวน ไนท์มาร์เก็ต", category: "market", tone: "gold",
    summary: "ตลาดนัดกลางเมือง อาหารพื้นถิ่น งานคราฟต์ และดนตรีสดเบา ๆ",
    description: "ตลาดนัดประจำสัปดาห์ รวมร้านอาหารพื้นถิ่น ของทำมือ ผ้าไหม และเวทีดนตรีเล็ก ๆ ตั้งแต่เย็นถึงค่ำ เดินเล่นได้ทั้งครอบครัว มีโซนเด็ก และมีจุดทิ้งขยะแยกประเภท",
    dayOffset: 0, durationDays: 1, startTime: "17:00", endTime: "22:00", venue: "ลานกลางเมือง", address: "ตัวเมืองศรีสะเกษ", price: "เข้าฟรี",
    organizer: "ชมรมคนรักเมืองศรีสะเกษ", contact: "LINE @lamduanmarket", ticketInfo: "ไม่ต้องซื้อบัตร จ่ายเฉพาะที่ซื้อของ", interested: 412, going: 138,
  },
  {
    id: "e-live", slug: "live-by-the-river", title: "Live by the River — ดนตรีริมน้ำมูล", category: "concert", tone: "indigo",
    summary: "ดนตรีสดริมแม่น้ำ ศิลปินท้องถิ่น 6 วง พร้อมฟู้ดทรัก",
    description: "คืนดนตรีกลางแจ้งริมน้ำ ศิลปินท้องถิ่นและวงจากจังหวัดใกล้เคียงรวม 6 วง มีฟู้ดทรักและเครื่องดื่ม ปูเสื่อนั่งฟังได้ เปิดประตู 17:30 ดนตรีเริ่มทุ่มตรง",
    dayOffset: 2, durationDays: 1, startTime: "18:00", endTime: "23:00", venue: "ลานริมมูล", address: "ริมแม่น้ำมูล อ.เมืองศรีสะเกษ", price: "บัตร 150 บาท / 2 ท่าน 250 บาท",
    organizer: "ตั้ม บีท & เพื่อน", contact: "ตั้ม 08x-xxx-xxxx", ticketInfo: "จำหน่ายหน้างานและโอนล่วงหน้าผ่าน LINE", interested: 1280, going: 462,
  },
  {
    id: "e-silk", slug: "silk-weaving-workshop", title: "เวิร์กช็อปทอผ้าไหมมัดหมี่ครึ่งวัน", category: "workshop", tone: "plum",
    summary: "ลองมัดย้อมและทอผ้าไหมกับครูภูมิปัญญา เหมาะกับมือใหม่",
    description: "เรียนรู้กรรมวิธีมัดหมี่และการทอพื้นฐานกับกลุ่มทอผ้าไหมท้องถิ่น ได้ผ้าพันคอผืนเล็กกลับบ้าน รับจำกัด 16 ที่นั่ง ไม่ต้องมีพื้นฐานมาก่อน",
    dayOffset: 4, durationDays: 1, startTime: "09:00", endTime: "13:00", venue: "บ้านผ้าไหมสีสะเกด", placeSlug: "baan-pha-mai-sise", address: "ถนนอุบล–ศรีสะเกษ", price: "650 บาท",
    organizer: "บ้านผ้าไหมสีสะเกด", contact: "LINE @baanphamai", ticketInfo: "จองล่วงหน้าผ่าน LINE มัดจำ 200 บาท", interested: 186, going: 11,
  },
  {
    id: "e-run", slug: "fun-run-pha-mo", title: "วิ่งเทรลมินิ ผามออีแดง 10K", category: "sports", tone: "jade",
    summary: "วิ่งเทรลสายสบาย เส้นทางวิวทิวเขา ระยะ 5K และ 10K",
    description: "งานวิ่งเทรลมินิในบรรยากาศป่าเขา แบ่งสองระยะ 5K และ 10K มีจุดน้ำ จุดปฐมพยาบาล และเสื้อที่ระลึกสำหรับผู้สมัครล่วงหน้า",
    dayOffset: 9, durationDays: 1, startTime: "05:30", endTime: "11:00", venue: "ลานจอดรถผามออีแดง", placeSlug: "pha-mo-i-daeng", address: "อ.กันทรลักษ์", price: "5K 450 บาท / 10K 550 บาท",
    organizer: "ชมรมวิ่งศรีสะเกษ", contact: "LINE @sisaketrun", ticketInfo: "สมัครออนไลน์ รับ BIB ก่อนวันงาน 1 วัน", interested: 920, going: 308,
  },
  {
    id: "e-food", slug: "isan-food-fest", title: "เทศกาลอาหารอีสานใต้", category: "food", tone: "laterite",
    summary: "รวมร้านเด็ดศรีสะเกษ สุรินทร์ บุรีรัมย์ ในลานเดียว",
    description: "สามวันเต็มของอาหารพื้นถิ่นอีสานใต้ ทั้งของคาวของหวาน เวทีเสวนาเรื่องอาหารกับเกษตรกร และมุมชิมผลไม้ตามฤดูกาล",
    dayOffset: 5, durationDays: 3, startTime: "11:00", endTime: "21:00", venue: "ลานหน้าศาลากลาง", address: "ตัวเมืองศรีสะเกษ", price: "เข้าฟรี",
    organizer: "สภาวัฒนธรรมจังหวัด x SISE", contact: "LINE @isanfoodfest", ticketInfo: "ไม่ต้องซื้อบัตร ใช้คูปองอาหารซื้อหน้างาน", interested: 2410, going: 780,
  },
  {
    id: "e-art", slug: "sisaket-art-walk", title: "Sisaket Art Walk นิทรรศการเดินชมเมือง", category: "exhibition", tone: "sky",
    summary: "ศิลปินท้องถิ่นยึดตึกแถวเก่ากลางเมือง จัดแสดงผลงานยาวหนึ่งสัปดาห์",
    description: "เดินชมงานศิลปะ 12 จุดตามตึกแถวเก่า ภาพถ่าย จิตรกรรม งานผ้า และงานเสียง ทุกจุดมีเจ้าของงานคอยพูดคุย แผนที่เดินชมแจกที่จุดแรก",
    dayOffset: 1, durationDays: 7, startTime: "10:00", endTime: "20:00", venue: "ย่านตึกแถวเก่า", address: "ถนนไชยณรงค์", price: "เข้าฟรี",
    organizer: "กลุ่มศิลปินศรีสะเกษ", contact: "FB: Sisaket Art Walk", ticketInfo: "เข้าฟรีทุกจุด", interested: 610, going: 140,
  },
  {
    id: "e-yoga", slug: "morning-yoga-park", title: "โยคะเช้าสวนสาธารณะ", category: "community", tone: "jade",
    summary: "เริ่มวันใหม่ด้วยโยคะเบา ๆ กับครูอาสา เอาเสื่อมาเอง",
    description: "โยคะกลางแจ้งทุกเสาร์เช้า ครูอาสาพาทำท่าพื้นฐาน เหมาะกับมือใหม่ เสร็จแล้วมีกาแฟฟรีจากร้านพันธมิตร",
    dayOffset: 3, durationDays: 1, startTime: "06:30", endTime: "07:45", venue: "สวนสาธารณะกลางเมือง", address: "ตัวเมืองศรีสะเกษ", price: "ฟรี (บริจาคตามศรัทธา)",
    organizer: "กลุ่มโยคะเมืองศรีฯ", contact: "FB: Yoga Sisaket", ticketInfo: "ไม่ต้องลงทะเบียน", interested: 240, going: 67,
  },
  {
    id: "e-culture", slug: "culture-night-khmer", title: "ค่ำคืนวัฒนธรรมเขมร กูย เยอ", category: "culture", tone: "plum",
    summary: "การแสดงและอาหารจากชาติพันธุ์หลากหลายของศรีสะเกษ",
    description: "ค่ำคืนที่รวมการแสดงดนตรีพื้นบ้าน การร่ายรำ และอาหารจากชุมชนเขมร กูย เยอ ลาว ของศรีสะเกษ พร้อมเวทีเล่าประวัติศาสตร์สั้น ๆ จากผู้อาวุโส",
    dayOffset: 11, durationDays: 1, startTime: "17:30", endTime: "21:30", venue: "ลานวัฒนธรรมจังหวัด", address: "ตัวเมืองศรีสะเกษ", price: "เข้าฟรี",
    organizer: "สภาวัฒนธรรมจังหวัดศรีสะเกษ", contact: "โทร 045-000-707", ticketInfo: "เข้าฟรี ที่นั่งจำกัดโซนหน้าเวที", interested: 530, going: 190,
  },
  {
    id: "e-festival", slug: "durian-rambutan-fair", title: "เทศกาลผลไม้ศรีสะเกษ ทุเรียน เงาะ มังคุด", category: "festival", tone: "laterite",
    summary: "ตลาดผลไม้ตรงจากสวน ประกวดผลผลิต และเวทีดนตรีกลางคืน",
    description: "งานประจำปีของเกษตรกร รวมผลไม้ตรงจากสวนราคาหน้าสวน ประกวดผลผลิต ซุ้มแปรรูป และการแสดงกลางคืน เหมาะกับครอบครัวและคนรักผลไม้",
    dayOffset: 14, durationDays: 4, startTime: "09:00", endTime: "22:00", venue: "ลานงานแสดงสินค้า", address: "อ.กันทรลักษ์", price: "เข้าฟรี",
    organizer: "เกษตรจังหวัดศรีสะเกษ", contact: "โทร 045-000-808", ticketInfo: "เข้าฟรี", interested: 3180, going: 1240,
  },
  {
    id: "e-tech", slug: "sise-meetup-1", title: "SISE Meetup #1 — คนทำงานรีโมตในศรีสะเกษ", category: "community", tone: "ink",
    summary: "พบปะคนทำงานออนไลน์ ฟรีแลนซ์ และเจ้าของธุรกิจดิจิทัลในเมือง",
    description: "ครั้งแรกของ SISE Meetup แลกเปลี่ยนประสบการณ์ทำงานรีโมต ปักหมุดร้านนั่งทำงาน และเปิดโอกาสร่วมงานกันในเมืองเรา ที่นั่งจำกัด 40 คน",
    dayOffset: 6, durationDays: 1, startTime: "14:00", endTime: "17:00", venue: "ลำดวนคอฟฟี่ ชั้น 2", placeSlug: "lamduan-coffee", address: "ถนนไชยณรงค์", price: "ฟรี รวมกาแฟ 1 แก้ว",
    organizer: "ทีม SISE", contact: "ลงทะเบียนในแอป SISE", ticketInfo: "จองที่นั่งฟรีในแอป", interested: 148, going: 36,
  },
];

export const eventBySlug = (slug: string) => events.find((e) => e.slug === slug);

export const EVENT_CATEGORY_LABEL: Record<SiseEvent["category"], string> = {
  concert: "คอนเสิร์ต",
  festival: "เทศกาล",
  market: "ตลาดนัด",
  sports: "กีฬา",
  workshop: "เวิร์กช็อป",
  exhibition: "นิทรรศการ",
  community: "ชุมชน",
  food: "อาหาร",
  culture: "วัฒนธรรม",
};

export const eventCoversDay = (e: SiseEvent, offset: number) => offset >= e.dayOffset && offset < e.dayOffset + e.durationDays;
