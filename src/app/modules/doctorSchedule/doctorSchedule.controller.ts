import { sendResponse } from "../../utils/sendResponse";
import { tryCatchAsync } from "../../utils/tryCatchAsync";

import httpStatus from "http-status";
import { doctorScheduleService } from "./doctorSchedule.service";
import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";
import { pick } from "../../utils/pick";
import { paginationProperties } from "../../constant/pagination";
import { validSearchableFields } from "./doctorSchedule.constant";

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
const getAll = tryCatchAsync(
  async (req: Request & { user?: JwtPayload }, res) => {
    const filteredQuery = pick(req.query, validSearchableFields);
    const pagination = pick(req.query, paginationProperties);
    const result = await doctorScheduleService.getAll(
      filteredQuery,
      pagination,
      req.user
    );

    sendResponse({
      res,
      sendData: {
        statusCode: httpStatus.OK,
        success: true,
        message: "All Doctor schedule retrieved successfully",
        data: result,
      },
    });
  }
);

//delete single doctor schedule
const deleteDocSchedule = tryCatchAsync(
  async (req: Request & { user?: JwtPayload }, res) => {
    const result = await doctorScheduleService.deleteDocSchedule(
      req.user,
      req.params.id
    );

    sendResponse({
      res,
      sendData: {
        statusCode: httpStatus.OK,
        success: true,
        message: "Doctor schedule deleted successfully",
        data: result,
      },
    });
  }
);

export const doctorScheduleController = {
  create,
  getAll,
  deleteDocSchedule,
};
