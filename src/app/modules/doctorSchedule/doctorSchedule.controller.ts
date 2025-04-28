import { sendResponse } from "../../utils/sendResponse";
import { tryCatchAsync } from "../../utils/tryCatchAsync";

import httpStatus from "http-status";
import { doctorScheduleService } from "./doctorSchedule.service";
import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";

//Create doctor schedule
const create = tryCatchAsync(
  async (req: Request & { user?: JwtPayload }, res) => {
    const result = await doctorScheduleService.create(req.body, req.user);

    sendResponse({
      res,
      sendData: {
        statusCode: httpStatus.OK,
        success: true,
        message: "Doctor Schedule created successfully",
        data: result,
      },
    });
  }
);

//get all doctor schedule
const getAll = tryCatchAsync(async (req, res) => {
  const result = await doctorScheduleService.getAll();

  sendResponse({
    res,
    sendData: {
      statusCode: httpStatus.OK,
      success: true,
      message: "All doctor schedule retrieved successfully",
      data: result,
    },
  });
});

export const doctorScheduleController = {
  create,
  getAll,
};
