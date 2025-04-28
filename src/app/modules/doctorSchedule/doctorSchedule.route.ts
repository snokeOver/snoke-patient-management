import express from "express";

import auth from "../../middleWares/auth";
import { UserRole } from "../../../../generated/prisma";
import { validateRequest } from "../../middleWares/validateRequest";

import { doctorScheduleController } from "./doctorSchedule.controller";
import { validateDoctorSchedule } from "./doctorSchedule.validation";

const router = express.Router();

router.post(
  "/create",
  auth(UserRole.DOCTOR),
  validateRequest(validateDoctorSchedule.create),
  doctorScheduleController.create
);
router.get(
  "/",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR),
  doctorScheduleController.getAll
);

export const doctorScheduleRoutes = router;
