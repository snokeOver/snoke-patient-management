import {
  Admin,
  Doctor,
  Patient,
  Prisma,
  User,
  UserRole,
  UserStatus,
} from "../../../../generated/prisma";

import bcrypt from "bcrypt";
import { prisma } from "../../utils/prisma";
import config from "../../config";
import AppError from "../../middleWares/errorHandler/appError";
import httpStatus from "http-status";
import {
  IAdminUser,
  IAllUser,
  IDoctorUser,
  IPatientUser,
  IUserFilteredQuery,
  TUserWithoutPassword,
} from "./user.interface";
import { IClientInfo, IFile, IPagination } from "../../types";
import { fileUploader } from "../../utils/fileUploader";
import { paginationHelper } from "../../utils/paginationHealper";
import { userSearchableFields } from "./user.constant";
import { JwtPayload } from "jsonwebtoken";

//Create admin
const createAdmin = async (
  data: IAdminUser,
  clientInfo: IClientInfo,
  file: IFile | undefined
): Promise<Admin> => {
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

    return createdAdmin;
  });

  return result;
};

//Create doctor
const createDoctor = async (
  data: IDoctorUser,
  clientInfo: IClientInfo,
  file: IFile | undefined
): Promise<Doctor> => {
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

    return createdDoctor;
  });

  return result;
};

//Create patient
const createPatient = async (
  data: IPatientUser,
  clientInfo: IClientInfo,
  file: IFile | undefined
): Promise<Patient> => {
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

    return createdPatient;
  });

  return result;
};

//Get all Users data
const getAllUsers = async (
  query: IUserFilteredQuery,
  pagination: IPagination
): Promise<IAllUser> => {
  const { page, take, skip, orderBy } = paginationHelper(pagination);

  // console.log("Pagination data:", query);
  const { searchTerm, ...filterData } = query;
  const searchCondition: Prisma.UserWhereInput[] = [];

  if (query.searchTerm) {
    searchCondition.push({
      OR: userSearchableFields.map((field) => ({
        [field]: { contains: query.searchTerm, mode: "insensitive" },
      })),
    });
  }

  if (Object.keys(filterData).length) {
    searchCondition.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  const whereConditions: Prisma.UserWhereInput = { AND: searchCondition };

  const result = await prisma.user.findMany({
    where: whereConditions,
    skip,
    take,
    orderBy,
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      needPasswordChange: true,
      admin: true,
      doctor: true,
      patient: true,
    },
  });

  const total = await prisma.user.count({
    where: whereConditions,
  });

  return {
    meta: {
      page,
      limit: take,
      total,
    },
    data: result,
  };
};

//Update single user status by id
const updateUserStatus = async (
  id: string,
  data: Partial<User>
): Promise<TUserWithoutPassword> => {
  const foundUser = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  if (!foundUser) throw new AppError(httpStatus.NOT_FOUND, "User not found");

  const result = await prisma.user.update({
    where: {
      id,
    },
    data,
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      needPasswordChange: true,
      admin: true,
      doctor: true,
      patient: true,
    },
  });
  return result;
};

//Get my profile
const getMyProfile = async (user: JwtPayload | undefined) => {
  if (!user) throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");

  const userRole =
    user.role === UserRole.ADMIN
      ? "admin"
      : user.role === UserRole.DOCTOR
      ? "doctor"
      : user.role === UserRole.PATIENT
      ? "patient"
      : "";

  if (!userRole)
    throw new AppError(httpStatus.NOT_FOUND, "User role not found");

  const foundUser = await prisma.user.findUnique({
    where: {
      email: user.email,
    },

    select: {
      admin: userRole === "admin" ? true : false,
      doctor: userRole === "doctor" ? true : false,
      patient: userRole === "patient" ? true : false,
    },
  });

  if (!foundUser) throw new AppError(httpStatus.NOT_FOUND, "User not found");

  return foundUser[userRole];
};

export const userService = {
  createAdmin,
  createDoctor,
  createPatient,
  getAllUsers,
  updateUserStatus,
  getMyProfile,
};
