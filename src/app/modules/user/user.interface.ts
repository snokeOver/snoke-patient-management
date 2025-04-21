import { Doctor, Patient, User } from "../../../../generated/prisma";
import { IMeta } from "../../types";

export interface IUser {
  name: string;
  email: string;
  contactNumber: string;
  profilePhoto?: string;
}

export interface IAdminUser {
  password: string;
  admin: IUser;
}
export interface IDoctorUser {
  password: string;
  doctor: Doctor;
}

export interface IPatientUser {
  password: string;
  patient: Patient;
}

export type TUserWithoutPassword = Omit<User, "password">;

export interface IAllUser {
  meta: IMeta;
  data: TUserWithoutPassword[];
}

export interface IUserFilteredQuery {
  email?: string | undefined;
  contactNumber?: string | undefined;
  searchTerm?: string | undefined;
}
