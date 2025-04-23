import { z } from "zod";
import { Gender, UserStatus } from "../../../../generated/prisma";
import { profile } from "console";

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

const createDoctor = z
  .object({
    password: z.string({
      required_error: "Password is required",
    }),
    doctor: z
      .object({
        name: z.string({
          required_error: "Name is required!",
        }),
        email: z.string({
          required_error: "Email is required!",
        }),
        contactNumber: z.string({
          required_error: "Contact Number is required!",
        }),
        address: z.string().optional(),
        registrationNumber: z.string({
          required_error: "Reg number is required",
        }),
        experience: z.number().optional(),
        gender: z.enum([Gender.MALE, Gender.FEMALE]),
        appointmentFee: z.number({
          required_error: "appointment fee is required",
        }),
        qualification: z.string({
          required_error: "quilification is required",
        }),
        currentWorkingPlace: z.string({
          required_error: "Current working place is required!",
        }),
        designation: z.string({
          required_error: "Designation is required!",
        }),
      })
      .strict(),
  })
  .strict();

const createPatient = z
  .object({
    password: z.string(),
    patient: z
      .object({
        email: z
          .string({
            required_error: "Email is required!",
          })
          .email(),
        name: z.string({
          required_error: "Name is required!",
        }),
        contactNumber: z.string({
          required_error: "Contact number is required!",
        }),
        address: z.string({
          required_error: "Address is required",
        }),
      })
      .strict(),
  })
  .strict();

const updateStatus = z.object({
  body: z
    .object({
      status: z.enum([
        UserStatus.ACTIVE,
        UserStatus.BLOCKED,
        UserStatus.DELETED,
        UserStatus.SUSPENDED,
      ]),
    })
    .strict(),
});

const updateDoctor = z
  .object({
    name: z.string().optional(),
    contactNumber: z.string().optional(),
    address: z.string().optional(),
    profilePhoto: z.string().optional(),
    registrationNumber: z.string().optional(),
    experience: z.number().optional(),
    gender: z.enum([Gender.MALE, Gender.FEMALE]).optional(),
    appointmentFee: z.number().optional(),
    qualification: z.string().optional(),
    currentWorkingPlace: z.string().optional(),
    designation: z.string().optional(),
  })
  .strict();

const updatePatient = z
  .object({
    name: z.string().optional(),
    contactNumber: z.string().optional(),
    address: z.string().optional(),
    profilePhoto: z.string().optional(),
  })
  .strict();

const updateAdmin = z
  .object({
    name: z.string().optional(),
    contactNumber: z.string().optional(),
    profilePhoto: z.string().optional(),
  })
  .strict();

export const validateRegisterUser = {
  createAdmin,
  createDoctor,
  createPatient,
  updateStatus,
  updateDoctor,
  updateAdmin,
  updatePatient,
};
