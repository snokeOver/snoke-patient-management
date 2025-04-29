import express from "express";

import auth from "../../middleWares/auth";
import { UserRole } from "../../../../generated/prisma";
import { validateRequest } from "../../middleWares/validateRequest";
import { validateAppointment } from "./appointment.validation";
import { appointmentController } from "./appointment.controller";

const router = express.Router();

router.post(
  "/create",
  auth(UserRole.PATIENT),
  validateRequest(validateAppointment.create),
  appointmentController.create
);

router.get(
  "/",
  auth(UserRole.PATIENT, UserRole.DOCTOR),
  appointmentController.getAll
);

export const appointmentRoutes = router;
