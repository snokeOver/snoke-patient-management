import { Request, Response } from "express";
import { userService } from "./user.service";
import { sendResponse } from "../../../utils/sendResponse";
import httpStatus from "http-status";

const createAdmin = async (req: Request, res: Response) => {
  try {
    const result = await userService.createAdmin(req.body);

    sendResponse({
      res,
      sendData: {
        statusCode: httpStatus.OK,
        success: true,
        message: "Admin created successfully",
        data: result,
      },
    });
  } catch (error: any) {
    sendResponse({
      res,
      sendData: {
        statusCode: httpStatus.INTERNAL_SERVER_ERROR,
        success: false,
        message:
          error.name || "Some error occurred while creating the single Admin.",
        error: error,
      },
    });
  }
};

export const userController = {
  createAdmin,
};
