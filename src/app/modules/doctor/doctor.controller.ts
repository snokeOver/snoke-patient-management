import { pick } from "../../utils/pick";
import { validSearchableFields } from "./doctor.constant";
import httpStatus from "http-status";
import { sendResponse } from "../../utils/sendResponse";
import { tryCatchAsync } from "../../utils/tryCatchAsync";
import { paginationProperties } from "../../constant/pagination";
import { DoctorService } from "./doctor.service";

//Delete single docrot by id
const deleteSingleDoctor = tryCatchAsync(async (req, res) => {
  const result = await DoctorService.deleteSingleDoctor(req.params.id);

  sendResponse({
    res,
    sendData: {
      statusCode: httpStatus.OK,
      success: true,
      message: "Single doctor deleted successfully",
      data: result,
    },
  });
});

//Update single doctor by id
const updateSingleDoctor = tryCatchAsync(async (req, res) => {
  const result = await DoctorService.updateSingleDoctor(
    req.params.id,
    req.body
  );

  sendResponse({
    res,
    sendData: {
      statusCode: httpStatus.OK,
      success: true,
      message: "Single doctor updated successfully",
      data: result,
    },
  });
});

//Get single doctor data by id
const getSingleDoctor = tryCatchAsync(async (req, res) => {
  const result = await DoctorService.getSingleDoctor(req.params.id);
  sendResponse({
    res,
    sendData: {
      statusCode: httpStatus.OK,
      success: true,
      message: "Single doctor fetched successfully",
      data: result,
    },
  });
});

const getAllDoctor = tryCatchAsync(async (req, res) => {
  const filteredQuery = pick(req.query, validSearchableFields);
  const pagination = pick(req.query, paginationProperties);

  const result = await DoctorService.getAllDoctor(filteredQuery, pagination);

  sendResponse({
    res,
    sendData: {
      statusCode: httpStatus.OK,
      success: true,
      message: "All doctor fetched successfully",
      data: result.data,
      meta: result.meta,
    },
  });
});

export const doctorController = {
  getSingleDoctor,
  getAllDoctor,
  updateSingleDoctor,
  deleteSingleDoctor,
};
