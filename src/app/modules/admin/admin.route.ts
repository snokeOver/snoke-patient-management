import express from "express";
import { adminController } from "./admin.controller";

const adminRoutes = express.Router();

adminRoutes.delete("/:id", adminController.deleteSingleAdmin);
adminRoutes.patch("/:id", adminController.updateSingleAdmin);
adminRoutes.get("/:id", adminController.getSingleAdmin);
adminRoutes.get("/", adminController.getAllAdmin);

export default adminRoutes;
