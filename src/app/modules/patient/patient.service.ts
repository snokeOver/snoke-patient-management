import { Patient, Prisma, UserStatus } from "../../../../generated/prisma";
import AppError from "../../middleWares/errorHandler/appError";
import { IPagination } from "../../types";
import { paginationHelper } from "../../utils/paginationHealper";
import { prisma } from "../../utils/prisma";

import httpStatus from "http-status";

import {
  IPatientFilteredQuery,
  IAllPatient,
  IPatientUpdate,
} from "./patient.interface";
import { patientSearchableFields } from "./patient.constant";

//Update single patient data by id
const updateSinglePatient = async (
  id: string,
  data: IPatientUpdate
): Promise<Patient> => {
  const foundPatient = await prisma.patient.findUnique({
    where: {
      id,
      isDeleted: false,
    },
  });

  if (!foundPatient)
    throw new AppError(httpStatus.NOT_FOUND, "Patient not found");

  if (!data) throw new AppError(httpStatus.BAD_REQUEST, "Data not found");

  const { patientHealthData, medicalReport, ...rest } = data;

  const result = await prisma.$transaction(async (tx) => {
    if (patientHealthData) {
      await tx.patientHealthData.upsert({
        where: {
          patientId: id,
        },
        update: {
          ...patientHealthData,
        },
        create: {
          ...patientHealthData,
          patientId: id,
        },
      });
    }

    if (medicalReport) {
      await tx.medicalReport.create({
        data: {
          ...medicalReport,
          patientId: id,
        },
      });
    }

    const updatedPatient = await tx.patient.update({
      where: {
        id,
      },
      data: {
        ...rest,
      },
      include: {
        patientHealthData: true,
        medicalReport: true,
      },
    });

    return updatedPatient;
  });

  return result;
};

//Get single patient data by id
const getSinglePatient = async (id: string): Promise<Patient | null> => {
  const foundPatient = await prisma.patient.findUnique({
    where: {
      id,
      isDeleted: false,
    },
    include: {
      medicalReport: true,
      patientHealthData: true,
    },
  });

  if (!foundPatient)
    throw new AppError(httpStatus.NOT_FOUND, "Patient not found");

  const result = await prisma.patient.findUnique({
    where: {
      id,
    },
  });
  return result;
};

//Get all doctor data
const getAllPatient = async (
  query: IPatientFilteredQuery,
  pagination: IPagination
): Promise<IAllPatient> => {
  const { page, take, skip, orderBy } = paginationHelper(pagination);

  // console.log("Pagination data:", query);
  const { searchTerm, ...filterData } = query;
  const searchCondition: Prisma.PatientWhereInput[] = [];

  if (query.searchTerm) {
    searchCondition.push({
      OR: patientSearchableFields.map((field) => ({
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

  //Do not show data where isDeleted is true
  searchCondition.push({
    isDeleted: false,
  });

  const whereConditions: Prisma.PatientWhereInput = { AND: searchCondition };

  const result = await prisma.patient.findMany({
    where: whereConditions,
    skip,
    take,
    orderBy,
    include: {
      medicalReport: true,
      patientHealthData: true,
    },
  });

  const total = await prisma.patient.count({
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

//Delete single patient
const deletePatient = async (id: string): Promise<Patient> => {
  const result = await prisma.$transaction(async (tx) => {
    const deletedPatient = await tx.patient.update({
      where: {
        id,
      },
      data: {
        isDeleted: true,
      },
    });

    const deletedUser = await tx.user.update({
      where: {
        email: deletedPatient.email,
      },
      data: {
        status: UserStatus.DELETED,
      },
    });

    return deletedPatient;
  });

  return result;
};

export const PatientService = {
  getSinglePatient,
  getAllPatient,
  updateSinglePatient,
  deletePatient,
};
