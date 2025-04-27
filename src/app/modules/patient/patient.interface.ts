import {
  BloodGroup,
  Doctor,
  Gender,
  MaritalStatus,
  Patient,
  User,
} from "../../../../generated/prisma";
import { IMeta } from "../../types";

export interface IAllPatient {
  meta: IMeta;
  data: Patient[];
}

export interface IPatientFilteredQuery {
  name?: string | undefined;
  email?: string | undefined;
  contactNumber?: string | undefined;
  searchTerm?: string | undefined;
}

export interface IDeletedPatient {
  deletedPatient: Patient;
  deletedUser: User;
}

type IPatientHealthData = {
  gender: Gender;
  dateOfBirth: string;
  bloodGroup: BloodGroup;
  hasAllergies?: boolean;
  hasDiabetes?: boolean;
  height: string;
  weight: string;
  smokingStatus?: boolean;
  dietaryPreferences?: string;
  pregnancyStatus?: boolean;
  mentalHealthHistory?: string;
  immunizationStatus?: string;
  hasPastSurgeries?: boolean;
  recentAnxiety?: boolean;
  recentDepression?: boolean;
  maritalStatus?: MaritalStatus;
};

type IMedicalReport = {
  reportName: string;
  reportLink: string;
};

export type IPatientUpdate = {
  name: string;
  contactNumber: string;
  address: string;
  patientHealthData: IPatientHealthData;
  medicalReport: IMedicalReport;
};
