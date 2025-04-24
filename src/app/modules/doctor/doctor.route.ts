import express from "express";
import { doctorController } from "./doctor.controller";
import { validateRequest } from "../../middleWares/validateRequest";

import auth from "../../middleWares/auth";
import { UserRole } from "../../../../generated/prisma";
import { validateDoctor } from "./doctor.validate";

const doctorRoutes = express.Router();

doctorRoutes.delete(
  "/:id",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  doctorController.deleteSingleDoctor
);

doctorRoutes.patch(
  "/:id",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateRequest(validateDoctor.update),
  doctorController.updateSingleDoctor
);

doctorRoutes.get(
  "/:id",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  doctorController.getSingleDoctor
);

doctorRoutes.get(
  "/",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  doctorController.getAllDoctor
);

export default doctorRoutes;
