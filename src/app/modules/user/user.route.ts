import express, { NextFunction, Request, Response } from "express";
import { userController } from "./user.controller";
import auth from "../../middleWares/auth";
import { UserRole } from "../../../../generated/prisma";
import clientInfoParser from "../../middleWares/clientInfoParser";
import { validateRegisterUser } from "./user.validate";

import { fileUploader } from "../../utils/fileUploader";

const userRotes = express.Router();

userRotes.post(
  "/",
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

export default userRotes;
