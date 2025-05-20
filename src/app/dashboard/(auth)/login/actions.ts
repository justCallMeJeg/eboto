"use server";

import { LoginFormParams, LoginFormSchema } from "@/lib/forms";
import { createClient } from "@/utils/supabase/server";

export async function login(formData: LoginFormParams): Promise<{ success?: boolean; message?: string; error?: unknown }> {
  const supabase = await createClient();
  const { email, password } = formData;

  // Validate form data using Zod schema
  const validationResults = LoginFormSchema.safeParse(formData);
  if (!validationResults.success) {
    const errors = validationResults.error.flatten();
    return { error: errors.fieldErrors };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Error logging in:", error);
    if (error.code === "invalid_credentials") {
      return { message: "Invalid email or password" };
    }
    return { message: `An error occurred during login with error code: ${error.code}` };
  }

  // Simulate success
  return { success: true };
}
