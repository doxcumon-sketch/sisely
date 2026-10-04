-- Profile customisation: own avatar, cover artwork and contact links
ALTER TABLE "User" ADD COLUMN "avatarCustom" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "coverScene" TEXT;
ALTER TABLE "User" ADD COLUMN "links" JSONB;
