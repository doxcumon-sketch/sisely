# โมเดลข้อมูล SISE

ชนิดข้อมูลใน `lib/types.ts` ออกแบบให้ map ตรงกับตารางด้านล่าง (ตัวอย่าง Prisma/PostgreSQL)

```prisma
model User {
  id          String   @id @default(cuid())
  handle      String   @unique
  email       String?  @unique
  phone       String?  @unique
  role        Role     @default(MEMBER)           // MEMBER | MODERATOR | ADMIN
  status      UserStatus @default(ACTIVE)         // ACTIVE | SUSPENDED | BANNED
  profile     Profile?
  posts       Post[]
  comments    Comment[]
  createdAt   DateTime @default(now())
}
model Profile { userId String @id; name String; bio String?; area String?; avatarUrl String?; reputation Int @default(0) }

model Room {
  id String @id; slug String @unique; name String; icon String; tone String
  description String; group RoomGroup; isFeatured Boolean @default(false)
  posts Post[]; followers Follow[]
}

model Post {
  id String @id; type PostType; roomId String; authorId String
  title String; body String; status PostStatus @default(PUBLISHED) // PENDING_REVIEW | HIDDEN
  placeId String?; eventId String?; dealId String?; listingId String?
  pinned Boolean @default(false); solved Boolean @default(false)
  viewCount Int; commentCount Int; reactionCount Int; saveCount Int; shareCount Int
  hotScore Float @default(0)   // maintained by a job, see lib/ranking.ts
  fingerprint String           // duplicate detection
  createdAt DateTime @default(now()); updatedAt DateTime @updatedAt
  @@index([roomId, hotScore]) @@index([createdAt])
}
model PostMedia { id String @id; postId String; url String; width Int; height Int; alt String? }
model PollOption { id String @id; postId String; label String; votes Int @default(0) }
model PollVote   { postId String; userId String; optionId String; @@id([postId, userId]) }

model Comment { id String @id; postId String; parentId String?; authorId String; body String; likeCount Int; isBest Boolean @default(false); status ContentStatus }
model Reaction { userId String; targetType TargetType; targetId String; kind ReactionKind; @@id([userId, targetType, targetId]) }
model Follow   { followerId String; targetType FollowTarget; targetId String; @@id([followerId, targetType, targetId]) } // USER | ROOM | PLACE | EVENT
model Save     { userId String; targetType SaveTarget; targetId String; createdAt DateTime; @@id([userId, targetType, targetId]) }

model Place { id String @id; slug String @unique; name String; category PlaceCategory; lat Float; lng Float; address String; district String
              hours Json; phone String?; social Json?; priceLevel Int; ratingAvg Float; ratingCount Int; businessId String? }
model Business { id String @id; slug String @unique; name String; ownerId String; plan Plan @default(FREE); verifiedAt DateTime?; planUntil DateTime? }
model Event { id String @id; slug String @unique; title String; category EventCategory; startsAt DateTime; endsAt DateTime; venue String; placeId String?; price String; organizerId String; interestedCount Int }
model Deal  { id String @id; businessId String; title String; discount String; endsAt DateTime; claimedCount Int; sponsored Boolean @default(false) }
model MarketplaceListing { id String @id; sellerId String; title String; category ListingCategory; price Int; condition Condition; location String; status ListingStatus; promotedUntil DateTime? }

model Notification { id String @id; userId String; kind NotificationKind; actorId String?; href String; readAt DateTime?; createdAt DateTime }
model Report { id String @id; reporterId String; targetType TargetType; targetId String; reason ReportReason; note String?; status ReportStatus @default(OPEN) }
model ModerationAction { id String @id; moderatorId String; reportId String?; targetType TargetType; targetId String; action ModAction; reason String; createdAt DateTime } // HIDE | WARN | SUSPEND | BAN | RESTORE
model Block { blockerId String; blockedId String; @@id([blockerId, blockedId]) }
```

## ความสัมพันธ์หลัก

- **Room 1—N Post**, **Post 1—N Comment** (ตอบกลับ 1 ระดับผ่าน `parentId`)
- **Place/Event/Deal/Listing 0..1—N Post** — โพสต์ชุมชนผูกกับสถานที่/งานได้ ทำให้หน้าสถานที่เป็น "โปรไฟล์ + ชุมชน"
- **Business 1—N Place/Deal**, ผู้ใช้ผูกกับธุรกิจผ่าน `ownerId`
- **Follow / Save** เป็นตาราง polymorphic เดียวกัน ใช้ขับ "สำหรับคุณ"

## Trending และ For You

`lib/ranking.ts`: คะแนน = (ความเห็น×4 + แชร์×5 + บันทึก×3 + ถูกใจ×1 + วิว×0.05 + velocity ชั่วโมงล่าสุด×6) ÷ (อายุชม.+2)^1.25 × โบนัสห้องที่คึกคัก
For You = trending × (1 + ห้องที่ติดตาม 0.6 + ผู้ใช้ที่ติดตาม 0.5 + สถานที่ที่บันทึก 0.4 + หัวข้อที่เปิดดู 0.25) และตัดผู้ใช้ที่บล็อก
ใน production ให้คำนวณ `hotScore` ด้วย job ทุก 1–5 นาที แล้วสั่ง `ORDER BY hotScore`

## โมเดลรายได้ (เตรียมโครงสร้าง ยังไม่เปิดใช้)

| ระดับ | ได้อะไร |
|---|---|
| FREE | โปรไฟล์ธุรกิจ + ดีล 2 รายการ/เดือน |
| PRO | ดีลไม่จำกัด สถิติ ปักหมุดโพสต์ |
| FEATURED | ขึ้นแถบแนะนำใน Discover/หน้าแรก (ติดป้าย "แนะนำ") |
| SPONSORED | โพสต์/ดีลสปอนเซอร์ในฟีดจำกัดความถี่ ติดป้าย "สปอนเซอร์" เสมอ |

เพิ่มเติม: โปรโมตงาน/ประกาศซื้อขาย, ค่าคอมมิชชันการจอง, ฟีเจอร์พรีเมียมสำหรับสมาชิก
กฎ: ชุมชนต้องใช้งานได้เต็มที่โดยไม่ต้องจ่าย และโฆษณาไม่แทรกกลางบทสนทนา
