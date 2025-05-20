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

export type LoginFormFieldType = FormFieldType<LoginFormParams>;
export type SignUpFormFieldType = FormFieldType<SignUpFormParams>;

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

export const LoginFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, {
    message: "Password must not be empty.",
  }),
});
