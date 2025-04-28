import { addHours, addMinutes, format } from "date-fns";
import { prisma } from "../../utils/prisma";
import config from "../../config";
import {
  IAllSchedule,
  ICreateSchedulePayload,
  IScheduleFilteredQuery,
} from "./schedule.interface";
import { IPagination } from "../../types";
import { paginationHelper } from "../../utils/paginationHealper";
import { Prisma } from "../../../../generated/prisma";
import { JwtPayload } from "jsonwebtoken";
import AppError from "../../middleWares/errorHandler/appError";

import httpStatus from "http-status";

//Create schedule
const create = async (payload: ICreateSchedulePayload) => {
  const { startTime, endTime, startDate, endDate } = payload;

  const newStartDate = new Date(startDate);
  const newEndDate = new Date(endDate);
  const intervalTime = Number(config.schedule_interval);

  const schedules = [];

  while (newStartDate <= newEndDate) {
    const startDateTime = new Date(
      addMinutes(
        addHours(
          `${format(newStartDate, "yyyy-MM-dd")}`,
          Number(startTime.split(":")[0])
        ),
        Number(startTime.split(":")[1])
      )
    );

    const endDateTime = new Date(
      addMinutes(
        addHours(
          `${format(newStartDate, "yyyy-MM-dd")}`,
          Number(endTime.split(":")[0])
        ),
        Number(endTime.split(":")[1])
      )
    );

    while (startDateTime < endDateTime) {
      const scheduleData = {
        startDateTime: startDateTime,
        endDateTime: addMinutes(startDateTime, intervalTime),
      };

      const isExisted = await prisma.schedule.findFirst({
        where: scheduleData,
      });

      if (!isExisted) {
        const result = await prisma.schedule.create({
          data: scheduleData,
        });

        schedules.push(result);
      }
      startDateTime.setMinutes(startDateTime.getMinutes() + intervalTime);
    }
    newStartDate.setDate(newStartDate.getDate() + 1);
  }

  return schedules;
};

//Get all schedule data
const getAll = async (
  query: IScheduleFilteredQuery,
  pagination: IPagination,
  user: JwtPayload | undefined
): Promise<IAllSchedule> => {
  if (!user) throw new AppError(httpStatus.UNAUTHORIZED, "User not found");

  const { page, take, skip, orderBy } = paginationHelper(pagination);

  // console.log("Pagination data:", query);
  const { startDateTime, endDateTime, ...filterData } = query;
  const searchCondition: Prisma.ScheduleWhereInput[] = [];

  if (startDateTime) {
    searchCondition.push({
      startDateTime: {
        gte: startDateTime,
      },
    });
  }

  if (endDateTime) {
    searchCondition.push({
      endDateTime: {
        lte: endDateTime,
      },
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

  const whereConditions: Prisma.ScheduleWhereInput = { AND: searchCondition };

  const result = await prisma.$transaction(async (tx) => {
    const doctorSchedule = await tx.doctorSchedules.findMany({
      where: {
        doctorId: user.id,
      },
    });

    const filteredIds = doctorSchedule.map((schedule) => schedule.scheduleId);

    const schedule = await tx.schedule.findMany({
      where: { ...whereConditions, id: { notIn: filteredIds } },
      skip,
      take,
      orderBy,
    });

    const total = await tx.schedule.count({
      where: { ...whereConditions, id: { notIn: filteredIds } },
    });

    return {
      meta: {
        page,
        limit: take,
        total,
      },
      data: schedule,
    };
  });

  return result;
};

export const scheduleService = {
  create,
  getAll,
};
