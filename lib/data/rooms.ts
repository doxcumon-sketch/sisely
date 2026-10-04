import type { Room } from "@/lib/types";

export const rooms: Room[] = [
  { id: "r-sisaket", slug: "sisaket", name: "ห้องศรีสะเกษ", icon: "flame", tone: "gold", tagline: "ทุกเรื่องของเมืองเรา", description: "ห้องกลางของคนศรีสะเกษ ข่าวสาร เรื่องราว และสิ่งที่ทุกคนควรรู้ในเมืองนี้", members: 8420, posts: 3120, trending: true, group: "city" },
  { id: "r-talk", slug: "talk", name: "ห้องพูดคุย", icon: "talk", tone: "jade", tagline: "นั่งคุยกันสบาย ๆ", description: "เรื่องทั่วไป ความคิดเห็น เรื่องเล่า และคำถามชวนคุยแบบไม่มีสาระก็ได้", members: 6120, posts: 4210, trending: true, group: "city" },
  { id: "r-food", slug: "food", name: "กินอะไรดี", icon: "food", tone: "laterite", tagline: "ร้านเด็ด ของอร่อย", description: "ถามหา แนะนำ และรีวิวร้านอาหารในศรีสะเกษ ตั้งแต่ตลาดเช้าถึงร้านเปิดดึก", members: 7310, posts: 2890, trending: true, group: "city" },
  { id: "r-cafe", slug: "cafe", name: "ห้องคาเฟ่", icon: "cafe", tone: "gold", tagline: "นั่งชิล นั่งทำงาน", description: "คาเฟ่น่านั่ง ร้านที่มีปลั๊ก ร้านเงียบ ๆ ร้านถ่ายรูปสวย", members: 4980, posts: 1730, trending: true, group: "city" },
  { id: "r-events", slug: "events", name: "ห้อง Events", icon: "events", tone: "plum", tagline: "วันนี้มีอะไร", description: "งานดนตรี ตลาดนัด เทศกาล และกิจกรรมในเมือง ใครไปมาแล้วมารีวิวกัน", members: 5410, posts: 1210, trending: true, group: "city" },
  { id: "r-business", slug: "business", name: "ธุรกิจศรีสะเกษ", icon: "business", tone: "ink", tagline: "คนทำธุรกิจท้องถิ่น", description: "แลกเปลี่ยนเรื่องทำธุรกิจ หาพาร์ตเนอร์ โปรโมตร้านแบบไม่รบกวน", members: 2760, posts: 640, group: "money" },
  { id: "r-home", slug: "home", name: "บ้านและที่อยู่อาศัย", icon: "home", tone: "sky", tagline: "บ้าน ที่ดิน ห้องเช่า", description: "หาบ้าน หาห้องเช่า ถามช่าง ต่อเติม รีโนเวต", members: 3340, posts: 880, group: "life" },
  { id: "r-cars", slug: "cars", name: "ห้องรถ", icon: "car", tone: "laterite", tagline: "รถ มอเตอร์ไซค์ อู่ซ่อม", description: "ปรึกษาเรื่องรถ ร้านซ่อม ซื้อขายรถ และเส้นทางขับรถเที่ยว", members: 3980, posts: 1420, group: "interest" },
  { id: "r-tech", slug: "tech", name: "ห้องไอที", icon: "tech", tone: "indigo", tagline: "ไอที ไอทีไม่ยาก", description: "มือถือ คอมพิวเตอร์ อินเทอร์เน็ตบ้าน และงานสายดิจิทัลในเมือง", members: 2210, posts: 560, group: "interest" },
  { id: "r-edu", slug: "education", name: "ห้องการเรียน", icon: "education", tone: "sky", tagline: "เรียน สอบ ติว", description: "แลกเปลี่ยนเรื่องเรียน สอบเข้า ทุน และที่อ่านหนังสือ", members: 3120, posts: 970, group: "life" },
  { id: "r-jobs", slug: "jobs", name: "ห้องงาน", icon: "jobs", tone: "jade", tagline: "หางาน หาคน", description: "ประกาศงานในพื้นที่ ฝึกงาน ฟรีแลนซ์ และเคล็ดลับสมัครงาน", members: 4620, posts: 1530, group: "money" },
  { id: "r-market", slug: "market", name: "ห้องซื้อขาย", icon: "market", tone: "gold", tagline: "ของดี ของมือสอง", description: "ซื้อขายของมือสอง สินค้าท้องถิ่น และบริการ มีกฎชัดเจนกันโกง", members: 5870, posts: 3410, group: "money" },
  { id: "r-love", slug: "relationship", name: "ความสัมพันธ์", icon: "heart", tone: "plum", tagline: "คุยเรื่องหัวใจ", description: "ปรึกษาเรื่องคนรัก ครอบครัว เพื่อน อย่างให้เกียรติกัน", members: 2890, posts: 760, group: "life" },
  { id: "r-pets", slug: "pets", name: "ห้องสัตว์เลี้ยง", icon: "pets", tone: "laterite", tagline: "น้องหมา น้องแมว", description: "ถามสัตวแพทย์ ฝากเลี้ยง หาบ้านให้น้อง และอวดความน่ารัก", members: 2540, posts: 1120, group: "life" },
  { id: "r-photo", slug: "photography", name: "ห้องถ่ายรูป", icon: "photo", tone: "plum", tagline: "มุมสวยในเมือง", description: "แชร์ภาพ สถานที่ถ่ายรูป และเทคนิคจากช่างภาพท้องถิ่น", members: 1980, posts: 540, group: "interest" },
  { id: "r-travel", slug: "travel", name: "ห้องเที่ยว", icon: "travel", tone: "jade", tagline: "เที่ยวศรีสะเกษ", description: "ที่เที่ยว ที่พัก เส้นทางทริป และคำแนะนำจากคนพื้นที่", members: 4210, posts: 980, group: "city" },
  { id: "r-agri", slug: "agriculture", name: "ห้องเกษตร", icon: "agri", tone: "jade", tagline: "ทุเรียน หอมแดง ข้าว", description: "เกษตรกรศรีสะเกษแลกเปลี่ยนความรู้ ราคาตลาด และปัญหาหน้าสวน", members: 3670, posts: 1010, group: "interest" },
  { id: "r-movies", slug: "movies", name: "ห้องหนัง", icon: "movie", tone: "plum", tagline: "ดูเรื่องอะไรดี ปรึกษากันได้", description: "ปรึกษาว่าสัปดาห์นี้ดูเรื่องอะไรดี รีวิวแบบไม่สปอยล์ ซีรีส์ อนิเมะ โรงหนังและรอบฉายในศรีสะเกษ ชวนเพื่อนไปดูด้วยกัน", members: 0, posts: 0, trending: true, group: "interest" },
  { id: "r-games", slug: "games", name: "ห้องเกม", icon: "games", tone: "indigo", tagline: "เกมและอีสปอร์ต", description: "หาเพื่อนเล่นเกม ร้านเน็ต แข่งในเมือง", members: 1840, posts: 430, group: "interest" },
  { id: "r-art", slug: "culture", name: "ศิลปะและวัฒนธรรม", icon: "art", tone: "plum", tagline: "ผ้าไหม ดนตรีพื้นบ้าน ภาษาถิ่น", description: "เรื่องราวมรดกวัฒนธรรมของศรีสะเกษ ผ้าไหม เขมร กูย เยอ ลาว", members: 1620, posts: 380, group: "interest" },
  { id: "r-news", slug: "news", name: "ข่าวท้องถิ่น", icon: "news", tone: "ink", tagline: "ข่าวเล็กในเมือง", description: "ประกาศ ข่าวด่วนในพื้นที่ ถนนปิด ไฟดับ น้ำท่วม ตรวจสอบก่อนแชร์", members: 5120, posts: 740, group: "city" },
  { id: "r-qa", slug: "qa", name: "ห้องถามตอบ", icon: "qa", tone: "gold", tagline: "สงสัยอะไร ถามได้เลย", description: "ถามอะไรก็ได้เกี่ยวกับชีวิตในศรีสะเกษ คนในพื้นที่ช่วยตอบ", members: 6430, posts: 3980, trending: true, group: "city" },
  { id: "r-community", slug: "community", name: "ห้องชุมชน", icon: "community", tone: "jade", tagline: "ช่วยเหลือกัน", description: "ขอความช่วยเหลือ จิตอาสา บริจาค และประกาศชุมชน", members: 3240, posts: 690, group: "city" },
];

export const roomBySlug = (slug: string) => rooms.find((r) => r.slug === slug);

export const ROOM_GROUPS: { key: Room["group"]; label: string }[] = [
  { key: "city", label: "เมืองของเรา" },
  { key: "life", label: "ชีวิตประจำวัน" },
  { key: "money", label: "งานและการค้า" },
  { key: "interest", label: "ความสนใจ" },
];
