-- AlterTable
ALTER TABLE "public"."property" ADD COLUMN     "isDraft" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "isAvailable" SET DEFAULT false;
