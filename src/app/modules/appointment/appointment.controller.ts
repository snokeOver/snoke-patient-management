import { sendResponse } from "../../utils/sendResponse";
import { tryCatchAsync } from "../../utils/tryCatchAsync";

import httpStatus from "http-status";

import { pick } from "../../utils/pick";
import { validSearchableFields } from "./appointment.constant";
import { paginationProperties } from "../../constant/pagination";
import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";
import { appointmentService } from "./appointment.service";
import { IJwtPayload } from "../../types";

//Create schedule
const create = tryCatchAsync(
  async (req: Request & { user?: IJwtPayload }, res) => {
    const result = await appointmentService.create(req.body, req.user);

    sendResponse({
      res,
      sendData: {
        statusCode: httpStatus.OK,
        success: true,
        message: "Appointment created successfully",
        data: result,
      },
    });
  }
);

//get all schedule
const getAll = tryCatchAsync(
  async (req: Request & { user?: IJwtPayload }, res) => {
    const filteredQuery = pick(req.query, validSearchableFields);
    const pagination = pick(req.query, paginationProperties);
    const result = await appointmentService.getAll(
      filteredQuery,
      pagination,
      req.user
    );

    sendResponse({
      res,
      sendData: {
        statusCode: httpStatus.OK,
        success: true,
        message: "All appointment retrieved successfully",
        data: result,
      },
    });
  }
);

export const appointmentController = {
  create,
  getAll,
};
