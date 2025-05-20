"use server";

import {
  PasswordRecoveryFormParams,
  PasswordRecoveryFormSchema,
} from "@/lib/forms";
import { createClient } from "@/utils/supabase/server";

export async function updatePassword(
  formData: PasswordRecoveryFormParams
): Promise<{ success?: boolean; message?: string; error?: unknown }> {
  const supabase = await createClient();
  const { password, confirmPassword } = formData;

  // Validate form data using Zod schema
  const validationResults = PasswordRecoveryFormSchema.safeParse(formData);
  if (!validationResults.success) {
    const errors = validationResults.error.flatten();
    return { error: errors.fieldErrors };
  }

  if (password !== confirmPassword) {
    return { error: { confirmPassword: ["Passwords do not match"] } };
  }

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    if (error.code === "user_already_exists") {
      return { error: { email: ["Email already in use"] } };
    }
    console.error("Error updating password:", error);
    return {
      message: `An error occurred during password update with error code: ${error.code}`,
    };
  }

  // Simulate success
  return { success: true };
}
