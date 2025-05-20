"use server";

import { SignUpFormParams, SignUpFormSchema } from "@/lib/forms";
import { createClient } from "@/utils/supabase/server";

export async function signup(formData: SignUpFormParams): Promise<{ success?: boolean; message?: string; error?: unknown }> {
  const supabase = await createClient();
  const { password, confirmPassword } = formData;

  // Validate form data using Zod schema
  const validationResults = SignUpFormSchema.safeParse(formData);
  if (!validationResults.success) {
    const errors = validationResults.error.flatten();
    return { error: errors.fieldErrors };
  }

  // Check if passwords match
  if (password !== confirmPassword) {
    return { error: { confirmPassword: ["Passwords do not match"] }};
  }

  const { error } = await supabase.auth.signUp({
    email: formData.email,
    password: password,
  });

  if (error) {
    if (error.code === "user_already_exists") {
      return { error: { email: ["Email already in use"] }};
    }
    console.error("Error signing up:", error);
    return { message: `An error occurred during signup with error code: ${error.code}` };
  }

  // Simulate success
  return { success: true, message: "Account created successfully" };
}
