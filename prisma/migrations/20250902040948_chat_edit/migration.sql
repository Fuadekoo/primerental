/*
  Warnings:

  - You are about to drop the column `guestId` on the `chat` table. All the data in the column will be lost.
  - You are about to drop the column `message` on the `chat` table. All the data in the column will be lost.
  - You are about to drop the column `senderRole` on the `chat` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `chat` table. All the data in the column will be lost.
  - Added the required column `msg` to the `chat` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."chat" DROP CONSTRAINT "chat_guestId_fkey";

-- DropForeignKey
ALTER TABLE "public"."chat" DROP CONSTRAINT "chat_userId_fkey";

-- DropIndex
DROP INDEX "public"."chat_userId_guestId_idx";

-- AlterTable
ALTER TABLE "public"."chat" DROP COLUMN "guestId",
DROP COLUMN "message",
DROP COLUMN "senderRole",
DROP COLUMN "userId",
ADD COLUMN     "fromGuestId" TEXT,
ADD COLUMN     "fromUserId" TEXT,
ADD COLUMN     "msg" TEXT NOT NULL,
ADD COLUMN     "toGuestId" TEXT,
ADD COLUMN     "toUserId" TEXT;

-- CreateIndex
CREATE INDEX "chat_fromUserId_toUserId_idx" ON "public"."chat"("fromUserId", "toUserId");

-- CreateIndex
CREATE INDEX "chat_fromGuestId_toGuestId_idx" ON "public"."chat"("fromGuestId", "toGuestId");

-- AddForeignKey
ALTER TABLE "public"."chat" ADD CONSTRAINT "chat_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chat" ADD CONSTRAINT "chat_fromGuestId_fkey" FOREIGN KEY ("fromGuestId") REFERENCES "public"."guest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chat" ADD CONSTRAINT "chat_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chat" ADD CONSTRAINT "chat_toGuestId_fkey" FOREIGN KEY ("toGuestId") REFERENCES "public"."guest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
