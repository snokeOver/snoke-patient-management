import { UserRole, UserStatus } from "../../../../generated/prisma";

export interface ILoginCred {
  email: string;
  password: string;
}

export interface IJwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  status: UserStatus;
}
