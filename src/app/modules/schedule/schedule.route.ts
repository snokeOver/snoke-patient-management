import express from "express";
import { scheduleController } from "./schedule.controller";
import auth from "../../middleWares/auth";
import { UserRole } from "../../../../generated/prisma";
import { validateRequest } from "../../middleWares/validateRequest";
import { validateSchedule } from "./schedule.validation";

const scheduleRoutes = express.Router();

scheduleRoutes.post(
  "/create",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateRequest(validateSchedule.create),
  scheduleController.create
);
scheduleRoutes.get("/", auth(UserRole.DOCTOR), scheduleController.getAll);

export default scheduleRoutes;
