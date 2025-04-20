import express from "express";
import { authController } from "./auth.controller";
import auth from "../../middleWares/auth";
import { UserRole } from "../../../../generated/prisma";
import clientInfoParser from "../../middleWares/clientInfoParser";

const authRoutes = express.Router();

authRoutes.post("/login", clientInfoParser, authController.loginUser);
authRoutes.post("/get-access-token", authController.getAccessToken);

authRoutes.post(
  "/change-password",
  auth(UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT, UserRole.SUPER_ADMIN),
  authController.changePassword
);

authRoutes.post("/forget-password", authController.forgetPassword);

export default authRoutes;
