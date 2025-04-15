import express from "express";
import { adminController } from "./admin.controller";
import { validateRequest } from "../../middleWares/validateRequest";
import { validateAdmin } from "./admin.validate";

const adminRoutes = express.Router();

adminRoutes.delete("/:id", adminController.deleteSingleAdmin);

adminRoutes.patch(
  "/:id",
  validateRequest(validateAdmin.update),
  adminController.updateSingleAdmin
);

adminRoutes.get("/:id", adminController.getSingleAdmin);
adminRoutes.get("/", adminController.getAllAdmin);

export default adminRoutes;
