import { Appointment, Schedule } from "../../../../generated/prisma";
import { IMeta } from "../../types";

export interface IAppointmentPayload {
  doctorId: string;
  scheduleId: string;
}

export interface IAllAppointment {
  meta: IMeta;
  data: Appointment[];
}

export interface IAppointmentFilteredQuery {
  startDateTime?: string | undefined;
  endDateTime?: string | undefined;
}
