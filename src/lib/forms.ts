import { z } from "zod";

export type FormFieldType<T> = keyof T;

export type LoginFormParams = {
  email: string;
  password: string;
};

export interface SignUpFormParams {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface RecoveryFormParams {
  email: string;
}

export interface PasswordRecoveryFormParams {
  password: string;
  confirmPassword: string;
}

export interface NewElectionFormParams {
  name: string;
  description?: string;
  start_date: string; // Keep as string for simple input, can be ISO date string
  end_date: string;   // Keep as string for simple input, can be ISO date string
}

export type LoginFormFieldType = FormFieldType<LoginFormParams>;
export type SignUpFormFieldType = FormFieldType<SignUpFormParams>;
export type RecoveryFormFieldType = FormFieldType<RecoveryFormParams>;
export type PasswordRecoveryFormFieldType = FormFieldType<PasswordRecoveryFormParams>;
export type NewElectionFormFieldType = FormFieldType<NewElectionFormParams>;

export const LoginFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, {
    message: "Password must not be empty.",
  }),
});

export const SignUpFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(1, {
      message: "Password must not be empty.",
    })
    .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
    .regex(/[0-9]/, "Password must contain at least one number.")
    .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character.")
    .min(8, {
      message: "Password must be at least 8 characters long.",
    }),
  confirmPassword: z.string().min(1, {
    message: "Confirm Password must not be empty.",
  }),
});

export const RecoveryFormSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const PasswordRecoveryFormSchema = z.object({
  password: z
    .string()
    .min(1, {
      message: "Password must not be empty.",
    })
    .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
    .regex(/[0-9]/, "Password must contain at least one number.")
    .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character.")
    .min(8, {
      message: "Password must be at least 8 characters long.",
    }),
  confirmPassword: z.string().min(1, {
    message: "Confirm Password must not be empty.",
  }),
});

export const NewElectionFormSchema = z.object({
  name: z.string().min(3, { message: "Election name must be at least 3 characters." }).max(100, { message: "Election name must be at most 100 characters." }),
  description: z.string().max(500, { message: "Description must be at most 500 characters." }).optional(),
  start_date: z.string().refine((date) => !isNaN(Date.parse(date)), { message: "Invalid start date format." }),
  end_date: z.string().refine((date) => !isNaN(Date.parse(date)), { message: "Invalid end date format." }),
}).refine(data => {
  const startDate = new Date(data.start_date);
  const endDate = new Date(data.end_date);
  return endDate > startDate;
}, {
  message: "End date must be after start date.",
  path: ["end_date"], // Path to the field to attach the error message to
});
