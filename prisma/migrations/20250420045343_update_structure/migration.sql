/*
  Warnings:

  - You are about to drop the column `otpToken` on the `users` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "DeviceType" AS ENUM ('MOBILE', 'DESKTOP', 'TABLET', 'OTHER');

-- AlterEnum
ALTER TYPE "UserStatus" ADD VALUE 'SUSPENDED';

-- AlterTable
ALTER TABLE "users" DROP COLUMN "otpToken";

-- CreateTable
CREATE TABLE "security_detials" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "otpToken" TEXT,
    "resetAttemptNumber" INTEGER NOT NULL DEFAULT 0,
    "lastResetAttemptTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "failedLoginAttemptNumber" INTEGER NOT NULL DEFAULT 0,
    "lastLoginTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "security_detials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "devices" (
    "id" TEXT NOT NULL,
    "securityDetailsId" TEXT NOT NULL,
    "type" "DeviceType" NOT NULL,
    "browser" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "os" TEXT NOT NULL,
    "ip" TEXT,
    "userAgent" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL,
    "isPreferred" BOOLEAN NOT NULL,
    "isInfected" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "devices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "security_detials_userId_key" ON "security_detials"("userId");

-- CreateIndex
CREATE INDEX "security_detials_userId_idx" ON "security_detials"("userId");

-- CreateIndex
CREATE INDEX "devices_securityDetailsId_idx" ON "devices"("securityDetailsId");

-- AddForeignKey
ALTER TABLE "security_detials" ADD CONSTRAINT "security_detials_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devices" ADD CONSTRAINT "devices_securityDetailsId_fkey" FOREIGN KEY ("securityDetailsId") REFERENCES "security_detials"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
