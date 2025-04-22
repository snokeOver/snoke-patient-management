import { verify } from "crypto";
import { z } from "zod";
//verify otp
const verifyOtp = z.object({
  body: z
    .object({
      otp: z.string(),
      email: z.string().email(),
    })
    .strict(),
});

//vefiry email
const verifyEmail = z.object({
  body: z
    .object({
      email: z.string().email(),
      token: z.string(),
    })
    .strict(),
});

//Reset password
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
  verifyEmail,
};
