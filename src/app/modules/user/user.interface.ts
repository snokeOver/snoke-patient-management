export interface IUser {
  name: string;
  email: string;
  contactNumber: string;
}

export interface IAdminUser {
  password: string;
  admin: IUser;
}
