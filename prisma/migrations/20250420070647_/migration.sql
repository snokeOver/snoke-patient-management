/*
  Warnings:

  - You are about to drop the `security_detials` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "devices" DROP CONSTRAINT "devices_securityDetailsId_fkey";

-- DropForeignKey
ALTER TABLE "security_detials" DROP CONSTRAINT "security_detials_userId_fkey";

-- DropTable
DROP TABLE "security_detials";

-- CreateTable
CREATE TABLE "security_details" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "otpToken" TEXT,
    "resetAttemptNumber" INTEGER NOT NULL DEFAULT 0,
    "lastResetAttemptTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "failedLoginAttemptNumber" INTEGER NOT NULL DEFAULT 0,
    "lastLoginTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "blockedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "security_details_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "security_details_userId_key" ON "security_details"("userId");

-- CreateIndex
CREATE INDEX "security_details_userId_idx" ON "security_details"("userId");

-- AddForeignKey
ALTER TABLE "security_details" ADD CONSTRAINT "security_details_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devices" ADD CONSTRAINT "devices_securityDetailsId_fkey" FOREIGN KEY ("securityDetailsId") REFERENCES "security_details"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
