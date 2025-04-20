/*
  Warnings:

  - You are about to drop the column `blockedUntil` on the `security_details` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "devices" ADD COLUMN     "machineId" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "security_details" DROP COLUMN "blockedUntil",
ADD COLUMN     "suspendUntil" TIMESTAMP(3);
