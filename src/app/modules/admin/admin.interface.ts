import { Admin, User } from "../../../../generated/prisma";
import { IMeta } from "../../../types";

export interface IAllAdmin {
  meta: IMeta;
  data: Admin[];
}

export interface IDeletedAdmin {
  deletedAdmin: Admin;
  deletedUser: User;
}
