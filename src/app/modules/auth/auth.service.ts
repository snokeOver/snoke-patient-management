import config from "../../config";
import AppError from "../../middleWares/errorHandler/appError";
import { prisma } from "../../utils/prisma";
import { IJwtPayload, ILoginCred } from "./auth.interface";
import bcrypt from "bcrypt";
import httpStatus from "http-status";
import { createToken, verifyToken } from "./auth.utils";
import { JwtPayload, Secret } from "jsonwebtoken";
import { UserStatus } from "../../../../generated/prisma";

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
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string
  );

  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in as string
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
    decodedData = verifyToken(token, config.jwt_refresh_secret as Secret);
  } catch (err) {
    throw new AppError(httpStatus.FORBIDDEN, "Invalid Refresh Token");
  }

  const foundUser = await prisma.user.findUnique({
    where: {
      email: decodedData.email,
      status: "ACTIVE",
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
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string
  );

  return {
    accessToken,
  };
};

export const authService = {
  loginUser,
  getAccessToken,
};
