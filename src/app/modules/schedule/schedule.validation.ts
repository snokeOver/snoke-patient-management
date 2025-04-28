import { z } from "zod";
//Create schedule
const create = z.object({
  body: z
    .object({
      startDate: z.string(),
      endDate: z.string(),
      startTime: z.string(),
      endTime: z.string(),
    })
    .strict(),
});

export const validateSchedule = {
  create,
};
