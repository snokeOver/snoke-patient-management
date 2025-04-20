import express from "express";
import { userController } from "./user.controller";
import auth from "../../middleWares/auth";
import { UserRole } from "../../../../generated/prisma";
import clientInfoParser from "../../middleWares/clientInfoParser";
import { validateRequest } from "../../middleWares/validateRequest";
import { validateRegisterUser } from "./user.validate";

const userRotes = express.Router();

userRotes.post(
  "/",
  auth(UserRole.SUPER_ADMIN),
  validateRequest(validateRegisterUser.createAdmin),
  clientInfoParser,
  userController.createAdmin
);

export default userRotes;
