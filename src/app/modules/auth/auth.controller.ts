import { access } from "fs";
import config from "../../config";
import { sendResponse } from "../../utils/sendResponse";
import { tryCatchAsync } from "../../utils/tryCatchAsync";
import { authService } from "./auth.service";
import httpStatus from "http-status";

//Login user
const loginUser = tryCatchAsync(async (req, res) => {
  const result = await authService.loginUser(req.body);

  const { refreshToken } = result;

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
      data: result,
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

export const authController = {
  loginUser,
  getAccessToken,
};
