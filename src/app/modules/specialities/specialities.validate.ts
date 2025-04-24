import { z } from "zod";
//Create specialities
const create = z
  .object({
    title: z.string(),
  })
  .strict();

export const validateSpeciality = {
  create,
};
