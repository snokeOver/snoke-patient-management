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
