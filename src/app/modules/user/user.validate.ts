import { z } from "zod";

const createAdmin = z.object({
  body: z
    .object({
      password: z.string(),
      admin: z
        .object({
          contactNumber: z.string(),
          name: z.string(),
          email: z.string().email(),
        })
        .strict(),
    })
    .strict(),
});

export const validateRegisterUser = {
  createAdmin,
};
