import { Doctor } from "../../../../generated/prisma";

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
