-- AlterTable
ALTER TABLE "admins" ALTER COLUMN "profilePhoto" DROP NOT NULL,
ALTER COLUMN "isDeleted" SET DEFAULT false,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "updatedAt" DROP DEFAULT;
