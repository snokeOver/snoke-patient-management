import { prisma } from "../../utils/prisma";
import { IFile } from "../../types";
import { fileUploader } from "../../utils/fileUploader";

//Create specialities
const createSpecialities = async (
  payload: { title: string; icon?: string },
  file: IFile | undefined
) => {
  if (file) {
    const uploadedResult = await fileUploader.cloudinaryUpload(
      file.path,
      file.filename.split(".")[0]
    );
    payload.icon = uploadedResult.secure_url;
  }

  const result = await prisma.specialities.create({
    data: {
      title: payload.title,
      icon: payload.icon || "",
    },
  });

  return result;
};

//Get all specialities
const getAllSpecialities = async () => {
  const result = await prisma.specialities.findMany();

  return result;
};

export const specialitiesService = {
  createSpecialities,
  getAllSpecialities,
};
