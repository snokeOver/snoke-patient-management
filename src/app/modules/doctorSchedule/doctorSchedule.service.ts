import { prisma } from "../../utils/prisma";

import { JwtPayload } from "jsonwebtoken";

import httpStatus from "http-status";
import AppError from "../../middleWares/errorHandler/appError";
import {
  IAllDoctorSchedule,
  ICreateDoctorSchedulePayload,
  IDoctorScheduleFilteredQuery,
} from "./doctorSchedule.interface";
import { IPagination } from "../../types";
import { paginationHelper } from "../../utils/paginationHealper";
import { Prisma } from "../../../../generated/prisma";

//Create schedule
const create = async (
  payload: ICreateDoctorSchedulePayload,
  user: JwtPayload | undefined
) => {
  if (!user) throw new AppError(httpStatus.UNAUTHORIZED, "User not found");

  const foundDoctor = await prisma.doctor.findUnique({
    where: {
      email: user.email,
      isDeleted: false,
    },
  });

  if (!foundDoctor)
    throw new AppError(httpStatus.NOT_FOUND, "Doctor not found");

  const scheduleData = payload.scheduleIds.map((scheduleId: string) => ({
    doctorId: foundDoctor.id,
    scheduleId,
  }));

  const result = await prisma.doctorSchedules.createMany({
    data: scheduleData,
  });

  return result;
};

//Get all doctor schedule data
const getAll = async (
  query: IDoctorScheduleFilteredQuery,
  pagination: IPagination,
  user: JwtPayload | undefined
): Promise<IAllDoctorSchedule> => {
  if (!user) throw new AppError(httpStatus.UNAUTHORIZED, "User not found");

  const { page, take, skip, orderBy } = paginationHelper(
    pagination,
    "isBooked"
  );

  // console.log("Pagination data:", query);
  const { startDateTime, endDateTime, ...filterData } = query;
  const searchCondition: Prisma.DoctorSchedulesWhereInput[] = [];

  if (startDateTime) {
    searchCondition.push({
      schedule: {
        startDateTime: {
          gte: startDateTime,
        },
      },
    });
  }

  if (endDateTime) {
    searchCondition.push({
      schedule: {
        endDateTime: {
          lte: endDateTime,
        },
      },
    });
  }

  if (Object.keys(filterData).length) {
    // Normalize isBooked field to a boolean value
    const isBookedVal = filterData.isBooked;

    filterData.isBooked =
      typeof isBookedVal === "string" && isBookedVal === "true"
        ? true
        : typeof isBookedVal === "string" && isBookedVal === "false"
        ? false
        : false;

    searchCondition.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  const whereConditions: Prisma.DoctorSchedulesWhereInput = {
    AND: searchCondition,
  };

  const schedule = await prisma.doctorSchedules.findMany({
    where: whereConditions,
    skip,
    take,
    orderBy,
  });

  const total = await prisma.doctorSchedules.count({
    where: whereConditions,
  });

  return {
    meta: {
      page,
      limit: take,
      total,
    },
    data: schedule,
  };
};

//Delete doctor schedule

const deleteDocSchedule = async (user: JwtPayload | undefined, id: string) => {
  if (!user) throw new AppError(httpStatus.UNAUTHORIZED, "User not found");

  const foundDoctor = await prisma.doctor.findUnique({
    where: {
      email: user.email,
      isDeleted: false,
    },
  });

  if (!foundDoctor)
    throw new AppError(httpStatus.NOT_FOUND, "Doctor not found");

  const foundDocSchedule = await prisma.doctorSchedules.findUnique({
    where: {
      doctorId_scheduleId: {
        doctorId: foundDoctor.id,
        scheduleId: id,
      },
    },
  });

  if (!foundDocSchedule)
    throw new AppError(httpStatus.NOT_FOUND, "Schedule not found");

  if (foundDocSchedule.isBooked)
    throw new AppError(httpStatus.BAD_REQUEST, "Schedule is already booked");

  const deletedSchedule = await prisma.doctorSchedules.delete({
    where: {
      doctorId_scheduleId: {
        doctorId: foundDoctor.id,
        scheduleId: id,
      },
    },
  });
  return deletedSchedule;
};

export const doctorScheduleService = {
  create,
  getAll,
  deleteDocSchedule,
};
