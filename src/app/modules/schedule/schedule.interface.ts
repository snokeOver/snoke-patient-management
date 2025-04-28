import {
  BloodGroup,
  Doctor,
  Gender,
  MaritalStatus,
  Patient,
  Schedule,
  User,
} from "../../../../generated/prisma";
import { IMeta } from "../../types";

export interface ICreateSchedulePayload {
  startTime: string;
  endTime: string;
  startDate: string;
  endDate: string;
}

export interface IAllSchedule {
  meta: IMeta;
  data: Schedule[];
}

export interface IScheduleFilteredQuery {
  startDateTime?: string | undefined;
  endDateTime?: string | undefined;
}
