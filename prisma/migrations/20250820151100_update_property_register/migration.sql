/*
  Warnings:

  - You are about to drop the column `propertyId` on the `propertyRegistration` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `propertyRegistration` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `propertyRegistration` table. All the data in the column will be lost.
  - Added the required column `description` to the `propertyRegistration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fullname` to the `propertyRegistration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `location` to the `propertyRegistration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `propertyRegistration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `propertyType` to the `propertyRegistration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `realLocation` to the `propertyRegistration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `propertyRegistration` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."propertyRegistration" DROP COLUMN "propertyId",
DROP COLUMN "status",
DROP COLUMN "userId",
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "fullname" TEXT NOT NULL,
ADD COLUMN     "isVisit" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "location" TEXT NOT NULL,
ADD COLUMN     "phone" INTEGER NOT NULL,
ADD COLUMN     "propertyType" TEXT NOT NULL,
ADD COLUMN     "realLocation" TEXT NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL;
