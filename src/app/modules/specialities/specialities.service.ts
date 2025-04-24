import config from "../../config";
import AppError from "../../middleWares/errorHandler/appError";
import { prisma } from "../../utils/prisma";

import bcrypt from "bcrypt";
import httpStatus from "http-status";

import { JwtPayload, Secret, TokenExpiredError } from "jsonwebtoken";
import { UserStatus } from "../../../../generated/prisma";
import { IClientInfo, IFile, IJwtPayload } from "../../types";
import { createOtpToken, createToken, verifyToken } from "../../utils/jwtToken";
import { generateLink, generateOtp } from "../../utils/generator";
import { emailSender } from "../../utils/emailSender";
import { fileUploader } from "../../utils/fileUploader";

//Create specialities
const createSpecialities = async (
  payload: { title: string; icon?: string },
  file: IFile | undefined
) => {
  if (file) {
    const uploadedResult = await fileUploader.cloudinaryUpload(
      file.path,
      file.filename.split(".")[0]
    );
    payload.icon = uploadedResult.secure_url;
  }

  const result = await prisma.specialities.create({
    data: {
      title: payload.title,
      icon: payload.icon || "",
    },
  });

  return result;
};

//Get all specialities
const getAllSpecialities = async () => {
  const result = await prisma.specialities.findMany();

  return result;
};

export const specialitiesService = {
  createSpecialities,
  getAllSpecialities,
};
