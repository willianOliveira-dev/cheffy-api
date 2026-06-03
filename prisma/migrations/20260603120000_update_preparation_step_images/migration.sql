ALTER TABLE "preparation_steps" RENAME COLUMN "mediaUrl" TO "imageUrl";

ALTER TABLE "preparation_steps" ADD COLUMN "imagePublicId" TEXT;

ALTER TABLE "preparation_steps" DROP COLUMN "stepTime";
