import { z } from "zod";

const createAdmin = z.object({
  password: z.string(),
  admin: z
    .object({
      contactNumber: z.string(),
      name: z.string(),
      email: z.string().email(),
    })
    .strict(),
});

export const validateRegisterUser = {
  createAdmin,
};
