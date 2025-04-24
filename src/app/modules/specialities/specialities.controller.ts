import config from "../../config";
import { sendResponse } from "../../utils/sendResponse";
import { tryCatchAsync } from "../../utils/tryCatchAsync";

import httpStatus from "http-status";
import { Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { specialitiesService } from "./specialities.service";

//Create specialities
const createSpecialities = tryCatchAsync(async (req, res) => {
  const result = await specialitiesService.createSpecialities(
    req.body.data,
    req.file
  );

  sendResponse({
    res,
    sendData: {
      statusCode: httpStatus.OK,
      success: true,
      message: "Doctor specialities created successfully",
      data: result,
    },
  });
});

//get all specialities
const getAllSpecialities = tryCatchAsync(async (req, res) => {
  const result = await specialitiesService.getAllSpecialities();

  sendResponse({
    res,
    sendData: {
      statusCode: httpStatus.OK,
      success: true,
      message: "All specialities retrieved successfully",
      data: result,
    },
  });
});

export const specialitiesController = {
  createSpecialities,
  getAllSpecialities,
};
