import { PrismaClient, UserRole } from "../../../../generated/prisma";

import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const createAdmin = async (data: any) => {
  const hashedPassword: string = await bcrypt.hash(data.password, 12);

  const userData = {
    email: data.admin.email,
    password: hashedPassword,
    role: UserRole.ADMIN,
  };

  // Check if the email already exists in the database
  const existingUser = await prisma.user.findUnique({
    where: { email: data.admin.email },
  });

  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  const result = await prisma.$transaction(async (tx) => {
    const createdUser = await tx.user.create({ data: userData });

    const createdAdmin = await tx.admin.create({
      data: data.admin,
    });
    return { createdAdmin, createdUser };
  });

  return result;
};

export const userService = {
  createAdmin,
};
