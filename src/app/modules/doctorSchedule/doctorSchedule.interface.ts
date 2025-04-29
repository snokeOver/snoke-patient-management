import { DoctorSchedules } from "../../../../generated/prisma";
import { IMeta } from "../../types";

export interface ICreateDoctorSchedulePayload {
  scheduleIds: string[];
}

export interface IDoctorScheduleFilteredQuery {
  startDateTime?: string | undefined;
  endDateTime?: string | undefined;
  isBooked?: string | boolean | undefined;
}

export interface IAllDoctorSchedule {
  meta: IMeta;
  data: DoctorSchedules[];
}
