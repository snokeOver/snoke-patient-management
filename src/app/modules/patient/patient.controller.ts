import { pick } from "../../utils/pick";
import { validSearchableFields } from "./patient.constant";
import httpStatus from "http-status";
import { sendResponse } from "../../utils/sendResponse";
import { tryCatchAsync } from "../../utils/tryCatchAsync";
import { paginationProperties } from "../../constant/pagination";
import { PatientService } from "./patient.service";

//Update single patient by id
const updatePatient = tryCatchAsync(async (req, res) => {
  const result = await PatientService.updateSinglePatient(
    req.params.id,
    req.body
  );

  sendResponse({
    res,
    sendData: {
      statusCode: httpStatus.OK,
      success: true,
      message: "Single patient updated successfully",
      data: result,
    },
  });
});

//Get single patient data by id
const getAPatient = tryCatchAsync(async (req, res) => {
  const result = await PatientService.getSinglePatient(req.params.id);
  sendResponse({
    res,
    sendData: {
      statusCode: httpStatus.OK,
      success: true,
      message: "Single patient fetched successfully",
      data: result,
    },
  });
});

const getAllPatient = tryCatchAsync(async (req, res) => {
  const filteredQuery = pick(req.query, validSearchableFields);
  const pagination = pick(req.query, paginationProperties);

  const result = await PatientService.getAllPatient(filteredQuery, pagination);

  sendResponse({
    res,
    sendData: {
      statusCode: httpStatus.OK,
      success: true,
      message: "All patient fetched successfully",
      data: result.data,
      meta: result.meta,
    },
  });
});

export const PatientController = {
  getAPatient,
  getAllPatient,
  updatePatient,
};
