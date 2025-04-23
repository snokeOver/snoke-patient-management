import { userService } from "./user.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { tryCatchAsync } from "../../utils/tryCatchAsync";
import { pick } from "../../utils/pick";
import { validSearchableFields } from "./user.constant";
import { paginationProperties } from "../../constant/pagination";
import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";

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

//Get all users
const getAllUser = tryCatchAsync(async (req, res) => {
  const filteredQuery = pick(req.query, validSearchableFields);
  const pagination = pick(req.query, paginationProperties);

  const result = await userService.getAllUsers(filteredQuery, pagination);

  sendResponse({
    res,
    sendData: {
      statusCode: httpStatus.OK,
      success: true,
      message: "All users fetched successfully",
      data: result.data,
      meta: result.meta,
    },
  });
});

//Update user status by id
const updateUserStatus = tryCatchAsync(async (req, res) => {
  const result = await userService.updateUserStatus(req.params.id, req.body);

  sendResponse({
    res,
    sendData: {
      statusCode: httpStatus.OK,
      success: true,
      message: "User status updated successfully",
      data: result,
    },
  });
});

//Get my profile
const getMyProfile = tryCatchAsync(
  async (req: Request & { user?: JwtPayload }, res) => {
    const result = await userService.getMyProfile(req.user);

    sendResponse({
      res,
      sendData: {
        statusCode: httpStatus.OK,
        success: true,
        message: "User Profile fetched successfully",
        data: result,
      },
    });
  }
);

//update my profile
const updateMyProfile = tryCatchAsync(
  async (req: Request & { user?: JwtPayload }, res) => {
    const result = await userService.updateMyProfile(
      req.user,
      req.body.data,
      req.file
    );

    sendResponse({
      res,
      sendData: {
        statusCode: httpStatus.OK,
        success: true,
        message: "User Profile updated successfully",
        data: result,
      },
    });
  }
);

export const userController = {
  createAdmin,
  createDoctor,
  createPatient,
  getAllUser,
  updateUserStatus,
  getMyProfile,
  updateMyProfile,
};
