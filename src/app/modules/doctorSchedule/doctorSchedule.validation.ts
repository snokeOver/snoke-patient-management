import { z } from "zod";
//Create schedule
const create = z.object({
  body: z
    .object({
      scheduleIds: z.array(z.string()).min(1),
    })
    .strict(),
});

export const validateDoctorSchedule = {
  create,
};
