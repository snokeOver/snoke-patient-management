import { z } from "zod";

const verifyOtp = z.object({
  body: z
    .object({
      otp: z.string(),
      email: z.string().email(),
    })
    .strict(),
});

const resetPassword = z.object({
  body: z
    .object({
      password: z.string(),
    })
    .strict(),
});

export const validateAuth = {
  verifyOtp,
  resetPassword,
};
