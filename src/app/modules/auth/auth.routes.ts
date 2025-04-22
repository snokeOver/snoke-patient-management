import express from "express";
import { authController } from "./auth.controller";
import auth from "../../middleWares/auth";
import { UserRole } from "../../../../generated/prisma";
import clientInfoParser from "../../middleWares/clientInfoParser";
import { validateRequest } from "../../middleWares/validateRequest";
import { validateAuth } from "./auth.validate";

const authRoutes = express.Router();

authRoutes.post("/login", clientInfoParser, authController.loginUser);
authRoutes.post("/get-access-token", authController.getAccessToken);

authRoutes.post(
  "/change-password",
  auth(UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT, UserRole.SUPER_ADMIN),
  authController.changePassword
);

authRoutes.post("/forget-password", authController.forgetPassword);

authRoutes.post(
  "/verify-otp",
  validateRequest(validateAuth.verifyOtp),
  authController.verifyOTP
);

authRoutes.post(
  "/reset-password",
  validateRequest(validateAuth.resetPassword),
  authController.resetPassword
);

authRoutes.post(
  "/send-verification-email",
  auth(UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT, UserRole.SUPER_ADMIN),
  authController.sendVerificationEmail
);

authRoutes.post(
  "/verify-email",
  auth(UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT, UserRole.SUPER_ADMIN),
  validateRequest(validateAuth.verifyEmail),
  authController.verifyEmail
);

export default authRoutes;
