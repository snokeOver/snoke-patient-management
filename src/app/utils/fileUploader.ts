import multer from "multer";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import config from "../config";
import { unlink } from "fs/promises";
import AppError from "../middleWares/errorHandler/appError";
import httpStatus from "http-status";

cloudinary.config({
  cloud_name: config.cloudinary.cloud_name,
  api_key: config.cloudinary.api_key,
  api_secret: config.cloudinary.api_secret,
});

//Delete original file from local
const deleteOriginalFile = async (filePath: string) => {
  try {
    await unlink(filePath);
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        `Error deleting original file: ${err.message}`
      );
    } else {
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        `Unknown error deleting original file`
      );
    }
  }
};

//Upload to local using multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), "uploads"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix =
      new Date().toISOString().slice(0, 10).replace(/-/g, "_") +
      "_" +
      Math.round(Math.random() * 1e9);

    cb(null, uniqueSuffix + "." + file.originalname.split(".")[1]);
  },
});
const multerUpload = multer({ storage: storage });

//Upload to cloudinary
const cloudinaryUpload = async (filePath: string, public_id: string) => {
  try {
    const uploadResult = await cloudinary.uploader.upload(filePath, {
      public_id,
    });

    // If upload is successful, delete the original file
    await deleteOriginalFile(filePath);

    return uploadResult;
  } catch (error) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "File upload failed");
  }
};

export const fileUploader = {
  cloudinaryUpload,
  multerUpload,
  deleteOriginalFile,
};
