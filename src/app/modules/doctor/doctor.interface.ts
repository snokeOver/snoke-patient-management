import { Admin, Doctor, User } from "../../../../generated/prisma";
import { IMeta } from "../../types";

export interface IAllDoctor {
  meta: IMeta;
  data: Doctor[];
}

export interface IDoctorFilteredQuery {
  name?: string | undefined;
  email?: string | undefined;
  contactNumber?: string | undefined;
  searchTerm?: string | undefined;
  speciality?: string | undefined;
}

export interface IDeletedDoctor {
  deletedDoctor: Doctor;
  deletedUser: User;
}

export interface IDoctorWIthSpecialities extends Doctor {
  deleteSpecialities?: string[];
  addSpecialities?: string[];
}
