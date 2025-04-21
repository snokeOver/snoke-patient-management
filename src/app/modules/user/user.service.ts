import { UserRole } from "../../../../generated/prisma";

import bcrypt from "bcrypt";
import { prisma } from "../../utils/prisma";
import config from "../../config";
import AppError from "../../middleWares/errorHandler/appError";
import httpStatus from "http-status";
import { IAdminUser, IDoctorUser, IPatientUser } from "./user.interface";
import { IClientInfo, IFile } from "../../types";
import { fileUploader } from "../../utils/fileUploader";

//Create admin
const createAdmin = async (
  data: IAdminUser,
  clientInfo: IClientInfo,
  file: IFile | undefined
) => {
  //check if user exist before take any costly action like upload image
  const foundUser = await prisma.user.findUnique({
    where: {
      email: data.admin.email,
    },
  });

  if (foundUser) {
    if (file) await fileUploader.deleteOriginalFile(file.path);
    throw new AppError(httpStatus.CONFLICT, "Email already exist");
  }

  //Upload image to cloudinary
  if (file) {
    const uploadedResult = await fileUploader.cloudinaryUpload(
      file.path,
      file.filename.split(".")[0]
    );
    data.admin.profilePhoto = uploadedResult.secure_url;
  }

  //Hashed password and construct user data
  const hashedPassword: string = await bcrypt.hash(
    data.password,
    Number(config.jwt.bcrypt_salt_rounds)
  );

  const userData = {
    email: data.admin.email,
    password: hashedPassword,
    role: UserRole.ADMIN,
  };

  const result = await prisma.$transaction(async (tx) => {
    const createdUser = await tx.user.create({ data: userData });

    const createdSecurityDetails = await tx.securityDetails.create({
      data: {
        userId: createdUser.id,
        ...clientInfo.securityDetails,
      },
    });

    const createdDevice = await tx.device.create({
      data: {
        securityDetailsId: createdSecurityDetails.id, // Link device to security details
        ...clientInfo.device, // Spread the device data
      },
    });

    const createdAdmin = await tx.admin.create({
      data: data.admin,
    });

    return { createdAdmin, createdUser };
  });

  return result;
};

//Create doctor
const createDoctor = async (
  data: IDoctorUser,
  clientInfo: IClientInfo,
  file: IFile | undefined
) => {
  //check if user exist before take any costly action like upload image
  const foundUser = await prisma.doctor.findUnique({
    where: {
      email: data.doctor.email,
    },
  });

  if (foundUser) {
    if (file) await fileUploader.deleteOriginalFile(file.path);
    throw new AppError(httpStatus.CONFLICT, "Email already exist");
  }

  //Upload image to cloudinary
  if (file) {
    const uploadedResult = await fileUploader.cloudinaryUpload(
      file.path,
      file.filename.split(".")[0]
    );
    data.doctor.profilePhoto = uploadedResult.secure_url;
  }

  //Hashed password and construct user data
  const hashedPassword: string = await bcrypt.hash(
    data.password,
    Number(config.jwt.bcrypt_salt_rounds)
  );

  const userData = {
    email: data.doctor.email,
    password: hashedPassword,
    role: UserRole.DOCTOR,
  };

  const result = await prisma.$transaction(async (tx) => {
    const createdUser = await tx.user.create({ data: userData });

    const createdSecurityDetails = await tx.securityDetails.create({
      data: {
        userId: createdUser.id,
        ...clientInfo.securityDetails,
      },
    });

    const createdDevice = await tx.device.create({
      data: {
        securityDetailsId: createdSecurityDetails.id, // Link device to security details
        ...clientInfo.device, // Spread the device data
      },
    });

    const createdDoctor = await tx.doctor.create({
      data: data.doctor,
    });

    return { createdDoctor, createdUser };
  });

  return result;
};

//Create patient
const createPatient = async (
  data: IPatientUser,
  clientInfo: IClientInfo,
  file: IFile | undefined
) => {
  //check if user exist before take any costly action like upload image
  const foundUser = await prisma.patient.findUnique({
    where: {
      email: data.patient.email,
    },
  });

  if (foundUser) {
    if (file) await fileUploader.deleteOriginalFile(file.path);
    throw new AppError(httpStatus.CONFLICT, "Email already exist");
  }

  //Upload image to cloudinary
  if (file) {
    const uploadedResult = await fileUploader.cloudinaryUpload(
      file.path,
      file.filename.split(".")[0]
    );
    data.patient.profilePhoto = uploadedResult.secure_url;
  }

  //Hashed password and construct user data
  const hashedPassword: string = await bcrypt.hash(
    data.password,
    Number(config.jwt.bcrypt_salt_rounds)
  );

  const userData = {
    email: data.patient.email,
    password: hashedPassword,
    role: UserRole.PATIENT,
  };

  const result = await prisma.$transaction(async (tx) => {
    const createdUser = await tx.user.create({ data: userData });

    const createdSecurityDetails = await tx.securityDetails.create({
      data: {
        userId: createdUser.id,
        ...clientInfo.securityDetails,
      },
    });

    const createdDevice = await tx.device.create({
      data: {
        securityDetailsId: createdSecurityDetails.id, // Link device to security details
        ...clientInfo.device, // Spread the device data
      },
    });

    const createdPatient = await tx.patient.create({
      data: data.patient,
    });

    return { createdPatient, createdUser };
  });

  return result;
};

export const userService = {
  createAdmin,
  createDoctor,
  createPatient,
};
