import { UserRole } from "../../../../generated/prisma";

import bcrypt from "bcrypt";
import { prisma } from "../../utils/prisma";
import config from "../../config";
import AppError from "../../middleWares/errorHandler/appError";
import httpStatus from "http-status";
import { IAdminUser } from "./user.interface";
import { IClientInfo } from "../../types";

const createAdmin = async (data: IAdminUser, clientInfo: IClientInfo) => {
  const hashedPassword: string = await bcrypt.hash(
    data.password,
    Number(config.jwt.bcrypt_salt_rounds)
  );

  const userData = {
    email: data.admin.email,
    password: hashedPassword,
    role: UserRole.ADMIN,
  };

  const foundUser = await prisma.user.findUnique({
    where: {
      email: data.admin.email,
    },
  });

  if (foundUser) throw new AppError(httpStatus.CONFLICT, "Email already exist");

  const result = await prisma.$transaction(async (tx) => {
    const createdUser = await tx.user.create({ data: userData });

    const createdSecurityDetails = await tx.securityDetails.create({
      data: {
        userId: createdUser.id,
        ...clientInfo.securityDetails,
      },
    });

    const createdDevice = await tx.device.create({
      data: {
        securityDetailsId: createdSecurityDetails.id, // Link device to security details
        ...clientInfo.device, // Spread the device data
      },
    });

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
