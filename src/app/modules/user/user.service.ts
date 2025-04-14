import { UserRole } from "../../../../generated/prisma";

import bcrypt from "bcrypt";
import { prisma } from "../../../utils/prisma";

const createAdmin = async (data: any) => {
  const hashedPassword: string = await bcrypt.hash(data.password, 12);

  const userData = {
    email: data.admin.email,
    password: hashedPassword,
    role: UserRole.ADMIN,
  };

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
