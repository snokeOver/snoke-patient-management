import { sendResponse } from "../../utils/sendResponse";
import { tryCatchAsync } from "../../utils/tryCatchAsync";

import httpStatus from "http-status";
import { scheduleService } from "./schedule.service";
import { pick } from "../../utils/pick";
import { validSearchableFields } from "./schedule.constant";
import { paginationProperties } from "../../constant/pagination";
import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";

//Create schedule
const create = tryCatchAsync(async (req, res) => {
  const result = await scheduleService.create(req.body);

  sendResponse({
    res,
    sendData: {
      statusCode: httpStatus.OK,
      success: true,
      message: "Schedule created successfully",
      data: result,
    },
  });
});

//get all schedule
const getAll = tryCatchAsync(
  async (req: Request & { user?: JwtPayload }, res) => {
    const filteredQuery = pick(req.query, validSearchableFields);
    const pagination = pick(req.query, paginationProperties);
    const result = await scheduleService.getAll(
      filteredQuery,
      pagination,
      req.user
    );

    sendResponse({
      res,
      sendData: {
        statusCode: httpStatus.OK,
        success: true,
        message: "All schedule retrieved successfully",
        data: result,
      },
    });
  }
);

export const scheduleController = {
  create,
  getAll,
};
