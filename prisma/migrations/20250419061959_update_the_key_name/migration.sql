/*
  Warnings:

  - You are about to drop the column `optToken` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "optToken",
ADD COLUMN     "otpToken" TEXT;
