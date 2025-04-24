import {
  Admin,
  Doctor,
  Prisma,
  User,
  UserStatus,
} from "../../../../generated/prisma";
import AppError from "../../middleWares/errorHandler/appError";
import { IMeta, IPagination } from "../../types";
import { paginationHelper } from "../../utils/paginationHealper";
import { prisma } from "../../utils/prisma";

import httpStatus from "http-status";

import {
  IDoctorFilteredQuery,
  IAllDoctor,
  IDeletedDoctor,
  IDoctorWIthSpecialities,
} from "./doctor.interface";
import { doctorSearchableFields } from "./doctor.constant";

//Update single Doctor data by id
const deleteSingleDoctor = async (id: string): Promise<IDeletedDoctor> => {
  const foundDoctor = await prisma.doctor.findUnique({
    where: {
      id,
      isDeleted: false,
    },
  });

  if (!foundDoctor) throw new AppError(httpStatus.NOT_FOUND, "User not found");

  const result = await prisma.$transaction(async (tx) => {
    const deletedDoctor = await tx.doctor.update({
      where: {
        id,
      },
      data: {
        isDeleted: true,
      },
    });

    const deletedUser = await tx.user.update({
      where: {
        email: deletedDoctor.email,
      },
      data: {
        status: UserStatus.DELETED,
      },
    });
    return { deletedDoctor, deletedUser };
  });

  return result;
};

//Update single doctor data by id
const updateSingleDoctor = async (
  id: string,
  data: Partial<IDoctorWIthSpecialities>
): Promise<Doctor> => {
  const { addSpecialities, deleteSpecialities, ...rest } = data;

  const foundDoctor = await prisma.doctor.findUnique({
    where: {
      id,
      isDeleted: false,
    },
  });

  if (!foundDoctor)
    throw new AppError(httpStatus.NOT_FOUND, "Doctor not found");

  const result = await prisma.$transaction(async (tx) => {
    if (deleteSpecialities) {
      await tx.doctorSpecialities.deleteMany({
        where: {
          doctorId: id,
          specialitiesId: {
            in: deleteSpecialities,
          },
        },
      });
    }

    if (addSpecialities) {
      for (const spId of addSpecialities) {
        await tx.doctorSpecialities.create({
          data: {
            doctorId: id,
            specialitiesId: spId,
          },
        });
      }
    }

    const updatedDoctor = await tx.doctor.update({
      where: {
        id,
      },
      data: {
        ...rest,
      },
      include: {
        doctorSpecialities: true,
      },
    });

    return updatedDoctor;
  });

  return result;
};

//Get single doctor data by id
const getSingleDoctor = async (id: string): Promise<Doctor | null> => {
  const foundDoctor = await prisma.doctor.findUnique({
    where: {
      id,
      isDeleted: false,
    },
  });

  if (!foundDoctor)
    throw new AppError(httpStatus.NOT_FOUND, "Doctor not found");

  const result = await prisma.doctor.findUnique({
    where: {
      id,
    },
  });
  return result;
};

//Get all doctor data
const getAllDoctor = async (
  query: IDoctorFilteredQuery,
  pagination: IPagination
): Promise<IAllDoctor> => {
  const { page, take, skip, orderBy } = paginationHelper(pagination);

  // console.log("Pagination data:", query);
  const { searchTerm, ...filterData } = query;
  const searchCondition: Prisma.DoctorWhereInput[] = [];

  if (query.searchTerm) {
    searchCondition.push({
      OR: doctorSearchableFields.map((field) => ({
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

  const whereConditions: Prisma.DoctorWhereInput = { AND: searchCondition };

  const result = await prisma.doctor.findMany({
    where: whereConditions,
    skip,
    take,
    orderBy,
  });

  const total = await prisma.doctor.count({
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

export const DoctorService = {
  getSingleDoctor,
  getAllDoctor,
  updateSingleDoctor,
  deleteSingleDoctor,
};
