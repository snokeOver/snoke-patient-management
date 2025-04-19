import express from "express";
import { adminController } from "./admin.controller";
import { validateRequest } from "../../middleWares/validateRequest";
import { validateAdmin } from "./admin.validate";
import auth from "../../middleWares/auth";
import { UserRole } from "../../../../generated/prisma";

const adminRoutes = express.Router();

adminRoutes.delete(
  "/:id",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  adminController.deleteSingleAdmin
);

adminRoutes.patch(
  "/:id",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateRequest(validateAdmin.update),
  adminController.updateSingleAdmin
);

adminRoutes.get(
  "/:id",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  adminController.getSingleAdmin
);

adminRoutes.get(
  "/",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  adminController.getAllAdmin
);

export default adminRoutes;
