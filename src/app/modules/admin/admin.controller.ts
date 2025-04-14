import { Request, Response } from "express";
import { adminService } from "./admin.service";
import { pick } from "../../../utils/pick";
import { paginationProperties, validSearchableFields } from "./admin.constant";
import httpStatus from "http-status";
import { sendResponse } from "../../../utils/sendResponse";

//Delete single admin by id
const deleteSingleAdmin = async (req: Request, res: Response) => {
  try {
    const result = await adminService.deleteSingleAdmin(req.params.id);

    sendResponse({
      res,
      sendData: {
        statusCode: httpStatus.OK,
        success: true,
        message: "Single Admin deleted successfully",
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
          error.name ||
          "Some error occurred while deleting the single Admin data.",
        error: error,
      },
    });
  }
};

//Update single admin by id
const updateSingleAdmin = async (req: Request, res: Response) => {
  try {
    const result = await adminService.updateSingleAdmin(
      req.params.id,
      req.body
    );

    sendResponse({
      res,
      sendData: {
        statusCode: httpStatus.OK,
        success: true,
        message: "Single Admin updated successfully",
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
          error.name ||
          "Some error occurred while updating the single Admin data.",
        error: error,
      },
    });
  }
};

//Get single admin data by id
const getSingleAdmin = async (req: Request, res: Response) => {
  try {
    const result = await adminService.getSingleAdmin(req.params.id);
    sendResponse({
      res,
      sendData: {
        statusCode: httpStatus.OK,
        success: true,
        message: "Single Admin fetched successfully",
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
          error.name || "Some error occurred while fetching single Admin data.",
        error: error,
      },
    });
  }
};

const getAllAdmin = async (req: Request, res: Response) => {
  try {
    const filteredQuery = pick(req.query, validSearchableFields);
    const pagination = pick(req.query, paginationProperties);

    const result = await adminService.getAllAdmin(filteredQuery, pagination);

    sendResponse({
      res,
      sendData: {
        statusCode: httpStatus.OK,
        success: true,
        message: "All Admin fetched successfully",
        data: result.data,
        meta: result.meta,
      },
    });
  } catch (error: any) {
    sendResponse({
      res,
      sendData: {
        statusCode: httpStatus.INTERNAL_SERVER_ERROR,
        success: false,
        message: error.name || "Some error occurred while fetching all Admin.",
        error: error,
      },
    });
  }
};

export const adminController = {
  getSingleAdmin,
  getAllAdmin,
  updateSingleAdmin,
  deleteSingleAdmin,
};
