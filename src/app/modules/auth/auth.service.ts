import config from "../../config";
import AppError from "../../middleWares/errorHandler/appError";
import { prisma } from "../../utils/prisma";
import { ILoginCred } from "./auth.interface";
import bcrypt from "bcrypt";
import httpStatus from "http-status";

import { JwtPayload, Secret } from "jsonwebtoken";
import { UserStatus } from "../../../../generated/prisma";
import { IJwtPayload } from "../../types";
import { createOtpToken, createToken, verifyToken } from "../../utils/jwtToken";
import { generateOtp } from "../../utils/generateOtp";

//Login user with email and password
const loginUser = async (payload: ILoginCred) => {
  const foundUser = await prisma.user.findUnique({
    where: {
      email: payload.email,
      status: UserStatus.ACTIVE,
    },
  });

  if (!foundUser) throw new AppError(httpStatus.NOT_FOUND, "User not found");

  if (!(await bcrypt.compare(payload.password, foundUser.password))) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid credentials!");
  }

  const jwtPayload: IJwtPayload = {
    userId: foundUser.id as string,
    email: foundUser.email as string,
    status: foundUser.status,
    role: foundUser.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt.jwt_access_secret as string,
    config.jwt.jwt_access_expires_in as string
  );

  const refreshToken = createToken(
    jwtPayload,
    config.jwt.jwt_refresh_secret as string,
    config.jwt.jwt_refresh_expires_in as string
  );

  return {
    accessToken,
    refreshToken,
  };
};

//Get access token
const getAccessToken = async (token: string) => {
  let decodedData: JwtPayload | null = null;
  try {
    decodedData = verifyToken(token, config.jwt.jwt_refresh_secret as Secret);
  } catch (err) {
    throw new AppError(httpStatus.FORBIDDEN, "Invalid Refresh Token");
  }

  const foundUser = await prisma.user.findUnique({
    where: {
      email: decodedData.email,
      status: UserStatus.ACTIVE,
    },
  });

  if (!foundUser) throw new AppError(httpStatus.NOT_FOUND, "User not found");

  const jwtPayload: IJwtPayload = {
    userId: foundUser.id as string,
    email: foundUser.email as string,
    status: foundUser.status,
    role: foundUser.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt.jwt_access_secret as string,
    config.jwt.jwt_access_expires_in as string
  );

  return {
    accessToken,
  };
};

//Change password
const changePassword = async (
  userData: JwtPayload | undefined,
  payload: { oldPassword: string; newPassword: string }
) => {
  //destructure data
  const { oldPassword, newPassword } = payload;

  if (!userData)
    throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized!");

  const { userId } = userData;

  //check if user exist and password is correct
  const foundUser = await prisma.user.findUnique({
    where: {
      id: userId,
      status: UserStatus.ACTIVE,
    },
  });

  if (!foundUser) throw new AppError(httpStatus.NOT_FOUND, "User not found");

  if (!(await bcrypt.compare(oldPassword, foundUser.password))) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Old password is incorrect!");
  }

  //hash new password and update
  const hashedNewPassword: string = await bcrypt.hash(
    newPassword,
    Number(config.jwt.bcrypt_salt_rounds)
  );

  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      password: hashedNewPassword,
      needPasswordChange: false,
    },
  });

  if (!updatedUser) throw new AppError(httpStatus.NOT_FOUND, "User not found");

  return { message: "Password changed successfully" };
};

//Forget password
const forgetPassword = async (payload: { email: string }) => {
  //destructure data

  //check if user exist and password is correct
  const foundUser = await prisma.user.findUnique({
    where: {
      email: payload.email,
      status: UserStatus.ACTIVE,
    },
  });

  if (!foundUser) throw new AppError(httpStatus.NOT_FOUND, "User not found");

  const otp = generateOtp();

  const otpToken = createOtpToken(
    {
      otp,
      email: foundUser.email as string,
    },
    config.jwt.jwt_access_secret as Secret,
    config.jwt.jwt_access_expires_in as string
  );

  const updatedUser = await prisma.user.update({
    where: {
      id: foundUser.id,
    },
    data: {
      otpToken,
    },
  });

  const resetPssLink = `${config.client_url}/reset-password?token=${otpToken}`;
  console.log(resetPssLink);

  return { message: "Password changed successfully" };
};

export const authService = {
  loginUser,
  getAccessToken,
  changePassword,
  forgetPassword,
};
