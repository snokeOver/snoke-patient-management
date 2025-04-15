import { adminService } from "./admin.service";
import { pick } from "../../utils/pick";
import { paginationProperties, validSearchableFields } from "./admin.constant";
import httpStatus from "http-status";
import { sendResponse } from "../../utils/sendResponse";
import { tryCatchAsync } from "../../utils/tryCatchAsync";

//Delete single admin by id
const deleteSingleAdmin = tryCatchAsync(async (req, res) => {
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
});

//Update single admin by id
const updateSingleAdmin = tryCatchAsync(async (req, res) => {
  const result = await adminService.updateSingleAdmin(req.params.id, req.body);

  sendResponse({
    res,
    sendData: {
      statusCode: httpStatus.OK,
      success: true,
      message: "Single Admin updated successfully",
      data: result,
    },
  });
});

//Get single admin data by id
const getSingleAdmin = tryCatchAsync(async (req, res) => {
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
});

const getAllAdmin = tryCatchAsync(async (req, res) => {
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
});

export const adminController = {
  getSingleAdmin,
  getAllAdmin,
  updateSingleAdmin,
  deleteSingleAdmin,
};
