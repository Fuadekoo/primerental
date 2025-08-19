/*
  Warnings:

  - Added the required column `photo` to the `propertyType` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."propertyType" ADD COLUMN     "photo" TEXT NOT NULL;
