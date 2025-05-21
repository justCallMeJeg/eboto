"use client";

import {
  PasswordRecoveryFormParams,
  PasswordRecoveryFormSchema,
} from "@/lib/forms";
import { createClient } from "@/utils/supabase/client";

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
    console.error("Error updating password:", error);
    return {
      message: error.message || "An error occurred during password update.", // Use error.message
    };
  }

  // Simulate success
  return { success: true };
}
