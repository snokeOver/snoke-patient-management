import { prisma } from "../../utils/prisma";

import { JwtPayload } from "jsonwebtoken";

import httpStatus from "http-status";
import AppError from "../../middleWares/errorHandler/appError";

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

const getAll = async () => {
  return await prisma.doctorSchedules.findMany();
};

export const doctorScheduleService = {
  create,
  getAll,
};
