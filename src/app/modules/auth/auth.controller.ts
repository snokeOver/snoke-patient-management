import { sendResponse } from "../../utils/sendResponse";
import { tryCatchAsync } from "../../utils/tryCatchAsync";
import { authService } from "./auth.service";
import httpStatus from "http-status";

//Login user
const loginUser = tryCatchAsync(async (req, res) => {
  const result = await authService.loginUser(req.body);

  sendResponse({
    res,
    sendData: {
      statusCode: httpStatus.OK,
      success: true,
      message: "User logged in successfully",
      data: result,
    },
  });
});

export const authController = {
  loginUser,
};
