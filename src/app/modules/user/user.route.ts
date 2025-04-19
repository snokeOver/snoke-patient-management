import express from "express";
import { userController } from "./user.controller";
import auth from "../../middleWares/auth";
import { UserRole } from "../../../../generated/prisma";

const userRotes = express.Router();

userRotes.post("/", auth(UserRole.ADMIN), userController.createAdmin);

export default userRotes;
