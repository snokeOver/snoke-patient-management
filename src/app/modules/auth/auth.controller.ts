import { access } from "fs";
import config from "../../config";
import { sendResponse } from "../../utils/sendResponse";
import { tryCatchAsync } from "../../utils/tryCatchAsync";
import { authService } from "./auth.service";
import httpStatus from "http-status";
import { Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";

//Login user
const loginUser = tryCatchAsync(async (req, res) => {
  const result = await authService.loginUser(req.body, req.body.clientInfo);

  const { refreshToken, accessToken } = result;

  res.cookie("refreshToken", refreshToken, {
    secure: config.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "strict",
  });

  sendResponse({
    res,
    sendData: {
      statusCode: httpStatus.OK,
      success: true,
      message: "Logged in successfully",
      data: { accessToken, refreshToken },
    },
  });
});

//Get access token
const getAccessToken = tryCatchAsync(async (req, res) => {
  const result = await authService.getAccessToken(
    req.headers.authorization as string
  );

  sendResponse({
    res,
    sendData: {
      statusCode: httpStatus.OK,
      success: true,
      message: "Access token retrieve successfully",
      data: result,
    },
  });
});

//Change password
const changePassword = tryCatchAsync(
  async (req: Request & { user?: JwtPayload }, res: Response) => {
    const result = await authService.changePassword(req.user, req.body);

    sendResponse({
      res,
      sendData: {
        statusCode: httpStatus.OK,
        success: true,
        message: "Password changed successfully",
        data: result,
      },
    });
  }
);

//Forger password
const forgetPassword = tryCatchAsync(async (req, res) => {
  const result = await authService.forgetPassword(req.body);

  sendResponse({
    res,
    sendData: {
      statusCode: httpStatus.OK,
      success: true,
      message: "OTP send successfully",
      data: result,
    },
  });
});

//verify otp
const verifyOTP = tryCatchAsync(async (req, res) => {
  const result = await authService.verifyOTP(req.body);

  sendResponse({
    res,
    sendData: {
      statusCode: httpStatus.OK,
      success: true,
      message: "OTP verified successfully",
      data: result,
    },
  });
});

//Reset password
const resetPassword = tryCatchAsync(async (req, res) => {
  const result = await authService.resetPassword(
    req.headers.authorization,
    req.body
  );

  sendResponse({
    res,
    sendData: {
      statusCode: httpStatus.OK,
      success: true,
      message: "Password reset successfully",
      data: result,
    },
  });
});

export const authController = {
  loginUser,
  getAccessToken,
  changePassword,
  forgetPassword,
  verifyOTP,
  resetPassword,
};
