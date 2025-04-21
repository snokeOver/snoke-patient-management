import { userService } from "./user.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { tryCatchAsync } from "../../utils/tryCatchAsync";

//Create admin
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

//Create doctor
const createDoctor = tryCatchAsync(async (req, res) => {
  const result = await userService.createDoctor(
    req.body.data,
    req.body.clientInfo,
    req.file
  );

  sendResponse({
    res,
    sendData: {
      statusCode: httpStatus.OK,
      success: true,
      message: "Doctor created successfully",
      data: result,
    },
  });
});

//Create patient
const createPatient = tryCatchAsync(async (req, res) => {
  const result = await userService.createPatient(
    req.body.data,
    req.body.clientInfo,
    req.file
  );

  sendResponse({
    res,
    sendData: {
      statusCode: httpStatus.OK,
      success: true,
      message: "Patient created successfully",
      data: result,
    },
  });
});

export const userController = {
  createAdmin,
  createDoctor,
  createPatient,
};
