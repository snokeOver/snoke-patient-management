import express, { NextFunction, Request, Response } from "express";
import { userController } from "./user.controller";
import auth from "../../middleWares/auth";
import { UserRole } from "../../../../generated/prisma";
import clientInfoParser from "../../middleWares/clientInfoParser";
import { validateRegisterUser } from "./user.validate";

import { fileUploader } from "../../utils/fileUploader";
import { validateRequest } from "../../middleWares/validateRequest";
import { JwtPayload } from "jsonwebtoken";

const userRotes = express.Router();

userRotes.get(
  "/",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  userController.getAllUser
);

userRotes.get(
  "/my-profile",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT),
  userController.getMyProfile
);

userRotes.patch(
  "/update-my-profile",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT),
  fileUploader.multerUpload.single("file"),
  (req: Request & { user?: JwtPayload }, res: Response, next: NextFunction) => {
    const userRole =
      req.user?.role === UserRole.ADMIN
        ? "admin"
        : req.user?.role === UserRole.DOCTOR
        ? "doctor"
        : "patient";

    req.body.data =
      userRole === "admin"
        ? validateRegisterUser.updateAdmin.parse(JSON.parse(req.body.data))
        : userRole === "doctor"
        ? validateRegisterUser.updateDoctor.parse(JSON.parse(req.body.data))
        : validateRegisterUser.updatePatient.parse(JSON.parse(req.body.data));

    return userController.updateMyProfile(req, res, next);
  }
);

userRotes.patch(
  "/status/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateRequest(validateRegisterUser.updateStatus),
  userController.updateUserStatus
);

userRotes.post(
  "/create-admin",
  auth(UserRole.SUPER_ADMIN),
  fileUploader.multerUpload.single("file"),
  clientInfoParser,
  (req: Request, res: Response, next: NextFunction) => {
    req.body.data = validateRegisterUser.createAdmin.parse(
      JSON.parse(req.body.data)
    );

    return userController.createAdmin(req, res, next);
  }
);

userRotes.post(
  "/create-doctor",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  fileUploader.multerUpload.single("file"),
  clientInfoParser,
  (req: Request, res: Response, next: NextFunction) => {
    req.body.data = validateRegisterUser.createDoctor.parse(
      JSON.parse(req.body.data)
    );

    return userController.createDoctor(req, res, next);
  }
);

userRotes.post(
  "/create-patient",
  fileUploader.multerUpload.single("file"),
  clientInfoParser,
  (req: Request, res: Response, next: NextFunction) => {
    req.body.data = validateRegisterUser.createPatient.parse(
      JSON.parse(req.body.data)
    );

    return userController.createPatient(req, res, next);
  }
);

export default userRotes;
