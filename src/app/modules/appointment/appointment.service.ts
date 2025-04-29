import { addHours, addMinutes, format } from "date-fns";
import { prisma } from "../../utils/prisma";
import config from "../../config";
import { v4 as uuidv4 } from "uuid";
import { IJwtPayload, IPagination } from "../../types";
import { paginationHelper } from "../../utils/paginationHealper";
import { PaymentStatus, Prisma, UserRole } from "../../../../generated/prisma";
import { JwtPayload } from "jsonwebtoken";
import AppError from "../../middleWares/errorHandler/appError";

import httpStatus from "http-status";
import {
  IAllAppointment,
  IAppointmentFilteredQuery,
  IAppointmentPayload,
} from "./appointment.interface";

//Create schedule
const create = async (
  payload: IAppointmentPayload,
  user: IJwtPayload | undefined
) => {
  if (!user) throw new AppError(httpStatus.UNAUTHORIZED, "User not found");

  const foundPatient = await prisma.patient.findUnique({
    where: {
      email: user.email,
      isDeleted: false,
    },
  });

  if (!foundPatient)
    throw new AppError(httpStatus.NOT_FOUND, "Patient not found");

  const { doctorId, scheduleId } = payload;

  const foundDoctor = await prisma.doctor.findUnique({
    where: {
      id: doctorId,
      isDeleted: false,
    },
  });

  if (!foundDoctor)
    throw new AppError(httpStatus.NOT_FOUND, "Doctor not found");

  const foundSchedule = await prisma.doctorSchedules.findUnique({
    where: {
      doctorId_scheduleId: {
        doctorId: foundDoctor.id,
        scheduleId: scheduleId,
      },
    },
  });

  if (!foundSchedule)
    throw new AppError(httpStatus.NOT_FOUND, "Schedule not found");

  if (foundSchedule.isBooked)
    throw new AppError(httpStatus.BAD_REQUEST, "Schedule is already booked");

  const videoCallingId: string = uuidv4();

  const result = await prisma.$transaction(async (tx) => {
    const createdAppointment = await tx.appointment.create({
      data: {
        patientId: foundPatient.id,
        doctorId: foundDoctor.id,
        scheduleId,
        videoCallingId,
        paymentStatus: PaymentStatus.PAID,
      },
      include: {
        doctorSchedules: true,
        patient: true,
        doctor: true,
      },
    });

    const updatedSchedule = await tx.doctorSchedules.update({
      where: {
        doctorId_scheduleId: {
          doctorId: foundDoctor.id,
          scheduleId: scheduleId,
        },
      },
      data: {
        isBooked: true,
        appointmentId: createdAppointment.id,
      },
    });

    const today = new Date();
    const transactionId = `Snoke-HealthCare-${today.getFullYear()}-${today.getMonth()}-${today.getDate()}-${today.getHours()}-${today.getMinutes()}-${today.getSeconds()}`;

    const createPayment = await tx.payment.create({
      data: {
        transactionId,
        amount: foundDoctor.appointmentFee,
        status: PaymentStatus.PAID,
        appointmentId: createdAppointment.id,
      },
    });

    return createdAppointment;
  });

  return result;
};

//Get all schedule data
const getAll = async (
  query: IAppointmentFilteredQuery,
  pagination: IPagination,
  user: IJwtPayload | undefined
): Promise<IAllAppointment> => {
  if (!user) throw new AppError(httpStatus.UNAUTHORIZED, "User not found");

  const foundPatient = await prisma.patient.findUnique({
    where: {
      email: user.email,
      isDeleted: false,
    },
  });

  if (!foundPatient)
    throw new AppError(httpStatus.NOT_FOUND, "You are not authorized");

  const { page, take, skip, orderBy } = paginationHelper(pagination);

  // console.log("Pagination data:", query);
  const { startDateTime, endDateTime, ...filterData } = query;
  const searchCondition: Prisma.AppointmentWhereInput[] = [];

  if (Object.keys(filterData).length) {
    searchCondition.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  if (user.role === UserRole.PATIENT) {
    searchCondition.push({
      patient: {
        email: user.email,
      },
    });
  }

  if (user.role === UserRole.DOCTOR) {
    searchCondition.push({
      doctor: {
        email: user.email,
      },
    });
  }

  const whereConditions: Prisma.AppointmentWhereInput = {
    AND: searchCondition,
  };

  const result = await prisma.$transaction(async (tx) => {
    const schedule = await tx.appointment.findMany({
      where: whereConditions,
      skip,
      take,
      orderBy,
      include:
        user.role === UserRole.DOCTOR
          ? {
              patient: {
                include: {
                  medicalReport: true,
                  patientHealthData: true,
                },
              },
              schedule: true,
            }
          : { doctor: true, schedule: true },
    });

    const total = await tx.appointment.count({
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
  });

  return result;
};

export const appointmentService = {
  create,
  getAll,
};
