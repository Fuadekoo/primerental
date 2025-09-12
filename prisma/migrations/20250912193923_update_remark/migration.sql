/*
  Warnings:

  - You are about to drop the column `remark` on the `chat` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."chat" DROP COLUMN "remark";

-- AlterTable
ALTER TABLE "public"."guest" ADD COLUMN     "remark" TEXT;
