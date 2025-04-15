import AppError from "../../middleWares/errorHandler/appError";
import { prisma } from "../../utils/prisma";
import { ILoginCred } from "./auth.interface";
import bcrypt from "bcrypt";
import httpStatus from "http-status";

const loginUser = async (payload: ILoginCred) => {
  const foundUser = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
    },
  });

  const isPasswordMatched = await bcrypt.compare(
    payload.password,
    foundUser.password
  );

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid credentials!");
  }
  console.log(payload);

  return foundUser;
};

export const authService = {
  loginUser,
};
