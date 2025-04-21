import { userService } from "./user.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { tryCatchAsync } from "../../utils/tryCatchAsync";

const createAdmin = tryCatchAsync(async (req, res) => {
  const result = await userService.createAdmin(
    req.body.data,
    req.body.clientInfo,
    req.file
  );

  sendResponse({
    res,
    sendData: {
      statusCode: httpStatus.OK,
      success: true,
      message: "Admin created successfully",
      data: result,
    },
  });
});

export const userController = {
  createAdmin,
};
