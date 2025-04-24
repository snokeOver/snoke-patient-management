import express, { NextFunction, Request, Response } from "express";

import auth from "../../middleWares/auth";
import { UserRole } from "../../../../generated/prisma";
import clientInfoParser from "../../middleWares/clientInfoParser";
import { validateRequest } from "../../middleWares/validateRequest";
import { authController } from "../auth/auth.controller";
import { validateAuth } from "../auth/auth.validate";
import { specialitiesController } from "./specialities.controller";
import { fileUploader } from "../../utils/fileUploader";
import { validateSpeciality } from "./specialities.validate";

const specialitiesRoutes = express.Router();

specialitiesRoutes.get(
  "/",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  specialitiesController.getAllSpecialities
);

specialitiesRoutes.post(
  "/create",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  fileUploader.multerUpload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body.data = validateSpeciality.create.parse(JSON.parse(req.body.data));

    return specialitiesController.createSpecialities(req, res, next);
  }
);

export default specialitiesRoutes;
