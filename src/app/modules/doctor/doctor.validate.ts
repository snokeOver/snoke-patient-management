import { z } from "zod";

const update = z.object({
  body: z
    .object({
      name: z.string().optional(),
      contactNumber: z.string().optional(),
      addSpecialities: z.array(z.string()).optional(),
      deleteSpecialities: z.array(z.string()).optional(),
    })
    .strict(),
});

export const validateDoctor = {
  update,
};
