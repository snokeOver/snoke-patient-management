import express from "express";
import { PatientController } from "./patient.controller";
import { validateRequest } from "../../middleWares/validateRequest";

import auth from "../../middleWares/auth";
import { UserRole } from "../../../../generated/prisma";
import { validatePatient } from "./patient.validate";

const patientRoutes = express.Router();

patientRoutes.patch(
  "/:id",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateRequest(validatePatient.update),
  PatientController.updatePatient
);

patientRoutes.get(
  "/:id",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  PatientController.getAPatient
);

patientRoutes.get(
  "/",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  PatientController.getAllPatient
);

export default patientRoutes;
