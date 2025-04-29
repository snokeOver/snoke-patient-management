import { z } from "zod";
//Create schedule
const create = z.object({
  body: z
    .object({
      doctorId: z.string(),
      scheduleId: z.string(),
    })
    .strict(),
});

export const validateAppointment = {
  create,
};
