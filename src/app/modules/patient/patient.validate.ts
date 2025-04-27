import { z } from "zod";
import { BloodGroup } from "../../../../generated/prisma";

const update = z.object({
  body: z.object({
    name: z.string().optional(),
    contactNumber: z.string().optional(),
    address: z.string().optional(),
    patientHealthData: z
      .object({
        gender: z.string(),
        dateOfBirth: z.string(),
        height: z.string(),
        weight: z.string(),
        bloodGroup: z.enum([
          BloodGroup.AB_NEGATIVE,
          BloodGroup.AB_POSITIVE,
          BloodGroup.A_NEGATIVE,
          BloodGroup.A_POSITIVE,
          BloodGroup.B_NEGATIVE,
          BloodGroup.B_POSITIVE,
          BloodGroup.O_NEGATIVE,
          BloodGroup.O_POSITIVE,
        ]),
      })
      .strict()
      .optional(),
    medicalReport: z
      .object({
        reportName: z.string(),
        reportLink: z.string().optional(),
      })
      .strict()
      .optional(),
  }),
});

export const validatePatient = {
  update,
};
